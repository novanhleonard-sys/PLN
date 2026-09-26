import { Award } from 'lucide-react';

export function Poin() {
  return (
    <div className="flex flex-col gap-6 font-nunito h-full">
      <h2 className="text-2xl font-fredoka font-bold text-stone-800">Poin</h2>
      
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-full">
        <div className="w-20 h-20 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Award size={40} />
        </div>
        <h3 className="text-4xl font-fredoka font-bold text-stone-800 mb-2">0 Poin</h3>
        <p className="text-stone-500 max-w-sm">
          Kamu belum memiliki poin. Terus baca dan jelajahi cerita untuk mengumpulkan poin!
        </p>
      </div>
    </div>
  );
}
