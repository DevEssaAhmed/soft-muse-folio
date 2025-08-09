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
  Image as ImageIcon, 
  Hash,
  Calendar,
  Clock,
  Tag,
  Plus,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createOrGetCategory, getAllCategories, associateBlogPostTags, getBlogPostTags } from '@/lib/tagUtils';
import FileUpload from '@/components/FileUpload';
import YooptaAdvancedEditor from '@/components/editor/YooptaEditor';
import { YooptaContentValue, createYooptaEditor } from '@yoopta/editor';
import { markdown as yooptaMarkdown } from '@yoopta/exports';

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
  const [yooptaContent, setYooptaContent] = useState<YooptaContentValue>({});
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
    image_url: '',
    video_url: '',
    video_type: 'youtube',
    category_id: '',
    category_name: '',
    series_id: '',
    series_order: 1,
    published: false,
    reading_time: 5,
  });

  const yooptaEditor = createYooptaEditor();

  useEffect(() => {
    loadCategories();
    loadSeries();
    if (id) fetchBlogPost();
  }, [id]);

  const loadCategories = async () => {
    const allCategories = await getAllCategories();
    setCategories(allCategories);
  };

  const loadSeries = async () => {
    try {
      const { data: seriesData, error: seriesError } = await supabase
        .from('series')
        .select('*')
        .order('title');

      if (seriesError) {
        console.error('Error fetching series:', seriesError);
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
      console.error('Error loading series:', error);
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
        .select(`*, categories (id, name), series (id, title)`) 
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        image_url: data.image_url || '',
        video_url: data.video_url || '',
        video_type: data.video_type || 'youtube',
        category_id: data.category_id || '',
        category_name: '',
        series_id: data.series_id || '',
        series_order: data.series_order || 1,
        published: data.published || false,
        reading_time: data.reading_time || 5,
      });

      // Load existing tags
      if (id) {
        const tags = await getBlogPostTags(id);
        setSelectedTags(tags.map(tag => tag.name));
      }

      // Hydrate Yoopta content (if JSON), otherwise start minimal paragraph
      if (data.content) {
        try {
          const parsed = JSON.parse(data.content);
          if (parsed && typeof parsed === 'object') {
            setYooptaContent(parsed);
          } else {
            setYooptaContent(createParagraphFromText(data.content));
          }
        } catch (e) {
          setYooptaContent(createParagraphFromText(data.content));
        }
      }
    } catch (error: any) {
      toast({ title: 'Error loading blog post', description: error.message, variant: 'destructive' });
      navigate('/admin');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !id) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, id]);

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
        setFormData(prev => ({ ...prev, category_id: newCategory.id, category_name: '' }));
        toast({ title: 'Category created successfully!' });
      }
    } catch (error) {
      toast({ title: 'Error creating category', description: 'Failed to create new category', variant: 'destructive' });
    }
  };

  const createNewSeries = async () => {
    if (!newSeries.title) return;
    try {
      const seriesSlug = newSeries.slug || newSeries.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const { data, error } = await supabase
        .from('series')
        .insert([{ title: newSeries.title, slug: seriesSlug, description: newSeries.description, status: 'active' }])
        .select()
        .single();
      if (error) {
        console.error('Error creating series:', error);
        const mockId = (series.length + 1).toString();
        const newSeriesItem = { id: mockId, title: newSeries.title, slug: seriesSlug, description: newSeries.description };
        setSeries(prev => [...prev, newSeriesItem]);
        setFormData(prev => ({ ...prev, series_id: mockId }));
        toast({ title: 'Series created successfully (demo mode)' });
      } else {
        setSeries(prev => [...prev, data]);
        setFormData(prev => ({ ...prev, series_id: data.id }));
        toast({ title: 'Series created successfully' });
      }
      setShowNewSeriesDialog(false);
      setNewSeries({ title: '', slug: '', description: '' });
    } catch (error) {
      console.error('Error creating series:', error);
      toast({ title: 'Error creating series', description: 'Please try again', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    setIsSaving(true);

    try {
      // Serialize Yoopta to Markdown for reading_time, save JSON in DB (Yoopta recommended)
      const md = safeSerializeMarkdown(yooptaEditor, yooptaContent);
      const readingTime = estimateReadingTime(md);

      const blogData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: JSON.stringify(yooptaContent),
        image_url: formData.image_url,
        video_url: formData.video_url,
        video_type: formData.video_type,
        category_id: formData.category_id || null,
        series_id: formData.series_id || null,
        series_order: formData.series_order,
        published: formData.published,
        reading_time: readingTime,
      };

      let blogPostId = id;
      if (id) {
        const { error } = await supabase.from('blog_posts').update(blogData).eq('id', id);
        if (error) throw error;
        await associateBlogPostTags(id, selectedTags);
        toast({ title: 'Blog post updated successfully!' });
      } else {
        const { data, error } = await supabase.from('blog_posts').insert([blogData]).select().single();
        if (error) throw error;
        blogPostId = data.id;
        await associateBlogPostTags(data.id, selectedTags);
        toast({ title: 'Blog post created successfully!' });
        navigate(`/admin/blog/edit/${data.id}`);
      }
    } catch (error: any) {
      toast({ title: 'Error saving blog post', description: error.message, variant: 'destructive' });
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) setFormData(prev => ({ ...prev, image_url: urls[0] }));
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </Button>
              <div className="text-sm text-gray-500">
                {id ? 'Editing' : 'Creating'} Blog Post
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="gap-2" disabled={!formData.title}>
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving || !formData.title} className="gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : id ? 'Update' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-6">
                <Input placeholder="Enter your blog post title..." value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="text-2xl md:text-4xl font-bold border-none bg-transparent px-0 placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0" />

                <div>
                  <Label className="text-sm font-medium text-gray-600">Slug</Label>
                  <Input value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} className="mt-1" placeholder="blog-post-slug" />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Excerpt</Label>
                  <Textarea value={formData.excerpt} onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))} className="mt-1" rows={3} placeholder="Write a brief description of your blog post..." />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Content</Label>
                  <div className="mt-2">
                    <YooptaAdvancedEditor
                      value={yooptaContent}
                      onChange={setYooptaContent}
                      placeholder="Type '/' for commands or start writing your blog post..."
                      className="min-h-[600px] border rounded-lg bg-background/50 p-4"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Publishing
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge variant={formData.published ? 'default' : 'secondary'}>
                      {formData.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reading Time</span>
                    <div className="flex items-center gap-1">
                      <Input type="number" value={formData.reading_time} onChange={(e) => setFormData(prev => ({ ...prev, reading_time: parseInt(e.target.value) || 5 }))} className="w-16 h-8 text-center" min="1" />
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Categories &amp; Series
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={formData.category_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value === 'none' ? '' : value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Create New Category</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={formData.category_name} onChange={(e) => setFormData(prev => ({ ...prev, category_name: e.target.value }))} placeholder="Category name" className="flex-1" />
                      <Button size="sm" variant="outline" onClick={handleCreateNewCategory} disabled={!formData.category_name.trim()}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Series (Optional)</Label>
                    <div className="flex gap-2 mt-1">
                      <Select value={formData.series_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, series_id: value === 'none' ? '' : value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a series" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Series</SelectItem>
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
                              <Label htmlFor="series-title">Title *</nLabel>
                              <Input id="series-title" value={newSeries.title} onChange={(e) => setNewSeries({ ...newSeries, title: e.target.value })} required />
                            </div>
                            <div>
                              <Label htmlFor="series-description">Description</Label>
                              <Textarea id="series-description" value={newSeries.description} onChange={(e) => setNewSeries({ ...newSeries, description: e.target.value })} rows={3} />
                            </div>
                            <div className="flex gap-2 pt-4">
                              <Button onClick={createNewSeries} className="flex-1">Create Series</Button>
                              <Button type="button" variant="outline" onClick={() => setShowNewSeriesDialog(false)}>Cancel</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {formData.series_id && formData.series_id !== 'none' && (
                      <div className="mt-2">
                        <Label className="text-sm">Order in Series</Label>
                        <Input type="number" min="1" value={formData.series_order} onChange={(e) => setFormData(prev => ({ ...prev, series_order: parseInt(e.target.value) || 1 }))} className="mt-1" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Tags
                </h3>
                <div className="flex gap-2 mb-3">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Add a tag..." className="flex-1" />
                  <Button size="sm" variant="outline" onClick={handleAddTag} disabled={!tagInput.trim() || selectedTags.includes(tagInput.trim())}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Media
                </h3>
                <div className="space-y-4">
                  <FileUpload label="Featured Image" uploadType="image" onUploadComplete={handleImageUpload} maxFiles={1} existingFiles={formData.image_url ? [formData.image_url] : []} simultaneousMode={true} urlInputPlaceholder="https://example.com/image.jpg" enableImageEditing={true} />
                  <FileUpload label="Video (Optional)" uploadType="video" onUploadComplete={handleVideoUpload} maxFiles={1} existingFiles={formData.video_url ? [formData.video_url] : []} simultaneousMode={true} urlInputPlaceholder="https://youtube.com/watch?v=... or direct video URL" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

function createParagraphFromText(text: string): YooptaContentValue {
  const id = Date.now().toString();
  return {
    [id]: {
      id,
      type: 'Paragraph',
      value: [
        { id: id + '-1', type: 'paragraph', children: [{ text }] }
      ],
      meta: { order: 0, depth: 0 }
    }
  };
}

function safeSerializeMarkdown(editor: ReturnType<typeof createYooptaEditor>, value: YooptaContentValue): string {
  try {
    return yooptaMarkdown.serialize(editor, value) || '';
  } catch (e) {
    console.error('Markdown serialization error:', e);
    return '';
  }
}

function estimateReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default BlogEditorEnhanced;