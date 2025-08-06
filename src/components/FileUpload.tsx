import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Image as ImageIcon, Video, FileText, AlertCircle, CheckCircle, Loader2, Link } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  label?: string;
  accept?: string;
  onUploadComplete: (urls: string[]) => void;
  maxFiles?: number;
  existingFiles?: string[];
  uploadType: 'image' | 'video' | 'document' | 'avatar';
  multiple?: boolean;
  maxSizeMB?: number;
  showPreview?: boolean;
  allowUrlInput?: boolean;
  urlInputPlaceholder?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export const FileUpload = ({ 
  label = "Upload Files", 
  accept = "image/*", 
  onUploadComplete, 
  maxFiles = 1,
  existingFiles = [],
  uploadType,
  multiple = false,
  maxSizeMB = 50,
  showPreview = true,
  allowUrlInput = false,
  urlInputPlaceholder = "Enter URL..."
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(existingFiles);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  const getBucketName = () => {
    switch (uploadType) {
      case 'image':
        return 'images';
      case 'video':
        return 'videos';
      case 'document':
        return 'documents';
      case 'avatar':
        return 'avatars';
      default:
        return 'files';
    }
  };

  const getFileIcon = () => {
    switch (uploadType) {
      case 'image':
      case 'avatar':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <Upload className="w-4 h-4" />;
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check file type
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${accept}`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(getBucketName())
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(getBucketName())
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Check max files limit
    if (!multiple && fileArray.length > 1) {
      toast.error('Only one file is allowed');
      return;
    }

    if (fileArray.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    // Initialize uploading files state
    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(newUploadingFiles);

    // Upload files
    const uploadPromises = validFiles.map(async (file, index) => {
      try {
        // Simulate progress (since Supabase client doesn't provide native progress)
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map((item, i) => 
            i === index && item.status === 'uploading' 
              ? { ...item, progress: Math.min(item.progress + 10, 90) }
              : item
          ));
        }, 200);

        const url = await uploadFile(file);

        clearInterval(progressInterval);

        setUploadingFiles(prev => prev.map((item, i) => 
          i === index 
            ? { ...item, progress: 100, status: 'completed', url }
            : item
        ));

        return url;
      } catch (error) {
        setUploadingFiles(prev => prev.map((item, i) => 
          i === index 
            ? { ...item, status: 'error', error: error.message }
            : item
        ));
        throw error;
      }
    });

    try {
      const urls = await Promise.all(uploadPromises);
      const newFiles = [...uploadedFiles, ...urls.filter(Boolean)].slice(0, maxFiles);
      setUploadedFiles(newFiles);
      onUploadComplete(newFiles);
      toast.success(`${urls.length} file(s) uploaded successfully`);
      
      // Clear uploading files after a delay
      setTimeout(() => setUploadingFiles([]), 2000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFiles(files);
    }
    // Reset input
    event.target.value = '';
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files) {
      handleFiles(files);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onUploadComplete(newFiles);
  };

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const addUrlAsFile = () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!validateUrl(urlInput.trim())) {
      toast.error('Please enter a valid URL');
      return;
    }

    if (uploadedFiles.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles = [...uploadedFiles, urlInput.trim()].slice(0, maxFiles);
    setUploadedFiles(newFiles);
    onUploadComplete(newFiles);
    setUrlInput('');
    toast.success('URL added successfully');
  };

  const getAcceptTypes = () => {
    switch (uploadType) {
      case 'image':
      case 'avatar':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.md';
      default:
        return accept;
    }
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <Label className="flex items-center gap-2">
        {getFileIcon()}
        {label}
      </Label>

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 relative
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground">
            {uploadType === 'image' || uploadType === 'avatar' ? 'Images' : uploadType === 'video' ? 'Videos' : 'Files'} 
            {` up to ${maxSizeMB}MB`}
            {multiple && `, maximum ${maxFiles} files`}
          </p>
        </div>
        <input
          type="file"
          accept={getAcceptTypes()}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={uploading || uploadedFiles.length >= maxFiles}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          className="mt-2 hover:shadow-soft transition-all duration-300"
          disabled={uploading || uploadedFiles.length >= maxFiles}
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose Files
        </Button>
        
        {maxFiles > 1 && (
          <p className="text-xs text-muted-foreground mt-1">
            {uploadedFiles.length} / {maxFiles} files uploaded
          </p>
        )}
      </div>

      {/* Uploading Files Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploading Files</h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3 flex-1">
                {uploadingFile.status === 'uploading' && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                {uploadingFile.status === 'completed' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {uploadingFile.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">
                    {uploadingFile.file.name}
                  </p>
                  {uploadingFile.status === 'uploading' && (
                    <div className="mt-1">
                      <Progress value={uploadingFile.progress} className="h-1" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {uploadingFile.progress}%
                      </p>
                    </div>
                  )}
                  {uploadingFile.status === 'error' && (
                    <p className="text-xs text-red-500 mt-1">
                      {uploadingFile.error}
                    </p>
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeUploadingFile(index)}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && showPreview && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Uploaded Files:</Label>
          {uploadedFiles.map((fileUrl, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                {(uploadType === 'image' || uploadType === 'avatar') && (
                  <img 
                    src={fileUrl} 
                    alt={`Upload ${index + 1}`} 
                    className="w-10 h-10 object-cover rounded"
                  />
                )}
                {uploadType === 'video' && (
                  <Video className="w-10 h-10 text-muted-foreground" />
                )}
                {uploadType === 'document' && (
                  <FileText className="w-10 h-10 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    File {index + 1}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uploadType === 'image' || uploadType === 'avatar' ? 'Image' : 
                     uploadType === 'video' ? 'Video' : 'Document'}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;