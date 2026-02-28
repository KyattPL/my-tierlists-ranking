"use client"

import React, { useMemo, useState } from 'react';
import { CollectionItem, ItemStatus } from './page';
import { Search, Star, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Clock, Film, Tv, PlayCircle, HelpCircle, Grid, List } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

const StatusBadge = ({ status }: { status: ItemStatus }) => {
  const styles = {
    "in-progress": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    "undecided": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    "undefined": "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  };
  
  const icons = {
      "in-progress": <PlayCircle className="w-3 h-3 mr-1" />,
      "undecided": <HelpCircle className="w-3 h-3 mr-1" />,
      "undefined": null
  }

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border flex items-center w-fit ${styles[status]}`}>
        {icons[status]}
        {status === 'undefined' ? 'Unwatched' : status}
    </span>
  );
};

type TypeFilter = 'All' | 'Movie' | 'TV Series';

export default function MovieCollectionClient({ initialMovies }: { initialMovies: CollectionItem[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof CollectionItem; direction: 'asc' | 'desc' } | null>({ key: 'rating', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [genreFilter, setGenreFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const genres = useMemo(() => {
    const allGenres = initialMovies.flatMap(m => 
      m.genre.split(',').map(g => g.trim())
    );
    const uniqueGenres = [...new Set(allGenres)].filter(Boolean).sort();
    return ['All', ...uniqueGenres];
  }, [initialMovies]);

  const statuses: (ItemStatus | 'All')[] = ['All', 'in-progress', 'undecided', 'undefined'];
  const types: TypeFilter[] = ['All', 'Movie', 'TV Series'];

  const filteredAndSortedMovies = useMemo(() => {
    let filtered = initialMovies;

    if (genreFilter !== 'All') {
      filtered = filtered.filter(item => item.genre.split(',').map(g => g.trim()).includes(genreFilter));
    }

    if (statusFilter !== 'All') filtered = filtered.filter(item => item.status === statusFilter);

    if (typeFilter !== 'All') {
      if (typeFilter === 'Movie') {
        filtered = filtered.filter(item => item.totalSeasons === 0);
      } else if (typeFilter === 'TV Series') {
        filtered = filtered.filter(item => item.totalSeasons > 0);
      }
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal == null || bVal == null) return 0;
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [initialMovies, searchQuery, sortConfig, genreFilter, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredAndSortedMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = filteredAndSortedMovies.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (key: keyof CollectionItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const PaginationControls = () => {
      if (totalPages <= 1) return null;
      return (
        <div className="flex justify-center items-center gap-4">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1} 
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages} 
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm text-sm"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      );
  };

  if (initialMovies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
             <Film className="w-8 h-8 opacity-50" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">No Movie Data Found</h3>
        <p className="mt-2 text-center max-w-md">Please run the sync script or check your <code>movies.json</code> file to populate your collection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between gap-4 sticky top-4 z-10">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
                type="text" 
                placeholder="Search collection..." 
                value={searchQuery} 
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400" 
            />
            </div>
            
            {/* Top Pagination */}
            <div className="hidden lg:flex">
                <PaginationControls />
            </div>
        </div>
        
        <div className="flex flex-wrap gap-2 lg:flex-nowrap items-center">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700 mr-2">
             <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`} title="Grid View">
                <Grid className="w-4 h-4" />
             </button>
             <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`} title="Table View">
                <List className="w-4 h-4" />
             </button>
          </div>

          <select 
            value={genreFilter} 
            onChange={e => { setGenreFilter(e.target.value); setCurrentPage(1); }} 
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
          >
              <option value="All">All Genres</option>
              {genres.slice(1).map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          
          <select 
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value as ItemStatus | 'All'); setCurrentPage(1); }} 
            className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
          >
              {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s === 'undefined' ? 'Unwatched' : s}</option>)}
          </select>

          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
             {types.map(t => (
                 <button
                    key={t}
                    onClick={() => { setTypeFilter(t); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${typeFilter === t ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                 >
                    {t === 'All' ? 'All' : t}
                 </button>
             ))}
          </div>
        </div>
      </div>

      {/* Top Pagination Mobile */}
      <div className="lg:hidden flex justify-center pb-2">
          <PaginationControls />
      </div>

      {/* Content Area */}
      {paginatedMovies.length > 0 ? (
        <>
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {paginatedMovies.map(item => (
                        <div key={item.id} className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500 transition-all hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col h-full">
                            {/* Poster Area */}
                            <div className="aspect-[2/3] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                                {item.poster && item.poster !== 'N/A' && !item.poster.includes('null') ? (
                                    <img src={'/my-tierlists-ranking' + item.poster} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" loading="lazy" />
                                ) : (
                                    <div className={`absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center`}>
                                    {item.totalSeasons > 0 ? <Tv className="w-12 h-12 text-zinc-400" /> : <Film className="w-12 h-12 text-zinc-400" />}
                                    </div>
                                )}
                                
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <div className="flex items-center justify-between text-white mb-1">
                                        <span className="text-xs font-bold bg-black/50 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
                                            {item.year}
                                        </span>
                                        <div className="flex items-center gap-1 text-amber-400">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="font-bold text-sm">{item.rating > 0 ? item.rating.toFixed(1) : '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Right Status */}
                                <div className="absolute top-2 right-2">
                                    {item.status !== 'undefined' && <StatusBadge status={item.status} />}
                                </div>
                            </div>

                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg leading-tight mb-1 line-clamp-1" title={item.title}>{item.title}</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{item.director || 'Unknown Director'}</p>
                                
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {item.genre.split(',').slice(0, 3).map((g, i) => (
                                        <span key={i} className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded">
                                            {g.trim()}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" /> {item.runtime}
                                    </span>
                                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500 font-medium" title="IMDb Rating">
                                        IMDb {item.imdbRating}
                                    </span>
                                </div>
                                
                                {item.myComment && (
                                    <div className="mt-3 text-xs italic text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded border border-zinc-100 dark:border-zinc-800/50">
                                        &quot;{item.myComment}&quot;
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-hidden bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Poster</th>
                                    {(['title', 'year', 'genre', 'rating', 'status', 'imdbRating'] as const).map(key => (
                                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400" onClick={() => handleSort(key)}>
                                            <div className="flex items-center gap-1">
                                                {key === 'imdbRating' ? 'IMDb' : key.charAt(0).toUpperCase() + key.slice(1)}
                                                {sortConfig?.key === key && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {paginatedMovies.map((item) => (
                                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <div className="w-10 h-14 bg-zinc-200 dark:bg-zinc-700 rounded overflow-hidden flex-shrink-0">
                                                {item.poster && item.poster !== 'N/A' && !item.poster.includes('null') ? (
                                                    <img src={'/my-tierlists-ranking' + item.poster} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                        <Film className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 max-w-[200px] truncate" title={item.title}>{item.title}</div>
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400">{item.director}</div>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-zinc-600 dark:text-zinc-400">{item.year}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                {item.genre.split(',').slice(0, 2).map((g, i) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400">{g.trim()}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                                                <Star className="w-3.5 h-3.5 fill-current" />
                                                {item.rating > 0 ? item.rating.toFixed(1) : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                            {item.imdbRating > 0 ? item.imdbRating : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
      ) : (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
              <Search className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">No movies found matching your filters.</p>
              <button onClick={() => { setSearchQuery(''); setGenreFilter('All'); setStatusFilter('All'); setTypeFilter('All'); }} className="mt-4 text-indigo-500 hover:underline text-sm">
                  Clear all filters
              </button>
          </div>
      )}

      {/* Bottom Pagination */}
      <div className="flex justify-center pb-10">
          <PaginationControls />
      </div>
    </div>
  );
}
