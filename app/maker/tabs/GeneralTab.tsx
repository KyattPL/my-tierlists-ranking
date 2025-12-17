import React, { useCallback, useMemo, useState } from 'react'
import { FolderPlus } from 'lucide-react';

import { Category, TierList } from '@/components/TierListShared';
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
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-6">General Information</h2>
            
            <div className="space-y-2">
            <label className="block text-sm font-medium">Tierlist ID (Filename)</label>
            <input type="text" value={data.id} onChange={(e) => updateField('id', e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div className="space-y-2">
            <label className="block text-sm font-medium">Display Name</label>
            <input type="text" value={data.name} onChange={(e) => updateField('name', e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea value={data.description || ''} onChange={(e) => updateField('description', e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" rows={3} />
            </div>

            <div className="border-t dark:border-gray-700 pt-6 mt-6">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Parent Category</label>
                <button 
                    onClick={() => setShowCategoryCreator(!showCategoryCreator)}
                    className="text-sm text-blue-500 hover:underline flex items-center gap-1"
                >
                    {showCategoryCreator ? 'Cancel' : <><FolderPlus className="w-4 h-4"/> Create New Category</>}
                </button>
            </div>

            {/* Inline Category Creator */}
            {showCategoryCreator && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                    <h3 className="font-bold text-sm mb-3 text-blue-800 dark:text-blue-200">Create New Folder Structure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="text-xs text-gray-500">New Category Name</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Horror Movies"
                                value={newCatForm.name}
                                onChange={e => setNewCatForm({...newCatForm, name: e.target.value, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                                className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">New Category ID</label>
                            <input 
                                type="text" 
                                value={newCatForm.id}
                                onChange={e => setNewCatForm({...newCatForm, id: e.target.value})}
                                className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="text-xs text-gray-500">Place inside...</label>
                        <select 
                            value={newCatForm.parentId}
                            onChange={e => setNewCatForm({...newCatForm, parentId: e.target.value})}
                            className="w-full p-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="">(Root Level)</option>
                            {categoryOptions.map(({ node, level }) => (
                                <option key={node.id} value={node.id}>
                                    {'\u00A0'.repeat(level * 4)} {level > 0 ? '└ ' : ''} {node.name} {createdCategories.find(c => c.id === node.id) ? '(New)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleCreateCategory} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
                        Add Category
                    </button>
                </div>
            )}

            {/* The Main Parent Picker */}
            <select 
                value={data.parentId || ''} 
                onChange={(e) => updateField('parentId', e.target.value || null)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
            >
                <option value="">None (Root Level)</option>
                {categoryOptions.map(({ node, level }) => (
                <option key={node.id} value={node.id}>
                    {/* Visual indentation using non-breaking spaces */}
                    {'\u00A0'.repeat(level * 4)} {level > 0 ? '└ ' : ''} {node.name} {createdCategories.find(c => c.id === node.id) ? '(New)' : ''}
                </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
                Select where this tierlist belongs. You can create a new folder structure above.
            </p>
            </div>
        </div>
    );
}

export default GeneralTab;