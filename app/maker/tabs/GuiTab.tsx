import React, { useState, useMemo, useCallback } from 'react';
import { GripVertical, X, Plus, ChevronDown, Columns } from 'lucide-react';
import { TierListDraft, TierListItem } from '@/lib/types';
import { TIER_COLORS } from '@/components/TierListShared';

interface Props {
  data: TierListDraft;
  setData: React.Dispatch<React.SetStateAction<TierListDraft>>;
}

const GuiTab = ({ data, setData }: Props) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverTier, setDragOverTier] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{ id: string; position: 'before' | 'after' } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<{ tier: string; name: string; [key: string]: string | number }>({ tier: 'S', name: '' });

  const tierColumn = useMemo(() => data.schema.find(c => c.type === 'tier'), [data.schema]);

  const groupedItems = useMemo(() => {
    if (!tierColumn?.options) return {};
    const map: Record<string, TierListItem[]> = {};
    tierColumn.options.forEach(t => (map[t] = []));
    data.items.forEach(item => {
      const tier = item.values[tierColumn.id] as string;
      if (map[tier]) map[tier].push(item);
    });
    return map;
  }, [data.items, tierColumn]);

  const moveItemByDrag = useCallback((
    sourceId: string,
    targetTier: string,
    targetId?: string,
    position?: 'before' | 'after'
  ) => {
    if (!tierColumn) return;
    if (targetId === sourceId) return;

    const sourceIndex = data.items.findIndex(i => i.id === sourceId);
    if (sourceIndex === -1) return;

    const newItems = [...data.items];
    const [sourceItem] = newItems.splice(sourceIndex, 1);
    const updatedItem = {
      ...sourceItem,
      values: { ...sourceItem.values, [tierColumn.id]: targetTier }
    };

    if (targetId) {
      const targetIndex = newItems.findIndex(i => i.id === targetId);
      if (targetIndex !== -1) {
        const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
        newItems.splice(insertIndex, 0, updatedItem);
        setData(prev => ({ ...prev, items: newItems }));
        return;
      }
    }

    let lastIndexInTier = -1;
    for (let i = newItems.length - 1; i >= 0; i--) {
      if (newItems[i].values[tierColumn.id] === targetTier) {
        lastIndexInTier = i;
        break;
      }
    }

    if (lastIndexInTier !== -1) {
      newItems.splice(lastIndexInTier + 1, 0, updatedItem);
    } else {
      newItems.push(updatedItem);
    }

    setData(prev => ({ ...prev, items: newItems }));
  }, [data.items, tierColumn, setData]);

  const addItemViaModal = () => {
    if (!createForm.name.trim()) {
      alert('Item name is required');
      return;
    }

    const id = `item_${Date.now()}`;
    const values: Record<string, string | number> = { [tierColumn!.id]: createForm.tier };
    
    data.schema.forEach(col => {
      if (col.type === 'tier') return;
      if (col.type === 'rating') values[col.id] = createForm[col.id] ?? col.min ?? 0;
      if (col.type === 'text') values[col.id] = createForm[col.id] ?? '';
    });

    setData(prev => ({ ...prev, items: [...prev.items, { id, name: createForm.name, values }] }));
    setCreateForm({ tier: 'S', name: '' });
    setShowCreateModal(false);
  };

  const deleteItem = (id: string) => {
    setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  if (!tierColumn?.options) {
    return (
      <div className="p-12 max-w-2xl mx-auto text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Columns className="w-8 h-8" />
        </div>
        <h2 className="font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-2">GUI Maker Unavailable</h2>
        <p className="text-zinc-500 dark:text-zinc-400">A <strong>Tier</strong> column is required in the Schema tab to use the GUI Maker.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">GUI Maker</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Drag and drop items to organize your tierlist.</p>
        </div>
        <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-all active:scale-95"
        >
            <Plus className="w-4 h-4" /> Quick Add Item
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-fade-in border border-zinc-200 dark:border-zinc-700">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-lg font-bold">Add New Item</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Item Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                  placeholder="Enter item name..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">Tier</label>
                <div className="relative">
                    <select
                    value={createForm.tier}
                    onChange={(e) => setCreateForm({ ...createForm, tier: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none font-medium"
                    >
                    {tierColumn.options.map(tier => (
                        <option key={tier} value={tier}>{tier}</option>
                    ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {data.schema.map(col => {
                if (col.type === 'tier') return null;
                return (
                  <div key={col.id}>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5">{col.name}</label>
                    {col.type === 'rating' ? (
                      <input
                        type="number"
                        min={col.min || 0}
                        max={col.max || 10}
                        value={createForm[col.id] ?? col.min ?? 0}
                        onChange={(e) => setCreateForm({ ...createForm, [col.id]: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    ) : (
                      <textarea
                        value={createForm[col.id] ?? ''}
                        onChange={(e) => setCreateForm({ ...createForm, [col.id]: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y min-h-[80px]"
                        rows={2}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-3 justify-end bg-zinc-50 dark:bg-zinc-900/50">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addItemViaModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm active:scale-95 transition-all"
              >
                Create Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tier Grid */}
      <div className="flex-1 overflow-y-auto pr-2 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tierColumn.options.map(tier => {
             const colorClass = TIER_COLORS[tier] || TIER_COLORS.default;
             // We want to use the background color for the header, but maybe a lighter version for the body?
             // For now let's stick to a clean card look.
             
             return (
              <div
                key={tier}
                className="flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
              >
                {/* Tier Header */}
                <div className={`px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center ${
                    dragOverTier === tier ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-zinc-50/50 dark:bg-zinc-900'
                }`}>
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm ${colorClass}`}>
                        {tier}
                     </div>
                     <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {groupedItems[tier]?.length || 0} items
                     </span>
                  </div>
                </div>

                {/* Items Container */}
                <div
                  className={`flex-1 p-3 min-h-[200px] space-y-2 transition-colors ${
                    dragOverTier === tier ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverTier(tier);
                  }}
                  onDragLeave={() => setDragOverTier(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggingId) {
                      moveItemByDrag(draggingId, tier);
                      setDraggingId(null);
                      setDragOverTier(null);
                      setDragOverItem(null);
                    }
                  }}
                >
                  {groupedItems[tier]?.length === 0 && dragOverTier !== tier && (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-300 dark:text-zinc-700 gap-2 py-8">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                         <Plus className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium">Drop items here</span>
                    </div>
                  )}

                  {groupedItems[tier]?.map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => setDraggingId(item.id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOverItem(null);
                        setDragOverTier(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggingId === item.id) return;

                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const midpoint = rect.top + rect.height / 2;
                        setDragOverItem({
                          id: item.id,
                          position: e.clientY < midpoint ? 'before' : 'after'
                        });
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggingId && dragOverItem && draggingId !== item.id) {
                          moveItemByDrag(draggingId, tier, dragOverItem.id, dragOverItem.position);
                        }
                        setDraggingId(null);
                        setDragOverItem(null);
                        setDragOverTier(null);
                      }}
                      className={`relative p-3 rounded-lg bg-white dark:bg-zinc-800 border cursor-move group transition-all hover:shadow-md ${
                        draggingId === item.id ? 'opacity-40 scale-95' : ''
                      } ${
                        dragOverItem?.id === item.id
                          ? 'ring-2 ring-indigo-500 border-transparent z-10'
                          : 'border-zinc-200 dark:border-zinc-700/50 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      {/* Drop indicators */}
                      {dragOverItem?.id === item.id && dragOverItem.position === 'before' && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t z-20" />
                      )}
                      {dragOverItem?.id === item.id && dragOverItem.position === 'after' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-b z-20" />
                      )}

                      {/* Header */}
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                         <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className="w-4 h-4 text-zinc-300 dark:text-zinc-600 cursor-grab active:cursor-grabbing flex-shrink-0" />
                            <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate leading-tight" title={item.name}>
                                {item.name}
                            </div>
                         </div>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-0.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Compact stats */}
                      <div className="pl-6 text-[10px] text-zinc-500 dark:text-zinc-400 space-y-0.5">
                        {data.schema.map(col => {
                          if (col.type === 'tier') return null;
                          const value = item.values[col.id];
                          if (col.type === 'text' && !value) return null;
                          if (col.type === 'rating') {
                              return (
                                <div key={col.id} className="flex items-center gap-1.5">
                                  <span className="font-medium truncate opacity-70">{col.name}:</span>
                                  <span className="text-amber-500 font-bold">{value}</span>
                                  <span className="text-zinc-300">/ {col.max || 10}</span>
                                </div>
                              );
                          }
                          return (
                            <div key={col.id} className="flex justify-between gap-1">
                              <span className="font-medium truncate opacity-70">{col.name}:</span>
                              <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[100px]">{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GuiTab;
