import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthStore';
import { Modal } from '../../ui/layers/Modal';
import { Button } from '../../ui/basic/Button';

export interface ReportButtonProps {
  targetType: 'story' | 'version' | 'adaptation';
  targetId: string;
  className?: string;
}

export function ReportButton({ targetType, targetId, className }: ReportButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!user) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setErrorMsg('Alasan tidak boleh kosong');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    const { error } = await supabase.from('reports').insert({
      user_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason: reason.trim()
    });
    setSubmitting(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setReason('');
      }, 2000);
    }
  };

  return (
    <>
      <Button variant="ghost" 
        onClick={() => setIsOpen(true)}
        className={`text-status-error text-sm font-semibold hover:underline ${className || ''}`}
      >
        Laporkan
      </Button>

      <Modal isOpen={isOpen} onClose={() => !submitting && setIsOpen(false)}>
        <div className="p-6 font-nunito">
          <h3 className="text-xl font-fredoka font-semibold mb-4">Laporkan Konten</h3>
          {success ? (
            <div className="p-4 bg-status-success/10 text-status-success rounded-xl">
              Laporan berhasil dikirim. Terima kasih!
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-text-muted">
                Mengapa Anda melaporkan {targetType} ini?
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tulis alasan laporan Anda..."
                className="w-full min-h-[100px] p-3 rounded-xl border border-border-light focus:outline-none focus:border-primary-teal resize-y text-text-main"
              />
              {errorMsg && (
                <div className="text-sm text-status-error">{errorMsg}</div>
              )}
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="secondary" onClick={() => setIsOpen(false)} disabled={submitting}>
                  Batal
                </Button>
                <Button onClick={handleSubmit} disabled={submitting} className="!bg-status-error hover:!bg-red-700">
                  {submitting ? 'Mengirim...' : 'Kirim Laporan'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
