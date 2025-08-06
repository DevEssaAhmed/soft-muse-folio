import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";

interface BlogFormProps {
  blogPost?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const BlogForm = ({ blogPost, onClose, onSuccess }: BlogFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    additional_images: [] as string[],
    video_url: "",
    video_type: "",
    tags: "",
    category_id: "",
    series_id: "",
    series_order: 1,
    published: false,
    reading_time: 5,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [showNewSeriesDialog, setShowNewSeriesDialog] = useState(false);
  const [newSeries, setNewSeries] = useState({
    title: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    fetchCategoriesAndSeries();
  }, []);

  const fetchCategoriesAndSeries = async () => {
    try {
      // For now, let's create mock data since tables don't exist yet
      const mockCategories = [
        { id: '1', name: 'Web Development', slug: 'web-development' },
        { id: '2', name: 'Data Science', slug: 'data-science' },
        { id: '3', name: 'Mobile Development', slug: 'mobile-development' },
        { id: '4', name: 'DevOps', slug: 'devops' },
        { id: '5', name: 'Career', slug: 'career' },
        { id: '6', name: 'Tutorials', slug: 'tutorials' }
      ];

      const mockSeries = [
        { id: '1', title: 'React Mastery', slug: 'react-mastery' },
        { id: '2', title: 'Python for Data Science', slug: 'python-data-science' },
        { id: '3', title: 'Full Stack Development', slug: 'fullstack-development' },
        { id: '4', title: 'DevOps Fundamentals', slug: 'devops-fundamentals' }
      ];

      setCategories(mockCategories);
      setSeries(mockSeries);
    } catch (error) {
      console.error("Error fetching categories and series:", error);
    }
  };

  useEffect(() => {
    if (blogPost) {
      setFormData({
        title: blogPost.title || "",
        slug: blogPost.slug || "",
        excerpt: blogPost.excerpt || "",
        content: blogPost.content || "",
        image_url: blogPost.image_url || "",
        additional_images: blogPost.additional_images || [],
        video_url: blogPost.video_url || "",
        video_type: blogPost.video_type || "",
        tags: blogPost.tags ? blogPost.tags.join(", ") : "",
        category_id: blogPost.category_id || "",
        series_id: blogPost.series_id || "",
        series_order: blogPost.series_order || 1,
        published: blogPost.published || false,
        reading_time: blogPost.reading_time || 5,
      });
    }
  }, [blogPost]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !blogPost) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, blogPost]);

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData(prev => ({ ...prev, image_url: urls[0] }));
    }
  };

  const handleAdditionalImagesUpload = (urls: string[]) => {
    setFormData(prev => ({ ...prev, additional_images: urls }));
  };

  const handleVideoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        video_url: urls[0],
        video_type: urls[0].includes('youtube') || urls[0].includes('vimeo') ? 'external' : 'file'
      }));
    }
  };

  const createNewSeries = async () => {
    if (!newSeries.title) return;
    
    try {
      // For now, add to local state since tables don't exist
      const mockId = (series.length + 1).toString();
      const seriesSlug = newSeries.slug || newSeries.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      const newSeriesItem = {
        id: mockId,
        title: newSeries.title,
        slug: seriesSlug,
        description: newSeries.description
      };
      
      setSeries(prev => [...prev, newSeriesItem]);
      setFormData(prev => ({ ...prev, series_id: mockId }));
      setShowNewSeriesDialog(false);
      setNewSeries({ title: "", slug: "", description: "" });
      
      toast({ title: "Series created successfully" });
    } catch (error) {
      toast({ 
        title: "Error creating series", 
        description: "Please try again",
        variant: "destructive" 
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag);
    
    const blogData = {
      ...formData,
      tags: tagsArray,
    };

    try {
      if (blogPost) {
        // Update existing blog post
        await supabase
          .from("blog_posts")
          .update(blogData)
          .eq("id", blogPost.id);
        toast({ title: "Blog post updated successfully" });
      } else {
        // Create new blog post
        await supabase
          .from("blog_posts")
          .insert([blogData]);
        toast({ title: "Blog post created successfully" });
      }
      onSuccess();
    } catch (error) {
      toast({ 
        title: "Error saving blog post", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{blogPost ? "Edit Blog Post" : "Add New Blog Post"}</CardTitle>
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
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                rows={2}
                placeholder="Brief description of the blog post..."
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={10}
                placeholder="Write your blog post content here... (Markdown supported)"
                required
              />
            </div>

            <div>
              <Label htmlFor="image_url">Featured Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="React, JavaScript, Tutorial"
              />
            </div>

            <div>
              <Label htmlFor="reading_time">Reading Time (minutes)</Label>
              <Input
                id="reading_time"
                type="number"
                min="1"
                value={formData.reading_time}
                onChange={(e) => setFormData({...formData, reading_time: parseInt(e.target.value)})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({...formData, published: checked})}
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {blogPost ? "Update" : "Create"} Blog Post
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

export default BlogForm;