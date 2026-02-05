<template>
  <div
    class="stat-card"
    :class="[`stat-${color}`, { disabled }]"
    @click="!disabled && $emit('click')"
  >
    <div class="stat-icon">
      <ion-icon :icon="getIcon"></ion-icon>
    </div>
    <div class="stat-content">
      <p class="stat-value">{{ value }}</p>
      <p class="stat-title">{{ title }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import {
  documentTextOutline,
  calendarOutline,
  peopleOutline,
  trendingUpOutline,
} from 'ionicons/icons';

const props = defineProps<{
  title: string;
  value: number | string;
  icon: string;
  color?: 'primary' | 'success' | 'warning' | 'tertiary';
  disabled?: boolean;
}>();

defineEmits<{
  click: [];
}>();

const iconMap: Record<string, any> = {
  'document-text-outline': documentTextOutline,
  'calendar-outline': calendarOutline,
  'people-outline': peopleOutline,
  'trending-up-outline': trendingUpOutline,
};

const getIcon = computed(() => iconMap[props.icon] || documentTextOutline);
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.2s;
}

.stat-card:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon ion-icon {
  font-size: 24px;
  color: white;
}

.stat-primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-success .stat-icon {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
}

.stat-warning .stat-icon {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
}

.stat-tertiary .stat-icon {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  line-height: 1;
}

.stat-title {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .stat-card {
    padding: 16px;
    gap: 12px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-icon ion-icon {
    font-size: 20px;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-title {
    font-size: 0.8rem;
  }
}
</style>
