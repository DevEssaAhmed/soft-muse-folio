import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import BlogEditor from "./pages/BlogEditor";
import ProjectEditor from "./pages/ProjectEditor";
import ProjectsPage from "./pages/ProjectsPage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPageEnhanced from "./pages/ArticleDetailPageEnhanced";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import AboutPage from "./pages/AboutPage";
import ProfileManagePage from "./pages/ProfileManagePage";
import LoginForm from "./components/auth/LoginForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/articles/:slug" element={<ArticleDetailPageEnhanced />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/admin/login" element={<LoginForm />} />
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute><ProfileManagePage /></ProtectedRoute>} />
              <Route path="/admin/blog/new" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
              <Route path="/admin/blog/edit/:id" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
              <Route path="/admin/project/new" element={<ProtectedRoute><ProjectEditor /></ProtectedRoute>} />
              <Route path="/admin/project/edit/:id" element={<ProtectedRoute><ProjectEditor /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
