import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Save,
  X,
  Filter,
  Eye,
  Stethoscope,
  Activity
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface Procedure {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  active: boolean;
  medical_code?: string;
  requires_preparation?: boolean;
  created_at: string;
  updated_at: string;
}

interface ProcedureFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  active: boolean;
  medical_code?: string;
  requires_preparation?: boolean;
}

interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  duration?: string;
  price?: string;
}

const MOCK_PROCEDURES: Procedure[] = [
  {
    id: '1',
    name: 'Consulta Cardiológica',
    description: 'Avaliação cardiovascular completa com ECG',
    duration: 60,
    price: 200.00,
    category: 'Consulta Especializada',
    active: true,
    medical_code: 'CID-10: Z01.0',
    requires_preparation: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Hemograma Completo',
    description: 'Análise laboratorial completa do sangue',
    duration: 15,
    price: 45.00,
    category: 'Exame Laboratorial',
    active: true,
    medical_code: 'CBHPM: 40301012',
    requires_preparation: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'Ultrassom Abdominal',
    description: 'Exame de imagem do abdome por ultrassom',
    duration: 30,
    price: 120.00,
    category: 'Exame de Imagem',
    active: true,
    medical_code: 'CBHPM: 40901025',
    requires_preparation: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '4',
    name: 'Fisioterapia Respiratória',
    description: 'Sessão de fisioterapia para reabilitação respiratória',
    duration: 45,
    price: 80.00,
    category: 'Terapia',
    active: true,
    medical_code: 'CBHPM: 51301010',
    requires_preparation: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '5',
    name: 'Cirurgia de Catarata',
    description: 'Procedimento cirúrgico para remoção de catarata',
    duration: 90,
    price: 1500.00,
    category: 'Cirurgia',
    active: false,
    medical_code: 'CBHPM: 31601016',
    requires_preparation: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
];

export default function HealthProcedures() {
  const { data: categories, loading: categoriesLoading } = useCategories();
  const [procedures, setProcedures] = useState<Procedure[]>(MOCK_PROCEDURES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [formData, setFormData] = useState<ProcedureFormData>({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    category: '',
    active: true,
    medical_code: '',
    requires_preparation: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const filteredProcedures = procedures.filter(procedure => {
    const matchesSearch = procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         procedure.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (procedure.medical_code && procedure.medical_code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || procedure.category === selectedCategory;
    const matchesActive = !showActiveOnly || procedure.active;
    
    return matchesSearch && matchesCategory && matchesActive;
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do procedimento é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'Duração deve ser maior que 0';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Valor deve ser maior que 0';
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
      
      if (editingProcedure) {
        // Atualizar procedimento existente
        const updatedProcedures = procedures.map(procedure => 
          procedure.id === editingProcedure.id 
            ? { ...procedure, ...formData, updated_at: new Date().toISOString() }
            : procedure
        );
        setProcedures(updatedProcedures);
      } else {
        // Criar novo procedimento
        const newProcedure: Procedure = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProcedures([...procedures, newProcedure]);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar procedimento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    setFormData({
      name: procedure.name,
      description: procedure.description,
      duration: procedure.duration,
      price: procedure.price,
      category: procedure.category,
      active: procedure.active,
      medical_code: procedure.medical_code || '',
      requires_preparation: procedure.requires_preparation || false
    });
    setShowModal(true);
  };

  const handleDelete = async (procedureId: string) => {
    if (!confirm('Tem certeza que deseja excluir este procedimento?')) return;
    
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcedures(procedures.filter(procedure => procedure.id !== procedureId));
    } catch (error) {
      console.error('Erro ao excluir procedimento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (procedureId: string) => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedProcedures = procedures.map(procedure => 
        procedure.id === procedureId 
          ? { ...procedure, active: !procedure.active, updated_at: new Date().toISOString() }
          : procedure
      );
      setProcedures(updatedProcedures);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProcedure(null);
    setFormData({
      name: '',
      description: '',
      duration: 30,
      price: 0,
      category: '',
      active: true,
      medical_code: '',
      requires_preparation: false
    });
    setErrors({});
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✅ Ativo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ❌ Inativo
      </span>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Consulta Especializada': 'bg-blue-100 text-blue-800',
      'Exame Laboratorial': 'bg-purple-100 text-purple-800',
      'Exame de Imagem': 'bg-green-100 text-green-800',
      'Terapia': 'bg-orange-100 text-orange-800',
      'Cirurgia': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestão de Procedimentos</h1>
              <p className="text-gray-600">Configure procedimentos médicos e valores</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Procedimento
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar procedimentos, códigos médicos..."
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
            <option value="Consulta Especializada">Consulta Especializada</option>
            <option value="Exame Laboratorial">Exame Laboratorial</option>
            <option value="Exame de Imagem">Exame de Imagem</option>
            <option value="Terapia">Terapia</option>
            <option value="Cirurgia">Cirurgia</option>
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

      {/* Lista de procedimentos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Procedimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código Médico
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProcedures.length > 0 ? (
                filteredProcedures.map((procedure) => (
                  <tr key={procedure.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <Stethoscope className="w-4 h-4 mr-2 text-blue-500" />
                          {procedure.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {procedure.description}
                        </div>
                        {procedure.requires_preparation && (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⚠️ Requer preparo
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(procedure.category)}`}>
                        {procedure.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {procedure.medical_code || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {procedure.duration} min
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                        R$ {procedure.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(procedure.active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(procedure)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(procedure.id)}
                          className={`p-1 ${
                            procedure.active 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={procedure.active ? 'Desativar' : 'Ativar'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(procedure.id)}
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
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Nenhum procedimento encontrado</p>
                    <p className="text-sm">
                      {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece cadastrando seu primeiro procedimento médico.'}
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
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
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Procedimento *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Consulta Cardiológica"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Descreva o procedimento médico..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Categoria e Código Médico */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Consulta Especializada">Consulta Especializada</option>
                    <option value="Exame Laboratorial">Exame Laboratorial</option>
                    <option value="Exame de Imagem">Exame de Imagem</option>
                    <option value="Terapia">Terapia</option>
                    <option value="Cirurgia">Cirurgia</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Médico
                  </label>
                  <input
                    type="text"
                    value={formData.medical_code}
                    onChange={(e) => setFormData({ ...formData, medical_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                    placeholder="Ex: CBHPM: 40301012"
                  />
                </div>
              </div>

              {/* Duração e Preço */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração (min) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.duration ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>
              </div>

              {/* Opções */}
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.requires_preparation || false}
                    onChange={(e) => setFormData({ ...formData, requires_preparation: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Requer preparo do paciente</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Procedimento ativo</span>
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
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingProcedure ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}