import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  Users,
  UserCheck,
  Settings,
  BarChart3,
  Menu,
  X,
  MessageSquare,
  Clock,
  Home,
  Package,
  Bed,
  CalendarCheck,
  LogIn,
  Bell
} from 'lucide-react';
import { useSector, useSectorNavigation } from '../hooks/useSector.tsx';
import HotelNotifications from '../components/hotel/HotelNotifications';
import { useNotifications } from '../hooks/useNotifications';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
}

// Mapeamento de ícones para componentes React
const iconMap: Record<string, ReactNode> = {
  '📊': <BarChart3 className="w-5 h-5" />,
  '📅': <Calendar className="w-5 h-5" />,
  '👥': <Users className="w-5 h-5" />,
  '👨‍⚕️': <UserCheck className="w-5 h-5" />,
  '💅': <UserCheck className="w-5 h-5" />,
  '👔': <UserCheck className="w-5 h-5" />,
  '👨‍🏫': <UserCheck className="w-5 h-5" />,
  '👤': <UserCheck className="w-5 h-5" />,
  '🩺': <Clock className="w-5 h-5" />,
  '✨': <Clock className="w-5 h-5" />,
  '💼': <Clock className="w-5 h-5" />,
  '📚': <Clock className="w-5 h-5" />,
  '⚙️': <Settings className="w-5 h-5" />,
  '🛏️': <Bed className="w-5 h-5" />,
  '🔑': <LogIn className="w-5 h-5" />,
  '🍽️': <Package className="w-5 h-5" />,
  '📈': <BarChart3 className="w-5 h-5" />,
};

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const { selectedSector } = useSector();
  const navigation = useSectorNavigation();
  
  // Verificar se estamos no setor hoteleiro
  const isHotelSector = selectedSector?.name === 'Hotel' || location.pathname.startsWith('/hotel');
  
  // Hook de notificações apenas para o setor hoteleiro
  const { unreadCount } = useNotifications();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${
        sidebarOpen ? 'block' : 'hidden'
      }`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex h-16 items-center px-4">
            <div className="text-2xl mr-2">{selectedSector?.icon || '⚙️'}</div>
            <div>
              <div className="text-lg font-bold text-gray-900">Sis IA Go</div>
              <div className="text-xs text-gray-500">{selectedSector?.name}</div>
            </div>
          </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {iconMap[item.icon] || <Settings className="w-5 h-5" />}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <div className="text-2xl mr-2">{selectedSector?.icon || '⚙️'}</div>
            <div>
              <div className="text-lg font-bold text-gray-900">Sis IA Go</div>
              <div className="text-xs text-gray-500">{selectedSector?.name}</div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {iconMap[item.icon] || <Settings className="w-5 h-5" />}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {isHotelSector && (
                <button
                  onClick={() => setNotificationsOpen(true)}
                  className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-medium text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              )}
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Sistema Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      
      {/* Hotel Notifications Modal */}
      {isHotelSector && (
        <HotelNotifications 
          isOpen={notificationsOpen} 
          onClose={() => setNotificationsOpen(false)} 
        />
      )}
    </div>
  );
}