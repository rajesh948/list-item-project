import { defineStore } from 'pinia';

export type ThemeMode = 'light' | 'dark' | 'system';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'light' as ThemeMode, // Default to light mode
    systemPrefersDark: false,
  }),

  getters: {
    isDark: (state) => {
      if (state.mode === 'system') {
        return state.systemPrefersDark;
      }
      return state.mode === 'dark';
    },
    currentTheme: (state) => state.mode,
  },

  actions: {
    setMode(mode: ThemeMode) {
      this.mode = mode;
      if (process.client) {
        localStorage.setItem('theme-mode', mode);
      }
      this.applyTheme();
    },

    initTheme() {
      if (process.client) {
        // Check system preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.systemPrefersDark = mediaQuery.matches;

        // Listen for system preference changes
        mediaQuery.addEventListener('change', (e) => {
          this.systemPrefersDark = e.matches;
          if (this.mode === 'system') {
            this.applyTheme();
          }
        });

        // Load saved preference, default to light mode if not set
        const saved = localStorage.getItem('theme-mode') as ThemeMode | null;
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          this.mode = saved;
        } else {
          // Default to light mode for new users
          this.mode = 'light';
        }

        this.applyTheme();
      }
    },

    applyTheme() {
      if (process.client) {
        const shouldBeDark = this.isDark;

        // Apply to document
        document.documentElement.classList.toggle('dark', shouldBeDark);
        document.body.classList.toggle('dark', shouldBeDark);

        // Update Ionic theme
        document.body.classList.toggle('ion-palette-dark', shouldBeDark);

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', shouldBeDark ? '#1a1a1a' : '#ffffff');
        }
      }
    },

    toggleTheme() {
      if (this.mode === 'light') {
        this.setMode('dark');
      } else if (this.mode === 'dark') {
        this.setMode('system');
      } else {
        this.setMode('light');
      }
    },
  },
});
