import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Image as ImageIcon, Video, FileText, AlertCircle, CheckCircle, Loader2, Link, Plus } from 'lucide-react';
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
  simultaneousMode?: boolean; // New prop for simultaneous upload + URL
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
  allowUrlInput = true, // Enable URL input by default
  urlInputPlaceholder = "Enter URL...",
  simultaneousMode = false // Enable simultaneous mode
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
    const bucket = getBucketName();
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, arrayBuffer, {
              contentType: file.type,
              upsert: true
            });

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

          resolve(urlData.publicUrl);
        } catch (error) {
          console.error('Upload error:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    
    // Validate files first
    const validationErrors: string[] = [];
    files.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(`File ${index + 1}: ${error}`);
      }
    });

    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('\n'));
      return;
    }

    // Check total file limit
    const totalFiles = uploadedFiles.length + files.length;
    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed. Currently have ${uploadedFiles.length}, trying to add ${files.length}`);
      return;
    }

    setUploading(true);

    // Initialize uploading files state
    const newUploadingFiles: UploadingFile[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(newUploadingFiles);

    // Upload files with individual progress tracking
    const uploadPromises = files.map(async (file, index) => {
      try {
        const url = await uploadFile(file);
        
        // Update individual file status
        setUploadingFiles(prev => prev.map((uploadingFile, i) => 
          i === index ? { ...uploadingFile, progress: 100, status: 'completed', url } : uploadingFile
        ));
        
        return url;
      } catch (error) {
        // Update individual file status to error
        setUploadingFiles(prev => prev.map((uploadingFile, i) => 
          i === index ? { ...uploadingFile, status: 'error', error: error.message } : uploadingFile
        ));
        return null;
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

  const renderUploadArea = () => (
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
  );

  const renderUrlInput = () => (
    <div className="border-2 border-dashed rounded-lg p-6">
      <div className="space-y-3">
        <div className="text-center">
          <Link className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Add files via URL</p>
          <p className="text-xs text-muted-foreground">
            Enter a direct link to your file
          </p>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={urlInputPlaceholder}
            disabled={uploadedFiles.length >= maxFiles}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrlAsFile();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addUrlAsFile}
            disabled={uploadedFiles.length >= maxFiles || !urlInput.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add URL
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Label */}
      <Label className="flex items-center gap-2">
        {getFileIcon()}
        {label}
      </Label>

      {/* Simultaneous Mode OR Tabbed Interface */}
      {simultaneousMode && allowUrlInput ? (
        // Show both upload area and URL input simultaneously
        <div className="space-y-4">
          {renderUploadArea()}
          {renderUrlInput()}
        </div>
      ) : allowUrlInput ? (
        // Show tabbed interface (original behavior)
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Add URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {renderUploadArea()}
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            {renderUrlInput()}
          </TabsContent>
        </Tabs>
      ) : (
        // Show only upload area (no URL input)
        renderUploadArea()
      )}

      {/* Uploading Files Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploading files...</h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex-shrink-0">
                {uploadingFile.status === 'uploading' && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                )}
                {uploadingFile.status === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
                {uploadingFile.status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              
              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                {uploadingFile.status === 'uploading' && (
                  <Progress value={uploadingFile.progress} className="mt-1 h-2" />
                )}
                {uploadingFile.status === 'error' && (
                  <p className="text-xs text-red-600 mt-1">{uploadingFile.error}</p>
                )}
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeUploadingFile(index)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && showPreview && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploaded files:</h4>
          <div className="grid grid-cols-1 gap-3">
            {uploadedFiles.map((fileUrl, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {uploadType === 'image' || uploadType === 'avatar' ? (
                    <img src={fileUrl} alt="" className="w-10 h-10 object-cover rounded" />
                  ) : (
                    getFileIcon()
                  )}
                </div>
                
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium truncate">{fileUrl.split('/').pop()}</p>
                  <p className="text-xs text-muted-foreground truncate">{fileUrl}</p>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Upload Progress */}
      {uploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default FileUpload;