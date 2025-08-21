import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, User } from '../types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name, phone, role } = req.body;

    // Verificar se o usuário já existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe com este email' });
    }

    // Criar usuário
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        name,
        phone,
        role
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const response: ApiResponse<User> = {
      success: true,
      data: user
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = (page - 1) * limit;

    const { data: users, error, count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    const response = {
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const response: ApiResponse<User> = {
      success: true,
      data: user
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, role } = req.body;

    // Verificar se o usuário pode atualizar este perfil
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const updateData: any = { name, phone };
    
    // Apenas admins podem alterar roles
    if (req.user?.role === 'admin' && role) {
      updateData.role = role;
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const response: ApiResponse<User> = {
      success: true,
      data: user
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Apenas admins podem deletar usuários
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }

    res.json({ success: true, message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const response: ApiResponse<User> = {
      success: true,
      data: user
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};