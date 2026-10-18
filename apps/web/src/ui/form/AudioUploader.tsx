import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { Icon } from '../basic/Icon';
import { cn } from '../../utils/cn';
import { useAuth } from '../../features/auth/AuthStore';

interface AudioUploaderProps {
  label?: string;
  description?: string;
  currentAudioPath?: string;
  onUpload: (path: string, durationMs?: number) => void;
  className?: string;
}

export function AudioUploader({ 
  label, 
  description, 
  currentAudioPath, 
  onUpload,
  className 
}: AudioUploaderProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const resolveAudioUrl = (path: string | undefined | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    if (path.startsWith('artist-contributions/') || path.startsWith('submissions/')) {
      return supabase.storage.from('story-media').getPublicUrl(path).data.publicUrl;
    }
    return supabase.storage.from('audio').getPublicUrl(path).data.publicUrl;
  };

  const [previewUrl, setPreviewUrl] = useState<string | null>(resolveAudioUrl(currentAudioPath));
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentAudioPath) {
      setPreviewUrl(resolveAudioUrl(currentAudioPath));
    }
  }, [currentAudioPath]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|webm|aac)$/i.test(file.name)) {
      alert('Format file tidak didukung. Harap unggah file audio (MP3, WAV, OGG, M4A).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 25MB.');
      return;
    }

    setFileName(file.name);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp3';
      const storageFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `artist-contributions/${user.id}/${storageFileName}`;

      const { error } = await supabase.storage
        .from('story-media')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type || 'audio/mpeg'
        });

      if (error) throw error;

      // Extract duration if possible
      let durationMs = 0;
      try {
        const tempAudio = new Audio(localUrl);
        await new Promise((resolve) => {
          tempAudio.onloadedmetadata = () => {
            durationMs = Math.round(tempAudio.duration * 1000);
            resolve(true);
          };
          tempAudio.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 2000);
        });
      } catch {
        // Fallback duration
      }

      onUpload(filePath, durationMs);
    } catch (err: any) {
      console.error('Gagal mengunggah audio:', err);
      alert('Gagal mengunggah audio: ' + (err.message || 'Kesalahan jaringan'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2 font-nunito", className)}>
      {label && <label className="font-bold text-stone-800 text-sm">{label}</label>}
      {description && <p className="text-stone-500 text-xs -mt-1">{description}</p>}

      <div className="flex flex-col gap-2 mt-1">
        {previewUrl ? (
          <div className="p-3 bg-teal/5 border border-teal/20 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-teal font-bold">
              <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                <Icon name="Music" size={14} />
                {fileName || 'Audio Terunggah'}
              </span>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="text-teal hover:text-teal-dark underline font-semibold transition"
              >
                {uploading ? 'Mengunggah...' : 'Ganti File'}
              </button>
            </div>
            <audio 
              src={previewUrl} 
              controls 
              className="w-full h-8" 
              preload="metadata"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full py-4 px-4 border-2 border-dashed border-stone-200 hover:border-teal/50 hover:bg-teal/5 rounded-xl flex flex-col items-center justify-center gap-1.5 text-stone-500 hover:text-teal transition group"
          >
            <div className="w-8 h-8 rounded-full bg-stone-100 group-hover:bg-teal/10 flex items-center justify-center text-stone-400 group-hover:text-teal transition">
              <Icon name="Upload" size={16} />
            </div>
            <span className="text-xs font-bold font-nunito">
              {uploading ? 'Sedang Mengunggah...' : 'Pilih File Suara (MP3, WAV, M4A)'}
            </span>
            <span className="text-[11px] text-stone-400">Maks. 25MB</span>
          </button>
        )}

        <input 
          type="file" 
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm" 
          ref={inputRef} 
          className="hidden" 
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
