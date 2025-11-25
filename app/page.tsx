"use client"

import Link from 'next/link';
import React, { useState, useMemo, useEffect } from 'react';

import { ChevronRight, ChevronDown, Clapperboard, List, Grid, Star, Home, Search, Sun, Moon, ArrowUp, ArrowDown, Menu, Folder } from 'lucide-react';
import { tierlistData } from '@/data/tierlists-combined';

type TIER = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

interface SchemaColumn {
  id: string;
  name: string;
  type: 'tier' | 'rating' | 'text';
  options?: string[];
  max?: number;
}

interface TierListItem {
  id:string;
  name: string;
  imageUrl?: string | null;
  values: Record<string, string | number>;
}

interface BaseNode {
  id: string;
  name: string;
  description?: string;
  parentId: string | null;
  children: string[];
}

export interface Category extends BaseNode {
  type: 'category';
}

export interface TierList extends BaseNode {
  type: 'list';
  schema: SchemaColumn[];
  items: TierListItem[];
}

export type AppNode = Category | TierList;

export const TierBadge = ({ tier }: {tier: TIER}) => {
  const colors = { S: 'bg-red-500', A: 'bg-orange-500', B: 'bg-yellow-500', C: 'bg-green-500', D: 'bg-blue-500', F: 'bg-gray-500' };
  return <div className={`${colors[tier] || 'bg-gray-500'} text-white font-bold px-3 py-1 rounded text-sm`}>{tier}</div>;
};

export const RatingStars = ({ value, max }: {value: number, max: number}) => (
  <div className="flex items-center gap-1">
    {[...Array(max)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />)}
    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{value}/{max}</span>
  </div>
);

