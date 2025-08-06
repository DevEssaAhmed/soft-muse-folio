import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    try {
        // Read the migration file
        const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250806120000_add_tags_table.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

        console.log('Applying tags table migration...');
        
        // Execute the migration
        const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
        
        if (error) {
            console.error('Migration failed:', error);
        } else {
            console.log('Migration applied successfully!');
        }
    } catch (err) {
        console.error('Error applying migration:', err);
    }
}

applyMigration();