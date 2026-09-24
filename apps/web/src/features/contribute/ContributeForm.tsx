import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { Button } from '../../ui/basic/Button';

const STEPS = ['Info', 'Teks', 'Sumber', 'Hak', 'Tinjau'];

export const ContributeForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'legenda',
    region_id: '',
    version_label: '',
    body: '',
    sources: [{ type: 'buku', citation: '', author: '' }],
    rights_declared: false
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const handlePrev = () => setStep(s => Math.max(0, s - 1));

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('submit_contribution', {
        body: {
          title: formData.title,
          type: formData.type,
          region_id: formData.region_id || null,
          version_label: formData.version_label,
          body: formData.body,
          sources: formData.sources,
          rights_declared: formData.rights_declared
        }
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      // Success
      navigate('/profil/kontribusi');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream font-nunito flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-border-light overflow-hidden flex flex-col">
        {/* Stepper Header */}
        <div className="bg-stone-50 border-b border-border-light p-4 flex justify-between items-center overflow-x-auto">
          {STEPS.map((s, idx) => (
            <div key={s} className={`flex items-center gap-2 font-bold text-sm ${step >= idx ? 'text-teal' : 'text-stone-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= idx ? 'bg-teal text-white' : 'bg-stone-200'}`}>
                {idx + 1}
              </div>
              <span className="hidden sm:inline">{s}</span>
              {idx < STEPS.length - 1 && <span className="text-stone-300 mx-2">&gt;</span>}
            </div>
          ))}
        </div>

        <div className="p-6 md:p-8 flex-1">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>}
          
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-fredoka font-bold text-text-main">Informasi Dasar</h2>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Judul Cerita</label>
                <input type="text" value={formData.title} onChange={e => updateForm('title', e.target.value)} className="w-full p-3 border border-border-light rounded-xl" placeholder="Contoh: Sangkuriang" />
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Jenis Cerita</label>
                <select value={formData.type} onChange={e => updateForm('type', e.target.value)} className="w-full p-3 border border-border-light rounded-xl">
                  <option value="legenda">Legenda (asal-usul tempat)</option>
                  <option value="mite">Mite (dewa dan makhluk gaib)</option>
                  <option value="fabel">Fabel (tokoh hewan)</option>
                  <option value="dongeng">Dongeng (cerita rakyat umum)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-muted mb-2">Label Versi</label>
                <input type="text" value={formData.version_label} onChange={e => updateForm('version_label', e.target.value)} className="w-full p-3 border border-border-light rounded-xl" placeholder="Contoh: Versi Kasunanan" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 h-full flex flex-col">
              <h2 className="text-2xl font-fredoka font-bold text-text-main">Teks Cerita</h2>
              <p className="text-text-light text-sm">Tulis isi cerita Anda di sini. Minimal 150 kata, maksimal 3000 kata.</p>
              <textarea 
                value={formData.body} 
                onChange={e => updateForm('body', e.target.value)} 
                className="w-full flex-1 min-h-[300px] p-4 border border-border-light rounded-xl resize-none" 
                placeholder="Pada zaman dahulu..."
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-fredoka font-bold text-text-main">Sumber Cerita</h2>
              <p className="text-text-light text-sm">Tambahkan referensi untuk memastikan keaslian cerita. Minimal satu sumber.</p>
              {formData.sources.map((src, i) => (
                <div key={i} className="p-4 border border-border-light rounded-xl space-y-4 bg-stone-50">
                  <div className="flex gap-4">
                    <select 
                      value={src.type} 
                      onChange={e => {
                        const newSources = [...formData.sources];
                        newSources[i].type = e.target.value as any;
                        updateForm('sources', newSources);
                      }}
                      className="p-2 border border-border-light rounded-lg bg-white"
                    >
                      <option value="buku">Buku</option>
                      <option value="arsip">Arsip</option>
                      <option value="web">Web</option>
                      <option value="lisan">Lisan / Narasumber</option>
                    </select>
                    <input 
                      type="text" 
                      value={src.citation} 
                      onChange={e => {
                        const newSources = [...formData.sources];
                        newSources[i].citation = e.target.value;
                        updateForm('sources', newSources);
                      }}
                      className="flex-1 p-2 border border-border-light rounded-lg bg-white" 
                      placeholder="Sitasi atau URL"
                    />
                  </div>
                </div>
              ))}
              <Button variant="secondary" onClick={() => updateForm('sources', [...formData.sources, { type: 'buku', citation: '', author: '' }])}>+ Tambah Sumber</Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-fredoka font-bold text-text-main">Pernyataan Hak</h2>
              <label className="flex items-start gap-4 p-4 border border-border-light rounded-xl hover:bg-stone-50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={formData.rights_declared} 
                  onChange={e => updateForm('rights_declared', e.target.checked)} 
                  className="mt-1 w-5 h-5 text-teal border-gray-300 rounded focus:ring-teal" 
                />
                <span className="text-text-main font-semibold leading-relaxed">
                  Saya menyatakan bahwa cerita ini ditulis ulang dengan kata-kata sendiri atau merupakan domain publik, dan saya setuju cerita ini dilisensikan di bawah CC BY-SA 4.0.
                </span>
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-fredoka font-bold text-text-main">Tinjau Kontribusi</h2>
              <div className="bg-stone-50 p-6 rounded-xl space-y-4">
                <div>
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider block mb-1">Judul</span>
                  <div className="font-bold text-text-main text-lg">{formData.title}</div>
                </div>
                <div>
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider block mb-1">Label Versi</span>
                  <div className="text-text-main">{formData.version_label}</div>
                </div>
                <div>
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider block mb-1">Jumlah Kata</span>
                  <div className="text-text-main">{formData.body.trim().split(/\s+/).length} kata</div>
                </div>
                <div>
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider block mb-1">Hak Dinyatakan</span>
                  <div className="text-text-main">{formData.rights_declared ? 'Ya' : 'Belum'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border-light p-4 bg-stone-50 flex justify-between">
          <Button variant="secondary" onClick={step === 0 ? () => navigate(-1) : handlePrev} disabled={isSubmitting}>
            {step === 0 ? 'Batal' : 'Kembali'}
          </Button>
          
          {step < STEPS.length - 1 ? (
            <Button variant="primary" onClick={handleNext}>Lanjut</Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting || !formData.rights_declared}>
              {isSubmitting ? 'Mengirim...' : 'Kirim Kontribusi'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

