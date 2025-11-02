"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clapperboard, Home, Sun, Moon, RefreshCw } from 'lucide-react';

interface CollectionHeaderProps {
    lastSync: string | null;
}

export default function CollectionHeader({ lastSync}: CollectionHeaderProps) {
  // State to manage the current theme
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
      
      // If today, show time
      if (diffDays === 0) {
        return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      }
      // If yesterday
      if (diffDays === 1) {
        return 'Yesterday';
      }
      // If within last week
      if (diffDays < 7) {
        return `${diffDays} days ago`;
      }
      // Otherwise show date
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      console.error(e);

      return timestamp;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 sm:px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Left Side: Title */}
        <div className="flex items-center gap-4">
          <Clapperboard className="w-7 h-7 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-gray-100">Media Collection</h2>
            <p className="text-black dark:text-gray-400 text-sm mt-1">
              A searchable and sortable list of all movies and series in the collection.
            </p>
               {lastSync && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-gray-500 dark:text-gray-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                        Last synced: {formatLastSync(lastSync)}
                    </span>
                    </div>
                )}
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href="/" passHref>
            <button
              aria-label="Go to Homepage"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <Home className="w-5 h-5 text-black dark:text-gray-300" />
            </button>
          </Link>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-black dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-black dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}