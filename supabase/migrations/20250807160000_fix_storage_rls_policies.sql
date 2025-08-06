-- Fix Storage RLS Policies for Portfolio Application
-- This migration creates proper buckets and policies for file uploads

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('images', 'images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('videos', 'videos', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/mov', 'video/avi']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 20971520, ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated uploads to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read access to documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from documents" ON storage.objects;

-- More permissive policies for admin operations
-- Allow anonymous and authenticated users to upload (needed for admin operations)
CREATE POLICY "Allow uploads to images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Allow public read access to images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Allow updates to images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'images');

CREATE POLICY "Allow delete from images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'images');

-- Videos bucket policies
CREATE POLICY "Allow uploads to videos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow public read access to videos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'videos');

CREATE POLICY "Allow updates to videos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'videos');

CREATE POLICY "Allow delete from videos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'videos');

-- Avatars bucket policies
CREATE POLICY "Allow uploads to avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public read access to avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Allow updates to avatars" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars');

CREATE POLICY "Allow delete from avatars" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars');

-- Documents bucket policies (more restrictive)
CREATE POLICY "Allow uploads to documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow read access to documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents');

CREATE POLICY "Allow updates to documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'documents');

CREATE POLICY "Allow delete from documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'documents');

-- Create a settings table for hero stats and other configurable content
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'general', -- 'general', 'hero_stats', 'seo', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for site settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for site settings
CREATE POLICY "Site settings are publicly readable" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default hero stats
INSERT INTO public.site_settings (key, value, description, type) VALUES 
('hero_stats', '{"projectsLed": {"label": "Projects Led", "value": "15+"}, "hoursAnalyzed": {"label": "Hours Analyzed", "value": "500+"}, "clientsServed": {"label": "Clients Served", "value": "50+"}}', 'Hero section statistics display', 'hero_stats')
ON CONFLICT (key) DO NOTHING;

-- Insert other default settings
INSERT INTO public.site_settings (key, value, description, type) VALUES 
('site_title', '"Portfolio"', 'Main site title', 'general'),
('site_description', '"A modern portfolio showcasing projects and articles"', 'Site meta description', 'seo'),
('maintenance_mode', 'false', 'Enable/disable maintenance mode', 'general')
ON CONFLICT (key) DO NOTHING;