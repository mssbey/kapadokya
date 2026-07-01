'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeToggle() {
  const { resolvedTheme, setTheme, loadTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadTheme();
    setMounted(true);
  }, [loadTheme]);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10" />;
  }

  const isDark = resolvedTheme === 'dark';

  function toggle() {
    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center
                 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10
                 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors duration-300"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'moon' : 'sun'}
          initial={{ y: -12, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 12, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-yellow-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
