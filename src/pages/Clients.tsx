import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  ChevronRight,
  Activity
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  birth_date?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  total_appointments: number;
  last_appointment?: string;
  next_appointment?: string;
  status: 'active' | 'inactive';
}

interface Appointment {
  id: string;
  client_id: string;
  professional_name: string;
  service_name: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  price: number;
}

const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 99999-1111',
    birth_date: '1985-03-15',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    notes: 'Cliente preferencial. Alérgica a dipirona.',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z',
    total_appointments: 12,
    last_appointment: '2024-01-10T14:00:00Z',
    next_appointment: '2024-01-25T10:00:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos.santos@email.com',
    phone: '(11) 88888-2222',
    birth_date: '1978-07-22',
    address: 'Av. Paulista, 456 - São Paulo/SP',
    notes: 'Histórico de hipertensão.',
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-01-12T16:45:00Z',
    total_appointments: 8,
    last_appointment: '2024-01-08T16:00:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@email.com',
    phone: '(11) 77777-3333',
    birth_date: '1992-11-08',
    created_at: '2023-12-20T11:00:00Z',
    updated_at: '2023-12-20T11:00:00Z',
    total_appointments: 3,
    last_appointment: '2023-12-28T09:00:00Z',
    status: 'inactive'
  }
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    client_id: '1',
    professional_name: 'Dr. João Silva',
    service_name: 'Consulta Médica',
    date: '2024-01-10',
    time: '14:00',
    status: 'completed',
    notes: 'Consulta de rotina. Paciente apresentou melhora.',
    price: 150.00
  },
  {
    id: '2',
    client_id: '1',
    professional_name: 'Dr. João Silva',
    service_name: 'Exame de Sangue',
    date: '2024-01-05',
    time: '08:00',
    status: 'completed',
    price: 80.00
  },
  {
    id: '3',
    client_id: '1',
    professional_name: 'Dra. Maria Santos',
    service_name: 'Consulta Médica',
    date: '2024-01-25',
    time: '10:00',
    status: 'scheduled',
    price: 150.00
  },
  {
    id: '4',
    client_id: '2',
    professional_name: 'Dr. João Silva',
    service_name: 'Consulta Médica',
    date: '2024-01-08',
    time: '16:00',
    status: 'completed',
    notes: 'Pressão arterial controlada.',
    price: 150.00
  },
  {
    id: '5',
    client_id: '3',
    professional_name: 'Dra. Maria Santos',
    service_name: 'Consulta Médica',
    date: '2023-12-28',
    time: '09:00',
    status: 'completed',
    price: 150.00
  }
];

export default function Clients() {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    address: '',
    notes: '',
    status: 'active' as 'active' | 'inactive'
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getClientAppointments = (clientId: string) => {
    return appointments.filter(appointment => appointment.client_id === clientId)
                     .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativo' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inativo' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Agendado' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Concluído' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
      no_show: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Faltou' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString + (timeString ? ' ' + timeString : ''));
    return date.toLocaleDateString('pt-BR') + (timeString ? ' às ' + timeString : '');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingClient) {
        // Atualizar cliente existente
        const updatedClients = clients.map(client => 
          client.id === editingClient.id 
            ? { ...client, ...formData, updated_at: new Date().toISOString() }
            : client
        );
        setClients(updatedClients);
      } else {
        // Criar novo cliente
        const newClient: Client = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_appointments: 0
        };
        setClients([...clients, newClient]);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      birth_date: client.birth_date || '',
      address: client.address || '',
      notes: client.notes || '',
      status: client.status
    });
    setShowClientModal(true);
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setClients(clients.filter(client => client.id !== clientId));
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (client: Client) => {
    setSelectedClient(client);
    setShowProfileModal(true);
  };

  const handleCloseModal = () => {
    setShowClientModal(false);
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      birth_date: '',
      address: '',
      notes: '',
      status: 'active'
    });
    setErrors({});
  };

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setSelectedClient(null);
  };

  const getTotalRevenue = (clientId: string) => {
    return getClientAppointments(clientId)
      .filter(appointment => appointment.status === 'completed')
      .reduce((total, appointment) => total + appointment.price, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Base de Clientes</h1>
          <button
            onClick={() => setShowClientModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar clientes por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>

          {/* Filtro por status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agendamentos</p>
              <p className="text-2xl font-bold text-gray-900">
                {clients.reduce((total, client) => total + client.total_appointments, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Novos este mês</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agendamentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Atendimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.name}
                          </div>
                          {client.birth_date && (
                            <div className="text-sm text-gray-500">
                              {calculateAge(client.birth_date)} anos
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1 text-gray-400" />
                          {client.email}
                        </div>
                        <div className="flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-1 text-gray-400" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{client.total_appointments} total</div>
                        <div className="text-gray-500">
                          R$ {getTotalRevenue(client.id).toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.last_appointment ? (
                        <div>
                          <div>{formatDate(client.last_appointment)}</div>
                          {client.next_appointment && (
                            <div className="text-blue-600 text-xs">
                              Próximo: {formatDate(client.next_appointment)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">Nenhum</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(client.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewProfile(client)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Ver perfil"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de cadastro/edição */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Ana Silva"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="ana@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Data de nascimento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Rua, número, bairro, cidade/estado"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Informações importantes sobre o cliente..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  )}
                  {editingClient ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de perfil do cliente */}
      {showProfileModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Perfil do Cliente
              </h3>
              <button
                onClick={handleCloseProfileModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informações do cliente */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        {selectedClient.name}
                      </h4>
                      {getStatusBadge(selectedClient.status)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {selectedClient.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {selectedClient.phone}
                    </div>
                    {selectedClient.birth_date && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(selectedClient.birth_date)} ({calculateAge(selectedClient.birth_date)} anos)
                      </div>
                    )}
                    {selectedClient.address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {selectedClient.address}
                      </div>
                    )}
                  </div>

                  {selectedClient.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Observações</h5>
                      <p className="text-sm text-gray-600">{selectedClient.notes}</p>
                    </div>
                  )}

                  {/* Estatísticas */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Estatísticas</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total de agendamentos:</span>
                        <span className="font-medium">{selectedClient.total_appointments}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Receita total:</span>
                        <span className="font-medium">R$ {getTotalRevenue(selectedClient.id).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cliente desde:</span>
                        <span className="font-medium">{formatDate(selectedClient.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Histórico de agendamentos */}
              <div className="lg:col-span-2">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Histórico de Agendamentos</h4>
                <div className="space-y-4">
                  {getClientAppointments(selectedClient.id).length > 0 ? (
                    getClientAppointments(selectedClient.id).map((appointment) => (
                      <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.service_name}
                            </div>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            R$ {appointment.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {appointment.professional_name}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDateTime(appointment.date, appointment.time)}
                            </span>
                          </div>
                        </div>
                        {appointment.notes && (
                          <div className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                            <FileText className="w-4 h-4 inline mr-1" />
                            {appointment.notes}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum agendamento encontrado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}