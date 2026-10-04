import { useState, useRef, useEffect } from 'react';
import { Icon } from '../../ui/basic/Icon';
import { useRegionGroups } from './useRegionGroups';

interface Props {
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
}

export function MultiRegionSelect({ value = [], onChange, placeholder = 'Daerah: Global' }: Props) {
  const { parentGroups, subGroups } = useRegionGroups();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleRegion = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selectedNames = value
    .map(id => subGroups.find(s => s.id === id)?.name || parentGroups.find(p => p.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none flex items-center justify-between text-left"
      >
        <div className="flex-1 truncate">
          {value.length === 0 ? (
            <span className="text-stone-500">{placeholder}</span>
          ) : (
            <span className="text-stone-700 font-medium">
              {selectedNames.length > 2
                ? `${selectedNames.length} Daerah Terpilih`
                : selectedNames.join(', ')}
            </span>
          )}
        </div>
        <Icon name="ChevronDown" size={16} className="text-stone-400 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border border-stone-200 shadow-xl rounded-xl py-2 z-50 max-h-72 overflow-y-auto">
          <div
            className={`px-4 py-2 text-sm cursor-pointer hover:bg-stone-50 flex items-center gap-2 ${value.length === 0 ? 'font-bold text-teal' : 'text-stone-600'}`}
            onClick={() => { onChange([]); setIsOpen(false); }}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${value.length === 0 ? 'bg-teal border-teal text-white' : 'border-stone-300'}`}>
              {value.length === 0 && <Icon name="Check" size={12} />}
            </div>
            Semua Daerah (Global)
          </div>

          {parentGroups.map(p => {
            const children = subGroups.filter(s => s.parent_id === p.id);
            const allSelected = children.length > 0 && children.every(s => value.includes(s.id));
            const someSelected = children.some(s => value.includes(s.id));

            return (
              <div key={p.id} className="mt-2">
                <div 
                  className="px-4 py-2 text-xs font-bold text-stone-600 uppercase tracking-wider bg-stone-50 hover:bg-stone-100 cursor-pointer flex items-center gap-2 border-y border-stone-100"
                  onClick={() => {
                    if (allSelected) {
                      // Deselect all
                      onChange(value.filter(v => !children.some(c => c.id === v)));
                    } else {
                      // Select all
                      const newValues = new Set([...value, ...children.map(c => c.id)]);
                      onChange(Array.from(newValues));
                    }
                  }}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${allSelected ? 'bg-teal border-teal text-white' : someSelected ? 'bg-teal/20 border-teal text-teal' : 'border-stone-300 bg-white'}`}>
                    {allSelected && <Icon name="Check" size={12} />}
                    {!allSelected && someSelected && <div className="w-2 h-0.5 bg-teal rounded-full" />}
                  </div>
                  {p.name}
                </div>
                {children.map(s => {
                  const isSelected = value.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-teal-50 flex items-center gap-2 text-stone-700"
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isSelected}
                        onChange={() => toggleRegion(s.id)}
                      />
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${isSelected ? 'bg-teal border-teal text-white' : 'border-stone-300'}`}>
                        {isSelected && <Icon name="Check" size={12} />}
                      </div>
                      {s.name}
                    </label>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
