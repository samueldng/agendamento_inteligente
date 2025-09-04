import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, DollarSign, Users, Bed, TrendingUp, BarChart3, PieChart as PieChartIcon, CalendarDays } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
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

export default function HotelReports() {
  const { user } = useAuth();
  
  const [reportData, setReportData] = useState<ReportData>({
    totalReservations: 0,
    totalRevenue: 0,
    totalGuests: 0,
    occupancyRate: 0,
    averageDailyRate: 0,
    consumptionRevenue: 0
  });
  
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    if (!user?.professionalId) return;
    
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      
      if (!token) {
        console.error('Token de acesso não encontrado');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'https://agendamento-backend.onrender.com/api';
      
      // Calcular datas baseadas no período selecionado
      let startDate: Date;
      let endDate = new Date();
      
      switch (selectedPeriod) {
         case 'current_month':
           startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
           break;
         case 'last_month':
           startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
           endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
           break;
         case 'current_year':
           startDate = new Date(endDate.getFullYear(), 0, 1);
           break;
         default:
           startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
       }
      
      // Buscar relatórios da nova API
      const reportsResponse = await fetch(
        `${apiUrl}/api/hotel-reports?professional_id=${user.professionalId}&start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!reportsResponse.ok) {
        throw new Error('Erro ao buscar relatórios');
      }
      
      const reportsData = await reportsResponse.json();
      const reports = reportsData.data;
      
      // Usar dados da nova API de relatórios
       setReportData({
         totalReservations: reports.summary.totalReservations,
         totalRevenue: reports.summary.totalRevenue,
         totalGuests: reports.summary.totalGuests,
         occupancyRate: reports.summary.occupancyRate,
         averageDailyRate: reports.summary.averageDailyRate,
         consumptionRevenue: reports.summary.consumptionRevenue
       });

      // Usar dados mensais da API
      setMonthlyReports(reports.monthlyReports || []);
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
}