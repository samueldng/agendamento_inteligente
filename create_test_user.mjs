// Script para criar usuário de teste no Supabase Auth
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  try {
    console.log('Criando usuário de teste...');
    
    // Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@hotel.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador Hotel'
      }
    });

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return;
    }

    console.log('Usuário criado com sucesso!');
    console.log('Email: admin@hotel.com');
    console.log('Senha: 123456');
    console.log('ID do usuário:', data.user.id);
    
    // Atualizar o usuário na tabela users se necessário
    const { error: updateError } = await supabase
      .from('users')
      .upsert({
        id: data.user.id,
        email: 'admin@hotel.com',
        name: 'Administrador Hotel',
        role: 'professional'
      });
    
    if (updateError) {
      console.error('Erro ao atualizar tabela users:', updateError);
    } else {
      console.log('Usuário atualizado na tabela users');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

createTestUser();