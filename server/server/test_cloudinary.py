#!/usr/bin/env python3
import os
import sys
import django
from pathlib import Path

# Add the project directory to the Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from dotenv import load_dotenv
load_dotenv()

def test_cloudinary_config():
    print("=== Testing Cloudinary Configuration ===")
    
    # Test environment variables
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
    api_key = os.getenv('CLOUDINARY_API_KEY')
    api_secret = os.getenv('CLOUDINARY_API_SECRET')
    
    print(f"CLOUDINARY_CLOUD_NAME: {cloud_name}")
    print(f"CLOUDINARY_API_KEY: {api_key}")
    print(f"CLOUDINARY_API_SECRET: {'✓ Set' if api_secret else '✗ Not set'}")
    
    if not all([cloud_name, api_key, api_secret]):
        print("❌ Cloudinary environment variables not properly set!")
        return False
    
    # Test Django settings
    from django.conf import settings
    print(f"\nDjango DEFAULT_FILE_STORAGE: {getattr(settings, 'DEFAULT_FILE_STORAGE', 'Not set')}")
    print(f"Django STORAGES: {getattr(settings, 'STORAGES', 'Not set')}")
    
    # Test Cloudinary connection
    try:
        import cloudinary
        import cloudinary.uploader
        
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )
        
        print("\n✅ Cloudinary configuration loaded successfully!")
        return True
        
    except ImportError:
        print("\n❌ Cloudinary package not installed!")
        return False
    except Exception as e:
        print(f"\n❌ Cloudinary configuration error: {e}")
        return False

def test_file_storage():
    print("\n=== Testing File Storage ===")
    
    try:
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile
        
        # Test storage backend
        storage_class = default_storage.__class__.__name__
        print(f"Current storage backend: {storage_class}")
        
        if 'Cloudinary' in storage_class:
            print("✅ Using Cloudinary storage!")
        else:
            print("❌ Using local file storage")
            
        return 'Cloudinary' in storage_class
        
    except Exception as e:
        print(f"❌ Error testing storage: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Cloudinary Diagnostic Test\n")
    
    config_ok = test_cloudinary_config()
    storage_ok = test_file_storage()
    
    print(f"\n=== Results ===")
    print(f"Configuration: {'✅ OK' if config_ok else '❌ FAILED'}")
    print(f"Storage Backend: {'✅ OK' if storage_ok else '❌ FAILED'}")
    
    if config_ok and storage_ok:
        print("\n🎉 Cloudinary is properly configured!")
    else:
        print("\n⚠️ Cloudinary configuration needs fixing.") 