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
    const [isScrolled, setIsScrolled] = useState(false);
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

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            // Add blur background when scrolled
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 pt-4 pb-4 px-4 sm:px-6 lg:px-4 rounded-2xl shadow-md transition-all duration-300 ${
            isScrolled 
                ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl' 
                : 'bg-gradient-to-r from-gray-50 via-gray-100 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 m-4'
        }`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                
                {/* Left Section: Title and Status */}
                <div className="text-center lg:text-left">
                    <h1 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center justify-center lg:justify-start">
                        <FaHome className="w-8 h-8 mr-2 text-indigo-600" />
                        DevOps Dashboard
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {items.length} total links saved.
                    </p>
                </div>

                {/* Middle Section: Search Bar */}
                <div className="relative w-full">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search links by name, category or URL..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full py-2.5 pl-10 pr-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 shadow-inner transition duration-200"
                    />
                </div>

                {/* Right Section: Controls */}
                <div className="flex justify-center lg:justify-end items-center space-x-3">
                    
                    {/* Theme Toggle Button */}
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

                    {isAdmin ? (
                        <>
                            <button
                                onClick={onToggleEditMode}
                                disabled={!canManage}
                                className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                                    isEditMode
                                        ? 'bg-amber-400 text-gray-900 hover:bg-amber-500'
                                        : 'bg-white dark:bg-gray-800 text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                } border border-gray-200 dark:border-gray-700 transform hover:scale-105 disabled:opacity-60`}
                                title={isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode (Reorder Links)'}
                            >
                                <FiMove size={20} />
                            </button>

                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setMenuOpen((open) => !open)}
                                    className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 text-white hover:from-purple-600 hover:to-indigo-700 dark:hover:from-purple-700 dark:hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    title="Settings"
                                >
                                    <FiMenu size={20} className={`transition-transform duration-300 ${menuOpen ? 'rotate-90' : 'rotate-0'}`} />
                                </button>

                                <div className={`absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-20 origin-top-right transition-all duration-300 ease-out ${
                                    menuOpen 
                                        ? 'opacity-100 scale-100 translate-y-0' 
                                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                                }`}>
                                    <button
                                        onClick={() => {
                                            onAddNew();
                                            setMenuOpen(false);
                                        }}
                                        className="w-full px-6 py-4 text-left text-lg font-semibold flex items-center gap-4 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-colors duration-200"
                                    >
                                        <FaPlus size={20} />
                                        <span className="text-indigo-600 dark:text-indigo-400">Add new link</span>
                                    </button>
                                    <button
                                        onClick={() => handleMenuAction('export')}
                                        className="w-full px-6 py-4 text-left text-lg flex items-center gap-4 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-colors duration-200"
                                    >
                                        <FiDownload size={20} />
                                        <span className="font-medium">Export dashboard</span>
                                    </button>
                                    <button
                                        onClick={() => handleMenuAction('import')}
                                        className="w-full px-6 py-4 text-left text-lg flex items-center gap-4 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 transition-colors duration-200"
                                    >
                                        <FiUpload size={20} />
                                        <span className="font-medium">Import dashboard</span>
                                    </button>
                                    <button
                                        onClick={() => handleMenuAction('logout')}
                                        className="w-full px-6 py-4 text-left text-lg flex items-center gap-4 hover:bg-red-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 transition-colors duration-200"
                                    >
                                        <FaSignOutAlt size={20} />
                                        <span className="font-semibold">Sign out</span>
                                    </button>
                                </div>
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
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isEditMode ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
            }`}>
                <div className="text-center text-sm font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <IoMove size={18} className="inline mr-2" />
                    EDIT MODE IS ACTIVE: Drag and drop links to reorder or move them between categories.
                </div>
            </div>
        </header>
    );
};
