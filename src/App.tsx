import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import BlogEditorV2 from "./pages/BlogEditorV2";
import ProjectEditorV2 from "./pages/ProjectEditorV2";
import ProjectsPage from "./pages/ProjectsPage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPageEnhanced from "./pages/ArticleDetailPageEnhanced";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import SeriesPage from "./pages/SeriesPage";
import SeriesDetailPage from "./pages/SeriesDetailPage";
import TagsPage from "./pages/TagsPage";
import TagDetailPage from "./pages/TagDetailPage";
import TagNotFoundPage from "./pages/TagNotFoundPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import AboutPage from "./pages/AboutPage";
import ProfileManagePage from "./pages/ProfileManagePage";
import LoginForm from "./components/auth/LoginForm";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ProfileProvider>
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
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/categories/:slug" element={<CategoryDetailPage />} />
                <Route path="/series" element={<SeriesPage />} />
                <Route path="/series/:slug" element={<SeriesDetailPage />} />
                <Route path="/tags" element={<TagsPage />} />
                <Route path="/tags/:tagSlug" element={<TagDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/404-tag-not-found" element={<TagNotFoundPage />} />
                <Route path="/admin/login" element={<LoginForm />} />
                <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                <Route path="/admin/profile" element={<ProtectedRoute><ProfileManagePage /></ProtectedRoute>} />
                <Route path="/admin/blog/new" element={<ProtectedRoute><BlogEditorV2 /></ProtectedRoute>} />
                <Route path="/admin/blog/edit/:id" element={<ProtectedRoute><BlogEditorV2 /></ProtectedRoute>} />
                <Route path="/admin/project/new" element={<ProtectedRoute><ProjectEditorV2 /></ProtectedRoute>} />
                <Route path="/admin/project/edit/:id" element={<ProtectedRoute><ProjectEditorV2 /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
