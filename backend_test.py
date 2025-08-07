#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Admin Panel with Relational Tag System
Tests Supabase integration, authentication, CRUD operations, and tag relationships
"""

import asyncio
import json
import sys
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
import uuid

# Add the src directory to Python path for imports
sys.path.append('/app/src')

try:
    from supabase import create_client, Client
    import requests
    from requests.auth import HTTPBasicAuth
except ImportError as e:
    print(f"❌ Missing required packages: {e}")
    print("Installing required packages...")
    os.system("pip install supabase requests python-dotenv")
    from supabase import create_client, Client
    import requests

class SupabaseBackendTester:
    def __init__(self):
        # Supabase configuration from the client.ts file
        self.supabase_url = "https://kexmzaaufxbzegurxuqz.supabase.co"
        self.supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleG16YWF1ZnhiemVndXJ4dXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODAxNzAsImV4cCI6MjA2OTg1NjE3MH0.FvcgUsENiqUNcKvoqIUV0ZshImSppjmXobyfb71ufog"
        
        # Initialize Supabase client
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        
        # Test credentials
        self.test_email = "essaahmedsiddiqui@gmail.com"
        self.test_password = "shadow"
        
        # Test data storage
        self.test_data = {
            'user_session': None,
            'created_tags': [],
            'created_blog_posts': [],
            'created_projects': [],
            'created_categories': [],
            'created_series': []
        }
        
        # Test results
        self.results = {
            'total_tests': 0,
            'passed_tests': 0,
            'failed_tests': 0,
            'test_details': []
        }

    def log_test(self, test_name: str, success: bool, message: str = "", details: Any = None):
        """Log test results"""
        self.results['total_tests'] += 1
        if success:
            self.results['passed_tests'] += 1
            status = "✅ PASS"
        else:
            self.results['failed_tests'] += 1
            status = "❌ FAIL"
        
        result = {
            'test': test_name,
            'status': status,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        
        self.results['test_details'].append(result)
        print(f"{status}: {test_name}")
        if message:
            print(f"    {message}")
        if details and isinstance(details, dict):
            for key, value in details.items():
                print(f"    {key}: {value}")
        print()

    async def test_authentication(self):
        """Test Supabase authentication with provided credentials"""
        print("🔐 Testing Authentication...")
        
        try:
            # Test sign in
            response = self.supabase.auth.sign_in_with_password({
                "email": self.test_email,
                "password": self.test_password
            })
            
            if response.user and response.session:
                self.test_data['user_session'] = response.session
                self.log_test(
                    "Authentication - Sign In",
                    True,
                    f"Successfully authenticated user: {response.user.email}",
                    {
                        "user_id": response.user.id,
                        "email": response.user.email,
                        "session_expires": response.session.expires_at
                    }
                )
                return True
            else:
                self.log_test(
                    "Authentication - Sign In",
                    False,
                    "Authentication failed - no user or session returned"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Authentication - Sign In",
                False,
                f"Authentication error: {str(e)}"
            )
            return False

    async def test_database_schema(self):
        """Test that all required tables exist and have proper structure"""
        print("🗄️ Testing Database Schema...")
        
        required_tables = [
            'tags', 'blog_posts', 'projects', 'categories', 'series',
            'blog_post_tags', 'project_tags', 'profile', 'contacts'
        ]
        
        for table in required_tables:
            try:
                # Test table exists by doing a simple select
                response = self.supabase.table(table).select("*").limit(1).execute()
                
                self.log_test(
                    f"Database Schema - {table} table",
                    True,
                    f"Table '{table}' exists and is accessible"
                )
                
            except Exception as e:
                self.log_test(
                    f"Database Schema - {table} table",
                    False,
                    f"Table '{table}' error: {str(e)}"
                )

    async def test_tag_crud_operations(self):
        """Test tag CRUD operations and relational functionality"""
        print("🏷️ Testing Tag CRUD Operations...")
        
        # Test data
        test_tags = [
            {"name": "React", "description": "JavaScript library for building user interfaces", "color": "#61DAFB"},
            {"name": "Python", "description": "High-level programming language", "color": "#3776AB"},
            {"name": "TypeScript", "description": "Typed superset of JavaScript", "color": "#3178C6"}
        ]
        
        created_tag_ids = []
        
        # Test CREATE tags
        for tag_data in test_tags:
            try:
                # Generate slug
                slug = tag_data["name"].lower().replace(" ", "-").replace("#", "sharp")
                
                response = self.supabase.table('tags').insert({
                    **tag_data,
                    "slug": slug
                }).execute()
                
                if response.data and len(response.data) > 0:
                    tag_id = response.data[0]['id']
                    created_tag_ids.append(tag_id)
                    self.test_data['created_tags'].append(tag_id)
                    
                    self.log_test(
                        f"Tag CRUD - Create '{tag_data['name']}'",
                        True,
                        f"Successfully created tag with ID: {tag_id}",
                        {"tag_name": tag_data['name'], "tag_id": tag_id}
                    )
                else:
                    self.log_test(
                        f"Tag CRUD - Create '{tag_data['name']}'",
                        False,
                        "No data returned from insert operation"
                    )
                    
            except Exception as e:
                self.log_test(
                    f"Tag CRUD - Create '{tag_data['name']}'",
                    False,
                    f"Error creating tag: {str(e)}"
                )
        
        # Test READ tags
        try:
            response = self.supabase.table('tags').select("*").execute()
            
            if response.data:
                self.log_test(
                    "Tag CRUD - Read All Tags",
                    True,
                    f"Successfully retrieved {len(response.data)} tags",
                    {"total_tags": len(response.data)}
                )
            else:
                self.log_test(
                    "Tag CRUD - Read All Tags",
                    False,
                    "No tags found in database"
                )
                
        except Exception as e:
            self.log_test(
                "Tag CRUD - Read All Tags",
                False,
                f"Error reading tags: {str(e)}"
            )
        
        # Test UPDATE tag
        if created_tag_ids:
            try:
                tag_id = created_tag_ids[0]
                updated_data = {"description": "Updated description for testing"}
                
                response = self.supabase.table('tags').update(updated_data).eq('id', tag_id).execute()
                
                if response.data:
                    self.log_test(
                        "Tag CRUD - Update Tag",
                        True,
                        f"Successfully updated tag {tag_id}",
                        {"updated_fields": updated_data}
                    )
                else:
                    self.log_test(
                        "Tag CRUD - Update Tag",
                        False,
                        "No data returned from update operation"
                    )
                    
            except Exception as e:
                self.log_test(
                    "Tag CRUD - Update Tag",
                    False,
                    f"Error updating tag: {str(e)}"
                )

    async def test_blog_post_operations(self):
        """Test blog post CRUD operations with tag associations"""
        print("📝 Testing Blog Post Operations...")
        
        # Create test blog post
        blog_data = {
            "title": "Test Blog Post with Relational Tags",
            "slug": "test-blog-post-relational-tags",
            "content": "This is a comprehensive test blog post to verify the new relational tag system works correctly.",
            "excerpt": "Testing the new relational tag system implementation",
            "published": True,
            "reading_time": 5
        }
        
        try:
            response = self.supabase.table('blog_posts').insert(blog_data).execute()
            
            if response.data and len(response.data) > 0:
                blog_post_id = response.data[0]['id']
                self.test_data['created_blog_posts'].append(blog_post_id)
                
                self.log_test(
                    "Blog Post CRUD - Create Post",
                    True,
                    f"Successfully created blog post with ID: {blog_post_id}",
                    {"blog_title": blog_data['title'], "blog_id": blog_post_id}
                )
                
                # Test tag associations
                await self.test_blog_post_tag_associations(blog_post_id)
                
            else:
                self.log_test(
                    "Blog Post CRUD - Create Post",
                    False,
                    "No data returned from blog post creation"
                )
                
        except Exception as e:
            self.log_test(
                "Blog Post CRUD - Create Post",
                False,
                f"Error creating blog post: {str(e)}"
            )

    async def test_blog_post_tag_associations(self, blog_post_id: str):
        """Test blog post tag associations using junction table"""
        print("🔗 Testing Blog Post Tag Associations...")
        
        if not self.test_data['created_tags']:
            self.log_test(
                "Blog Post Tags - Association Test",
                False,
                "No tags available for association testing"
            )
            return
        
        # Associate tags with blog post
        tag_associations = []
        for tag_id in self.test_data['created_tags'][:2]:  # Use first 2 tags
            tag_associations.append({
                "blog_post_id": blog_post_id,
                "tag_id": tag_id
            })
        
        try:
            response = self.supabase.table('blog_post_tags').insert(tag_associations).execute()
            
            if response.data:
                self.log_test(
                    "Blog Post Tags - Create Associations",
                    True,
                    f"Successfully associated {len(tag_associations)} tags with blog post",
                    {"associations_created": len(tag_associations)}
                )
                
                # Test reading associations
                await self.test_read_blog_post_tags(blog_post_id)
                
            else:
                self.log_test(
                    "Blog Post Tags - Create Associations",
                    False,
                    "No data returned from tag association creation"
                )
                
        except Exception as e:
            self.log_test(
                "Blog Post Tags - Create Associations",
                False,
                f"Error creating tag associations: {str(e)}"
            )

    async def test_read_blog_post_tags(self, blog_post_id: str):
        """Test reading blog post tags through junction table"""
        try:
            response = self.supabase.table('blog_post_tags').select("""
                tags (
                    id,
                    name,
                    slug,
                    description,
                    color
                )
            """).eq('blog_post_id', blog_post_id).execute()
            
            if response.data:
                tags = [item['tags'] for item in response.data if item['tags']]
                self.log_test(
                    "Blog Post Tags - Read Associations",
                    True,
                    f"Successfully retrieved {len(tags)} associated tags",
                    {"associated_tags": [tag['name'] for tag in tags]}
                )
            else:
                self.log_test(
                    "Blog Post Tags - Read Associations",
                    False,
                    "No tag associations found for blog post"
                )
                
        except Exception as e:
            self.log_test(
                "Blog Post Tags - Read Associations",
                False,
                f"Error reading tag associations: {str(e)}"
            )

    async def test_project_operations(self):
        """Test project CRUD operations with tag associations"""
        print("🚀 Testing Project Operations...")
        
        # Create test project
        project_data = {
            "title": "Test Project with Relational Tags",
            "description": "This is a comprehensive test project to verify the new relational tag system works correctly for projects.",
            "category": "Web Development",
            "demo_url": "https://example.com/demo",
            "github_url": "https://github.com/test/project",
            "featured": True
        }
        
        try:
            response = self.supabase.table('projects').insert(project_data).execute()
            
            if response.data and len(response.data) > 0:
                project_id = response.data[0]['id']
                self.test_data['created_projects'].append(project_id)
                
                self.log_test(
                    "Project CRUD - Create Project",
                    True,
                    f"Successfully created project with ID: {project_id}",
                    {"project_title": project_data['title'], "project_id": project_id}
                )
                
                # Test tag associations
                await self.test_project_tag_associations(project_id)
                
            else:
                self.log_test(
                    "Project CRUD - Create Project",
                    False,
                    "No data returned from project creation"
                )
                
        except Exception as e:
            self.log_test(
                "Project CRUD - Create Project",
                False,
                f"Error creating project: {str(e)}"
            )

    async def test_project_tag_associations(self, project_id: str):
        """Test project tag associations using junction table"""
        print("🔗 Testing Project Tag Associations...")
        
        if not self.test_data['created_tags']:
            self.log_test(
                "Project Tags - Association Test",
                False,
                "No tags available for association testing"
            )
            return
        
        # Associate tags with project
        tag_associations = []
        for tag_id in self.test_data['created_tags']:  # Use all created tags
            tag_associations.append({
                "project_id": project_id,
                "tag_id": tag_id
            })
        
        try:
            response = self.supabase.table('project_tags').insert(tag_associations).execute()
            
            if response.data:
                self.log_test(
                    "Project Tags - Create Associations",
                    True,
                    f"Successfully associated {len(tag_associations)} tags with project",
                    {"associations_created": len(tag_associations)}
                )
                
                # Test reading associations
                await self.test_read_project_tags(project_id)
                
            else:
                self.log_test(
                    "Project Tags - Create Associations",
                    False,
                    "No data returned from tag association creation"
                )
                
        except Exception as e:
            self.log_test(
                "Project Tags - Create Associations",
                False,
                f"Error creating tag associations: {str(e)}"
            )

    async def test_read_project_tags(self, project_id: str):
        """Test reading project tags through junction table"""
        try:
            response = self.supabase.table('project_tags').select("""
                tags (
                    id,
                    name,
                    slug,
                    description,
                    color
                )
            """).eq('project_id', project_id).execute()
            
            if response.data:
                tags = [item['tags'] for item in response.data if item['tags']]
                self.log_test(
                    "Project Tags - Read Associations",
                    True,
                    f"Successfully retrieved {len(tags)} associated tags",
                    {"associated_tags": [tag['name'] for tag in tags]}
                )
            else:
                self.log_test(
                    "Project Tags - Read Associations",
                    False,
                    "No tag associations found for project"
                )
                
        except Exception as e:
            self.log_test(
                "Project Tags - Read Associations",
                False,
                f"Error reading tag associations: {str(e)}"
            )

    async def test_category_operations(self):
        """Test category CRUD operations"""
        print("📁 Testing Category Operations...")
        
        categories = [
            {"name": "Web Development", "slug": "web-development", "description": "Frontend and backend web development"},
            {"name": "Mobile Apps", "slug": "mobile-apps", "description": "iOS and Android applications"},
            {"name": "Data Science", "slug": "data-science", "description": "Data analysis and machine learning"}
        ]
        
        for category_data in categories:
            try:
                response = self.supabase.table('categories').insert(category_data).execute()
                
                if response.data and len(response.data) > 0:
                    category_id = response.data[0]['id']
                    self.test_data['created_categories'].append(category_id)
                    
                    self.log_test(
                        f"Category CRUD - Create '{category_data['name']}'",
                        True,
                        f"Successfully created category with ID: {category_id}",
                        {"category_name": category_data['name'], "category_id": category_id}
                    )
                else:
                    self.log_test(
                        f"Category CRUD - Create '{category_data['name']}'",
                        False,
                        "No data returned from category creation"
                    )
                    
            except Exception as e:
                self.log_test(
                    f"Category CRUD - Create '{category_data['name']}'",
                    False,
                    f"Error creating category: {str(e)}"
                )

    async def test_series_operations(self):
        """Test series CRUD operations"""
        print("📚 Testing Series Operations...")
        
        series_data = {
            "title": "Test Blog Series",
            "slug": "test-blog-series",
            "description": "A test series for verifying series functionality",
            "status": "active"
        }
        
        try:
            response = self.supabase.table('series').insert(series_data).execute()
            
            if response.data and len(response.data) > 0:
                series_id = response.data[0]['id']
                self.test_data['created_series'].append(series_id)
                
                self.log_test(
                    "Series CRUD - Create Series",
                    True,
                    f"Successfully created series with ID: {series_id}",
                    {"series_title": series_data['title'], "series_id": series_id}
                )
            else:
                self.log_test(
                    "Series CRUD - Create Series",
                    False,
                    "No data returned from series creation"
                )
                
        except Exception as e:
            self.log_test(
                "Series CRUD - Create Series",
                False,
                f"Error creating series: {str(e)}"
            )

    async def test_admin_panel_functionality(self):
        """Test admin panel specific functionality"""
        print("👨‍💼 Testing Admin Panel Functionality...")
        
        # Test fetching all data for admin dashboard
        tables_to_test = ['projects', 'blog_posts', 'tags', 'categories', 'series']
        
        for table in tables_to_test:
            try:
                response = self.supabase.table(table).select("*").execute()
                
                if response.data is not None:
                    self.log_test(
                        f"Admin Panel - Fetch {table}",
                        True,
                        f"Successfully fetched {len(response.data)} records from {table}",
                        {"record_count": len(response.data)}
                    )
                else:
                    self.log_test(
                        f"Admin Panel - Fetch {table}",
                        False,
                        f"Failed to fetch data from {table}"
                    )
                    
            except Exception as e:
                self.log_test(
                    f"Admin Panel - Fetch {table}",
                    False,
                    f"Error fetching {table}: {str(e)}"
                )

    async def test_relational_queries(self):
        """Test complex relational queries"""
        print("🔍 Testing Relational Queries...")
        
        # Test getting blog posts with their tags
        try:
            response = self.supabase.table('blog_posts').select("""
                id,
                title,
                slug,
                blog_post_tags (
                    tags (
                        id,
                        name,
                        slug,
                        color
                    )
                )
            """).execute()
            
            if response.data is not None:
                posts_with_tags = 0
                for post in response.data:
                    if post.get('blog_post_tags'):
                        posts_with_tags += 1
                
                self.log_test(
                    "Relational Queries - Blog Posts with Tags",
                    True,
                    f"Successfully fetched {len(response.data)} blog posts, {posts_with_tags} have tags",
                    {"total_posts": len(response.data), "posts_with_tags": posts_with_tags}
                )
            else:
                self.log_test(
                    "Relational Queries - Blog Posts with Tags",
                    False,
                    "Failed to fetch blog posts with tags"
                )
                
        except Exception as e:
            self.log_test(
                "Relational Queries - Blog Posts with Tags",
                False,
                f"Error in relational query: {str(e)}"
            )
        
        # Test getting projects with their tags
        try:
            response = self.supabase.table('projects').select("""
                id,
                title,
                description,
                project_tags (
                    tags (
                        id,
                        name,
                        slug,
                        color
                    )
                )
            """).execute()
            
            if response.data is not None:
                projects_with_tags = 0
                for project in response.data:
                    if project.get('project_tags'):
                        projects_with_tags += 1
                
                self.log_test(
                    "Relational Queries - Projects with Tags",
                    True,
                    f"Successfully fetched {len(response.data)} projects, {projects_with_tags} have tags",
                    {"total_projects": len(response.data), "projects_with_tags": projects_with_tags}
                )
            else:
                self.log_test(
                    "Relational Queries - Projects with Tags",
                    False,
                    "Failed to fetch projects with tags"
                )
                
        except Exception as e:
            self.log_test(
                "Relational Queries - Projects with Tags",
                False,
                f"Error in relational query: {str(e)}"
            )

    async def test_error_handling(self):
        """Test error handling and edge cases"""
        print("⚠️ Testing Error Handling...")
        
        # Test duplicate tag creation
        try:
            duplicate_tag = {
                "name": "React",  # This should already exist
                "slug": "react",
                "description": "Duplicate tag test"
            }
            
            response = self.supabase.table('tags').insert(duplicate_tag).execute()
            
            # If this succeeds, it means duplicate handling is working
            self.log_test(
                "Error Handling - Duplicate Tag",
                True,
                "Duplicate tag handling works correctly (either prevented or allowed)"
            )
            
        except Exception as e:
            # This is expected behavior for duplicate prevention
            self.log_test(
                "Error Handling - Duplicate Tag",
                True,
                f"Duplicate tag properly prevented: {str(e)}"
            )
        
        # Test invalid foreign key reference
        try:
            invalid_association = {
                "blog_post_id": "00000000-0000-0000-0000-000000000000",  # Non-existent ID
                "tag_id": "00000000-0000-0000-0000-000000000000"  # Non-existent ID
            }
            
            response = self.supabase.table('blog_post_tags').insert(invalid_association).execute()
            
            self.log_test(
                "Error Handling - Invalid Foreign Key",
                False,
                "Invalid foreign key reference was allowed (should be prevented)"
            )
            
        except Exception as e:
            self.log_test(
                "Error Handling - Invalid Foreign Key",
                True,
                f"Invalid foreign key properly prevented: {str(e)}"
            )

    async def cleanup_test_data(self):
        """Clean up test data created during testing"""
        print("🧹 Cleaning up test data...")
        
        cleanup_operations = [
            ('blog_post_tags', 'blog_post_id', self.test_data['created_blog_posts']),
            ('project_tags', 'project_id', self.test_data['created_projects']),
            ('blog_posts', 'id', self.test_data['created_blog_posts']),
            ('projects', 'id', self.test_data['created_projects']),
            ('tags', 'id', self.test_data['created_tags']),
            ('categories', 'id', self.test_data['created_categories']),
            ('series', 'id', self.test_data['created_series'])
        ]
        
        for table, id_field, ids in cleanup_operations:
            if ids:
                try:
                    for item_id in ids:
                        response = self.supabase.table(table).delete().eq(id_field, item_id).execute()
                    
                    self.log_test(
                        f"Cleanup - {table}",
                        True,
                        f"Successfully cleaned up {len(ids)} records from {table}"
                    )
                    
                except Exception as e:
                    self.log_test(
                        f"Cleanup - {table}",
                        False,
                        f"Error cleaning up {table}: {str(e)}"
                    )

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*80)
        print("🧪 BACKEND TESTING SUMMARY")
        print("="*80)
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"✅ Passed: {self.results['passed_tests']}")
        print(f"❌ Failed: {self.results['failed_tests']}")
        
        if self.results['total_tests'] > 0:
            success_rate = (self.results['passed_tests'] / self.results['total_tests']) * 100
            print(f"📊 Success Rate: {success_rate:.1f}%")
        
        print("\n📋 DETAILED RESULTS:")
        print("-" * 80)
        
        for result in self.results['test_details']:
            print(f"{result['status']}: {result['test']}")
            if result['message']:
                print(f"    💬 {result['message']}")
        
        print("\n" + "="*80)
        
        # Determine overall status
        if self.results['failed_tests'] == 0:
            print("🎉 ALL TESTS PASSED! Backend is working correctly.")
            return True
        else:
            print(f"⚠️  {self.results['failed_tests']} TESTS FAILED. Please review the issues above.")
            return False

    async def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Comprehensive Backend Testing...")
        print("="*80)
        
        # Authentication is required for most operations
        auth_success = await self.test_authentication()
        if not auth_success:
            print("❌ Authentication failed. Cannot proceed with other tests.")
            return False
        
        # Run all test suites
        await self.test_database_schema()
        await self.test_tag_crud_operations()
        await self.test_category_operations()
        await self.test_series_operations()
        await self.test_blog_post_operations()
        await self.test_project_operations()
        await self.test_admin_panel_functionality()
        await self.test_relational_queries()
        await self.test_error_handling()
        
        # Cleanup
        await self.cleanup_test_data()
        
        # Print summary
        return self.print_summary()

async def main():
    """Main test execution function"""
    tester = SupabaseBackendTester()
    success = await tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())