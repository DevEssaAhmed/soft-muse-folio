#!/usr/bin/env python3
"""
Create missing tables in Supabase database
"""

import asyncio
import aiohttp
import json

async def create_tables():
    base_url = 'https://kexmzaaufxbzegurxuqz.supabase.co'
    api_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleG16YWF1ZnhiemVndXJ4dXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODAxNzAsImV4cCI6MjA2OTg1NjE3MH0.FvcgUsENiqUNcKvoqIUV0ZshImSppjmXobyfb71ufog'
    headers = {
        'apikey': api_key,
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    
    # Create sample categories data
    categories = [
        {
            'name': 'Web Development',
            'slug': 'web-development',
            'description': 'Modern web development tutorials and insights',
            'color': '#3b82f6',
            'article_count': 0,
            'featured': True
        },
        {
            'name': 'Data Science',
            'slug': 'data-science', 
            'description': 'Data analysis, machine learning, and AI articles',
            'color': '#10b981',
            'article_count': 0,
            'featured': True
        },
        {
            'name': 'Mobile Development',
            'slug': 'mobile-development',
            'description': 'iOS, Android, and cross-platform development', 
            'color': '#f59e0b',
            'article_count': 0,
            'featured': False
        },
        {
            'name': 'DevOps',
            'slug': 'devops',
            'description': 'Deployment, CI/CD, and infrastructure guides',
            'color': '#ef4444', 
            'article_count': 0,
            'featured': False
        },
        {
            'name': 'Career',
            'slug': 'career',
            'description': 'Professional development and career advice',
            'color': '#8b5cf6',
            'article_count': 0,
            'featured': False
        },
        {
            'name': 'Tutorials',
            'slug': 'tutorials',
            'description': 'Step-by-step guides and how-tos',
            'color': '#06b6d4',
            'article_count': 0,
            'featured': False
        }
    ]

    # Create sample series data
    series_data = [
        {
            'title': 'React Mastery',
            'slug': 'react-mastery',
            'description': 'Complete guide to mastering React from basics to advanced concepts',
            'tags': ['React', 'JavaScript', 'Frontend'],
            'article_count': 0,
            'featured': True,
            'status': 'active'
        },
        {
            'title': 'Python for Data Science', 
            'slug': 'python-data-science',
            'description': 'Learn data science with Python, from pandas to machine learning',
            'tags': ['Python', 'Data Science', 'ML'],
            'article_count': 0,
            'featured': True,
            'status': 'active'
        },
        {
            'title': 'Full Stack Development',
            'slug': 'fullstack-development', 
            'description': 'Build complete web applications from frontend to backend',
            'tags': ['Fullstack', 'Web Dev', 'JavaScript'],
            'article_count': 0,
            'featured': False,
            'status': 'active'
        },
        {
            'title': 'DevOps Fundamentals',
            'slug': 'devops-fundamentals',
            'description': 'Essential DevOps practices, tools, and methodologies', 
            'tags': ['DevOps', 'Docker', 'CI/CD'],
            'article_count': 0,
            'featured': False,
            'status': 'active'
        }
    ]

    async with aiohttp.ClientSession() as session:
        # First, let's check what tables exist
        print("Checking existing tables...")
        
        # Try to create categories
        try:
            categories_url = f'{base_url}/rest/v1/categories'
            async with session.post(categories_url, json=categories, headers=headers) as response:
                result = await response.json()
                if response.status in [200, 201]:
                    print("✅ Categories created successfully")
                    print(json.dumps(result, indent=2))
                else:
                    print(f"❌ Failed to create categories: {result}")
        except Exception as e:
            print(f"❌ Error creating categories: {e}")

        # Try to create series 
        try:
            series_url = f'{base_url}/rest/v1/series'
            async with session.post(series_url, json=series_data, headers=headers) as response:
                result = await response.json()
                if response.status in [200, 201]:
                    print("✅ Series created successfully")
                    print(json.dumps(result, indent=2))
                else:
                    print(f"❌ Failed to create series: {result}")
        except Exception as e:
            print(f"❌ Error creating series: {e}")

if __name__ == "__main__":
    asyncio.run(create_tables())