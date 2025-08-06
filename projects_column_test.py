#!/usr/bin/env python3
"""
Test projects table column structure by creating a test project
"""

import asyncio
import json
import aiohttp
import uuid

async def test_projects_columns():
    """Test projects table columns by creating a test project"""
    
    base_url = "https://kexmzaaufxbzegurxuqz.supabase.co"
    api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleG16YWF1ZnhiemVndXJ4dXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODAxNzAsImV4cCI6MjA2OTg1NjE3MH0.FvcgUsENiqUNcKvoqIUV0ZshImSppjmXobyfb71ufog"
    
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            # Create a test project to check column structure
            test_project = {
                "id": str(uuid.uuid4()),
                "title": "Migration Test Project",
                "description": "Test project to verify column structure",
                "category": "Testing",
                "tags": ["test", "migration"],
                "featured": False,
                "likes": 0,
                "views": 0,
                "comments": 0
            }
            
            print("🔍 Creating test project to verify column structure...")
            url = f"{base_url}/rest/v1/projects"
            async with session.post(url, json=test_project, headers=headers) as response:
                if response.status in [200, 201]:
                    created_project = await response.json()
                    if isinstance(created_project, list) and len(created_project) > 0:
                        project_data = created_project[0]
                        print("✅ Test project created successfully")
                        
                        # Check for category_id column
                        has_category_id = "category_id" in project_data
                        print(f"   - category_id column: {'✅' if has_category_id else '❌'}")
                        
                        if has_category_id:
                            print(f"   - category_id value: {project_data.get('category_id', 'null')}")
                        
                        # Clean up - delete the test project
                        delete_url = f"{base_url}/rest/v1/projects?id=eq.{test_project['id']}"
                        async with session.delete(delete_url, headers=headers) as delete_response:
                            if delete_response.status in [200, 204]:
                                print("✅ Test project cleaned up")
                            else:
                                print("⚠️  Failed to clean up test project")
                        
                        return has_category_id
                    else:
                        print("❌ Unexpected response format")
                        return False
                else:
                    error_text = await response.text()
                    print(f"❌ Failed to create test project: {response.status} - {error_text}")
                    return False
                    
    except Exception as e:
        print(f"❌ Error testing projects columns: {str(e)}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_projects_columns())
    print(f"\n🎯 Projects column test: {'✅ PASSED' if success else '❌ FAILED'}")
    exit(0 if success else 1)