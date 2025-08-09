import React, { useState, useCallback, useEffect } from 'react';
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
  enableImageEditing?: boolean; // New: enable crop/compress for images
  imageMaxWidth?: number; // New: max width for downscale
  imageQuality?: number; // New: quality 0-1
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
  simultaneousMode = false, // Enable simultaneous mode
  enableImageEditing = false,
  imageMaxWidth = 1600,
  imageQuality = 0.8,
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(existingFiles);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [rawImageFile, setRawImageFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    setUploadedFiles(existingFiles);
  }, [existingFiles.join('|')]);

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
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
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
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = safeName.includes('.') ? safeName.split('.').pop() : 'bin';
    const fileName = `${timestamp}-${safeName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type || `application/octet-stream`,
        upsert: true,
      });

    if (error) throw error;
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleFilesUpload = async (files: FileList | File[]) => {
    const filesArr = Array.from(files);

    // Validate
    const validationErrors: string[] = [];
    filesArr.forEach((file, index) => {
      const error = validateFile(file);
      if (error) validationErrors.push(`File ${index + 1}: ${error}`);
    });
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('\n'));
      return;
    }

    // Check total file limit
    const totalFiles = uploadedFiles.length + filesArr.length;
    if (totalFiles > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed. Currently have ${uploadedFiles.length}, trying to add ${filesArr.length}`);
      return;
    }

    setUploading(true);
    setUploadingFiles(filesArr.map(f => ({ file: f, progress: 0, status: 'uploading' })));

    try {
      const urls: (string | null)[] = [];
      for (let i = 0; i < filesArr.length; i++) {
        try {
          const url = await uploadFile(filesArr[i]);
          urls.push(url);
          setUploadingFiles(prev => prev.map((u, idx) => idx === i ? { ...u, status: 'completed', progress: 100, url } : u));
        } catch (err: any) {
          setUploadingFiles(prev => prev.map((u, idx) => idx === i ? { ...u, status: 'error', error: err.message } : u));
          urls.push(null);
        }
      }
      const newFiles = [...uploadedFiles, ...urls.filter(Boolean) as string[]].slice(0, maxFiles);
      setUploadedFiles(newFiles);
      onUploadComplete(newFiles);
      toast.success(`${urls.filter(Boolean).length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadingFiles([]), 1500);
    }
  };

  const onFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (uploadType === 'image' && enableImageEditing) {
      if (files.length === 1) {
        const file = files[0];
        const objectUrl = URL.createObjectURL(file);
        setRawImageFile(file);
        setCropSource(objectUrl);
        setShowCropper(true);
      } else {
        // Multiple files: just compress to max width maintaining aspect via canvas
        const processed = await Promise.all(Array.from(files).map(async (f) => await compressImageFile(f, imageMaxWidth, imageQuality)));
        await handleFilesUpload(processed as File[]);
      }
    } else {
      await handleFilesUpload(files);
    }

    // Reset input
    event.target.value = '';
  };

  const onDropHandler = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;
    if (uploadType === 'image' && enableImageEditing) {
      if (files.length === 1) {
        const file = files[0];
        const objectUrl = URL.createObjectURL(file);
        setRawImageFile(file);
        setCropSource(objectUrl);
        setShowCropper(true);
      } else {
        const processed = await Promise.all(Array.from(files).map(async (f) => await compressImageFile(f, imageMaxWidth, imageQuality)));
        await handleFilesUpload(processed as File[]);
      }
    } else {
      await handleFilesUpload(files);
    }
  }, [enableImageEditing, imageMaxWidth, imageQuality, uploadType, uploadedFiles.length, maxFiles]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = async (index: number) => {
    const fileUrl = uploadedFiles[index];
    // Try removing from Supabase storage if this is a Supabase public URL
    try {
      const pubMarker = '/storage/v1/object/public/';
      if (fileUrl && fileUrl.includes(pubMarker)) {
        const after = fileUrl.split(pubMarker)[1]; // e.g. images/123-name.webp
        const bucketName = after.split('/')[0];
        const objectPath = after.substring(bucketName.length + 1);
        // Only attempt delete if bucket matches expected for this uploadType
        const expectedBucket = getBucketName();
        if (bucketName === expectedBucket) {
          await supabase.storage.from(bucketName).remove([objectPath]);
        }
      }
    } catch (e) {
      console.warn('Failed to delete from storage (ignoring):', e);
    }
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

  // Image processing helpers
  const loadImageToCanvas = (image: HTMLImageElement, maxWidth: number) => {
    const ratio = image.width > maxWidth ? maxWidth / image.width : 1;
    const width = Math.round(image.width * ratio);
    const height = Math.round(image.height * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
  };

  const fileFromBlob = (blob: Blob, originalName: string, type: string) => {
    const base = originalName.replace(/\.[^.]+$/, '');
    const ext = type.includes('webp') ? 'webp' : (type.split('/')[1] || 'jpg');
    return new File([blob], `${base}.${ext}`, { type });
  };

  const compressImageFile = async (file: File, maxWidth: number, quality: number): Promise<File> => {
    const img = document.createElement('img');
    const objectUrl = URL.createObjectURL(file);
    await new Promise((res, rej) => { img.onload = res as any; img.onerror = rej as any; img.src = objectUrl; });
    const canvas = loadImageToCanvas(img, maxWidth);
    return await new Promise<File>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Compression failed'));
        const out = fileFromBlob(blob, file.name, 'image/webp');
        resolve(out);
      }, 'image/webp', quality);
    });
  };

  const getCroppedImg = async (file: File, cropPixels: { x: number; y: number; width: number; height: number }, quality: number, maxWidth: number): Promise<File> => {
    const image = document.createElement('img');
    const objectUrl = URL.createObjectURL(file);
    await new Promise((res, rej) => { image.onload = res as any; image.onerror = rej as any; image.src = objectUrl; });

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // crop at original resolution
    const cropW = cropPixels.width * scaleX;
    const cropH = cropPixels.height * scaleY;

    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    ctx.drawImage(
      image,
      cropPixels.x * scaleX,
      cropPixels.y * scaleY,
      cropW,
      cropH,
      0,
      0,
      cropW,
      cropH
    );

    // Downscale if wider than maxWidth
    let outCanvas = canvas;
    if (cropW > maxWidth) {
      const ratio = maxWidth / cropW;
      const w = Math.round(cropW * ratio);
      const h = Math.round(cropH * ratio);
      const dCanvas = document.createElement('canvas');
      dCanvas.width = w; dCanvas.height = h;
      const dctx = dCanvas.getContext('2d');
      if (!dctx) throw new Error('Canvas 2D context not available');
      dctx.drawImage(canvas, 0, 0, w, h);
      outCanvas = dCanvas;
    }

    return await new Promise<File>((resolve, reject) => {
      outCanvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Crop failed'));
        const out = fileFromBlob(blob, file.name, 'image/webp');
        resolve(out);
      }, 'image/webp', quality);
    });
  };

  const renderUploadArea = () => (
    <div
      className={`
        border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 relative
        ${isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        ${uploading ? 'pointer-events-none opacity-50' : ''}
      `}
      onDrop={onDropHandler}
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
        onChange={onFileInputChange}
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
      {enableImageEditing && uploadType === 'image' && <p className="text-[11px] text-muted-foreground mt-2">Client-side crop &amp; compression enabled</p>}
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

      {/* Cropper Modal */}
      {showCropper && cropSource && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b"><h4 className="font-semibold">Crop image</h4></div>
            <div className="relative w-full h-[60vh] bg-black">
              <Cropper
                image={cropSource}
                crop={crop}
                zoom={zoom}
                aspect={16/9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              />
            </div>
            <div className="p-4 flex items-center justify-end gap-2 border-t">
              <Button variant="outline" onClick={() => { setShowCropper(false); setCropSource(null); setRawImageFile(null); }}>Cancel</Button>
              <Button onClick={async () => {
                if (!rawImageFile || !croppedAreaPixels) return;
                try {
                  const processed = await getCroppedImg(rawImageFile, croppedAreaPixels, imageQuality, imageMaxWidth);
                  await handleFilesUpload([processed]);
                } catch (e: any) {
                  toast.error(e.message || 'Failed to process image');
                } finally {
                  setShowCropper(false);
                  if (cropSource) URL.revokeObjectURL(cropSource);
                  setCropSource(null);
                  setRawImageFile(null);
                }
              }}>Apply & Upload</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;