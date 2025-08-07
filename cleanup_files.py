#!/usr/bin/env python3
"""
Script to clean up unnecessary files from the codebase.
This removes temporary migration scripts, test files, and other clutter.
"""
import os
import shutil

def remove_file_if_exists(filepath):
    """Remove a file if it exists"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"✓ Removed: {filepath}")
        else:
            print(f"- Not found: {filepath}")
    except Exception as e:
        print(f"✗ Error removing {filepath}: {e}")

def remove_dir_if_exists(dirpath):
    """Remove a directory if it exists"""
    try:
        if os.path.exists(dirpath):
            shutil.rmtree(dirpath)
            print(f"✓ Removed directory: {dirpath}")
        else:
            print(f"- Not found: {dirpath}")
    except Exception as e:
        print(f"✗ Error removing directory {dirpath}: {e}")

def main():
    """Main cleanup function"""
    print("🧹 Starting cleanup of unnecessary files...")
    
    # List of files to remove (temporary migration and test scripts)
    files_to_remove = [
        "/app/add_dummy_data.py",
        "/app/setup_supabase_storage.py", 
        "/app/projects_column_test.py",
        "/app/test_schema.py",
        "/app/auth_test.py",
        "/app/backend_test.py",
        "/app/create_tables.py",
        "/app/feature_test.py",
        "/app/apply_critical_migrations.py",
        "/app/apply_migration.py",
        "/app/clear_and_populate_data.py",
        "/app/migration_verification_test.py",
        "/app/create_tags_manually.js",
        "/app/simple_migration.cjs",
        "/app/apply_tags_migration.js",
        "/app/implementation_summary.html",
        "/app/feature_test_results.json",
        "/app/backend_test_results.json",
        "/app/migration_verification_results.json",
        "/app/setup_storage_buckets.sql",
        "/app/bun.lockb"  # Remove bun lockfile as we're using npm/yarn
    ]
    
    # Remove unnecessary files
    for file_path in files_to_remove:
        remove_file_if_exists(file_path)
    
    # Keep essential files (don't remove these):
    essential_files = [
        "/app/package.json",
        "/app/package-lock.json", 
        "/app/tailwind.config.ts",
        "/app/postcss.config.js",
        "/app/eslint.config.js",
        "/app/vite.config.ts",
        "/app/tsconfig.json",
        "/app/tsconfig.app.json", 
        "/app/tsconfig.node.json",
        "/app/components.json",
        "/app/README.md",
        "/app/test_result.md"
    ]
    
    print(f"\n✅ Cleanup completed!")
    print(f"📝 Essential files preserved: {len(essential_files)} files")
    print("🔧 Configuration files kept intact for development")

if __name__ == "__main__":
    main()