import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

export const ThemeToggle = ({ theme, toggleTheme }) => {
    const isDark = theme === 'dark';
    const Icon = isDark ? FaSun : FaMoon;

    return (
        <button
            onClick={toggleTheme}
            className={`p-4 rounded-full transition-all duration-300 shadow-lg ${
                isDark 
                    ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700'
                    : 'bg-white text-indigo-600 hover:bg-gray-100'
            } border border-gray-200 dark:border-gray-700 transform hover:scale-105`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <Icon size={20} />
        </button>
    );
};