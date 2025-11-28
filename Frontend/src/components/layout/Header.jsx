import React, { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from '../common/ThemeToggle.jsx';
import { FaHome } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { FiMove, FiDownload, FiUpload, FiMenu } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import { IoMove } from "react-icons/io5";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { RiLoader2Fill } from "react-icons/ri";


export const Header = ({ 
    theme, 
    toggleTheme,
    items,
    searchTerm,
    onSearchChange,
    isAdmin,
    canManage,
    isAuthenticating,
    isEditMode,
    onToggleEditMode,
    onAddNew,
    onExport,
    onImport,
    onLoginRequest,
    onLogoutRequest
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleMenuAction = (action) => {
        if (action === 'export') onExport();
        if (action === 'import') onImport();
        if (action === 'logout') onLogoutRequest();
        setMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <header className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row justify-between items-center mb-4 space-y-4 lg:space-y-0">
                
                {/* Left Section: Title and Status */}
                <div className="w-full lg:w-1/4 mb-4 lg:mb-0 text-center lg:text-left">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center lg:justify-start">
                        <FaHome className="w-8 h-8 mr-2 text-indigo-500" />
                        DevOps Dashboard
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {items.length} total links saved.
                    </p>
                </div>

                {/* Middle Section: Search Bar */}
                <div className="relative w-full max-w-2xl lg:w-1/2">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search links by name, category or URL..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full py-2.5 pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-inner transition duration-200"
                    />
                </div>

                {/* Right Section: Controls */}
                <div className="w-full lg:w-1/4 flex justify-center lg:justify-end space-x-3 flex-wrap">
                    
                    {/* Theme Toggle Button */}
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

                    {isAdmin ? (
                        <>
                            <button
                                onClick={onToggleEditMode}
                                disabled={!canManage}
                                className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                                    isEditMode
                                        ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600'
                                        : 'bg-white dark:bg-gray-800 text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                } border border-gray-200 dark:border-gray-700 transform hover:scale-105 disabled:opacity-60`}
                                title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode (Reorder Links)'}
                            >
                                <FiMove size={20} />
                            </button>

                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setMenuOpen((open) => !open)}
                                    className="p-4 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200 shadow-sm flex items-center"
                                    title="Admin menu"
                                >
                                    <FiMenu size={22} />
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-20">
                                        <button
                                            onClick={() => {
                                                onAddNew();
                                                setMenuOpen(false);
                                            }}
                                            className="w-full px-5 py-3 text-left text-base font-semibold flex items-center gap-3 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
                                        >
                                            <FaPlus size={18} />
                                            <span className="text-indigo-400 dark:text-indigo-200">Add new link</span>
                                        </button>
                                        <button
                                            onClick={() => handleMenuAction('export')}
                                            className="w-full px-5 py-3 text-left text-base flex items-center gap-3 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
                                        >
                                            <FiDownload size={18} />
                                            <span className="font-medium">Export dashboard</span>
                                        </button>
                                        <button
                                            onClick={() => handleMenuAction('import')}
                                            className="w-full px-5 py-3 text-left text-base flex items-center gap-3 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
                                        >
                                            <FiUpload size={18} />
                                            <span className="font-medium">Import dashboard</span>
                                        </button>
                                        <button
                                            onClick={() => handleMenuAction('logout')}
                                            className="w-full px-5 py-3 text-left text-base flex items-center gap-3 hover:bg-red-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-300"
                                        >
                                            <FaSignOutAlt size={18} />
                                            <span className="font-semibold">Sign out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={onLoginRequest}
                            disabled={isAuthenticating}
                            className="px-4 py-3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700 transition duration-200 flex items-center space-x-2 shadow-sm disabled:opacity-60"
                        >
                            {isAuthenticating ? (
                                <>
                                    <RiLoader2Fill className="animate-spin" />
                                    <span>Checking access...</span>
                                </>
                            ) : (
                                <>
                                    <FaSignInAlt />
                                    <span>Sign in</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
            {isEditMode && (
                <div className="text-center text-sm font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <IoMove size={18} className="inline mr-2" />
                    EDIT MODE IS ACTIVE: Drag and drop links to reorder or move them between categories.
                </div>
            )}
        </header>
    );
};
