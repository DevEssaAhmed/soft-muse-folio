import { supabase } from './src/integrations/supabase/client.js';

async function createTagsTable() {
    try {
        console.log('Creating tags table manually...');
        
        // Create tags table
        const createTagsResult = await supabase.rpc('exec', { 
            query: `
            CREATE TABLE IF NOT EXISTS tags (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                slug TEXT NOT NULL UNIQUE,
                description TEXT,
                color TEXT DEFAULT '#3B82F6',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );`
        });
        
        console.log('Tags table result:', createTagsResult);
        
        // Create junction tables
        const createJunctionResult1 = await supabase.rpc('exec', { 
            query: `
            CREATE TABLE IF NOT EXISTS blog_post_tags (
                blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
                tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
                PRIMARY KEY (blog_post_id, tag_id)
            );`
        });
        
        console.log('Blog post tags table result:', createJunctionResult1);
        
        const createJunctionResult2 = await supabase.rpc('exec', { 
            query: `
            CREATE TABLE IF NOT EXISTS project_tags (
                project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
                tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
                PRIMARY KEY (project_id, tag_id)
            );`
        });
        
        console.log('Project tags table result:', createJunctionResult2);
        
        console.log('All tables created successfully!');
        
    } catch (err) {
        console.error('Error:', err);
    }
}

createTagsTable();