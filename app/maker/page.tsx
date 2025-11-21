"use client"

import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Trash2, Copy, ArrowLeft, Code, Eye, Settings, Database, FolderPlus } from 'lucide-react';
import Link from 'next/link';
import { TierList, TierlistView, Category } from '@/app/page';
import { tierlistData } from '@/data/tierlists-combined';

// --- Types & Helpers ---

const DEFAULT_SCHEMA = [
  { id: "tier", name: "Tier", type: "tier" as const, options: ["S", "A", "B", "C", "D", "F"] },
  { id: "rating", name: "Rating", type: "rating" as const, max: 10 },
  { id: "notes", name: "Notes", type: "text" as const }
];

// Helper to convert "my-folder-name" to "myFolderName" or "my_folder_name" for variables
const toVarName = (id: string) => id.replace(/-([a-z])/g, (g) => g[1].toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');

export default function TierlistMaker() {
  const [activeTab, setActiveTab] = useState<'general' | 'schema' | 'items' | 'preview' | 'code'>('general');
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);

  // 1. State for the new Tierlist
  const [data, setData] = useState<TierList>({
    id: 'new-tierlist',
    name: 'New Tierlist',
    description: '',
    parentId: null,
    type: 'list',
    children: [],
    schema: DEFAULT_SCHEMA,
    items: []
  });

  // 2. State for NEW Categories created in this session
  const [createdCategories, setCreatedCategories] = useState<Category[]>([]);
  
  // Temporary state for the "Add Category" form
  const [newCatForm, setNewCatForm] = useState({ name: '', id: '', parentId: '' });

  // --- Hierarchy Logic ---

  // Combine existing static data with the new categories created in this session
  const allCategories = useMemo(() => {
    const existingCats = tierlistData.filter((n): n is Category => n.type === 'category');
    return [...existingCats, ...createdCategories];
  }, [createdCategories]);

  // Recursive function to build a flat list with depth (level) for the dropdown
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

  // --- Handlers ---

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

  // ... (Schema and Item handlers remain the same as previous version)
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

  // --- Code Generation ---

  const generateCode = () => {
    let output = `import { Category, TierList } from "@/app/page";\n\n`;
    const exportNames: string[] = [];

    // 1. Generate code for NEW Categories
    createdCategories.forEach(cat => {
      const varName = toVarName(cat.id);
      exportNames.push(varName);

      // Calculate children for this category based on current session state
      // A child is either another NEW category whose parent is this cat...
      const childCats = createdCategories.filter(c => c.parentId === cat.id).map(c => c.id);
      // ...OR the Tierlist itself if its parent is this cat
      if (data.parentId === cat.id) {
        childCats.push(data.id);
      }

      const catObj = { ...cat, children: childCats };
      output += `const ${varName}: Category = ${JSON.stringify(catObj, null, 2)};\n\n`;
    });

    // 2. Generate code for the TierList
    const listVarName = toVarName(data.id);
    exportNames.push(listVarName);
    output += `const ${listVarName}: TierList = ${JSON.stringify(data, null, 2)};\n\n`;

    // 3. Export statement
    output += `export const ${toVarName(data.id)}Data = [${exportNames.join(', ')}];`;

    return output;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateCode());
    alert("Code copied!");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Tierlist Maker</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('preview')} className={`px-3 py-2 rounded flex items-center gap-2 ${activeTab === 'preview' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            <Eye className="w-4 h-4" /> <span className="hidden sm:inline">Preview</span>
          </button>
          <button onClick={() => setActiveTab('code')} className={`px-3 py-2 rounded flex items-center gap-2 ${activeTab === 'code' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            <Code className="w-4 h-4" /> <span className="hidden sm:inline">Get Code</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-16 sm:w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
          <nav className="p-2 space-y-1">
            <button onClick={() => setActiveTab('general')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${activeTab === 'general' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <Settings className="w-5 h-5" /> <span className="hidden sm:inline font-medium">General Info</span>
            </button>
            <button onClick={() => setActiveTab('schema')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${activeTab === 'schema' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <Database className="w-5 h-5" /> <span className="hidden sm:inline font-medium">Schema</span>
            </button>
            <button onClick={() => setActiveTab('items')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${activeTab === 'items' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <Plus className="w-5 h-5" /> <span className="hidden sm:inline font-medium">Items</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          
          {/* 1. General Info Tab */}
          {activeTab === 'general' && (
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
          )}

          {/* 2. Schema Tab */}
          {activeTab === 'schema' && (
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
                       <div className="w-24">
                         <label className="text-xs text-gray-500">Max Stars</label>
                         <input type="number" value={col.max || 10} onChange={(e) => updateSchemaColumn(col.id, 'max', parseInt(e.target.value))} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                       </div>
                    )}

                    <button onClick={() => removeSchemaColumn(col.id)} className="text-red-500 hover:bg-red-50 p-2 rounded self-end md:self-center">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Items Tab */}
          {activeTab === 'items' && (
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Items ({data.items.length})</h2>
                <button onClick={addItem} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {data.items.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded border dark:border-gray-700">
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
          )}

          {/* 4. Preview Tab */}
          {activeTab === 'preview' && (
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Live Preview</h2>
              <div className="border p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                <TierlistView 
                  tierlist={data} 
                  viewMode="tier" 
                  sortConfig={null} 
                  onSort={() => {}} 
                />
              </div>
              <div className="mt-8 border p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                <TierlistView 
                  tierlist={data} 
                  viewMode="table" 
                  sortConfig={null} 
                  onSort={() => {}} 
                />
              </div>
            </div>
          )}

          {/* 5. Code Export Tab */}
          {activeTab === 'code' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Export Code</h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded mb-6">
                <h3 className="font-bold text-yellow-800 dark:text-yellow-200">Instructions:</h3>
                <ol className="list-decimal list-inside text-sm text-yellow-800 dark:text-yellow-200 mt-2 space-y-1">
                  <li>Click the <strong>Copy Code</strong> button below.</li>
                  <li>Create a new file: <code>data/{data.id}.ts</code>.</li>
                  <li>Paste the code.</li>
                  <li>Open <code>data/tierlists-combined.ts</code>.</li>
                  <li>Import: <code>import {'{'} {toVarName(data.id)}Data {'}'} from &quot;./{data.id}&quot;;</code></li>
                  <li>Add to array: <code>...{toVarName(data.id)}Data</code></li>
                  {data.parentId && !createdCategories.find(c => c.id === data.parentId) && (
                    <li className="font-bold text-red-600 dark:text-red-400 mt-2">
                        IMPORTANT: You selected an EXISTING parent category ({data.parentId}). 
                        You must manually open the file containing that category and add &quot;{data.id}&quot; to its children array!
                    </li>
                  )}
                </ol>
              </div>

              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto text-sm font-mono">
                  {generateCode()}
                </pre>
                <button 
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow-lg"
                >
                  <Copy className="w-4 h-4" /> Copy Code
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}