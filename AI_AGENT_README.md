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


## Yoopta-only Editor Revamp Plan (July 2025)

DECISIONS (confirmed by user)
- Single editor: Yoopta only (remove all other editors)
- Storage format: Save Markdown (not Yoopta JSON)
- Package cleanup: Remove TipTap, Slate and any legacy editor deps from package.json
- UI: Full-screen, Notion-like canvas with drag & drop block editing (Hashnode/Notion style), not a constrained textarea layout
- For now: Leave content logic as-is; this document captures the final spec and execution plan

Scope Overview
- Phase 1 (Spec): Define how we’ll save Markdown while using Yoopta as the only editor. Captured here.
- Phase 2 (Removal/Cleanup): Remove legacy editors and unused deps; ensure routes build and run with Yoopta-only.
- Phase 3 (UI Revamp): Implement full-width Notion-like editing surface for Blog and Project editors with Yoopta blocks, media, and drag/drop.

DATA MODEL AND CONTENT RULES
- Blog posts
  - Field used: blog_posts.content (string)
  - New rule: store Markdown string in blog_posts.content
- Projects
  - Field used: projects.description (string) OR projects.content if exists
  - New rule: store Markdown string in the chosen field (final decision during implementation; preference: projects.content if present, else projects.description)
- Compatibility notes
  - Existing content that is plain text or HTML is left untouched for now.
  - Editor will operate on its internal Yoopta state in UI; on Save we serialize to Markdown and store to DB.
  - Initial version: one-way save (Yoopta -> Markdown). Later enhancement can add Markdown -> Yoopta parsing if needed.

YOOPTA EDITOR CONFIG (authoring experience)
- Plugins (enabled): Paragraph, Headings (H1/H2/H3), Lists (bulleted/numbered/todo), Blockquote, Code, Divider, Image, Video, File, Callout, Table, Accordion, Link, Embed
- Tools: @yoopta/action-menu-list (slash/command menu), @yoopta/toolbar (floating/inline toolbar), @yoopta/link-tool
- Marks: Bold, Italic, Underline, Strike, Code, Highlight
- Drag & Drop: Built-in via Yoopta + @dnd-kit; allow reordering of blocks fluidly
- Media Uploads: Use Supabase Storage buckets (images/videos/files) with existing upload helper; preserve simultaneous URL inputs from FileUpload component where applicable

SAVE/LOAD STRATEGY
- Save:
  - Maintain Yoopta editor state in component.
  - On save, serialize to Markdown using @yoopta/exports markdown.serialize(editor, value) and write the Markdown string to DB.
  - Keep existing associated metadata (tags/categories/series) as implemented.
- Load (for this iteration):
  - Leave as-is per user’s instruction.
  - When opening an existing entity, we won’t attempt Markdown -> Yoopta conversion yet; content hydration approach will be defined in a later pass if needed. The editing surface will start from empty or retained state as decided during UI implementation.

FILES/ROUTES TO TARGET
- Editors to consolidate to Yoopta-only in these pages:
  - /src/pages/BlogEditorV2.tsx
  - /src/pages/ProjectEditorV2.tsx
- Editors/components to remove (Phase 2):
  - /src/components/editor/NotionEditor.tsx
  - /src/components/editor/NotionToolbar.tsx
  - /src/components/editor/RichEditor.tsx
  - /src/components/editor/EditorSelector.tsx
  - Legacy pages (to be removed or archived if unused routes):
    - /src/pages/BlogEditor.tsx
    - /src/pages/ProjectEditor.tsx
    - /src/pages/BlogEditorEnhanced.tsx
    - /src/pages/ProjectEditorEnhanced.tsx
- Routes to continue using (Yoopta-only):
  - /admin/blog/new, /admin/blog/edit/:id → BlogEditorV2
  - /admin/project/new, /admin/project/edit/:id → ProjectEditorV2

PACKAGE CLEANUP (Phase 2)
- Remove TipTap stack (no longer used once Yoopta-only):
  - @tiptap/core, @tiptap/react, @tiptap/starter-kit and all @tiptap/extension-* packages
  - @tiptap/pm, @tiptap/suggestion
- Remove Slate stack if not used elsewhere:
  - slate, slate-react
- Keep only Yoopta + required UI deps:
  - @yoopta/* (editor, plugins, marks, toolbar, action-menu-list, exports)
  - dnd-kit packages already present
- Potential shared viewer deps (evaluate usage before removal):
  - highlight.js/lowlight may be needed for read-only code rendering elsewhere; only remove if not used outside editors.

UI REVAMP SPEC (Phase 3)
- Layout
  - Full screen, distraction-free editor canvas; max width grows to near full, with comfortable horizontal padding
  - Sticky minimal header with: Back to Admin, Save/Publish, Status indicator (Saving…/Saved)
  - Secondary controls (category/series/tags/media) in a side panel that can be toggled; editor occupies primary attention
- Blocks & Interactions
  - Slash command to insert blocks; quick-insert plus on empty lines
  - Drag handles on left of blocks for reordering; drop targets show subtle highlights
  - Inline toolbar on text selection for quick marks/links
- Media
  - Drag-and-drop images/videos into the canvas (uploads via Supabase) and URL embeds
- Accessibility & Mobile
  - Keyboard-first workflow; accessible toolbar; responsive layout scales down elegantly

ACCEPTANCE CRITERIA
- Both blog and project editors:
  - Use only Yoopta, with drag/drop blocks and slash menu
  - Save action serializes Yoopta doc to Markdown and stores in DB field as specified
  - File uploads work via Supabase Storage; URL entries still supported
  - UI fills the screen and feels like a modern Notion/Hashnode editor
  - No TipTap or Slate imports remain in code; build passes after package cleanup

TESTING PLAN
- Build verification (vite build) after removal of legacy editors and deps
- Manual smoke tests for:
  - Creating/editing posts/projects
  - Adding blocks via slash menu
  - Reordering blocks (drag/drop)
  - Uploading images/videos and inserting via URL
  - Saving to Markdown and reloading page (for now, no MD->Yoopta hydration)

IMPLEMENTATION ORDER (for execution)
1) Phase 2: Remove legacy editor components, update imports, clean routes, and prune package.json
2) Ensure BlogEditorV2/ProjectEditorV2 render Yoopta editor in full-width layout (Phase 3 initial UI)
3) Wire Save to markdown.serialize(editor, value) and persist to DB (keeping tag/category/series logic)
4) Verify uploads and URL inserts still work
5) Polish interactions (drag handles, inline toolbar visibility, placeholders, spacing)

NOTES/OPEN ITEMS
- MD->Yoopta hydration is intentionally deferred per user instruction; we can add later if needed
- If existing content must remain viewable/editable, we can temporarily display the Markdown below the editor or keep read-only preview until hydration is implemented
- Confirm which projects field to use for Markdown (description vs content) during execution
