# Modern Portfolio & Blog Platform

A full-stack personal portfolio and blog platform with a beautiful Instagram-style interface, secure admin dashboard, and content management system powered by Supabase.

![Portfolio Preview](https://via.placeholder.com/800x400?text=Portfolio+Preview)

## ✨ Features

### 🎨 Frontend Features
- **Modern UI/UX**: Instagram-style profile card with gradients and animations
- **Responsive Design**: Fully responsive across all device sizes
- **Dark/Light Theme**: Toggle between themes with persistent preferences
- **Interactive Navigation**: Smooth animations and hover effects
- **Project Showcase**: Grid layout for displaying portfolio projects
- **Blog Articles**: Clean article layout and navigation

### 🔐 Admin Features
- **Simple Authentication**: Password-protected admin access (default: `admin2024!`)
- **Admin Dashboard**: Modern analytics dashboard with key metrics
- **Content Management**: 
  - Full-page blog editor with rich text formatting
  - Project editor with auto-save functionality
  - Media management and settings
- **Real-time Auto-save**: Content automatically saves every 5 seconds
- **Analytics Cards**: Track views, likes, posts, and projects
- **Session Management**: Secure logout and session handling

### 🚀 Technical Features
- **Serverless Backend**: Powered by Supabase for scalability and ease of use
- **PostgreSQL Database**: Robust relational database with JSONB support
- **Type Safety**: Full TypeScript implementation with auto-generated types
- **Modern React**: Hooks, Context API, and React Router v6
- **Component Library**: shadcn/ui components with Radix UI primitives
- **Fast Performance**: Built with Vite for lightning-fast development and builds

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom gradients
- **UI Components**: shadcn/ui + Radix UI
- **Routing**: React Router v6
- **State Management**: React Context + TanStack Query
- **Icons**: Lucide React
- **Animations**: Tailwind CSS animations

### Backend
- **Backend-as-a-Service**: Supabase
- **Database**: PostgreSQL with Supabase
- **Authentication**: Simple password-based admin authentication
- **API**: Auto-generated REST API via PostgREST
- **Real-time**: WebSocket connections for live updates

### Development Tools
- **TypeScript**: Full type safety with Supabase type generation
- **ESLint**: Code linting
- **Hot Reload**: Development server with hot reload

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **yarn** package manager
- **Supabase Account** (free tier available)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd portfolio-blog-platform
```

### 2. Setup Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to Settings → API to get your credentials
4. Note down your Project URL and anon public key

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials:
# VITE_SUPABASE_URL=your-project-url
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Database Setup
The application uses these Supabase tables (automatically created if they don't exist):
- `profile` - User profile information
- `projects` - Portfolio projects
- `blog_posts` - Blog articles and posts

### 5. Run the Application
```bash
# Start frontend (from frontend directory)
yarn dev
```

The application will be available at http://localhost:5173

## 🔑 Authentication

### Admin Access
- **URL**: `/admin`
- **Default Password**: `admin2024!`
- **Features**: Dashboard, content editing, analytics

### Security Features
- Password-protected admin routes
- Session persistence with localStorage
- Protected route wrapper for admin pages
- Automatic logout functionality

## 📡 Database Schema

### Tables

#### `profile`
```sql
- id (uuid, primary key)
- name (text, required)
- username (text, required)
- title (text)
- bio (text)
- location (text)
- avatar_url (text)
- email (text)
- github_url (text)
- linkedin_url (text)
- website_url (text)
- skills (text[])
- stats (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `projects`
```sql
- id (uuid, primary key)
- title (text, required)
- description (text, required)
- image_url (text)
- category (text, required)
- tags (text[])
- demo_url (text)
- github_url (text)
- views (integer, default: 0)
- likes (integer, default: 0)
- comments (integer, default: 0)
- featured (boolean, default: false)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `blog_posts`
```sql
- id (uuid, primary key)
- title (text, required)
- slug (text, required)
- excerpt (text)
- content (text, required)
- image_url (text)
- tags (text[])
- published (boolean, default: false)
- views (integer, default: 0)
- likes (integer, default: 0)
- reading_time (integer, default: 5)
- created_at (timestamp)
- updated_at (timestamp)
```

## 🏗️ Project Structure

```
portfolio-blog-platform/
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   └── admin/        # Admin-specific components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts (Auth)
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities & Supabase client
│   │   └── assets/           # Static assets
│   ├── public/               # Public assets
│   ├── package.json          # Dependencies
│   └── .env                  # Environment variables
└── README.md                 # This file
```

## 🎨 Customization

### Styling
- **Colors**: Modify `tailwind.config.ts` for custom color schemes
- **Fonts**: Update font imports in `index.css`
- **Gradients**: Customize gradient classes in Tailwind config

### Content
- **Profile Info**: Edit `HeroSection.tsx` component
- **Navigation**: Modify `Navigation.tsx` for menu items
- **Admin Password**: Change `ADMIN_PASSWORD` in `AuthContext.tsx`

### Database
- **Schema**: Modify tables through Supabase Dashboard
- **Data**: Add/edit content through admin dashboard
- **Types**: Regenerate types with `supabase gen types typescript --project-id your-project-id`

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
WDS_SOCKET_PORT=443
```

## 🧪 Development

### Code Quality
```bash
# Frontend linting
cd frontend
yarn lint

# Type checking
npx tsc --noEmit
```

### Building for Production
```bash
# Frontend build
cd frontend
yarn build
```

## 📦 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the application: `yarn build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables in your hosting platform
4. Set up custom domain (optional)

### Supabase Configuration
- Your Supabase project handles all backend infrastructure
- No server deployment needed
- Configure custom domain in Supabase if required
- Set up database backups through Supabase Dashboard

## 🚀 Supabase Features Used

- **Database**: PostgreSQL with real-time subscriptions
- **Auto-generated API**: REST API with filtering and sorting
- **Type Generation**: Automatic TypeScript types from schema
- **Dashboard**: Built-in admin interface for data management
- **Monitoring**: Built-in analytics and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Update documentation for new features
- Test admin functionality thoroughly

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - For the amazing backend-as-a-service platform
- **shadcn/ui** - For the beautiful component library
- **Radix UI** - For accessible UI primitives
- **Tailwind CSS** - For the utility-first CSS framework
- **Vite** - For the fast development experience

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [existing issues](your-repository-url/issues)
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🚀 Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced SEO optimization
- [ ] Image optimization and CDN
- [ ] Advanced analytics dashboard
- [ ] Comment system for blog posts
- [ ] Newsletter subscription
- [ ] Multi-language support
- [ ] Progressive Web App (PWA) features

---

**Built with ❤️ using Supabase and modern web technologies**

For more information about Supabase features and advanced configuration, check the [Supabase Documentation](https://supabase.com/docs) or [Supabase Dashboard](https://supabase.com/dashboard).
