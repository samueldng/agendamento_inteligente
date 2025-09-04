import { useState, useEffect } from 'react';
import {
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  BarChart3,
  Download,
  Filter,
  RefreshCw,
  FileText,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface ReportData {
  period: string;
  appointments: number;
  revenue: number;
  clients: number;
  professionals: number;
}

interface ServiceReport {
  name: string;
  appointments: number;
  revenue: number;
  percentage: number;
}

interface ProfessionalReport {
  name: string;
  appointments: number;
  revenue: number;
  rating: number;
}

const MOCK_MONTHLY_DATA: ReportData[] = [
  { period: 'Jan', appointments: 45, revenue: 6750, clients: 32, professionals: 3 },
  { period: 'Fev', appointments: 52, revenue: 7800, clients: 38, professionals: 3 },
  { period: 'Mar', appointments: 48, revenue: 7200, clients: 35, professionals: 4 },
  { period: 'Abr', appointments: 61, revenue: 9150, clients: 42, professionals: 4 },
  { period: 'Mai', appointments: 55, revenue: 8250, clients: 39, professionals: 4 },
  { period: 'Jun', appointments: 67, revenue: 10050, clients: 48, professionals: 5 }
];

const MOCK_WEEKLY_DATA: ReportData[] = [
  { period: 'Sem 1', appointments: 15, revenue: 2250, clients: 12, professionals: 3 },
  { period: 'Sem 2', appointments: 18, revenue: 2700, clients: 14, professionals: 3 },
  { period: 'Sem 3', appointments: 22, revenue: 3300, clients: 16, professionals: 4 },
  { period: 'Sem 4', appointments: 12, revenue: 1800, clients: 10, professionals: 3 }
];

const MOCK_SERVICE_DATA: ServiceReport[] = [
  { name: 'Corte de Cabelo', appointments: 45, revenue: 6750, percentage: 35 },
  { name: 'Manicure', appointments: 32, revenue: 2560, percentage: 25 },
  { name: 'Pedicure', appointments: 28, revenue: 4200, percentage: 22 },
  { name: 'Escova', appointments: 15, revenue: 1200, percentage: 12 },
  { name: 'Outros', appointments: 8, revenue: 640, percentage: 6 }
];

const MOCK_PROFESSIONAL_DATA: ProfessionalReport[] = [
  { name: 'João Silva', appointments: 42, revenue: 6300, rating: 4.8 },
  { name: 'Maria Santos', appointments: 38, revenue: 5700, rating: 4.9 },
  { name: 'Carlos Lima', appointments: 35, revenue: 5250, rating: 4.7 },
  { name: 'Ana Costa', appointments: 13, revenue: 1950, rating: 4.6 }
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'appointments' | 'revenue' | 'clients'>('appointments');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>(MOCK_MONTHLY_DATA);

  useEffect(() => {
    // Simular carregamento de dados baseado no período selecionado
    setLoading(true);
    setTimeout(() => {
      if (selectedPeriod === 'week') {
        setReportData(MOCK_WEEKLY_DATA);
      } else {
        setReportData(MOCK_MONTHLY_DATA);
      }
      setLoading(false);
    }, 500);
  }, [selectedPeriod]);

  const getTotalMetrics = () => {
    return reportData.reduce(
      (acc, curr) => ({
        appointments: acc.appointments + curr.appointments,
        revenue: acc.revenue + curr.revenue,
        clients: acc.clients + curr.clients,
        professionals: Math.max(acc.professionals, curr.professionals)
      }),
      { appointments: 0, revenue: 0, clients: 0, professionals: 0 }
    );
  };

  const getGrowthRate = () => {
    if (reportData.length < 2) return 0;
    const current = reportData[reportData.length - 1][selectedMetric];
    const previous = reportData[reportData.length - 2][selectedMetric];
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const handleExportReport = () => {
    // Simular exportação de relatório
    const csvContent = [
      ['Período', 'Agendamentos', 'Receita', 'Clientes'],
      ...reportData.map(row => [
        row.period,
        row.appointments.toString(),
        `R$ ${row.revenue.toFixed(2)}`,
        row.clients.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const totals = getTotalMetrics();
  const growthRate = getGrowthRate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefreshData}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={handleExportReport}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Período:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="week">Últimas 4 semanas</option>
              <option value="month">Últimos 6 meses</option>
              <option value="year">Último ano</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Métrica:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as 'appointments' | 'revenue' | 'clients')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="appointments">Agendamentos</option>
              <option value="revenue">Receita</option>
              <option value="clients">Clientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agendamentos</p>
              <p className="text-2xl font-bold text-gray-900">{totals.appointments}</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{growthRate}% vs período anterior
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ {totals.revenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5% vs período anterior
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clientes Atendidos</p>
              <p className="text-2xl font-bold text-gray-900">{totals.clients}</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.3% vs período anterior
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {(totals.revenue / totals.appointments).toFixed(0)}
              </p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5.2% vs período anterior
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de tendência */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Tendência de {selectedMetric === 'appointments' ? 'Agendamentos' : selectedMetric === 'revenue' ? 'Receita' : 'Clientes'}</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    selectedMetric === 'revenue' ? `R$ ${value}` : value,
                    selectedMetric === 'appointments' ? 'Agendamentos' : selectedMetric === 'revenue' ? 'Receita' : 'Clientes'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfico de serviços */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Serviços Mais Procurados</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={MOCK_SERVICE_DATA}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="percentage"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {MOCK_SERVICE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Participação']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabelas de detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking de serviços */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Ranking de Serviços</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agendamentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receita
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {MOCK_SERVICE_DATA.map((service, index) => (
                  <tr key={service.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: COLORS[index] }} />
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.appointments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {service.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance dos profissionais */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Performance dos Profissionais</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agendamentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avaliação
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {MOCK_PROFESSIONAL_DATA.map((professional) => (
                  <tr key={professional.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{professional.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {professional.appointments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {professional.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(professional.rating) ? 'fill-current' : 'text-gray-300'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{professional.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Insights e recomendações */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <FileText className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Insights e Recomendações</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
              <h4 className="text-sm font-medium text-blue-900">Crescimento</h4>
            </div>
            <p className="text-sm text-blue-800">
              Seus agendamentos cresceram {growthRate}% no último período. Continue investindo em marketing digital.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 text-green-600 mr-2" />
              <h4 className="text-sm font-medium text-green-900">Horários</h4>
            </div>
            <p className="text-sm text-green-800">
              Os horários da manhã (9h-11h) têm maior demanda. Considere aumentar a disponibilidade neste período.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Users className="w-4 h-4 text-yellow-600 mr-2" />
              <h4 className="text-sm font-medium text-yellow-900">Retenção</h4>
            </div>
            <p className="text-sm text-yellow-800">
              85% dos seus clientes retornam. Implemente um programa de fidelidade para aumentar ainda mais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}