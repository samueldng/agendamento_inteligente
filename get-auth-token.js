import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getAuthToken() {
  try {
    // Sign in with admin credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@hotel.com',
      password: 'admin123'
    });

    if (error) {
      console.error('Login error:', error);
      return;
    }

    if (data.session) {
      console.log('Login successful!');
      console.log('Access Token:', data.session.access_token);
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

getAuthToken();