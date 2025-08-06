const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
const supabaseUrl = 'https://kexmzaaufxbzegurxuqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleG16YWF1ZnhiemVndXJ4dXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODAxNzAsImV4cCI6MjA2OTg1NjE3MH0.FvcgUsENiqUNcKvoqIUV0ZshImSppjmXobyfb71ufog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    try {
        console.log('Creating tags table...');
        
        const { data: tagsData, error: tagsError } = await supabase.rpc('exec', {
            query: `
                CREATE TABLE IF NOT EXISTS tags (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    slug TEXT NOT NULL UNIQUE,
                    description TEXT,
                    color TEXT DEFAULT '#3B82F6',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
                );
            `
        });

        if (tagsError) {
            console.log('Tags table might already exist, continuing...');
        } else {
            console.log('Tags table created successfully!');
        }

        console.log('Migration completed!');
        process.exit(0);
        
    } catch (err) {
        console.error('Error applying migration:', err);
        process.exit(1);
    }
}

applyMigration();