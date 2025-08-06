import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import FileUpload from '@/components/FileUpload';

const BlogEditorEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showNewSeriesDialog, setShowNewSeriesDialog] = useState(false);
  const [newSeries, setNewSeries] = useState({
    title: '',
    slug: '',
    description: ''
  });
  
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
    series_id: '',      // Added series support
    series_order: 1,    // Added series order
    published: false,
    reading_time: 5,
  });

  useEffect(() => {
    loadCategories();
    loadSeries(); // Load series data
    if (id) {
      fetchBlogPost();
    }
  }, [id]);

  const loadCategories = async () => {
    const allCategories = await getAllCategories();
    setCategories(allCategories);
  };

  const loadSeries = async () => {
    try {
      // Fetch series from database
      const { data: seriesData, error: seriesError } = await supabase
        .from('series')
        .select('*')
        .order('title');

      if (seriesError) {
        console.error('Error fetching series:', seriesError);
        // Fall back to mock data if database fails
        setSeries([
          { id: '1', title: 'React Mastery', slug: 'react-mastery' },
          { id: '2', title: 'Python for Data Science', slug: 'python-data-science' },
          { id: '3', title: 'Full Stack Development', slug: 'fullstack-development' },
          { id: '4', title: 'DevOps Fundamentals', slug: 'devops-fundamentals' }
        ]);
      } else {
        setSeries(seriesData || []);
      }
    } catch (error) {
      console.error("Error loading series:", error);
      // Use fallback mock data
      setSeries([
        { id: '1', title: 'React Mastery', slug: 'react-mastery' },
        { id: '2', title: 'Python for Data Science', slug: 'python-data-science' },
        { id: '3', title: 'Full Stack Development', slug: 'fullstack-development' },
        { id: '4', title: 'DevOps Fundamentals', slug: 'devops-fundamentals' }
      ]);
    }
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
          ),
          series (
            id,
            title
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
        series_id: data.series_id || '',        // Load series data
        series_order: data.series_order || 1,   // Load series order
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

  const createNewSeries = async () => {
    if (!newSeries.title) return;
    
    try {
      // Generate slug if not provided
      const seriesSlug = newSeries.slug || newSeries.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      const { data, error } = await supabase
        .from('series')
        .insert([{
          title: newSeries.title,
          slug: seriesSlug,
          description: newSeries.description,
          status: 'active'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating series:', error);
        // Fallback to local state for demo purposes
        const mockId = (series.length + 1).toString();
        const newSeriesItem = {
          id: mockId,
          title: newSeries.title,
          slug: seriesSlug,
          description: newSeries.description
        };
        
        setSeries(prev => [...prev, newSeriesItem]);
        setFormData(prev => ({ ...prev, series_id: mockId }));
        toast({ title: "Series created successfully (demo mode)" });
      } else {
        // Successfully created in database
        setSeries(prev => [...prev, data]);
        setFormData(prev => ({ ...prev, series_id: data.id }));
        toast({ title: "Series created successfully" });
      }
      
      setShowNewSeriesDialog(false);
      setNewSeries({ title: "", slug: "", description: "" });
    } catch (error) {
      console.error('Error creating series:', error);
      toast({ 
        title: "Error creating series", 
        description: "Please try again",
        variant: "destructive" 
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
    
    try {
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
        series_id: formData.series_id || null,      // Include series data
        series_order: formData.series_order,        // Include series order
        tags: selectedTags,
        published: formData.published,
        reading_time: formData.reading_time,
      };

      if (id) {
        // Update existing blog post
        const { error } = await supabase
          .from('blog_posts')
          .update(blogData)
          .eq('id', id);
        
        if (error) throw error;
        
        if (!isAutoSave) {
          toast({ title: 'Blog post updated successfully!' });
        }
      } else {
        // Create new blog post
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([blogData])
          .select()
          .single();
        
        if (error) throw error;
        
        if (!isAutoSave) {
          toast({ title: 'Blog post created successfully!' });
          navigate(`/admin/blog/edit/${data.id}`);
        }
      }
    } catch (error) {
      if (!isAutoSave) {
        toast({
          title: 'Error saving blog post',
          description: error.message,
          variant: 'destructive',
        });
      }
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData(prev => ({ ...prev, image_url: urls[0] }));
    }
  };

  const handleAdditionalImagesUpload = (urls: string[]) => {
    setFormData(prev => ({ 
      ...prev, 
      additional_images: urls.join(', ')
    }));
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </Button>
              <div className="text-sm text-gray-500">
                {id ? 'Editing' : 'Creating'} Blog Post
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={!formData.title}
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave()}
                disabled={isSaving || !formData.title}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : id ? 'Update' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <Input
                      placeholder="Enter your blog post title..."
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="text-2xl font-bold border-none p-0 focus:ring-0 placeholder:text-gray-400"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      Slug
                    </Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="mt-1"
                      placeholder="blog-post-slug"
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Excerpt</Label>
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      className="mt-1"
                      rows={3}
                      placeholder="Write a brief description of your blog post..."
                    />
                  </div>

                  {/* Content Editor */}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Content</Label>
                    <div className="mt-1 border rounded-lg">
                      {/* Toolbar */}
                      <div className="border-b p-3 flex flex-wrap gap-1">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Bold className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Italic className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Link className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <List className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Hash className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Image className="w-4 h-4" />
                        </Button>
                      </div>

                      <Textarea
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        className="min-h-[400px] border-none focus:ring-0 resize-none"
                        placeholder="Write your blog post content here... (Markdown supported)"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Settings */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Publishing
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant={formData.published ? "default" : "secondary"}>
                      {formData.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reading Time</span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={formData.reading_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, reading_time: parseInt(e.target.value) || 5 }))}
                        className="w-16 h-8 text-center"
                        min="1"
                      />
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories and Series */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Categories & Series
                </h3>
                <div className="space-y-4">
                  {/* Category Selection */}
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Category</SelectItem>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* New Category Creation */}
                  <div>
                    <Label className="text-sm font-medium">Create New Category</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={formData.category_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, category_name: e.target.value }))}
                        placeholder="Category name"
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCreateNewCategory}
                        disabled={!formData.category_name.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Series Selection */}
                  <div>
                    <Label className="text-sm font-medium">Series (Optional)</Label>
                    <div className="flex gap-2 mt-1">
                      <Select value={formData.series_id} onValueChange={(value) => setFormData(prev => ({ ...prev, series_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a series" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Series</SelectItem>
                          {series.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={showNewSeriesDialog} onOpenChange={setShowNewSeriesDialog}>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Series</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="series-title">Title *</Label>
                              <Input
                                id="series-title"
                                value={newSeries.title}
                                onChange={(e) => setNewSeries({...newSeries, title: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="series-description">Description</Label>
                              <Textarea
                                id="series-description"
                                value={newSeries.description}
                                onChange={(e) => setNewSeries({...newSeries, description: e.target.value})}
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button onClick={createNewSeries} className="flex-1">
                                Create Series
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setShowNewSeriesDialog(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {formData.series_id && (
                      <div className="mt-2">
                        <Label className="text-sm">Order in Series</Label>
                        <Input
                          type="number"
                          min="1"
                          value={formData.series_order}
                          onChange={(e) => setFormData(prev => ({ ...prev, series_order: parseInt(e.target.value) || 1 }))}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Tags
                </h3>
                
                {/* Tag Input */}
                <div className="flex gap-2 mb-3">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Add a tag..."
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || selectedTags.includes(tagInput.trim())}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Media Uploads */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Media
                </h3>
                
                <div className="space-y-4">
                  {/* Featured Image Upload with simultaneous file + URL support */}
                  <FileUpload
                    label="Featured Image"
                    uploadType="image"
                    onUploadComplete={handleImageUpload}
                    maxFiles={1}
                    existingFiles={formData.image_url ? [formData.image_url] : []}
                    simultaneousMode={true}  // Enable simultaneous mode
                    urlInputPlaceholder="https://example.com/image.jpg"
                  />

                  {/* Additional Images with simultaneous support */}
                  <FileUpload
                    label="Additional Images"
                    uploadType="image"
                    onUploadComplete={handleAdditionalImagesUpload}
                    maxFiles={5}
                    multiple={true}
                    existingFiles={formData.additional_images ? formData.additional_images.split(', ').filter(img => img.trim()) : []}
                    simultaneousMode={true}  // Enable simultaneous mode
                    urlInputPlaceholder="https://example.com/additional-image.jpg"
                  />

                  {/* Video Upload with simultaneous support */}
                  <FileUpload
                    label="Video (Optional)"
                    uploadType="video"
                    onUploadComplete={handleVideoUpload}
                    maxFiles={1}
                    existingFiles={formData.video_url ? [formData.video_url] : []}
                    simultaneousMode={true}  // Enable simultaneous mode
                    urlInputPlaceholder="https://youtube.com/watch?v=... or direct video URL"
                  />
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