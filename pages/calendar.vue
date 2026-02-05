<template>
  <div class="calendar-page">
    <div class="ion-padding calendar-content">
      <div class="calendar-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="inline-loading">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading events...</p>
        </div>

        <template v-else>
          <!-- Calendar Header -->
          <div class="calendar-nav">
            <button class="nav-btn" @click="prevMonth">
              <ion-icon :icon="chevronBackOutline"></ion-icon>
            </button>
            <h2 @click="goToToday" class="month-label">{{ currentMonthLabel }}</h2>
            <button class="nav-btn" @click="nextMonth">
              <ion-icon :icon="chevronForwardOutline"></ion-icon>
            </button>
          </div>

          <!-- Calendar Grid -->
          <div class="calendar-grid-container">
            <!-- Weekday Headers -->
            <div class="weekday-headers">
              <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
            </div>

            <!-- Calendar Grid -->
            <div class="calendar-grid">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="calendar-day"
                :class="{
                  'other-month': !day.isCurrentMonth,
                  'today': day.isToday,
                  'has-events': day.events.length > 0,
                  'selected': selectedDate && isSameDate(day.date, selectedDate),
                }"
                @click="selectDate(day)"
              >
                <span class="day-number">{{ day.date.getDate() }}</span>
                <div v-if="day.events.length > 0" class="event-dots">
                  <span
                    v-for="(event, i) in day.events.slice(0, 3)"
                    :key="i"
                    class="event-dot"
                    :class="getShiftClass(event.shift)"
                  ></span>
                </div>
              </div>
            </div>

            <!-- Legend -->
            <div class="calendar-legend">
              <div class="legend-item">
                <span class="legend-dot morning"></span>
                <span>Morning</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot evening"></span>
                <span>Evening</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot default"></span>
                <span>Other</span>
              </div>
            </div>
          </div>

          <!-- Selected Date Events -->
          <div v-if="selectedDate" class="selected-date-section">
            <h3 class="selected-date-title">
              <ion-icon :icon="calendarOutline"></ion-icon>
              {{ formatSelectedDate }}
            </h3>

            <div v-if="selectedDateEvents.length > 0" class="selected-events-list">
              <div
                v-for="event in selectedDateEvents"
                :key="event.id"
                class="upcoming-item"
                @click="viewReport(event.reportId)"
              >
                <div class="event-left">
                  <div class="event-date-badge" :class="{ 'today': isToday(event.date) }">
                    <span class="day">{{ event.date.getDate() }}</span>
                    <span class="month">{{ getMonthShort(event.date) }}</span>
                  </div>
                </div>
                <div class="event-center">
                  <h4 class="customer-name">{{ event.customerName }}</h4>
                  <div class="event-meta">
                    <span class="shift-badge" :class="getShiftClass(event.shift)">
                      {{ event.shift || 'Full Day' }}
                    </span>
                    <span v-if="event.noOfPeople" class="people-count">
                      <ion-icon :icon="peopleOutline"></ion-icon>
                      {{ event.noOfPeople }}
                    </span>
                  </div>
                  <p v-if="event.customerPhone" class="phone-text">
                    {{ event.customerPhone }}
                  </p>
                </div>
                <div class="event-right">
                  <button v-if="event.customerPhone" class="call-btn" @click.stop="callCustomer(event.customerPhone)">
                    <ion-icon :icon="callOutline"></ion-icon>
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="no-events-message">
              <p>No events on this date</p>
            </div>
          </div>

          <!-- Prompt to select date -->
          <div v-else class="select-date-prompt">
            <ion-icon :icon="calendarOutline"></ion-icon>
            <p>Select a date to view events</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IonIcon,
  IonSpinner,
} from '@ionic/vue';
import {
  chevronBackOutline,
  chevronForwardOutline,
  calendarOutline,
  callOutline,
  peopleOutline,
} from 'ionicons/icons';

const router = useRouter();

const {
  events,
  isLoading,
  calendarDays,
  currentMonthLabel,
  loadEvents,
  getEventsForDate,
  prevMonth,
  nextMonth,
  goToToday,
} = useCalendar();

const { checkAndShowReminders } = useEventReminders();

const selectedDate = ref<Date | null>(null);
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper function to check if two dates are the same day
const isSameDate = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

// Load events on mount and check for reminders
onMounted(async () => {
  // Auto-select today's date
  selectedDate.value = new Date();

  await loadEvents();
  // Check for event reminders after loading events
  if (events.value.length > 0) {
    await checkAndShowReminders(events.value);
  }
});

// Computed
const selectedDateEvents = computed(() => {
  if (!selectedDate.value) return [];
  return getEventsForDate(selectedDate.value);
});

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return '';
  return selectedDate.value.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

// Methods
const selectDate = (day: { date: Date; events: any[] }) => {
  selectedDate.value = day.date;
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const getMonthShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short' });
};

const getShiftClass = (shift?: string): string => {
  if (!shift) return 'default';
  const lower = shift.toLowerCase();
  if (lower.includes('morning') || lower.includes('lunch')) return 'morning';
  if (lower.includes('evening') || lower.includes('dinner')) return 'evening';
  return 'default';
};

const getShiftColor = (shift?: string): string => {
  if (!shift) return 'medium';
  const lower = shift.toLowerCase();
  if (lower.includes('morning') || lower.includes('lunch')) return 'warning';
  if (lower.includes('evening') || lower.includes('dinner')) return 'tertiary';
  return 'medium';
};