const TreeNode = ({ node, level = 0, expanded, onToggle, selected, onSelect, allNodes }: { node: AppNode; level?: number; expanded: Record<string, boolean>; onToggle: (id: string) => void; selected: string; onSelect: (id: string) => void; allNodes: AppNode[] }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded[node.id];
  
  return (
    <div>
      <div className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${selected === node.id ? 'bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-900/50 dark:border-blue-500' : ''}`} style={{ paddingLeft: `${level * 16 + 12}px` }} onClick={() => onSelect(node.id)}>
        {hasChildren ? (<button onClick={(e) => { e.stopPropagation(); onToggle(node.id); }} className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded p-0.5">{isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>) : <div className="w-5" />}
        {node.type === 'category' ? <Folder className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <List className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
        <span className="text-sm font-medium truncate dark:text-gray-200">{node.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
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
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Folder size={48} className="mx-auto mb-4" />
        <h3 className="text-xl font-semibold">This category is empty</h3>
        <p className="mt-1">You can add tierlists or other categories here in the future.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children.map(child => (
        <div
          key={child.id}
          onClick={() => onSelect(child.id)}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            {child.type === 'category' ? <Folder className="w-6 h-6 text-yellow-500" /> : <List className="w-6 h-6 text-gray-500 dark:text-gray-400" />}
            <h3 className="font-bold text-lg truncate">{child.name}</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {child.description || 'No description available.'}
          </p>
        </div>
      ))}
    </div>
  );
};

export const TierlistView = ({ tierlist, viewMode, sortConfig, onSort }: { tierlist: TierList; viewMode: 'tier' | 'table'; sortConfig: { key: string; direction: 'asc' | 'desc' } | null; onSort: (key: string) => void; }) => {
  const groupedByTier = useMemo(() => {
    const tierColumn = tierlist.schema.find(col => col.type === 'tier');
    if (!tierColumn) return null;
    const groups: Record<string, TierListItem[]> = {};
    tierColumn.options?.forEach(tier => { groups[tier] = []; });
    tierlist.items.forEach(item => { const tierValue = item.values.tier as string; if (groups[tierValue]) { groups[tierValue].push(item); } });
    return groups;
  }, [tierlist]);

  let globalRank = 1;

  if (viewMode === 'tier' && groupedByTier) {
    return (
      <div className="border rounded-lg overflow-hidden bg-gray-900">
        {Object.entries(groupedByTier).map(([tier, items]) => (
          <div key={tier} className="flex border-b border-black last:border-b-0">
            <div className={`w-20 sm:w-24 md:w-32 flex items-center justify-center ${tier === 'S' ? 'bg-red-400' : tier === 'A' ? 'bg-orange-400' : tier === 'B' ? 'bg-yellow-400' : tier === 'C' ? 'bg-lime-400' : tier === 'D' ? 'bg-green-400' : 'bg-gray-400'} border-r-4 border-black`}>
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">{tier}</span>
            </div>
            <div className="flex-1 bg-gray-800 p-2 min-h-[100px] sm:min-h-[120px]">
              <div className="flex flex-wrap gap-2">
                {items.map(item => {
                    const currentRank = globalRank++;

                    return (
                            <div key={item.id} className="relative bg-gray-700 border-2 border-gray-600 rounded p-2 hover:border-gray-400 transition-colors cursor-pointer group" title={item.name}>
                                {!sortConfig && (
                                    <div className="absolute -top-2 -left-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-gray-600 z-10 shadow-sm">
                                        #{currentRank}
                                    </div>
                                )}
                                <div className="font-medium text-white text-sm mb-1">{item.name}</div>
                                <div className="space-y-1">
                                {tierlist.schema.filter(col => col.type !== 'tier').slice(0, 2).map(col => {
                                    const value = item.values[col.id];
                                    return (
                                    <div key={col.id} className="text-xs text-gray-300">
                                        <span className="text-gray-400">{col.name}: </span>
                                        {col.type === 'rating' && typeof value === 'number' ? <span className="text-yellow-400">★{value}/{col.max}</span> : <span>{value}</span>}
                                    </div>
                                    );
                                })}
                                </div>
                            </div>
                        );
                    }
                )}
                {items.length === 0 && <div className="text-gray-500 text-sm italic self-center">Empty tier</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table view for desktop, Card view for mobile
  return (
    <div>
      {/* Desktop Table View */}
      <div className="overflow-x-auto border rounded-lg dark:border-gray-700 hidden md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-600">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                <button onClick={() => onSort('name')} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white">
                    Name {sortConfig?.key === 'name' ? (sortConfig.direction === 'asc' ? <ArrowUp /> : <ArrowDown />) : <span className="text-gray-400 opacity-50 ml-1">↕</span>}
                </button>
              </th>
              {tierlist.schema.map(col => (<th key={col.id} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300"><button onClick={() => onSort(col.id)} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white">{col.name} {sortConfig?.key === col.id && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}</button></th>))}
            </tr>
          </thead>
          <tbody>
            {tierlist.items.map(item => (<tr key={item.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"><td className="px-4 py-3 font-medium dark:text-gray-100">{item.name}</td>{tierlist.schema.map(col => { const value = item.values[col.id]; return (<td key={col.id} className="px-4 py-3">{col.type === 'tier' && typeof value === 'string' && <TierBadge tier={value as TIER} />}{col.type === 'rating' && typeof value === 'number' && <RatingStars value={value} max={col.max || 10} />}{col.type === 'text' && <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}</td>); })}</tr>))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {tierlist.items.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
            <h3 className="font-bold text-lg mb-3">{item.name}</h3>
            <div className="space-y-2">
              {tierlist.schema.map(col => {
                const value = item.values[col.id];
                return (
                  <div key={col.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{col.name}</span>
                    <div>
                      {col.type === 'tier' && typeof value === 'string' && <TierBadge tier={value as TIER} />}
                      {col.type === 'rating' && typeof value === 'number' && <RatingStars value={value} max={col.max || 10} />}
                      {col.type === 'text' && <span className="text-gray-800 dark:text-gray-200">{value}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function TierlistApp() {
  const [selectedId, setSelectedId] = useState('souls-games');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ 'souls-games': true });
  const [viewMode, setViewMode] = useState<'tier' | 'table'>('tier');
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

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

  const rootNodes = tierlistData.filter(t => !t.parentId);
  const selectedNode = tierlistData.find(t => t.id === selectedId);

  const toggleNode = (id: string) => setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSelectNode = (id: string) => {
    setSelectedId(id);
    setSortConfig(null);
    setSearchQuery('');
    setIsSidebarOpen(false);
  };

  const handleSort = (key: string) => {
      setSortConfig(current => {
          if (current && current.key === key && current.direction === 'desc') {
              return null; 
          }
          if (current && current.key === key && current.direction === 'asc') {
              return { key, direction: 'desc' };
          }
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
        if (sortColumnSchema?.type === 'tier' && typeof aValue === 'string' && typeof bValue === 'string') comparison = tierOrder.indexOf(aValue) - tierOrder.indexOf(bValue);
        else if (typeof aValue === 'number' && typeof bValue === 'number') comparison = aValue - bValue;
        else if (typeof aValue === 'string' && typeof bValue === 'string') comparison = aValue.localeCompare(bValue);
        else comparison = String(aValue).localeCompare(String(bValue));
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    return { ...selectedNode, items };
  }, [selectedNode, searchQuery, sortConfig]);

  const hasTierColumn = selectedNode?.type === 'list' && selectedNode.schema.some(col => col.type === 'tier');

  return (
    <div className="relative min-h-screen md:flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-10 md:hidden" />}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col z-20 
        transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">Kyatt&apos;s tierlists</h1>
            </div>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-full hover:bg-gray-100
             dark:hover:bg-gray-700" aria-label="Toggle theme">
                {theme === 'light' ? <Moon className="w-5 h-5 text-gray-700" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Collections</h2>
            <Link href="/collection/movies" className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md">
              <Clapperboard className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium dark:text-gray-200">Movie Collection</span>
            </Link>
          </div>
          <div className="p-4 border-t dark:border-gray-700">
             <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tierlists</h2>
          </div>
          {rootNodes.map(node => <TreeNode key={node.id} node={node} expanded={expandedNodes} onToggle={toggleNode} selected={selectedId} onSelect={handleSelectNode} allNodes={tierlistData} />)}
          <div className='border-b border-gray-700'/>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedNode ? (
          <>
            <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 sm:px-6 py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><Menu className="w-6 h-6" /></button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedNode.name}</h2>
                    {selectedNode.description && <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{selectedNode.description}</p>}
                  </div>
                </div>
                {/* UPDATED: Only show view/search controls for tierlists */}
                {selectedNode.type === 'list' && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    {hasTierColumn && (
                      <div className="flex gap-2">
                        <button onClick={() => setViewMode('tier')} className={`w-full sm:w-auto px-3 py-2 rounded flex items-center justify-center gap-2 text-sm ${viewMode === 'tier' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}><Grid className="w-4 h-4" />Tier View</button>
                        <button onClick={() => setViewMode('table')} className={`w-full sm:w-auto px-3 py-2 rounded flex items-center justify-center gap-2 text-sm ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}><List className="w-4 h-4" />Table View</button>
                      </div>
                    )}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* UPDATED: Conditional rendering for CategoryView vs TierlistView */}
              {selectedNode.type === 'category' && (
                <CategoryView category={selectedNode} allNodes={tierlistData} onSelect={handleSelectNode} />
              )}
              {selectedNode.type === 'list' && processedTierlist && processedTierlist.items.length > 0 && (
                <TierlistView tierlist={processedTierlist} viewMode={viewMode} sortConfig={sortConfig} onSort={handleSort} />
              )}
              {selectedNode.type === 'list' && (!processedTierlist || processedTierlist.items.length === 0) && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">No items found matching &quot;{searchQuery}&quot;</div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">Select a tierlist to view</div>
        )}
      </div>
    </div>
  );
}