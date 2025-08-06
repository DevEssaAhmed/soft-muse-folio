-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  article_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create series table
CREATE TABLE public.series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  featured_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  article_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'on-hold'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add category and series fields to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES public.series(id);
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS series_order INTEGER DEFAULT 1;

-- Add category field to projects (they already have category as text, we'll keep both for backward compatibility)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Categories are publicly readable" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage categories" 
ON public.categories 
FOR ALL 
USING (true);

-- Create policies for series
CREATE POLICY "Series are publicly readable" 
ON public.series 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can manage series" 
ON public.series 
FOR ALL 
USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_series_updated_at
  BEFORE UPDATE ON public.series
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON public.categories(featured);
CREATE INDEX IF NOT EXISTS idx_series_slug ON public.series(slug);
CREATE INDEX IF NOT EXISTS idx_series_featured ON public.series(featured);
CREATE INDEX IF NOT EXISTS idx_series_status ON public.series(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_series_id ON public.blog_posts(series_id);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON public.projects(category_id);

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, color, article_count) VALUES 
('Web Development', 'web-development', 'Modern web development tutorials and insights', '#3b82f6', 0),
('Data Science', 'data-science', 'Data analysis, machine learning, and AI articles', '#10b981', 0),
('Mobile Development', 'mobile-development', 'iOS, Android, and cross-platform development', '#f59e0b', 0),
('DevOps', 'devops', 'Deployment, CI/CD, and infrastructure guides', '#ef4444', 0),
('Career', 'career', 'Professional development and career advice', '#8b5cf6', 0),
('Tutorials', 'tutorials', 'Step-by-step guides and how-tos', '#06b6d4', 0);

-- Insert sample series
INSERT INTO public.series (title, slug, description, tags, article_count, status) VALUES 
('React Mastery', 'react-mastery', 'Complete guide to mastering React from basics to advanced concepts', ARRAY['React', 'JavaScript', 'Frontend'], 0, 'active'),
('Python for Data Science', 'python-data-science', 'Learn data science with Python, from pandas to machine learning', ARRAY['Python', 'Data Science', 'ML'], 0, 'active'),
('Full Stack Development', 'fullstack-development', 'Build complete web applications from frontend to backend', ARRAY['Fullstack', 'Web Dev', 'JavaScript'], 0, 'active'),
('DevOps Fundamentals', 'devops-fundamentals', 'Essential DevOps practices, tools, and methodologies', ARRAY['DevOps', 'Docker', 'CI/CD'], 0, 'active');

-- Create function to update article counts
CREATE OR REPLACE FUNCTION update_category_article_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.category_id IS NOT NULL AND NEW.published = true THEN
      UPDATE public.categories 
      SET article_count = article_count + 1 
      WHERE id = NEW.category_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle category change
    IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
      IF OLD.category_id IS NOT NULL AND OLD.published = true THEN
        UPDATE public.categories 
        SET article_count = GREATEST(article_count - 1, 0) 
        WHERE id = OLD.category_id;
      END IF;
      IF NEW.category_id IS NOT NULL AND NEW.published = true THEN
        UPDATE public.categories 
        SET article_count = article_count + 1 
        WHERE id = NEW.category_id;
      END IF;
    END IF;
    -- Handle publish status change
    IF OLD.published IS DISTINCT FROM NEW.published AND NEW.category_id IS NOT NULL THEN
      IF NEW.published = true THEN
        UPDATE public.categories 
        SET article_count = article_count + 1 
        WHERE id = NEW.category_id;
      ELSE
        UPDATE public.categories 
        SET article_count = GREATEST(article_count - 1, 0) 
        WHERE id = NEW.category_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.category_id IS NOT NULL AND OLD.published = true THEN
      UPDATE public.categories 
      SET article_count = GREATEST(article_count - 1, 0) 
      WHERE id = OLD.category_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update series article counts
CREATE OR REPLACE FUNCTION update_series_article_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.series_id IS NOT NULL AND NEW.published = true THEN
      UPDATE public.series 
      SET article_count = article_count + 1 
      WHERE id = NEW.series_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle series change
    IF OLD.series_id IS DISTINCT FROM NEW.series_id THEN
      IF OLD.series_id IS NOT NULL AND OLD.published = true THEN
        UPDATE public.series 
        SET article_count = GREATEST(article_count - 1, 0) 
        WHERE id = OLD.series_id;
      END IF;
      IF NEW.series_id IS NOT NULL AND NEW.published = true THEN
        UPDATE public.series 
        SET article_count = article_count + 1 
        WHERE id = NEW.series_id;
      END IF;
    END IF;
    -- Handle publish status change
    IF OLD.published IS DISTINCT FROM NEW.published AND NEW.series_id IS NOT NULL THEN
      IF NEW.published = true THEN
        UPDATE public.series 
        SET article_count = article_count + 1 
        WHERE id = NEW.series_id;
      ELSE
        UPDATE public.series 
        SET article_count = GREATEST(article_count - 1, 0) 
        WHERE id = NEW.series_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.series_id IS NOT NULL AND OLD.published = true THEN
      UPDATE public.series 
      SET article_count = GREATEST(article_count - 1, 0) 
      WHERE id = OLD.series_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating counts
CREATE TRIGGER update_category_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_category_article_count();

CREATE TRIGGER update_series_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_series_article_count();