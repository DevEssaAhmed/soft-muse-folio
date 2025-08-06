-- Add enhanced fields to projects table for video and multiple images support
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS demo_video_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS demo_video_type VARCHAR(20) DEFAULT 'youtube'; -- 'youtube', 'vimeo', 'upload'
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS additional_images TEXT[] DEFAULT '{}';

-- Create site_settings table for configurable logo and general settings
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_type VARCHAR(10) DEFAULT 'text', -- 'text', 'image', 'both'
  logo_text TEXT DEFAULT 'Portfolio',
  logo_image_url TEXT,
  site_title TEXT DEFAULT 'Portfolio',
  site_description TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for site_settings
CREATE POLICY "Site settings are publicly readable" 
ON public.site_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates on site_settings
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default site settings
INSERT INTO public.site_settings (logo_type, logo_text, site_title, site_description) VALUES (
  'text',
  'Alex Chen',
  'Alex Chen - Portfolio',
  'Senior Data Analyst | Python Expert | Tableau Specialist'
);

-- Update projects table to add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);

-- Update blog_posts table to add indexes for better performance  
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at);