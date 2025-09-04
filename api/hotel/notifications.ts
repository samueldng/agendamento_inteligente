import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { Router } from 'express';

const router = Router();

interface Notification {
  id?: string;
  user_id: string;
  type: 'reservation' | 'checkin' | 'checkout' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  data?: any;
  created_at?: string;
}

// Buscar notificações do usuário
const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { limit = 50, offset = 0 } = req.query;

    const { data: notifications, error } = await supabase
      .from('hotel_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    res.json({ notifications: notifications || [] });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Marcar notificação como lida
const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('hotel_notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Marcar todas as notificações como lidas
const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { error } = await supabase
      .from('hotel_notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar notificação
export const createNotification = async (notification: Notification) => {
  try {
    const { error } = await supabase
      .from('hotel_notifications')
      .insert([{
        user_id: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        read: false,
        data: notification.data
      }]);

    if (error) {
      console.error('Erro ao criar notificação:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return false;
  }
};

// Notificações automáticas para reservas
export const createReservationNotifications = async (reservation: any, userId: string) => {
  const checkInDate = new Date(reservation.check_in_date);
  const today = new Date();
  const timeDiff = checkInDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Notificação de nova reserva
  await createNotification({
    user_id: userId,
    type: 'reservation',
    title: 'Nova Reserva Criada',
    message: `Reserva criada para ${reservation.guest_name} - Quarto ${reservation.room_number}`,
    priority: 'medium',
    read: false,
    data: {
      reservationId: reservation.id,
      guestName: reservation.guest_name,
      roomNumber: reservation.room_number,
      checkInDate: reservation.check_in_date
    }
  });

  // Notificação de lembrete se o check-in for em 1 dia
  if (daysDiff === 1) {
    await createNotification({
      user_id: userId,
      type: 'reminder',
      title: 'Check-in Amanhã',
      message: `Check-in de ${reservation.guest_name} está previsto para amanhã`,
      priority: 'high',
      read: false,
      data: {
        reservationId: reservation.id,
        guestName: reservation.guest_name,
        roomNumber: reservation.room_number,
        checkInDate: reservation.check_in_date
      }
    });
  }

  // Notificação de lembrete se o check-in for hoje
  if (daysDiff === 0) {
    await createNotification({
      user_id: userId,
      type: 'reminder',
      title: 'Check-in Hoje',
      message: `Check-in de ${reservation.guest_name} está previsto para hoje`,
      priority: 'high',
      read: false,
      data: {
        reservationId: reservation.id,
        guestName: reservation.guest_name,
        roomNumber: reservation.room_number,
        checkInDate: reservation.check_in_date
      }
    });
  }
};

// Notificações automáticas para check-ins
export const createCheckinNotifications = async (checkin: any, userId: string) => {
  await createNotification({
    user_id: userId,
    type: 'checkin',
    title: 'Check-in Realizado',
    message: `Check-in realizado para ${checkin.guest_name} - Quarto ${checkin.room_number}`,
    priority: 'medium',
    read: false,
    data: {
      checkinId: checkin.id,
      guestName: checkin.guest_name,
      roomNumber: checkin.room_number,
      checkinDate: checkin.actual_checkin_date
    }
  });
};

// Notificações automáticas para check-outs
export const createCheckoutNotifications = async (checkout: any, userId: string) => {
  await createNotification({
    user_id: userId,
    type: 'checkout',
    title: 'Check-out Realizado',
    message: `Check-out realizado para ${checkout.guest_name} - Quarto ${checkout.room_number}`,
    priority: 'medium',
    read: false,
    data: {
      checkoutId: checkout.id,
      guestName: checkout.guest_name,
      roomNumber: checkout.room_number,
      checkoutDate: checkout.actual_checkout_date
    }
  });
};

// Verificar e criar lembretes automáticos
export const generateAutomaticReminders = async () => {
  return createAutomaticReminders();
};

export const createAutomaticReminders = async () => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar reservas com check-in amanhã
    const { data: tomorrowReservations, error: tomorrowError } = await supabase
      .from('hotel_reservations')
      .select('*, hotel_rooms(room_number)')
      .eq('status', 'confirmed')
      .gte('check_in_date', tomorrow.toISOString().split('T')[0])
      .lt('check_in_date', new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (!tomorrowError && tomorrowReservations) {
      for (const reservation of tomorrowReservations) {
        await createNotification({
          user_id: reservation.professional_id,
          type: 'reminder',
          title: 'Check-in Amanhã',
          message: `Check-in de ${reservation.guest_name} está previsto para amanhã`,
          priority: 'high',
          read: false,
          data: {
            reservationId: reservation.id,
            guestName: reservation.guest_name,
            roomNumber: reservation.hotel_rooms?.room_number,
            checkInDate: reservation.check_in_date
          }
        });
      }
    }

    // Buscar check-outs pendentes para hoje
    const { data: todayCheckouts, error: todayError } = await supabase
      .from('hotel_checkins')
      .select('*, hotel_reservations(guest_name, check_out_date, hotel_rooms(room_number))')
      .is('actual_checkout_date', null)
      .lte('hotel_reservations.check_out_date', today.toISOString().split('T')[0]);

    if (!todayError && todayCheckouts) {
      for (const checkout of todayCheckouts) {
        await createNotification({
          user_id: checkout.professional_id,
          type: 'reminder',
          title: 'Check-out Pendente',
          message: `Check-out de ${checkout.hotel_reservations?.guest_name} está pendente`,
          priority: 'high',
          read: false,
          data: {
            checkinId: checkout.id,
            guestName: checkout.hotel_reservations?.guest_name,
            roomNumber: checkout.hotel_reservations?.hotel_rooms?.room_number,
            checkoutDate: checkout.hotel_reservations?.check_out_date
          }
        });
      }
    }
  } catch (error) {
    console.error('Erro ao criar lembretes automáticos:', error);
  }
};

// Rotas
router.get('/', authenticateToken, getNotifications);
router.patch('/:id/read', authenticateToken, markAsRead);
router.patch('/mark-all-read', authenticateToken, markAllAsRead);

export default router;