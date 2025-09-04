import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateAdminUser() {
  try {
    // Check if admin user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@hotel.com')
      .single();

    if (existingUser) {
      console.log('Admin user already exists:', existingUser);
      return;
    }

    // Create admin user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@hotel.com',
      password: 'admin123',
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('Email: admin@hotel.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAndCreateAdminUser();