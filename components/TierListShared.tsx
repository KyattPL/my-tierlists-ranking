import React, { useMemo } from 'react';
import { Star, ArrowUp, ArrowDown } from 'lucide-react';
import { TierList, TierListItem } from '@/lib/types';

export const TIER_COLORS: Record<string, string> = {
  S: 'bg-red-500 border-red-600 text-white',
  A: 'bg-orange-500 border-orange-600 text-white',
  B: 'bg-amber-400 border-amber-500 text-black',
  C: 'bg-yellow-300 border-yellow-400 text-black',
  D: 'bg-lime-300 border-lime-400 text-black',
  F: 'bg-zinc-400 border-zinc-500 text-black',
  // Fallbacks
  default: 'bg-zinc-500 border-zinc-600 text-white'
};

export const TierBadge = ({ tier }: {tier: string}) => {
  const colorClass = TIER_COLORS[tier] || TIER_COLORS.default;
  // Extract just the bg color for the badge to avoid border/text clashes in small badges
  const bgClass = colorClass.split(' ')[0];
  const textClass = tier === 'B' || tier === 'C' || tier === 'D' ? 'text-black' : 'text-white';
  
  return (
    <div className={`${bgClass} ${textClass} font-bold px-2.5 py-0.5 rounded text-xs inline-flex items-center justify-center min-w-[1.5rem] shadow-sm`}>
      {tier}
    </div>
  );
};

export const RatingStars = ({ value, max }: {value: number, max: number}) => (
  <div className="flex items-center gap-0.5" title={`${value}/${max}`}>
    {[...Array(max)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-3.5 h-3.5 ${i < value ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-600'}`} 
      />
    ))}
    <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1.5 font-medium">{value}</span>
  </div>
);

export const TierlistView = ({ tierlist, viewMode, sortConfig, onSort }: { tierlist: TierList; viewMode: 'tier' | 'table'; sortConfig: { key: string; direction: 'asc' | 'desc' } | null; onSort: (key: string) => void; }) => {
  const groupedByTier = useMemo(() => {
    const tierColumn = tierlist.schema.find(col => col.type === 'tier');
    if (!tierColumn) return null;
    const groups: Record<string, TierListItem[]> = {};
    // Initialize with options to preserve order
    tierColumn.options?.forEach(tier => { groups[tier] = []; });
    
    tierlist.items.forEach(item => { 
      const tierValue = item.values.tier as string; 
      if (tierValue && groups[tierValue]) { 
        groups[tierValue].push(item); 
      } else if (tierValue) {
         // Handle tiers not in options (if any)
         if (!groups[tierValue]) groups[tierValue] = [];
         groups[tierValue].push(item);
      }
    });
    return groups;
  }, [tierlist]);

  // Global rank counter for tier view
  let globalRank = 1;

  if (viewMode === 'tier' && groupedByTier) {
    return (
      <div className="flex flex-col gap-1 bg-zinc-900/5 p-1 rounded-xl">
        {Object.entries(groupedByTier).map(([tier, items]) => {
           if (items.length === 0 && !['S', 'A', 'B', 'C', 'D', 'F'].includes(tier)) return null; // Skip empty non-standard tiers if desirable, keeping for now

           const colorClass = TIER_COLORS[tier] || TIER_COLORS.default;
           
           return (
            <div key={tier} className="flex min-h-[100px] bg-white dark:bg-zinc-800/50 rounded-lg overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-700/50">
              {/* Tier Label */}
              <div className={`w-24 sm:w-32 flex items-center justify-center p-4 ${colorClass}`}>
                <span className="text-4xl font-black tracking-widest drop-shadow-sm">{tier}</span>
              </div>
              
              {/* Tier Items */}
              <div className="flex-1 p-3 flex flex-wrap gap-3 content-start">
                {items.map(item => {
                    const currentRank = globalRank++;

                    return (
                        <div 
                          key={item.id} 
                          className="group relative w-28 sm:w-32 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer"
                          title={item.name}
                        >
                            {!sortConfig && (
                                <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full z-10 backdrop-blur-sm">
                                    #{currentRank}
                                </div>
                            )}
                            
                            {/* Image Placeholder or Actual Image */}
                            <div className="aspect-square bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-400">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-center p-2 break-words font-medium text-zinc-500 dark:text-zinc-400">{item.name}</span>
                                )}
                            </div>

                            {/* Hover Details (if needed) or simple name at bottom */}
                            <div className="p-2 bg-white dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700">
                                <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate text-center">{item.name}</div>
                            </div>
                            
                            {/* Tooltip-like stats on hover could go here */}
                        </div>
                    );
                })}
                {items.length === 0 && (
                   <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600 text-sm italic">
                     Empty Tier
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Table View
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-6 py-4 font-semibold text-zinc-700 dark:text-zinc-300">
                <button onClick={() => onSort('name')} className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    Name 
                    {sortConfig?.key === 'name' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                    ) : (
                        <span className="text-zinc-300 dark:text-zinc-600">↕</span>
                    )}
                </button>
              </th>
              {tierlist.schema.map(col => (
                <th key={col.id} className="px-6 py-4 font-semibold text-zinc-700 dark:text-zinc-300">
                    <button onClick={() => onSort(col.id)} className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {col.name} 
                        {sortConfig?.key === col.id ? (
                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                        ) : (
                           <span className="text-zinc-300 dark:text-zinc-600">↕</span>
                        )}
                    </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {tierlist.items.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                <td className="px-6 py-3 font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-700 flex-shrink-0 overflow-hidden">
                       {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    {item.name}
                </td>
                {tierlist.schema.map(col => { 
                    const value = item.values[col.id]; 
                    return (
                        <td key={col.id} className="px-6 py-3 text-zinc-600 dark:text-zinc-400">
                            {col.type === 'tier' && typeof value === 'string' && <TierBadge tier={value} />}
                            {col.type === 'rating' && typeof value === 'number' && <RatingStars value={value} max={col.max || 10} />}
                            {col.type === 'text' && <span className="truncate max-w-[200px] block" title={value as string}>{value}</span>}
                        </td>
                    ); 
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
