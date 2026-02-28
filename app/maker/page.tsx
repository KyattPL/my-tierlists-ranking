"use client"

import React, { useEffect, useState, useTransition } from 'react';
import { ArrowLeft, Code, Eye, Settings, Database, LayoutGrid, Moon, Sun, Save, Loader2, ListPlus } from 'lucide-react';
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
    const [isPending] = useTransition();

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

    const handleSave = () => {
        if (!data.id || !data.name) {
            alert("Please provide an ID and Name in the General tab.");
            return;
        }
        
        // In a static export (GitHub Pages), we can't use Server Actions or API routes to save to disk.
        // Instead, we'll provide a JSON download that the user can place in the data/tierlists folder.
        try {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${data.id}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            alert(`Downloaded ${data.id}.json. To see it in the app, place this file in the 'data/tierlists' directory and restart the dev server.`);
        } catch (e) {
            console.error("Save failed:", e);
            alert("Failed to save: " + e);
        }
    };

    const navItems = [
        { id: 'general', label: 'General Info', icon: Settings },
        { id: 'schema', label: 'Schema', icon: Database },
        { id: 'items', label: 'Items', icon: ListPlus },
        { id: 'gui', label: 'GUI Maker', icon: LayoutGrid },
        { id: 'preview', label: 'Preview', icon: Eye },
        { id: 'code', label: 'Get Code', icon: Code },
    ] as const;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
            {/* Top Bar */}
            <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 h-16 flex items-center justify-between px-6 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
                    <h1 className="text-lg font-bold tracking-tight">Tierlist Maker</h1>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-medium">
                        Beta
                    </span>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
                    </button>
                    
                    <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
                    
                    <button 
                        onClick={handleSave} 
                        disabled={isPending}
                        className="px-4 py-2 rounded-lg flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-sm hover:shadow-md hover:shadow-indigo-500/20 active:scale-95"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                        <span>Save Tierlist</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
                    <div className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                        isActive 
                                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
                                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'}`} />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                    
                    <div className="mt-auto p-4 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="text-xs text-zinc-400 text-center">
                            Changes are local until saved.
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-6 sm:p-8 lg:p-10">
                    <div className="max-w-5xl mx-auto">
                        {activeTab === 'general' && <GeneralTab data={data} createdCategories={createdCategories} setData={setData} setCreatedCategories={setCreatedCategories} />}
                        {activeTab === 'schema' && <SchemaTab data={data} setData={setData} />}
                        {activeTab === 'items' && <ItemsTab data={data} setData={setData} />}
                        {activeTab === 'gui' && <GuiTab data={data} setData={setData} />}
                        {activeTab === 'preview' && <PreviewTab data={data} />}
                        {activeTab === 'code' && <CodeTab data={data} createdCategories={createdCategories} />}
                    </div>
                </main>
            </div>
        </div>
    );
}
