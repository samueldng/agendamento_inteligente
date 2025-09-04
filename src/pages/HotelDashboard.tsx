import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bed, Calendar, Users, DollarSign, Clock, CheckCircle, AlertCircle, Plus, BarChart3, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
// Removido import do api não utilizado

interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  todayReservations: number;
  todayCheckins: number;
  todayCheckouts: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

interface RecentReservation {
  id: string;
  guestName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  totalAmount: number;
}

const HotelDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    todayReservations: 0,
    todayCheckins: 0,
    todayCheckouts: 0,
    monthlyRevenue: 0,
    occupancyRate: 0
  });
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Carregar estatísticas dos quartos
      const roomsResponse = await fetch('/api/hotel-rooms');
      const roomsData = await roomsResponse.json();
      
      const totalRooms = roomsData.length;
      const activeRooms = roomsData.filter((room: any) => room.isActive);
      
      // Carregar reservas para calcular ocupação
      const reservationsResponse = await fetch('/api/hotel-reservations');
      const reservationsData = await reservationsResponse.json();
      
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // Calcular ocupação atual
      const occupiedRooms = reservationsData.filter((reservation: any) => {
        const checkIn = new Date(reservation.checkInDate);
        const checkOut = new Date(reservation.checkOutDate);
        const todayDate = new Date(today);
        return reservation.status === 'confirmed' && 
               checkIn <= todayDate && 
               checkOut > todayDate;
      }).length;
      
      const availableRooms = activeRooms.length - occupiedRooms;
      const occupancyRate = activeRooms.length > 0 ? Math.round((occupiedRooms / activeRooms.length) * 100) : 0;
      
      // Calcular reservas de hoje
      const todayReservations = reservationsData.filter((reservation: any) => {
        const checkIn = new Date(reservation.checkInDate).toISOString().split('T')[0];
        return checkIn === today;
      }).length;
      
      const todayCheckins = reservationsData.filter((reservation: any) => {
        const checkIn = new Date(reservation.checkInDate).toISOString().split('T')[0];
        return checkIn === today && reservation.status === 'confirmed';
      }).length;
      
      const todayCheckouts = reservationsData.filter((reservation: any) => {
        const checkOut = new Date(reservation.checkOutDate).toISOString().split('T')[0];
        return checkOut === today && reservation.status === 'confirmed';
      }).length;
      
      // Calcular receita mensal
      const monthlyRevenue = reservationsData
        .filter((reservation: any) => {
          const checkIn = new Date(reservation.checkInDate);
          return checkIn.getMonth() === currentMonth && 
                 checkIn.getFullYear() === currentYear &&
                 reservation.status === 'confirmed';
        })
        .reduce((total: number, reservation: any) => total + (reservation.totalAmount || 0), 0);
      
      setStats({
        totalRooms: activeRooms.length,
        occupiedRooms,
        availableRooms,
        occupancyRate,
        todayReservations,
        todayCheckins,
        todayCheckouts,
        monthlyRevenue
      });

      // Carregar reservas recentes (últimas 5)
      const recentReservationsData = reservationsData
        .sort((a: any, b: any) => new Date(b.createdAt || b.checkInDate).getTime() - new Date(a.createdAt || a.checkInDate).getTime())
        .slice(0, 5)
        .map((reservation: any) => {
          const room = roomsData.find((r: any) => r.id === reservation.roomId);
          return {
            id: reservation.id,
            guestName: reservation.guestName,
            roomNumber: room?.number || 'N/A',
            checkIn: reservation.checkInDate,
            checkOut: reservation.checkOutDate,
            totalAmount: reservation.totalAmount || 0,
            status: reservation.status
          };
        });
      
      setRecentReservations(recentReservationsData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Fallback para dados simulados em caso de erro
      setStats({
        totalRooms: 0,
        occupiedRooms: 0,
        availableRooms: 0,
        occupancyRate: 0,
        todayReservations: 0,
        todayCheckins: 0,
        todayCheckouts: 0,
        monthlyRevenue: 0
      });
      setRecentReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
          <h1 className="text-3xl font-bold text-gray-900">Painel Hoteleiro</h1>
          <p className="text-gray-600 mt-1">Visão geral do seu hotel</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/hotel-notifications')} variant="outline" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </Button>
          <Button onClick={() => navigate('/hotel-reservations')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Reserva
          </Button>
          <Button onClick={() => navigate('/hotel-checkins')} variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Check-in/out
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quartos Totais</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              {stats.occupiedRooms} ocupados, {stats.availableRooms} disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.occupiedRooms} de {stats.totalRooms} quartos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayReservations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayCheckins} check-ins, {stats.todayCheckouts} check-outs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Mês atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/hotel-rooms')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Gerenciar Quartos
            </CardTitle>
            <CardDescription>
              Visualize e gerencie todos os quartos do hotel
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/hotel-reservations')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reservas
            </CardTitle>
            <CardDescription>
              Gerencie reservas e disponibilidade
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/hotel-checkins')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Check-in/Check-out
            </CardTitle>
            <CardDescription>
              Processe chegadas e saídas de hóspedes
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/hotel-reports')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Relatórios
            </CardTitle>
            <CardDescription>
              Análise de ocupação, receita e consumo
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Reservations */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas Recentes</CardTitle>
          <CardDescription>
            Últimas reservas realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReservations.map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{reservation.guestName}</p>
                    <p className="text-sm text-gray-500">Quarto {reservation.roomNumber}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
                  </p>
                  <p className="text-sm text-gray-500">{formatCurrency(reservation.totalAmount)}</p>
                </div>
                <div>
                  {getStatusBadge(reservation.status)}
                </div>
              </div>
            ))}
          </div>
          {recentReservations.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma reserva encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelDashboard;