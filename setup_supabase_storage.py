#!/usr/bin/env python3
"""
Setup Supabase Storage buckets for portfolio application
"""

from supabase import create_client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = "https://kexmzaaufxbzegurxuqz.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleG16YWF1ZnhiemVndXJ4dXF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI4MDE3MCwiZXhwIjoyMDY5ODU2MTcwfQ.6wO5p0hwNHfUDT8_cCo4mhYLnQQq8r5RYN-j8EzYEXI"

class StorageBucketManager:
    def __init__(self):
        self.client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    def create_storage_buckets(self):
        """Create all required storage buckets"""
        bucket_configs = {
            'images': {
                'public': True,
                'file_size_limit': 5242880,  # 5MB
                'allowed_mime_types': ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            },
            'videos': {
                'public': True,
                'file_size_limit': 104857600,  # 100MB
                'allowed_mime_types': ['video/mp4', 'video/webm', 'video/mov']
            },
            'documents': {
                'public': True,
                'file_size_limit': 10485760,  # 10MB
                'allowed_mime_types': ['application/pdf', 'application/msword']
            },
            'avatars': {
                'public': True,
                'file_size_limit': 2097152,  # 2MB
                'allowed_mime_types': ['image/jpeg', 'image/png', 'image/webp']
            }
        }
        
        results = {}
        for bucket_name, config in bucket_configs.items():
            try:
                result = self.create_bucket_if_not_exists(bucket_name, config)
                results[bucket_name] = result
            except Exception as e:
                logger.error(f"Failed to create bucket {bucket_name}: {e}")
                results[bucket_name] = False
        
        return results
    
    def create_bucket_if_not_exists(self, bucket_name, config):
        """Create bucket if it doesn't exist"""
        try:
            # Check if bucket exists
            buckets_response = self.client.storage.list_buckets()
            existing_buckets = [bucket['name'] for bucket in buckets_response.data or []]
            
            if bucket_name not in existing_buckets:
                # Create new bucket
                response = self.client.storage.create_bucket(bucket_name, config)
                if response.error:
                    logger.error(f"Error creating bucket {bucket_name}: {response.error}")
                    return False
                logger.info(f"✅ Created bucket: {bucket_name}")
                return True
            else:
                logger.info(f"✅ Bucket already exists: {bucket_name}")
                return True
                
        except Exception as e:
            if "already exists" in str(e).lower():
                logger.info(f"✅ Bucket already exists: {bucket_name}")
                return True
            raise e

def main():
    """Main function to create storage buckets"""
    print("🚀 Setting up Supabase Storage buckets...")
    
    manager = StorageBucketManager()
    results = manager.create_storage_buckets()
    
    print("\n📊 Bucket creation results:")
    for bucket_name, success in results.items():
        status = "✅ Success" if success else "❌ Failed"
        print(f"  {bucket_name}: {status}")
    
    if all(results.values()):
        print("\n🎉 All storage buckets are ready!")
    else:
        print("\n⚠️ Some buckets failed to create. Check the logs above.")

if __name__ == "__main__":
    main()