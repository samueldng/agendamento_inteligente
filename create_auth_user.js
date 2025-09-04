import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nxvzrqewfgbcwsovaaiv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dnpycWV3ZmdiY3dzb3ZhYWl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgwOTM3OSwiZXhwIjoyMDcxMzg1Mzc5fQ.LuX_HdgFsyd6lqjfq-gmkbv-tWDMsty6UTtvjS-b7-M';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser() {
  try {
    console.log('Criando usuário admin@hotel.com...');
    
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

    console.log('Usuário criado com sucesso:', data.user);
    console.log('ID do usuário:', data.user.id);
    
    // Atualizar o user_id na tabela users
    const { error: updateError } = await supabase
      .from('users')
      .update({ id: data.user.id })
      .eq('email', 'admin@hotel.com');
      
    if (updateError) {
      console.error('Erro ao atualizar tabela users:', updateError);
    } else {
      console.log('Tabela users atualizada com sucesso');
    }
    
    // Atualizar o user_id na tabela professionals
    const { error: updateProfError } = await supabase
      .from('professionals')
      .update({ user_id: data.user.id })
      .eq('email', 'admin@hotel.com');
      
    if (updateProfError) {
      console.error('Erro ao atualizar tabela professionals:', updateProfError);
    } else {
      console.log('Tabela professionals atualizada com sucesso');
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

createUser();