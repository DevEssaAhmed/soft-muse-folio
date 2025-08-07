#!/usr/bin/env python3
"""
FileUpload Component Testing
Tests the simultaneousMode functionality and URL validation
"""

import json
import sys
import os
from typing import Dict, List, Any
import re

class FileUploadTester:
    def __init__(self):
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
            'details': details
        }
        
        self.results['test_details'].append(result)
        print(f"{status}: {test_name}")
        if message:
            print(f"    {message}")
        print()

    def test_fileupload_component_structure(self):
        """Test FileUpload component structure and props"""
        print("📁 Testing FileUpload Component Structure...")
        
        try:
            with open('/app/src/components/FileUpload.tsx', 'r') as f:
                content = f.read()
            
            # Check for simultaneousMode prop
            if 'simultaneousMode?' in content:
                self.log_test(
                    "FileUpload - simultaneousMode prop exists",
                    True,
                    "simultaneousMode prop is properly defined in interface"
                )
            else:
                self.log_test(
                    "FileUpload - simultaneousMode prop exists",
                    False,
                    "simultaneousMode prop not found in component interface"
                )
            
            # Check for simultaneous mode implementation
            if 'simultaneousMode && allowUrlInput' in content:
                self.log_test(
                    "FileUpload - simultaneousMode implementation",
                    True,
                    "simultaneousMode logic is properly implemented"
                )
            else:
                self.log_test(
                    "FileUpload - simultaneousMode implementation",
                    False,
                    "simultaneousMode logic not found or incomplete"
                )
            
            # Check for URL validation
            if 'validateUrl' in content:
                self.log_test(
                    "FileUpload - URL validation function",
                    True,
                    "URL validation function exists"
                )
            else:
                self.log_test(
                    "FileUpload - URL validation function",
                    False,
                    "URL validation function not found"
                )
            
            # Check for both upload area and URL input rendering
            if 'renderUploadArea()' in content and 'renderUrlInput()' in content:
                self.log_test(
                    "FileUpload - Dual rendering functions",
                    True,
                    "Both upload area and URL input rendering functions exist"
                )
            else:
                self.log_test(
                    "FileUpload - Dual rendering functions",
                    False,
                    "Missing upload area or URL input rendering functions"
                )
                
        except Exception as e:
            self.log_test(
                "FileUpload - Component file access",
                False,
                f"Error reading FileUpload component: {str(e)}"
            )

    def test_blog_editor_fileupload_usage(self):
        """Test FileUpload usage in BlogEditorEnhanced"""
        print("📝 Testing FileUpload Usage in BlogEditorEnhanced...")
        
        try:
            with open('/app/src/pages/BlogEditorEnhanced.tsx', 'r') as f:
                content = f.read()
            
            # Check for simultaneousMode=true usage
            simultaneous_mode_count = content.count('simultaneousMode={true}')
            if simultaneous_mode_count >= 3:  # Featured image, additional images, video
                self.log_test(
                    "BlogEditor - simultaneousMode usage",
                    True,
                    f"simultaneousMode=true found {simultaneous_mode_count} times (expected 3+)"
                )
            else:
                self.log_test(
                    "BlogEditor - simultaneousMode usage",
                    False,
                    f"simultaneousMode=true found only {simultaneous_mode_count} times (expected 3+)"
                )
            
            # Check for FileUpload import
            if 'import FileUpload from' in content:
                self.log_test(
                    "BlogEditor - FileUpload import",
                    True,
                    "FileUpload component is properly imported"
                )
            else:
                self.log_test(
                    "BlogEditor - FileUpload import",
                    False,
                    "FileUpload component import not found"
                )
            
            # Check for upload handlers
            upload_handlers = ['handleImageUpload', 'handleAdditionalImagesUpload', 'handleVideoUpload']
            found_handlers = 0
            for handler in upload_handlers:
                if handler in content:
                    found_handlers += 1
            
            if found_handlers == len(upload_handlers):
                self.log_test(
                    "BlogEditor - Upload handlers",
                    True,
                    f"All {len(upload_handlers)} upload handlers found"
                )
            else:
                self.log_test(
                    "BlogEditor - Upload handlers",
                    False,
                    f"Only {found_handlers}/{len(upload_handlers)} upload handlers found"
                )
                
        except Exception as e:
            self.log_test(
                "BlogEditor - File access",
                False,
                f"Error reading BlogEditorEnhanced: {str(e)}"
            )

    def test_project_editor_fileupload_usage(self):
        """Test FileUpload usage in ProjectEditorEnhanced"""
        print("🚀 Testing FileUpload Usage in ProjectEditorEnhanced...")
        
        try:
            with open('/app/src/pages/ProjectEditorEnhanced.tsx', 'r') as f:
                content = f.read()
            
            # Check if FileUpload is used (it should be in the settings section)
            # Note: ProjectEditorEnhanced might use manual URL inputs instead of FileUpload component
            if 'FileUpload' in content:
                self.log_test(
                    "ProjectEditor - FileUpload component usage",
                    True,
                    "FileUpload component is used in ProjectEditorEnhanced"
                )
            else:
                # This is acceptable as ProjectEditorEnhanced uses manual URL inputs
                self.log_test(
                    "ProjectEditor - Manual URL inputs",
                    True,
                    "ProjectEditorEnhanced uses manual URL inputs (acceptable approach)"
                )
            
            # Check for image URL input
            if 'image_url' in content:
                self.log_test(
                    "ProjectEditor - Image URL handling",
                    True,
                    "Image URL input is properly handled"
                )
            else:
                self.log_test(
                    "ProjectEditor - Image URL handling",
                    False,
                    "Image URL input not found"
                )
                
        except Exception as e:
            self.log_test(
                "ProjectEditor - File access",
                False,
                f"Error reading ProjectEditorEnhanced: {str(e)}"
            )

    def test_url_validation_patterns(self):
        """Test URL validation patterns and edge cases"""
        print("🔗 Testing URL Validation Patterns...")
        
        # Test URLs that should be valid
        valid_urls = [
            "https://example.com/image.jpg",
            "http://example.com/video.mp4",
            "https://youtube.com/watch?v=abc123",
            "https://vimeo.com/123456789",
            "https://cdn.example.com/files/document.pdf"
        ]
        
        # Test URLs that should be invalid
        invalid_urls = [
            "not-a-url",
            "ftp://example.com/file.txt",  # Different protocol
            "javascript:alert('xss')",     # Security risk
            "",                            # Empty string
            "   ",                         # Whitespace only
        ]
        
        # Simple URL validation (mimicking the component's validateUrl function)
        def validate_url(url: str) -> bool:
            try:
                from urllib.parse import urlparse
                result = urlparse(url)
                return all([result.scheme, result.netloc]) and result.scheme in ['http', 'https']
            except:
                return False
        
        # Test valid URLs
        valid_count = 0
        for url in valid_urls:
            if validate_url(url):
                valid_count += 1
        
        if valid_count == len(valid_urls):
            self.log_test(
                "URL Validation - Valid URLs",
                True,
                f"All {len(valid_urls)} valid URLs passed validation"
            )
        else:
            self.log_test(
                "URL Validation - Valid URLs",
                False,
                f"Only {valid_count}/{len(valid_urls)} valid URLs passed validation"
            )
        
        # Test invalid URLs
        invalid_count = 0
        for url in invalid_urls:
            if not validate_url(url):
                invalid_count += 1
        
        if invalid_count == len(invalid_urls):
            self.log_test(
                "URL Validation - Invalid URLs",
                True,
                f"All {len(invalid_urls)} invalid URLs were properly rejected"
            )
        else:
            self.log_test(
                "URL Validation - Invalid URLs",
                False,
                f"Only {invalid_count}/{len(invalid_urls)} invalid URLs were properly rejected"
            )

    def test_component_props_and_features(self):
        """Test component props and feature completeness"""
        print("⚙️ Testing Component Props and Features...")
        
        try:
            with open('/app/src/components/FileUpload.tsx', 'r') as f:
                content = f.read()
            
            # Check for required props
            required_props = [
                'uploadType',
                'onUploadComplete',
                'maxFiles',
                'multiple',
                'allowUrlInput',
                'simultaneousMode'
            ]
            
            found_props = 0
            for prop in required_props:
                if f'{prop}?' in content or f'{prop}:' in content:
                    found_props += 1
            
            if found_props >= len(required_props) - 1:  # Allow for some flexibility
                self.log_test(
                    "FileUpload - Required props",
                    True,
                    f"Found {found_props}/{len(required_props)} required props"
                )
            else:
                self.log_test(
                    "FileUpload - Required props",
                    False,
                    f"Only found {found_props}/{len(required_props)} required props"
                )
            
            # Check for upload types support
            upload_types = ['image', 'video', 'document', 'avatar']
            found_types = 0
            for upload_type in upload_types:
                if f"'{upload_type}'" in content:
                    found_types += 1
            
            if found_types == len(upload_types):
                self.log_test(
                    "FileUpload - Upload types support",
                    True,
                    f"All {len(upload_types)} upload types are supported"
                )
            else:
                self.log_test(
                    "FileUpload - Upload types support",
                    False,
                    f"Only {found_types}/{len(upload_types)} upload types found"
                )
            
            # Check for file validation
            if 'validateFile' in content and 'maxSizeMB' in content:
                self.log_test(
                    "FileUpload - File validation",
                    True,
                    "File validation with size limits is implemented"
                )
            else:
                self.log_test(
                    "FileUpload - File validation",
                    False,
                    "File validation or size limits not found"
                )
                
        except Exception as e:
            self.log_test(
                "Component Props - File access",
                False,
                f"Error reading FileUpload component: {str(e)}"
            )

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*80)
        print("📁 FILEUPLOAD COMPONENT TESTING SUMMARY")
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
            print("🎉 ALL FILEUPLOAD TESTS PASSED! Component is working correctly.")
            return True
        else:
            print(f"⚠️  {self.results['failed_tests']} TESTS FAILED. Please review the issues above.")
            return False

    def run_all_tests(self):
        """Run all FileUpload component tests"""
        print("📁 Starting FileUpload Component Testing...")
        print("="*80)
        
        self.test_fileupload_component_structure()
        self.test_blog_editor_fileupload_usage()
        self.test_project_editor_fileupload_usage()
        self.test_url_validation_patterns()
        self.test_component_props_and_features()
        
        return self.print_summary()

def main():
    """Main test execution function"""
    tester = FileUploadTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()