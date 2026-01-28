import { useState, useEffect } from 'react';

export const useTheme = () => {
    // Initialize theme from localStorage or system preference
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove both classes first
        root.classList.remove('light', 'dark');
        
        // Add current theme class
        root.classList.add(theme);
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Apply initial theme on mount
    useEffect(() => {
        const root = window.document.documentElement;
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            root.classList.add(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            root.classList.add('dark');
        } else {
            root.classList.add('light');
        }
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return { theme, toggleTheme, setTheme };
};
