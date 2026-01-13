export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandGuidelines {
  nameFormatting?: string;
  languageRules?: string[];
  negativeTerms?: string[];
}

export interface Brand {
  id: string;
  user_id: string;
  name: string;
  website: string;
  social_media_handle: string | null;
  practitioner_names: string[] | null;
  product_urls: string[] | null;
  technologies_features: string | null;
  brand_guidelines: BrandGuidelines | null;
  competitor_websites: string[] | null;
  competitor_social_handles: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface AdCopy {
  id: string;
  brand_id: string;
  name: string;
  campaign_purpose: string | null;
  meta_copy: any | null;
  google_copy: any | null;
  tiktok_copy: any | null;
  generation_context: {
    negativeKeywords?: string;
    files?: string[];
  } | null;
  created_at: string;
  updated_at: string;
}

export interface BrandInput {
  name: string;
  website: string;
  social_media_handle?: string;
  practitioner_names?: string[];
  product_urls?: string[];
  technologies_features?: string;
  brand_guidelines?: BrandGuidelines;
  competitor_websites?: string[];
  competitor_social_handles?: string[];
}

// Tool Results - Auto-save for all Google Tools outputs
export type ToolType = 'sitelinks' | 'keywords' | 'pagespeed' | 'schema' | 'geo' | 'competitors';

export interface ToolResult {
  id: string;
  brand_id: string;
  tool_type: ToolType;
  input_data: Record<string, any>; // Input parameters (e.g., {urls: string[], keywords: string[]})
  result_data: Record<string, any>; // Tool-specific output structure
  created_at: string;
  updated_at: string;
}

export interface ToolResultInput {
  brand_id: string;
  tool_type: ToolType;
  input_data: Record<string, any>;
  result_data: Record<string, any>;
}

// Edit History - Track user edit patterns for ML learning
export type Platform = 'meta' | 'google' | 'tiktok';
export type FieldType = 'headline' | 'longHeadline' | 'shortHeadline' | 'primaryText' | 'description' | 'callout';

export interface EditContext {
  campaignPurpose?: string;
  brandGuidelines?: BrandGuidelines;
  negativeKeywords?: string;
  [key: string]: any;
}

export interface EditHistory {
  id: string;
  brand_id: string;
  ad_copy_id: string | null;
  platform: Platform;
  field_type: FieldType;
  original_value: string;
  edited_value: string;
  edit_context: EditContext | null;
  suggestion_used: boolean;
  created_at: string;
}

export interface EditHistoryInput {
  brand_id: string;
  ad_copy_id?: string;
  platform: Platform;
  field_type: FieldType;
  original_value: string;
  edited_value: string;
  edit_context?: EditContext;
  suggestion_used?: boolean;
}

// Suggestion Cache - Cache AI suggestions with 5min TTL
export interface SuggestionCache {
  id: string;
  brand_id: string | null;
  platform: Platform;
  field_type: FieldType;
  original_text: string;
  suggestions: string[]; // Array of 3 AI-generated suggestions
  created_at: string;
  expires_at: string;
}

export interface SuggestionCacheInput {
  brand_id?: string;
  platform: Platform;
  field_type: FieldType;
  original_text: string;
  suggestions: string[];
}
