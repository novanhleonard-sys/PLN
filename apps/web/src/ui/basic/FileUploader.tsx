import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from './Button';
import { Icon } from './Icon';

interface FileUploaderProps {
  bucket: string;
  folder?: string;
  accept: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onUploadSuccess: (paths: string[]) => void;
  onUploadError?: (error: string) => void;
  label?: string;
  isAudio?: boolean;
}

export function FileUploader({
  bucket,
  folder = '',
  accept,
  multiple = false,
  maxSizeMB = 5,
  onUploadSuccess,
  onUploadError,
  label = "Upload File",
  isAudio = false
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        if (onUploadError) onUploadError(`Ukuran file ${file.name} melebihi batas ${maxSizeMB}MB`);
        return;
      }
    }

    setUploading(true);
    const uploadedPaths: string[] = [];

    try {
      for (const file of files) {
        const ext = file.name.split('.').pop();
        const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (error) throw error;
        uploadedPaths.push(data.path);
      }
      onUploadSuccess(uploadedPaths);
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
        multiple={multiple}
        className="hidden"
      />
      <Button 
        type="button" 
        variant="secondary" 
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 !py-2"
      >
        <Icon name={isAudio ? "AudioLines" : "ImagePlus"} size={16} />
        {uploading ? 'Mengunggah...' : label}
      </Button>
    </div>
  );
}
