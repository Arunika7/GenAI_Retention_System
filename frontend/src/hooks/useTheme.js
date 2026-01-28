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

    // Apply theme changes to DOM
    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove both classes first to ensure clean state
        root.classList.remove('light', 'dark');
        
        // Add current theme class
        root.classList.add(theme);
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        console.log('Theme applied:', theme, 'DOM classes:', root.classList.toString());
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return { theme, toggleTheme, setTheme };
};
