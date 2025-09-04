import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  X,
  Save,
  Sparkles,
  Scissors,
  Heart,
  Star
} from 'lucide-react';

interface BeautyProfessional {
  id: string;
  name: string;
  specialty: string;
  color: string;
  avatar?: string;
}

interface BeautyAppointment {
  id: string;
  clientName: string;
  clientPhone: string;
  professionalId: string;
  serviceType: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  skinType?: string;
  hairType?: string;
  allergies?: string;
}

interface TimeSlot {
  time: string;
  appointments: BeautyAppointment[];
}

const MOCK_PROFESSIONALS: BeautyProfessional[] = [
  {
    id: '1',
    name: 'Carla Santos',
    specialty: 'Cabelo & Coloração',
    color: '#FF6B9D',
    avatar: '💇‍♀️'
  },
  {
    id: '2',
    name: 'Juliana Costa',
    specialty: 'Unhas & Nail Art',
    color: '#4ECDC4',
    avatar: '💅'
  },
  {
    id: '3',
    name: 'Marina Silva',
    specialty: 'Estética Facial',
    color: '#45B7D1',
    avatar: '🧴'
  },
  {
    id: '4',
    name: 'Beatriz Lima',
    specialty: 'Sobrancelhas & Cílios',
    color: '#96CEB4',
    avatar: '👁️'
  }
];

const MOCK_APPOINTMENTS: BeautyAppointment[] = [
  {
    id: '1',
    clientName: 'Ana Silva',
    clientPhone: '(11) 99999-1111',
    professionalId: '1',
    serviceType: 'Corte + Escova',
    date: '2024-01-15',
    startTime: '09:00',
    endTime: '10:30',
    duration: 90,
    price: 85.00,
    status: 'confirmed',
    notes: 'Cliente prefere corte em camadas',
    hairType: 'Cacheado',
    allergies: 'Nenhuma'
  },
  {
    id: '2',
    clientName: 'Maria Oliveira',
    clientPhone: '(11) 99999-2222',
    professionalId: '2',
    serviceType: 'Manicure + Pedicure',
    date: '2024-01-15',
    startTime: '10:00',
    endTime: '11:30',
    duration: 90,
    price: 45.00,
    status: 'confirmed',
    notes: 'Esmalte vermelho',
    skinType: 'Seca'
  },
  {
    id: '3',
    clientName: 'Beatriz Lima',
    clientPhone: '(11) 99999-3333',
    professionalId: '3',
    serviceType: 'Limpeza de Pele',
    date: '2024-01-15',
    startTime: '14:00',
    endTime: '15:30',
    duration: 90,
    price: 120.00,
    status: 'pending',
    notes: 'Primeira vez no salão',
    skinType: 'Oleosa'
  },
  {
    id: '4',
    clientName: 'Carolina Santos',
    clientPhone: '(11) 99999-4444',
    professionalId: '4',
    serviceType: 'Design de Sobrancelhas',
    date: '2024-01-15',
    startTime: '11:00',
    endTime: '12:00',
    duration: 60,
    price: 35.00,
    status: 'confirmed',
    notes: 'Manutenção mensal'
  }
];

