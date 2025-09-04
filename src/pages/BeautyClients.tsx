import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Phone,
  Mail,
  Calendar,
  Heart,
  Sparkles,
  User,
  Star
} from 'lucide-react';

interface BeautyClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  skinType?: string;
  hairType?: string;
  allergies?: string;
  preferences?: string;
  lastVisit?: string;
  totalSpent: number;
  loyaltyPoints: number;
  favoriteServices: string[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface BeautyService {
  id: string;
  name: string;
  date: string;
  price: number;
  professional: string;
  rating?: number;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  skinType: string;
  hairType: string;
  allergies: string;
  preferences: string;
  status: 'active' | 'inactive';
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
}

const MOCK_CLIENTS: BeautyClient[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 99999-1111',
    birthDate: '1990-05-15',
    skinType: 'Mista',
    hairType: 'Cacheado',
    allergies: 'Nenhuma',
    preferences: 'Produtos veganos',
    lastVisit: '2024-01-10',
    totalSpent: 850.00,
    loyaltyPoints: 85,
    favoriteServices: ['Corte Feminino', 'Hidratação'],
    status: 'active',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-10T14:30:00Z'
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@email.com',
    phone: '(11) 99999-2222',
    birthDate: '1985-08-22',
    skinType: 'Seca',
    hairType: 'Liso',
    allergies: 'Parabenos',
    preferences: 'Produtos naturais',
    lastVisit: '2024-01-08',
    totalSpent: 1200.00,
    loyaltyPoints: 120,
    favoriteServices: ['Manicure', 'Pedicure', 'Limpeza de Pele'],
    status: 'active',
    created_at: '2023-12-15T10:00:00Z',
    updated_at: '2024-01-08T16:00:00Z'
  },
  {
    id: '3',
    name: 'Beatriz Lima',
    email: 'beatriz.lima@email.com',
    phone: '(11) 99999-3333',
    birthDate: '1995-03-10',
    skinType: 'Oleosa',
    hairType: 'Ondulado',
    allergies: 'Nenhuma',
    preferences: 'Cores vibrantes',
    lastVisit: '2024-01-05',
    totalSpent: 650.00,
    loyaltyPoints: 65,
    favoriteServices: ['Coloração', 'Escova'],
    status: 'active',
    created_at: '2023-11-20T10:00:00Z',
    updated_at: '2024-01-05T11:30:00Z'
  }
];

const MOCK_SERVICES: { [key: string]: BeautyService[] } = {
  '1': [
    {
      id: '1',
      name: 'Corte + Escova',
      date: '2024-01-10',
      price: 85.00,
      professional: 'Carla Santos',
      rating: 5
    },
    {
      id: '2',
      name: 'Hidratação Capilar',
      date: '2023-12-20',
      price: 65.00,
      professional: 'Carla Santos',
      rating: 5
    }
  ],
  '2': [
    {
      id: '3',
      name: 'Manicure + Pedicure',
      date: '2024-01-08',
      price: 45.00,
      professional: 'Juliana Costa',
      rating: 4
    }
  ],
  '3': [
    {
      id: '4',
      name: 'Coloração Completa',
      date: '2024-01-05',
      price: 150.00,
      professional: 'Carla Santos',
      rating: 5
    }
  ]
};

