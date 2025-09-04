import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Clock,
  User,
  Stethoscope,
  Calendar
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  color: string;
}

interface Consultation {
  id: string;
  patient_name: string;
  procedure_name: string;
  doctor_name: string;
  scheduled_time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  doctor_id: string;
}

interface TimeSlot {
  time: string;
  consultations: Consultation[];
}

// Dados simulados de médicos
const DOCTORS: Doctor[] = [
  { id: '1', name: 'Dr. João Silva', specialty: 'Clínico Geral', color: '#3B82F6' },
  { id: '2', name: 'Dra. Maria Santos', specialty: 'Cardiologista', color: '#10B981' },
  { id: '3', name: 'Dr. Pedro Costa', specialty: 'Dermatologista', color: '#F59E0B' },
  { id: '4', name: 'Dra. Ana Lima', specialty: 'Pediatra', color: '#EF4444' },
];

// Dados simulados de consultas
const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: '1',
    patient_name: 'Carlos Oliveira',
    procedure_name: 'Consulta Cardiológica',
    doctor_name: 'Dra. Maria Santos',
    scheduled_time: new Date().toISOString(),
    duration: 60,
    status: 'confirmed',
    notes: 'Paciente com histórico de hipertensão',
    doctor_id: '2'
  },
  {
    id: '2',
    patient_name: 'Ana Silva',
    procedure_name: 'Consulta Pediátrica',
    doctor_name: 'Dra. Ana Lima',
    scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    duration: 45,
    status: 'pending',
    notes: 'Primeira consulta',
    doctor_id: '4'
  },
  {
    id: '3',
    patient_name: 'Roberto Santos',
    procedure_name: 'Consulta Dermatológica',
    doctor_name: 'Dr. Pedro Costa',
    scheduled_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    duration: 30,
    status: 'confirmed',
    doctor_id: '3'
  }
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

