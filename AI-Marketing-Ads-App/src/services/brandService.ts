import { supabase } from './supabaseClient';
import { Brand, BrandInput } from '../types/database';

export const fetchBrands = async (): Promise<Brand[]> => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createBrand = async (input: BrandInput): Promise<Brand> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('brands')
    .insert({ user_id: user.id, ...input })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateBrand = async (id: string, input: Partial<BrandInput>): Promise<Brand> => {
  const { data, error } = await supabase
    .from('brands')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteBrand = async (id: string): Promise<void> => {
  const { error } = await supabase.from('brands').delete().eq('id', id);
  if (error) throw error;
};
