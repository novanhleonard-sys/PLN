import React from 'react';

type Status = 'submitted' | 'triaging' | 'verifying' | 'needs_review' | 'approved' | 'rejected' | 'draft';

export const StatusLabel = ({ status }: { status: Status }) => {
  const config = {
    draft: { label: 'Draf', classes: 'bg-stone-200 text-stone-700' },
    submitted: { label: 'Dikirim', classes: 'bg-stone-200 text-stone-700' },
    triaging: { label: 'Diperiksa', classes: 'bg-teal/10 text-teal' },
    verifying: { label: 'Diverifikasi', classes: 'bg-teal/10 text-teal' },
    needs_review: { label: 'Perlu tinjauan admin', classes: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Diterima', classes: 'bg-green-100 text-green-700' },
    rejected: { label: 'Ditolak', classes: 'bg-red-100 text-red-700' },
  };
  
  const current = config[status] || config.submitted;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${current.classes}`}>
      {current.label}
    </span>
  );
};
