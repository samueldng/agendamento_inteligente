import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Bed, Calendar, Users, Settings, Stethoscope, Scissors, Briefcase, GraduationCap, Wrench, LayoutDashboard } from 'lucide-react';

export interface Sector {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

export const SECTORS: Sector[] = [
  {
    id: 'hospitality',
    name: 'Hotelaria & Motéis',
    description: 'Gestão completa para hotéis, pousadas e motéis',
    icon: '🏨',
    color: 'bg-blue-500',
    features: ['quartos', 'reservas', 'checkin', 'checkout', 'tarifas']
  },
  {
    id: 'health',
    name: 'Saúde & Medicina',
    description: 'Sistema para clínicas, consultórios e profissionais da saúde',
    icon: '🏥',
    color: 'bg-green-500',
    features: ['consultas', 'pacientes', 'prontuarios', 'especialidades']
  },
  {
    id: 'beauty',
    name: 'Beleza & Estética',
    description: 'Perfeito para salões, clínicas de estética e spas',
    icon: '💄',
    color: 'bg-pink-500',
    features: ['servicos', 'clientes', 'profissionais', 'produtos']
  },
  {
    id: 'consulting',
    name: 'Consultoria & Negócios',
    description: 'Ideal para consultores e prestadores de serviços',
    icon: '💼',
    color: 'bg-purple-500',
    features: ['reunioes', 'projetos', 'clientes', 'propostas']
  },
  {
    id: 'education',
    name: 'Educação & Ensino',
    description: 'Para escolas, cursos e professores particulares',
    icon: '📚',
    color: 'bg-yellow-500',
    features: ['aulas', 'alunos', 'turmas', 'materiais']
  },
  {
    id: 'general',
    name: 'Serviços Gerais',
    description: 'Solução flexível para qualquer tipo de agendamento',
    icon: '⚙️',
    color: 'bg-gray-500',
    features: ['agendamentos', 'clientes', 'servicos', 'relatorios']
  }
];

interface SectorContextType {
  selectedSector: Sector | null;
  setSelectedSector: (sector: Sector) => void;
  setSector: (sectorId: string) => void;
  clearSector: () => void;
  isLoading: boolean;
}

const SectorContext = createContext<SectorContextType | undefined>(undefined);

export function SectorProvider({ children }: { children: ReactNode }) {
  const [selectedSector, setSelectedSectorState] = useState<Sector | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedSectorId = localStorage.getItem('selectedSector');
    if (savedSectorId) {
      const sector = SECTORS.find(s => s.id === savedSectorId);
      if (sector) {
        setSelectedSectorState(sector);
      }
    }
    setIsLoading(false);
  }, []);

  const setSelectedSector = (sector: Sector) => {
    setSelectedSectorState(sector);
    localStorage.setItem('selectedSector', sector.id);
  };

  const setSector = (sectorId: string) => {
    const sector = SECTORS.find(s => s.id === sectorId);
    if (sector) {
      setSelectedSector(sector);
    }
  };

  const clearSector = () => {
    setSelectedSectorState(null);
    localStorage.removeItem('selectedSector');
  };

  const value = {
    selectedSector,
    setSelectedSector,
    setSector,
    clearSector,
    isLoading
  };

  return (
    <SectorContext.Provider value={value}>
      {children}
    </SectorContext.Provider>
  );
}

export function useSector() {
  const context = useContext(SectorContext);
  if (context === undefined) {
    throw new Error('useSector must be used within a SectorProvider');
  }
  return context;
}

export function useFeature(feature: string) {
  const { selectedSector } = useSector();
  return selectedSector?.features.includes(feature) ?? false;
}

export function useSectorNavigation() {
  const { selectedSector } = useSector();
  
  if (!selectedSector) return [];
  
  const navigationMap: Record<string, Array<{ name: string; href: string; icon: string }>> = {
    hospitality: [
      { name: 'Painel', href: '/hotel-dashboard', icon: '📊' },
      { name: 'Quartos', href: '/hotel-rooms', icon: '🛏️' },
      { name: 'Reservas', href: '/hotel-reservations', icon: '📅' },
      { name: 'Check-ins', href: '/hotel-checkins', icon: '🔑' },
      { name: 'Consumo', href: '/hotel-consumption', icon: '🍽️' },
      { name: 'Relatórios', href: '/reports', icon: '📈' },
      { name: 'Configurações', href: '/settings', icon: '⚙️' }
    ],
    health: [
      { name: 'Painel', href: '/health-dashboard', icon: '📊' },
      { name: 'Agenda', href: '/schedule', icon: '📅' },
      { name: 'Consultas', href: '/health-consultations', icon: '📅' },
      { name: 'Pacientes', href: '/health-patients', icon: '👥' },
      { name: 'Profissionais', href: '/professionals', icon: '👨‍⚕️' },
      { name: 'Procedimentos', href: '/health-procedures', icon: '🩺' },
      { name: 'Relatórios', href: '/reports', icon: '📈' },
      { name: 'Configurações', href: '/settings', icon: '⚙️' }
    ],
    beauty: [
      { name: 'Painel', href: '/beauty-dashboard', icon: '📊' },
      { name: 'Agenda', href: '/schedule', icon: '📅' },
      { name: 'Clientes', href: '/beauty-clients', icon: '👥' },
      { name: 'Profissionais', href: '/professionals', icon: '💅' },
      { name: 'Tratamentos', href: '/beauty-services', icon: '✨' },
      { name: 'Relatórios', href: '/reports', icon: '📈' },
      { name: 'Configurações', href: '/settings', icon: '⚙️' }
    ],
    consulting: [
      { name: 'Dashboard', href: '/dashboard', icon: '📊' },
      { name: 'Agenda', href: '/schedule', icon: '📅' },
      { name: 'Clientes', href: '/clients', icon: '👥' },
      { name: 'Consultores', href: '/professionals', icon: '👔' },
      { name: 'Serviços', href: '/services', icon: '💼' },
      { name: 'Relatórios', href: '/reports', icon: '📈' },
      { name: 'Configurações', href: '/settings', icon: '⚙️' }
    ],
    education: [
      { name: 'Dashboard', href: '/dashboard', icon: '📊' },
      { name: 'Agenda', href: '/schedule', icon: '📅' },
      { name: 'Alunos', href: '/clients', icon: '👥' },
      { name: 'Professores', href: '/professionals', icon: '👨‍🏫' },
      { name: 'Disciplinas', href: '/services', icon: '📚' },
      { name: 'Relatórios', href: '/reports', icon: '📈' },
      { name: 'Configurações', href: '/settings', icon: '⚙️' }
    ],
    general: [
      { name: 'Dashboard', href: '/dashboard', icon: '📊' },
      { name: 'Agenda', href: '/schedule', icon: '📅' },
      { name: 'Clientes', href: '/clients', icon: '👥' },
      { name: 'Profissionais', href: '/professionals', icon: '👤' },
      { name: 'Serviços', href: '/services', icon: '⚙️' },
      { name: 'Relatórios', href: '/reports', icon: '📈' },
      { name: 'Configurações', href: '/settings', icon: '⚙️' }
    ]
  };
  
  return navigationMap[selectedSector.id] || [];
}