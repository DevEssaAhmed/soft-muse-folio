import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Tag,
  Plus,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createOrGetCategory, getAllCategories } from '@/lib/tagUtils';

const BlogEditorEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    video_url: '',
    video_type: 'youtube',
    additional_images: '',
    category_id: '',
    category_name: '', // For new category creation
    published: false,
    reading_time: 5,
  });

  useEffect(() => {
    loadCategories();
    if (id) {
      fetchBlogPost();
    }
  }, [id]);

  const loadCategories = async () => {
    const allCategories = await getAllCategories();
    setCategories(allCategories);
  };

  const fetchBlogPost = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        image_url: data.image_url || '',
        video_url: data.video_url || '',
        video_type: data.video_type || 'youtube',
        additional_images: data.additional_images ? data.additional_images.join(', ') : '',
        category_id: data.category_id || '',
        category_name: '',
        published: data.published || false,
        reading_time: data.reading_time || 5,
      });

      // Load existing tags
      setSelectedTags(data.tags || []);
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
  }, [formData, selectedTags]);

  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCreateNewCategory = async () => {
    if (!formData.category_name.trim()) return;
    
    try {
      const newCategory = await createOrGetCategory(formData.category_name);
      if (newCategory) {
        setCategories(prev => [...prev, newCategory]);
        setFormData(prev => ({ 
          ...prev, 
          category_id: newCategory.id,
          category_name: ''
        }));
        toast({ title: 'Category created successfully!' });
      }
    } catch (error) {
      toast({
        title: 'Error creating category',
        description: 'Failed to create new category',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!formData.title.trim()) return;
    
    setIsSaving(true);
    
    const additionalImagesArray = formData.additional_images.split(',').map(img => img.trim()).filter(img => img);
    
    // Handle category creation if needed
    let categoryId = formData.category_id;
    if (formData.category_name.trim()) {
      const newCategory = await createOrGetCategory(formData.category_name);
      if (newCategory) {
        categoryId = newCategory.id;
        setCategories(prev => [...prev, newCategory]);
        setFormData(prev => ({ ...prev, category_name: '' }));
      }
    }
    
    const blogData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      image_url: formData.image_url,
      video_url: formData.video_url,
      video_type: formData.video_type,
      additional_images: additionalImagesArray,
      category_id: categoryId || null,
      tags: selectedTags,
      published: formData.published,
      reading_time: formData.reading_time,
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
                className="text-2xl md:text-4xl font-bold border-none bg-transparent px-0 placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Category Selection */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Category & Tags</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">Select Category</Label>
                    <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new_category" className="text-sm font-medium">Or Create New</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="new_category"
                        value={formData.category_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, category_name: e.target.value }))}
                        placeholder="New category name"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateNewCategory}
                        disabled={!formData.category_name.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags" className="text-sm font-medium">Tags</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag and press Enter"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Selected Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive/20"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      <Label htmlFor="video_url" className="text-sm font-medium">Video URL</Label>
                      <Input
                        id="video_url"
                        type="url"
                        value={formData.video_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                        className="mt-1"
                        placeholder="YouTube, Vimeo, or direct video URL"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="video_type" className="text-sm font-medium">Video Type</Label>
                      <Select value={formData.video_type} onValueChange={(value) => setFormData(prev => ({ ...prev, video_type: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="vimeo">Vimeo</SelectItem>
                          <SelectItem value="upload">Direct Upload</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="additional_images" className="text-sm font-medium">Additional Images</Label>
                      <Textarea
                        id="additional_images"
                        value={formData.additional_images}
                        onChange={(e) => setFormData(prev => ({ ...prev, additional_images: e.target.value }))}
                        rows={3}
                        className="mt-1"
                        placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Separate URLs with commas</p>
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
                    onClick={() => window.open(`/articles/${formData.slug}`, '_blank')}
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

export default BlogEditorEnhanced;