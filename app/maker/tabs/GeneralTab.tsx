import React from 'react';

import { TierListDraft } from '@/lib/types';
import { TIERLIST_PRESETS } from '../presets';

interface Props {
    data: TierListDraft;
    setData: React.Dispatch<React.SetStateAction<TierListDraft>>;
}

const DEFAULT_TIERLIST_ID = 'new-tierlist';
const DEFAULT_TIERLIST_NAME = 'New Tierlist';

const GeneralTab = ({ data, setData }: Props) => {
    const updateField = (field: keyof TierListDraft, value: string) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const isDefaultSchema = data.schema.length === 3 && data.schema.every(col => {
        if (col.id === 'tier' && col.type === 'tier') return true;
        if (col.id === 'rating' && col.type === 'rating') return true;
        if (col.id === 'notes' && col.type === 'text') return true;
        return false;
    });

    const hasUserChanges = data.items.length > 0
        || data.name !== DEFAULT_TIERLIST_NAME
        || data.id !== DEFAULT_TIERLIST_ID
        || (data.description ?? '') !== ''
        || !isDefaultSchema;

    const applyTierlistPreset = (preset: typeof TIERLIST_PRESETS[number]) => {
        if (hasUserChanges) {
            const confirmed = confirm("Applying a preset will replace your current schema and reset items. Continue?");
            if (!confirmed) return;
        }

        const schemaCopy = JSON.parse(JSON.stringify(preset.schema));

        setData(prev => ({
            ...prev,
            name: preset.defaults?.name ?? prev.name,
            id: preset.defaults?.id ?? prev.id,
            description: preset.defaults?.description ?? prev.description,
            schema: schemaCopy,
            items: []
        }));
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">General Information</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">Basic details about your new tierlist.</p>
            </div>

            <div className="mb-8">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">Tierlist Presets</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TIERLIST_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => applyTierlistPreset(preset)}
                            className="text-left p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-sm transition-all"
                        >
                            <div className="font-medium text-zinc-900 dark:text-zinc-100 text-sm">
                                {preset.name}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                                {preset.description}
                            </div>
                            {preset.defaults && (
                                <div className="mt-2 text-[11px] text-zinc-400 space-y-1">
                                    {preset.defaults.name && (
                                        <div>Default name: {preset.defaults.name}</div>
                                    )}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Display Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            value={data.name} 
                            onChange={(e) => updateField('name', e.target.value)} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-zinc-100"
                            placeholder="e.g. Best Horror Movies" 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Tierlist ID (Filename) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={data.id} 
                                onChange={(e) => updateField('id', e.target.value)} 
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-sm dark:text-zinc-100" 
                                placeholder="best-horror-movies"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                                <span className="text-xs border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900">.json</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                    <textarea 
                        value={data.description || ''} 
                        onChange={(e) => updateField('description', e.target.value)} 
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-zinc-100 min-h-[100px] resize-y" 
                        placeholder="Briefly describe what this tierlist is about..."
                    />
                </div>

                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
                        Folder structure defines the Library hierarchy. Place the downloaded JSON anywhere under <span className="font-mono">data/tierlists</span> and folders become categories automatically.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GeneralTab;
