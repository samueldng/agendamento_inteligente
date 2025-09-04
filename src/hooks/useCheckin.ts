import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { HotelCheckinFormData } from '../lib/validations';
import { toast } from 'sonner';

interface CheckinData {
  id: string;
  reservation_id: string;
  checkin_datetime: string | null;
  checkout_datetime: string | null;
  actual_guests: number | null;
  checkin_notes: string | null;
  checkout_notes: string | null;
  room_condition_checkin: string | null;
  room_condition_checkout: string | null;
  damages_reported: string | null;
  additional_charges: number | null;
  payment_method: string | null;
  staff_checkin: string | null;
  staff_checkout: string | null;
  created_at: string;
  updated_at: string;
}

interface ReservationWithRoom {
  id: string;
  guest_name: string;
  guest_document: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  num_guests: number;
  check_in_date: string;
  check_out_date: string;
  total_amount: number | null;
  status: string;
  hotel_rooms: {
    id: string;
    room_number: string;
    room_type: string;
    capacity: number;
  };
}

export function useCheckin() {
  const [checkins, setCheckins] = useState<CheckinData[]>([]);
  const [reservations, setReservations] = useState<ReservationWithRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar todas as reservas disponíveis para check-in
  const fetchAvailableReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('hotel_reservations')
        .select(`
          *,
          hotel_rooms (
            id,
            room_number,
            room_type,
            capacity
          )
        `)
        .in('status', ['confirmed', 'checked_in'])
        .order('check_in_date', { ascending: true });

      if (error) throw error;

      setReservations(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar reservas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar todos os check-ins
  const fetchCheckins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('hotel_checkins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCheckins(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar check-ins';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Realizar check-in
  const performCheckin = useCallback(async (data: HotelCheckinFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Inserir registro de check-in
      const { data: checkinData, error: checkinError } = await supabase
        .from('hotel_checkins')
        .insert({
          reservation_id: data.reservation_id,
          checkin_datetime: data.checkin_datetime || new Date().toISOString(),
          actual_guests: data.actual_guests,
          checkin_notes: data.checkin_notes,
          room_condition_checkin: data.room_condition_checkin,
          payment_method: data.payment_method,
          staff_checkin: data.staff_checkin,
        })
        .select()
        .single();

      if (checkinError) throw checkinError;

      // Atualizar status da reserva para 'checked_in'
      const { error: reservationError } = await supabase
        .from('hotel_reservations')
        .update({ status: 'checked_in' })
        .eq('id', data.reservation_id);

      if (reservationError) throw reservationError;

      // Atualizar status do quarto para 'occupied'
      const { data: reservation } = await supabase
        .from('hotel_reservations')
        .select('room_id')
        .eq('id', data.reservation_id)
        .single();

      if (reservation) {
        await supabase
          .from('hotel_rooms')
          .update({ status: 'occupied' })
          .eq('id', reservation.room_id);
      }

      toast.success('Check-in realizado com sucesso!');
      await fetchCheckins();
      await fetchAvailableReservations();
      
      return checkinData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao realizar check-in';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCheckins, fetchAvailableReservations]);

  // Realizar check-out
  const performCheckout = useCallback(async (checkinId: string, data: Partial<HotelCheckinFormData>) => {
    try {
      setLoading(true);
      setError(null);

      // Atualizar registro de check-in com dados de check-out
      const { data: checkinData, error: checkinError } = await supabase
        .from('hotel_checkins')
        .update({
          checkout_datetime: data.checkout_datetime || new Date().toISOString(),
          checkout_notes: data.checkout_notes,
          room_condition_checkout: data.room_condition_checkout,
          damages_reported: data.damages_reported,
          additional_charges: data.additional_charges,
          staff_checkout: data.staff_checkout,
        })
        .eq('id', checkinId)
        .select()
        .single();

      if (checkinError) throw checkinError;

      // Atualizar status da reserva para 'checked_out'
      const { error: reservationError } = await supabase
        .from('hotel_reservations')
        .update({ status: 'checked_out' })
        .eq('id', checkinData.reservation_id);

      if (reservationError) throw reservationError;

      // Atualizar status do quarto para 'cleaning'
      const { data: reservation } = await supabase
        .from('hotel_reservations')
        .select('room_id')
        .eq('id', checkinData.reservation_id)
        .single();

      if (reservation) {
        await supabase
          .from('hotel_rooms')
          .update({ status: 'cleaning' })
          .eq('id', reservation.room_id);
      }

      toast.success('Check-out realizado com sucesso!');
      await fetchCheckins();
      await fetchAvailableReservations();
      
      return checkinData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao realizar check-out';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCheckins, fetchAvailableReservations]);

  // Buscar check-in por ID
  const getCheckinById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('hotel_checkins')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar check-in';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar check-in por reserva
  const getCheckinByReservation = useCallback(async (reservationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('hotel_checkins')
        .select('*')
        .eq('reservation_id', reservationId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar check-in';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkins,
    reservations,
    loading,
    error,
    fetchAvailableReservations,
    fetchCheckins,
    performCheckin,
    performCheckout,
    getCheckinById,
    getCheckinByReservation,
  };
}