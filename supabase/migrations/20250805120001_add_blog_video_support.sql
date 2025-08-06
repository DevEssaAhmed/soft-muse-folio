-- Add video support to blog_posts table
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS video_type VARCHAR(20) DEFAULT 'youtube'; -- 'youtube', 'vimeo', 'upload'
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS additional_images TEXT[] DEFAULT '{}';

-- Add featured image support if not exists
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured_image_url TEXT;