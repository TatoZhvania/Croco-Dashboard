import React from 'react';

export const Footer = ({ 
    theme, 
    toggleTheme 
}) => {
    return (
        <footer className="sticky bottom-0 left-0 right-0 z-40">
            <div className="px-0 sm:px-0 pb-2">
                <div className="flex items-center justify-between w-full rounded-xl bg-gray-100/70 backdrop-blur dark:bg-gray-800/70 shadow-lg p-3">
                    {/* Left Section: Author */}
                    <div className="text-left">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            Made by <span className="font-semibold text-indigo-600 dark:text-indigo-400">T.Zhvania</span>
                        </p>
                    </div>

                    {/* Middle Section: Copyright */}
                    <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            © {new Date().getFullYear()} All Rights Reserved
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};