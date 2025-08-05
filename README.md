# Modern Portfolio & Blog Platform

A full-stack personal portfolio and blog platform with a beautiful Instagram-style interface, secure admin dashboard, and content management system.

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
- **Secure Authentication**: Password-protected admin access
- **Admin Dashboard**: Modern analytics dashboard with key metrics
- **Content Management**: 
  - Full-page blog editor with rich text formatting
  - Project editor with auto-save functionality
  - Media management and settings
- **Real-time Auto-save**: Content automatically saves every 5 seconds
- **Analytics Cards**: Track views, likes, posts, and projects
- **Session Management**: Secure logout and session handling

### 🚀 Technical Features
- **Fast Performance**: Built with Vite for lightning-fast development and builds
- **Type Safety**: Full TypeScript implementation
- **Modern React**: Hooks, Context API, and React Router v6
- **Component Library**: shadcn/ui components with Radix UI primitives
- **Database Integration**: MongoDB with async operations
- **API Architecture**: RESTful API with FastAPI
- **CORS Support**: Configured for cross-origin requests

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
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: Custom password-based auth
- **Environment**: Python-dotenv for configuration
- **Middleware**: CORS middleware for cross-origin requests

### Development Tools
- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting (via shadcn)
- **Hot Reload**: Development server with hot reload

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local installation or cloud instance)
- **yarn** package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd portfolio-blog-platform
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend URL
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# The application will automatically create the required database and collections
```

### 5. Run the Application
```bash
# Terminal 1: Start backend (from backend directory)
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Terminal 2: Start frontend (from frontend directory)
yarn dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

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

## 📡 API Documentation

### Base URL
```
http://localhost:8001/api
```

### Endpoints

#### Health Check
```http
GET /api/
```
Returns a simple "Hello World" message.

#### Status Checks
```http
POST /api/status
Content-Type: application/json

{
  "client_name": "string"
}
```

```http
GET /api/status
```
Returns all status check records.

### Response Format
```json
{
  "id": "uuid-string",
  "client_name": "string",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🏗️ Project Structure

```
portfolio-blog-platform/
├── backend/
│   ├── server.py              # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   └── admin/        # Admin-specific components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   └── lib/              # Utilities
│   ├── public/               # Static assets
│   ├── package.json          # Node dependencies
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
- **Admin Password**: Change in `AuthContext.tsx`

### Features
- **Analytics**: Add custom metrics in `AdminPage.tsx`
- **Blog Features**: Extend `BlogEditor.tsx` for additional functionality
- **Project Features**: Enhance `ProjectEditor.tsx` with custom fields

## 🔧 Environment Variables

### Backend (.env)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="your_database_name"
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=443
```

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests (if configured)
cd frontend
yarn test
```

### Code Quality
```bash
# Frontend linting
cd frontend
yarn lint

# Type checking
yarn type-check
```

### Building for Production
```bash
# Frontend build
cd frontend
yarn build

# Backend is production-ready as-is
```

## 📦 Deployment

### Frontend Deployment
1. Build the application: `yarn build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables for production

### Backend Deployment
1. Install dependencies: `pip install -r requirements.txt`
2. Set production environment variables
3. Use a production WSGI server like Gunicorn:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app
   ```

### Database
- Use a cloud MongoDB service like MongoDB Atlas for production
- Update the `MONGO_URL` environment variable accordingly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Ensure all tests pass before submitting PR
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** - For the beautiful component library
- **Radix UI** - For accessible UI primitives
- **Tailwind CSS** - For the utility-first CSS framework
- **FastAPI** - For the high-performance Python web framework
- **MongoDB** - For the flexible document database

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [existing issues](your-repository-url/issues)
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🚀 Roadmap

- [ ] Email integration for contact forms
- [ ] Advanced SEO optimization
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social media integration
- [ ] Newsletter subscription
- [ ] Comment system for blog posts
- [ ] Image upload and optimization

---

**Built with ❤️ using modern web technologies**

For more information about deployment and advanced configuration, check the [Wiki](your-repository-url/wiki) or [Documentation](your-repository-url/docs).
