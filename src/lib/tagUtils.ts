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

// Create or get existing tag
export const createOrGetTag = async (tagName: string): Promise<Tag | null> => {
  try {
    const slug = generateSlug(tagName);
    
    // First try to get existing tag
    const { data: existingTag, error: fetchError } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single();

    if (existingTag && !fetchError) {
      return existingTag;
    }

    // If tag doesn't exist, create it
    const { data: newTag, error: createError } = await supabase
      .from('tags')
      .insert([{
        name: tagName.trim(),
        slug: slug
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating tag:', createError);
      return null;
    }

    return newTag;
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

// Associate tags with blog post
export const associateBlogPostTags = async (blogPostId: string, tags: Tag[]): Promise<boolean> => {
  try {
    // Remove existing associations
    await supabase
      .from('blog_post_tags')
      .delete()
      .eq('blog_post_id', blogPostId);

    if (tags.length === 0) return true;

    // Create new associations
    const associations = tags.map(tag => ({
      blog_post_id: blogPostId,
      tag_id: tag.id
    }));

    const { error } = await supabase
      .from('blog_post_tags')
      .insert(associations);

    if (error) {
      console.error('Error associating blog post tags:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in associateBlogPostTags:', error);
    return false;
  }
};

// Associate tags with project
export const associateProjectTags = async (projectId: string, tags: Tag[]): Promise<boolean> => {
  try {
    // Remove existing associations
    await supabase
      .from('project_tags')
      .delete()
      .eq('project_id', projectId);

    if (tags.length === 0) return true;

    // Create new associations
    const associations = tags.map(tag => ({
      project_id: projectId,
      tag_id: tag.id
    }));

    const { error } = await supabase
      .from('project_tags')
      .insert(associations);

    if (error) {
      console.error('Error associating project tags:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in associateProjectTags:', error);
    return false;
  }
};

// Get tags for blog post
export const getBlogPostTags = async (blogPostId: string): Promise<Tag[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_post_tags')
      .select(`
        tags (
          id,
          name,
          slug,
          description,
          color
        )
      `)
      .eq('blog_post_id', blogPostId);

    if (error) {
      console.error('Error getting blog post tags:', error);
      return [];
    }

    return data.map(item => item.tags).filter(Boolean) as Tag[];
  } catch (error) {
    console.error('Error in getBlogPostTags:', error);
    return [];
  }
};

// Get tags for project
export const getProjectTags = async (projectId: string): Promise<Tag[]> => {
  try {
    const { data, error } = await supabase
      .from('project_tags')
      .select(`
        tags (
          id,
          name,
          slug,
          description,
          color
        )
      `)
      .eq('project_id', projectId);

    if (error) {
      console.error('Error getting project tags:', error);
      return [];
    }

    return data.map(item => item.tags).filter(Boolean) as Tag[];
  } catch (error) {
    console.error('Error in getProjectTags:', error);
    return [];
  }
};

// Get all tags
export const getAllTags = async (): Promise<Tag[]> => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error getting all tags:', error);
      return [];
    }

    return data || [];
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