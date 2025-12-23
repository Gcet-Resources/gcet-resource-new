import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeProvider';

export const DarkModeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <Moon size={20} className="text-gray-700 dark:text-gray-200" />
            ) : (
                <Sun size={20} className="text-yellow-500" />
            )}
        </button>
    );
};
