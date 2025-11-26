import React from 'react';
import { ThemeToggle } from '../common/ThemeToggle.jsx';

export const Footer = ({ 
    theme, 
    toggleTheme 
}) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
            <div className="w-full px-5 sm:px-12">
                <div className="flex h-10 flex-row justify-between items-center">
                    {/* Left Section: Author */}
                    <div className="text-center sm:text-left">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Made by <span className="font-semibold text-indigo-600 dark:text-indigo-400">T.Zhvania</span>
                        </p>
                    </div>

                    {/* Middle Section: Copyright */}
                    <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            © {new Date().getFullYear()} All Rights Reserved
                        </p>
                    </div>

                    {/* Right Section: Dark Mode Toggle */}
                    {/* <div className="text-center sm:text-right">
                        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                    </div> */}
                </div>
            </div>
        </footer>
    );
};