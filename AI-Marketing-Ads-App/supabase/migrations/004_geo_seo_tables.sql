-- GEO Analysis Tables
CREATE TABLE IF NOT EXISTS public.geo_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  analysis_type TEXT NOT NULL DEFAULT 'full',

  -- Scores (0-100)
  overall_score INTEGER,
  content_depth_score INTEGER,
  entity_coverage_score INTEGER,
  question_answer_score INTEGER,
  semantic_richness_score INTEGER,
  citation_potential_score INTEGER,

  -- Detailed Results (JSONB)
  entities_found JSONB DEFAULT '[]',
  questions_answered JSONB DEFAULT '[]',
  content_gaps JSONB DEFAULT '[]',
  ai_visibility_platforms JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',

  -- Files
  uploaded_files TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_geo_analyses_brand ON geo_analyses(brand_id);
CREATE INDEX IF NOT EXISTS idx_geo_analyses_score ON geo_analyses(overall_score DESC);

-- Competitor Analysis Tables
CREATE TABLE IF NOT EXISTS public.competitor_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  brand_url TEXT NOT NULL,

  -- Competitors data
  competitors JSONB DEFAULT '[]',

  -- Scores
  brand_seo_score INTEGER,
  competitor_scores JSONB DEFAULT '{}',

  -- Gap Analysis
  keyword_gaps JSONB DEFAULT '[]',
  content_gaps JSONB DEFAULT '[]',
  technical_gaps JSONB DEFAULT '[]',

  -- Recommendations
  action_items JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitor_analyses_brand ON competitor_analyses(brand_id);

-- Schema Audits Table
CREATE TABLE IF NOT EXISTS public.schema_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  url TEXT NOT NULL,

  -- Schema data
  existing_schemas JSONB DEFAULT '[]',
  missing_schemas JSONB DEFAULT '[]',
  improvements JSONB DEFAULT '[]',
  generated_schemas JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schema_audits_brand ON schema_audits(brand_id);

-- Enable RLS
ALTER TABLE geo_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_audits ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can access their brand's data)
CREATE POLICY "Users can view own brand geo analyses" ON geo_analyses
  FOR SELECT USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own brand geo analyses" ON geo_analyses
  FOR INSERT WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own brand geo analyses" ON geo_analyses
  FOR UPDATE USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own brand geo analyses" ON geo_analyses
  FOR DELETE USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own brand competitor analyses" ON competitor_analyses
  FOR SELECT USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own brand competitor analyses" ON competitor_analyses
  FOR INSERT WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own brand competitor analyses" ON competitor_analyses
  FOR UPDATE USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own brand competitor analyses" ON competitor_analyses
  FOR DELETE USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own brand schema audits" ON schema_audits
  FOR SELECT USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own brand schema audits" ON schema_audits
  FOR INSERT WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own brand schema audits" ON schema_audits
  FOR DELETE USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));
