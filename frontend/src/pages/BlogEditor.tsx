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
  Bold, 
  Italic, 
  Link, 
  List, 
  Hash,
  Globe,
  Calendar,
  Clock,
  Tag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BlogEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    tags: '',
    published: false,
    reading_time: 5,
  });

  useEffect(() => {
    if (id) {
      fetchBlogPost();
    }
  }, [id]);

  const fetchBlogPost = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        image_url: data.image_url || '',
        tags: data.tags ? data.tags.join(', ') : '',
        published: data.published || false,
        reading_time: data.reading_time || 5,
      });
    } catch (error) {
      toast({
        title: 'Error loading blog post',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/admin');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !id) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, id]);

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
    
    const blogData = {
      ...formData,
      tags: tagsArray,
    };

    try {
      if (id) {
        // Update existing blog post
        await supabase
          .from('blog_posts')
          .update(blogData)
          .eq('id', id);
      } else {
        // Create new blog post
        const { data } = await supabase
          .from('blog_posts')
          .insert([blogData])
          .select()
          .single();
        
        // Navigate to edit mode with the new ID
        navigate(`/admin/blog/edit/${data.id}`, { replace: true });
      }
      
      if (!isAutoSave) {
        toast({ title: 'Blog post saved successfully' });
      }
    } catch (error) {
      toast({
        title: 'Error saving blog post',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setFormData(prev => ({ ...prev, published: !prev.published }));
    await handleSave();
    toast({ 
      title: formData.published ? 'Post unpublished' : 'Post published successfully' 
    });
  };

  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    const newText = beforeText + prefix + selectedText + suffix + afterText;
    setFormData(prev => ({ ...prev, content: newText }));
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + selectedText.length;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading blog post...</p>
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
                onClick={handlePublish}
                className={`transition-all duration-300 ${
                  formData.published 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gradient-primary hover:shadow-glow'
                }`}
              >
                <Globe className="w-4 h-4 mr-2" />
                {formData.published ? 'Unpublish' : 'Publish'}
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
                placeholder="Enter your blog post title..."
                className="text-4xl font-bold border-none bg-transparent px-0 placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{ fontSize: '2.25rem', lineHeight: '2.5rem' }}
              />
            </div>

            {/* Formatting Toolbar */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('**', '**')}
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('*', '*')}
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('[', '](url)')}
                    title="Link"
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('## ', '')}
                    title="Heading"
                  >
                    <Hash className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('- ', '')}
                    title="List"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('![Alt text](', ')')}
                    title="Image"
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Start writing your amazing blog post here... 

You can use Markdown formatting:
- **Bold text**
- *Italic text*
- [Links](https://example.com)
- ## Headings
- - Lists
- ![Images](url)

Your content will be automatically saved as you type."
                  className="min-h-[600px] border-none bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg leading-relaxed"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Post Status */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Post Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={formData.published ? "default" : "secondary"}>
                      {formData.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reading Time</span>
                    <span className="text-sm font-medium">{formData.reading_time} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            {showSettings && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    SEO & Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="slug" className="text-sm font-medium">URL Slug</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="excerpt" className="text-sm font-medium">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        rows={3}
                        className="mt-1"
                        placeholder="Brief description for SEO and preview..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="image_url" className="text-sm font-medium">Featured Image</Label>
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
                      <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        className="mt-1"
                        placeholder="React, JavaScript, Tutorial"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="reading_time" className="text-sm font-medium">Reading Time (minutes)</Label>
                      <Input
                        id="reading_time"
                        type="number"
                        min="1"
                        value={formData.reading_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, reading_time: parseInt(e.target.value) || 1 }))}
                        className="mt-1"
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
                    onClick={() => window.open(`/blog/${formData.slug}`, '_blank')}
                    disabled={!formData.published}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Preview Post
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => navigator.clipboard.writeText(formData.slug)}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;