import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Users, DollarSign, BarChart3, Download, Filter, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

interface ReportData {
  occupancyRate: number;
  totalRevenue: number;
  totalConsumption: number;
  averageDailyRate: number;
  totalGuests: number;
  totalReservations: number;
}

interface OccupancyData {
  date: string;
  occupancy: number;
  revenue: number;
}

interface ConsumptionData {
  category: string;
  amount: number;
  color: string;
}

const HotelReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    occupancyRate: 0,
    totalRevenue: 0,
    totalConsumption: 0,
    averageDailyRate: 0,
    totalGuests: 0,
    totalReservations: 0
  });
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const loadReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token de autenticação não encontrado');
        return;
      }

      // Buscar dados de reservas
      const reservationsResponse = await fetch('/api/hotel-reservations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!reservationsResponse.ok) {
        throw new Error('Erro ao buscar reservas');
      }

      const reservationsData = await reservationsResponse.json();
      const reservations = reservationsData.data || [];

      // Buscar dados de quartos
      const roomsResponse = await fetch('/api/hotel-rooms', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!roomsResponse.ok) {
        throw new Error('Erro ao buscar quartos');
      }

      const roomsData = await roomsResponse.json();
      const rooms = roomsData.data || [];

      // Buscar dados de consumo
      const consumptionResponse = await fetch('/api/hotel-consumption', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let consumptions = [];
      if (consumptionResponse.ok) {
        const consumptionData = await consumptionResponse.json();
        consumptions = consumptionData.data || [];
      }

      // Filtrar reservas por período
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      const filteredReservations = reservations.filter((reservation: any) => {
        const checkInDate = new Date(reservation.check_in_date);
        return checkInDate >= startDate && checkInDate <= endDate;
      });

      const filteredConsumptions = consumptions.filter((consumption: any) => {
        const consumptionDate = new Date(consumption.created_at);
        return consumptionDate >= startDate && consumptionDate <= endDate;
      });

      // Calcular métricas
      const totalRevenue = filteredReservations.reduce((sum: number, res: any) => sum + (res.total_amount || 0), 0);
      const totalConsumption = filteredConsumptions.reduce((sum: number, cons: any) => sum + (cons.total_amount || 0), 0);
      const totalGuests = filteredReservations.reduce((sum: number, res: any) => sum + (res.num_guests || 0), 0);
      const averageDailyRate = filteredReservations.length > 0 ? totalRevenue / filteredReservations.length : 0;

      // Calcular taxa de ocupação
      const totalRooms = rooms.length;
      const occupiedDays = filteredReservations.reduce((sum: number, res: any) => {
        const checkIn = new Date(res.check_in_date);
        const checkOut = new Date(res.check_out_date);
        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      
      const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const occupancyRate = totalRooms > 0 && periodDays > 0 ? (occupiedDays / (totalRooms * periodDays)) * 100 : 0;

      setReportData({
        occupancyRate,
        totalRevenue,
        totalConsumption,
        averageDailyRate,
        totalGuests,
        totalReservations: filteredReservations.length
      });

      // Gerar dados de ocupação por dia
      const occupancyByDay: OccupancyData[] = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayReservations = filteredReservations.filter((res: any) => {
          const checkIn = new Date(res.check_in_date);
          const checkOut = new Date(res.check_out_date);
          return d >= checkIn && d < checkOut;
        });
        
        const dayOccupancy = totalRooms > 0 ? (dayReservations.length / totalRooms) * 100 : 0;
        const dayRevenue = dayReservations.reduce((sum: number, res: any) => {
          const checkIn = new Date(res.check_in_date);
          const checkOut = new Date(res.check_out_date);
          const totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          return sum + (res.total_amount || 0) / totalDays;
        }, 0);

        occupancyByDay.push({
          date: dateStr,
          occupancy: Math.round(dayOccupancy),
          revenue: Math.round(dayRevenue)
        });
      }
      setOccupancyData(occupancyByDay);

      // Gerar dados de consumo por categoria
      const consumptionByCategory: { [key: string]: number } = {};
      filteredConsumptions.forEach((consumption: any) => {
        const category = consumption.category || 'Outros';
        consumptionByCategory[category] = (consumptionByCategory[category] || 0) + (consumption.total_amount || 0);
      });

      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
      const consumptionChartData = Object.entries(consumptionByCategory).map(([category, amount], index) => ({
        category,
        amount,
        color: colors[index % colors.length]
      }));
      setConsumptionData(consumptionChartData);

    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      toast.error('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportReport = () => {
    const reportContent = {
      periodo: `${dateRange.startDate} a ${dateRange.endDate}`,
      metricas: reportData,
      ocupacao_diaria: occupancyData,
      consumo_por_categoria: consumptionData
    };

    const dataStr = JSON.stringify(reportContent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-hotel-${dateRange.startDate}-${dateRange.endDate}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado com sucesso!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando relatórios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Hoteleiros</h1>
          <p className="text-gray-600">Análise de ocupação, receita e consumo</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button
            onClick={exportReport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
          <button
            onClick={loadReportData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Filtros de Data */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.occupancyRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Consumo Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalConsumption)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Diária Média</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.averageDailyRate)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Hóspedes</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.totalGuests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Reservas</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.totalReservations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Ocupação */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ocupação e Receita Diária</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                labelFormatter={formatDate}
                formatter={(value: any, name: string) => [
                  name === 'occupancy' ? `${value}%` : formatCurrency(value),
                  name === 'occupancy' ? 'Ocupação' : 'Receita'
                ]}
              />
              <Bar yAxisId="left" dataKey="occupancy" fill="#3B82F6" name="occupancy" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Consumo */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumo por Categoria</h3>
          {consumptionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={consumptionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, amount }) => `${category}: ${formatCurrency(amount)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {consumptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Nenhum dado de consumo encontrado para o período selecionado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelReports;