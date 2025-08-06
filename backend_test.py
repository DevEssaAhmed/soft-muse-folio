#!/usr/bin/env python3
"""
Backend Test Suite for Portfolio Application with Supabase Integration
Tests database operations, authentication, and CRUD functionality
"""

import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
import sys
import os

# Add the src directory to Python path to import modules
sys.path.append('/app/src')

class SupabaseTestClient:
    """Test client for Supabase operations using direct HTTP requests"""
    
    def __init__(self):
        self.base_url = "https://kexmzaaufxbzegurxuqz.supabase.co"
        self.api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleG16YWF1ZnhiemVndXJ4dXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODAxNzAsImV4cCI6MjA2OTg1NjE3MH0.FvcgUsENiqUNcKvoqIUV0ZshImSppjmXobyfb71ufog"
        self.headers = {
            "apikey": self.api_key,
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        self.auth_token = None
        
    async def authenticate(self, email: str, password: str) -> Dict[str, Any]:
        """Test authentication with email/password"""
        import aiohttp
        
        auth_url = f"{self.base_url}/auth/v1/token?grant_type=password"
        auth_data = {
            "email": email,
            "password": password
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(auth_url, json=auth_data, headers=self.headers) as response:
                    result = await response.json()
                    if response.status == 200 and "access_token" in result:
                        self.auth_token = result["access_token"]
                        # Update headers with auth token
                        self.headers["Authorization"] = f"Bearer {self.auth_token}"
                        return {"success": True, "user": result.get("user"), "token": self.auth_token}
                    else:
                        return {"success": False, "error": result.get("error_description", "Authentication failed")}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def test_table_operations(self, table_name: str, test_data: Dict[str, Any]) -> Dict[str, Any]:
        """Test CRUD operations on a specific table"""
        import aiohttp
        
        results = {
            "table": table_name,
            "create": {"success": False, "error": None},
            "read": {"success": False, "error": None},
            "update": {"success": False, "error": None},
            "delete": {"success": False, "error": None}
        }
        
        table_url = f"{self.base_url}/rest/v1/{table_name}"
        created_id = None
        
        try:
            async with aiohttp.ClientSession() as session:
                # CREATE operation
                try:
                    async with session.post(table_url, json=test_data, headers=self.headers) as response:
                        if response.status in [200, 201]:
                            create_result = await response.json()
                            if isinstance(create_result, list) and len(create_result) > 0:
                                created_id = create_result[0].get("id")
                                results["create"] = {"success": True, "id": created_id}
                            else:
                                results["create"] = {"success": True, "data": create_result}
                        else:
                            error_text = await response.text()
                            results["create"] = {"success": False, "error": f"Status {response.status}: {error_text}"}
                except Exception as e:
                    results["create"] = {"success": False, "error": str(e)}
                
                # READ operation
                if created_id:
                    try:
                        read_url = f"{table_url}?id=eq.{created_id}"
                        async with session.get(read_url, headers=self.headers) as response:
                            if response.status == 200:
                                read_result = await response.json()
                                if isinstance(read_result, list) and len(read_result) > 0:
                                    results["read"] = {"success": True, "data": read_result[0]}
                                else:
                                    results["read"] = {"success": False, "error": "No data found"}
                            else:
                                error_text = await response.text()
                                results["read"] = {"success": False, "error": f"Status {response.status}: {error_text}"}
                    except Exception as e:
                        results["read"] = {"success": False, "error": str(e)}
                
                # UPDATE operation
                if created_id:
                    try:
                        update_data = {"title": f"Updated {test_data.get('title', 'Item')}"}
                        update_url = f"{table_url}?id=eq.{created_id}"
                        async with session.patch(update_url, json=update_data, headers=self.headers) as response:
                            if response.status in [200, 204]:
                                results["update"] = {"success": True}
                            else:
                                error_text = await response.text()
                                results["update"] = {"success": False, "error": f"Status {response.status}: {error_text}"}
                    except Exception as e:
                        results["update"] = {"success": False, "error": str(e)}
                
                # DELETE operation
                if created_id:
                    try:
                        delete_url = f"{table_url}?id=eq.{created_id}"
                        async with session.delete(delete_url, headers=self.headers) as response:
                            if response.status in [200, 204]:
                                results["delete"] = {"success": True}
                            else:
                                error_text = await response.text()
                                results["delete"] = {"success": False, "error": f"Status {response.status}: {error_text}"}
                    except Exception as e:
                        results["delete"] = {"success": False, "error": str(e)}
                        
        except Exception as e:
            results["general_error"] = str(e)
            
        return results

class PortfolioBackendTester:
    """Main test class for portfolio backend functionality"""
    
    def __init__(self):
        self.client = SupabaseTestClient()
        self.test_results = []
        
    def generate_test_data(self) -> Dict[str, Dict[str, Any]]:
        """Generate realistic test data for each table"""
        unique_id = str(uuid.uuid4())[:8]
        
        return {
            "projects": {
                "id": str(uuid.uuid4()),
                "title": f"Test Portfolio Project {unique_id}",
                "description": "A comprehensive web application built with React and TypeScript, featuring modern UI components and responsive design.",
                "category": "Web Development",
                "tags": ["React", "TypeScript", "Tailwind CSS", "Supabase"],
                "github_url": "https://github.com/testuser/portfolio-project",
                "demo_url": "https://portfolio-demo.vercel.app",
                "image_url": "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800",
                "featured": True,
                "likes": 0,
                "views": 0,
                "comments": 0
            },
            "blog_posts": {
                "id": str(uuid.uuid4()),
                "title": f"Building Modern Web Applications {unique_id}",
                "slug": f"building-modern-web-apps-{unique_id}",
                "content": "# Building Modern Web Applications\n\nIn this comprehensive guide, we'll explore the latest trends and best practices in modern web development...",
                "excerpt": "Learn how to build scalable and maintainable web applications using modern frameworks and tools.",
                "tags": ["Web Development", "React", "Best Practices"],
                "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
                "published": True,
                "reading_time": 8,
                "likes": 0,
                "views": 0
            },
            "profile": {
                "id": str(uuid.uuid4()),
                "name": "John Developer",
                "username": f"johndeveloper{unique_id}",
                "title": "Full Stack Developer",
                "bio": "Passionate full-stack developer with expertise in React, Node.js, and cloud technologies. Love building scalable web applications.",
                "email": f"john.developer{unique_id}@example.com",
                "location": "San Francisco, CA",
                "website_url": "https://johndeveloper.dev",
                "github_url": "https://github.com/johndeveloper",
                "linkedin_url": "https://linkedin.com/in/johndeveloper",
                "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
                "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS"],
                "stats": {
                    "projects_completed": 25,
                    "years_experience": 5,
                    "technologies_used": 15,
                    "clients_served": 12
                }
            }
        }
    
    async def test_database_connection(self) -> Dict[str, Any]:
        """Test basic database connectivity"""
        import aiohttp
        
        try:
            async with aiohttp.ClientSession() as session:
                # Test basic API endpoint
                url = f"{self.client.base_url}/rest/v1/projects?limit=1"
                async with session.get(url, headers=self.client.headers) as response:
                    if response.status == 200:
                        return {"success": True, "message": "Database connection successful"}
                    else:
                        error_text = await response.text()
                        return {"success": False, "error": f"Status {response.status}: {error_text}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def test_authentication_flow(self) -> Dict[str, Any]:
        """Test authentication with various scenarios"""
        results = {
            "invalid_credentials": {"success": False, "error": None},
            "connection_test": {"success": False, "error": None}
        }
        
        # Test with invalid credentials
        invalid_result = await self.client.authenticate("invalid@example.com", "wrongpassword")
        results["invalid_credentials"] = {
            "success": not invalid_result["success"],  # We expect this to fail
            "error": invalid_result.get("error", "No error returned")
        }
        
        # Test connection without authentication
        connection_result = await self.test_database_connection()
        results["connection_test"] = connection_result
        
        return results
    
    async def test_all_tables(self) -> List[Dict[str, Any]]:
        """Test CRUD operations on all tables"""
        test_data = self.generate_test_data()
        table_results = []
        
        for table_name, data in test_data.items():
            print(f"Testing {table_name} table...")
            result = await self.client.test_table_operations(table_name, data)
            table_results.append(result)
            
        return table_results
    
    async def test_specific_queries(self) -> Dict[str, Any]:
        """Test specific query patterns used in the application"""
        import aiohttp
        
        results = {
            "blog_by_slug": {"success": False, "error": None},
            "featured_projects": {"success": False, "error": None},
            "published_posts": {"success": False, "error": None}
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                # Test blog post by slug query
                try:
                    url = f"{self.client.base_url}/rest/v1/blog_posts?slug=eq.test-slug&limit=1"
                    async with session.get(url, headers=self.client.headers) as response:
                        if response.status == 200:
                            results["blog_by_slug"] = {"success": True}
                        else:
                            error_text = await response.text()
                            results["blog_by_slug"] = {"success": False, "error": f"Status {response.status}: {error_text}"}
                except Exception as e:
                    results["blog_by_slug"] = {"success": False, "error": str(e)}
                
                # Test featured projects query
                try:
                    url = f"{self.client.base_url}/rest/v1/projects?featured=eq.true"
                    async with session.get(url, headers=self.client.headers) as response:
                        if response.status == 200:
                            results["featured_projects"] = {"success": True}
                        else:
                            error_text = await response.text()
                            results["featured_projects"] = {"success": False, "error": f"Status {response.status}: {error_text}"}
                except Exception as e:
                    results["featured_projects"] = {"success": False, "error": str(e)}
                
                # Test published posts query
                try:
                    url = f"{self.client.base_url}/rest/v1/blog_posts?published=eq.true"
                    async with session.get(url, headers=self.client.headers) as response:
                        if response.status == 200:
                            results["published_posts"] = {"success": True}
                        else:
                            error_text = await response.text()
                            results["published_posts"] = {"success": False, "error": f"Status {response.status}: {error_text}"}
                except Exception as e:
                    results["published_posts"] = {"success": False, "error": str(e)}
                    
        except Exception as e:
            results["general_error"] = str(e)
            
        return results
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run comprehensive test suite"""
        print("🚀 Starting Portfolio Backend Test Suite...")
        print("=" * 60)
        
        all_results = {
            "timestamp": datetime.now().isoformat(),
            "database_connection": None,
            "authentication": None,
            "table_operations": [],
            "specific_queries": None,
            "summary": {
                "total_tests": 0,
                "passed_tests": 0,
                "failed_tests": 0,
                "critical_failures": []
            }
        }
        
        # Test 1: Database Connection
        print("\n1. Testing Database Connection...")
        connection_result = await self.test_database_connection()
        all_results["database_connection"] = connection_result
        print(f"   Result: {'✅ PASS' if connection_result['success'] else '❌ FAIL'}")
        if not connection_result['success']:
            print(f"   Error: {connection_result.get('error', 'Unknown error')}")
            all_results["summary"]["critical_failures"].append("Database connection failed")
        
        # Test 2: Authentication
        print("\n2. Testing Authentication Flow...")
        auth_result = await self.test_authentication_flow()
        all_results["authentication"] = auth_result
        auth_passed = all(result.get("success", False) for result in auth_result.values())
        print(f"   Result: {'✅ PASS' if auth_passed else '❌ FAIL'}")
        
        # Test 3: Table Operations
        print("\n3. Testing Table CRUD Operations...")
        table_results = await self.test_all_tables()
        all_results["table_operations"] = table_results
        
        for table_result in table_results:
            table_name = table_result["table"]
            operations = ["create", "read", "update", "delete"]
            passed_ops = sum(1 for op in operations if table_result.get(op, {}).get("success", False))
            print(f"   {table_name}: {passed_ops}/{len(operations)} operations passed")
            
            if passed_ops < len(operations):
                failed_ops = [op for op in operations if not table_result.get(op, {}).get("success", False)]
                all_results["summary"]["critical_failures"].append(f"{table_name} table: {', '.join(failed_ops)} operations failed")
        
        # Test 4: Specific Queries
        print("\n4. Testing Application-Specific Queries...")
        query_result = await self.test_specific_queries()
        all_results["specific_queries"] = query_result
        query_passed = all(result.get("success", False) for result in query_result.values() if isinstance(result, dict))
        print(f"   Result: {'✅ PASS' if query_passed else '❌ FAIL'}")
        
        # Calculate summary
        total_tests = 1  # database connection
        total_tests += len(auth_result)  # authentication tests
        total_tests += sum(4 for _ in table_results)  # 4 operations per table
        total_tests += len([k for k, v in query_result.items() if isinstance(v, dict)])  # specific queries
        
        passed_tests = 0
        if connection_result['success']:
            passed_tests += 1
        passed_tests += sum(1 for result in auth_result.values() if result.get("success", False))
        passed_tests += sum(sum(1 for op in ["create", "read", "update", "delete"] if table_result.get(op, {}).get("success", False)) for table_result in table_results)
        passed_tests += sum(1 for result in query_result.values() if isinstance(result, dict) and result.get("success", False))
        
        all_results["summary"]["total_tests"] = total_tests
        all_results["summary"]["passed_tests"] = passed_tests
        all_results["summary"]["failed_tests"] = total_tests - passed_tests
        
        # Print final summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {total_tests - passed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if all_results["summary"]["critical_failures"]:
            print("\n🚨 CRITICAL FAILURES:")
            for failure in all_results["summary"]["critical_failures"]:
                print(f"   • {failure}")
        
        return all_results

async def main():
    """Main test execution function"""
    try:
        # Install required dependencies
        import subprocess
        import sys
        
        print("Installing required dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "aiohttp", "--quiet"])
        
        tester = PortfolioBackendTester()
        results = await tester.run_all_tests()
        
        # Save results to file
        with open('/app/backend_test_results.json', 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
        
        # Return exit code based on critical failures
        if results["summary"]["critical_failures"]:
            return 1
        return 0
        
    except Exception as e:
        print(f"❌ Test execution failed: {str(e)}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)