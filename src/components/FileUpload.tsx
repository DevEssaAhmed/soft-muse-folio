import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, Video, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
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
  showPreview = true
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(existingFiles);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

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
      <div>
        <Label htmlFor={`file-upload-${uploadType}`} className="flex items-center gap-2">
          {getFileIcon()}
          {label}
        </Label>
        
        <div className="mt-2">
          <Input
            id={`file-upload-${uploadType}`}
            type="file"
            accept={getAcceptTypes()}
            onChange={handleFileUpload}
            disabled={uploading || uploadedFiles.length >= maxFiles}
            multiple={maxFiles > 1}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          
          {maxFiles > 1 && (
            <p className="text-sm text-muted-foreground mt-1">
              {uploadedFiles.length} / {maxFiles} files uploaded
            </p>
          )}
        </div>

        {uploading && (
          <div className="mt-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-1">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}
      </div>

      {/* Preview uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Uploaded Files:</Label>
          {uploadedFiles.map((fileUrl, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                {getFileIcon()}
                <div className="flex-1 min-w-0">
                  {uploadType === 'image' && (
                    <img 
                      src={fileUrl} 
                      alt={`Upload ${index + 1}`} 
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <p className="text-sm text-muted-foreground truncate">
                    File {index + 1} {uploadType === 'image' ? '(Image)' : ''}
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