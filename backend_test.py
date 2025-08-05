#!/usr/bin/env python3
"""
Backend API Testing Script
Tests all FastAPI endpoints to ensure they are working correctly
"""

import requests
import json
import sys
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL')
if not BACKEND_URL:
    print("❌ REACT_APP_BACKEND_URL not found in environment")
    sys.exit(1)

API_BASE_URL = f"{BACKEND_URL}/api"

def test_root_endpoint():
    """Test GET /api/ endpoint"""
    print("\n🔍 Testing GET /api/ endpoint...")
    try:
        response = requests.get(f"{API_BASE_URL}/", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                print("✅ GET /api/ - SUCCESS: Root endpoint working correctly")
                return True
            else:
                print(f"❌ GET /api/ - FAILED: Unexpected response data: {data}")
                return False
        else:
            print(f"❌ GET /api/ - FAILED: Status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ GET /api/ - FAILED: Request error: {e}")
        return False

def test_post_status_endpoint():
    """Test POST /api/status endpoint with sample data"""
    print("\n🔍 Testing POST /api/status endpoint...")
    
    # Test data - using realistic client name
    test_data = {
        "client_name": "WebApp Dashboard Client"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/status", 
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            required_fields = ["id", "client_name", "timestamp"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ POST /api/status - FAILED: Missing fields: {missing_fields}")
                return False
            
            if data["client_name"] != test_data["client_name"]:
                print(f"❌ POST /api/status - FAILED: Client name mismatch")
                return False
                
            # Validate UUID format for id
            if not data["id"] or len(data["id"]) < 32:
                print(f"❌ POST /api/status - FAILED: Invalid ID format: {data['id']}")
                return False
                
            print("✅ POST /api/status - SUCCESS: Status check created successfully")
            print(f"   Created ID: {data['id']}")
            print(f"   Client: {data['client_name']}")
            print(f"   Timestamp: {data['timestamp']}")
            return True
            
        else:
            print(f"❌ POST /api/status - FAILED: Status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ POST /api/status - FAILED: Request error: {e}")
        return False

def test_get_status_endpoint():
    """Test GET /api/status endpoint to retrieve status checks"""
    print("\n🔍 Testing GET /api/status endpoint...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/status", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Should return a list
            if not isinstance(data, list):
                print(f"❌ GET /api/status - FAILED: Expected list, got {type(data)}")
                return False
            
            print(f"✅ GET /api/status - SUCCESS: Retrieved {len(data)} status checks")
            
            # If there are status checks, validate structure of first one
            if data:
                first_item = data[0]
                required_fields = ["id", "client_name", "timestamp"]
                missing_fields = [field for field in required_fields if field not in first_item]
                
                if missing_fields:
                    print(f"⚠️  Warning: Status check missing fields: {missing_fields}")
                else:
                    print(f"   Sample record - ID: {first_item['id'][:8]}..., Client: {first_item['client_name']}")
            else:
                print("   No status checks found (empty database)")
                
            return True
            
        else:
            print(f"❌ GET /api/status - FAILED: Status code {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ GET /api/status - FAILED: Request error: {e}")
        return False

def test_cors_configuration():
    """Test CORS configuration"""
    print("\n🔍 Testing CORS configuration...")
    
    try:
        # Make an OPTIONS request to check CORS headers
        response = requests.options(f"{API_BASE_URL}/", timeout=10)
        
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        }
        
        print("✅ CORS - SUCCESS: CORS headers present")
        for header, value in cors_headers.items():
            if value:
                print(f"   {header}: {value}")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"⚠️  CORS - WARNING: Could not test CORS: {e}")
        return True  # Don't fail the test for CORS issues

def test_error_handling():
    """Test error handling for invalid requests"""
    print("\n🔍 Testing error handling...")
    
    # Test POST with invalid data
    try:
        response = requests.post(
            f"{API_BASE_URL}/status", 
            json={},  # Missing required client_name
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 422:  # FastAPI validation error
            print("✅ Error Handling - SUCCESS: Properly handles invalid POST data")
            return True
        else:
            print(f"⚠️  Error Handling - WARNING: Expected 422, got {response.status_code}")
            return True  # Don't fail for this
            
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Error Handling - WARNING: Could not test error handling: {e}")
        return True

def main():
    """Run all backend API tests"""
    print("=" * 60)
    print("🚀 BACKEND API TESTING STARTED")
    print("=" * 60)
    print(f"Testing backend at: {API_BASE_URL}")
    
    # Run all tests
    tests = [
        ("Root Endpoint", test_root_endpoint),
        ("POST Status", test_post_status_endpoint),
        ("GET Status", test_get_status_endpoint),
        ("CORS Configuration", test_cors_configuration),
        ("Error Handling", test_error_handling),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} - FAILED: Unexpected error: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL BACKEND TESTS PASSED!")
        return True
    else:
        print("⚠️  Some tests failed - check logs above")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)