import { Plus, Trash2 } from 'lucide-react';
import React from 'react'
import { TierList } from '@/components/TierListShared';

interface Props {
    data: TierList;
    setData: React.Dispatch<React.SetStateAction<TierList>>;
}

const SchemaTab = ({ data, setData }: Props) => {
    const addSchemaColumn = () => {
        const newId = `col_${Date.now()}`;
        setData(prev => ({ ...prev, schema: [...prev.schema, { id: newId, name: 'New Column', type: 'text' }] }));
    };

    const removeSchemaColumn = (id: string) => {
        setData(prev => ({ ...prev, schema: prev.schema.filter(c => c.id !== id) }));
    };

    const updateSchemaColumn = (id: string, field: string, value: string | number) => {
        setData(prev => ({ ...prev, schema: prev.schema.map(c => c.id === id ? { ...c, [field]: value } : c) }));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Table Schema</h2>
            <button onClick={addSchemaColumn} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Column
            </button>
            </div>

            <div className="space-y-4">
            {data.schema.map((col) => (
                <div key={col.id} className="bg-white dark:bg-gray-800 p-4 rounded border dark:border-gray-700 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <div>
                    <label className="text-xs text-gray-500">Column ID</label>
                    <input type="text" value={col.id} onChange={(e) => updateSchemaColumn(col.id, 'id', e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                    <label className="text-xs text-gray-500">Display Name</label>
                    <input type="text" value={col.name} onChange={(e) => updateSchemaColumn(col.id, 'name', e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                    <label className="text-xs text-gray-500">Type</label>
                    <select value={col.type} onChange={(e) => updateSchemaColumn(col.id, 'type', e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option value="text">Text</option>
                        <option value="rating">Rating (Stars)</option>
                        <option value="tier">Tier (S-F)</option>
                    </select>
                    </div>
                </div>
                
                {col.type === 'rating' && (
                    <>
                        <div className="w-24">
                            <label className="text-xs text-gray-500">Max</label>
                            <input type="number" value={col.max || 10} onChange={(e) => updateSchemaColumn(col.id, 'max', parseInt(e.target.value))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div className="w-24">
                            <label className="text-xs text-gray-500">Min</label>
                            <input type="number" value={col.min || 0} onChange={(e) => updateSchemaColumn(col.id, 'min', parseInt(e.target.value))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </>
                )}

                <button onClick={() => removeSchemaColumn(col.id)} className="text-red-500 hover:bg-red-50 p-2 rounded self-end md:self-center">
                    <Trash2 className="w-5 h-5" />
                </button>
                </div>
            ))}
        </div>
    </div>
  )
}

export default SchemaTab