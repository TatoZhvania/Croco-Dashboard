import { useState, useEffect } from 'react';

export const useDarkMode = () => {
    const [theme, setTheme] = useState(() => {
        try {
            const localTheme = localStorage.getItem('theme');
            if (localTheme) return localTheme;
        } catch (error) { /* ignore */ }
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    const colorThemeToRemove = theme === 'dark' ? 'light' : 'dark';

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(colorThemeToRemove);
        root.classList.add(theme);
        try {
            localStorage.setItem('theme', theme);
        } catch (error) { /* ignore */ }
    }, [theme, colorThemeToRemove]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return [theme, toggleTheme];
};