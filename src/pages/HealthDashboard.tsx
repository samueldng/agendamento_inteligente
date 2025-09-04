import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Calendar, Users, Clock, Activity, UserPlus, CalendarPlus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface HealthStats {
  totalPatients: number;
  todayConsultations: number;
  pendingConsultations: number;
  completedConsultations: number;
  monthlyConsultations: number;
  averageConsultationTime: number;
  nextConsultation: string | null;
}

interface RecentConsultation {
  id: string;
  patientName: string;
  patientAge: number;
  consultationType: string;
  scheduledTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  duration: number;
  notes?: string;
}

const HealthDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<HealthStats>({
    totalPatients: 0,
    todayConsultations: 0,
    pendingConsultations: 0,
    completedConsultations: 0,
    monthlyConsultations: 0,
    averageConsultationTime: 0,
    nextConsultation: null
  });
  const [recentConsultations, setRecentConsultations] = useState<RecentConsultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simular dados do dashboard médico (substituir por chamadas reais da API)
      const mockStats: HealthStats = {
        totalPatients: 156,
        todayConsultations: 8,
        pendingConsultations: 3,
        completedConsultations: 5,
        monthlyConsultations: 124,
        averageConsultationTime: 35,
        nextConsultation: '14:30'
      };

      const mockConsultations: RecentConsultation[] = [
        {
          id: '1',
          patientName: 'Maria Silva',
          patientAge: 45,
          consultationType: 'Consulta Geral',
          scheduledTime: '2024-01-15T14:30:00',
          status: 'scheduled',
          duration: 30
        },
        {
          id: '2',
          patientName: 'João Santos',
          patientAge: 32,
          consultationType: 'Cardiologia',
          scheduledTime: '2024-01-15T15:00:00',
          status: 'in_progress',
          duration: 45
        },
        {
          id: '3',
          patientName: 'Ana Costa',
          patientAge: 28,
          consultationType: 'Dermatologia',
          scheduledTime: '2024-01-15T13:00:00',
          status: 'completed',
          duration: 25,
          notes: 'Paciente apresentou melhora significativa'
        }
      ];

      setStats(mockStats);
      setRecentConsultations(mockConsultations);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">🕐 Agendada</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Em Andamento</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">✅ Concluída</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">❌ Cancelada</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel Médico</h1>
          <p className="text-gray-600 mt-1">Visão geral da sua clínica médica</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/schedule')} className="flex items-center gap-2">
            <CalendarPlus className="h-4 w-4" />
            Nova Consulta
          </Button>
          <Button onClick={() => navigate('/clients')} variant="outline" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Cadastrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Total de pacientes ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayConsultations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedConsultations} concluídas, {stats.pendingConsultations} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Consulta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nextConsultation || '--:--'}</div>
            <p className="text-xs text-muted-foreground">
              Horário da próxima consulta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas/Mês</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyConsultations}</div>
            <p className="text-xs text-muted-foreground">
              Média: {stats.averageConsultationTime} min/consulta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/schedule')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agenda Médica
            </CardTitle>
            <CardDescription>
              Visualize e gerencie consultas agendadas
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/clients')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pacientes
            </CardTitle>
            <CardDescription>
              Gerencie prontuários e histórico médico
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/services')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Procedimentos
            </CardTitle>
            <CardDescription>
              Configure tipos de consulta e procedimentos
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Consultations */}
      <Card>
        <CardHeader>
          <CardTitle>Consultas Recentes</CardTitle>
          <CardDescription>
            Últimas consultas realizadas e agendadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentConsultations.map((consultation) => (
              <div key={consultation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{consultation.patientName}</p>
                    <p className="text-sm text-gray-500">{consultation.patientAge} anos • {consultation.consultationType}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {formatDate(consultation.scheduledTime)} às {formatTime(consultation.scheduledTime)}
                  </p>
                  <p className="text-sm text-gray-500">{consultation.duration} minutos</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(consultation.status)}
                  {consultation.notes && (
                    <p className="text-xs text-gray-500 max-w-32 truncate" title={consultation.notes}>
                      📝 {consultation.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {recentConsultations.length === 0 && (
            <div className="text-center py-8">
              <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma consulta encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthDashboard;