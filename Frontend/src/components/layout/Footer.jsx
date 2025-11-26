import React from 'react';
import { ThemeToggle } from '../common/ThemeToggle.jsx';

export const Footer = ({ 
    theme, 
    toggleTheme 
}) => {
    return (
        <footer className="mt-12 pt-6 border-t border-gray-300 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                
                {/* Left Section: Author */}
                <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Made by <span className="font-semibold text-indigo-600 dark:text-indigo-400">T.Zhvania</span>
                    </p>
                </div>

                {/* Middle Section: Copyright */}
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        © {new Date().getFullYear()} All Rights Reserved
                    </p>
                </div>

                {/* Right Section: Dark Mode Toggle */}
                <div className="text-center sm:text-right">
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                </div>
            </div>
        </footer>
    );
};