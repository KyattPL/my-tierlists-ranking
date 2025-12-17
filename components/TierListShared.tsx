import React, { useMemo } from 'react';
import { Star, ArrowUp, ArrowDown } from 'lucide-react';

type TIER = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

interface SchemaColumn {
  id: string;
  name: string;
  type: 'tier' | 'rating' | 'text';
  options?: string[];
  max?: number;
  min?: number;
}

interface TierListItem {
  id:string;
  name: string;
  imageUrl?: string | null;
  values: Record<string, string | number>;
}

interface BaseNode {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  children: string[];
}

export interface Category extends BaseNode {
  type: 'category';
}

export interface TierList extends BaseNode {
  type: 'list';
  schema: SchemaColumn[];
  items: TierListItem[];
}

export type AppNode = Category | TierList;

export const TierBadge = ({ tier }: {tier: TIER}) => {
  const colors = { S: 'bg-red-500', A: 'bg-orange-500', B: 'bg-yellow-500', C: 'bg-green-500', D: 'bg-blue-500', F: 'bg-gray-500' };
  return <div className={`${colors[tier] || 'bg-gray-500'} text-white font-bold px-3 py-1 rounded text-sm`}>{tier}</div>;
};

export const RatingStars = ({ value, max }: {value: number, max: number}) => (
  <div className="flex items-center gap-1">
    {[...Array(max)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />)}
    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{value}/{max}</span>
  </div>
);

export const TierlistView = ({ tierlist, viewMode, sortConfig, onSort }: { tierlist: TierList; viewMode: 'tier' | 'table'; sortConfig: { key: string; direction: 'asc' | 'desc' } | null; onSort: (key: string) => void; }) => {
  const groupedByTier = useMemo(() => {
    const tierColumn = tierlist.schema.find(col => col.type === 'tier');
    if (!tierColumn) return null;
    const groups: Record<string, TierListItem[]> = {};
    tierColumn.options?.forEach(tier => { groups[tier] = []; });
    tierlist.items.forEach(item => { const tierValue = item.values.tier as string; if (groups[tierValue]) { groups[tierValue].push(item); } });
    return groups;
  }, [tierlist]);

  let globalRank = 1;

  if (viewMode === 'tier' && groupedByTier) {
    return (
      <div className="border rounded-lg overflow-hidden bg-gray-900">
        {Object.entries(groupedByTier).map(([tier, items]) => (
          <div key={tier} className="flex border-b border-black last:border-b-0">
            <div className={`w-20 sm:w-24 md:w-32 flex items-center justify-center ${tier === 'S' ? 'bg-red-400' : tier === 'A' ? 'bg-orange-400' : tier === 'B' ? 'bg-yellow-400' : tier === 'C' ? 'bg-lime-400' : tier === 'D' ? 'bg-green-400' : 'bg-gray-400'} border-r-4 border-black`}>
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">{tier}</span>
            </div>
            <div className="flex-1 bg-gray-800 p-2 min-h-[100px] sm:min-h-[120px]">
              <div className="flex flex-wrap gap-2">
                {items.map(item => {
                    const currentRank = globalRank++;

                    return (
                            <div key={item.id} className="relative bg-gray-700 border-2 border-gray-600 rounded p-2 hover:border-gray-400 transition-colors cursor-pointer group" title={item.name}>
                                {!sortConfig && (
                                    <div className="absolute -top-2 -left-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-gray-600 z-10 shadow-sm">
                                        #{currentRank}
                                    </div>
                                )}
                                <div className="font-medium text-white text-sm mb-1">{item.name}</div>
                                <div className="space-y-1">
                                {tierlist.schema.filter(col => col.type !== 'tier').slice(0, 2).map(col => {
                                    const value = item.values[col.id];
                                    return (
                                    <div key={col.id} className="text-xs text-gray-300">
                                        <span className="text-gray-400">{col.name}: </span>
                                        {col.type === 'rating' && typeof value === 'number' ? <span className="text-yellow-400">★{value}/{col.max}</span> : <span>{value}</span>}
                                    </div>
                                    );
                                })}
                                </div>
                            </div>
                        );
                    }
                )}
                {items.length === 0 && <div className="text-gray-500 text-sm italic self-center">Empty tier</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table view for desktop, Card view for mobile
  return (
    <div>
      {/* Desktop Table View */}
      <div className="overflow-x-auto border rounded-lg dark:border-gray-700 hidden md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-600">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                <button onClick={() => onSort('name')} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white">
                    Name {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? <ArrowUp /> : <ArrowDown />) : <span className="text-gray-400 opacity-50 ml-1">↕</span>}
                </button>
              </th>
              {tierlist.schema.map(col => (<th key={col.id} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"><button onClick={() => onSort(col.id)} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white">{col.name} {sortConfig?.key === col.id && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}</button></th>))}
            </tr>
          </thead>
          <tbody>
            {tierlist.items.map(item => (<tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"><td className="px-4 py-3 font-medium dark:text-gray-100">{item.name}</td>{tierlist.schema.map(col => { const value = item.values[col.id]; return (<td key={col.id} className="px-4 py-3">{col.type === 'tier' && typeof value === 'string' && <TierBadge tier={value as TIER} />}{col.type === 'rating' && typeof value === 'number' && <RatingStars value={value} max={col.max || 10} />}{col.type === 'text' && <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}</td>); })}</tr>))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {tierlist.items.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
            <h3 className="font-bold text-lg mb-3">{item.name}</h3>
            <div className="space-y-2">
              {tierlist.schema.map(col => {
                const value = item.values[col.id];
                return (
                  <div key={col.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{col.name}</span>
                    <div>
                      {col.type === 'tier' && typeof value === 'string' && <TierBadge tier={value as TIER} />}
                      {col.type === 'rating' && typeof value === 'number' && <RatingStars value={value} max={col.max || 10} />}
                      {col.type === 'text' && <span className="text-gray-800 dark:text-gray-200">{value}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};