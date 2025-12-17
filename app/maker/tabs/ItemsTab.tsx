import { TierList } from '@/components/TierListShared';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import React from 'react';

interface Props {
    data: TierList;
    setData: React.Dispatch<React.SetStateAction<TierList>>;
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
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Items ({data.items.length})</h2>
            <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Item
            </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
            {data.items.map((item, index) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded border dark:border-gray-700 relative group">
                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-center items-center gap-1 bg-gray-50 dark:bg-gray-900/30 rounded-l border-r dark:border-gray-700">
                    <button 
                        onClick={() => moveItem(index, 'up')} 
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                    >
                        <ArrowUp className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono text-gray-400">{index + 1}</span>
                    <button 
                        onClick={() => moveItem(index, 'down')} 
                        disabled={index === data.items.length - 1}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                    >
                        <ArrowDown className="w-4 h-4" />
                    </button>
                </div>
                <div className="pl-6">
                    <div className="flex justify-between mb-4">
                    <div className="flex-1 mr-4">
                        <label className="text-xs text-gray-500">Item Name</label>
                        <input 
                        type="text" 
                        value={item.name} 
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)} 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 font-bold" 
                        />
                    </div>
                    <div className="flex-1 mr-4">
                        <label className="text-xs text-gray-500">Image Path</label>
                        <input 
                        type="text" 
                        value={item.imageUrl || ''} 
                        onChange={(e) => updateItem(item.id, 'imageUrl', e.target.value)} 
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm" 
                        placeholder="/images/..."
                        />
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded h-10 mt-5">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                    {data.schema.map(col => (
                    <div key={col.id}>
                        <label className="text-xs text-gray-500 block mb-1">{col.name}</label>
                        {col.type === 'tier' ? (
                        <select 
                            value={item.values[col.id] || 'B'} 
                            onChange={(e) => updateItem(item.id, 'values', e.target.value, col.id)}
                            className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                            {(col.options || ['S','A','B','C','D','F']).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        ) : col.type === 'rating' ? (
                        <input 
                            type="number" 
                            max={col.max || 10}
                            min={0}
                            value={item.values[col.id] || 0} 
                            onChange={(e) => updateItem(item.id, 'values', parseFloat(e.target.value), col.id)}
                            className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        ) : (
                        <input 
                            type="text" 
                            value={item.values[col.id] || ''} 
                            onChange={(e) => updateItem(item.id, 'values', e.target.value, col.id)}
                            className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        )}
                    </div>
                    ))}
                </div>
                </div>
            ))}
            </div>
        </div>
    );
}

export default ItemsTab;