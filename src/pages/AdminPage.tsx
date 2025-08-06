import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Settings, 
  Home,
  BarChart3, 
  Users, 
  Heart, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Globe,
  PenTool,
  Folder,
  User,
  Target,
  LogOut
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import HeroStatsManager from "@/components/admin/HeroStatsManager";

const AdminPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [projects, setProjects] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const fetchData = async () => {
    try {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Fetch blog posts
      const { data: blogData } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Fetch profile - get the most recent one
      const { data: profileData } = await supabase
        .from("profile")
        .select("*")
        .order('updated_at', { ascending: false })
        .limit(1);

      setProjects(projectsData || []);
      setBlogPosts(blogData || []);
      setProfile(profileData && profileData.length > 0 ? profileData[0] : null);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error loading data");
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      
      setProjects(projects.filter(p => p.id !== id));
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Error deleting project");
    }
  };

  const deleteBlogPost = async (id: string) => {
    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
      
      setBlogPosts(blogPosts.filter(p => p.id !== id));
      toast.success("Blog post deleted successfully");
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast.error("Error deleting blog post");
    }
  };

  const goHome = () => {
    navigate("/");
  };

  // Calculate analytics
  const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0) + 
                    blogPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = projects.reduce((sum, p) => sum + (p.likes || 0), 0) + 
                     blogPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const publishedPosts = blogPosts.filter(p => p.published).length;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Portfolio Admin
                </h1>
                <p className="text-muted-foreground text-sm">Welcome back, manage your content</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="hover:shadow-soft transition-all duration-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Site
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="hover:shadow-soft transition-all duration-300 text-red-500 border-red-500/20 hover:border-red-500/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Views</p>
                  <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {totalViews.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-sm font-medium">+12.5%</span>
                <span className="text-muted-foreground text-sm">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Likes</p>
                  <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {totalLikes.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-sm font-medium">+8.2%</span>
                <span className="text-muted-foreground text-sm">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Published Posts</p>
                  <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {publishedPosts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-sm font-medium">+3</span>
                <span className="text-muted-foreground text-sm">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Projects</p>
                  <p className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {projects.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                  <Folder className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-sm font-medium">+2</span>
                <span className="text-muted-foreground text-sm">this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur-sm border border-border">
            <TabsTrigger value="projects" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              <Folder className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="blog" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              <PenTool className="w-4 h-4 mr-2" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="w-5 h-5" />
                    Projects ({projects.length})
                  </CardTitle>
                  <Button 
                    onClick={() => navigate("/admin/project/new")}
                    className="bg-gradient-primary hover:shadow-soft"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <Folder className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No projects yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Get started by creating your first project</p>
                    <Button 
                      onClick={() => navigate("/admin/project/new")}
                      className="bg-gradient-primary hover:shadow-soft"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {projects.map((project) => (
                      <div key={project.id} className="p-6 border border-border rounded-xl bg-card/30 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{project.title}</h3>
                              <Badge variant={project.featured ? 'default' : 'secondary'}>
                                {project.featured ? 'Featured' : 'Regular'}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {project.views || 0} views
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {project.likes || 0} likes
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(project.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/project/edit/${project.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteProject(project.id)}
                              className="hover:border-destructive/50 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Posts Tab */}
          <TabsContent value="blog">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <PenTool className="w-5 h-5" />
                    Blog Posts ({blogPosts.length})
                  </CardTitle>
                  <Button 
                    onClick={() => navigate("/admin/blog/new")}
                    className="bg-gradient-primary hover:shadow-soft"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Blog Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {blogPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <PenTool className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No blog posts yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start sharing your thoughts and experiences</p>
                    <Button 
                      onClick={() => navigate("/admin/blog/new")}
                      className="bg-gradient-primary hover:shadow-soft"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Write Post
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="p-6 border border-border rounded-xl bg-card/30 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{post.title}</h3>
                              <Badge variant={post.published ? 'default' : 'secondary'}>
                                {post.published ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {post.views || 0} views
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {post.likes || 0} likes
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(post.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteBlogPost(post.id)}
                              className="hover:border-destructive/50 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Management
                </CardTitle>
                <CardDescription>
                  Manage your profile information, skills, and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Update Your Profile</h3>
                  <p className="text-muted-foreground mb-6">
                    Keep your portfolio information up to date with the latest details about yourself.
                  </p>
                  <Button 
                    onClick={() => navigate("/admin/profile")}
                    className="bg-gradient-primary hover:shadow-soft transition-all duration-300"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Manage Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">Analytics Coming Soon</h3>
                    <p className="text-sm text-muted-foreground">Detailed analytics and insights will be available soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
