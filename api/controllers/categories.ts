import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import { ApiResponse, BusinessCategory, FieldConfig, ServiceTemplate } from '../types';

// Listar todas as categorias
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('business_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: categories
    } as ApiResponse<BusinessCategory[]>);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Buscar categoria por ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: category, error } = await supabaseAdmin
      .from('business_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar categoria:', error);
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: category
    } as ApiResponse<BusinessCategory>);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Criar nova categoria (apenas admin)
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      icon,
      color,
      fields_config,
      service_templates
    } = req.body;

    // Validar dados obrigatórios
    if (!name || !description || !icon || !color) {
      return res.status(400).json({
        success: false,
        error: 'Nome, descrição, ícone e cor são obrigatórios'
      } as ApiResponse);
    }

    // Validar configuração de campos
    if (fields_config && !Array.isArray(fields_config)) {
      return res.status(400).json({
        success: false,
        error: 'Configuração de campos deve ser um array'
      } as ApiResponse);
    }

    // Validar templates de serviço
    if (service_templates && !Array.isArray(service_templates)) {
      return res.status(400).json({
        success: false,
        error: 'Templates de serviço devem ser um array'
      } as ApiResponse);
    }

    const { data: category, error } = await supabaseAdmin
      .from('business_categories')
      .insert({
        name,
        description,
        icon,
        color,
        fields_config: fields_config || [],
        service_templates: service_templates || [],
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar categoria:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar categoria'
      } as ApiResponse);
    }

    res.status(201).json({
      success: true,
      data: category,
      message: 'Categoria criada com sucesso'
    } as ApiResponse<BusinessCategory>);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Atualizar categoria (apenas admin)
export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      icon,
      color,
      fields_config,
      service_templates,
      is_active
    } = req.body;

    const updateData: Partial<BusinessCategory> = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (fields_config !== undefined) updateData.fields_config = fields_config;
    if (service_templates !== undefined) updateData.service_templates = service_templates;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: category, error } = await supabaseAdmin
      .from('business_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar categoria:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao atualizar categoria'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: category,
      message: 'Categoria atualizada com sucesso'
    } as ApiResponse<BusinessCategory>);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Deletar categoria (apenas admin)
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se existem profissionais usando esta categoria
    const { data: professionals, error: profError } = await supabaseAdmin
      .from('professionals')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (profError) {
      console.error('Erro ao verificar profissionais:', profError);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    if (professionals && professionals.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível deletar categoria com profissionais associados'
      } as ApiResponse);
    }

    const { error } = await supabaseAdmin
      .from('business_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar categoria:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao deletar categoria'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Categoria deletada com sucesso'
    } as ApiResponse);
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};

// Buscar estatísticas por categoria
export const getCategoryStats = async (req: Request, res: Response) => {
  try {
    const { data: stats, error } = await supabaseAdmin
      .rpc('get_category_stats');

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: stats
    } as ApiResponse);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    } as ApiResponse);
  }
};