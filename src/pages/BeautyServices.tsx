import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  Sparkles,
  Scissors,
  Heart,
  Star,
  Clock,
  DollarSign
} from 'lucide-react';

interface BeautyService {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number; // em minutos
  price: number;
  isActive: boolean;
  skinType?: string;
  hairType?: string;
  difficulty: 'Básico' | 'Intermediário' | 'Avançado';
  equipment?: string[];
  aftercare?: string;
}

interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  duration: string;
  price: string;
  isActive: boolean;
  skinType: string;
  hairType: string;
  difficulty: 'Básico' | 'Intermediário' | 'Avançado';
  equipment: string;
  aftercare: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  duration?: string;
  price?: string;
}

const MOCK_SERVICES: BeautyService[] = [
  {
    id: '1',
    name: 'Corte Feminino',
    description: 'Corte personalizado de acordo com o formato do rosto e estilo pessoal',
    category: 'Cabelo',
    duration: 60,
    price: 45.00,
    isActive: true,
    hairType: 'Todos os tipos',
    difficulty: 'Básico',
    equipment: ['Tesoura profissional', 'Pente', 'Borrifador'],
    aftercare: 'Evitar lavar o cabelo nas primeiras 24h'
  },
  {
    id: '2',
    name: 'Coloração Completa',
    description: 'Mudança completa de cor com produtos de alta qualidade',
    category: 'Cabelo',
    duration: 180,
    price: 120.00,
    isActive: true,
    hairType: 'Todos os tipos',
    difficulty: 'Avançado',
    equipment: ['Tintura profissional', 'Oxidante', 'Pincel', 'Tigela'],
    aftercare: 'Usar shampoo para cabelos coloridos e evitar sol direto'
  },
  {
    id: '3',
    name: 'Limpeza de Pele Profunda',
    description: 'Tratamento completo para remoção de impurezas e renovação celular',
    category: 'Estética Facial',
    duration: 90,
    price: 80.00,
    isActive: true,
    skinType: 'Oleosa/Mista',
    difficulty: 'Intermediário',
    equipment: ['Vapor de ozônio', 'Extrator', 'Máscara purificante'],
    aftercare: 'Evitar exposição solar e usar protetor solar'
  },
  {
    id: '4',
    name: 'Manicure Completa',
    description: 'Cuidado completo das unhas das mãos com esmaltação',
    category: 'Unhas',
    duration: 60,
    price: 25.00,
    isActive: true,
    difficulty: 'Básico',
    equipment: ['Alicate', 'Lixa', 'Esmalte', 'Base e top coat'],
    aftercare: 'Evitar contato com produtos químicos nas primeiras 2h'
  },
  {
    id: '5',
    name: 'Design de Sobrancelhas',
    description: 'Modelagem e design personalizado das sobrancelhas',
    category: 'Sobrancelhas',
    duration: 45,
    price: 30.00,
    isActive: true,
    difficulty: 'Intermediário',
    equipment: ['Pinça', 'Tesoura pequena', 'Régua de medição'],
    aftercare: 'Aplicar gel calmante e evitar maquiagem na região'
  },
  {
    id: '6',
    name: 'Massagem Relaxante',
    description: 'Massagem corporal para alívio do estresse e tensões musculares',
    category: 'Bem-estar',
    duration: 60,
    price: 70.00,
    isActive: true,
    difficulty: 'Básico',
    equipment: ['Óleos essenciais', 'Toalhas aquecidas'],
    aftercare: 'Beber bastante água e evitar atividades intensas'
  },
  {
    id: '7',
    name: 'Tratamento Anti-idade',
    description: 'Protocolo avançado para redução de linhas de expressão',
    category: 'Estética Facial',
    duration: 120,
    price: 150.00,
    isActive: false,
    skinType: 'Madura',
    difficulty: 'Avançado',
    equipment: ['Radiofrequência', 'Sérum anti-idade', 'Máscara colágeno'],
    aftercare: 'Usar protetor solar diariamente e hidratar a pele'
  }
];

const CATEGORIES = [
  'Cabelo',
  'Estética Facial',
  'Unhas',
  'Sobrancelhas',
  'Bem-estar',
  'Depilação',
  'Maquiagem'
];

