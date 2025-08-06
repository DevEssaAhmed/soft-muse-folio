import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";

interface ProjectFormProps {
  project?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const ProjectForm = ({ project, onClose, onSuccess }: ProjectFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image_url: "",
    additional_images: [] as string[],
    demo_url: "",
    demo_video_url: "",
    demo_video_type: "",
    github_url: "",
    tags: "",
    featured: false,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        category: project.category || "",
        image_url: project.image_url || "",
        additional_images: project.additional_images || [],
        demo_url: project.demo_url || "",
        demo_video_url: project.demo_video_url || "",
        demo_video_type: project.demo_video_type || "",
        github_url: project.github_url || "",
        tags: project.tags ? project.tags.join(", ") : "",
        featured: project.featured || false,
      });
    }
  }, [project]);

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData(prev => ({ ...prev, image_url: urls[0] }));
    }
  };

  const handleAdditionalImagesUpload = (urls: string[]) => {
    setFormData(prev => ({ ...prev, additional_images: urls }));
  };

  const handleDemoVideoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        demo_video_url: urls[0],
        demo_video_type: 'file'
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
    
    const projectData = {
      ...formData,
      tags: tagsArray,
    };

    try {
      if (project) {
        // Update existing project
        await supabase
          .from("projects")
          .update(projectData)
          .eq("id", project.id);
        toast({ title: "Project updated successfully" });
      } else {
        // Create new project
        await supabase
          .from("projects")
          .insert([projectData]);
        toast({ title: "Project created successfully" });
      }
      onSuccess();
    } catch (error) {
      toast({ 
        title: "Error saving project", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{project ? "Edit Project" : "Add New Project"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="demo_url">Demo URL</Label>
              <Input
                id="demo_url"
                type="url"
                value={formData.demo_url}
                onChange={(e) => setFormData({...formData, demo_url: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({...formData, github_url: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="React, TypeScript, Tailwind"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({...formData, featured: checked})}
              />
              <Label htmlFor="featured">Featured Project</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {project ? "Update" : "Create"} Project
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectForm;