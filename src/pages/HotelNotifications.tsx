import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, Clock, AlertTriangle, Calendar, Users, Bed, Mail, Phone, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  type: 'reservation' | 'checkin' | 'checkout' | 'payment' | 'maintenance' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  actionRequired?: boolean;
}

interface NotificationStats {
  total: number;
  unread: number;
  urgent: number;
  today: number;
}

const HotelNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    urgent: 0,
    today: 0
  });
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent' | 'today'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    // Configurar polling para atualizações em tempo real
    const interval = setInterval(loadNotifications, 30000); // 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Carregar reservas para gerar notificações
      const reservationsResponse = await fetch('/api/hotel-reservations');
      const reservationsData = await reservationsResponse.json();
      
      // Carregar dados de check-ins
      const checkinsResponse = await fetch('/api/hotel-checkins');
      const checkinsData = await checkinsResponse.json();
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const generatedNotifications: Notification[] = [];
      
      // Gerar notificações de reservas para hoje
      const todayReservations = reservationsData.filter((reservation: any) => {
        const checkInDate = new Date(reservation.checkInDate);
        return checkInDate.toDateString() === today.toDateString() && reservation.status === 'confirmed';
      });
      
      todayReservations.forEach((reservation: any) => {
        generatedNotifications.push({
          id: `reservation-${reservation.id}`,
          type: 'reservation',
          title: 'Check-in Hoje',
          message: `Hóspede ${reservation.guestName} tem check-in previsto para hoje.`,
          priority: 'medium',
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: reservation.id,
          actionRequired: true
        });
      });
      
      // Gerar notificações de check-out para hoje
      const todayCheckouts = reservationsData.filter((reservation: any) => {
        const checkOutDate = new Date(reservation.checkOutDate);
        return checkOutDate.toDateString() === today.toDateString() && reservation.status === 'confirmed';
      });
      
      todayCheckouts.forEach((reservation: any) => {
        generatedNotifications.push({
          id: `checkout-${reservation.id}`,
          type: 'checkout',
          title: 'Check-out Hoje',
          message: `Hóspede ${reservation.guestName} tem check-out previsto para hoje.`,
          priority: 'medium',
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: reservation.id,
          actionRequired: true
        });
      });
      
      // Gerar notificações de reservas para amanhã
      const tomorrowReservations = reservationsData.filter((reservation: any) => {
        const checkInDate = new Date(reservation.checkInDate);
        return checkInDate.toDateString() === tomorrow.toDateString() && reservation.status === 'confirmed';
      });
      
      tomorrowReservations.forEach((reservation: any) => {
        generatedNotifications.push({
          id: `reservation-tomorrow-${reservation.id}`,
          type: 'reservation',
          title: 'Check-in Amanhã',
          message: `Hóspede ${reservation.guestName} tem check-in previsto para amanhã.`,
          priority: 'low',
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: reservation.id,
          actionRequired: false
        });
      });
      
      // Gerar notificações de reservas pendentes
      const pendingReservations = reservationsData.filter((reservation: any) => reservation.status === 'pending');
      
      pendingReservations.forEach((reservation: any) => {
        generatedNotifications.push({
          id: `pending-${reservation.id}`,
          type: 'payment',
          title: 'Reserva Pendente',
          message: `Reserva de ${reservation.guestName} aguarda confirmação de pagamento.`,
          priority: 'high',
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: reservation.id,
          actionRequired: true
        });
      });
      
      // Gerar notificações de reservas vencidas (check-in não realizado)
      const overdueReservations = reservationsData.filter((reservation: any) => {
        const checkInDate = new Date(reservation.checkInDate);
        const checkIn = checkinsData.find((checkin: any) => checkin.reservationId === reservation.id);
        return checkInDate < today && reservation.status === 'confirmed' && !checkIn;
      });
      
      overdueReservations.forEach((reservation: any) => {
        generatedNotifications.push({
          id: `overdue-${reservation.id}`,
          type: 'system',
          title: 'Check-in Não Realizado',
          message: `Hóspede ${reservation.guestName} não realizou check-in na data prevista.`,
          priority: 'urgent',
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: reservation.id,
          actionRequired: true
        });
      });
      
      // Adicionar algumas notificações de sistema
      generatedNotifications.push(
        {
          id: 'system-1',
          type: 'system',
          title: 'Sistema Atualizado',
          message: 'O sistema foi atualizado com novas funcionalidades.',
          priority: 'low',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
          actionRequired: false
        },
        {
          id: 'system-2',
          type: 'maintenance',
          title: 'Manutenção Programada',
          message: 'Manutenção do sistema programada para este fim de semana.',
          priority: 'medium',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
          actionRequired: false
        }
      );
      
      // Ordenar por data (mais recentes primeiro)
      const sortedNotifications = generatedNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setNotifications(sortedNotifications);
      
      // Calcular estatísticas
      const unreadCount = sortedNotifications.filter(n => !n.isRead).length;
      const urgentCount = sortedNotifications.filter(n => n.priority === 'urgent').length;
      const todayCount = sortedNotifications.filter(n => {
        const notificationDate = new Date(n.createdAt);
        return notificationDate.toDateString() === today.toDateString();
      }).length;
      
      setStats({
        total: sortedNotifications.length,
        unread: unreadCount,
        urgent: urgentCount,
        today: todayCount
      });
      
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      // Fallback para dados simulados
      setNotifications([]);
      setStats({ total: 0, unread: 0, urgent: 0, today: 0 });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    
    // Atualizar estatísticas
    setStats(prev => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1)
    }));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setStats(prev => ({ ...prev, unread: 0 }));
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'urgent':
        return notifications.filter(n => n.priority === 'urgent');
      case 'today':
        const today = new Date();
        return notifications.filter(n => {
          const notificationDate = new Date(n.createdAt);
          return notificationDate.toDateString() === today.toDateString();
        });
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reservation':
        return <Calendar className="h-5 w-5" />;
      case 'checkin':
        return <Users className="h-5 w-5" />;
      case 'checkout':
        return <Bed className="h-5 w-5" />;
      case 'payment':
        return <AlertTriangle className="h-5 w-5" />;
      case 'maintenance':
        return <Clock className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgente</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">Alta</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Baixa</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Agora mesmo';
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-600 mt-1">Central de alertas e avisos do hotel</p>
        </div>
        <div className="flex gap-3">
          {stats.unread > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.unread}</div>
                <div className="text-sm text-gray-600">Não lidas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.urgent}</div>
                <div className="text-sm text-gray-600">Urgentes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.today}</div>
                <div className="text-sm text-gray-600">Hoje</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Todas ({stats.total})
        </Button>
        <Button 
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
        >
          Não lidas ({stats.unread})
        </Button>
        <Button 
          variant={filter === 'urgent' ? 'default' : 'outline'}
          onClick={() => setFilter('urgent')}
        >
          Urgentes ({stats.urgent})
        </Button>
        <Button 
          variant={filter === 'today' ? 'default' : 'outline'}
          onClick={() => setFilter('today')}
        >
          Hoje ({stats.today})
        </Button>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação</h3>
              <p className="text-gray-600">Não há notificações para exibir no filtro selecionado.</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer transition-colors ${
                !notification.isRead ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    notification.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                    notification.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                    notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-medium ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(notification.priority)}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {formatDate(notification.createdAt)}
                      </span>
                      
                      {notification.actionRequired && (
                        <Badge variant="outline" className="text-xs">
                          Ação necessária
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default HotelNotifications;