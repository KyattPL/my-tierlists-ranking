"use client"

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, Clapperboard, List, Grid, Home, Search, Sun, Moon, Menu, Folder } from 'lucide-react';
import { AppNode, Category, TierList } from '@/lib/types';
import { TierlistView } from './TierListShared';

const TreeNode = ({ node, level = 0, expanded, onToggle, selected, onSelect, allNodes }: { node: AppNode; level?: number; expanded: Record<string, boolean>; onToggle: (id: string) => void; selected: string; onSelect: (id: string) => void; allNodes: AppNode[] }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded[node.id];
  
  return (
    <div>
      <div className={`flex items-center gap-2 px-3 py-2 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 cursor-pointer rounded-md transition-colors ${selected === node.id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-zinc-700 dark:text-zinc-300'}`} style={{ paddingLeft: `${level * 16 + 12}px` }} onClick={() => onSelect(node.id)}>
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); onToggle(node.id); }} className="hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded p-0.5 transition-colors">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : <div className="w-5" />}
        {node.type === 'category' ? <Folder className={`w-4 h-4 ${selected === node.id ? 'text-indigo-500' : 'text-zinc-400'}`} /> : <List className={`w-4 h-4 ${selected === node.id ? 'text-indigo-500' : 'text-zinc-400'}`} />}
        <span className="text-sm font-medium truncate">{node.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children.map(childId => {
            const childNode = allNodes.find(n => n.id === childId);
            return childNode ? <TreeNode key={childId} node={childNode} level={level + 1} expanded={expanded} onToggle={onToggle} selected={selected} onSelect={onSelect} allNodes={allNodes} /> : null;
          })}
        </div>
      )}
    </div>
  );
};

