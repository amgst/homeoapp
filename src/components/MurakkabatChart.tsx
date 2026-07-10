import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Plus, Check, Info, FileText } from 'lucide-react';
import { MURAKKABAT_LIST, Murakkab } from '../utils/murakkabat';

interface MurakkabatChartProps {
  onSelectCompound?: (compoundName: string) => void;
  selectedCompounds?: string[];
  compact?: boolean;
}

export default function MurakkabatChart({ onSelectCompound, selectedCompounds = [], compact = false }: MurakkabatChartProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const filteredList = MURAKKABAT_LIST.filter(item => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    
    // Search by number, english name, or Urdu name
    return (
      item.number.toString() === term ||
      item.englishName.toLowerCase().includes(term) ||
      item.urduName.includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search and Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
            <span>50 Murakkabat Chart (50 مرکبات)</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Interactive homeopathic compound formula reference. {onSelectCompound ? 'Click any card to add to prescription.' : 'View formula details.'}
          </p>
        </div>

        {/* Real-time Filter Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by No., English or Urdu name..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-green-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className={`grid ${compact ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'} gap-3.5`}>
        <AnimatePresence mode="popLayout">
          {filteredList.map((item) => {
            const isAdded = selectedCompounds.includes(item.remedyName);
            
            return (
              <motion.div
                layout
                key={item.number}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onMouseEnter={() => setHoveredIndex(item.number)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative bg-white border rounded-2xl p-3.5 flex flex-col justify-between transition-all text-center select-none ${
                  isAdded 
                    ? 'border-emerald-500 bg-emerald-50/10 shadow-xs ring-1 ring-emerald-500/20' 
                    : 'border-slate-200/80 hover:border-green-500 hover:shadow-xs hover:bg-slate-50/20'
                } ${onSelectCompound ? 'cursor-pointer' : ''}`}
                onClick={() => onSelectCompound?.(item.remedyName)}
              >
                {/* Prescription Number in a Circle at the top */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                    isAdded ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.number}
                  </span>
                  
                  {onSelectCompound ? (
                    <span className={`text-[10px] font-bold uppercase ${
                      isAdded ? 'text-emerald-600' : 'text-slate-300'
                    }`}>
                      {isAdded ? 'Added' : '+ Add'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-300">
                      HHC-{String(item.number).padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Urdu Name (Elegant & Large font) */}
                <div className="py-2.5">
                  <p className="text-lg font-bold text-slate-800 tracking-wide font-sans leading-relaxed" dir="rtl">
                    {item.urduName}
                  </p>
                  
                  {/* English Name (Clean UI) */}
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                    {item.englishName}
                  </p>
                </div>

                {/* Card Footer action indicator */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center text-[9px] font-semibold text-slate-400">
                  {isAdded ? (
                    <span className="flex items-center text-emerald-600 space-x-1">
                      <Check className="h-3 w-3" />
                      <span>Ready in Prescription</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 truncate">
                      Formula No. {item.number}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredList.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
          <p className="text-xs text-slate-400 font-bold">No compound formulas match your search.</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
          >
            Reset Search Filter
          </button>
        </div>
      )}
    </div>
  );
}
