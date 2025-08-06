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
  label, 
  accept = "image/*", 
  onUploadComplete, 
  maxFiles = 1,
  existingFiles = [],
  uploadType 
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(existingFiles);

  const getBucketName = () => {
    switch (uploadType) {
      case 'image':
        return 'images';
      case 'video':
        return 'videos';
      case 'document':
        return 'documents';
      default:
        return 'files';
    }
  };

  const getFileIcon = () => {
    switch (uploadType) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <Upload className="w-4 h-4" />;
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Convert file to base64 for storage (as per user requirement to use base64)
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // For now, we'll return the base64 string directly since they prefer base64 format
      return base64;

    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const filesToUpload = Array.from(files).slice(0, maxFiles);
      const uploadPromises: Promise<string | null>[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        // Validate file type
        if (uploadType === 'image' && !file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not a valid image`);
          continue;
        }
        if (uploadType === 'video' && !file.type.startsWith('video/')) {
          toast.error(`File ${file.name} is not a valid video`);
          continue;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        uploadPromises.push(uploadFile(file));
        
        // Update progress
        const progress = ((i + 1) / filesToUpload.length) * 100;
        setUploadProgress(progress);
      }

      const uploadResults = await Promise.all(uploadPromises);
      const successfulUploads = uploadResults.filter((url): url is string => url !== null);

      if (successfulUploads.length > 0) {
        const newFiles = [...uploadedFiles, ...successfulUploads].slice(0, maxFiles);
        setUploadedFiles(newFiles);
        onUploadComplete(newFiles);
        toast.success(`${successfulUploads.length} file(s) uploaded successfully!`);
      }

    } catch (error) {
      console.error('Error in file upload:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset input
      event.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onUploadComplete(newFiles);
  };

  const getAcceptTypes = () => {
    switch (uploadType) {
      case 'image':
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