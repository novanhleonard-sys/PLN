import { useState } from 'react';
import { TabAntrean } from './antrean/TabAntrean';
import { TabAntreanMedia } from './antrean/TabAntreanMedia';
import { TabPantauan } from './antrean/TabPantauan';
import { TabRiwayat } from './antrean/TabRiwayat';
import { cn } from '../../utils/cn';

export function AdminAntrean() {
  const [activeTab, setActiveTab] = useState<'antrean' | 'media' | 'pantauan' | 'riwayat'>('antrean');

  return (
    <div className="flex flex-col gap-6 font-nunito pb-12 max-w-6xl">
      <div className="flex items-center gap-6 border-b border-stone-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('antrean')} 
          className={cn("pb-3 text-lg font-bold font-fredoka border-b-2 transition-colors whitespace-nowrap", activeTab === 'antrean' ? 'border-teal text-teal' : 'border-transparent text-stone-400 hover:text-stone-600')}
        >
          Antrean Cerita (Teks)
        </button>
        <button 
          onClick={() => setActiveTab('media')} 
          className={cn("pb-3 text-lg font-bold font-fredoka border-b-2 transition-colors whitespace-nowrap flex items-center gap-2", activeTab === 'media' ? 'border-teal text-teal' : 'border-transparent text-stone-400 hover:text-stone-600')}
        >
          <span>Karya Media (Artis)</span>
        </button>
        <button 
          onClick={() => setActiveTab('pantauan')} 
          className={cn("pb-3 text-lg font-bold font-fredoka border-b-2 transition-colors whitespace-nowrap", activeTab === 'pantauan' ? 'border-teal text-teal' : 'border-transparent text-stone-400 hover:text-stone-600')}
        >
          Pantauan AI
        </button>
        <button 
          onClick={() => setActiveTab('riwayat')} 
          className={cn("pb-3 text-lg font-bold font-fredoka border-b-2 transition-colors whitespace-nowrap", activeTab === 'riwayat' ? 'border-teal text-teal' : 'border-transparent text-stone-400 hover:text-stone-600')}
        >
          Riwayat
        </button>
      </div>

      <div className="pt-2">
        {activeTab === 'antrean' && <TabAntrean />}
        {activeTab === 'media' && <TabAntreanMedia />}
        {activeTab === 'pantauan' && <TabPantauan />}
        {activeTab === 'riwayat' && <TabRiwayat />}
      </div>
    </div>
  );
}
