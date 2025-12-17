"use client"

import React, { useState, useMemo } from 'react';
import { CollectionItem, ItemStatus } from './page';
import { Search, Star, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Info } from 'lucide-react';
// import Image from 'next/image';

const ITEMS_PER_PAGE = 20;

const StatusBadge = ({ status }: { status: ItemStatus }) => {
  const styles = {
    "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "undecided": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    "undefined": "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300",
  };
  return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
};

type TypeFilter = 'All' | 'Movie' | 'TV Series';

export default function MovieCollectionClient({ initialMovies }: { initialMovies: CollectionItem[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof CollectionItem; direction: 'asc' | 'desc' } | null>({ key: 'rating', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [genreFilter, setGenreFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');

  const genres = useMemo(() => {
    const allGenres = initialMovies.flatMap(m => 
      m.genre.split(',').map(g => g.trim())
    );
    const uniqueGenres = [...new Set(allGenres)].filter(Boolean).sort(); // filter(Boolean) removes any empty strings
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
        filtered.forEach(i => console.log(i.totalSeasons));
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

  if (initialMovies.length === 0) {
    return (
      <div className="text-center py-12 text-black bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
        <h3 className="text-xl font-semibold">No Movie Data Found</h3>
        <p className="mt-1">Please run the sync script or check your `movies.json` file.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gray-50 dark:bg-gray-900">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-black space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-700 dark:text-gray-400" />
          <input type="text" placeholder="Search by title..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-black dark:text-white text-gray-700" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={genreFilter} onChange={e => { setGenreFilter(e.target.value); setCurrentPage(1); }} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-black dark:text-white text-gray-700"><option value="All">All Genres</option>{genres.slice(1).map(g => <option key={g} value={g}>{g}</option>)}</select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as ItemStatus | 'All'); setCurrentPage(1); }} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-black dark:text-white text-gray-700">{statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}</select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value as TypeFilter); setCurrentPage(1); }} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-black dark:text-white text-gray-700">{types.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}</select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="overflow-x-auto border rounded-lg border-black hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-200 dark:bg-gray-700">
            <tr>
              {(['title', 'year', 'genre', 'imdbRating', 'rating', 'status', 'runtime'] as (keyof CollectionItem)[]).map(key => (
                <th key={key} className="px-4 py-3 text-left text-sm font-semibold text-black dark:text-gray-300 capitalize">
                    <button onClick={() => handleSort(key)} className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white cursor-pointer">
                        {key[0].toUpperCase() + key.slice(1)}
                        {sortConfig?.key === key && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                    </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedMovies.map(item => (
              <tr key={item.id} className="border-b text-black dark:text-gray-50 dark:bg-gray-900 dark:border-black hover:bg-gray-100 bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 font-medium flex items-center gap-2">{item.title}{item.myComment && <div className="group relative"><Info className="w-4 h-4 text-gray-400" /><div className="absolute bottom-full mb-2 w-64 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">{item.myComment}</div></div>}</td>
                <td className="px-4 py-3">{item.year}</td>
                <td className="px-4 py-3">{item.genre}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-1 text-amber-600 dark:text-yellow-500"><Star className="w-4 h-4 fill-current" /><span>{item.imdbRating.toFixed(1)}</span></div></td>
                <td className="px-4 py-3"><div className="flex items-center gap-1 text-amber-600 dark:text-yellow-500"><Star className="w-4 h-4 fill-current" /><span>{item.rating.toFixed(1)}</span></div></td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3">{item.runtime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="space-y-4 md:hidden">
        {paginatedMovies.map(item => (
          <div key={item.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-black p-4 flex gap-4">
            {/* <div className="w-24 flex-shrink-0"><Image src={item.poster} alt={`Poster for ${item.title}`} className="w-full h-auto object-cover rounded" width={96} height={20} /></div> */}
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-black dark:text-gray-400 text-lg mb-1 pr-2">{item.title} ({item.year})</h3>
                <div className="flex items-center gap-1 text-yellow-500 font-bold text-lg flex-shrink-0"><Star className="w-5 h-5 fill-current" />
                    <span>{item.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-sm text-black dark:text-gray-400">by {item.director}</p>
              <div className="flex items-center gap-2 mt-2"><StatusBadge status={item.status} /><span className="text-xs text-gray-500">{item.runtime}</span></div>
              {item.myComment && <p className="text-xs italic text-black dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">&quot;{item.myComment}&quot;</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} 
            className="px-4 py-2 rounded bg-gray-50 text-black dark:text-gray-50 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex 
            items-center gap-2 cursor-pointer"><ChevronLeft className="w-4 h-4" /> 
                Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} 
            className="px-4 py-2 rounded bg-gray-50 text-black dark:text-gray-50 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex 
            items-center gap-2 cursor-pointer">
                Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}