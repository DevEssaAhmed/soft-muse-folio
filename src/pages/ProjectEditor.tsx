import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Settings, 
  Image, 
  ExternalLink,
  Github,
  Star,
  Folder,
  Tag,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProjectEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image_url: '',
    demo_url: '',
    demo_video_url: '',
    demo_video_type: 'youtube',
    additional_images: '',
    github_url: '',
    tags: '',
    featured: false,
  });

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        image_url: data.image_url || '',
        demo_url: data.demo_url || '',
        demo_video_url: data.demo_video_url || '',
        demo_video_type: data.demo_video_type || 'youtube',
        additional_images: data.additional_images ? data.additional_images.join(', ') : '',
        github_url: data.github_url || '',
        tags: data.tags ? data.tags.join(', ') : '',
        featured: data.featured || false,
      });
    } catch (error) {
      toast({
        title: 'Error loading project',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/admin');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!formData.title) return;
    
    const autoSaveTimer = setTimeout(() => {
      handleSave(true);
    }, 5000); // Auto-save every 5 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [formData]);

  const handleSave = async (isAutoSave = false) => {
    if (!formData.title.trim()) return;
    
    setIsSaving(true);
    
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const additionalImagesArray = formData.additional_images.split(',').map(img => img.trim()).filter(img => img);
    
    const projectData = {
      ...formData,
      tags: tagsArray,
      additional_images: additionalImagesArray,
    };

    try {
      if (id) {
        // Update existing project
        await supabase
          .from('projects')
          .update(projectData)
          .eq('id', id);
      } else {
        // Create new project
        const { data } = await supabase
          .from('projects')
          .insert([projectData])
          .select()
          .single();
        
        // Navigate to edit mode with the new ID
        navigate(`/admin/project/edit/${data.id}`, { replace: true });
      }
      
      if (!isAutoSave) {
        toast({ title: 'Project saved successfully' });
      }
    } catch (error) {
      toast({
        title: 'Error saving project',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFeatureToggle = async () => {
    setFormData(prev => ({ ...prev, featured: !prev.featured }));
    await handleSave();
    toast({ 
      title: formData.featured ? 'Project unfeatured' : 'Project featured successfully' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  {isSaving ? 'Saving...' : 'Saved'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="hover:shadow-soft transition-all duration-300"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="hover:shadow-soft transition-all duration-300"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                size="sm"
                onClick={handleFeatureToggle}
                className={`transition-all duration-300 ${
                  formData.featured 
                    ? 'bg-yellow-500 hover:bg-yellow-600' 
                    : 'bg-gradient-primary hover:shadow-glow'
                }`}
              >
                <Star className="w-4 h-4 mr-2" />
                {formData.featured ? 'Unfeature' : 'Feature'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <div>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter your project title..."
                className="text-4xl font-bold border-none bg-transparent px-0 placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{ fontSize: '2.25rem', lineHeight: '2.5rem' }}
              />
            </div>

            {/* Featured Image Preview */}
            {formData.image_url && (
              <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <img 
                    src={formData.image_url}
                    alt="Project preview"
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Category & Tags */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Web Development, Mobile App, AI/ML..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Project Description */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <Label htmlFor="description" className="text-lg font-semibold mb-4 block">
                  Project Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project in detail. What does it do? What technologies did you use? What challenges did you overcome?

You can include:
• Key features and functionality
• Technologies and tools used
• Challenges faced and solutions implemented
• What you learned from this project
• Future improvements planned"
                  className="min-h-[400px] border-none bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg leading-relaxed"
                />
              </CardContent>
            </Card>

            {/* Links Section */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Project Links & Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="demo_url" className="text-sm font-medium">Live Demo URL</Label>
                    <Input
                      id="demo_url"
                      type="url"
                      value={formData.demo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, demo_url: e.target.value }))}
                      placeholder="https://myproject.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github_url" className="text-sm font-medium">GitHub Repository</Label>
                    <Input
                      id="github_url"
                      type="url"
                      value={formData.github_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                      placeholder="https://github.com/username/repo"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="demo_video_url" className="text-sm font-medium">Demo Video URL</Label>
                    <Input
                      id="demo_video_url"
                      type="url"
                      value={formData.demo_video_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, demo_video_url: e.target.value }))}
                      placeholder="YouTube, Vimeo, or direct video URL"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="demo_video_type" className="text-sm font-medium">Video Type</Label>
                    <select
                      id="demo_video_type"
                      value={formData.demo_video_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, demo_video_type: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                      <option value="upload">Direct Upload</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Status */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  Project Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Featured</span>
                    <Badge variant={formData.featured ? "default" : "secondary"}>
                      {formData.featured ? "Featured" : "Standard"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm font-medium">{formData.category || 'Uncategorized'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media & SEO */}
            {showSettings && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Media & Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="image_url" className="text-sm font-medium">Project Image</Label>
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        className="mt-1"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="tags" className="text-sm font-medium">Technologies Used</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        className="mt-1"
                        placeholder="React, TypeScript, Tailwind CSS"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="featured" className="text-sm font-medium">Featured Project</Label>
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(formData.demo_url, '_blank')}
                    disabled={!formData.demo_url}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live Demo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.open(formData.github_url, '_blank')}
                    disabled={!formData.github_url}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    View on GitHub
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigator.clipboard.writeText(formData.title)}
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Copy Title
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Technology Tags */}
            {formData.tags && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;