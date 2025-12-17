import { TierList } from '@/components/TierListShared';
import React, { useState } from 'react';
import { GripVertical, X } from 'lucide-react';

const getTierColumn = (schema: TierList['schema']) =>
  schema.find(col => col.type === 'tier');

const groupItemsByTier = (
  items: TierList['items'],
  tierKey: string,
  tiers: string[]
) => {
  const map: Record<string, TierList['items']> = {};
  tiers.forEach(t => (map[t] = []));
  items.forEach(item => {
    const tier = item.values[tierKey] as string;
    if (map[tier]) map[tier].push(item);
  });
  return map;
};

const moveItemByDrag = (
  items: TierList['items'],
  sourceId: string,
  targetTier: string,
  tierKey: string,
  targetId?: string,
  position?: 'before' | 'after'
) => {

  if (targetId === sourceId) return items;

  const sourceIndex = items.findIndex(i => i.id === sourceId);
  if (sourceIndex === -1) return items;

  const newItems = [...items];
  const [sourceItem] = newItems.splice(sourceIndex, 1);

  const updatedItem = {
    ...sourceItem,
    values: {
      ...sourceItem.values,
      [tierKey]: targetTier
    }
  };

  if (targetId) {
    const targetIndex = newItems.findIndex(i => i.id === targetId);
    
    if (targetIndex !== -1) {
      const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
      newItems.splice(insertIndex, 0, updatedItem);
      return newItems;
    }
  }

  let lastIndexInTier = -1;
  for (let i = newItems.length - 1; i >= 0; i--) {
    if (newItems[i].values[tierKey] === targetTier) {
      lastIndexInTier = i;
      break;
    }
  }

  if (lastIndexInTier !== -1) {
    newItems.splice(lastIndexInTier + 1, 0, updatedItem);
  } else {
    newItems.push(updatedItem);
  }

  return newItems;
};

interface Props {
    data: TierList;
    setData: React.Dispatch<React.SetStateAction<TierList>>;
}