export default function BeautyAppointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [appointments, setAppointments] = useState<BeautyAppointment[]>(MOCK_APPOINTMENTS);
  const [draggedAppointment, setDraggedAppointment] = useState<BeautyAppointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<BeautyAppointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const filteredAppointments = appointments.filter(appointment => {
    const matchesDate = appointment.date === currentDate.toISOString().split('T')[0];
    const matchesProfessional = selectedProfessional === 'all' || appointment.professionalId === selectedProfessional;
    const matchesSearch = appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesDate && matchesProfessional && matchesSearch;
  });

  const getAppointmentsByTimeSlot = (time: string, professionalId?: string): BeautyAppointment[] => {
    return filteredAppointments.filter(appointment => {
      const appointmentTime = appointment.startTime;
      const matches = appointmentTime === time;
      
      if (professionalId) {
        return matches && appointment.professionalId === professionalId;
      }
      
      return matches;
    });
  };

  const handleDragStart = (appointment: BeautyAppointment) => {
    setDraggedAppointment(appointment);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newTime: string, newProfessionalId?: string) => {
    e.preventDefault();
    
    if (draggedAppointment) {
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === draggedAppointment.id) {
          const startTime = newTime;
          const [hours, minutes] = startTime.split(':').map(Number);
          const endTime = new Date();
          endTime.setHours(hours, minutes + appointment.duration);
          
          return {
            ...appointment,
            startTime,
            endTime: endTime.toTimeString().slice(0, 5),
            professionalId: newProfessionalId || appointment.professionalId
          };
        }
        return appointment;
      });
      
      setAppointments(updatedAppointments);
      setDraggedAppointment(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return '✅ Confirmado';
      case 'pending': return '⏳ Pendente';
      case 'completed': return '✨ Concluído';
      case 'cancelled': return '❌ Cancelado';
      default: return status;
    }
  };

  const getProfessionalById = (id: string) => {
    return MOCK_PROFESSIONALS.find(prof => prof.id === id);
  };

  const AppointmentCard = ({ appointment }: { appointment: BeautyAppointment }) => {
    const professional = getProfessionalById(appointment.professionalId);
    
    return (
      <div
        draggable
        onDragStart={() => handleDragStart(appointment)}
        onClick={() => {
          setSelectedAppointment(appointment);
          setShowAppointmentModal(true);
        }}
        className="bg-white border-l-4 rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        style={{ borderLeftColor: professional?.color || '#6B7280' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-900 text-sm">
            {appointment.clientName}
          </span>
          <span className="text-xs text-gray-500">
            {appointment.startTime} - {appointment.endTime}
          </span>
        </div>
        <div className="text-sm text-gray-600 mb-1">
          💄 {appointment.serviceType}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          👩‍💼 {professional?.name}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(appointment.price)}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
            {getStatusLabel(appointment.status)}
          </span>
        </div>
      </div>
    );
  };

  const TimeSlotCell = ({ time, professionalId }: { time: string; professionalId?: string }) => {
    const slotAppointments = getAppointmentsByTimeSlot(time, professionalId);
    
    return (
      <div
        className="border border-gray-200 p-2 min-h-[80px] bg-gray-50 hover:bg-gray-100 transition-colors"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, time, professionalId)}
      >
        {slotAppointments.map(appointment => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
      </div>
    );
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Calendar className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agenda de Beleza</h1>
              <p className="text-gray-600">Gerencie seus agendamentos com estilo</p>
            </div>
          </div>
          <button
            onClick={() => setShowAppointmentModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </button>
        </div>

        {/* Controles de navegação */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Navegação de data */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {formatDate(currentDate)}
              </h2>
            </div>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Controles de visualização */}
          <div className="flex items-center space-x-4">
            {/* Modo de visualização */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'day'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dia
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'week'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
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
              <option value="all">Todas as profissionais</option>
              {MOCK_PROFESSIONALS.map(professional => (
                <option key={professional.id} value={professional.id}>
                  {professional.avatar} {professional.name}
                </option>
              ))}
            </select>

            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar agendamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {viewMode === 'week' ? (
          <div className="overflow-x-auto">
            {/* Cabeçalho da semana */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-4 bg-gray-50 border-r border-gray-200">
                <span className="text-sm font-medium text-gray-600">Horário</span>
              </div>
              {getWeekDays().map((day, index) => (
                <div key={index} className="p-4 bg-gray-50 border-r border-gray-200 text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Grade de horários da semana */}
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-8 border-b border-gray-200">
                <div className="p-4 bg-gray-50 border-r border-gray-200 flex items-center">
                  <span className="text-sm font-medium text-gray-600">{time}</span>
                </div>
                {getWeekDays().map((day, index) => (
                  <TimeSlotCell key={`${time}-${index}`} time={time} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Cabeçalho do dia */}
            <div className="grid grid-cols-5 border-b border-gray-200">
              <div className="p-4 bg-gray-50 border-r border-gray-200">
                <span className="text-sm font-medium text-gray-600">Horário</span>
              </div>
              {MOCK_PROFESSIONALS.map(professional => (
                <div key={professional.id} className="p-4 bg-gray-50 border-r border-gray-200 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">{professional.avatar}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {professional.name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {professional.specialty}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Grade de horários do dia */}
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-5 border-b border-gray-200">
                <div className="p-4 bg-gray-50 border-r border-gray-200 flex items-center">
                  <span className="text-sm font-medium text-gray-600">{time}</span>
                </div>
                {MOCK_PROFESSIONALS.map(professional => (
                  <TimeSlotCell 
                    key={`${time}-${professional.id}`} 
                    time={time} 
                    professionalId={professional.id}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes do agendamento */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedAppointment ? 'Detalhes do Agendamento' : 'Novo Agendamento'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAppointmentModal(false);
                  setSelectedAppointment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedAppointment && (
              <div className="space-y-4">
                {/* Informações da cliente */}
                <div className="bg-pink-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-pink-600" />
                    Informações da Cliente
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Nome:</span>
                      <p className="text-sm text-gray-900">{selectedAppointment.clientName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Telefone:</span>
                      <p className="text-sm text-gray-900">{selectedAppointment.clientPhone}</p>
                    </div>
                    {selectedAppointment.skinType && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Tipo de Pele:</span>
                        <p className="text-sm text-gray-900">{selectedAppointment.skinType}</p>
                      </div>
                    )}
                    {selectedAppointment.hairType && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Tipo de Cabelo:</span>
                        <p className="text-sm text-gray-900">{selectedAppointment.hairType}</p>
                      </div>
                    )}
                    {selectedAppointment.allergies && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-600">Alergias:</span>
                        <p className="text-sm text-gray-900">{selectedAppointment.allergies}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detalhes do serviço */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Scissors className="w-4 h-4 mr-2 text-purple-600" />
                    Detalhes do Serviço
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Serviço:</span>
                      <p className="text-sm text-gray-900">{selectedAppointment.serviceType}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Profissional:</span>
                      <p className="text-sm text-gray-900">
                        {getProfessionalById(selectedAppointment.professionalId)?.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Data:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedAppointment.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Horário:</span>
                      <p className="text-sm text-gray-900">
                        {selectedAppointment.startTime} - {selectedAppointment.endTime}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Duração:</span>
                      <p className="text-sm text-gray-900">{selectedAppointment.duration} minutos</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Valor:</span>
                      <p className="text-sm text-gray-900 font-semibold">
                        {formatCurrency(selectedAppointment.price)}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <div className="mt-1">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                          {getStatusLabel(selectedAppointment.status)}
                        </span>
                      </div>
                    </div>
                    {selectedAppointment.notes && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-600">Observações:</span>
                        <p className="text-sm text-gray-900">{selectedAppointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAppointmentModal(false);
                      setSelectedAppointment(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Fechar
                  </button>
                  <button
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-md"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}