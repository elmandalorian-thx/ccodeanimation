-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brands table
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  website TEXT NOT NULL,
  product_urls TEXT[],
  technologies_features TEXT,
  brand_guidelines JSONB,
  competitor_websites TEXT[],
  competitor_social_handles TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT brands_user_id_name_unique UNIQUE(user_id, name)
);

-- Ad copies table
CREATE TABLE public.ad_copies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  campaign_purpose TEXT,
  meta_copy JSONB,
  google_copy JSONB,
  tiktok_copy JSONB,
  generation_context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ad_copies_brand_id_name_unique UNIQUE(brand_id, name)
);

-- Indexes
CREATE INDEX idx_brands_user_id ON public.brands(user_id);
CREATE INDEX idx_ad_copies_brand_id ON public.ad_copies(brand_id);
CREATE INDEX idx_ad_copies_created_at ON public.ad_copies(created_at DESC);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_copies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users view own brands" ON public.brands FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own brands" ON public.brands FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own brands" ON public.brands FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own brands" ON public.brands FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users view own ad copies" ON public.ad_copies FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.brands WHERE brands.id = ad_copies.brand_id AND brands.user_id = auth.uid()));
CREATE POLICY "Users insert own ad copies" ON public.ad_copies FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.brands WHERE brands.id = ad_copies.brand_id AND brands.user_id = auth.uid()));
CREATE POLICY "Users update own ad copies" ON public.ad_copies FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.brands WHERE brands.id = ad_copies.brand_id AND brands.user_id = auth.uid()));
CREATE POLICY "Users delete own ad copies" ON public.ad_copies FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.brands WHERE brands.id = ad_copies.brand_id AND brands.user_id = auth.uid()));

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_copies_updated_at BEFORE UPDATE ON public.ad_copies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
