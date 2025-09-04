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
  MapPin,
  Tag
} from 'lucide-react';
import { Professional, BusinessCategory, DynamicFormData, WorkingHours } from '../../api/types';
import { useCategories, useCategoryById, createProfessional, updateProfessional, fetchProfessionals, deleteProfessional } from '../hooks/useCategories';
import DynamicFields from '../components/DynamicFields';

interface ProfessionalFormData {
  name: string;
  email: string;
  phone: string;
  category_id: string;
  working_hours: WorkingHours;
  dynamic_fields: DynamicFormData;
}

// Removidas as constantes fixas de especialidades e serviços

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { is_working: true, start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' },
  tuesday: { is_working: true, start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' },
  wednesday: { is_working: true, start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' },
  thursday: { is_working: true, start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' },
  friday: { is_working: true, start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' },
  saturday: { is_working: true, start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' },
  sunday: { is_working: false }
};

// Dados mock removidos - agora vem da API

export default function Professionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState<ProfessionalFormData>({
    name: '',
    email: '',
    phone: '',
    category_id: '',
    working_hours: DEFAULT_WORKING_HOURS,
    dynamic_fields: {}
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'dynamic'>('basic');
  const [dynamicFieldErrors, setDynamicFieldErrors] = useState<Record<string, string>>({});
  
  // Hooks para categorias
  const { data: categories, loading: categoriesLoading } = useCategories();
  const { data: selectedCategoryData } = useCategoryById(formData.category_id || null);

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.phone.includes(searchTerm);
    
    const matchesCategory = selectedCategory === 'all' || professional.category_id === selectedCategory;
    const matchesStatus = !showActiveOnly || professional.is_active;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Carregar profissionais ao montar o componente
  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const data = await fetchProfessionals();
      setProfessionals(data);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const newDynamicErrors: Record<string, string> = {};

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

    if (!formData.category_id.trim()) {
      newErrors.category_id = 'Categoria é obrigatória';
    }

    // Validar campos dinâmicos obrigatórios
    if (selectedCategoryData?.fields_config) {
      selectedCategoryData.fields_config.forEach(field => {
        if (field.required) {
          const value = formData.dynamic_fields[field.name];
          if (!value || (typeof value === 'string' && !value.trim())) {
            newDynamicErrors[field.name] = `${field.label} é obrigatório`;
          }
        }
      });
    }

    setErrors(newErrors);
    setDynamicFieldErrors(newDynamicErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newDynamicErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      if (editingProfessional) {
        // Atualizar profissional existente
        await updateProfessional(editingProfessional.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          category_id: formData.category_id,
          working_hours: formData.working_hours,
          dynamic_fields: formData.dynamic_fields
        });
      } else {
        // Criar novo profissional
        await createProfessional({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          category_id: formData.category_id,
          working_hours: formData.working_hours,
          dynamic_fields: formData.dynamic_fields
        });
      }
      
      // Recarregar lista de profissionais
      await loadProfessionals();
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
      category_id: professional.category_id,
      working_hours: professional.working_hours,
      dynamic_fields: professional.dynamic_fields || {}
    });
    setShowModal(true);
  };

  const handleDelete = async (professionalId: string) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) return;
    
    setLoading(true);
    try {
      await deleteProfessional(professionalId);
      await loadProfessionals();
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (professionalId: string) => {
    setLoading(true);
    try {
      const professional = professionals.find(p => p.id === professionalId);
      if (professional) {
        await updateProfessional(professionalId, {
          name: professional.name,
          email: professional.email,
          phone: professional.phone,
          category_id: professional.category_id,
          working_hours: professional.working_hours,
          dynamic_fields: professional.dynamic_fields || {},
          is_active: !professional.is_active
        });
        await loadProfessionals();
      }
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
      category_id: '',
      working_hours: DEFAULT_WORKING_HOURS,
      dynamic_fields: {}
    });
    setErrors({});
    setDynamicFieldErrors({});
    setActiveTab('basic');
  };

  const updateWorkingHours = (dayKey: keyof WorkingHours, field: string, value: string | boolean) => {
    const updatedHours = {
      ...formData.working_hours,
      [dayKey]: {
        ...formData.working_hours[dayKey],
        [field]: value
      }
    };
    setFormData({ ...formData, working_hours: updatedHours });
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

          {/* Filtro por categoria */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            disabled={categoriesLoading}
          >
            <option value="all">Todas as categorias</option>
            {categories?.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
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
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campos Específicos
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
                            ID: {professional.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {professional.category?.name || 'Sem categoria'}
                        </span>
                      </div>
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
                      {professional.category?.fields_config ? (
                        <div className="space-y-1">
                          {Object.entries(professional.dynamic_fields || {}).slice(0, 2).map(([key, value]) => {
                            const fieldConfig = professional.category.fields_config.find(f => f.name === key);
                            if (!fieldConfig || !value) return null;
                            return (
                              <div key={key} className="flex items-center text-xs">
                                <span className="font-medium text-gray-600 mr-1">
                                  {fieldConfig.label}:
                                </span>
                                <span className="text-gray-900">
                                  {String(value).length > 20 ? `${String(value).substring(0, 20)}...` : String(value)}
                                </span>
                              </div>
                            );
                          })}
                          {Object.keys(professional.dynamic_fields || {}).length > 2 && (
                            <span className="text-xs text-gray-500">+{Object.keys(professional.dynamic_fields || {}).length - 2} mais</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Sem campos específicos</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(professional.is_active)}
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
                            professional.is_active 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={professional.is_active ? 'Desativar' : 'Ativar'}
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
                  onClick={() => setActiveTab('dynamic')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'dynamic'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Campos Específicos
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

                    {/* Categoria */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoria *
                      </label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          errors.category_id ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={categoriesLoading}
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories?.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.category_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* Tab: Horários */}
              {activeTab === 'schedule' && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Horários de Trabalho</h4>
                  {DAYS_OF_WEEK.map((day) => {
                    const workingHour = formData.working_hours[day.key as keyof WorkingHours];
                    return (
                      <div key={day.key} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={workingHour.is_working}
                              onChange={(e) => updateWorkingHours(day.key as keyof WorkingHours, 'is_working', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">{day.label}</span>
                          </label>
                        </div>
                        
                        {workingHour.is_working && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Início
                              </label>
                              <input
                                type="time"
                                value={workingHour.start_time}
                                onChange={(e) => updateWorkingHours(day.key as keyof WorkingHours, 'start_time', e.target.value)}
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
                                onChange={(e) => updateWorkingHours(day.key as keyof WorkingHours, 'end_time', e.target.value)}
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
                                onChange={(e) => updateWorkingHours(day.key as keyof WorkingHours, 'break_start', e.target.value)}
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
                                onChange={(e) => updateWorkingHours(day.key as keyof WorkingHours, 'break_end', e.target.value)}
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

              {/* Tab: Campos Dinâmicos */}
              {activeTab === 'dynamic' && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Campos Específicos da Categoria</h4>
                  {selectedCategoryData?.fields_config ? (
                    <DynamicFields
                      fields={selectedCategoryData.fields_config}
                      values={formData.dynamic_fields}
                      onChange={(values) => setFormData({ ...formData, dynamic_fields: values })}
                      errors={dynamicFieldErrors}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      {formData.category_id ? 'Esta categoria não possui campos específicos.' : 'Selecione uma categoria para ver os campos específicos.'}
                    </p>
                  )}
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