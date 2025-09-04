import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Copy, Package } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category_id: string;
}

interface ServiceTemplatesByCategory {
  [categoryId: string]: ServiceTemplate[];
}

// Templates mockados por categoria
const MOCK_TEMPLATES: ServiceTemplatesByCategory = {
  '1': [ // Beleza/Estética
    {
      id: '1',
      name: 'Corte de Cabelo Feminino',
      description: 'Corte personalizado com lavagem e finalização',
      duration: 60,
      price: 80,
      category_id: '1'
    },
    {
      id: '2',
      name: 'Manicure Completa',
      description: 'Cuidados completos para as unhas das mãos',
      duration: 45,
      price: 35,
      category_id: '1'
    },
    {
      id: '3',
      name: 'Pedicure Completa',
      description: 'Cuidados completos para as unhas dos pés',
      duration: 60,
      price: 45,
      category_id: '1'
    },
    {
      id: '4',
      name: 'Escova Progressiva',
      description: 'Tratamento para alisamento dos cabelos',
      duration: 180,
      price: 250,
      category_id: '1'
    }
  ],
  '2': [ // Saúde
    {
      id: '5',
      name: 'Consulta Médica',
      description: 'Consulta médica geral',
      duration: 30,
      price: 150,
      category_id: '2'
    },
    {
      id: '6',
      name: 'Exame de Sangue',
      description: 'Coleta de sangue para exames laboratoriais',
      duration: 15,
      price: 80,
      category_id: '2'
    },
    {
      id: '7',
      name: 'Ultrassom',
      description: 'Exame de ultrassonografia',
      duration: 45,
      price: 200,
      category_id: '2'
    }
  ],
  '3': [ // Consultoria
    {
      id: '8',
      name: 'Consultoria Empresarial',
      description: 'Consultoria estratégica para empresas',
      duration: 120,
      price: 500,
      category_id: '3'
    },
    {
      id: '9',
      name: 'Análise de Processos',
      description: 'Análise e otimização de processos empresariais',
      duration: 90,
      price: 350,
      category_id: '3'
    }
  ],
  '4': [ // Educação
    {
      id: '10',
      name: 'Aula Particular',
      description: 'Aula individual personalizada',
      duration: 60,
      price: 100,
      category_id: '4'
    },
    {
      id: '11',
      name: 'Curso Intensivo',
      description: 'Curso intensivo em grupo pequeno',
      duration: 180,
      price: 300,
      category_id: '4'
    }
  ]
};

export default function ServiceTemplates() {
  const { data: categories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [templates, setTemplates] = useState<ServiceTemplatesByCategory>(MOCK_TEMPLATES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ServiceTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0
  });

  const selectedTemplates = selectedCategoryId ? templates[selectedCategoryId] || [] : [];
  const selectedCategory = categories?.find(cat => cat.id === selectedCategoryId);

  const handleOpenModal = (template?: ServiceTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description,
        duration: template.duration,
        price: template.price
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        duration: 30,
        price: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setFormData({ name: '', description: '', duration: 30, price: 0 });
  };

  const handleSaveTemplate = () => {
    if (!selectedCategoryId || !formData.name.trim()) return;

    const newTemplate: ServiceTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      duration: formData.duration,
      price: formData.price,
      category_id: selectedCategoryId
    };

    setTemplates(prev => {
      const categoryTemplates = prev[selectedCategoryId] || [];
      
      if (editingTemplate) {
        // Editar template existente
        const updatedTemplates = categoryTemplates.map(t => 
          t.id === editingTemplate.id ? newTemplate : t
        );
        return { ...prev, [selectedCategoryId]: updatedTemplates };
      } else {
        // Adicionar novo template
        return { 
          ...prev, 
          [selectedCategoryId]: [...categoryTemplates, newTemplate] 
        };
      }
    });

    handleCloseModal();
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (!selectedCategoryId) return;
    
    setTemplates(prev => ({
      ...prev,
      [selectedCategoryId]: prev[selectedCategoryId]?.filter(t => t.id !== templateId) || []
    }));
  };

  const handleDuplicateTemplate = (template: ServiceTemplate) => {
    const duplicatedTemplate: ServiceTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Cópia)`
    };

    setTemplates(prev => ({
      ...prev,
      [selectedCategoryId]: [...(prev[selectedCategoryId] || []), duplicatedTemplate]
    }));
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Package className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Templates de Serviços</h2>
        </div>
        {selectedCategoryId && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </button>
        )}
      </div>

      {/* Seletor de Categoria */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione uma categoria:
        </label>
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione uma categoria</option>
          {categories?.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Templates */}
      {selectedCategoryId ? (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Templates para {selectedCategory?.name}
          </h3>
          
          {selectedTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedTemplates.map(template => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{template.name}</h4>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => handleOpenModal(template)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateTemplate(template)}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Duplicar"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{template.duration} min</span>
                    <span className="font-medium text-green-600">
                      R$ {template.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum template encontrado para esta categoria.</p>
              <p className="text-sm">Clique em "Novo Template" para criar o primeiro.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Selecione uma categoria para visualizar os templates de serviços.</p>
        </div>
      )}

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Corte de Cabelo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descrição do serviço..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração (min) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="15"
                    step="15"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!formData.name.trim()}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTemplate ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}