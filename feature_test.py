#!/usr/bin/env python3
"""
Additional Backend Tests for Portfolio Application Features
Tests view counters, like functionality, and specific application features
"""

import asyncio
import json
import uuid
from datetime import datetime
import sys

class PortfolioFeatureTester:
    """Test specific portfolio application features"""
    
    def __init__(self):
        self.base_url = "https://kexmzaaufxbzegurxuqz.supabase.co"
        self.api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleG16YWF1ZnhiemVndXJ4dXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODAxNzAsImV4cCI6MjA2OTg1NjE3MH0.FvcgUsENiqUNcKvoqIUV0ZshImSppjmXobyfb71ufog"
        self.headers = {
            "apikey": self.api_key,
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
    async def test_view_counter_functionality(self) -> dict:
        """Test view counter increment functionality"""
        import aiohttp
        
        results = {
            "project_view_increment": {"success": False, "error": None},
            "blog_view_increment": {"success": False, "error": None}
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                # Create a test project first
                project_data = {
                    "id": str(uuid.uuid4()),
                    "title": f"View Test Project {uuid.uuid4().hex[:8]}",
                    "description": "Test project for view counter functionality",
                    "category": "Testing",
                    "views": 0
                }
                
                # Create project
                create_url = f"{self.base_url}/rest/v1/projects"
                async with session.post(create_url, json=project_data, headers=self.headers) as response:
                    if response.status in [200, 201]:
                        created_project = await response.json()
                        project_id = created_project[0]["id"] if isinstance(created_project, list) else created_project["id"]
                        
                        # Test view increment
                        update_url = f"{self.base_url}/rest/v1/projects?id=eq.{project_id}"
                        update_data = {"views": 1}
                        
                        async with session.patch(update_url, json=update_data, headers=self.headers) as update_response:
                            if update_response.status in [200, 204]:
                                # Verify the view was incremented
                                read_url = f"{self.base_url}/rest/v1/projects?id=eq.{project_id}"
                                async with session.get(read_url, headers=self.headers) as read_response:
                                    if read_response.status == 200:
                                        updated_project = await read_response.json()
                                        if updated_project and updated_project[0]["views"] == 1:
                                            results["project_view_increment"] = {"success": True}
                                        else:
                                            results["project_view_increment"] = {"success": False, "error": "View count not updated correctly"}
                                    else:
                                        results["project_view_increment"] = {"success": False, "error": "Failed to read updated project"}
                            else:
                                error_text = await update_response.text()
                                results["project_view_increment"] = {"success": False, "error": f"Update failed: {error_text}"}
                        
                        # Clean up
                        delete_url = f"{self.base_url}/rest/v1/projects?id=eq.{project_id}"
                        await session.delete(delete_url, headers=self.headers)
                        
                    else:
                        error_text = await response.text()
                        results["project_view_increment"] = {"success": False, "error": f"Failed to create test project: {error_text}"}
                
                # Test blog post view increment
                blog_data = {
                    "id": str(uuid.uuid4()),
                    "title": f"View Test Blog {uuid.uuid4().hex[:8]}",
                    "slug": f"view-test-blog-{uuid.uuid4().hex[:8]}",
                    "content": "Test blog post for view counter functionality",
                    "views": 0
                }
                
                # Create blog post
                create_url = f"{self.base_url}/rest/v1/blog_posts"
                async with session.post(create_url, json=blog_data, headers=self.headers) as response:
                    if response.status in [200, 201]:
                        created_blog = await response.json()
                        blog_id = created_blog[0]["id"] if isinstance(created_blog, list) else created_blog["id"]
                        
                        # Test view increment
                        update_url = f"{self.base_url}/rest/v1/blog_posts?id=eq.{blog_id}"
                        update_data = {"views": 1}
                        
                        async with session.patch(update_url, json=update_data, headers=self.headers) as update_response:
                            if update_response.status in [200, 204]:
                                results["blog_view_increment"] = {"success": True}
                            else:
                                error_text = await update_response.text()
                                results["blog_view_increment"] = {"success": False, "error": f"Update failed: {error_text}"}
                        
                        # Clean up
                        delete_url = f"{self.base_url}/rest/v1/blog_posts?id=eq.{blog_id}"
                        await session.delete(delete_url, headers=self.headers)
                        
                    else:
                        error_text = await response.text()
                        results["blog_view_increment"] = {"success": False, "error": f"Failed to create test blog: {error_text}"}
                        
        except Exception as e:
            results["general_error"] = str(e)
            
        return results
    
    async def test_like_functionality(self) -> dict:
        """Test like/unlike functionality"""
        import aiohttp
        
        results = {
            "project_like_increment": {"success": False, "error": None},
            "blog_like_increment": {"success": False, "error": None}
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                # Test project likes
                project_data = {
                    "id": str(uuid.uuid4()),
                    "title": f"Like Test Project {uuid.uuid4().hex[:8]}",
                    "description": "Test project for like functionality",
                    "category": "Testing",
                    "likes": 0
                }
                
                # Create project
                create_url = f"{self.base_url}/rest/v1/projects"
                async with session.post(create_url, json=project_data, headers=self.headers) as response:
                    if response.status in [200, 201]:
                        created_project = await response.json()
                        project_id = created_project[0]["id"] if isinstance(created_project, list) else created_project["id"]
                        
                        # Test like increment
                        update_url = f"{self.base_url}/rest/v1/projects?id=eq.{project_id}"
                        update_data = {"likes": 1}
                        
                        async with session.patch(update_url, json=update_data, headers=self.headers) as update_response:
                            if update_response.status in [200, 204]:
                                results["project_like_increment"] = {"success": True}
                            else:
                                error_text = await update_response.text()
                                results["project_like_increment"] = {"success": False, "error": f"Update failed: {error_text}"}
                        
                        # Clean up
                        delete_url = f"{self.base_url}/rest/v1/projects?id=eq.{project_id}"
                        await session.delete(delete_url, headers=self.headers)
                        
                    else:
                        error_text = await response.text()
                        results["project_like_increment"] = {"success": False, "error": f"Failed to create test project: {error_text}"}
                
                # Test blog post likes
                blog_data = {
                    "id": str(uuid.uuid4()),
                    "title": f"Like Test Blog {uuid.uuid4().hex[:8]}",
                    "slug": f"like-test-blog-{uuid.uuid4().hex[:8]}",
                    "content": "Test blog post for like functionality",
                    "likes": 0
                }
                
                # Create blog post
                create_url = f"{self.base_url}/rest/v1/blog_posts"
                async with session.post(create_url, json=blog_data, headers=self.headers) as response:
                    if response.status in [200, 201]:
                        created_blog = await response.json()
                        blog_id = created_blog[0]["id"] if isinstance(created_blog, list) else created_blog["id"]
                        
                        # Test like increment
                        update_url = f"{self.base_url}/rest/v1/blog_posts?id=eq.{blog_id}"
                        update_data = {"likes": 1}
                        
                        async with session.patch(update_url, json=update_data, headers=self.headers) as update_response:
                            if update_response.status in [200, 204]:
                                results["blog_like_increment"] = {"success": True}
                            else:
                                error_text = await update_response.text()
                                results["blog_like_increment"] = {"success": False, "error": f"Update failed: {error_text}"}
                        
                        # Clean up
                        delete_url = f"{self.base_url}/rest/v1/blog_posts?id=eq.{blog_id}"
                        await session.delete(delete_url, headers=self.headers)
                        
                    else:
                        error_text = await response.text()
                        results["blog_like_increment"] = {"success": False, "error": f"Failed to create test blog: {error_text}"}
                        
        except Exception as e:
            results["general_error"] = str(e)
            
        return results
    
    async def test_slug_based_queries(self) -> dict:
        """Test slug-based blog post queries"""
        import aiohttp
        
        results = {
            "create_with_slug": {"success": False, "error": None},
            "query_by_slug": {"success": False, "error": None},
            "unique_slug_constraint": {"success": False, "error": None}
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                unique_slug = f"test-blog-post-{uuid.uuid4().hex[:8]}"
                
                blog_data = {
                    "id": str(uuid.uuid4()),
                    "title": f"Slug Test Blog Post",
                    "slug": unique_slug,
                    "content": "Test blog post for slug-based queries",
                    "published": True
                }
                
                # Create blog post with slug
                create_url = f"{self.base_url}/rest/v1/blog_posts"
                async with session.post(create_url, json=blog_data, headers=self.headers) as response:
                    if response.status in [200, 201]:
                        results["create_with_slug"] = {"success": True}
                        
                        # Test query by slug
                        query_url = f"{self.base_url}/rest/v1/blog_posts?slug=eq.{unique_slug}"
                        async with session.get(query_url, headers=self.headers) as query_response:
                            if query_response.status == 200:
                                query_result = await query_response.json()
                                if query_result and len(query_result) == 1 and query_result[0]["slug"] == unique_slug:
                                    results["query_by_slug"] = {"success": True}
                                else:
                                    results["query_by_slug"] = {"success": False, "error": "Slug query returned unexpected results"}
                            else:
                                error_text = await query_response.text()
                                results["query_by_slug"] = {"success": False, "error": f"Query failed: {error_text}"}
                        
                        # Test unique slug constraint (try to create duplicate)
                        duplicate_data = blog_data.copy()
                        duplicate_data["id"] = str(uuid.uuid4())
                        duplicate_data["title"] = "Duplicate Slug Test"
                        
                        async with session.post(create_url, json=duplicate_data, headers=self.headers) as dup_response:
                            if dup_response.status >= 400:  # Should fail due to unique constraint
                                results["unique_slug_constraint"] = {"success": True}
                            else:
                                results["unique_slug_constraint"] = {"success": False, "error": "Duplicate slug was allowed"}
                        
                        # Clean up
                        delete_url = f"{self.base_url}/rest/v1/blog_posts?slug=eq.{unique_slug}"
                        await session.delete(delete_url, headers=self.headers)
                        
                    else:
                        error_text = await response.text()
                        results["create_with_slug"] = {"success": False, "error": f"Failed to create blog post: {error_text}"}
                        
        except Exception as e:
            results["general_error"] = str(e)
            
        return results
    
    async def test_published_draft_functionality(self) -> dict:
        """Test published vs draft blog post functionality"""
        import aiohttp
        
        results = {
            "create_draft": {"success": False, "error": None},
            "create_published": {"success": False, "error": None},
            "query_published_only": {"success": False, "error": None}
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                # Create draft post
                draft_data = {
                    "id": str(uuid.uuid4()),
                    "title": f"Draft Post {uuid.uuid4().hex[:8]}",
                    "slug": f"draft-post-{uuid.uuid4().hex[:8]}",
                    "content": "This is a draft blog post",
                    "published": False
                }
                
                create_url = f"{self.base_url}/rest/v1/blog_posts"
                async with session.post(create_url, json=draft_data, headers=self.headers) as response:
                    if response.status in [200, 201]:
                        results["create_draft"] = {"success": True}
                        draft_id = (await response.json())[0]["id"]
                    else:
                        error_text = await response.text()
                        results["create_draft"] = {"success": False, "error": f"Failed to create draft: {error_text}"}
                
                # Create published post
                published_data = {
                    "id": str(uuid.uuid4()),
                    "title": f"Published Post {uuid.uuid4().hex[:8]}",
                    "slug": f"published-post-{uuid.uuid4().hex[:8]}",
                    "content": "This is a published blog post",
                    "published": True
                }
                
                async with session.post(create_url, json=published_data, headers=self.headers) as response:
                    if response.status in [200, 201]:
                        results["create_published"] = {"success": True}
                        published_id = (await response.json())[0]["id"]
                    else:
                        error_text = await response.text()
                        results["create_published"] = {"success": False, "error": f"Failed to create published post: {error_text}"}
                
                # Test query for published posts only
                query_url = f"{self.base_url}/rest/v1/blog_posts?published=eq.true"
                async with session.get(query_url, headers=self.headers) as response:
                    if response.status == 200:
                        published_posts = await response.json()
                        # Check that all returned posts are published
                        all_published = all(post["published"] for post in published_posts)
                        if all_published:
                            results["query_published_only"] = {"success": True}
                        else:
                            results["query_published_only"] = {"success": False, "error": "Query returned unpublished posts"}
                    else:
                        error_text = await response.text()
                        results["query_published_only"] = {"success": False, "error": f"Query failed: {error_text}"}
                
                # Clean up
                if 'draft_id' in locals():
                    delete_url = f"{self.base_url}/rest/v1/blog_posts?id=eq.{draft_id}"
                    await session.delete(delete_url, headers=self.headers)
                if 'published_id' in locals():
                    delete_url = f"{self.base_url}/rest/v1/blog_posts?id=eq.{published_id}"
                    await session.delete(delete_url, headers=self.headers)
                    
        except Exception as e:
            results["general_error"] = str(e)
            
        return results
    
    async def run_feature_tests(self) -> dict:
        """Run all feature-specific tests"""
        print("🧪 Starting Portfolio Feature Tests...")
        print("=" * 50)
        
        all_results = {
            "timestamp": datetime.now().isoformat(),
            "view_counters": None,
            "like_functionality": None,
            "slug_queries": None,
            "published_draft": None,
            "summary": {
                "total_tests": 0,
                "passed_tests": 0,
                "failed_tests": 0
            }
        }
        
        # Test view counters
        print("\n1. Testing View Counter Functionality...")
        view_results = await self.test_view_counter_functionality()
        all_results["view_counters"] = view_results
        view_passed = sum(1 for result in view_results.values() if isinstance(result, dict) and result.get("success", False))
        print(f"   Result: {view_passed}/{len([k for k, v in view_results.items() if isinstance(v, dict)])} tests passed")
        
        # Test like functionality
        print("\n2. Testing Like Functionality...")
        like_results = await self.test_like_functionality()
        all_results["like_functionality"] = like_results
        like_passed = sum(1 for result in like_results.values() if isinstance(result, dict) and result.get("success", False))
        print(f"   Result: {like_passed}/{len([k for k, v in like_results.items() if isinstance(v, dict)])} tests passed")
        
        # Test slug queries
        print("\n3. Testing Slug-based Queries...")
        slug_results = await self.test_slug_based_queries()
        all_results["slug_queries"] = slug_results
        slug_passed = sum(1 for result in slug_results.values() if isinstance(result, dict) and result.get("success", False))
        print(f"   Result: {slug_passed}/{len([k for k, v in slug_results.items() if isinstance(v, dict)])} tests passed")
        
        # Test published/draft functionality
        print("\n4. Testing Published/Draft Functionality...")
        draft_results = await self.test_published_draft_functionality()
        all_results["published_draft"] = draft_results
        draft_passed = sum(1 for result in draft_results.values() if isinstance(result, dict) and result.get("success", False))
        print(f"   Result: {draft_passed}/{len([k for k, v in draft_results.items() if isinstance(v, dict)])} tests passed")
        
        # Calculate summary
        total_tests = (len([k for k, v in view_results.items() if isinstance(v, dict)]) +
                      len([k for k, v in like_results.items() if isinstance(v, dict)]) +
                      len([k for k, v in slug_results.items() if isinstance(v, dict)]) +
                      len([k for k, v in draft_results.items() if isinstance(v, dict)]))
        
        passed_tests = view_passed + like_passed + slug_passed + draft_passed
        
        all_results["summary"]["total_tests"] = total_tests
        all_results["summary"]["passed_tests"] = passed_tests
        all_results["summary"]["failed_tests"] = total_tests - passed_tests
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 FEATURE TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {total_tests - passed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        return all_results

async def main():
    """Main test execution function"""
    try:
        # Install required dependencies
        import subprocess
        import sys
        
        subprocess.check_call([sys.executable, "-m", "pip", "install", "aiohttp", "--quiet"])
        
        tester = PortfolioFeatureTester()
        results = await tester.run_feature_tests()
        
        # Save results to file
        with open('/app/feature_test_results.json', 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"\n📄 Detailed results saved to: /app/feature_test_results.json")
        
        return 0 if results["summary"]["failed_tests"] == 0 else 1
        
    except Exception as e:
        print(f"❌ Feature test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)