-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('images', 'images', true),
  ('videos', 'videos', true),
  ('avatars', 'avatars', true),
  ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Create policies for authenticated uploads
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow public read access to images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY IF NOT EXISTS "Allow authenticated delete from images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to videos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow public read access to videos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'videos');

CREATE POLICY IF NOT EXISTS "Allow authenticated delete from videos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow public read access to avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Allow authenticated delete from avatars" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated read access to documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated delete from documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');