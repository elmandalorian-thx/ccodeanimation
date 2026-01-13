import { supabase } from './supabaseClient';
import { ToolResult, ToolResultInput, ToolType } from '../types/database';

/**
 * Fetch all tool results for a specific brand and tool type
 */
export async function fetchToolResults(
  brandId: string,
  toolType?: ToolType
): Promise<ToolResult[]> {
  let query = supabase
    .from('tool_results')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });

  if (toolType) {
    query = query.eq('tool_type', toolType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tool results:', error);
    throw new Error(`Failed to fetch tool results: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch a single tool result by ID
 */
export async function fetchToolResultById(id: string): Promise<ToolResult | null> {
  const { data, error } = await supabase
    .from('tool_results')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching tool result:', error);
    throw new Error(`Failed to fetch tool result: ${error.message}`);
  }

  return data;
}

/**
 * Save a new tool result
 */
export async function saveToolResult(input: ToolResultInput): Promise<ToolResult> {
  const { data, error } = await supabase
    .from('tool_results')
    .insert([input])
    .select()
    .single();

  if (error) {
    console.error('Error saving tool result:', error);
    throw new Error(`Failed to save tool result: ${error.message}`);
  }

  return data;
}

/**
 * Delete a tool result by ID
 */
export async function deleteToolResult(id: string): Promise<void> {
  const { error } = await supabase
    .from('tool_results')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting tool result:', error);
    throw new Error(`Failed to delete tool result: ${error.message}`);
  }
}

/**
 * Delete all tool results for a specific brand
 */
export async function deleteAllToolResults(brandId: string): Promise<void> {
  const { error } = await supabase
    .from('tool_results')
    .delete()
    .eq('brand_id', brandId);

  if (error) {
    console.error('Error deleting tool results:', error);
    throw new Error(`Failed to delete tool results: ${error.message}`);
  }
}

/**
 * Fetch tool results with pagination
 */
export async function fetchToolResultsPaginated(
  brandId: string,
  toolType: ToolType | undefined,
  page: number = 1,
  pageSize: number = 10
): Promise<{ results: ToolResult[]; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('tool_results')
    .select('*', { count: 'exact' })
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (toolType) {
    query = query.eq('tool_type', toolType);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching tool results:', error);
    throw new Error(`Failed to fetch tool results: ${error.message}`);
  }

  return {
    results: data || [],
    total: count || 0,
  };
}
