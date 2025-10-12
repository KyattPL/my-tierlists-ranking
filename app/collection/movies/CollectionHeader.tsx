"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clapperboard, Home, Sun, Moon } from 'lucide-react';

export default function CollectionHeader() {
  // State to manage the current theme
  const [theme, setTheme] = useState('light');

  // Effect to apply the theme class to the <html> element
  useEffect(() => {
    // On initial load, you might want to check localStorage or system preference
    // For simplicity, we'll just apply the state.
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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