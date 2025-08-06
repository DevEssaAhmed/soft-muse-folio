#!/usr/bin/env python3
"""
Test script to check database schema
"""

from supabase import create_client
import uuid

# Supabase configuration
SUPABASE_URL = "https://kexmzaaufxbzegurxuqz.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleG16YWF1ZnhiemVndXJ4dXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODAxNzAsImV4cCI6MjA2OTg1NjE3MH0.FvcgUsENiqUNcKvoqIUV0ZshImSppjmXobyfb71ufog"

def test_schema():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Test minimal project insert
    minimal_project = {
        "id": str(uuid.uuid4()),
        "title": "Test Project",
        "description": "Test description",
        "category": "Test Category"
    }
    
    try:
        result = supabase.table('projects').insert(minimal_project).execute()
        print("✅ Minimal project insert successful")
        
        # Try to delete it
        supabase.table('projects').delete().eq('id', minimal_project['id']).execute()
    except Exception as e:
        print("❌ Minimal project insert failed:", e)
    
    # Test minimal blog post insert  
    minimal_blog = {
        "id": str(uuid.uuid4()),
        "title": "Test Blog",
        "content": "Test content",
        "slug": "test-blog"
    }
    
    try:
        result = supabase.table('blog_posts').insert(minimal_blog).execute()
        print("✅ Minimal blog post insert successful")
        
        # Try to delete it
        supabase.table('blog_posts').delete().eq('id', minimal_blog['id']).execute()
    except Exception as e:
        print("❌ Minimal blog post insert failed:", e)

if __name__ == "__main__":
    test_schema()