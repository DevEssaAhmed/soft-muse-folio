import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Eye, Settings, Image as ImageIcon, ExternalLink, Github, Star, Folder, Tag, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createOrGetCategory, getAllCategories, associateProjectTags, getProjectTags } from '@/lib/tagUtils';
import { useDebounce } from '@/hooks/use-debouncer';
import YooptaAdvancedEditor from '@/components/editor/YooptaEditor';
import { YooptaContentValue, createYooptaEditor } from '@yoopta/editor';
import { markdown as yooptaMarkdown } from '@yoopta/exports';






// Helper function to safely serialize Yoopta content to Markdown
const safeSerializeMarkdown = (editor: ReturnType<typeof createYooptaEditor>, content: YooptaContentValue): string => {
  try {
    if (!content || typeof content !== 'object' || Object.keys(content).length === 0) {
      return '';
    }
    // FIX: The correct method name is 'serialize', not 'stringify'.
    return yooptaMarkdown.serialize(editor, content);
  } catch (error) {
    console.error('Failed to serialize content to Markdown:', error);
    return ''; // Return empty string on failure
  }
};



const ProjectEditorEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [yooptaContent, setYooptaContent] = useState<YooptaContentValue>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    category_name: '',
    image_url: '',
    demo_url: '',
    demo_video_url: '',
    demo_video_type: 'youtube',
    additional_images: '',
    github_url: '',
    featured: false,
  });

  const yooptaEditor = createYooptaEditor();

  const debouncedFormData = useDebounce(formData, 1500);
  const debouncedTags = useDebounce(selectedTags, 1500);

  useEffect(() => {
    loadCategories();
    if (id) fetchProject();
  }, [id]);

  useEffect(() => {
    if (id && debouncedFormData.title) {
      handleSave(true);
    }
  }, [debouncedFormData, debouncedTags, id]);

  const loadCategories = async () => {
    const allCategories = await getAllCategories();
    setCategories(allCategories);
  };

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`*, categories (id, name)`) 
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || '',
        description: data.description || '',
        category_id: data.category_id || '',
        category_name: '',
        image_url: data.image_url || '',
        demo_url: data.demo_url || '',
        demo_video_url: data.demo_video_url || '',
        demo_video_type: data.demo_video_type || 'youtube',
        additional_images: data.additional_images ? data.additional_images.join(', ') : '',
        github_url: data.github_url || '',
        featured: data.featured || false,
      });

      if (id) {
        const tags = await getProjectTags(id);
        setSelectedTags(tags.map(tag => tag.name));
      }

      if (data.description) {
        try {
          const parsed = JSON.parse(data.description);
          if (parsed && typeof parsed === 'object') {
            setYooptaContent(parsed);
          } else {
            setYooptaContent(createParagraphFromText(data.description));
          }
        } catch (e) {
          setYooptaContent(createParagraphFromText(data.description));
        }
      }
    } catch (error: any) {
      toast({ title: 'Error loading project', description: error.message, variant: 'destructive' });
      navigate('/admin');
    } finally {
      setIsLoading(false);
    }
  };

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
        if (!categories.some((c: any) => c.id === newCategory.id)) {
          setCategories(prev => [...prev, newCategory]);
        }
        setFormData(prev => ({ ...prev, category_id: newCategory.id, category_name: '' }));
        toast({ title: 'Category created successfully!' });
      }
    } catch (error) {
      toast({ title: 'Error creating category', description: 'Failed to create new category', variant: 'destructive' });
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({ ...prev, category_id: categoryId }));
  };

  const handleSave = async (isAutoSave = false) => {
    if (!formData.title.trim()) return;
    setIsSaving(true);

    try {
      const md = safeSerializeMarkdown(yooptaEditor, yooptaContent);
      const projectData = {
        title: formData.title,
        description: JSON.stringify(yooptaContent),
        category_id: formData.category_id || null,
        image_url: formData.image_url || null,
        demo_url: formData.demo_url || null,
        demo_video_url: formData.demo_video_url || null,
        demo_video_type: formData.demo_video_type,
        additional_images: formData.additional_images.split(',').map(i => i.trim()).filter(Boolean),
        github_url: formData.github_url || null,
        featured: formData.featured,
      };

      let projectId = id;
      let error;

      if (id) {
        const { error: updateError } = await supabase.from('projects').update(projectData).eq('id', id);
        error = updateError;
      } else {
        const { data, error: insertError } = await supabase.from('projects').insert(projectData).select('id').single();
        error = insertError;
        if (data) projectId = data.id;
      }

      if (error) throw error;

      if (projectId) await associateProjectTags(projectId, selectedTags);

      if (!isAutoSave) toast({ title: `Project ${id ? 'updated' : 'created'} successfully` });
      if (!id && projectId) navigate(`/admin/project/edit/${projectId}`, { replace: true });
    } catch (error: any) {
      if (!isAutoSave) toast({ title: 'Error saving project', description: error.message, variant: 'destructive' });
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) setFormData(prev => ({ ...prev, image_url: urls[0] }));
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
      <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-sm text-muted-foreground">{isSaving ? 'Saving...' : 'Saved'}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} className="hover:shadow-soft transition-all duration-300">
                <Settings className="w-4 h-4 mr-2" /> Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleSave()} disabled={isSaving} className="hover:shadow-soft transition-all duration-300">
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div>
              <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter your project title..." className="text-2xl md:text-4xl font-bold border-none bg-transparent px-0 placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0" />
            </div>
            {formData.image_url && (
              <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <img src={formData.image_url} alt="Project preview" className="w-full h-64 object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                </CardContent>
              </Card>
            )}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Category &amp; Tags</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">Select Category</Label>
                    <Select value={formData.category_id} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((category: any) => (<SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new_category" className="text-sm font-medium">Or Create New</Label>
                    <div className="flex gap-2 mt-1">
                      <Input id="new_category" value={formData.category_name} onChange={(e) => setFormData(prev => ({ ...prev, category_name: e.target.value }))} placeholder="New category name" />
                      <Button type="button" size="sm" onClick={handleCreateNewCategory} disabled={!formData.category_name.trim()}><Plus className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="tags" className="text-sm font-medium">Technologies &amp; Tags</Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="tags" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Add a tag and press Enter" />
                    <Button type="button" size="sm" onClick={handleAddTag} disabled={!tagInput.trim()}><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button type="button" variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-destructive/20" onClick={() => handleRemoveTag(tag)}>×</Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="description" className="text-lg font-semibold">Project Content</Label>
                </div>
                <YooptaAdvancedEditor value={yooptaContent} onChange={setYooptaContent} placeholder="Describe your project in detail using the advanced editor..." className="min-h-[400px] border rounded-lg bg-background/50 p-4" />
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Project Links &amp; Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="demo_url" className="text-sm font-medium">Live Demo URL</Label>
                    <Input id="demo_url" type="url" value={formData.demo_url} onChange={(e) => setFormData(prev => ({ ...prev, demo_url: e.target.value }))} placeholder="https://myproject.com" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="github_url" className="text-sm font-medium">GitHub Repository</Label>
                    <Input id="github_url" type="url" value={formData.github_url} onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))} placeholder="https://github.com/username/repo" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="demo_video_url" className="text-sm font-medium">Demo Video URL</Label>
                    <Input id="demo_video_url" type="url" value={formData.demo_video_url} onChange={(e) => setFormData(prev => ({ ...prev, demo_video_url: e.target.value }))} placeholder="YouTube, Vimeo, or direct video URL" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="demo_video_type" className="text-sm font-medium">Video Type</Label>
                    <Select value={formData.demo_video_type} onValueChange={(value) => setFormData(prev => ({ ...prev, demo_video_type: value }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="vimeo">Vimeo</SelectItem>
                        <SelectItem value="upload">Direct Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Folder className="w-4 h-4" /> Project Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Featured</span>
                    <Badge variant={formData.featured ? 'default' : 'secondary'}>{formData.featured ? 'Featured' : 'Standard'}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm font-medium">{(categories.find((c: any) => c.id === formData.category_id) as any)?.name || 'Uncategorized'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {showSettings && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="image_url" className="text-sm font-medium">Project Image</Label>
                    <Input id="image_url" type="url" value={formData.image_url} onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))} className="mt-1" placeholder="https://example.com/image.jpg" />
                  </div>
                  
                  </CardContent>
</Card>
// Additional settings can be added here
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
