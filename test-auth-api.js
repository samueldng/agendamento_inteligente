import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nxvzrqewfgbcwsovaaiv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dnpycWV3ZmdiY3dzb3ZhYWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MDkzNzksImV4cCI6MjA3MTM4NTM3OX0.A5nhavahrp5W_4tUGkcdpcCFGKWPv7Y6f8ZaOsQsr8Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthAndAPI() {
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
    console.log('👤 Usuário:', authData.user.email);
    console.log('🔑 Token:', authData.session.access_token.substring(0, 50) + '...');

    // Testar API /api/professionals/by-user
    console.log('\n🔍 Testando API /api/professionals/by-user...');
    
    const response = await fetch('http://localhost:3001/api/professionals/by-user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', errorText);
      return;
    }

    const responseData = await response.json();
    console.log('✅ Resposta da API:', JSON.stringify(responseData, null, 2));

    if (responseData.success && responseData.data) {
      console.log('🎯 Professional ID encontrado:', responseData.data.id);
    } else {
      console.log('⚠️ Professional ID não encontrado na resposta');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  }
}

testAuthAndAPI();