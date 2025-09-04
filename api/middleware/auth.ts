import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token de acesso requerido' });
    }

    // Verificar o token com o Supabase
    const { data: { user: supabaseUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !supabaseUser) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Buscar dados adicionais do// Buscar usuário na tabela users por ID ou email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .or(`id.eq.${supabaseUser.id},email.eq.${supabaseUser.email}`)
      .single();

    // Se o usuário não existe na tabela users, criar um registro básico
    if (!user) {
      const { data: insertedUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
          role: 'professional'
        })
        .select('id, email, role')
        .single();
      
      if (insertError) {
        console.error('Erro ao criar usuário:', insertError);
        // Se o erro for de duplicação, tentar buscar o usuário novamente
        if (insertError.code === '23505') {
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id, email, role')
            .eq('id', supabaseUser.id)
            .single();
          
          if (existingUser) {
            req.user = existingUser;
          } else {
            // Fallback: usar dados do Supabase Auth
            req.user = {
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              role: 'professional'
            };
          }
        } else {
          // Fallback: usar dados do Supabase Auth
          req.user = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            role: 'professional'
          };
        }
      } else {
        req.user = insertedUser;
      }
    } else {
      req.user = user;
    }

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Privilégios de administrador requeridos.' });
  }

  next();
};