import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testApiFlow() {
  try {
    console.log('🔐 Fazendo login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@hotel.com',
      password: 'admin123'
    });
    
    if (authError) {
      console.error('❌ Erro no login:', authError);
      return;
    }
    
    console.log('✅ Login realizado com sucesso');
    console.log('👤 User ID:', authData.user.id);
    console.log('📧 Email:', authData.user.email);
    console.log('🎫 Token presente:', authData.session.access_token ? 'SIM' : 'NÃO');
    
    // Testar a API
    console.log('\n🚀 Testando API /api/professionals/by-user...');
    const response = await fetch('http://localhost:3001/api/professionals/by-user', {
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Status:', response.status);
    console.log('📡 OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados recebidos:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Erro:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testApiFlow();