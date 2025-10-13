"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clapperboard, Home, Sun, Moon } from 'lucide-react';

export default function CollectionHeader() {
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