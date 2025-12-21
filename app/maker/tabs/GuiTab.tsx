import React, { useState, useMemo, useCallback } from 'react';
import { GripVertical, X, Plus, Trash2, ChevronDown, ChevronRight, FolderPlus } from 'lucide-react';
import { TierList, Category } from '@/components/TierListShared';
import { tierlistData } from '@/data/tierlists-combined';

interface Props {
  data: TierList;
  setData: React.Dispatch<React.SetStateAction<TierList>>;
  createdCategories: Category[];
  setCreatedCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const CompactGuiTab = ({ data, setData, createdCategories, setCreatedCategories }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarSection, setSidebarSection] = useState<'general' | 'schema'>('general');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverTier, setDragOverTier] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<{ id: string; position: 'before' | 'after' } | null>(null);
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [newCatForm, setNewCatForm] = useState({ name: '', id: '', parentId: '' });

  const tierColumn = useMemo(() => data.schema.find(c => c.type === 'tier'), [data.schema]);

  const allCategories = useMemo(() => {
    const existingCats = tierlistData.filter((n): n is Category => n.type === 'category');
    return [...existingCats, ...createdCategories];
  }, [createdCategories]);

  const getHierarchicalOptions = useCallback((parentId: string | null = null, level = 0): { node: Category, level: number }[] => {
    const children = allCategories.filter(c => c.parentId === parentId);
    let result: { node: Category, level: number }[] = [];
    
    children.forEach(child => {
      result.push({ node: child, level });
      result = [...result, ...getHierarchicalOptions(child.id, level + 1)];
    });

    return result;
  }, [allCategories]);

  const categoryOptions = useMemo(() => getHierarchicalOptions(null, 0), [getHierarchicalOptions]);

  const groupedItems = useMemo(() => {
    if (!tierColumn?.options) return {};
    const map: Record<string, TierList['items']> = {};
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

  const addItem = (tier: string) => {
    const id = `item_${Date.now()}`;
    const values: Record<string, string | number> = {};
    data.schema.forEach(col => {
      if (col.type === 'tier') values[col.id] = tier;
      else if (col.type === 'rating') values[col.id] = col.min || 0;
      else values[col.id] = '';
    });
    setData(prev => ({ ...prev, items: [...prev.items, { id, name: 'New Item', values }] }));
  };

  const deleteItem = (id: string) => {
    setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const updateItemValue = (itemId: string, key: string, value: string | number) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, values: { ...i.values, [key]: value } } : i)
    }));
  };

  const updateItemName = (itemId: string, name: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, name } : i)
    }));
  };

  const addSchemaColumn = () => {
    const newId = `col_${Date.now()}`;
    setData(prev => ({ ...prev, schema: [...prev.schema, { id: newId, name: 'New Field', type: 'text' }] }));
  };

  const removeSchemaColumn = (id: string) => {
    setData(prev => ({ ...prev, schema: prev.schema.filter(c => c.id !== id) }));
  };

  const updateSchemaColumn = (id: string, field: string, value: string | number) => {
    setData(prev => ({ ...prev, schema: prev.schema.map(c => c.id === id ? { ...c, [field]: value } : c) }));
  };

  const handleCreateCategory = () => {
    if (!newCatForm.name || !newCatForm.id) {
      alert("Name and ID are required");
      return;
    }
    
    const newCategory: Category = {
      id: newCatForm.id,
      name: newCatForm.name,
      description: `Container for ${newCatForm.name}`,
      parentId: newCatForm.parentId || null,
      children: [],
      type: 'category'
    };

    setCreatedCategories([...createdCategories, newCategory]);
    setNewCatForm({ name: '', id: '', parentId: '' });
    setShowCategoryCreator(false);
  };

  if (!tierColumn?.options) {
    return (
      <div className="p-8 max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-300 rounded">
        <h2 className="font-bold text-red-700 dark:text-red-300">GUI Maker unavailable</h2>
        <p className="text-sm mt-2">
          A Tier column (type: <code>tier</code>) is required to use GUI Maker.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden flex flex-col`}>
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setSidebarSection('general')}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                sidebarSection === 'general'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setSidebarSection('schema')}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                sidebarSection === 'schema'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Schema
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {sidebarSection === 'general' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tierlist ID</label>
                <input
                  type="text"
                  value={data.id}
                  onChange={(e) => setData(prev => ({ ...prev, id: e.target.value }))}
                  className="w-full px-2 py-1.5 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-2 py-1.5 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-2 py-1.5 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
              
              <div className="border-t dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Parent Category</label>
                  <button 
                    onClick={() => setShowCategoryCreator(!showCategoryCreator)}
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  >
                    {showCategoryCreator ? 'Cancel' : <><FolderPlus className="w-3 h-3"/> New</>}
                  </button>
                </div>

                {showCategoryCreator && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-3">
                    <h3 className="font-bold text-xs mb-2 text-blue-800 dark:text-blue-200">Create New Category</h3>
                    <div className="space-y-2 mb-2">
                      <input 
                        type="text" 
                        placeholder="Category Name"
                        value={newCatForm.name}
                        onChange={e => setNewCatForm({...newCatForm, name: e.target.value, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                        className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                      <input 
                        type="text"
                        placeholder="category-id"
                        value={newCatForm.id}
                        onChange={e => setNewCatForm({...newCatForm, id: e.target.value})}
                        className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                      <select 
                        value={newCatForm.parentId}
                        onChange={e => setNewCatForm({...newCatForm, parentId: e.target.value})}
                        className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="">(Root Level)</option>
                        {categoryOptions.map(({ node, level }) => (
                          <option key={node.id} value={node.id}>
                            {'\u00A0'.repeat(level * 4)} {level > 0 ? '└ ' : ''} {node.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={handleCreateCategory} 
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 w-full"
                    >
                      Create
                    </button>
                  </div>
                )}

                <select
                  value={data.parentId || ''}
                  onChange={(e) => setData(prev => ({ ...prev, parentId: e.target.value || null }))}
                  className="w-full px-2 py-1.5 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="">None (Root Level)</option>
                  {categoryOptions.map(({ node, level }) => (
                    <option key={node.id} value={node.id}>
                      {'\u00A0'.repeat(level * 4)} {level > 0 ? '└ ' : ''} {node.name} {createdCategories.find(c => c.id === node.id) ? '(New)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Fields</h3>
                <button
                  onClick={addSchemaColumn}
                  className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              {data.schema.map(col => (
                <div key={col.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border dark:border-gray-600">
                  <div className="flex justify-between items-start mb-2">
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => updateSchemaColumn(col.id, 'name', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm font-medium border rounded dark:bg-gray-800 dark:border-gray-600 mr-2"
                    />
                    <button
                      onClick={() => removeSchemaColumn(col.id)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold">ID</label>
                      <input
                        type="text"
                        value={col.id}
                        onChange={(e) => updateSchemaColumn(col.id, 'id', e.target.value)}
                        className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase font-bold">Type</label>
                      <select
                        value={col.type}
                        onChange={(e) => updateSchemaColumn(col.id, 'type', e.target.value)}
                        className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600"
                      >
                        <option value="text">Text</option>
                        <option value="rating">Rating</option>
                        <option value="tier">Tier</option>
                      </select>
                    </div>
                    {col.type === 'rating' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold">Min</label>
                          <input
                            type="number"
                            value={col.min || 0}
                            onChange={(e) => updateSchemaColumn(col.id, 'min', parseInt(e.target.value))}
                            className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold">Max</label>
                          <input
                            type="number"
                            value={col.max || 10}
                            onChange={(e) => updateSchemaColumn(col.id, 'max', parseInt(e.target.value))}
                            className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {sidebarOpen ? <ChevronDown className="w-5 h-5 rotate-90" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-xl font-bold">{data.name}</h1>
              {data.description && <p className="text-xs text-gray-500">{data.description}</p>}
            </div>
          </div>
        </div>

        {/* Tier Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {tierColumn.options.map(tier => (
              <div
                key={tier}
                className="flex flex-col bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm"
              >
                {/* Tier Header */}
                <div className="p-3 border-b dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{tier}</h3>
                    <button
                      onClick={() => addItem(tier)}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Items Container */}
                <div
                  className={`flex-1 p-2 min-h-[200px] space-y-2 transition-colors ${
                    dragOverTier === tier ? 'bg-blue-50 dark:bg-blue-900/20' : ''
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
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">
                      Empty
                    </div>
                  )}

                  {groupedItems[tier]?.map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggingId(item.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOverItem(null);
                        setDragOverTier(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggingId === item.id) return;

                        const dragIndex = groupedItems[tier].findIndex(i => i.id === draggingId);
                        const hoverIndex = groupedItems[tier].findIndex(i => i.id === item.id);

                        if (dragIndex !== -1 && hoverIndex !== -1) {
                          setDragOverItem({
                            id: item.id,
                            position: dragIndex < hoverIndex ? 'after' : 'before'
                          });
                        } else {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          const midpoint = rect.top + rect.height / 2;
                          setDragOverItem({
                            id: item.id,
                            position: e.clientY < midpoint ? 'before' : 'after'
                          });
                        }
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
                      className={`relative p-2 rounded bg-white dark:bg-gray-900 border cursor-move group transition-all ${
                        draggingId === item.id ? 'opacity-40' : ''
                      } ${
                        dragOverItem?.id === item.id
                          ? 'ring-2 ring-blue-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {/* Drop indicators */}
                      {dragOverItem?.id === item.id && dragOverItem.position === 'before' && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t z-10" />
                      )}
                      {dragOverItem?.id === item.id && dragOverItem.position === 'after' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-b z-10" />
                      )}

                      {/* Header */}
                      <div className="flex justify-between items-start mb-2">
                        <GripVertical className="w-3 h-3 text-gray-400 cursor-grab active:cursor-grabbing" />
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Name */}
                      <input
                        value={item.name}
                        onChange={(e) => updateItemName(item.id, e.target.value)}
                        className="w-full text-sm font-semibold mb-2 px-1.5 py-1 bg-gray-50 dark:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded focus:outline-none focus:border-blue-500"
                        placeholder="Item name"
                      />

                      {/* Dynamic Fields */}
                      <div className="space-y-1.5">
                        {data.schema.map(col => {
                          if (col.type === 'tier') return null;
                          return (
                            <div key={col.id}>
                              <label className="text-[9px] uppercase font-bold text-gray-400 block mb-0.5">
                                {col.name}
                              </label>
                              {col.type === 'rating' ? (
                                <input
                                  type="number"
                                  max={col.max || 10}
                                  min={col.min || 0}
                                  value={item.values[col.id] || 0}
                                  onChange={(e) => updateItemValue(item.id, col.id, Number(e.target.value))}
                                  className="w-full text-xs px-1.5 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={item.values[col.id] || ''}
                                  onChange={(e) => updateItemValue(item.id, col.id, e.target.value)}
                                  className="w-full text-xs px-1.5 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:border-blue-500"
                                />
                              )}
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
        </div>
      </div>
    </div>
  );
};

export default CompactGuiTab;