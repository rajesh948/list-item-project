<template>
  <div class="event-item">
    <div class="event-date">
      <span class="date-day">{{ day }}</span>
      <span class="date-month">{{ month }}</span>
    </div>
    <div class="event-content">
      <p class="event-title">{{ event.title || 'Untitled Event' }}</p>
      <p class="event-meta">
        <span v-if="event.customerName">{{ event.customerName }}</span>
      </p>
    </div>
    <div class="event-badges">
      <div v-if="event.shift" class="shift-badge" :class="shiftClass">
        <ion-icon :icon="shiftIcon"></ion-icon>
        {{ event.shift }}
      </div>
      <div v-if="isToday" class="today-badge">Today</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { sunnyOutline, partlySunnyOutline, moonOutline } from 'ionicons/icons';

const props = defineProps<{
  event: {
    id: string;
    title?: string;
    date: string | Date;
    customerName?: string;
    shift?: string;
  };
}>();

const shiftIcon = computed(() => {
  const shift = props.event.shift?.toLowerCase();
  if (shift === 'morning') return sunnyOutline;
  if (shift === 'afternoon') return partlySunnyOutline;
  if (shift === 'night') return moonOutline;
  return sunnyOutline;
});

const shiftClass = computed(() => {
  const shift = props.event.shift?.toLowerCase();
  if (shift === 'morning') return 'shift-morning';
  if (shift === 'afternoon') return 'shift-afternoon';
  if (shift === 'night') return 'shift-night';
  return '';
});

const eventDate = computed(() => {
  return props.event.date instanceof Date
    ? props.event.date
    : new Date(props.event.date);
});

const day = computed(() => eventDate.value.getDate());

const month = computed(() => {
  return eventDate.value.toLocaleDateString('en-US', { month: 'short' });
});

const isToday = computed(() => {
  const today = new Date();
  return (
    eventDate.value.getDate() === today.getDate() &&
    eventDate.value.getMonth() === today.getMonth() &&
    eventDate.value.getFullYear() === today.getFullYear()
  );
});
</script>

<style scoped>
.event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.event-item:hover {
  background: #f5f5f5;
}

.event-date {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.date-day {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
}

.date-month {
  font-size: 0.65rem;
  text-transform: uppercase;
  opacity: 0.9;
  margin-top: 2px;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meta {
  font-size: 0.8rem;
  color: #888;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.shift-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;
}

.shift-badge ion-icon {
  font-size: 12px;
}

.shift-morning {
  background: #fff3e0;
  color: #f57c00;
}

.shift-afternoon {
  background: #e3f2fd;
  color: #1976d2;
}

.shift-night {
  background: #ede7f6;
  color: #5e35b1;
}

.today-badge {
  padding: 4px 8px;
  background: #e8f5e9;
  color: #4CAF50;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}
</style>
