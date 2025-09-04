import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://nxvzrqewfgbcwsovaaiv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54dnpycWV3ZmdiY3dzb3ZhYWl2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTgwOTM3OSwiZXhwIjoyMDcxMzg1Mzc5fQ.LuX_HdgFsyd6lqjfq-gmkbv-tWDMsty6UTtvjS-b7-M';

// Cliente Supabase com service role para operações administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('Criando usuário administrador...');
    
    // Criar usuário admin
    const { data: user, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@hotel.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        name: 'Administrador',
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário:', authError.message);
      return;
    }

    console.log('Usuário administrador criado com sucesso!');
    console.log('Email: admin@hotel.com');
    console.log('Senha: admin123');
    console.log('ID do usuário:', user.user.id);
    
    // Verificar se existe tabela de perfis de usuário
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.log('Tabela profiles não encontrada ou erro:', profileError.message);
    } else if (!profiles) {
      // Criar perfil do admin se a tabela existir
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.user.id,
          name: 'Administrador',
          email: 'admin@hotel.com',
          role: 'admin',
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.log('Erro ao criar perfil:', insertError.message);
      } else {
        console.log('Perfil do administrador criado com sucesso!');
      }
    }

  } catch (error) {
    console.error('Erro geral:', error.message);
  }
}

// Executar a função
createAdminUser();