export default function BeautyServices() {
  const [services, setServices] = useState<BeautyService[]>(MOCK_SERVICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<BeautyService | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    category: '',
    duration: '',
    price: '',
    isActive: true,
    skinType: '',
    hairType: '',
    difficulty: 'Básico',
    equipment: '',
    aftercare: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesActive = !showActiveOnly || service.isActive;
    
    return matchesSearch && matchesCategory && matchesActive;
  });

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nome do tratamento é obrigatório';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Descrição é obrigatória';
    }
    
    if (!formData.category) {
      errors.category = 'Categoria é obrigatória';
    }
    
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      errors.duration = 'Duração deve ser maior que zero';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Preço deve ser maior que zero';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const serviceData: BeautyService = {
        id: editingService?.id || Date.now().toString(),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price),
        isActive: formData.isActive,
        skinType: formData.skinType || undefined,
        hairType: formData.hairType || undefined,
        difficulty: formData.difficulty,
        equipment: formData.equipment ? formData.equipment.split(',').map(item => item.trim()) : undefined,
        aftercare: formData.aftercare || undefined
      };
      
      if (editingService) {
        setServices(services.map(service => 
          service.id === editingService.id ? serviceData : service
        ));
      } else {
        setServices([...services, serviceData]);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar tratamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este tratamento?')) {
      setServices(services.filter(service => service.id !== id));
    }
  };

  const handleToggleActive = async (id: string) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, isActive: !service.isActive } : service
    ));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      duration: '',
      price: '',
      isActive: true,
      skinType: '',
      hairType: '',
      difficulty: 'Básico',
      equipment: '',
      aftercare: ''
    });
    setFormErrors({});
  };

  const handleEdit = (service: BeautyService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      duration: service.duration.toString(),
      price: service.price.toString(),
      isActive: service.isActive,
      skinType: service.skinType || '',
      hairType: service.hairType || '',
      difficulty: service.difficulty,
      equipment: service.equipment?.join(', ') || '',
      aftercare: service.aftercare || ''
    });
    setShowModal(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
        Ativo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></span>
        Inativo
      </span>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Básico': return 'bg-green-100 text-green-800';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-800';
      case 'Avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
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
              <h1 className="text-2xl font-bold text-gray-900">Gestão de Tratamentos</h1>
              <p className="text-gray-600">Gerencie os serviços de beleza oferecidos</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Tratamento
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar tratamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Filtro por categoria */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Todas as categorias</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Filtro apenas ativos */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Apenas ativos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabela de tratamentos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tratamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dificuldade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {service.name}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {service.description}
                      </div>
                      {service.skinType && (
                        <div className="text-xs text-gray-400 mt-1">
                          💧 Pele: {service.skinType}
                        </div>
                      )}
                      {service.hairType && (
                        <div className="text-xs text-gray-400 mt-1">
                          💇‍♀️ Cabelo: {service.hairType}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(service.difficulty)}`}>
                      {service.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDuration(service.duration)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center font-semibold">
                      <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                      {formatCurrency(service.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(service.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(service.id)}
                        className={service.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        title={service.isActive ? 'Desativar' : 'Ativar'}
                      >
                        {service.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum tratamento encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' || showActiveOnly
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando seu primeiro tratamento de beleza.'}
            </p>
          </div>
        )}
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
                  {editingService ? 'Editar Tratamento' : 'Novo Tratamento'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Tratamento *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      formErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Corte Feminino"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                {/* Descrição */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      formErrors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Descreva o tratamento oferecido..."
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      formErrors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione uma categoria</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                  )}
                </div>

                {/* Dificuldade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nível de Dificuldade
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'Básico' | 'Intermediário' | 'Avançado' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="Básico">Básico</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>

                {/* Duração */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração (minutos) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      formErrors.duration ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="60"
                    min="1"
                  />
                  {formErrors.duration && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.duration}</p>
                  )}
                </div>

                {/* Preço */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      formErrors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="45.00"
                    min="0.01"
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>
                  )}
                </div>

                {/* Tipo de Pele */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Pele (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.skinType}
                    onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Ex: Oleosa, Seca, Mista"
                  />
                </div>

                {/* Tipo de Cabelo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Cabelo (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.hairType}
                    onChange={(e) => setFormData({ ...formData, hairType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Ex: Liso, Cacheado, Crespo"
                  />
                </div>

                {/* Equipamentos */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipamentos Necessários (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.equipment}
                    onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Separe por vírgulas: Tesoura, Pente, Secador"
                  />
                </div>

                {/* Cuidados Pós-Tratamento */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuidados Pós-Tratamento (opcional)
                  </label>
                  <textarea
                    value={formData.aftercare}
                    onChange={(e) => setFormData({ ...formData, aftercare: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Instruções para a cliente após o tratamento..."
                  />
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Tratamento ativo</span>
                  </label>
                </div>
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
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-md disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingService ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}