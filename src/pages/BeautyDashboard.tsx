import { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Scissors,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  Sparkles,
  Heart,
  User
} from 'lucide-react';

interface BeautyStats {
  totalClients: number;
  todayAppointments: number;
  monthlyRevenue: number;
  averageRating: number;
  popularServices: string[];
  nextAppointments: BeautyAppointment[];
}

interface BeautyAppointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  duration: number;
  price: number;
  professional: string;
  status: 'confirmed' | 'pending' | 'completed';
}

const MOCK_STATS: BeautyStats = {
  totalClients: 156,
  todayAppointments: 12,
  monthlyRevenue: 8450.00,
  averageRating: 4.8,
  popularServices: ['Corte Feminino', 'Manicure', 'Escova'],
  nextAppointments: [
    {
      id: '1',
      clientName: 'Ana Silva',
      service: 'Corte + Escova',
      time: '14:00',
      duration: 90,
      price: 85.00,
      professional: 'Carla Santos',
      status: 'confirmed'
    },
    {
      id: '2',
      clientName: 'Maria Oliveira',
      service: 'Manicure + Pedicure',
      time: '15:30',
      duration: 60,
      price: 45.00,
      professional: 'Juliana Costa',
      status: 'confirmed'
    },
    {
      id: '3',
      clientName: 'Beatriz Lima',
      service: 'Coloração',
      time: '16:00',
      duration: 120,
      price: 150.00,
      professional: 'Carla Santos',
      status: 'pending'
    }
  ]
};

export default function BeautyDashboard() {
  const [stats, setStats] = useState<BeautyStats>(MOCK_STATS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simular carregamento de dados
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Confirmado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ Pendente
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ✨ Concluído
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Painel de Beleza</h1>
              <p className="text-pink-100 mt-1">Gerencie seu salão com estilo e elegância</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-pink-100 text-sm">Hoje</p>
            <p className="text-2xl font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Clientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
              <p className="text-sm text-green-600 mt-1">+12% este mês</p>
            </div>
            <div className="p-3 bg-pink-100 rounded-lg">
              <Users className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>

        {/* Agendamentos Hoje */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Agendamentos Hoje</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
              <p className="text-sm text-blue-600 mt-1">6 confirmados</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Faturamento Mensal */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturamento Mensal</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
              <p className="text-sm text-green-600 mt-1">+8% vs mês anterior</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Avaliação Média */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
              <div className="flex items-center space-x-1 mt-1">
                <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= stats.averageRating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-yellow-600 mt-1">Baseado em 89 avaliações</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Heart className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Serviços Populares */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Serviços Populares</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.popularServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Scissors className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-900">{service}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${90 - (index * 15)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{90 - (index * 15)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Próximos Agendamentos */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Próximos Agendamentos</h3>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Ver todos
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.nextAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{appointment.clientName}</span>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>🎨 {appointment.service}</span>
                      <span className="font-medium">{formatCurrency(appointment.price)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>⏰ {appointment.time} ({appointment.duration}min)</span>
                      <span>👩‍💼 {appointment.professional}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-pink-600" />
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border-2 border-dashed border-pink-300 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors">
            <Calendar className="w-8 h-8 text-pink-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Novo Agendamento</span>
          </button>
          <button className="flex flex-col items-center p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Cadastrar Cliente</span>
          </button>
          <button className="flex flex-col items-center p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Scissors className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Gerenciar Serviços</span>
          </button>
          <button className="flex flex-col items-center p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Ver Relatórios</span>
          </button>
        </div>
      </div>
    </div>
  );
}