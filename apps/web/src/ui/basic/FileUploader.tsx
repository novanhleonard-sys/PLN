import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from './Button';
import { Icon } from './Icon';

interface FileUploaderProps {
  bucket: string;
  folder?: string;
  accept: string;
  maxSizeMB?: number;
  onUploadSuccess: (path: string) => void;
  onUploadError?: (error: string) => void;
  label?: string;
  isAudio?: boolean;
}

export function FileUploader({
  bucket,
  folder = '',
  accept,
  maxSizeMB = 5,
  onUploadSuccess,
  onUploadError,
  label = "Upload File",
  isAudio = false
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      if (onUploadError) onUploadError(`Ukuran file maksimal ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;
      
      onUploadSuccess(data.path);
    } catch (err: any) {
      if (onUploadError) onUploadError(err.message || 'Gagal mengunggah file');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <Button 
        type="button" 
        variant="secondary" 
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2"
      >
        <Icon name={isAudio ? "AudioLines" : "ImagePlus"} size={16} />
        {uploading ? 'Mengunggah...' : label}
      </Button>
    </div>
  );
}