export default function HealthConsultations() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [consultations, setConsultations] = useState<Consultation[]>(MOCK_CONSULTATIONS);
  const [draggedConsultation, setDraggedConsultation] = useState<Consultation | null>(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), i)
  );

  const filteredConsultations = consultations.filter(consultation => {
    const matchesDoctor = selectedDoctor === 'all' || consultation.doctor_id === selectedDoctor;
    const matchesSearch = consultation.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.procedure_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDoctor && matchesSearch;
  });

  const getConsultationsForSlot = (date: Date, time: string, doctorId?: string) => {
    return filteredConsultations.filter(consultation => {
      const consultationDate = parseISO(consultation.scheduled_time);
      const consultationTime = format(consultationDate, 'HH:mm');
      const isSameDate = format(consultationDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      const isSameTime = consultationTime === time;
      const isSameDoctor = !doctorId || consultation.doctor_id === doctorId;
      
      return isSameDate && isSameTime && isSameDoctor;
    });
  };

  const handleDragStart = (e: React.DragEvent, consultation: Consultation) => {
    setDraggedConsultation(consultation);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, date: Date, time: string, doctorId?: string) => {
    e.preventDefault();
    if (draggedConsultation) {
      const newDateTime = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      newDateTime.setHours(hours, minutes, 0, 0);
      
      setConsultations(prev => prev.map(consultation => 
        consultation.id === draggedConsultation.id 
          ? { 
              ...consultation, 
              scheduled_time: newDateTime.toISOString(),
              doctor_id: doctorId || consultation.doctor_id
            }
          : consultation
      ));
      setDraggedConsultation(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ConsultationCard: React.FC<{ consultation: Consultation }> = ({ consultation }) => {
    const doctor = DOCTORS.find(d => d.id === consultation.doctor_id);
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, consultation)}
        onClick={() => {
          setSelectedConsultation(consultation);
          setShowConsultationModal(true);
        }}
        className="bg-white border border-gray-200 rounded-md p-2 mb-1 cursor-pointer hover:shadow-md transition-shadow text-xs"
        style={{ borderLeftColor: doctor?.color, borderLeftWidth: '3px' }}
      >
        <div className="font-medium text-gray-900 truncate">{consultation.patient_name}</div>
        <div className="text-gray-600 truncate">{consultation.procedure_name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className={`px-1 py-0.5 rounded text-xs ${getStatusColor(consultation.status)}`}>
            {consultation.status === 'confirmed' ? '✅ Confirmada' :
             consultation.status === 'pending' ? '⏳ Pendente' :
             consultation.status === 'cancelled' ? '❌ Cancelada' : '✅ Concluída'}
          </span>
          <span className="text-gray-500 text-xs">{consultation.duration}min</span>
        </div>
      </div>
    );
  };

  const TimeSlotCell: React.FC<{ date: Date; time: string; doctorId?: string }> = ({ date, time, doctorId }) => {
    const consultationsInSlot = getConsultationsForSlot(date, time, doctorId);
    
    return (
      <div
        className="p-2 border-r border-gray-200 min-h-[80px] hover:bg-gray-50"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, date, time, doctorId)}
      >
        {consultationsInSlot.map(consultation => (
          <ConsultationCard key={consultation.id} consultation={consultation} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agenda Médica</h1>
              <p className="text-gray-600">Gerencie consultas e horários dos médicos</p>
            </div>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Consulta
          </button>
        </div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Navegação de data */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentDate(subDays(currentDate, viewMode === 'week' ? 7 : 1))}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-lg font-medium min-w-[200px] text-center">
              {viewMode === 'week' ? (
                `${format(weekDays[0], 'dd/MM', { locale: ptBR })} - ${format(weekDays[6], 'dd/MM/yyyy', { locale: ptBR })}`
              ) : (
                format(currentDate, 'dd/MM/yyyy', { locale: ptBR })
              )}
            </div>
            <button
              onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'week' ? 7 : 1))}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Modo de visualização */}
          <div className="flex border rounded-md">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 mr-1 inline" />
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 mr-1 inline" />
              Semana
            </button>
          </div>

          {/* Filtro por médico */}
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">Todos os médicos</option>
            {DOCTORS.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialty}
              </option>
            ))}
          </select>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar paciente ou procedimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64"
            />
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {viewMode === 'week' ? (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Cabeçalho dos dias */}
              <div className="grid grid-cols-8 border-b border-gray-200">
                <div className="p-4 bg-gray-50 font-medium text-sm text-gray-700">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Horário
                </div>
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="p-4 bg-gray-50 text-center">
                    <div className="font-medium text-sm text-gray-900">
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                    <div className="text-lg font-bold text-gray-700">
                      {format(day, 'dd')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grade de horários */}
              {TIME_SLOTS.map(time => (
                <div key={time} className="grid grid-cols-8 border-b border-gray-200">
                  <div className="p-4 bg-gray-50 text-sm font-medium text-gray-700 border-r border-gray-200">
                    {time}
                  </div>
                  {weekDays.map(day => (
                    <TimeSlotCell
                      key={`${day.toISOString()}-${time}`}
                      date={day}
                      time={time}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Visualização por dia com médicos */
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Cabeçalho dos médicos */}
              <div className={`grid grid-cols-${DOCTORS.length + 1} border-b border-gray-200`}>
                <div className="p-4 bg-gray-50 font-medium text-sm text-gray-700">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Horário
                </div>
                {DOCTORS.map(doctor => (
                  <div key={doctor.id} className="p-4 bg-gray-50 text-center">
                    <div className="font-medium text-sm text-gray-900">
                      <User className="w-4 h-4 inline mr-1" />
                      {doctor.name}
                    </div>
                    <div className="text-xs text-gray-600">{doctor.specialty}</div>
                    <div
                      className="w-4 h-1 mx-auto mt-1 rounded"
                      style={{ backgroundColor: doctor.color }}
                    />
                  </div>
                ))}
              </div>

              {/* Grade de horários por médico */}
              {TIME_SLOTS.map(time => (
                <div key={time} className={`grid grid-cols-${DOCTORS.length + 1} border-b border-gray-200`}>
                  <div className="p-4 bg-gray-50 text-sm font-medium text-gray-700 border-r border-gray-200">
                    {time}
                  </div>
                  {DOCTORS.map(doctor => (
                    <TimeSlotCell
                      key={`${doctor.id}-${time}`}
                      date={currentDate}
                      time={time}
                      doctorId={doctor.id}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalhes da consulta */}
      {showConsultationModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Detalhes da Consulta
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Paciente:</label>
                <p className="text-sm text-gray-900">{selectedConsultation.patient_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Procedimento:</label>
                <p className="text-sm text-gray-900">{selectedConsultation.procedure_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Médico:</label>
                <p className="text-sm text-gray-900">{selectedConsultation.doctor_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Data e Hora:</label>
                <p className="text-sm text-gray-900">
                  {format(parseISO(selectedConsultation.scheduled_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Duração:</label>
                <p className="text-sm text-gray-900">{selectedConsultation.duration} minutos</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(selectedConsultation.status)
                }`}>
                  {selectedConsultation.status === 'confirmed' ? 'Confirmada' :
                   selectedConsultation.status === 'pending' ? 'Pendente' :
                   selectedConsultation.status === 'cancelled' ? 'Cancelada' : 'Concluída'}
                </span>
              </div>
              {selectedConsultation.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Observações Médicas:</label>
                  <p className="text-sm text-gray-900">{selectedConsultation.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowConsultationModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Fechar
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                Editar Consulta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}