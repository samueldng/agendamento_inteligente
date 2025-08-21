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

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Configuração de JWT não encontrada' });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Verificar se o usuário ainda existe no banco
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;
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