const viewReport = (reportId: string) => {
  router.push(`/preview-report?id=${reportId}`);
};

const callCustomer = (phone: string) => {
  window.location.href = `tel:${phone}`;
};
</script>

<style scoped>
.calendar-content {
  --background: #f8f9fa;
}

.calendar-container {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 24px;
}

/* Inline Loading */
.inline-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.inline-loading ion-spinner {
  width: 40px;
  height: 40px;
  color: #667eea;
}

.inline-loading p {
  margin: 12px 0 0 0;
  color: #888;
  font-size: 0.95rem;
}

/* Calendar Navigation */
.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.25);
}

.nav-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.35);
}

.nav-btn:active {
  transform: scale(0.95);
}

.nav-btn ion-icon {
  font-size: 20px;
  color: white;
}

/* Calendar Grid Container */
.calendar-grid-container {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* Selected Date Section */
.selected-date-section {
  margin-top: 24px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.selected-date-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

.selected-date-title ion-icon {
  color: #667eea;
  font-size: 22px;
}

.selected-events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

/* Custom scrollbar for selected events list */
.selected-events-list::-webkit-scrollbar {
  width: 6px;
}

.selected-events-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.selected-events-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.selected-events-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
}

.no-events-message {
  text-align: center;
  padding: 24px;
  color: #888;
}

.no-events-message p {
  margin: 0;
  font-size: 0.95rem;
}

/* Select Date Prompt */
.select-date-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  margin-top: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.select-date-prompt ion-icon {
  font-size: 48px;
  color: #ddd;
  margin-bottom: 12px;
}

.select-date-prompt p {
  margin: 0;
  color: #888;
  font-size: 0.95rem;
}

/* Selected Day in Calendar */
.calendar-day.selected {
  background: rgba(102, 126, 234, 0.2);
  border: 2px solid #667eea;
}

.calendar-day.selected .day-number {
  color: #667eea;
  font-weight: 700;
}

/* Upcoming Events Card */
.upcoming-card {
  border-radius: 16px;
}

.upcoming-card ion-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
}

.upcoming-card ion-card-title ion-icon {
  color: #667eea;
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 480px;
  overflow-y: auto;
  padding-right: 8px;
}

/* Custom scrollbar for upcoming list */
.upcoming-list::-webkit-scrollbar {
  width: 6px;
}

.upcoming-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.upcoming-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.upcoming-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
}

.upcoming-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.upcoming-item:hover {
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
  border-color: #667eea;
}

.event-left {
  flex-shrink: 0;
}

.event-date-badge {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.event-date-badge.today {
  background: linear-gradient(135deg, #2dd36f 0%, #1aa251 100%);
  box-shadow: 0 4px 12px rgba(45, 211, 111, 0.3);
}

.event-date-badge .day {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
}

.event-date-badge .month {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.event-center {
  flex: 1;
  min-width: 0;
}

.customer-name {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.shift-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.shift-badge.morning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
  color: #856404;
}

.shift-badge.evening {
  background: linear-gradient(135deg, #e2d5f1 0%, #d4c4e8 100%);
  color: #5a3d7a;
}

.shift-badge.default {
  background: linear-gradient(135deg, #e8f4fd 0%, #d6ebf9 100%);
  color: #0c5ea9;
}

.people-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.people-count ion-icon {
  font-size: 14px;
  color: #888;
}

.phone-text {
  margin: 0;
  font-size: 0.85rem;
  color: #888;
  font-weight: 500;
}

.event-right {
  flex-shrink: 0;
}

.call-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: linear-gradient(135deg, #2dd36f 0%, #1aa251 100%);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(45, 211, 111, 0.25);
}

.call-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 16px rgba(45, 211, 111, 0.35);
}

.call-btn:active {
  transform: scale(0.95);
}

.call-btn ion-icon {
  font-size: 22px;
  color: white;
}

/* Calendar Card */
.calendar-card {
  border-radius: 16px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.month-label {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
  cursor: pointer;
}

.month-label:hover {
  color: #667eea;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  padding: 8px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.calendar-day:hover {
  background: rgba(102, 126, 234, 0.1);
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.calendar-day.today .day-number {
  color: white;
}

.calendar-day.has-events {
  font-weight: 700;
}

.day-number {
  font-size: 0.9rem;
  color: #333;
}

.event-dots {
  display: flex;
  gap: 3px;
  margin-top: 2px;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.event-dot.morning {
  background: #ffc409;
}

.event-dot.evening {
  background: #764ba2;
}

.event-dot.default {
  background: #667eea;
}

.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #666;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.morning {
  background: #ffc409;
}

.legend-dot.evening {
  background: #764ba2;
}

.legend-dot.default {
  background: #667eea;
}

/* Events Card */
.events-card {
  border-radius: 16px;
}

.events-card ion-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.events-card ion-card-title ion-icon {
  color: #667eea;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.event-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.event-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.event-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #666;
}

.detail-item ion-icon {
  font-size: 16px;
  color: #667eea;
}

.event-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Responsive */
@media (max-width: 480px) {
  .calendar-day {
    aspect-ratio: auto;
    min-height: 40px;
  }

  .day-number {
    font-size: 0.8rem;
  }

  .event-dot {
    width: 4px;
    height: 4px;
  }
}
</style>
