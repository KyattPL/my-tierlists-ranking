import { Plus, Trash2, ArrowDown, Database, LayoutTemplate } from 'lucide-react';
import React from 'react'
import { TierList } from '@/lib/types';
import { SCHEMA_PRESETS } from '../presets';

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

    const loadPreset = (presetId: string) => {
        const preset = SCHEMA_PRESETS.find(p => p.id === presetId);
        if (!preset) return;

        if (data.schema.length > 0) {
            if (!confirm("Loading a preset will replace your current schema. Continue?")) {
                return;
            }
        }
        
        // Deep copy the preset schema to avoid reference issues
        const newSchema = JSON.parse(JSON.stringify(preset.schema));
        setData(prev => ({ ...prev, schema: newSchema }));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Schema</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Define the columns and data types for your tierlist.</p>
                </div>
                <button 
                    onClick={addSchemaColumn} 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm font-medium transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Add Column
                </button>
            </div>

            {/* Presets Section */}
            <div className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4" />
                    Quick Presets
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {SCHEMA_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => loadPreset(preset.id)}
                            className="text-left p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-sm transition-all group"
                        >
                            <div className="font-medium text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {preset.name}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                                {preset.description}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {data.schema.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Database className="w-6 h-6 text-zinc-400" />
                        </div>
                        <h3 className="text-zinc-900 dark:text-zinc-100 font-medium">No columns defined</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Add a column to start structuring your data.</p>
                    </div>
                )}

                {data.schema.map((col) => (
                    <div key={col.id} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center group transition-all hover:border-indigo-300 dark:hover:border-indigo-800">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 w-full items-center">
                            
                            {/* ID Field */}
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 block">Column ID</label>
                                <input 
                                    type="text" 
                                    value={col.id} 
                                    onChange={(e) => updateSchemaColumn(col.id, 'id', e.target.value)} 
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-sm text-zinc-600 dark:text-zinc-300" 
                                />
                            </div>

                            {/* Name Field */}
                            <div className="md:col-span-4">
                                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 block">Display Name</label>
                                <input 
                                    type="text" 
                                    value={col.name} 
                                    onChange={(e) => updateSchemaColumn(col.id, 'name', e.target.value)} 
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-zinc-900 dark:text-zinc-100" 
                                />
                            </div>

                            {/* Type Field */}
                            <div className="md:col-span-3">
                                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 block">Type</label>
                                <div className="relative">
                                    <select 
                                        value={col.type} 
                                        onChange={(e) => updateSchemaColumn(col.id, 'type', e.target.value)} 
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none text-sm font-medium text-zinc-700 dark:text-zinc-300"
                                    >
                                        <option value="text">Text</option>
                                        <option value="rating">Rating (Stars)</option>
                                        <option value="tier">Tier (S-F)</option>
                                    </select>
                                    <ArrowDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Extra Options (Min/Max) */}
                            <div className="md:col-span-2 flex gap-2">
                                {col.type === 'rating' && (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 block">Min</label>
                                            <input 
                                                type="number" 
                                                value={col.min || 0} 
                                                onChange={(e) => updateSchemaColumn(col.id, 'min', parseInt(e.target.value))} 
                                                className="w-full px-2 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-center" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 block">Max</label>
                                            <input 
                                                type="number" 
                                                value={col.max || 10} 
                                                onChange={(e) => updateSchemaColumn(col.id, 'max', parseInt(e.target.value))} 
                                                className="w-full px-2 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-center" 
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => removeSchemaColumn(col.id)} 
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-6 md:mt-0"
                            title="Remove Column"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SchemaTab;
