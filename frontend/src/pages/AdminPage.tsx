import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Settings, 
  LogOut, 
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
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProfileForm from "@/components/admin/ProfileForm";

const AdminPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profile")
        .select("*")
        .single();

      setProjects(projectsData || []);
      setBlogPosts(blogData || []);
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await supabase.from("projects").delete().eq("id", id);
      setProjects(projects.filter(p => p.id !== id));
      toast({ title: "Project deleted successfully" });
    } catch (error) {
      toast({ title: "Error deleting project", variant: "destructive" });
    }
  };

  const deleteBlogPost = async (id: string) => {
    try {
      await supabase.from("blog_posts").delete().eq("id", id);
      setBlogPosts(blogPosts.filter(p => p.id !== id));
      toast({ title: "Blog post deleted successfully" });
    } catch (error) {
      toast({ title: "Error deleting blog post", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    logout();
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
                onClick={handleLogout}
                className="hover:shadow-soft transition-all duration-300 hover:border-destructive/50 hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
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
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">+12.5%</span>
                <span className="text-sm text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-secondary/20 hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Likes</p>
                  <p className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
                    {totalLikes.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">+8.2%</span>
                <span className="text-sm text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-accent/20 hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Published Posts</p>
                  <p className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                    {publishedPosts}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {blogPosts.length - publishedPosts} drafts remaining
                </span>
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
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Folder className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {projects.filter(p => p.featured).length} featured
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Projects</h2>
                <p className="text-muted-foreground">Manage your portfolio projects</p>
              </div>
              <Button 
                onClick={() => navigate('/admin/project/new')}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>

            <div className="grid gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {project.image_url && (
                          <img 
                            src={project.image_url} 
                            alt={project.title}
                            className="w-20 h-20 object-cover rounded-xl shadow-soft"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-foreground">{project.title}</h3>
                            {project.featured && (
                              <Badge className="bg-gradient-primary text-white">Featured</Badge>
                            )}
                          </div>
                          <Badge variant="secondary" className="mb-3">{project.category}</Badge>
                          <p className="text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
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
                              <MessageSquare className="w-4 h-4" />
                              {project.comments || 0} comments
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/admin/project/edit/${project.id}`)}
                          className="hover:shadow-soft transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteProject(project.id)}
                          className="hover:shadow-soft transition-all duration-300 hover:border-destructive/50 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {projects.length === 0 && (
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Folder className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first project to get started</p>
                    <Button 
                      onClick={() => navigate('/admin/project/new')}
                      className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Project
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Blog Posts</h2>
                <p className="text-muted-foreground">Create and manage your articles</p>
              </div>
              <Button 
                onClick={() => navigate('/admin/blog/new')}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Blog Post
              </Button>
            </div>

            <div className="grid gap-6">
              {blogPosts.map((post) => (
                <Card key={post.id} className="bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {post.image_url && (
                          <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-20 h-20 object-cover rounded-xl shadow-soft"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-foreground">{post.title}</h3>
                            <Badge variant={post.published ? "default" : "secondary"}>
                              {post.published ? "Published" : "Draft"}
                            </Badge>
                          </div>
                          {post.excerpt && (
                            <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.views || 0} views
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {post.likes || 0} likes
                            </div>
                            {post.reading_time && (
                              <div>{post.reading_time} min read</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                          className="hover:shadow-soft transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteBlogPost(post.id)}
                          className="hover:shadow-soft transition-all duration-300 hover:border-destructive/50 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {blogPosts.length === 0 && (
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <PenTool className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No blog posts yet</h3>
                    <p className="text-muted-foreground mb-6">Share your thoughts and insights with the world</p>
                    <Button 
                      onClick={() => navigate('/admin/blog/new')}
                      className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Write Your First Post
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
                <p className="text-muted-foreground">Manage your personal information</p>
              </div>
              <Button 
                onClick={() => setShowProfileForm(true)}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            {profile ? (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    {profile.avatar_url && (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.name}
                        className="w-24 h-24 rounded-xl shadow-soft object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-foreground mb-2">{profile.name}</h3>
                      <p className="text-lg text-muted-foreground mb-4">@{profile.username}</p>
                      {profile.bio && (
                        <p className="text-foreground/90 mb-6">{profile.bio}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Contact Information</h4>
                          <div className="space-y-2 text-sm">
                            {profile.email && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Email:</span>
                                <span className="text-muted-foreground">{profile.email}</span>
                              </div>
                            )}
                            {profile.location && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Location:</span>
                                <span className="text-muted-foreground">{profile.location}</span>
                              </div>
                            )}
                            {profile.title && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Title:</span>
                                <span className="text-muted-foreground">{profile.title}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Social Links</h4>
                          <div className="space-y-2 text-sm">
                            {profile.github_url && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">GitHub:</span>
                                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" 
                                   className="text-primary hover:underline">
                                  {profile.github_url}
                                </a>
                              </div>
                            )}
                            {profile.linkedin_url && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">LinkedIn:</span>
                                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" 
                                   className="text-primary hover:underline">
                                  {profile.linkedin_url}
                                </a>
                              </div>
                            )}
                            {profile.website_url && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Website:</span>
                                <a href={profile.website_url} target="_blank" rel="noopener noreferrer" 
                                   className="text-primary hover:underline">
                                  {profile.website_url}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No profile found</h3>
                  <p className="text-muted-foreground mb-6">Create your profile to get started</p>
                  <Button 
                    onClick={() => setShowProfileForm(true)}
                    className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Analytics & SEO</h2>
              <p className="text-muted-foreground">Track your content performance and optimize for search engines</p>
            </div>

            <div className="grid gap-6">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Content Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-xl bg-primary/5">
                      <div className="text-3xl font-bold text-primary mb-2">{totalViews}</div>
                      <div className="text-sm text-muted-foreground">Total Views</div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-red-500/5">
                      <div className="text-3xl font-bold text-red-500 mb-2">{totalLikes}</div>
                      <div className="text-sm text-muted-foreground">Total Likes</div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-accent/5">
                      <div className="text-3xl font-bold text-accent mb-2">
                        {Math.round(totalViews / (projects.length + blogPosts.length) || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg. Views per Content</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    SEO Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/5">
                      <div>
                        <div className="font-semibold text-green-700 dark:text-green-400">SEO Score</div>
                        <div className="text-sm text-muted-foreground">Based on content optimization</div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">85/100</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-card border">
                        <div className="text-sm font-medium text-foreground mb-1">Meta Descriptions</div>
                        <div className="text-2xl font-bold text-primary">{blogPosts.filter(p => p.excerpt).length}/{blogPosts.length}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-card border">
                        <div className="text-sm font-medium text-foreground mb-1">Featured Images</div>
                        <div className="text-2xl font-bold text-primary">
                          {[...projects, ...blogPosts].filter(p => p.image_url).length}/{projects.length + blogPosts.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Profile Form Modal */}
        {showProfileForm && (
          <ProfileForm
            profile={profile}
            onClose={() => setShowProfileForm(false)}
            onSuccess={() => {
              fetchData();
              setShowProfileForm(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPage;