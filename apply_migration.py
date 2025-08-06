#!/usr/bin/env python3
"""
Script to apply database migration to Supabase.
This will run the SQL migration file against the database.
"""

import os
from supabase import create_client, Client

def main():
    # Read environment variables (you might need to set these)
    url = os.environ.get('SUPABASE_URL', 'https://your-project-id.supabase.co')
    key = os.environ.get('SUPABASE_ANON_KEY', 'your-anon-key')
    
    if url == 'https://your-project-id.supabase.co' or key == 'your-anon-key':
        print("Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables")
        print("You can find these in your Supabase dashboard under Settings > API")
        return
    
    # Create Supabase client
    supabase: Client = create_client(url, key)
    
    # Read migration file
    migration_file = 'supabase/migrations/20250805120000_enhance_schema_for_portfolio.sql'
    with open(migration_file, 'r') as f:
        migration_sql = f.read()
    
    try:
        # Execute the migration
        print(f"Applying migration: {migration_file}")
        result = supabase.rpc('exec_sql', {'sql': migration_sql}).execute()
        print("Migration applied successfully!")
        print(f"Result: {result}")
        
    except Exception as e:
        print(f"Error applying migration: {e}")
        print("Please run this SQL manually in your Supabase SQL editor:")
        print(migration_sql)

if __name__ == "__main__":
    main()