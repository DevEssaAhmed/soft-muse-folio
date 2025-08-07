import { supabase } from '@/integrations/supabase/client';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
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

// Create or get existing tag from tags table
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
        slug: slug,
        color: '#3B82F6'
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

// Associate tags with blog post using junction table
export const associateBlogPostTags = async (blogPostId: string, tagNames: string[]): Promise<boolean> => {
  try {
    // First, remove existing tag associations
    const { error: deleteError } = await supabase
      .from('blog_post_tags')
      .delete()
      .eq('blog_post_id', blogPostId);

    if (deleteError) {
      console.error('Error removing existing blog post tags:', deleteError);
      return false;
    }

    // If no tags to associate, return success
    if (!tagNames || tagNames.length === 0) {
      return true;
    }

    // Create or get tags and prepare junction data
    const tagAssociations = [];
    for (const tagName of tagNames) {
      const tag = await createOrGetTag(tagName);
      if (tag) {
        tagAssociations.push({
          blog_post_id: blogPostId,
          tag_id: tag.id
        });
      }
    }

    // Insert new tag associations
    if (tagAssociations.length > 0) {
      const { error: insertError } = await supabase
        .from('blog_post_tags')
        .insert(tagAssociations);

      if (insertError) {
        console.error('Error inserting blog post tags:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in associateBlogPostTags:', error);
    return false;
  }
};

// Associate tags with project using junction table
export const associateProjectTags = async (projectId: string, tagNames: string[]): Promise<boolean> => {
  try {
    // First, remove existing tag associations
    const { error: deleteError } = await supabase
      .from('project_tags')
      .delete()
      .eq('project_id', projectId);

    if (deleteError) {
      console.error('Error removing existing project tags:', deleteError);
      return false;
    }

    // If no tags to associate, return success
    if (!tagNames || tagNames.length === 0) {
      return true;
    }

    // Create or get tags and prepare junction data
    const tagAssociations = [];
    for (const tagName of tagNames) {
      const tag = await createOrGetTag(tagName);
      if (tag) {
        tagAssociations.push({
          project_id: projectId,
          tag_id: tag.id
        });
      }
    }

    // Insert new tag associations
    if (tagAssociations.length > 0) {
      const { error: insertError } = await supabase
        .from('project_tags')
        .insert(tagAssociations);

      if (insertError) {
        console.error('Error inserting project tags:', insertError);
        return false;
      }
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