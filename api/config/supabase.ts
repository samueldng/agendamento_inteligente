import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente com service role para operações administrativas
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente com anon key para operações do frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;