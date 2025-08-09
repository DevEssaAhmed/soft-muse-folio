import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Settings, Eye, Save, Publish, ImageIcon, VideoIcon, LinkIcon, Plus, Type, Hash, List, ListOrdered, Quote, Code, Minus, CheckSquare, Calendar, Tag, FolderOpen, Clock, Upload, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createOrGetTag, associateBlogPostTags, getBlogPostTags } from '@/lib/tagUtils';

// Enhanced Hashnode-like Editor Component
const HashnodeEditor: React.FC<{
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}> = ({ content, onChange, placeholder = "Tell your story..." }) => {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [currentBlock, setCurrentBlock] = useState('');
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [editorRef, setEditorRef] = useState<HTMLDivElement | null>(null);

  const slashCommands = [
    { icon: Type, label: 'Text', description: 'Start writing with plain text', command: 'text' },
    { icon: Hash, label: 'Heading 1', description: 'Big section heading', command: 'h1' },
    { icon: Hash, label: 'Heading 2', description: 'Medium section heading', command: 'h2' },
    { icon: Hash, label: 'Heading 3', description: 'Small section heading', command: 'h3' },
    { icon: List, label: 'Bullet List', description: 'Create a simple bullet list', command: 'ul' },
    { icon: ListOrdered, label: 'Numbered List', description: 'Create a list with numbering', command: 'ol' },
    { icon: CheckSquare, label: 'To-do List', description: 'Track tasks with a to-do list', command: 'todo' },
    { icon: Quote, label: 'Quote', description: 'Capture a quote', command: 'quote' },
    { icon: Code, label: 'Code', description: 'Capture a code snippet', command: 'code' },
    { icon: ImageIcon, label: 'Image', description: 'Upload or embed an image', command: 'image' },
    { icon: VideoIcon, label: 'Video', description: 'Upload or embed a video', command: 'video' },
    { icon: LinkIcon, label: 'Link', description: 'Add a link', command: 'link' },
    { icon: Minus, label: 'Divider', description: 'Visually divide blocks', command: 'divider' },
  ];

  const insertBlock = useCallback((command: string) => {
    if (!editorRef) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let content = '';

    switch (command) {
      case 'h1':
        content = '<h1>Heading 1</h1>';
        break;
      case 'h2':
        content = '<h2>Heading 2</h2>';
        break;
      case 'h3':
        content = '<h3>Heading 3</h3>';
        break;
      case 'ul':
        content = '<ul><li>List item</li></ul>';
        break;
      case 'ol':
        content = '<ol><li>List item</li></ol>';
        break;
      case 'todo':
        content = '<div class="todo-item"><input type="checkbox" /> Todo item</div>';
        break;
      case 'quote':
        content = '<blockquote>Quote text</blockquote>';
        break;
      case 'code':
        content = '<pre><code>// Your code here</code></pre>';
        break;
      case 'divider':
        content = '<hr />';
        break;
      case 'image':
        content = '<div class="image-placeholder" contenteditable="false"><img src="" alt="Image" /><input type="file" accept="image/*" /></div>';
        break;
      case 'video':
        content = '<div class="video-placeholder" contenteditable="false"><video controls><source src="" /></video><input type="file" accept="video/*" /></div>';
        break;
      default:
        content = '<p>Text block</p>';
    }

    range.deleteContents();
    range.insertNode(range.createContextualFragment(content));
    
    setShowSlashMenu(false);
    onChange(editorRef.innerHTML);
  }, [editorRef, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '/' && !showSlashMenu) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSlashMenuPosition({ x: rect.left, y: rect.bottom });
        setShowSlashMenu(true);
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      setShowSlashMenu(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString() || '';
    setSelectedText(text);
    setIsToolbarVisible(text.length > 0);
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef) {
      onChange(editorRef.innerHTML);
    }
  };

  return (
    <div className="relative">
      {/* Floating Toolbar */}
      {isToolbarVisible && selectedText && (
        <div className="absolute z-50 bg-gray-900 text-white rounded-lg shadow-lg p-2 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => formatText('bold')} className="text-white hover:bg-gray-700">
            <strong>B</strong>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText('italic')} className="text-white hover:bg-gray-700">
            <em>I</em>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText('underline')} className="text-white hover:bg-gray-700">
            <u>U</u>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText('strikeThrough')} className="text-white hover:bg-gray-700">
            <s>S</s>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => formatText('createLink', prompt('Enter URL:') || '')} className="text-white hover:bg-gray-700">
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Slash Menu */}
      {showSlashMenu && (
        <div 
          className="absolute z-50 bg-white border rounded-lg shadow-lg max-w-sm w-72 max-h-96 overflow-y-auto"
          style={{ left: slashMenuPosition.x, top: slashMenuPosition.y }}
        >
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2">BASIC BLOCKS</div>
            {slashCommands.map((cmd, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => insertBlock(cmd.command)}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <cmd.icon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">{cmd.label}</div>
                  <div className="text-xs text-gray-500">{cmd.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div
        ref={setEditorRef}
        contentEditable
        className="min-h-[500px] focus:outline-none prose prose-lg max-w-none p-6"
        style={{ whiteSpace: 'pre-wrap' }}
        onKeyDown={handleKeyDown}
        onMouseUp={handleTextSelection}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        dangerouslySetInnerHTML={{ __html: content }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
        }
        
        .todo-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 4px 0;
        }
        
        .image-placeholder, .video-placeholder {
          border: 2px dashed #E5E7EB;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
          border-radius: 8px;
        }
        
        blockquote {
          border-left: 4px solid #3B82F6;
          padding-left: 16px;
          margin: 20px 0;
          font-style: italic;
          color: #6B7280;
          background: #F9FAFB;
          padding: 16px;
          border-radius: 4px;
        }
        
        pre {
          background: #1F2937;
          color: #F3F4F6;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
        }
        
        hr {
          border: none;
          border-top: 2px solid #E5E7EB;
          margin: 30px 0;
        }
      `}</style>
    </div>
  );
};

// Media Upload Component
const MediaUploadDialog: React.FC<{
  type: 'image' | 'video';
  onUpload: (url: string) => void;
  onClose: () => void;
}> = ({ type, onUpload, onClose }) => {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${type}-${timestamp}-${safeName}`;
      const bucket = type === 'image' ? 'images' : 'videos';

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onUpload(urlData.publicUrl);
      toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully`);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (url) {
      onUpload(url);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">
          Add {type === 'image' ? 'Image' : 'Video'}
        </h3>
        
        <div className="flex gap-2 mb-4">
          <Button
            variant={uploadMethod === 'file' ? 'default' : 'outline'}
            onClick={() => setUploadMethod('file')}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
          <Button
            variant={uploadMethod === 'url' ? 'default' : 'outline'}
            onClick={() => setUploadMethod('url')}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            From URL
          </Button>
        </div>

        {uploadMethod === 'file' ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept={type === 'image' ? 'image/*' : 'video/*'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {uploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  Uploading...
                </div>
              ) : (
                <>
                  <div className="text-gray-400 mb-2">
                    {type === 'image' ? <ImageIcon className="w-12 h-12 mx-auto" /> : <VideoIcon className="w-12 h-12 mx-auto" />}
                  </div>
                  <p className="text-gray-600">Click to upload {type}</p>
                </>
              )}
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder={`Enter ${type} URL`}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button onClick={handleUrlSubmit} className="w-full">
              Add {type === 'image' ? 'Image' : 'Video'}
            </Button>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Blog Editor Component
const BlogEditorV2: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState<'image' | 'video' | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    published: false,
    categoryId: '',
    seriesId: '',
    readingTime: 5,
  });

  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !id) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, id]);

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
    if (id) {
      loadBlogPost();
    }
  }, [id]);

  const loadInitialData = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      setCategories(categoriesData || []);

      // Load series
      const { data: seriesData } = await supabase
        .from('series')
        .select('*')
        .order('name');
      setSeries(seriesData || []);

      // Load tags
      const { data: tagsData } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      setAvailableTags(tagsData || []);

    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load editor data');
    }
  };

  const loadBlogPost = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (post) {
        setFormData({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          featuredImage: post.featured_image || '',
          published: post.published || false,
          categoryId: post.category_id || '',
          seriesId: post.series_id || '',
          readingTime: post.reading_time || 5,
        });

        // Load post tags
        const postTags = await getBlogPostTags(id);
        setTags(postTags.map(tag => tag.name));
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
      toast.error('Failed to load blog post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (publishNow = false) => {
    setIsSaving(true);
    try {
      const postData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        featured_image: formData.featuredImage,
        published: publishNow || formData.published,
        category_id: formData.categoryId || null,
        series_id: formData.seriesId || null,
        reading_time: formData.readingTime,
        updated_at: new Date().toISOString(),
      };

      let postId = id;

      if (id) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);
        
        if (error) throw error;
      } else {
        // Create new post
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([{ ...postData, created_at: new Date().toISOString() }])
          .select()
          .single();

        if (error) throw error;
        postId = data.id;
        
        // Update URL to edit mode
        navigate(`/admin/blog/edit/${postId}`, { replace: true });
      }

      // Handle tag associations
      if (postId && tags.length > 0) {
        await associateBlogPostTags(postId, tags);
      }

      toast.success(publishNow ? 'Blog post published!' : 'Blog post saved!');
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error('Failed to save blog post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaUpload = (url: string) => {
    // Insert media into content at cursor position
    const mediaHtml = showMediaDialog === 'image' 
      ? `<img src="${url}" alt="Uploaded image" style="max-width: 100%; height: auto;" />`
      : `<video controls style="max-width: 100%; height: auto;"><source src="${url}" type="video/mp4" /></video>`;
    
    setFormData(prev => ({
      ...prev,
      content: prev.content + `<div>${mediaHtml}</div>`
    }));
  };

  const addTag = (tagName: string) => {
    if (tagName && !tags.includes(tagName)) {
      setTags([...tags, tagName]);
    }
  };

  const removeTag = (tagName: string) => {
    setTags(tags.filter(tag => tag !== tagName));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')} className="text-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {id ? 'Edit Blog Post' : 'Create Blog Post'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={() => handleSave(false)} 
              disabled={isSaving}
              variant="outline"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              onClick={() => handleSave(true)} 
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Publish className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Editor */}
        <div className="lg:col-span-3">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-0">
              {/* Title Input */}
              <div className="p-6 border-b">
                <Input
                  type="text"
                  placeholder="Enter your blog post title..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="text-4xl font-bold border-none px-0 focus:ring-0 placeholder:text-gray-400"
                />
              </div>
              
              {/* Slug */}
              <div className="px-6 py-2 border-b bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>URL:</span>
                  <span className="text-blue-600">yourdomain.com/blog/</span>
                  <Input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="flex-1 h-auto py-1 border-none bg-transparent focus:ring-0"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div className="p-6 border-b">
                <Label className="text-sm font-medium text-gray-600 mb-2 block">Excerpt</Label>
                <Textarea
                  placeholder="Write a brief description of your blog post..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  className="resize-none border-gray-200 focus:ring-blue-500"
                />
              </div>

              {/* Hashnode-like Editor */}
              <div className="relative">
                <HashnodeEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Tell your story..."
                />
                
                {/* Media Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMediaDialog('image')}
                    className="text-gray-600"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMediaDialog('video')}
                    className="text-gray-600"
                  >
                    <VideoIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                Publishing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={formData.published ? "default" : "secondary"}>
                  {formData.published ? 'Published' : 'Draft'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reading-time" className="text-sm">Reading Time</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="reading-time"
                    type="number"
                    value={formData.readingTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, readingTime: parseInt(e.target.value) || 5 }))}
                    className="w-16 h-8"
                  />
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="published" className="text-sm">Publish immediately</Label>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories & Series */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderOpen className="w-4 h-4" />
                Categories & Series
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm">Category</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="No Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Series (Optional)</Label>
                <Select value={formData.seriesId} onValueChange={(value) => setFormData(prev => ({ ...prev, seriesId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="No Series" />
                  </SelectTrigger>
                  <SelectContent>
                    {series.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="w-4 h-4" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addTag(input.value);
                    input.value = '';
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.featuredImage ? (
                <div className="relative">
                  <img src={formData.featuredImage} alt="Featured" className="w-full h-32 object-cover rounded" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowMediaDialog('image')}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Featured Image
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Media Upload Dialog */}
      {showMediaDialog && (
        <MediaUploadDialog
          type={showMediaDialog}
          onUpload={(url) => {
            if (showMediaDialog === 'image' && !formData.featuredImage) {
              setFormData(prev => ({ ...prev, featuredImage: url }));
            } else {
              handleMediaUpload(url);
            }
            setShowMediaDialog(null);
          }}
          onClose={() => setShowMediaDialog(null)}
        />
      )}
    </div>
  );
};

export default BlogEditorV2;