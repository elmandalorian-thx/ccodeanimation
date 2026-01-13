-- Add social media handle and practitioner names to brands table
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS social_media_handle TEXT;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS practitioner_names TEXT[];
