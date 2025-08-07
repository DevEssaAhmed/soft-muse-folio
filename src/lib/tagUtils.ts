import { supabase } from '@/integrations/supabase/client';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  featured?: boolean;
}

// Generate slug from text
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Create or get existing tag (using categories as tag source)
export const createOrGetTag = async (tagName: string): Promise<Tag | null> => {
  try {
    const slug = generateSlug(tagName);
    
    // First try to get existing category as tag
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (existingCategory && !fetchError) {
      return {
        id: existingCategory.id,
        name: existingCategory.name,
        slug: existingCategory.slug,
        description: existingCategory.description,
        color: existingCategory.color
      };
    }

    // If category doesn't exist, create it
    const { data: newCategory, error: createError } = await supabase
      .from('categories')
      .insert([{
        name: tagName.trim(),
        slug: slug
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating category as tag:', createError);
      return null;
    }

    return {
      id: newCategory.id,
      name: newCategory.name,
      slug: newCategory.slug,
      description: newCategory.description,
      color: newCategory.color
    };
  } catch (error) {
    console.error('Error in createOrGetTag:', error);
    return null;
  }
};

// Create or get existing category
export const createOrGetCategory = async (categoryName: string): Promise<Category | null> => {
  try {
    const slug = generateSlug(categoryName);
    
    // First try to get existing category
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (existingCategory && !fetchError) {
      return existingCategory;
    }

    // If category doesn't exist, create it
    const { data: newCategory, error: createError } = await supabase
      .from('categories')
      .insert([{
        name: categoryName.trim(),
        slug: slug
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating category:', createError);
      return null;
    }

    return newCategory;
  } catch (error) {
    console.error('Error in createOrGetCategory:', error);
    return null;
  }
};

// Associate tags with blog post (using built-in tags array)
export const associateBlogPostTags = async (blogPostId: string, tags: Tag[]): Promise<boolean> => {
  try {
    // Update the blog post with tags array
    const tagNames = tags.map(tag => tag.name);
    
    const { error } = await supabase
      .from('blog_posts')
      .update({ tags: tagNames })
      .eq('id', blogPostId);

    if (error) {
      console.error('Error updating blog post tags:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in associateBlogPostTags:', error);
    return false;
  }
};

// Associate tags with project (using built-in tags array)
export const associateProjectTags = async (projectId: string, tags: Tag[]): Promise<boolean> => {
  try {
    // Update the project with tags array
    const tagNames = tags.map(tag => tag.name);
    
    const { error } = await supabase
      .from('projects')
      .update({ tags: tagNames })
      .eq('id', projectId);

    if (error) {
      console.error('Error updating project tags:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in associateProjectTags:', error);
    return false;
  }
};

// Get tags for blog post (from built-in tags array)
export const getBlogPostTags = async (blogPostId: string): Promise<Tag[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('tags')
      .eq('id', blogPostId)
      .single();

    if (error) {
      console.error('Error getting blog post tags:', error);
      return [];
    }

    if (!data?.tags) return [];

    // Convert tag names to Tag objects
    return data.tags.map((tagName: string) => ({
      id: generateSlug(tagName),
      name: tagName,
      slug: generateSlug(tagName)
    }));
  } catch (error) {
    console.error('Error in getBlogPostTags:', error);
    return [];
  }
};

// Get tags for project (from built-in tags array)
export const getProjectTags = async (projectId: string): Promise<Tag[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('tags')
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error getting project tags:', error);
      return [];
    }

    if (!data?.tags) return [];

    // Convert tag names to Tag objects
    return data.tags.map((tagName: string) => ({
      id: generateSlug(tagName),
      name: tagName,
      slug: generateSlug(tagName)
    }));
  } catch (error) {
    console.error('Error in getProjectTags:', error);
    return [];
  }
};

// Get all tags (from categories and existing posts/projects)
export const getAllTags = async (): Promise<Tag[]> => {
  try {
    // Get categories as tags
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug, description, color')
      .order('name');

    const tags: Tag[] = [];

    if (categories && !categoriesError) {
      tags.push(...categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        color: cat.color
      })));
    }

    // Get unique tags from blog posts
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('tags')
      .not('tags', 'is', null);

    // Get unique tags from projects
    const { data: projects } = await supabase
      .from('projects')
      .select('tags')
      .not('tags', 'is', null);

    const allTagNames = new Set<string>();
    
    if (blogPosts) {
      blogPosts.forEach(post => {
        if (post.tags) {
          post.tags.forEach((tag: string) => allTagNames.add(tag));
        }
      });
    }

    if (projects) {
      projects.forEach(project => {
        if (project.tags) {
          project.tags.forEach((tag: string) => allTagNames.add(tag));
        }
      });
    }

    // Add tags that aren't already in categories
    allTagNames.forEach(tagName => {
      if (!tags.find(t => t.name.toLowerCase() === tagName.toLowerCase())) {
        tags.push({
          id: generateSlug(tagName),
          name: tagName,
          slug: generateSlug(tagName)
        });
      }
    });

    return tags;
  } catch (error) {
    console.error('Error in getAllTags:', error);
    return [];
  }
};

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error getting all categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    return [];
  }
};