import React from 'react';
import * as lucide from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle.jsx';

export const Header = ({ 
    theme, 
    toggleTheme,
    items,
    searchTerm,
    onSearchChange,
    isEditMode,
    onToggleEditMode,
    onAddNew
}) => {
    return (
        <header className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row justify-between items-center mb-4 space-y-4 lg:space-y-0">
                
                {/* Left Section: Title and Status */}
                <div className="w-full lg:w-1/4 mb-4 lg:mb-0 text-center lg:text-left">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center lg:justify-start">
                        <lucide.Home className="w-6 h-6 mr-2 text-indigo-500" />
                        DevOps Dashboard
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {items.length} total links saved.
                    </p>
                </div>

                {/* Middle Section: Search Bar */}
                <div className="relative w-full max-w-2xl lg:w-1/2">
                    <lucide.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search links by name, URL, or category..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full py-3 pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-inner transition duration-200"
                    />
                </div>

                {/* Right Section: Controls */}
                <div className="w-full lg:w-1/4 flex justify-center lg:justify-end space-x-3">
                    
                    {/* Theme Toggle Button */}
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                    
                    {/* Edit Mode Toggle Button */}
                    <button
                        onClick={onToggleEditMode}
                        className={`p-3 rounded-full transition-all duration-300 shadow-lg ${
                            isEditMode
                                ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600'
                                : 'bg-white dark:bg-gray-800 text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } border border-gray-200 dark:border-gray-700 transform hover:scale-105`}
                        title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode (Reorder Links)'}
                    >
                        <lucide.Pencil size={20} />
                    </button>

                    {/* Add Button */}
                    <button
                        onClick={onAddNew}
                        className="px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02] flex items-center group min-w-[150px]"
                    >
                        <lucide.Plus size={20} className="mr-2 group-hover:rotate-90 transition duration-300" />
                        Add New Link
                    </button>
                </div>
            </div>
            {isEditMode && (
                <div className="text-center text-sm font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <lucide.Move size={18} className="inline mr-2" />
                    EDIT MODE IS ACTIVE: Drag and drop links to reorder or move them between categories.
                </div>
            )}
        </header>
    );
};