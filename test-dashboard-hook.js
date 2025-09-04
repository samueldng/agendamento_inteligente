import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuração do Supabase
const supabaseUrl = 'https://nxvzrqewfgbcwsovaaiv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dnpycWV3ZmdiY3dzb3ZhYWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MDkzNzksImV4cCI6MjA3MTM4NTM3OX0.A5nhavahrp5W_4tUGkcdpcCFGKWPv7Y6f8ZaOsQsr8Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDashboardHook() {
  try {
    console.log('🔐 Fazendo login...');
    
    // Login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@hotel.com',
      password: 'admin123'
    });
    
    if (authError) {
      console.error('❌ Erro no login:', authError.message);
      return;
    }
    
    console.log('✅ Login realizado com sucesso');
    console.log('👤 Usuário ID:', authData.user.id);
    
    // Buscar profissional
    console.log('🔍 Buscando profissional...');
    
    const response = await fetch('http://localhost:3001/api/professionals/by-user', {
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Erro na API:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Resposta:', errorText);
      return;
    }
    
    const professionalData = await response.json();
    console.log('✅ Profissional encontrado:', professionalData);
    
    if (!professionalData.success || !professionalData.data) {
      console.error('❌ Dados do profissional inválidos');
      return;
    }
    
    const professionalId = professionalData.data.id;
    console.log('🆔 Professional ID:', professionalId);
    
    // Testar dashboard data
    console.log('📊 Testando dados do dashboard...');
    
    // Simular o que o hotelDashboardService.getDashboardData faz
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    console.log('📅 Período:', startDate, 'até', today);
    
    // Buscar quartos
    console.log('🏨 Buscando quartos...');
    const { data: rooms, error: roomsError } = await supabase
      .from('hotel_rooms')
      .select('*')
      .eq('professional_id', professionalId);
    
    if (roomsError) {
      console.error('❌ Erro ao buscar quartos:', roomsError.message);
    } else {
      console.log('✅ Quartos encontrados:', rooms.length);
    }
    
    // Buscar reservas
    console.log('📋 Buscando reservas...');
    const { data: reservations, error: reservationsError } = await supabase
      .from('hotel_reservations')
      .select(`
        *,
        hotel_rooms!inner(
          id,
          room_number,
          room_type,
          professional_id
        )
      `)
      .eq('hotel_rooms.professional_id', professionalId)
      .gte('check_in_date', startDate)
      .lte('check_out_date', today);
    
    if (reservationsError) {
      console.error('❌ Erro ao buscar reservas:', reservationsError.message);
    } else {
      console.log('✅ Reservas encontradas:', reservations.length);
    }
    
    console.log('🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('💥 Erro no teste:', error.message);
  }
}

testDashboardHook();