"use client"

import React, { useEffect, useState } from 'react';
import { Plus, ArrowLeft, Code, Eye, Settings, Database, LayoutGrid, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import CodeTab from './tabs/CodeTab';
import PreviewTab from './tabs/PreviewTab';
import GuiTab from './tabs/GuiTab';
import ItemsTab from './tabs/ItemsTab';
import SchemaTab from './tabs/SchemaTab';
import GeneralTab from './tabs/GeneralTab';
import { useTierlistMaker } from './state/useTierlistMaker';

export default function TierlistMaker() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const { data, setData, createdCategories, setCreatedCategories } = useTierlistMaker();
    const [activeTab, setActiveTab] = useState<'general' | 'schema' | 'items' | 'preview' | 'code' | 'gui'>('general');

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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
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
                <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Toggle theme"
                >
                    {theme === 'light'
                        ? <Moon className="w-5 h-5 text-gray-700" />
                        : <Sun className="w-5 h-5 text-yellow-400" />
                    }
                </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
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
                    <button onClick={() => setActiveTab('gui')} className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${activeTab === 'gui' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                    <LayoutGrid className="w-5 h-5" /> <span className="hidden sm:inline font-medium">GUI Maker</span>
                    </button>
                </nav>
                </div>
                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                {activeTab === 'general' && <GeneralTab data={data} createdCategories={createdCategories} setData={setData} setCreatedCategories={setCreatedCategories} />}
                {activeTab === 'schema' && <SchemaTab data={data} setData={setData} />}
                {activeTab === 'items' && <ItemsTab data={data} setData={setData} />}
                {activeTab === 'gui' && <GuiTab data={data} setData={setData} />}
                {activeTab === 'preview' && <PreviewTab data={data} />}
                {activeTab === 'code' && <CodeTab data={data} createdCategories={createdCategories} />}
                </div>
            </div>
        </div>
    );
}