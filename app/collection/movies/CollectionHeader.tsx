"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clapperboard, Sun, Moon, RefreshCw, ArrowLeft } from 'lucide-react';

interface CollectionHeaderProps {
    lastSync: string | null;
}

export default function CollectionHeader({ lastSync}: CollectionHeaderProps) {
  const [theme, setTheme] = useState<'light'|'dark'>('light');

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

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      }
      if (diffDays === 1) {
        return 'Yesterday';
      }
      if (diffDays < 7) {
        return `${diffDays} days ago`;
      }
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      console.error(e);
      return timestamp;
    }
  };

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
             <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="bg-pink-100 dark:bg-pink-900/20 p-2 rounded-lg text-pink-600 dark:text-pink-400">
             <Clapperboard className="w-6 h-6" />
          </div>
          
          <div>
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Media Collection</h1>
                <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium rounded-full border border-zinc-200 dark:border-zinc-700">
                    Beta
                </span>
            </div>
            
            <div className="flex items-center gap-2 mt-0.5">
                {lastSync && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-500">
                        <RefreshCw className="w-3 h-3" />
                        <span>Synced: {formatLastSync(lastSync)}</span>
                    </div>
                )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
