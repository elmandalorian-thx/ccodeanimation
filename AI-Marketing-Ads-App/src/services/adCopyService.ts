import { supabase } from './supabaseClient';
import { AdCopy } from '../types/database';
import { AllAdCopy } from '../../types';

export const fetchAdCopies = async (brandId: string): Promise<AdCopy[]> => {
  const { data, error } = await supabase
    .from('ad_copies')
    .select('*')
    .eq('brand_id', brandId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const saveAdCopy = async (
  brandId: string,
  name: string,
  adCopy: AllAdCopy,
  context: { campaignPurpose?: string; negativeKeywords?: string }
): Promise<AdCopy> => {
  const { data, error } = await supabase
    .from('ad_copies')
    .insert({
      brand_id: brandId,
      name,
      campaign_purpose: context.campaignPurpose || null,
      meta_copy: adCopy.meta || null,
      google_copy: adCopy.google || null,
      tiktok_copy: adCopy.tiktok || null,
      generation_context: { negativeKeywords: context.negativeKeywords },
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const renameAdCopy = async (id: string, newName: string): Promise<AdCopy> => {
  const { data, error} = await supabase
    .from('ad_copies')
    .update({ name: newName })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAdCopy = async (id: string): Promise<void> => {
  const { error } = await supabase.from('ad_copies').delete().eq('id', id);
  if (error) throw error;
};

export const updateAdCopy = async (
  id: string,
  adCopy: AllAdCopy,
  context: { campaignPurpose?: string; negativeKeywords?: string }
): Promise<AdCopy> => {
  const { data, error } = await supabase
    .from('ad_copies')
    .update({
      campaign_purpose: context.campaignPurpose || null,
      meta_copy: adCopy.meta || null,
      google_copy: adCopy.google || null,
      tiktok_copy: adCopy.tiktok || null,
      generation_context: { negativeKeywords: context.negativeKeywords },
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
