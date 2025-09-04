import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, DollarSign, Users, Bed, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ReportData {
  period: string;
  occupancyRate: number;
  totalRevenue: number;
  totalReservations: number;
  averageDailyRate: number;
  totalGuests: number;
  roomsOccupied: number;
  consumptionRevenue: number;
}

interface MonthlyReport {
  month: string;
  occupancyRate: number;
  revenue: number;
  reservations: number;
  guests: number;
}

const HotelReports: React.FC = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData>({
    period: 'Mês Atual',
    occupancyRate: 0,
    totalRevenue: 0,
    totalReservations: 0,
    averageDailyRate: 0,
    totalGuests: 0,
    roomsOccupied: 0,
    consumptionRevenue: 0
  });
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Carregar dados das reservas
      const reservationsResponse = await fetch('/api/hotel-reservations');
      const reservationsData = await reservationsResponse.json();
      
      // Carregar dados dos quartos
      const roomsResponse = await fetch('/api/hotel-rooms');
      const roomsData = await roomsResponse.json();
      
      // Carregar dados de consumo
      const consumptionResponse = await fetch('/api/hotel-consumption');
      const consumptionData = await consumptionResponse.json();
      
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Filtrar dados baseado no período selecionado
      let filteredReservations = reservationsData;
      let periodLabel = 'Mês Atual';
      
      if (selectedPeriod === 'current-month') {
        filteredReservations = reservationsData.filter((reservation: any) => {
          const checkIn = new Date(reservation.checkInDate);
          return checkIn.getMonth() === currentMonth && checkIn.getFullYear() === currentYear;
        });
        periodLabel = 'Mês Atual';
      } else if (selectedPeriod === 'last-month') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        filteredReservations = reservationsData.filter((reservation: any) => {
          const checkIn = new Date(reservation.checkInDate);
          return checkIn.getMonth() === lastMonth && checkIn.getFullYear() === lastMonthYear;
        });
        periodLabel = 'Mês Anterior';
      } else if (selectedPeriod === 'current-year') {
        filteredReservations = reservationsData.filter((reservation: any) => {
          const checkIn = new Date(reservation.checkInDate);
          return checkIn.getFullYear() === currentYear;
        });
        periodLabel = 'Ano Atual';
      }
      
      // Calcular métricas
      const totalReservations = filteredReservations.length;
      const confirmedReservations = filteredReservations.filter((r: any) => r.status === 'confirmed');
      const totalRevenue = confirmedReservations.reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0);
      const totalGuests = confirmedReservations.reduce((sum: number, r: any) => sum + (r.guestCount || 1), 0);
      
      // Calcular taxa de ocupação
      const activeRooms = roomsData.filter((room: any) => room.isActive);
      const daysInPeriod = selectedPeriod === 'current-year' ? 365 : 30;
      const totalRoomNights = activeRooms.length * daysInPeriod;
      const occupiedRoomNights = confirmedReservations.reduce((sum: number, r: any) => {
        const checkIn = new Date(r.checkInDate);
        const checkOut = new Date(r.checkOutDate);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return sum + nights;
      }, 0);
      
      const occupancyRate = totalRoomNights > 0 ? Math.round((occupiedRoomNights / totalRoomNights) * 100) : 0;
      const averageDailyRate = occupiedRoomNights > 0 ? totalRevenue / occupiedRoomNights : 0;
      
      // Calcular receita de consumo
      const consumptionRevenue = consumptionData
        .filter((consumption: any) => {
          const date = new Date(consumption.createdAt || consumption.date);
          if (selectedPeriod === 'current-month') {
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          } else if (selectedPeriod === 'last-month') {
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
          } else if (selectedPeriod === 'current-year') {
            return date.getFullYear() === currentYear;
          }
          return false;
        })
        .reduce((sum: number, c: any) => sum + (c.totalAmount || 0), 0);
      
      setReportData({
        period: periodLabel,
        occupancyRate,
        totalRevenue,
        totalReservations,
        averageDailyRate,
        totalGuests,
        roomsOccupied: occupiedRoomNights,
        consumptionRevenue
      });
      
      // Gerar relatórios mensais para o gráfico
      const monthlyData: MonthlyReport[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const monthReservations = reservationsData.filter((reservation: any) => {
          const checkIn = new Date(reservation.checkInDate);
          return checkIn.getMonth() === month && checkIn.getFullYear() === year && reservation.status === 'confirmed';
        });
        
        const monthRevenue = monthReservations.reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0);
        const monthGuests = monthReservations.reduce((sum: number, r: any) => sum + (r.guestCount || 1), 0);
        
        const monthOccupiedNights = monthReservations.reduce((sum: number, r: any) => {
          const checkIn = new Date(r.checkInDate);
          const checkOut = new Date(r.checkOutDate);
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          return sum + nights;
        }, 0);
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthTotalRoomNights = activeRooms.length * daysInMonth;
        const monthOccupancyRate = monthTotalRoomNights > 0 ? Math.round((monthOccupiedNights / monthTotalRoomNights) * 100) : 0;
        
        monthlyData.push({
          month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          occupancyRate: monthOccupancyRate,
          revenue: monthRevenue,
          reservations: monthReservations.length,
          guests: monthGuests
        });
      }
      
      setMonthlyReports(monthlyData);
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
      // Dados de fallback
      setReportData({
        period: 'Mês Atual',
        occupancyRate: 0,
        totalRevenue: 0,
        totalReservations: 0,
        averageDailyRate: 0,
        totalGuests: 0,
        roomsOccupied: 0,
        consumptionRevenue: 0
      });
      setMonthlyReports([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const exportReport = () => {
    const reportContent = `
RELATÓRIO HOTELEIRO - ${reportData.period}
${'='.repeat(50)}

MÉTRICAS PRINCIPAIS:
- Taxa de Ocupação: ${reportData.occupancyRate}%
- Receita Total: ${formatCurrency(reportData.totalRevenue)}
- Receita de Consumo: ${formatCurrency(reportData.consumptionRevenue)}
- Total de Reservas: ${reportData.totalReservations}
- Total de Hóspedes: ${reportData.totalGuests}
- Diária Média: ${formatCurrency(reportData.averageDailyRate)}
- Quartos-Noite Ocupados: ${reportData.roomsOccupied}

RELATÓRIO MENSAL:
${monthlyReports.map(month => 
  `${month.month}: ${month.occupancyRate}% ocupação, ${formatCurrency(month.revenue)} receita, ${month.reservations} reservas`
).join('\n')}

Gerado em: ${new Date().toLocaleString('pt-BR')}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-hoteleiro-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Hoteleiros</h1>
          <p className="text-gray-600 mt-1">Análise detalhada do desempenho do hotel</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="current-month">Mês Atual</option>
            <option value="last-month">Mês Anterior</option>
            <option value="current-year">Ano Atual</option>
          </select>
          <Button onClick={exportReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">{reportData.period}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Hospedagem + Consumo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalReservations}</div>
            <p className="text-xs text-muted-foreground">{reportData.period}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diária Média</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.averageDailyRate)}</div>
            <p className="text-xs text-muted-foreground">Por quarto-noite</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Hóspedes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reportData.totalGuests}</div>
            <p className="text-sm text-muted-foreground">Total de hóspedes no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Quartos-Noite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reportData.roomsOccupied}</div>
            <p className="text-sm text-muted-foreground">Quartos ocupados no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Receita de Consumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(reportData.consumptionRevenue)}</div>
            <p className="text-sm text-muted-foreground">Minibar, serviços extras</p>
          </CardContent>
        </Card>
      </div>

      {/* Relatório Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Evolução Mensal
          </CardTitle>
          <CardDescription>
            Desempenho dos últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyReports.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="font-medium">{month.month}</div>
                  <Badge variant={month.occupancyRate >= 70 ? 'default' : month.occupancyRate >= 50 ? 'secondary' : 'destructive'}>
                    {month.occupancyRate}% ocupação
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(month.revenue)}</div>
                  <div className="text-sm text-muted-foreground">
                    {month.reservations} reservas • {month.guests} hóspedes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelReports;