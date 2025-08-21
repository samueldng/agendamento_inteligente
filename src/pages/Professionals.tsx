import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Phone,
  Mail,
  Save,
  X,
  User,
  Calendar,
  MapPin
} from 'lucide-react';

interface WorkingHours {
  day: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
}

interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  registration: string;
  address?: string;
  bio?: string;
  active: boolean;
  working_hours: WorkingHours[];
  services: string[];
  created_at: string;
  updated_at: string;
}

interface ProfessionalFormData {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  registration: string;
  address: string;
  bio: string;
  active: boolean;
  working_hours: WorkingHours[];
  services: string[];
}

const SPECIALTIES = [
  'Clínico Geral',
  'Cardiologista',
  'Dermatologista',
  'Neurologista',
  'Ortopedista',
  'Pediatra',
  'Ginecologista',
  'Psiquiatra',
  'Fisioterapeuta',
  'Nutricionista',
  'Psicólogo',
  'Dentista',
  'Outros'
];

const SERVICES = [
  'Consulta Médica',
  'Exame de Sangue',
  'Fisioterapia',
  'Ultrassom',
  'Eletrocardiograma',
  'Raio-X',
  'Consulta Nutricional',
  'Terapia'
];

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

const DEFAULT_WORKING_HOURS: WorkingHours[] = DAYS_OF_WEEK.map(day => ({
  day: day.key,
  enabled: day.key !== 'sunday',
  start_time: '08:00',
  end_time: '18:00',
  break_start: '12:00',
  break_end: '13:00'
}));

const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: '1',
    name: 'Dr. João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    specialty: 'Clínico Geral',
    registration: 'CRM 123456',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    bio: 'Médico com 15 anos de experiência em clínica geral.',
    active: true,
    working_hours: DEFAULT_WORKING_HOURS,
    services: ['Consulta Médica', 'Eletrocardiograma'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Dra. Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 88888-8888',
    specialty: 'Cardiologista',
    registration: 'CRM 654321',
    address: 'Av. Paulista, 456 - São Paulo/SP',
    bio: 'Especialista em cardiologia com foco em prevenção.',
    active: true,
    working_hours: DEFAULT_WORKING_HOURS,
    services: ['Consulta Médica', 'Eletrocardiograma', 'Ultrassom'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
];

export default function Professionals() {
  const [professionals, setProfessionals] = useState<Professional[]>(MOCK_PROFESSIONALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState<ProfessionalFormData>({
    name: '',
    email: '',
    phone: '',
    specialty: 'Clínico Geral',
    registration: '',
    address: '',
    bio: '',
    active: true,
    working_hours: DEFAULT_WORKING_HOURS,
    services: []
  });
  const [errors, setErrors] = useState<Partial<ProfessionalFormData>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'services'>('basic');

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || professional.specialty === selectedSpecialty;
    const matchesActive = !showActiveOnly || professional.active;
    
    return matchesSearch && matchesSpecialty && matchesActive;
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfessionalFormData> = {};

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

    if (!formData.registration.trim()) {
      newErrors.registration = 'Registro profissional é obrigatório';
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
      
      if (editingProfessional) {
        // Atualizar profissional existente
        const updatedProfessionals = professionals.map(professional => 
          professional.id === editingProfessional.id 
            ? { ...professional, ...formData, updated_at: new Date().toISOString() }
            : professional
        );
        setProfessionals(updatedProfessionals);
      } else {
        // Criar novo profissional
        const newProfessional: Professional = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfessionals([...professionals, newProfessional]);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setFormData({
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      specialty: professional.specialty,
      registration: professional.registration,
      address: professional.address || '',
      bio: professional.bio || '',
      active: professional.active,
      working_hours: professional.working_hours,
      services: professional.services
    });
    setShowModal(true);
  };

  const handleDelete = async (professionalId: string) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) return;
    
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setProfessionals(professionals.filter(professional => professional.id !== professionalId));
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (professionalId: string) => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedProfessionals = professionals.map(professional => 
        professional.id === professionalId 
          ? { ...professional, active: !professional.active, updated_at: new Date().toISOString() }
          : professional
      );
      setProfessionals(updatedProfessionals);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProfessional(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: 'Clínico Geral',
      registration: '',
      address: '',
      bio: '',
      active: true,
      working_hours: DEFAULT_WORKING_HOURS,
      services: []
    });
    setErrors({});
    setActiveTab('basic');
  };

  const updateWorkingHours = (dayIndex: number, field: keyof WorkingHours, value: string | boolean) => {
    const updatedHours = [...formData.working_hours];
    updatedHours[dayIndex] = { ...updatedHours[dayIndex], [field]: value };
    setFormData({ ...formData, working_hours: updatedHours });
  };

  const toggleService = (service: string) => {
    const updatedServices = formData.services.includes(service)
      ? formData.services.filter(s => s !== service)
      : [...formData.services, service];
    setFormData({ ...formData, services: updatedServices });
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Ativo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inativo
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Profissionais</h1>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Profissional
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar profissionais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full"
            />
          </div>

          {/* Filtro por especialidade */}
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">Todas as especialidades</option>
            {SPECIALTIES.map(specialty => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>

          {/* Filtro ativo/inativo */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Apenas ativos</span>
          </label>
        </div>
      </div>

      {/* Lista de profissionais */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
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
              {filteredProfessionals.length > 0 ? (
                filteredProfessionals.map((professional) => (
                  <tr key={professional.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {professional.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {professional.services.length} serviços
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {professional.specialty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1 text-gray-400" />
                          {professional.email}
                        </div>
                        <div className="flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-1 text-gray-400" />
                          {professional.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {professional.registration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(professional.active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(professional)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(professional.id)}
                          className={`p-1 ${
                            professional.active 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={professional.active ? 'Desativar' : 'Ativar'}
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(professional.id)}
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
                    Nenhum profissional encontrado
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
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'basic'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dados Básicos
                </button>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'schedule'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Horários
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'services'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Serviços
                </button>
              </nav>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Tab: Dados Básicos */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
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
                        placeholder="Ex: Dr. João Silva"
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
                        placeholder="joao@email.com"
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

                    {/* Especialidade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Especialidade *
                      </label>
                      <select
                        value={formData.specialty}
                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        {SPECIALTIES.map(specialty => (
                          <option key={specialty} value={specialty}>
                            {specialty}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Registro */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registro Profissional *
                      </label>
                      <input
                        type="text"
                        value={formData.registration}
                        onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          errors.registration ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="CRM 123456"
                      />
                      {errors.registration && (
                        <p className="mt-1 text-sm text-red-600">{errors.registration}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.active}
                          onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Profissional ativo</span>
                      </label>
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

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Biografia
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Breve descrição sobre o profissional..."
                    />
                  </div>
                </div>
              )}

              {/* Tab: Horários */}
              {activeTab === 'schedule' && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Horários de Trabalho</h4>
                  {DAYS_OF_WEEK.map((day, index) => {
                    const workingHour = formData.working_hours[index];
                    return (
                      <div key={day.key} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={workingHour.enabled}
                              onChange={(e) => updateWorkingHours(index, 'enabled', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{day.label}</span>
                          </label>
                        </div>
                        
                        {workingHour.enabled && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Início
                              </label>
                              <input
                                type="time"
                                value={workingHour.start_time}
                                onChange={(e) => updateWorkingHours(index, 'start_time', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Fim
                              </label>
                              <input
                                type="time"
                                value={workingHour.end_time}
                                onChange={(e) => updateWorkingHours(index, 'end_time', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Pausa início
                              </label>
                              <input
                                type="time"
                                value={workingHour.break_start || ''}
                                onChange={(e) => updateWorkingHours(index, 'break_start', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Pausa fim
                              </label>
                              <input
                                type="time"
                                value={workingHour.break_end || ''}
                                onChange={(e) => updateWorkingHours(index, 'break_end', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab: Serviços */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Serviços Oferecidos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SERVICES.map(service => (
                      <label key={service} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service)}
                          onChange={() => toggleService(service)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
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
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingProfessional ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}