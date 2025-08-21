import { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search
} from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Professional {
  id: string;
  name: string;
  color: string;
  services: string[];
}

interface Appointment {
  id: string;
  client_name: string;
  service_name: string;
  professional_id: string;
  professional_name: string;
  scheduled_time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
}

const PROFESSIONALS: Professional[] = [
  { id: '1', name: 'Dr. João Silva', color: '#3B82F6', services: ['Consulta', 'Exame'] },
  { id: '2', name: 'Dra. Maria Santos', color: '#10B981', services: ['Consulta', 'Cirurgia'] },
  { id: '3', name: 'Dr. Pedro Costa', color: '#F59E0B', services: ['Exame', 'Procedimento'] },
  { id: '4', name: 'Dra. Ana Lima', color: '#EF4444', services: ['Consulta', 'Terapia'] }
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    client_name: 'Carlos Silva',
    service_name: 'Consulta',
    professional_id: '1',
    professional_name: 'Dr. João Silva',
    scheduled_time: new Date().toISOString(),
    duration: 60,
    status: 'confirmed'
  },
  {
    id: '2',
    client_name: 'Maria Oliveira',
    service_name: 'Exame',
    professional_id: '2',
    professional_name: 'Dra. Maria Santos',
    scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    duration: 30,
    status: 'pending'
  }
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 })
  });

  const filteredAppointments = appointments.filter(appointment => {
    const matchesProfessional = selectedProfessional === 'all' || appointment.professional_id === selectedProfessional;
    const matchesSearch = appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.service_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProfessional && matchesSearch;
  });

  const getAppointmentsForTimeSlot = (date: Date, time: string, professionalId?: string) => {
    return filteredAppointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.scheduled_time);
      const appointmentTime = format(appointmentDate, 'HH:mm');
      const matchesDate = isSameDay(appointmentDate, date);
      const matchesTime = appointmentTime === time;
      const matchesProfessional = !professionalId || appointment.professional_id === professionalId;
      
      return matchesDate && matchesTime && matchesProfessional;
    });
  };

  const handleDragStart = (appointment: Appointment) => {
    setDraggedAppointment(appointment);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: Date, time: string, professionalId?: string) => {
    e.preventDefault();
    if (!draggedAppointment) return;

    const newDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    newDateTime.setHours(hours, minutes, 0, 0);

    const updatedAppointments = appointments.map(appointment => {
      if (appointment.id === draggedAppointment.id) {
        return {
          ...appointment,
          scheduled_time: newDateTime.toISOString(),
          professional_id: professionalId || appointment.professional_id
        };
      }
      return appointment;
    });

    setAppointments(updatedAppointments);
    setDraggedAppointment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const professional = PROFESSIONALS.find(p => p.id === appointment.professional_id);
    
    return (
      <div
        draggable
        onDragStart={() => handleDragStart(appointment)}
        className={`p-2 rounded-md border text-xs cursor-move hover:shadow-md transition-shadow ${
          getStatusColor(appointment.status)
        }`}
        style={{ borderLeftColor: professional?.color, borderLeftWidth: '3px' }}
      >
        <div className="font-medium">{appointment.client_name}</div>
        <div className="text-xs opacity-75">{appointment.service_name}</div>
        <div className="text-xs opacity-75">{appointment.professional_name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs">{appointment.duration}min</span>
          <div className="flex space-x-1">
            <button
              onClick={() => {
                setSelectedAppointment(appointment);
                setShowAppointmentModal(true);
              }}
              className="p-1 hover:bg-white rounded"
            >
              <Eye className="w-3 h-3" />
            </button>
            <button className="p-1 hover:bg-white rounded">
              <Edit className="w-3 h-3" />
            </button>
            <button className="p-1 hover:bg-white rounded text-red-600">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TimeSlotCell = ({ date, time, professionalId }: { date: Date; time: string; professionalId?: string }) => {
    const appointmentsInSlot = getAppointmentsForTimeSlot(date, time, professionalId);
    
    return (
      <div
        className="h-16 border-b border-gray-200 p-1 hover:bg-gray-50"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, date, time, professionalId)}
      >
        {appointmentsInSlot.map(appointment => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Agenda</h1>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
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
              Semana
            </button>
          </div>

          {/* Filtro por profissional */}
          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">Todos os profissionais</option>
            {PROFESSIONALS.map(professional => (
              <option key={professional.id} value={professional.id}>
                {professional.name}
              </option>
            ))}
          </select>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar cliente ou serviço..."
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
          /* Visualização por dia com profissionais */
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Cabeçalho dos profissionais */}
              <div className={`grid grid-cols-${PROFESSIONALS.length + 1} border-b border-gray-200`}>
                <div className="p-4 bg-gray-50 font-medium text-sm text-gray-700">
                  Horário
                </div>
                {PROFESSIONALS.map(professional => (
                  <div key={professional.id} className="p-4 bg-gray-50 text-center">
                    <div className="font-medium text-sm text-gray-900">
                      {professional.name}
                    </div>
                    <div
                      className="w-4 h-1 mx-auto mt-1 rounded"
                      style={{ backgroundColor: professional.color }}
                    />
                  </div>
                ))}
              </div>

              {/* Grade de horários por profissional */}
              {TIME_SLOTS.map(time => (
                <div key={time} className={`grid grid-cols-${PROFESSIONALS.length + 1} border-b border-gray-200`}>
                  <div className="p-4 bg-gray-50 text-sm font-medium text-gray-700 border-r border-gray-200">
                    {time}
                  </div>
                  {PROFESSIONALS.map(professional => (
                    <TimeSlotCell
                      key={`${professional.id}-${time}`}
                      date={currentDate}
                      time={time}
                      professionalId={professional.id}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalhes do agendamento */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Detalhes do Agendamento
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Cliente:</label>
                <p className="text-sm text-gray-900">{selectedAppointment.client_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Serviço:</label>
                <p className="text-sm text-gray-900">{selectedAppointment.service_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Profissional:</label>
                <p className="text-sm text-gray-900">{selectedAppointment.professional_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Data e Hora:</label>
                <p className="text-sm text-gray-900">
                  {format(parseISO(selectedAppointment.scheduled_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Duração:</label>
                <p className="text-sm text-gray-900">{selectedAppointment.duration} minutos</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  getStatusColor(selectedAppointment.status)
                }`}>
                  {selectedAppointment.status === 'confirmed' ? 'Confirmado' :
                   selectedAppointment.status === 'pending' ? 'Pendente' :
                   selectedAppointment.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                </span>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Observações:</label>
                  <p className="text-sm text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Fechar
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}