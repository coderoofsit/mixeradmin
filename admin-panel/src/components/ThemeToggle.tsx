import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle group relative overflow-hidden"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <div className="relative flex items-center justify-center w-6 h-6">
        <Sun
          className={`absolute w-5 h-5 transition-all duration-300 ${
            theme === 'light'
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-0 opacity-0'
          }`}
        />
        <Moon
          className={`absolute w-5 h-5 transition-all duration-300 ${
            theme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          }`}
        />
      </div>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-var(--primary) to-var(--secondary) opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    </button>
  );
};

export default ThemeToggle;
