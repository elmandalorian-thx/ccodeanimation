-- Migration: Add auto-save and ML learning tables
-- Created: 2025-12-28
-- Description: Adds tool_results, edit_history, and suggestion_cache tables for auto-saving all tool outputs and learning from user edit patterns

-- ============================================================================
-- 1. TOOL RESULTS TABLE - Auto-save all Google Tools outputs
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tool_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  tool_type TEXT NOT NULL,
    -- Valid types: 'sitelinks' | 'keywords' | 'pagespeed' | 'schema' | 'geo' | 'competitors'
  input_data JSONB NOT NULL,
    -- Original input parameters (e.g., URLs, keywords, etc.)
  result_data JSONB NOT NULL,
    -- Tool output (structured based on tool type)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tool_results_brand_tool
  ON public.tool_results(brand_id, tool_type);

CREATE INDEX IF NOT EXISTS idx_tool_results_created
  ON public.tool_results(created_at DESC);

-- Add constraint to validate tool_type
ALTER TABLE public.tool_results
  ADD CONSTRAINT chk_tool_type CHECK (
    tool_type IN ('sitelinks', 'keywords', 'pagespeed', 'schema', 'geo', 'competitors')
  );

-- ============================================================================
-- 2. EDIT HISTORY TABLE - Track user edit patterns for ML learning
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.edit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  ad_copy_id UUID REFERENCES public.ad_copies(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
    -- 'meta' | 'google' | 'tiktok'
  field_type TEXT NOT NULL,
    -- 'headline' | 'longHeadline' | 'shortHeadline' | 'primaryText' | 'description' | 'callout'
  original_value TEXT NOT NULL,
  edited_value TEXT NOT NULL,
  edit_context JSONB,
    -- Additional context: campaignPurpose, brandGuidelines, negativeKeywords, etc.
  suggestion_used BOOLEAN DEFAULT FALSE,
    -- Track if user accepted an AI suggestion
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ML pattern analysis
CREATE INDEX IF NOT EXISTS idx_edit_history_brand
  ON public.edit_history(brand_id);

CREATE INDEX IF NOT EXISTS idx_edit_history_platform_field
  ON public.edit_history(platform, field_type);

CREATE INDEX IF NOT EXISTS idx_edit_history_created
  ON public.edit_history(created_at DESC);

-- Add constraint to validate platform
ALTER TABLE public.edit_history
  ADD CONSTRAINT chk_platform CHECK (
    platform IN ('meta', 'google', 'tiktok')
  );

-- ============================================================================
-- 3. SUGGESTION CACHE TABLE - Cache AI suggestions (5min TTL)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.suggestion_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  field_type TEXT NOT NULL,
  original_text TEXT NOT NULL,
  suggestions JSONB NOT NULL,
    -- Array of 3 suggestion strings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes'
);

-- Index for cache lookup (we'll filter expired entries in the application layer)
CREATE INDEX IF NOT EXISTS idx_suggestion_cache_lookup
  ON public.suggestion_cache(brand_id, platform, field_type, original_text, expires_at);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.tool_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestion_cache ENABLE ROW LEVEL SECURITY;

-- tool_results policies
CREATE POLICY "Users view own tool results"
  ON public.tool_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.brands
    WHERE brands.id = tool_results.brand_id
      AND brands.user_id = auth.uid()
  ));

CREATE POLICY "Users insert own tool results"
  ON public.tool_results FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.brands
    WHERE brands.id = tool_results.brand_id
      AND brands.user_id = auth.uid()
  ));

CREATE POLICY "Users update own tool results"
  ON public.tool_results FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.brands
    WHERE brands.id = tool_results.brand_id
      AND brands.user_id = auth.uid()
  ));

CREATE POLICY "Users delete own tool results"
  ON public.tool_results FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.brands
    WHERE brands.id = tool_results.brand_id
      AND brands.user_id = auth.uid()
  ));

-- edit_history policies
CREATE POLICY "Users view own edit history"
  ON public.edit_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.brands
    WHERE brands.id = edit_history.brand_id
      AND brands.user_id = auth.uid()
  ));

CREATE POLICY "Users insert own edit history"
  ON public.edit_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.brands
    WHERE brands.id = edit_history.brand_id
      AND brands.user_id = auth.uid()
  ));

CREATE POLICY "Users delete own edit history"
  ON public.edit_history FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.brands
    WHERE brands.id = edit_history.brand_id
      AND brands.user_id = auth.uid()
  ));

-- suggestion_cache policies
CREATE POLICY "Users view own suggestion cache"
  ON public.suggestion_cache FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.brands
    WHERE brands.id = suggestion_cache.brand_id
      AND brands.user_id = auth.uid()
  ));

CREATE POLICY "Users insert own suggestion cache"
  ON public.suggestion_cache FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.brands
    WHERE brands.id = suggestion_cache.brand_id
      AND brands.user_id = auth.uid()
  ));

CREATE POLICY "Users delete own suggestion cache"
  ON public.suggestion_cache FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.brands
    WHERE brands.id = suggestion_cache.brand_id
      AND brands.user_id = auth.uid()
  ));

-- ============================================================================
-- 5. CLEANUP FUNCTION FOR EXPIRED SUGGESTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_suggestions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.suggestion_cache
  WHERE expires_at < NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_expired_suggestions() TO authenticated;

-- ============================================================================
-- 6. UPDATED_AT TRIGGER FOR TOOL_RESULTS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_tool_results_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_tool_results_updated_at
  BEFORE UPDATE ON public.tool_results
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_results_updated_at();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Run cleanup on migration (remove any stale cache entries)
SELECT cleanup_expired_suggestions();
