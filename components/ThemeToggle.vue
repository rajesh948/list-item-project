<template>
  <div class="theme-toggle">
    <button
      v-for="option in options"
      :key="option.mode"
      class="theme-option"
      :class="{ active: currentTheme === option.mode }"
      @click="setTheme(option.mode)"
      :title="option.label"
    >
      <ion-icon :icon="option.icon"></ion-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { sunnyOutline, moonOutline } from 'ionicons/icons';
import type { ThemeMode } from '~/stores/theme';

const themeStore = useThemeStore();

const currentTheme = computed(() => themeStore.currentTheme);

const options = [
  { mode: 'light' as ThemeMode, icon: sunnyOutline, label: 'Light Mode' },
  { mode: 'dark' as ThemeMode, icon: moonOutline, label: 'Dark Mode' },
];

const setTheme = (mode: ThemeMode) => {
  themeStore.setMode(mode);
};
</script>

<style scoped>
.theme-toggle {
  display: flex;
  background: var(--color-surface, #f5f5f5);
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.theme-option {
  width: 40px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary, #666);
  transition: all 0.3s ease;
}

.theme-option:hover {
  background: var(--color-background, #fff);
  color: var(--color-primary, #667eea);
}

.theme-option.active {
  background: var(--color-background, #fff);
  color: var(--color-primary, #667eea);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-option ion-icon {
  font-size: 20px;
}
</style>
