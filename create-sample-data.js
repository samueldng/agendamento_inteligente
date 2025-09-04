import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nxvzrqewfgbcwsovaaiv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dnpycWV3ZmdiY3dzb3ZhYWl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgwOTM3OSwiZXhwIjoyMDcxMzg1Mzc5fQ.LuX_HdgFsyd6lqjfq-gmkbv-tWDMsty6UTtvjS-b7-M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSampleData() {
  try {
    console.log('🏨 Criando dados de exemplo para o hotel...');
    
    const professionalId = 'b47ac10b-58cc-4372-a567-0e02b2c3d481';
    
    // Criar quartos de exemplo
    console.log('🛏️ Criando quartos...');
    
    const rooms = [
      {
        professional_id: professionalId,
        room_number: '101',
        room_type: 'Standard',
        capacity: 2,
        base_price: 150.00,
        amenities: ['Wi-Fi', 'TV', 'Ar Condicionado'],
        description: 'Quarto standard com vista para o jardim'
      },
      {
        professional_id: professionalId,
        room_number: '102',
        room_type: 'Standard',
        capacity: 2,
        base_price: 150.00,
        amenities: ['Wi-Fi', 'TV', 'Ar Condicionado'],
        description: 'Quarto standard confortável'
      },
      {
        professional_id: professionalId,
        room_number: '201',
        room_type: 'Deluxe',
        capacity: 3,
        base_price: 250.00,
        amenities: ['Wi-Fi', 'TV', 'Ar Condicionado', 'Frigobar', 'Varanda'],
        description: 'Quarto deluxe com varanda e vista panorâmica'
      },
      {
        professional_id: professionalId,
        room_number: '301',
        room_type: 'Suite',
        capacity: 4,
        base_price: 400.00,
        amenities: ['Wi-Fi', 'TV', 'Ar Condicionado', 'Frigobar', 'Varanda', 'Jacuzzi'],
        description: 'Suíte luxuosa com jacuzzi e sala de estar'
      },
      {
        professional_id: professionalId,
        room_number: '302',
        room_type: 'Suite',
        capacity: 4,
        base_price: 400.00,
        amenities: ['Wi-Fi', 'TV', 'Ar Condicionado', 'Frigobar', 'Varanda', 'Jacuzzi'],
        description: 'Suíte luxuosa com jacuzzi e sala de estar'
      }
    ];
    
    const { data: roomsData, error: roomsError } = await supabase
      .from('hotel_rooms')
      .insert(rooms)
      .select();
    
    if (roomsError) {
      console.error('❌ Erro ao criar quartos:', roomsError.message);
    } else {
      console.log('✅ Quartos criados:', roomsData.length);
    }
    
    // Criar algumas reservas de exemplo
    console.log('📋 Criando reservas...');
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const reservations = [
      {
        room_id: roomsData[4].id, // Suite
        guest_name: 'João Silva',
        guest_email: 'joao@email.com',
        guest_phone: '(11) 99999-1111',
        num_guests: 2,
        check_in_date: today.toISOString().split('T')[0],
        check_out_date: tomorrow.toISOString().split('T')[0],
        total_amount: 400.00,
        status: 'checked_in',
        special_requests: 'Hóspede VIP'
      },
      {
        room_id: roomsData[2].id, // Deluxe
        guest_name: 'Maria Santos',
        guest_email: 'maria@email.com',
        guest_phone: '(11) 99999-2222',
        num_guests: 2,
        check_in_date: tomorrow.toISOString().split('T')[0],
        check_out_date: nextWeek.toISOString().split('T')[0],
        total_amount: 1500.00,
        status: 'confirmed',
        special_requests: 'Reserva para lua de mel'
      }
    ];
    
    const { data: reservationsData, error: reservationsError } = await supabase
      .from('hotel_reservations')
      .insert(reservations)
      .select();
    
    if (reservationsError) {
      console.error('❌ Erro ao criar reservas:', reservationsError.message);
    } else {
      console.log('✅ Reservas criadas:', reservationsData.length);
    }
    
    // Criar check-in para a reserva ativa
    console.log('🔑 Criando check-in...');
    
    const checkin = {
      reservation_id: reservationsData[0].id,
      check_in_datetime: today.toISOString(),
      actual_guests: 2,
      room_condition_checkin: 'excellent',
      staff_notes: 'Check-in realizado com sucesso'
    };
    
    const { data: checkinData, error: checkinError } = await supabase
      .from('hotel_checkins')
      .insert(checkin)
      .select();
    
    if (checkinError) {
      console.error('❌ Erro ao criar check-in:', checkinError.message);
    } else {
      console.log('✅ Check-in criado:', checkinData.length);
    }
    
    // Criar itens de consumo
    console.log('🍽️ Criando itens de consumo...');
    
    const consumptionItems = [
      {
        professional_id: professionalId,
        name: 'Água Mineral',
        category: 'minibar',
        price: 5.00,
        description: 'Água mineral 500ml'
      },
      {
        professional_id: professionalId,
        name: 'Refrigerante',
        category: 'minibar',
        price: 8.00,
        description: 'Refrigerante lata 350ml'
      },
      {
        professional_id: professionalId,
        name: 'Sanduíche Natural',
        category: 'room_service',
        price: 15.00,
        description: 'Sanduíche natural de frango'
      },
      {
        professional_id: professionalId,
        name: 'Café da Manhã',
        category: 'room_service',
        price: 35.00,
        description: 'Café da manhã completo no quarto'
      }
    ];
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('hotel_consumption_items')
      .insert(consumptionItems)
      .select();
    
    if (itemsError) {
      console.error('❌ Erro ao criar itens:', itemsError.message);
    } else {
      console.log('✅ Itens de consumo criados:', itemsData.length);
    }
    
    // Criar consumo para a reserva ativa
    console.log('🛒 Criando consumo...');
    
    const consumption = [
      {
        reservation_id: reservationsData[0].id,
        item_id: itemsData[0].id,
        quantity: 2,
        unit_price: 5.00,
        total_price: 10.00,
        consumed_at: today.toISOString()
      },
      {
        reservation_id: reservationsData[0].id,
        item_id: itemsData[3].id,
        quantity: 1,
        unit_price: 35.00,
        total_price: 35.00,
        consumed_at: today.toISOString()
      }
    ];
    
    const { data: consumptionData, error: consumptionError } = await supabase
      .from('hotel_consumption')
      .insert(consumption)
      .select();
    
    if (consumptionError) {
      console.error('❌ Erro ao criar consumo:', consumptionError.message);
    } else {
      console.log('✅ Consumo criado:', consumptionData.length);
    }
    
    console.log('🎉 Dados de exemplo criados com sucesso!');
    console.log('📊 Resumo:');
    console.log(`- ${roomsData?.length || 0} quartos`);
    console.log(`- ${reservationsData?.length || 0} reservas`);
    console.log(`- ${checkinData?.length || 0} check-ins`);
    console.log(`- ${itemsData?.length || 0} itens de consumo`);
    console.log(`- ${consumptionData?.length || 0} registros de consumo`);
    
  } catch (error) {
    console.error('💥 Erro ao criar dados de exemplo:', error.message);
  }
}

createSampleData();