import React, { useCallback, useMemo, useState } from 'react'
import { FolderPlus } from 'lucide-react';

import { Category, TierList } from '@/lib/types';
import { tierlistData } from '@/data/tierlists-combined';

interface Props {
    data: TierList;
    createdCategories: Category[];
    setData: React.Dispatch<React.SetStateAction<TierList>>;
    setCreatedCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const GeneralTab = ({ data, createdCategories, setData, setCreatedCategories }: Props) => {
    const [showCategoryCreator, setShowCategoryCreator] = useState(false);
    const [newCatForm, setNewCatForm] = useState({ name: '', id: '', parentId: '' });

    const allCategories = useMemo(() => {
        const existingCats = tierlistData.filter((n): n is Category => n.type === 'category');
        return [...existingCats, ...createdCategories];
    }, [createdCategories]);

    const getHierarchicalOptions = useCallback((parentId: string | null = null, level = 0): { node: Category, level: number }[] => {
        const children = allCategories.filter(c => c.parentId === parentId);
        let result: { node: Category, level: number }[] = [];
        
        children.forEach(child => {
        result.push({ node: child, level });
        // Recursively get children of this child
        result = [...result, ...getHierarchicalOptions(child.id, level + 1)];
        });

        return result;
    }, [allCategories]);

    const categoryOptions = useMemo(() => getHierarchicalOptions(null, 0), [getHierarchicalOptions]);

    const updateField = (field: keyof TierList, value: string | null) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleCreateCategory = () => {
        if (!newCatForm.name || !newCatForm.id) return alert("Name and ID are required");
        
        const newCategory: Category = {
        id: newCatForm.id,
        name: newCatForm.name,
        description: `Container for ${newCatForm.name}`,
        parentId: newCatForm.parentId || null,
        children: [], // Will be populated during code generation
        type: 'category'
        };

        setCreatedCategories([...createdCategories, newCategory]);
        
        // Auto-select this new category as the parent for the tierlist?
        // Let's just reset the form and let user decide
        setNewCatForm({ name: '', id: '', parentId: '' });
        setShowCategoryCreator(false);
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">General Information</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">Basic details about your new tierlist.</p>
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
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Parent Category</label>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Where should this tierlist live?</p>
                        </div>
                        <button 
                            onClick={() => setShowCategoryCreator(!showCategoryCreator)}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                            {showCategoryCreator ? 'Cancel' : <><FolderPlus className="w-4 h-4"/> Create New Category</>}
                        </button>
                    </div>

                    {/* Inline Category Creator */}
                    {showCategoryCreator && (
                        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800/30 mb-6 animate-fade-in">
                            <h3 className="font-semibold text-sm mb-4 text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                                <FolderPlus className="w-4 h-4" /> Create Folder Structure
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block">Category Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Horror Movies"
                                        value={newCatForm.name}
                                        onChange={e => setNewCatForm({...newCatForm, name: e.target.value, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block">Category ID</label>
                                    <input 
                                        type="text" 
                                        value={newCatForm.id}
                                        onChange={e => setNewCatForm({...newCatForm, id: e.target.value})}
                                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 block">Place inside...</label>
                                <select 
                                    value={newCatForm.parentId}
                                    onChange={e => setNewCatForm({...newCatForm, parentId: e.target.value})}
                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                >
                                    <option value="">(Root Level)</option>
                                    {categoryOptions.map(({ node, level }) => (
                                        <option key={node.id} value={node.id}>
                                            {'\u00A0'.repeat(level * 4)} {level > 0 ? '└ ' : ''} {node.name} {createdCategories.find(c => c.id === node.id) ? '(New)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={handleCreateCategory} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-all active:scale-95">
                                    Create Category
                                </button>
                            </div>
                        </div>
                    )}

                    {/* The Main Parent Picker */}
                    <div className="relative">
                        <select 
                            value={data.parentId || ''} 
                            onChange={(e) => updateField('parentId', e.target.value || null)}
                            className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-sm appearance-none"
                        >
                            <option value="">None (Root Level)</option>
                            {categoryOptions.map(({ node, level }) => (
                            <option key={node.id} value={node.id}>
                                {/* Visual indentation using non-breaking spaces */}
                                {'\u00A0'.repeat(level * 4)} {level > 0 ? '└ ' : ''} {node.name} {createdCategories.find(c => c.id === node.id) ? '(New)' : ''}
                            </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GeneralTab;