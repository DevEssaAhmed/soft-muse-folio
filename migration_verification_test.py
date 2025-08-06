#!/usr/bin/env python3
"""
Migration Verification Test - Detailed check of migration results
"""

import asyncio
import json
import aiohttp

async def verify_migrations():
    """Verify that all migrations were applied successfully"""
    
    base_url = "https://kexmzaaufxbzegurxuqz.supabase.co"
    api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleG16YWF1ZnhiemVndXJ4dXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODAxNzAsImV4cCI6MjA2OTg1NjE3MH0.FvcgUsENiqUNcKvoqIUV0ZshImSppjmXobyfb71ufog"
    
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    results = {
        "site_settings_table": {"exists": False, "has_hero_stats": False, "hero_stats_data": None},
        "categories_table": {"exists": False, "sample_count": 0, "sample_data": []},
        "series_table": {"exists": False, "sample_count": 0, "sample_data": []},
        "blog_posts_columns": {"has_category_id": False, "has_series_id": False},
        "projects_columns": {"has_category_id": False}
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            
            # 1. Check site_settings table and hero_stats data
            print("🔍 Checking site_settings table...")
            try:
                url = f"{base_url}/rest/v1/site_settings"
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        results["site_settings_table"]["exists"] = True
                        data = await response.json()
                        print(f"   ✅ site_settings table exists with {len(data)} records")
                        
                        # Check for hero_stats specifically
                        hero_stats_url = f"{base_url}/rest/v1/site_settings?key=eq.hero_stats"
                        async with session.get(hero_stats_url, headers=headers) as hero_response:
                            if hero_response.status == 200:
                                hero_data = await hero_response.json()
                                if hero_data:
                                    results["site_settings_table"]["has_hero_stats"] = True
                                    results["site_settings_table"]["hero_stats_data"] = hero_data[0]
                                    print(f"   ✅ Hero stats found: {hero_data[0]['value']}")
                                else:
                                    print("   ⚠️  No hero_stats record found")
                    else:
                        print(f"   ❌ site_settings table check failed: {response.status}")
            except Exception as e:
                print(f"   ❌ Error checking site_settings: {str(e)}")
            
            # 2. Check categories table
            print("\n🔍 Checking categories table...")
            try:
                url = f"{base_url}/rest/v1/categories?limit=5"
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        results["categories_table"]["exists"] = True
                        data = await response.json()
                        results["categories_table"]["sample_count"] = len(data)
                        results["categories_table"]["sample_data"] = data
                        print(f"   ✅ categories table exists with {len(data)} sample records")
                        for cat in data[:3]:  # Show first 3
                            print(f"      - {cat.get('name', 'N/A')} ({cat.get('type', 'N/A')})")
                    else:
                        print(f"   ❌ categories table check failed: {response.status}")
            except Exception as e:
                print(f"   ❌ Error checking categories: {str(e)}")
            
            # 3. Check series table
            print("\n🔍 Checking series table...")
            try:
                url = f"{base_url}/rest/v1/series?limit=5"
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        results["series_table"]["exists"] = True
                        data = await response.json()
                        results["series_table"]["sample_count"] = len(data)
                        results["series_table"]["sample_data"] = data
                        print(f"   ✅ series table exists with {len(data)} sample records")
                        for series in data[:3]:  # Show first 3
                            print(f"      - {series.get('title', 'N/A')} ({series.get('status', 'N/A')})")
                    else:
                        print(f"   ❌ series table check failed: {response.status}")
            except Exception as e:
                print(f"   ❌ Error checking series: {str(e)}")
            
            # 4. Check blog_posts table for new columns
            print("\n🔍 Checking blog_posts table columns...")
            try:
                url = f"{base_url}/rest/v1/blog_posts?limit=1"
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data:
                            sample_post = data[0]
                            results["blog_posts_columns"]["has_category_id"] = "category_id" in sample_post
                            results["blog_posts_columns"]["has_series_id"] = "series_id" in sample_post
                            print(f"   ✅ blog_posts table accessible")
                            print(f"      - category_id column: {'✅' if results['blog_posts_columns']['has_category_id'] else '❌'}")
                            print(f"      - series_id column: {'✅' if results['blog_posts_columns']['has_series_id'] else '❌'}")
                        else:
                            print("   ⚠️  No blog posts found to check columns")
                    else:
                        print(f"   ❌ blog_posts table check failed: {response.status}")
            except Exception as e:
                print(f"   ❌ Error checking blog_posts: {str(e)}")
            
            # 5. Check projects table for new columns
            print("\n🔍 Checking projects table columns...")
            try:
                url = f"{base_url}/rest/v1/projects?limit=1"
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data:
                            sample_project = data[0]
                            results["projects_columns"]["has_category_id"] = "category_id" in sample_project
                            print(f"   ✅ projects table accessible")
                            print(f"      - category_id column: {'✅' if results['projects_columns']['has_category_id'] else '❌'}")
                        else:
                            print("   ⚠️  No projects found to check columns")
                    else:
                        print(f"   ❌ projects table check failed: {response.status}")
            except Exception as e:
                print(f"   ❌ Error checking projects: {str(e)}")
    
    except Exception as e:
        print(f"❌ General error during migration verification: {str(e)}")
    
    # Summary
    print("\n" + "="*60)
    print("📊 MIGRATION VERIFICATION SUMMARY")
    print("="*60)
    
    all_good = True
    
    if results["site_settings_table"]["exists"] and results["site_settings_table"]["has_hero_stats"]:
        print("✅ Site Settings & Hero Stats: WORKING")
    else:
        print("❌ Site Settings & Hero Stats: FAILED")
        all_good = False
    
    if results["categories_table"]["exists"] and results["categories_table"]["sample_count"] > 0:
        print(f"✅ Categories Table: WORKING ({results['categories_table']['sample_count']} records)")
    else:
        print("❌ Categories Table: FAILED")
        all_good = False
    
    if results["series_table"]["exists"] and results["series_table"]["sample_count"] > 0:
        print(f"✅ Series Table: WORKING ({results['series_table']['sample_count']} records)")
    else:
        print("❌ Series Table: FAILED")
        all_good = False
    
    if results["blog_posts_columns"]["has_category_id"] and results["blog_posts_columns"]["has_series_id"]:
        print("✅ Blog Posts New Columns: WORKING")
    else:
        print("❌ Blog Posts New Columns: FAILED")
        all_good = False
    
    if results["projects_columns"]["has_category_id"]:
        print("✅ Projects New Columns: WORKING")
    else:
        print("❌ Projects New Columns: FAILED")
        all_good = False
    
    print(f"\n🎯 Overall Migration Status: {'✅ SUCCESS' if all_good else '❌ FAILED'}")
    
    # Save detailed results
    with open('/app/migration_verification_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    return all_good

if __name__ == "__main__":
    success = asyncio.run(verify_migrations())
    exit(0 if success else 1)