export default function BeautyClients() {
  const [clients, setClients] = useState<BeautyClient[]>(MOCK_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingClient, setEditingClient] = useState<BeautyClient | null>(null);
  const [viewingClient, setViewingClient] = useState<BeautyClient | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    skinType: '',
    hairType: '',
    allergies: '',
    preferences: '',
    status: 'active'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
    const matchesActive = !showActiveOnly || client.status === 'active';
    
    return matchesSearch && matchesStatus && matchesActive;
  });

  const getClientServices = (clientId: string): BeautyService[] => {
    return MOCK_SERVICES[clientId] || [];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória';
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
            ? { 
                ...client, 
                ...formData, 
                updated_at: new Date().toISOString() 
              }
            : client
        );
        setClients(updatedClients);
      } else {
        // Criar novo cliente
        const newClient: BeautyClient = {
          id: Date.now().toString(),
          ...formData,
          totalSpent: 0,
          loyaltyPoints: 0,
          favoriteServices: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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

  const handleEdit = (client: BeautyClient) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      birthDate: client.birthDate,
      skinType: client.skinType || '',
      hairType: client.hairType || '',
      allergies: client.allergies || '',
      preferences: client.preferences || '',
      status: client.status
    });
    setShowModal(true);
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

  const handleViewDetails = (client: BeautyClient) => {
    setViewingClient(client);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      skinType: '',
      hairType: '',
      allergies: '',
      preferences: '',
      status: 'active'
    });
    setErrors({});
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✨ Ativa
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        💤 Inativa
      </span>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h1>
              <p className="text-gray-600">Gerencie sua carteira de clientes com carinho</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Cliente
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Total de Clientes</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <Heart className="w-8 h-8 text-pink-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Clientes Ativas</p>
                <p className="text-2xl font-bold">{clients.filter(c => c.status === 'active').length}</p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Faturamento Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(clients.reduce((sum, client) => sum + client.totalSpent, 0))}
                </p>
              </div>
              <Star className="w-8 h-8 text-indigo-200" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar clientes por nome, e-mail ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>

          {/* Filtro por status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>

          {/* Filtro ativo/inativo */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">Apenas ativas</span>
          </label>
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
                  Perfil de Beleza
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Visita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Gasto
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
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">
                            {calculateAge(client.birthDate)} anos • {client.loyaltyPoints} pontos
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Mail className="w-4 h-4 mr-1 text-gray-400" />
                          {client.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1 text-gray-400" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="mb-1">🧴 Pele: {client.skinType || 'Não informado'}</div>
                        <div>💇‍♀️ Cabelo: {client.hairType || 'Não informado'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {client.lastVisit ? formatDate(client.lastVisit) : 'Nunca'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(client.totalSpent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(client.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(client)}
                          className="text-purple-600 hover:text-purple-900 p-1"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="text-blue-600 hover:text-blue-900 p-1"
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
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Nenhuma cliente encontrada</p>
                    <p className="text-sm">
                      {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece cadastrando sua primeira cliente.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de cadastro/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {editingClient ? 'Editar Cliente' : 'Nova Cliente'}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dados básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Nome da cliente"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.birthDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.birthDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
                  )}
                </div>
              </div>

              {/* Contato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="email@exemplo.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
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
              </div>

              {/* Perfil de beleza */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Pele
                  </label>
                  <select
                    value={formData.skinType}
                    onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Selecione o tipo de pele</option>
                    <option value="Oleosa">Oleosa</option>
                    <option value="Seca">Seca</option>
                    <option value="Mista">Mista</option>
                    <option value="Normal">Normal</option>
                    <option value="Sensível">Sensível</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Cabelo
                  </label>
                  <select
                    value={formData.hairType}
                    onChange={(e) => setFormData({ ...formData, hairType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Selecione o tipo de cabelo</option>
                    <option value="Liso">Liso</option>
                    <option value="Ondulado">Ondulado</option>
                    <option value="Cacheado">Cacheado</option>
                    <option value="Crespo">Crespo</option>
                  </select>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alergias e Restrições
                </label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Informe alergias ou restrições a produtos..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferências
                </label>
                <textarea
                  value={formData.preferences}
                  onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Preferências de produtos, cores, estilos..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      status: e.target.checked ? 'active' : 'inactive' 
                    })}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">Cliente ativa</span>
                </label>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-4">
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
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-md disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingClient ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalhes */}
      {showDetailsModal && viewingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <User className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Perfil de {viewingClient.name}
                </h3>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informações pessoais */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-pink-600" />
                  Informações Pessoais
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Nome:</span>
                    <p className="text-sm text-gray-900">{viewingClient.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Idade:</span>
                    <p className="text-sm text-gray-900">{calculateAge(viewingClient.birthDate)} anos</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">E-mail:</span>
                    <p className="text-sm text-gray-900">{viewingClient.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Telefone:</span>
                    <p className="text-sm text-gray-900">{viewingClient.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Tipo de Pele:</span>
                    <p className="text-sm text-gray-900">{viewingClient.skinType || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Tipo de Cabelo:</span>
                    <p className="text-sm text-gray-900">{viewingClient.hairType || 'Não informado'}</p>
                  </div>
                  {viewingClient.allergies && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Alergias:</span>
                      <p className="text-sm text-gray-900">{viewingClient.allergies}</p>
                    </div>
                  )}
                  {viewingClient.preferences && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Preferências:</span>
                      <p className="text-sm text-gray-900">{viewingClient.preferences}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Histórico de serviços */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-600" />
                  Histórico de Serviços
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    {getClientServices(viewingClient.id).length > 0 ? (
                      getClientServices(viewingClient.id).map((service) => (
                        <div key={service.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{service.name}</span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(service.price)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>📅 {formatDate(service.date)}</div>
                            <div>👩‍💼 {service.professional}</div>
                            {service.rating && (
                              <div className="flex items-center">
                                <span className="mr-1">⭐</span>
                                <span>{service.rating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Nenhum serviço realizado ainda
                      </p>
                    )}
                  </div>
                </div>

                {/* Estatísticas da cliente */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-pink-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-pink-600">
                      {formatCurrency(viewingClient.totalSpent)}
                    </p>
                    <p className="text-xs text-pink-600">Total Gasto</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-purple-600">
                      {viewingClient.loyaltyPoints}
                    </p>
                    <p className="text-xs text-purple-600">Pontos de Fidelidade</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}