const CategoryView = ({ category, allNodes, onSelect }: { category: Category; allNodes: AppNode[]; onSelect: (id: string) => void; }) => {
  const children = category.children.map(id => allNodes.find(node => node.id === id)).filter(Boolean) as AppNode[];

  if (children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
        <Folder size={64} strokeWidth={1} className="mb-4 opacity-50" />
        <h3 className="text-xl font-semibold">Empty Category</h3>
        <p className="mt-2 text-sm max-w-xs text-center">There are no tierlists or sub-categories here yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {children.map(child => (
        <div
          key={child.id}
          onClick={() => onSelect(child.id)}
          className="group bg-white dark:bg-zinc-800 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700/50 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-zinc-50 dark:to-zinc-700/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${child.type === 'category' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                {child.type === 'category' ? <Folder className="w-5 h-5" /> : <List className="w-5 h-5" />}
              </div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 truncate flex-1">{child.name}</h3>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 flex-1">
              {child.description || 'No description provided.'}
            </p>
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700/50 flex items-center text-xs text-zinc-400 font-medium uppercase tracking-wider">
              {child.type === 'category' ? `${child.children.length} items` : `${(child as TierList).items.length} ranked`}
              <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function TierlistApp({ initialData }: { initialData: AppNode[] }) {
  const [selectedId, setSelectedId] = useState<string>(initialData[0]?.id || '');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'tier' | 'table'>('tier');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default to dark for better aesthetics
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize selected node if not set or invalid
  useEffect(() => {
    if (!selectedId && initialData.length > 0) {
      setSelectedId(initialData[0].id);
    }
  }, [initialData, selectedId]);

  // Auto-expand root categories
  useEffect(() => {
    const roots = initialData.filter(n => !n.parentId);
    const newExpanded: Record<string, boolean> = {};
    roots.forEach(r => newExpanded[r.id] = true);
    setExpandedNodes(prev => ({ ...prev, ...newExpanded }));
  }, [initialData]);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const rootNodes = initialData.filter(t => !t.parentId);
  const selectedNode = initialData.find(t => t.id === selectedId);

  const toggleNode = (id: string) => setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSelectNode = (id: string) => {
    setSelectedId(id);
    setSortConfig(null);
    setSearchQuery('');
    setIsSidebarOpen(false);
  };

  const handleSort = (key: string) => {
      setSortConfig(current => {
          if (current && current.key === key && current.direction === 'desc') return null;
          if (current && current.key === key && current.direction === 'asc') return { key, direction: 'desc' };
          return { key, direction: 'asc' };
      });
  };

  const processedTierlist = useMemo(() => {
    if (!selectedNode || selectedNode.type !== 'list') return null;
    const items = selectedNode.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (sortConfig) {
      const tierOrder = ['S', 'A', 'B', 'C', 'D', 'F'];
      const sortColumnSchema = selectedNode.schema.find(c => c.id === sortConfig.key);
      items.sort((a, b) => {
        const aValue = sortConfig.key === 'name' ? a.name : a.values[sortConfig.key];
        const bValue = sortConfig.key === 'name' ? b.name : b.values[sortConfig.key];
        if (aValue === undefined || bValue === undefined) return 0;
        let comparison = 0;
        
        if (sortColumnSchema?.type === 'tier' && typeof aValue === 'string' && typeof bValue === 'string') {
           comparison = tierOrder.indexOf(aValue) - tierOrder.indexOf(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
           comparison = aValue - bValue;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
           comparison = aValue.localeCompare(bValue);
        } else {
           comparison = String(aValue).localeCompare(String(bValue));
        }
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return { ...selectedNode, items };
  }, [selectedNode, searchQuery, sortConfig]);

  const hasTierColumn = selectedNode?.type === 'list' && selectedNode.schema.some(col => col.type === 'tier');

  return (
    <div className="relative h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden animate-fade-in" />}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">Rankings</h1>
            </div>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-label="Toggle theme">
                {theme === 'light' ? <Moon className="w-5 h-5 text-zinc-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
          <div className="px-3 pb-2">
             <h2 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">My Collections</h2>
             <Link href="/collection/movies" className="flex items-center gap-2 px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 cursor-pointer rounded-md text-zinc-700 dark:text-zinc-300 transition-colors">
              <Clapperboard className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium">Movies & TV</span>
            </Link>
          </div>
          
          <div className="my-4 border-t border-zinc-100 dark:border-zinc-800 mx-3" />

          <div className="px-3">
             <h2 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Library</h2>
             {rootNodes.map(node => <TreeNode key={node.id} node={node} expanded={expandedNodes} onToggle={toggleNode} selected={selectedId} onSelect={handleSelectNode} allNodes={initialData} />)}
          </div>
        </div>
        
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-center text-zinc-400">
          v1.0.0 • Local Data
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        {selectedNode ? (
          <>
            {/* Header */}
            <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20 px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors">
                    <Menu className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{selectedNode.name}</h2>
                    {selectedNode.description && <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5 font-medium">{selectedNode.description}</p>}
                  </div>
                </div>
                
                {selectedNode.type === 'list' && (
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    {hasTierColumn && (
                      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700/50">
                        <button onClick={() => setViewMode('tier')} className={`px-4 py-1.5 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-all ${viewMode === 'tier' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>
                          <Grid className="w-4 h-4" /> Tier
                        </button>
                        <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>
                          <List className="w-4 h-4" /> Table
                        </button>
                      </div>
                    )}
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search items..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white dark:placeholder-zinc-500 transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
              <div className="max-w-7xl mx-auto">
                {selectedNode.type === 'category' && (
                  <CategoryView category={selectedNode} allNodes={initialData} onSelect={handleSelectNode} />
                )}
                {selectedNode.type === 'list' && processedTierlist && processedTierlist.items.length > 0 && (
                  <TierlistView tierlist={processedTierlist} viewMode={viewMode} sortConfig={sortConfig} onSort={handleSort} />
                )}
                {selectedNode.type === 'list' && (!processedTierlist || processedTierlist.items.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500 animate-fade-in">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No items found matching &quot;{searchQuery}&quot;</p>
                    <button onClick={() => setSearchQuery('')} className="mt-4 text-indigo-500 hover:underline">Clear search</button>
                  </div>
                )}
              </div>
            </main>
          </>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
             <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                <List className="w-10 h-10 opacity-50" />
             </div>
             <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-300 mb-2">Welcome to Rankings</h2>
             <p className="max-w-md text-center">Select a tierlist or category from the sidebar to get started.</p>
           </div>
        )}
      </div>
    </div>
  );
}
