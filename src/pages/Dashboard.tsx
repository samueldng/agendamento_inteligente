import { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import CategoryInsights from '../components/CategoryInsights';
import { useDashboardStats, AppointmentStats, TodayAppointment, RecentClient } from '../hooks/useApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function Dashboard() {
  const { appointments, clients, todayAppointments, refetchAll } = useDashboardStats();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const appointmentStats: AppointmentStats = appointments.data || {
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0,
    revenue: 0
  };

  const todayAppointmentsList: TodayAppointment[] = todayAppointments.data || [];
  const recentClientsList: RecentClient[] = clients.data || [];

  // Dados para o gráfico de barras (últimos 7 dias)
  const weeklyData = [
    { day: 'Seg', appointments: 12 },
    { day: 'Ter', appointments: 19 },
    { day: 'Qua', appointments: 15 },
    { day: 'Qui', appointments: 22 },
    { day: 'Sex', appointments: 18 },
    { day: 'Sáb', appointments: 8 },
    { day: 'Dom', appointments: 5 }
  ];

  // Dados para o gráfico de pizza (status dos agendamentos)
  const statusData = [
    { name: 'Confirmados', value: appointmentStats.confirmed, color: '#10B981' },
    { name: 'Pendentes', value: appointmentStats.pending, color: '#F59E0B' },
    { name: 'Cancelados', value: appointmentStats.cancelled, color: '#EF4444' },
    { name: 'Concluídos', value: appointmentStats.completed, color: '#3B82F6' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com data e hora */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              {currentTime.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">
              {currentTime.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <p className="text-sm text-gray-500">Horário atual</p>
          </div>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
            title="Taxa de Ocupação"
            value={`${appointmentStats.total}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            trend={{ value: -2, isPositive: false }}
          />
        <MetricCard
            title="Novos Clientes"
            value={recentClientsList.length}
            icon={<Users className="w-6 h-6" />}
            trend={{ value: 8, isPositive: true }}
          />
        <MetricCard
            title="Agendamentos Hoje"
            value={todayAppointmentsList.length}
            icon={<Calendar className="w-6 h-6" />}
          />
        <MetricCard
            title="Receita do Mês"
            value={`R$ ${appointmentStats.revenue.toLocaleString('pt-BR')}`}
            icon={<DollarSign className="w-6 h-6" />}
            trend={{ value: 12, isPositive: true }}
          />
      </div>

      {/* Insights por Categoria */}
      <CategoryInsights />

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Agendamentos da semana */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Agendamentos da Semana
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de pizza - Status dos agendamentos */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Status dos Agendamentos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Listas de agendamentos e clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agendamentos de hoje */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Agendamentos de Hoje
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {todayAppointmentsList.length > 0 ? (
              todayAppointmentsList.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.client_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.service_name} - {appointment.professional_name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(appointment.scheduled_time).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {getStatusIcon(appointment.status)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                Nenhum agendamento para hoje
              </div>
            )}
          </div>
        </div>

        {/* Clientes recentes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Clientes Recentes
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentClientsList.length > 0 ? (
              recentClientsList.slice(0, 5).map((client) => (
                <div key={client.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {client.name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {client.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        {client.appointments_count} agendamentos
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(client.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                Nenhum cliente cadastrado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botão de atualização */}
      <div className="flex justify-center">
        <button
          onClick={refetchAll}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Dados
        </button>
      </div>
    </div>
  );
};