const GuiTab = ({ data, setData }: Props) => {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverTier, setDragOverTier] = useState<string | null>(null);
    const [dragOverItem, setDragOverItem] = useState<{
        id: string;
        position: 'before' | 'after';
    } | null>(null);

    const tierColumn = getTierColumn(data.schema);

    if (!tierColumn || !tierColumn.options) {
        return (
        <div className="max-w-2xl mx-auto p-6 bg-red-50 dark:bg-red-900/20 border border-red-300 rounded">
            <h2 className="font-bold text-red-700 dark:text-red-300">
            GUI Maker unavailable
            </h2>
            <p className="text-sm mt-2">
            A Tier column (type: <code>tier</code>) is required to use GUI Maker.
            </p>
        </div>
        );
    }

    const grouped = groupItemsByTier(
        data.items,
        tierColumn.id,
        tierColumn.options
    );

    const updateItemValue = (itemId: string, key: string, value: string | number) => {
        setData(prev => ({
            ...prev,
            items: prev.items.map(i => 
                i.id === itemId ? { ...i, values: { ...i.values, [key]: value } } : i
            )
        }));
    };

    const deleteItem = (itemId: string) => {
        setData(prev => ({
            ...prev,
            items: prev.items.filter(i => i.id !== itemId)
        }));
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold">GUI Tier Editor</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag items to reorder. Add custom fields (like &quot;Plot&quot;, &quot;Lyrics&quot;) in the <b>Schema</b> tab.
        </p>

        {tierColumn.options.map(tier => (
            <div
            key={tier}
            className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm"
            >
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
                <h3 className="font-bold text-lg">{tier}</h3>
                <button
                onClick={() => {
                    const id = `item_${Date.now()}`;
                    const values: Record<string, string | number> = {};
                    data.schema.forEach(col => {
                        if (col.type === 'tier') values[col.id] = tier;
                        else if (col.type === 'rating') values[col.id] = 0;
                        else values[col.id] = '';
                    });
                    setData(prev => ({
                    ...prev,
                    items: [...prev.items, { id, name: 'New Item', values }]
                    }));
                }}
                className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                >
                + Add Item
                </button>
            </div>

            <div
            className={`p-4 flex flex-wrap gap-3 min-h-[120px] transition-colors
                ${dragOverTier === tier ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
            `}
            onDragOver={e => {
                e.preventDefault();
                setDragOverTier(tier);
            }}
            onDragLeave={() => setDragOverTier(null)}
            onDrop={(e) => {
                e.preventDefault();
                if (!draggingId) return;

                // This is the container drop. It only runs if we didn't drop ON an item.
                // It appends to the end of the tier.
                setData(prev => ({
                ...prev,
                items: moveItemByDrag(
                    prev.items,
                    draggingId,
                    tier,
                    tierColumn.id
                )
                }));

                setDraggingId(null);
                setDragOverTier(null);
                setDragOverItem(null);
            }}
            >
                {grouped[tier].length === 0 && dragOverTier !== tier && (
                    <div className="w-full flex items-center justify-center text-gray-400 text-sm italic h-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded">
                        Empty Tier
                    </div>
                )}

                {grouped[tier].map(item => (
                <div
                key={item.id}
                draggable
                onDragStart={(e) => {
                    setDraggingId(item.id);
                    e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => {
                    setDraggingId(null);
                    setDragOverItem(null);
                    setDragOverTier(null);
                }}
                onDragOver={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (draggingId === item.id) return;

                    const dragIndex = grouped[tier].findIndex(i => i.id === draggingId);
                    const hoverIndex = grouped[tier].findIndex(i => i.id === item.id);

                    // If items are in the same tier, decide based on index order (instant swap)
                    if (dragIndex !== -1 && hoverIndex !== -1) {
                        setDragOverItem({
                            id: item.id,
                            position: dragIndex < hoverIndex ? 'after' : 'before'
                        });
                    } else {
                        // If coming from a different tier, use geometry (midpoint)
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const midpoint = rect.left + rect.width / 2;
                        setDragOverItem({
                            id: item.id,
                            position: e.clientX < midpoint ? 'before' : 'after'
                        });
                    }
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (draggingId === item.id) {
                        setDraggingId(null);
                        setDragOverItem(null);
                        setDragOverTier(null);
                        return;
                    }
                    
                    if (!draggingId || !dragOverItem) return;

                    setData(prev => ({
                    ...prev,
                    items: moveItemByDrag(
                        prev.items,
                        draggingId,
                        tier,
                        tierColumn.id,
                        dragOverItem.id,
                        dragOverItem.position
                    )
                    }));

                    setDraggingId(null);
                    setDragOverItem(null);
                    setDragOverTier(null);
                }}
                className={`relative w-60 p-3 border rounded bg-white dark:bg-gray-900 cursor-move shadow-sm hover:shadow-md transition-all group
                    ${draggingId === item.id ? 'opacity-40' : ''}
                    ${dragOverItem?.id === item.id ? 'ring-2 ring-blue-400' : 'border-gray-200 dark:border-gray-700'}
                `}
                >
                    {/* Drop Indicators */}
                    {dragOverItem?.id === item.id && dragOverItem.position === 'before' && (
                    <div className="absolute top-0 bottom-0 -left-1 w-1 bg-blue-500 rounded-l z-10" />
                    )}
                    {dragOverItem?.id === item.id && dragOverItem.position === 'after' && (
                    <div className="absolute top-0 bottom-0 -right-1 w-1 bg-blue-500 rounded-r z-10" />
                    )}

                    {/* Header: Drag Handle & Delete */}
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
                        </div>
                        <button 
                            onClick={() => deleteItem(item.id)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Item Name */}
                    <div className="mb-3">
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Name</label>
                        <input
                        value={item.name}
                        onChange={e =>
                            setData(prev => ({
                            ...prev,
                            items: prev.items.map(i =>
                                i.id === item.id ? { ...i, name: e.target.value } : i
                            )
                            }))
                        }
                        className="font-semibold text-sm w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Item Name"
                        />
                    </div>

                    {/* Dynamic Subproperties based on Schema */}
                    <div className="space-y-2">
                        {data.schema.map(col => {
                            // Skip the tier column
                            if (col.type === 'tier') return null;

                            return (
                                <div key={col.id}>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 truncate" title={col.name}>
                                        {col.name}
                                    </label>
                                    
                                    {col.type === 'rating' && (
                                        <input
                                            type="number"
                                            max={col.max || 10}
                                            min={col.min || 0}
                                            value={item.values[col.id] || 0}
                                            onChange={(e) => updateItemValue(item.id, col.id, Number(e.target.value))}
                                            className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                        />
                                    )}

                                    {col.type === 'text' && (
                                        <input
                                            type="text"
                                            value={item.values[col.id] || ''}
                                            onChange={(e) => updateItemValue(item.id, col.id, e.target.value)}
                                            className="w-full text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                        />
                                    )}
                                    
                                    {/* Add support for other types if your schema supports them */}
                                </div>
                            );
                        })}
                    </div>
                </div>
                ))}
            </div>
            </div>
        ))}
        </div>
    );
}

export default GuiTab;