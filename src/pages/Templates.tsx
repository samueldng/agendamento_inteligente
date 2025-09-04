import { useState } from 'react';
import { Package, Info, Lightbulb, ArrowRight } from 'lucide-react';
import ServiceTemplates from '../components/ServiceTemplates';
import { useCategories } from '../hooks/useCategories';

export default function Templates() {
  const { data: categories, loading } = useCategories();
  const [showInfo, setShowInfo] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Templates de Serviços</h1>
            <p className="text-gray-600 mt-1">
              Configure templates de serviços para diferentes tipos de negócio
            </p>
          </div>
          <Package className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Informações e Dicas */}
      {showInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Como usar os Templates de Serviços
                </h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    Os templates permitem criar modelos de serviços pré-configurados para cada categoria de negócio.
                  </p>
                  <div className="flex items-start space-x-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>Selecione uma categoria para ver os templates disponíveis</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>Crie novos templates ou edite os existentes</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-blue-600" />
                    <span>Use os templates como base para criar serviços rapidamente</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="text-blue-400 hover:text-blue-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Dicas por Categoria */}
      {categories && categories.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-900 mb-2">
                Sugestões de Templates por Categoria
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-yellow-800">
                <div>
                  <h4 className="font-medium mb-1">🏥 Saúde</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Consulta médica (30-60 min)</li>
                    <li>• Exames laboratoriais (15-30 min)</li>
                    <li>• Procedimentos (30-120 min)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">💄 Beleza/Estética</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Corte de cabelo (45-90 min)</li>
                    <li>• Manicure/Pedicure (30-60 min)</li>
                    <li>• Tratamentos faciais (60-120 min)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">💼 Consultoria</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Consultoria estratégica (60-180 min)</li>
                    <li>• Análise de processos (90-120 min)</li>
                    <li>• Treinamentos (120-480 min)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">📚 Educação</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Aulas particulares (60-90 min)</li>
                    <li>• Cursos intensivos (120-240 min)</li>
                    <li>• Workshops (180-360 min)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">🔧 Serviços Gerais</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Manutenção básica (30-60 min)</li>
                    <li>• Reparos complexos (60-240 min)</li>
                    <li>• Instalações (90-180 min)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">🏋️ Fitness</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• Personal training (60 min)</li>
                    <li>• Avaliação física (45 min)</li>
                    <li>• Aulas em grupo (45-60 min)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Componente Principal */}
      <ServiceTemplates />

      {/* Estatísticas */}
      {categories && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estatísticas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Categorias Ativas</p>
                  <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">Templates Criados</p>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
                <Package className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Mais Usado</p>
                  <p className="text-sm font-bold text-purple-600">Corte de Cabelo</p>
                </div>
                <Package className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}