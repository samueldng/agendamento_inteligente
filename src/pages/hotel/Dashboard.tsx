import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Users, 
  Bed, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  MapPin,
  ShoppingCart,
  AlertCircle,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Coffee,
  Utensils
} from 'lucide-react';
import { useHotelDashboard } from '../../hooks/useHotel';
import { toast } from 'sonner';
import type { Database } from '../../lib/supabase';

type DashboardData = {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  totalReservations: number;
  activeReservations: number;
  checkedInGuests: number;
  pendingCheckouts: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageStay: number;
  occupancyRate: number;
  recentReservations: any[];
  recentCheckins: any[];
  recentConsumption: any[];
  monthlyStats: any[];
};

export function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getDashboardData } = useHotelDashboard();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardData(parseInt(selectedPeriod));
      setDashboardData({
        totalRooms: data.totalRooms,
        availableRooms: data.availableRooms,
        occupiedRooms: data.occupiedRooms,
        maintenanceRooms: 0,
        totalReservations: data.recentReservations?.length || 0,
        activeReservations: data.recentReservations?.length || 0,
        checkedInGuests: data.checkedInGuests,
        pendingCheckouts: 0,
        totalRevenue: data.monthlyRevenue,
        monthlyRevenue: data.monthlyRevenue,
        averageStay: 2.5,
        occupancyRate: data.occupancyRate,
        recentReservations: data.recentReservations || [],
        recentCheckins: data.recentCheckins || [],
        recentConsumption: data.recentConsumption || [],
        monthlyStats: []
      });
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data on mount and period change

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const handleRefresh = () => {
    loadDashboardData();
    toast.success('Dashboard atualizado!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'checked_in':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'checked_out':
        return 'bg-red-100 text-red-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      case 'occupied':
        return 'bg-orange-100 text-orange-800';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      case 'checked_in':
        return 'Check-in';
      case 'checked_out':
        return 'Check-out';
      case 'paid':
        return 'Pago';
      case 'available':
        return 'Disponível';
      case 'occupied':
        return 'Ocupado';
      case 'maintenance':
        return 'Manutenção';
      default:
        return status;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Hotel</h1>
          <p className="text-gray-600 mt-2">Visão geral das operações hoteleiras</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quartos Disponíveis</p>
                    <p className="text-3xl font-bold text-green-600">
                      {dashboardData?.availableRooms || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      de {dashboardData?.totalRooms || 0} quartos
                    </p>
                  </div>
                  <Bed className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hóspedes Ativos</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {dashboardData?.checkedInGuests || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      check-ins realizados
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {dashboardData?.occupancyRate?.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {dashboardData?.occupiedRooms || 0} quartos ocupados
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita do Período</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(dashboardData?.monthlyRevenue || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      últimos {selectedPeriod} dias
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reservas Ativas</p>
                    <p className="text-2xl font-bold">{dashboardData?.activeReservations || 0}</p>
                  </div>
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Check-outs Pendentes</p>
                    <p className="text-2xl font-bold">{dashboardData?.pendingCheckouts || 0}</p>
                  </div>
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Estadia Média</p>
                    <p className="text-2xl font-bold">{dashboardData?.averageStay?.toFixed(1) || 0} dias</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Reservations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Reservas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentReservations?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma reserva recente</p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData?.recentReservations?.slice(0, 5).map((reservation: any) => (
                      <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{reservation.guest_name}</p>
                          <p className="text-xs text-gray-600">
                            Quarto {reservation.hotel_rooms?.room_number} • {formatDate(reservation.checkin_date)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(reservation.status)}>
                          {getStatusLabel(reservation.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Check-ins */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Check-ins Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentCheckins?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum check-in recente</p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData?.recentCheckins?.slice(0, 5).map((checkin: any) => (
                      <div key={checkin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{checkin.hotel_reservations?.guest_name}</p>
                          <p className="text-xs text-gray-600">
                            Quarto {checkin.hotel_reservations?.hotel_rooms?.room_number} • {formatDateTime(checkin.actual_checkin_date)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(checkin.status)}>
                          {getStatusLabel(checkin.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Consumption */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Consumo Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.recentConsumption?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum consumo recente</p>
              ) : (
                <div className="space-y-3">
                  {dashboardData?.recentConsumption?.slice(0, 8).map((consumption: any) => {
                    const totalItems = consumption.hotel_consumption_items?.reduce(
                      (sum: number, item: any) => sum + item.quantity, 0
                    ) || 0;
                    
                    return (
                      <div key={consumption.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="flex items-center space-x-1">
                            {consumption.hotel_consumption_items?.some((item: any) => 
                              item.item_name.toLowerCase().includes('café') || 
                              item.item_name.toLowerCase().includes('bebida')
                            ) ? (
                              <Coffee className="h-4 w-4 text-brown-600" />
                            ) : (
                              <Utensils className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {consumption.hotel_checkins?.hotel_reservations?.guest_name}
                            </p>
                            <p className="text-xs text-gray-600">
                              Quarto {consumption.hotel_checkins?.hotel_reservations?.hotel_rooms?.room_number} • 
                              {totalItems} item{totalItems > 1 ? 's' : ''} • 
                              {formatDateTime(consumption.consumption_date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(consumption.total_amount || 0)}</p>
                          <Badge className={getStatusColor(consumption.status)}>
                            {getStatusLabel(consumption.status)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}