import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Eye, Edit, Trash2, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProjectForm from "@/components/admin/ProjectForm";
import BlogForm from "@/components/admin/BlogForm";
import ProfileForm from "@/components/admin/ProfileForm";

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Portfolio Admin</h1>
            <p className="text-muted-foreground">Manage your portfolio content</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Eye className="w-4 h-4 mr-2" />
            View Site
          </Button>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Projects</h2>
              <Button onClick={() => setShowProjectForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>

            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      {project.image_url && (
                        <img 
                          src={project.image_url} 
                          alt={project.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">{project.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingProject(project);
                          setShowProjectForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Blog Posts</h2>
              <Button onClick={() => setShowBlogForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Blog Post
              </Button>
            </div>

            <div className="grid gap-4">
              {blogPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      {post.image_url && (
                        <img 
                          src={post.image_url} 
                          alt={post.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {post.published ? "Published" : "Draft"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingBlog(post);
                          setShowBlogForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteBlogPost(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Profile Settings</h2>
              <Button onClick={() => setShowProfileForm(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle>{profile.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <p><strong>Username:</strong> @{profile.username}</p>
                    <p><strong>Title:</strong> {profile.title}</p>
                    <p><strong>Location:</strong> {profile.location}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Additional settings will be available here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Forms */}
        {showProjectForm && (
          <ProjectForm
            project={editingProject}
            onClose={() => {
              setShowProjectForm(false);
              setEditingProject(null);
            }}
            onSuccess={() => {
              fetchData();
              setShowProjectForm(false);
              setEditingProject(null);
            }}
          />
        )}

        {showBlogForm && (
          <BlogForm
            blogPost={editingBlog}
            onClose={() => {
              setShowBlogForm(false);
              setEditingBlog(null);
            }}
            onSuccess={() => {
              fetchData();
              setShowBlogForm(false);
              setEditingBlog(null);
            }}
          />
        )}

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