import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../ui/basic/Button';
import { Input } from '../../ui/basic/Input';
import { Icon } from '../../ui/basic/Icon';
import { SimilarStoriesCheck } from './SimilarStoriesCheck';
import { MapLocationPicker } from '../map/MapLocationPicker';

import { ImageUploader } from '../../ui/form/ImageUploader';
import { cn } from '../../utils/cn';

const STEPS = ['Info', 'Teks', 'Sumber', 'Hak', 'Tinjau'];

export interface ContributeFormData {
  target_story_id?: string;
  title: string;
  type: string;
  region_id: string;
  version_label: string;
  body: string;
  sources: any[];
  rights_declared: boolean;
  lat: number | null;
  lng: number | null;
  synopsis: string;
  hero_image_path: string | null;
  pin_image_path: string | null;
  asset_credits: string;
  force_new_reason: string | null;
}

export interface ContributeFormProps {
  initialData?: Partial<ContributeFormData>;
  onSubmitOverride?: (data: ContributeFormData) => Promise<void>;
  isEditMode?: boolean;
  onCancel?: () => void;
}

export const ContributeForm = ({ initialData, onSubmitOverride, isEditMode, onCancel }: ContributeFormProps = {}) => {
    const navigate = useNavigate();
  const location = useLocation();
  const initData = location.state?.initialData || initialData;
  
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<any[]>([]);
  const [detectedRegion, setDetectedRegion] = useState<string>('');

  useEffect(() => {
    supabase.from('regions').select('id, name, level').then(({data}) => {
      if (data) setRegions(data);
    });
  }, []);
  
  // Form State
  const [formData, setFormData] = useState<ContributeFormData>({
    target_story_id: initData?.target_story_id || undefined,
    title: initData?.title || '',
    type: initData?.type || 'legenda',
    region_id: initData?.region_id || '',
    version_label: initData?.version_label || '',
    body: initData?.body || '',
    sources: initData?.sources || [{ type: 'buku', citation: '', author: '' }],
    rights_declared: initData?.rights_declared || false,
    lat: initData?.lat || null,
    lng: initData?.lng || null,
    synopsis: initData?.synopsis || '',
    hero_image_path: initData?.hero_image_path || null,
    pin_image_path: initData?.pin_image_path || null,
    asset_credits: initData?.asset_credits || '',
    force_new_reason: initData?.force_new_reason || null
  });

  const handleChange = (field: keyof ContributeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const handlePrev = () => setStep(s => Math.max(0, s - 1));

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      if (onSubmitOverride) {
        await onSubmitOverride(formData);
      } else {
        const { data, error } = await supabase.functions.invoke('submit_contribution', {
          body: formData
        });

        if (error) {
          console.error(error);
          let msg = error.message || 'Gagal mengirim';
          if (error.context) {
            try {
              const txt = await error.context.text();
              const parsed = JSON.parse(txt);
              msg = parsed.error || parsed.message || txt;
            } catch (e) {
              msg = error.message;
            }
          }
          throw new Error(msg);
        }
        if (data?.error) throw new Error(data.error);
        
        // Success
        navigate(`/profil/kontribusi/${data.submission_id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = (s: number) => {
    switch (s) {
      case 0:
        return formData.title.length >= 3 && formData.version_label.length >= 2;
      case 1:
        const words = formData.body.trim().split(/\s+/).length;
        return words >= 150 && words <= 3000;
      case 2:
        return formData.sources.some(src => src.citation.length > 5);
      case 3:
        return formData.rights_declared;
      default: return true;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 font-nunito">
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl font-fredoka font-bold text-stone-800">
            {isEditMode ? 'Edit Kontribusi' : 'Kontribusi Cerita Baru'}
          </h1>
          <p className="text-stone-500">Langkah {step + 1} dari {STEPS.length}: {STEPS[step]}</p>
          
          <div className="flex gap-2 mt-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1 h-2 rounded-full overflow-hidden bg-stone-100">
                <div className={cn("h-full transition-all duration-300", i <= step ? "bg-teal" : "")} />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="min-h-[400px]">
          {/* STEP 0: Info */}
          {step === 0 && (
            <div className="space-y-6">
              <Input
                label="Judul Cerita"
                placeholder="Misal: Si Pitung"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                autoFocus
              />
              
              {!isEditMode && formData.title.length >= 4 && (
                <SimilarStoriesCheck 
                  title={formData.title} 
                  onSelectAction={(action, targetId, reason) => {
                    if (action === 'add_version' && targetId) {
                      handleChange('target_story_id', targetId);
                      handleChange('force_new_reason', null);
                    } else if (action === 'new') {
                      handleChange('target_story_id', null);
                      handleChange('force_new_reason', reason || null);
                    }
                  }} 
                />
              )}

              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-stone-700">Jenis Cerita</label>
                  <select 
                    value={formData.type} 
                    onChange={e => handleChange('type', e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal"
                  >
                    <option value="dongeng">Dongeng</option>
                    <option value="legenda">Legenda</option>
                    <option value="mite">Mite</option>
                    <option value="fabel">Fabel</option>
                  </select>
                </div>
                
              </div>

              <Input
                label="Label Versi"
                placeholder="Misal: Versi Betawi, Versi Lisan Kakek, dll"
                value={formData.version_label}
                onChange={(e) => handleChange('version_label', e.target.value)}
              />
              
              <div className="pt-4 border-t border-stone-100 space-y-6">
                <h3 className="font-bold text-stone-800">Media & Lokasi</h3>
                <ImageUploader 
                  label="Foto Hero (Opsional)" 
                  description="Gambar utama untuk cerita ini."
                  currentImagePath={formData.hero_image_path || undefined}
                  onUpload={(path) => handleChange('hero_image_path', path)}
                />
                
                <ImageUploader 
                  label="Foto Pin Peta (Opsional)" 
                  description="Akan dipotong lingkaran untuk ditampilkan di peta."
                  variant="circle"
                  currentImagePath={formData.pin_image_path || undefined}
                  onUpload={(path) => handleChange('pin_image_path', path)}
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-stone-700">Lokasi Cerita (Opsional)</label>
                  {detectedRegion && (
                    <div className="mb-2 text-sm text-teal font-bold flex items-center gap-2 bg-teal/10 px-3 py-2 rounded-lg w-fit">
                      <Icon name="MapPin" size={16} /> Daerah terdeteksi: {detectedRegion}
                    </div>
                  )}
                  <MapLocationPicker 
                    lat={formData.lat}
                    lng={formData.lng}
                    onChange={(lat, lng, placeName) => {
                      handleChange('lat', lat);
                      handleChange('lng', lng);
                      if (placeName) {
                        setDetectedRegion(placeName);
                        if (regions.length > 0) {
                          const p = placeName.toLowerCase();
                          // Cari kabupaten/kota lebih dulu agar lebih spesifik
                          const specific = regions.find(r => (r.level === 'kota' || r.level === 'kabupaten') && p.includes(r.name.toLowerCase()));
                          if (specific) {
                            handleChange('region_id', specific.id);
                          } else {
                            // Fallback ke provinsi
                            const prov = regions.find(r => r.level === 'provinsi' && p.includes(r.name.toLowerCase()));
                            if (prov) handleChange('region_id', prov.id);
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Teks */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-stone-800">Sinopsis Singkat (Opsional)</label>
                <p className="text-sm text-stone-500 mb-1">Muncul di kartu cerita peta sebelum membaca versi lengkap.</p>
                <textarea
                  value={formData.synopsis}
                  onChange={e => handleChange('synopsis', e.target.value)}
                  className="w-full h-24 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal resize-none"
                  placeholder="Ringkasan cerita..."
                  maxLength={500}
                />
                <div className="text-xs text-stone-400 text-right">{formData.synopsis.length}/500</div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <label className="font-bold text-stone-800">Teks Cerita (150 - 3000 kata)</label>
                  <span className={cn(
                    "text-sm", 
                    formData.body.split(/\s+/).length < 150 ? "text-red-500" : "text-green-600"
                  )}>
                    {formData.body.split(/\s+/).filter(Boolean).length} kata
                  </span>
                </div>
                <textarea
                  value={formData.body}
                  onChange={e => handleChange('body', e.target.value)}
                  className="w-full h-96 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal resize-none font-medium leading-relaxed"
                  placeholder="Kisah bermula pada zaman dahulu..."
                />
              </div>
            </div>
          )}

          {/* STEP 2: Sumber */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="p-4 bg-teal/5 text-teal-800 rounded-xl text-sm border border-teal/10">
                Cantumkan sumber agar admin dapat memverifikasi keaslian cerita Anda.
              </div>
              
              <div className="space-y-4">
                {formData.sources.map((src, i) => (
                  <div key={i} className="p-4 border border-stone-200 rounded-xl space-y-4 bg-stone-50/50 relative">
                    {formData.sources.length > 1 && (
                      <button 
                        onClick={() => {
                          const s = [...formData.sources];
                          s.splice(i, 1);
                          handleChange('sources', s);
                        }}
                        className="absolute top-4 right-4 text-stone-400 hover:text-red-500"
                      >
                        <Icon name="Trash" size={16} />
                      </button>
                    )}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">Jenis Sumber</label>
                        <select 
                          value={src.type}
                          onChange={(e) => {
                            const s = [...formData.sources];
                            s[i].type = e.target.value;
                            handleChange('sources', s);
                          }}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm"
                        >
                          <option value="buku">Buku / Literatur</option>
                          <option value="arsip">Arsip / Dokumen</option>
                          <option value="web">Artikel Web</option>
                          <option value="lisan">Sastra Lisan (Kakek/Nenek, dll)</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">Penulis/Narasumber</label>
                        <input
                          type="text"
                          value={src.author || ''}
                          onChange={(e) => {
                            const s = [...formData.sources];
                            s[i].author = e.target.value;
                            handleChange('sources', s);
                          }}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm"
                          placeholder="Misal: NN"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">Sitasi / Detail</label>
                      <input
                        type="text"
                        value={src.citation}
                        onChange={(e) => {
                          const s = [...formData.sources];
                          s[i].citation = e.target.value;
                          handleChange('sources', s);
                        }}
                        className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm"
                        placeholder="Judul buku, URL, atau rekaman wawancara..."
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="secondary" 
                onClick={() => handleChange('sources', [...formData.sources, { type: 'web', citation: '', author: '' }])}
                className="w-full border-dashed"
              >
                + Tambah Sumber Lain
              </Button>

              <div className="flex flex-col gap-1 pt-4 border-t border-stone-100">
                <label className="font-bold text-stone-800">Kredit Aset Visual (Opsional)</label>
                <p className="text-sm text-stone-500 mb-1">Jika Anda mengunggah gambar, berikan kredit lisensi atau nama fotografer.</p>
                <textarea
                  value={formData.asset_credits}
                  onChange={e => handleChange('asset_credits', e.target.value)}
                  className="w-full h-20 p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-teal resize-none text-sm"
                  placeholder="Misal: Foto Hero oleh Jane Doe via Unsplash"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Hak */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl">
                <h3 className="font-bold text-lg mb-4 font-fredoka text-stone-800">Pernyataan Hak & Orisinalitas</h3>
                <ul className="list-disc pl-5 space-y-3 text-stone-600 text-sm">
                  <li>Saya menyatakan bahwa cerita ini adalah adaptasi cerita rakyat/folklor yang beredar di masyarakat, bukan karya fiksi karangan pribadi yang baru.</li>
                  <li>Teks yang saya tulis adalah hasil ketikan/saduran saya sendiri dan tidak melanggar hak cipta penerbit buku mana pun.</li>
                  <li>Jika saya menggunakan referensi lisan, saya telah mendapat izin untuk mempublikasikannya.</li>
                  <li>Saya memberikan Peta Legenda Nusantara hak untuk mempublikasikan, mengedit, dan memformat ulang cerita ini demi kualitas aplikasi.</li>
                </ul>
              </div>
              
              <label className="flex items-start gap-4 p-4 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.rights_declared}
                  onChange={e => handleChange('rights_declared', e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-stone-300 text-teal focus:ring-teal"
                />
                <div>
                  <div className="font-bold text-stone-800">Saya setuju dengan pernyataan di atas</div>
                  <div className="text-sm text-stone-500">Centang untuk melanjutkan</div>
                </div>
              </label>
            </div>
          )}

          {/* STEP 4: Tinjau */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Icon name="Check" size={48} className="mx-auto text-teal mb-4" />
                <h3 className="font-bold font-fredoka text-2xl text-stone-800">Siap Dikirim</h3>
                <p className="text-stone-500 mt-2">Cerita Anda akan masuk antrean moderasi. Admin akan memeriksa kesesuaian cerita dengan kebijakan kami sebelum mempublikasikannya di peta utama.</p>
              </div>

              {formData.target_story_id && (
                <div className="p-4 bg-teal/5 border border-teal/10 rounded-xl flex items-start gap-3">
                  <Icon name="Link2" className="text-teal" size={20} />
                  <div>
                    <span className="font-bold text-stone-800 text-sm block">Akan ditambahkan sebagai Versi Lain</span>
                    <span className="text-sm text-stone-600">Kontribusi ini akan menyatu dengan cerita utama di peta.</span>
                  </div>
                </div>
              )}

              {formData.force_new_reason && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                  <Icon name="Info" className="text-orange-500 mt-0.5" size={20} />
                  <div>
                    <span className="font-bold text-stone-800 text-sm block">Diusulkan Sebagai Kisah Terpisah</span>
                    <span className="text-sm text-stone-600 block mb-1">Alasan: {formData.force_new_reason}</span>
                  </div>
                </div>
              )}

              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 space-y-4 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-stone-500 font-bold">Judul</span>
                  <span className="col-span-2 font-bold text-stone-800">{formData.title}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-stone-500 font-bold">Jenis</span>
                  <span className="col-span-2 capitalize">{formData.type}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-stone-500 font-bold">Panjang</span>
                  <span className="col-span-2">{formData.body.split(/\s+/).length} kata</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-stone-500 font-bold">Lokasi</span>
                  <span className="col-span-2">{formData.lat ? `${formData.lat.toFixed(4)}, ${formData.lng?.toFixed(4)}` : 'Tidak disetel'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100">
          <Button variant="secondary" onClick={step === 0 ? (onCancel || (() => navigate(-1))) : handlePrev} disabled={isSubmitting}>
            {step === 0 ? 'Batal' : 'Kembali'}
          </Button>

          {step < STEPS.length - 1 ? (
            <Button variant="primary" onClick={handleNext} disabled={!validateStep(step)}>Lanjut</Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>Kirim Kontribusi</Button>
          )}
        </div>
      </div>
    </div>
  );
}
