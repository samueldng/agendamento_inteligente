import { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import { TrendingUp, Users, Calendar, DollarSign, Clock, Star } from 'lucide-react';

interface CategoryInsight {
  categoryId: string;
  categoryName: string;
  totalProfessionals: number;
  totalServices: number;
  avgRating: number;
  monthlyRevenue: number;
  appointmentsThisWeek: number;
  growthRate: number;
}

interface CategoryInsightsProps {
  selectedCategoryId?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export default function CategoryInsights({ selectedCategoryId, onCategorySelect }: CategoryInsightsProps) {
  const { data: categories, loading } = useCategories();
  const [insights, setInsights] = useState<CategoryInsight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(selectedCategoryId || 'all');

  // Simular dados de insights por categoria
  useEffect(() => {
    if (categories) {
      const mockInsights: CategoryInsight[] = categories.map((category, index) => ({
        categoryId: category.id,
        categoryName: category.name,
        totalProfessionals: Math.floor(Math.random() * 10) + 1,
        totalServices: Math.floor(Math.random() * 15) + 3,
        avgRating: 4.2 + Math.random() * 0.8,
        monthlyRevenue: Math.floor(Math.random() * 50000) + 10000,
        appointmentsThisWeek: Math.floor(Math.random() * 30) + 5,
        growthRate: (Math.random() - 0.5) * 20
      }));
      setInsights(mockInsights);
    }
  }, [categories]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    onCategorySelect?.(categoryId);
  };

  const getInsightIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('saúde') || name.includes('médic')) {
      return <Calendar className="w-5 h-5 text-blue-600" />;
    }
    if (name.includes('beleza') || name.includes('estética') || name.includes('salão')) {
      return <Star className="w-5 h-5 text-pink-600" />;
    }
    if (name.includes('consultoria') || name.includes('negócios')) {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    }
    if (name.includes('educação') || name.includes('ensino')) {
      return <Users className="w-5 h-5 text-purple-600" />;
    }
    return <DollarSign className="w-5 h-5 text-gray-600" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const selectedInsight = insights.find(i => i.categoryId === selectedCategory);
  const totalInsights = {
    totalProfessionals: insights.reduce((sum, i) => sum + i.totalProfessionals, 0),
    totalServices: insights.reduce((sum, i) => sum + i.totalServices, 0),
    avgRating: insights.length > 0 ? insights.reduce((sum, i) => sum + i.avgRating, 0) / insights.length : 0,
    monthlyRevenue: insights.reduce((sum, i) => sum + i.monthlyRevenue, 0),
    appointmentsThisWeek: insights.reduce((sum, i) => sum + i.appointmentsThisWeek, 0),
    growthRate: insights.length > 0 ? insights.reduce((sum, i) => sum + i.growthRate, 0) / insights.length : 0
  };

  const displayData = selectedCategory === 'all' ? totalInsights : selectedInsight;

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Insights por Categoria
        </h3>
        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
        >
          <option value="all">Todas as categorias</option>
          {categories?.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {displayData && (
        <div className="space-y-4">
          {/* Header com ícone da categoria */}
          <div className="flex items-center space-x-3">
            {selectedCategory !== 'all' && selectedInsight && getInsightIcon(selectedInsight.categoryName)}
            <div>
              <h4 className="font-medium text-gray-900">
                {selectedCategory === 'all' ? 'Visão Geral' : selectedInsight?.categoryName}
              </h4>
              <p className="text-sm text-gray-500">
                {selectedCategory === 'all' ? 'Todas as categorias' : 'Categoria específica'}
              </p>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Profissionais</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {displayData.totalProfessionals}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Serviços</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {displayData.totalServices}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Avaliação</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {displayData.avgRating.toFixed(1)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Receita/Mês</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                R$ {displayData.monthlyRevenue.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Agend./Semana</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {displayData.appointmentsThisWeek}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Crescimento</span>
              </div>
              <p className={`text-lg font-semibold ${getGrowthColor(displayData.growthRate)}`}>
                {displayData.growthRate > 0 ? '+' : ''}{displayData.growthRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}