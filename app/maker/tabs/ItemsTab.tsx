import { TierListDraft } from '@/lib/types';
import { ArrowDown, ArrowUp, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import React from 'react';

interface Props {
    data: TierListDraft;
    setData: React.Dispatch<React.SetStateAction<TierListDraft>>;
}

const ItemsTab = ({ data, setData }: Props) => {

    const addItem = () => {
        const newItemId = `item_${Date.now()}`;
        const initialValues: Record<string, string | number> = {};
        data.schema.forEach(col => {
        if (col.type === 'tier') initialValues[col.id] = 'B';
        if (col.type === 'rating') initialValues[col.id] = 5;
        if (col.type === 'text') initialValues[col.id] = '';
        });
        setData(prev => ({ ...prev, items: [...prev.items, { id: newItemId, name: 'New Item', values: initialValues }] }));
    };

    const removeItem = (id: string) => {
        setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
    };

    const updateItem = (id: string, field: 'name' | 'imageUrl' | 'values', value: string | number, valueKey?: string) => {
        setData(prev => ({
        ...prev,
        items: prev.items.map(item => {
            if (item.id !== id) return item;
            if (field === 'values' && valueKey) {
            return { ...item, values: { ...item.values, [valueKey]: value } };
            }
            return { ...item, [field]: value as string };
        })
        }));
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === data.items.length - 1) return;

        const newItems = [...data.items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        // Swap elements
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        
        setData(prev => ({ ...prev, items: newItems }));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Items</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage the items you want to rank.</p>
                </div>
                <button 
                    onClick={addItem} 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm font-medium transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add Item
                </button>
            </div>

            <div className="space-y-3">
                {data.items.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Plus className="w-6 h-6 text-zinc-400" />
                        </div>
                        <h3 className="text-zinc-900 dark:text-zinc-100 font-medium">No items yet</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Click the &quot;Add Item&quot; button to get started.</p>
                    </div>
                )}

                {data.items.map((item, index) => (
                    <div key={item.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex gap-4 items-start group transition-all hover:border-indigo-300 dark:hover:border-indigo-800">
                        {/* Drag/Order Controls */}
                        <div className="flex flex-col gap-1 pt-1">
                            <button 
                                onClick={() => moveItem(index, 'up')} 
                                disabled={index === 0}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-30 transition-colors"
                            >
                                <ArrowUp className="w-4 h-4" />
                            </button>
                            <div className="w-6 h-6 flex items-center justify-center text-xs font-mono text-zinc-400 font-medium bg-zinc-50 dark:bg-zinc-800 rounded">
                                {index + 1}
                            </div>
                            <button 
                                onClick={() => moveItem(index, 'down')} 
                                disabled={index === data.items.length - 1}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-30 transition-colors"
                            >
                                <ArrowDown className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Name</label>
                                    <input 
                                        type="text" 
                                        value={item.name} 
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)} 
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-zinc-900 dark:text-zinc-100" 
                                        placeholder="Item Name"
                                    />
                                </div>
                                <div className="flex-1 space-y-1.5">
                                    <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                        <ImageIcon className="w-3 h-3" /> Image URL
                                    </label>
                                    <input 
                                        type="text" 
                                        value={item.imageUrl || ''} 
                                        onChange={(e) => updateItem(item.id, 'imageUrl', e.target.value)} 
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-zinc-600 dark:text-zinc-300" 
                                        placeholder="/images/..."
                                    />
                                </div>
                            </div>

                            {/* Dynamic Fields Grid */}
                            {data.schema.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    {data.schema.map(col => (
                                        <div key={col.id} className="space-y-1">
                                            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase truncate block" title={col.name}>{col.name}</label>
                                            {col.type === 'tier' ? (
                                                <div className="relative">
                                                    <select 
                                                        value={item.values[col.id] || 'B'} 
                                                        onChange={(e) => updateItem(item.id, 'values', e.target.value, col.id)}
                                                        className="w-full pl-2 pr-6 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-sm focus:border-indigo-500 focus:ring-0 appearance-none font-medium"
                                                    >
                                                        {(col.options || ['S','A','B','C','D','F']).map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                    <ArrowDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                                </div>
                                            ) : col.type === 'rating' ? (
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        max={col.max || 10}
                                                        min={0}
                                                        value={item.values[col.id] || 0} 
                                                        onChange={(e) => updateItem(item.id, 'values', parseFloat(e.target.value), col.id)}
                                                        className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-sm focus:border-indigo-500 focus:ring-0"
                                                    />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">/{col.max || 10}</span>
                                                </div>
                                            ) : (
                                                <input 
                                                    type="text" 
                                                    value={item.values[col.id] || ''} 
                                                    onChange={(e) => updateItem(item.id, 'values', e.target.value, col.id)}
                                                    className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-sm focus:border-indigo-500 focus:ring-0"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <button 
                            onClick={() => removeItem(item.id)} 
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors self-start"
                            title="Remove Item"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ItemsTab;
