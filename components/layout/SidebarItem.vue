<template>
  <button
    class="sidebar-item"
    :class="{ 'is-active': isActive, 'is-collapsed': isCollapsed }"
    @click="$emit('click')"
    :title="isCollapsed ? label : undefined"
  >
    <span class="item-icon">
      <ion-icon :icon="iconComponent"></ion-icon>
    </span>
    <span v-show="!isCollapsed" class="item-label">{{ label }}</span>
    <span v-if="badge && !isCollapsed" class="item-badge">{{ badge }}</span>
  </button>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import {
  homeOutline,
  documentTextOutline,
  calendarOutline,
  peopleOutline,
  personCircleOutline,
  settingsOutline,
  logOutOutline,
} from 'ionicons/icons';

const props = defineProps<{
  icon: string | object;
  label: string;
  path?: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  badge?: number | string;
}>();

defineEmits<{
  (e: 'click'): void;
}>();

// Map string icons to actual icon objects
const iconMap: Record<string, any> = {
  'home-outline': homeOutline,
  'document-text-outline': documentTextOutline,
  'calendar-outline': calendarOutline,
  'people-outline': peopleOutline,
  'person-circle-outline': personCircleOutline,
  'settings-outline': settingsOutline,
  'log-out-outline': logOutOutline,
};

const iconComponent = computed(() => {
  if (typeof props.icon === 'string') {
    return iconMap[props.icon] || props.icon;
  }
  return props.icon;
});
</script>

<style scoped>
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: #555;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: left;
  transition: all 0.2s ease;
}

.sidebar-item:hover {
  background: #f5f5f5;
  color: #333;
}

.sidebar-item.is-active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
}

.sidebar-item.is-active .item-icon {
  color: #667eea;
}

.sidebar-item.is-collapsed {
  justify-content: center;
  padding: 12px;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  min-width: 24px;
  color: inherit;
  transition: color 0.2s;
}

.item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-badge {
  background: #eb445a;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}
</style>
