# AI Agent README - Essa Ahmed's Portfolio & Blog CMS

## 🤖 FOR AI AGENTS: PROJECT UNDERSTANDING GUIDE

This document contains all essential information for AI agents working on this project.

## 🏗️ SYSTEM ARCHITECTURE

**Application Type**: React Frontend + Supabase Backend  
**Tech Stack**: React 18 + TypeScript + Vite + Supabase + TailwindCSS + Radix UI  
**Primary Purpose**: Personal portfolio and blog content management system  

### Key Components Structure
```
/app/src/
├── components/editor/          # Rich text editing system
│   ├── NotionEditor.tsx       # Main Notion-style editor
│   ├── NotionToolbar.tsx      # Formatting toolbar
│   └── editor-styles.css     # Notion-like styling
├── pages/                     # Route components  
│   ├── BlogEditorEnhanced.tsx # Blog post creation/editing
│   ├── ProjectEditorEnhanced.tsx # Project creation/editing
│   └── AdminPage.tsx         # Admin dashboard
├── contexts/                  # React state management
│   ├── AuthContext.tsx       # Authentication logic
│   └── ProfileContext.tsx    # User profile management
└── integrations/supabase/     # Backend integration
    ├── client.ts             # Supabase client configuration
    └── types.ts              # Database type definitions
```

## 🔑 AUTHENTICATION & ACCESS

**Admin Credentials** (Essential for testing):
- Email: `essaahmedsiddiqui@gmail.com`  
- Password: `shadow`
- Admin Panel: `/admin`
- Blog Editor: `/admin/blog/new`
- Project Editor: `/admin/project/new`

**Supabase Configuration**:
- URL: `https://kexmzaaufxbzegurxuqz.supabase.co`
- Authentication: Email-based with confirmation requirement
- Database: PostgreSQL with Row Level Security

## 📊 DATABASE SCHEMA (CRITICAL)

### Core Tables
- `blog_posts`: Article content, metadata, SEO fields
- `projects`: Portfolio items, demos, GitHub links
- `tags`: Tag system with slugs and colors
- `categories`: Content categorization
- `series`: Blog post series organization

### Relational Junction Tables
- `blog_post_tags`: Many-to-many blog ↔ tag relationships
- `project_tags`: Many-to-many project ↔ tag relationships

**IMPORTANT**: Uses UUIDs, NOT MongoDB ObjectIDs. Never use Mongo ObjectID patterns.

## 🎨 NOTION-STYLE EDITOR SYSTEM

### Current Implementation Status
- **NotionEditor.tsx**: ✅ Complete with slash commands
- **Slash Commands**: ✅ 12 different block types (Text, H1-H3, Lists, Quote, Code, Image, Table, Divider)
- **Visual Design**: ✅ Notion-like typography and spacing
- **TipTap Extensions**: ✅ Properly configured, no conflicts
- **Markdown Support**: ✅ Full import/export

### Key Features Available
1. **Slash Command Palette**: Type "/" to access commands
2. **Rich Formatting**: Bold, italic, underline, strikethrough, code
3. **Block Elements**: Headings, lists, quotes, code blocks, tables
4. **Task Lists**: Checkbox-style todo items
5. **Media**: Image upload/URL input, drag & drop support
6. **Tables**: Resizable tables with headers

### Dependencies Installed
- `@harshtalks/slash-tiptap@1.3.0`: Slash command functionality
- `@dnd-kit/core@6.3.1`: Drag and drop core
- `@dnd-kit/sortable@10.0.0`: Block reordering
- All TipTap extensions @3.0.9

## 🔧 DEVELOPMENT ENVIRONMENT

### Running the Application
```bash
cd /app
yarn install  # NEVER use npm (breaking change)
yarn dev      # Starts on http://localhost:3000
```

### Service Management
```bash
sudo supervisorctl restart frontend  # Restart React app
sudo supervisorctl status           # Check all services
```

### Important Paths
- Frontend runs from `/app` (not `/app/frontend`)
- No separate backend directory (uses Supabase)
- MongoDB service exists but unused (legacy from template)

## 🏷️ CONTENT MANAGEMENT FEATURES

### Tag System (Implemented)
- **Status**: ✅ Fully functional relational system
- **Implementation**: Junction tables, not arrays
- **Functions Available**:
  - `createOrGetTag()`: Create/retrieve tags
  - `associateBlogPostTags()`: Link blog posts to tags
  - `associateProjectTags()`: Link projects to tags
  - `getBlogPostsByTag()`: Filter by tag
  - `getProjectsByTag()`: Filter by tag

### File Upload System
- **Status**: ✅ Enhanced with simultaneous mode
- **Features**: File upload AND URL input simultaneously
- **Supported**: Images, videos, documents
- **Storage**: Supabase Storage integration

