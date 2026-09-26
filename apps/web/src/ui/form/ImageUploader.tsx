import { useState, useRef, type ChangeEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { Icon } from '../../ui/basic/Icon';
import { cn } from '../../utils/cn';
import { useAuth } from '../../features/auth/AuthStore';

interface ImageUploaderProps {
  label: string;
  description?: string;
  currentImagePath?: string;
  onUpload: (path: string) => void;
  variant?: 'rectangle' | 'circle';
}

export function ImageUploader({ label, description, currentImagePath, onUpload, variant = 'rectangle' }: ImageUploaderProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    currentImagePath ? supabase.storage.from('story-media').getPublicUrl(currentImagePath).data.publicUrl : null
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `submissions/${user.id}/${fileName}`;
      
      const { error } = await supabase.storage
        .from('story-media')
        .upload(filePath, file, { upsert: true });
        
      if (error) throw error;
      onUpload(filePath);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  };

  const isCircle = variant === 'circle';

  return (
    <div className="flex flex-col gap-2">
      <label className="font-bold text-stone-800 text-sm font-nunito">{label}</label>
      {description && <p className="text-stone-500 text-xs font-nunito -mt-1">{description}</p>}
      
      <div className="flex items-start gap-4 mt-2">
        <div className={cn(
          "shrink-0 bg-stone-100 border border-stone-200 flex flex-col items-center justify-center overflow-hidden relative group",
          isCircle ? "w-24 h-24 rounded-full" : "w-32 h-32 rounded-xl"
        )}>
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Icon name="ImagePlus" size={24} className="text-stone-400" />
          )}
          
          <div className={cn(
            "absolute inset-0 bg-black/40 items-center justify-center cursor-pointer transition-opacity",
            preview ? "opacity-0 group-hover:opacity-100 flex" : "flex"
          )} onClick={() => inputRef.current?.click()}>
            <span className="text-white text-xs font-bold font-nunito">{uploading ? 'Mengunggah...' : preview ? 'Ganti' : 'Unggah'}</span>
          </div>
        </div>
        
        <div className="flex-1">
          <input 
            type="file" 
            accept="image/*"
            ref={inputRef} 
            className="hidden" 
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      </div>
    </div>
  );
}
