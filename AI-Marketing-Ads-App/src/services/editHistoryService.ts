import { supabase } from './supabaseClient';
import { EditHistory, EditHistoryInput, Platform, FieldType } from '../types/database';

/**
 * Track a user edit to build ML learning patterns
 */
export async function trackEdit(input: EditHistoryInput): Promise<EditHistory> {
  const { data, error } = await supabase
    .from('edit_history')
    .insert([input])
    .select()
    .single();

  if (error) {
    console.error('Error tracking edit:', error);
    throw new Error(`Failed to track edit: ${error.message}`);
  }

  return data;
}

/**
 * Fetch edit history for a specific brand, platform, and field type
 * Used to analyze patterns for personalized suggestions
 */
export async function fetchEditHistory(params: {
  brand_id: string;
  platform: Platform;
  field_type: FieldType;
  limit?: number;
}): Promise<EditHistory[]> {
  const { brand_id, platform, field_type, limit = 10 } = params;

  const { data, error } = await supabase
    .from('edit_history')
    .select('*')
    .eq('brand_id', brand_id)
    .eq('platform', platform)
    .eq('field_type', field_type)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching edit history:', error);
    throw new Error(`Failed to fetch edit history: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch all edit history for a specific brand
 */
export async function fetchAllEditHistory(brandId: string): Promise<EditHistory[]> {
  const { data, error } = await supabase
    .from('edit_history')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching edit history:', error);
    throw new Error(`Failed to fetch edit history: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch edit history for a specific ad copy
 */
export async function fetchEditHistoryByAdCopy(adCopyId: string): Promise<EditHistory[]> {
  const { data, error } = await supabase
    .from('edit_history')
    .select('*')
    .eq('ad_copy_id', adCopyId)
    .order('created_at', { ascending: false});

  if (error) {
    console.error('Error fetching edit history by ad copy:', error);
    throw new Error(`Failed to fetch edit history: ${error.message}`);
  }

  return data || [];
}

/**
 * Get count of edits for a specific brand/platform/field combination
 * Used to determine if user has enough history for personalized suggestions
 */
export async function getEditCount(params: {
  brand_id: string;
  platform: Platform;
  field_type: FieldType;
}): Promise<number> {
  const { brand_id, platform, field_type } = params;

  const { count, error } = await supabase
    .from('edit_history')
    .select('*', { count: 'exact', head: true })
    .eq('brand_id', brand_id)
    .eq('platform', platform)
    .eq('field_type', field_type);

  if (error) {
    console.error('Error getting edit count:', error);
    throw new Error(`Failed to get edit count: ${error.message}`);
  }

  return count || 0;
}

/**
 * Delete edit history for a specific brand
 */
export async function deleteEditHistory(brandId: string): Promise<void> {
  const { error } = await supabase
    .from('edit_history')
    .delete()
    .eq('brand_id', brandId);

  if (error) {
    console.error('Error deleting edit history:', error);
    throw new Error(`Failed to delete edit history: ${error.message}`);
  }
}

/**
 * Get statistics about user edit patterns
 */
export async function getEditStatistics(brandId: string): Promise<{
  totalEdits: number;
  byPlatform: Record<Platform, number>;
  byFieldType: Record<string, number>;
  suggestionAcceptanceRate: number;
}> {
  const history = await fetchAllEditHistory(brandId);

  const byPlatform: Record<Platform, number> = {
    meta: 0,
    google: 0,
    tiktok: 0,
  };

  const byFieldType: Record<string, number> = {};

  let suggestionsUsed = 0;

  history.forEach((edit) => {
    byPlatform[edit.platform]++;
    byFieldType[edit.field_type] = (byFieldType[edit.field_type] || 0) + 1;
    if (edit.suggestion_used) {
      suggestionsUsed++;
    }
  });

  return {
    totalEdits: history.length,
    byPlatform,
    byFieldType,
    suggestionAcceptanceRate: history.length > 0 ? suggestionsUsed / history.length : 0,
  };
}
