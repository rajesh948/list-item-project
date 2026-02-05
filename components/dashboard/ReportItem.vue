<template>
  <div class="report-item" @click="$emit('click')">
    <div class="report-icon">
      <ion-icon :icon="documentTextOutline"></ion-icon>
    </div>
    <div class="report-content">
      <p class="report-name">{{ reportName }}</p>
      <p class="report-meta">
        <span v-if="report.customerName">{{ report.customerName }}</span>
        <span v-if="report.customerName && formattedDate"> • </span>
        <span>{{ formattedDate }}</span>
      </p>
    </div>
    <div class="report-items">
      <span class="items-badge">{{ itemCount }} items</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { documentTextOutline } from 'ionicons/icons';

const props = defineProps<{
  report: {
    id: string;
    reportName?: string;
    customerName?: string;
    createdAt?: Date | any;
    selectedCategories?: any[];
  };
}>();

defineEmits<{
  click: [];
}>();

const reportName = computed(() => {
  return props.report.reportName || 'Untitled Report';
});

const itemCount = computed(() => {
  if (!props.report.selectedCategories) return 0;
  return props.report.selectedCategories.reduce((total: number, cat: any) => {
    return total + (cat.items?.length || 0);
  }, 0);
});

const formattedDate = computed(() => {
  if (!props.report.createdAt) return '';

  const date = props.report.createdAt instanceof Date
    ? props.report.createdAt
    : props.report.createdAt.toDate?.() || new Date(props.report.createdAt);

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
});
</script>

<style scoped>
.report-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.report-item:hover {
  background: #f5f5f5;
}

.report-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.report-icon ion-icon {
  font-size: 20px;
  color: white;
}

.report-content {
  flex: 1;
  min-width: 0;
}

.report-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.report-meta {
  font-size: 0.8rem;
  color: #888;
  margin: 0;
}

.report-items {
  flex-shrink: 0;
}

.items-badge {
  display: inline-block;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
}
</style>
