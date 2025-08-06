#!/usr/bin/env python3
"""
Authentication Test with Provided Credentials
"""

import asyncio
import json
import aiohttp

async def test_auth_with_credentials():
    """Test authentication with provided credentials"""
    
    base_url = "https://kexmzaaufxbzegurxuqz.supabase.co"
    api_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleG16YWF1ZnhiemVndXJ4dXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyODAxNzAsImV4cCI6MjA2OTg1NjE3MH0.FvcgUsENiqUNcKvoqIUV0ZshImSppjmXobyfb71ufog"
    
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Test credentials
    email = "essaahmedsiddiqui@gmail.com"
    password = "shadow"
    
    auth_url = f"{base_url}/auth/v1/token?grant_type=password"
    auth_data = {
        "email": email,
        "password": password
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(auth_url, json=auth_data, headers=headers) as response:
                result = await response.json()
                
                if response.status == 200 and "access_token" in result:
                    print("✅ Authentication successful!")
                    print(f"User ID: {result.get('user', {}).get('id', 'N/A')}")
                    print(f"Email: {result.get('user', {}).get('email', 'N/A')}")
                    print(f"Token expires: {result.get('expires_at', 'N/A')}")
                    return True
                else:
                    print("❌ Authentication failed!")
                    print(f"Status: {response.status}")
                    print(f"Error: {result.get('error_description', result)}")
                    return False
                    
    except Exception as e:
        print(f"❌ Authentication error: {str(e)}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_auth_with_credentials())
    exit(0 if success else 1)