### Missing/Incomplete Features
1. **Clickable Tags**: UI components for tag-based filtering (backend ready)
2. **Block Drag & Drop**: Reordering editor blocks
3. **Advanced Image Editing**: Current implementation needs replacement

## 🚨 KNOWN ISSUES & CONSTRAINTS

### Current Blockers
1. **Supabase Connectivity**: Auth fails with `net::ERR_ABORTED`
2. **Image Cropping**: User dislikes current react-easy-crop library
3. **Image Compression**: Needs alternative to current technique

### Session Management
- Authentication state may not persist across page navigation
- Protected routes redirect to login when session expires
- Use React Query for API state management

### CSS Class Naming Convention
- Use `notion-*` prefix for editor-specific styles
- Tailwind + custom CSS hybrid approach
- Dark mode support with `.dark` prefix

## 📝 CONTENT EDITING WORKFLOW

### Blog Post Creation Flow
1. Navigate to `/admin/blog/new`
2. **Title & Slug**: Auto-generated or manual
3. **Content**: NotionEditor with slash commands
4. **Media**: FileUpload with simultaneousMode=true
5. **Tags**: Add/create tags with junction table storage
6. **Categories**: Select/create categories
7. **SEO**: Meta description, reading time
8. **Publishing**: Draft/Published status

### Project Creation Flow
Similar to blog posts but includes:
- Demo URLs and GitHub links
- Technology stack tags
- Client information
- Timeline details

## 🔍 TESTING PROTOCOLS

### Backend Testing Status
- **Success Rate**: 92.7% (38/41 tests passed)
- **Tag System**: ✅ Fully verified
- **CRUD Operations**: ✅ Working
- **Junction Tables**: ✅ Proper relationships

### Frontend Testing Status  
- **Build**: ✅ Successful compilation
- **FileUpload**: ✅ 100% success rate (14/14 tests)
- **Editor**: ⚠️ Needs testing once auth resolved

### Critical Testing Commands
```bash
# Check backend logs
tail -n 100 /var/log/supervisor/frontend.*.log

# Test build
cd /app && yarn build

# Check for errors
cd /app && yarn dev  # Watch for console errors
```

## 🔒 SECURITY & PERMISSIONS

### Row Level Security (RLS)
- Enabled on all Supabase tables
- User must be authenticated for CRUD operations
- Admin-only access to management features

### API Endpoints Pattern
- All backend calls go through Supabase client
- No custom API routes (serverless architecture)
- Authentication handled by Supabase Auth

## 🎯 AGENT TASK PRIORITIES

### High Priority Tasks
1. **Fix Image Handling**: Replace react-easy-crop with better library
2. **Improve Image Compression**: Use canvas-based or browser-image-compression
3. **Add Image Management**: Insert/remove images in markdown editor
4. **Resolve Supabase Auth**: Fix connectivity issues

### Medium Priority Tasks
1. **Implement Clickable Tags**: Create UI for tag-based content filtering
2. **Add Block Drag & Drop**: Enable reordering in NotionEditor
3. **Enhance Mobile Experience**: Responsive editor improvements

### Low Priority Tasks
1. **Performance Optimization**: Code splitting, lazy loading
2. **SEO Improvements**: Meta tags, structured data
3. **Analytics Integration**: User behavior tracking

## 🛠️ DEBUGGING GUIDELINES FOR AGENTS

### When Things Break
1. **Check Supervisor Status**: `sudo supervisorctl status`
2. **View Frontend Logs**: `tail -f /var/log/supervisor/frontend.err.log`
3. **Verify Dependencies**: `cd /app && yarn install`
4. **Check Browser Console**: Look for JavaScript errors
5. **Test Supabase Connection**: Verify client configuration

### Common Pitfalls
- Don't use `npm install` (breaks packages)
- Don't modify .env URLs or ports
- Don't use MongoDB ObjectID patterns
- Always check TipTap extension compatibility
- Test authentication before editor functionality

### Recovery Commands
```bash
# Full restart
sudo supervisorctl restart all

# Clear cache and reinstall
cd /app && rm -rf node_modules yarn.lock && yarn install

# Reset to working state
cd /app && git stash && git pull
```

## 📚 EXTERNAL RESOURCES

- **Design Reference**: https://chatgpt.com/canvas/shared/6896372d7a548191b057080829ea9050
- **TipTap Documentation**: https://tiptap.dev/
- **Supabase Docs**: https://supabase.com/docs
- **Radix UI Components**: https://ui.shadcn.com/

---

**Last Updated**: January 8, 2025  
**Project Status**: Notion Editor Complete, Auth Issues Pending  
**Agent Context**: This file should be read completely before any modifications