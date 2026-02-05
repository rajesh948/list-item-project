/**
 * Calendar Composable
 * Provides calendar functionality for viewing scheduled events
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { useUserStore } from '~/stores/user';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  shift?: string;
  customerName: string;
  customerPhone?: string;
  address?: string;
  noOfPeople?: string;
  reportId: string;
}

export function useCalendar() {
  const { $db } = useNuxtApp();
  const userStore = useUserStore();

  const events = ref<CalendarEvent[]>([]);
  const isLoading = ref(false);
  const currentMonth = ref(new Date());

  /**
   * Get shift priority for sorting (Morning=1, Afternoon=2, Evening/Night=3)
   */
  const getShiftPriority = (shift?: string): number => {
    if (!shift) return 4; // No shift = last
    const lower = shift.toLowerCase();
    if (lower.includes('morning') || lower.includes('lunch')) return 1;
    if (lower.includes('afternoon')) return 2;
    if (lower.includes('evening') || lower.includes('dinner') || lower.includes('night')) return 3;
    return 4; // Unknown shift
  };

  /**
   * Sort events by date first, then by shift (Morning → Afternoon → Night)
   */
  const sortEvents = (eventsList: CalendarEvent[]): CalendarEvent[] => {
    return [...eventsList].sort((a, b) => {
      // First sort by date
      const dateCompare = a.date.getTime() - b.date.getTime();
      if (dateCompare !== 0) return dateCompare;
      // Then sort by shift priority
      return getShiftPriority(a.shift) - getShiftPriority(b.shift);
    });
  };

  /**
   * Parse date string to Date object
   * Handles formats like "25/01/2026", "25-01-2026", "2026-01-25"
   */
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;

    // Try DD/MM/YYYY format
    let match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      const [, day, month, year] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Try YYYY-MM-DD format
    match = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (match) {
      const [, year, month, day] = match;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // Try parsing as standard date
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  /**
   * Load events from saved reports
   */
  const loadEvents = async (force = false) => {
    if (!userStore.user?.uid) return [];

    isLoading.value = true;
    try {
      // Simple query without orderBy to avoid composite index requirement
      const q = query(
        collection($db, 'savedReports'),
        where('userId', '==', userStore.user.uid)
      );

      const snapshot = await getDocs(q);
      const loadedEvents: CalendarEvent[] = [];

      console.log('Calendar: Found', snapshot.docs.length, 'saved reports');

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        // Reports use 'reportData' not 'userData'
        const reportData = data.reportData;

        console.log('Calendar: Report data:', reportData);

        if (reportData?.date) {
          const eventDate = parseDate(reportData.date);
          console.log('Calendar: Parsed date', reportData.date, '->', eventDate);
          if (eventDate) {
            loadedEvents.push({
              id: doc.id,
              title: reportData.name || 'Event',
              date: eventDate,
              shift: reportData.shift,
              customerName: reportData.name || 'Unknown',
              customerPhone: reportData.phone,
              address: reportData.address,
              noOfPeople: reportData.noOfPeople,
              reportId: doc.id,
            });
          }
        }
      });

      events.value = loadedEvents;
      return loadedEvents;
    } catch (error) {
      console.error('Error loading calendar events:', error);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get events for a specific date (sorted by shift)
   */
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const filtered = events.value.filter((event) => {
      return (
        event.date.getFullYear() === date.getFullYear() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getDate() === date.getDate()
      );
    });
    // Sort by shift priority (Morning → Afternoon → Night)
    return filtered.sort((a, b) => getShiftPriority(a.shift) - getShiftPriority(b.shift));
  };

  /**
   * Get events for current month
   */
  const getEventsForMonth = (year: number, month: number): CalendarEvent[] => {
    return events.value.filter((event) => {
      return event.date.getFullYear() === year && event.date.getMonth() === month;
    });
  };

  /**
   * Get upcoming events (next 7 days) sorted by date then shift
   */
  const upcomingEvents = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const filtered = events.value.filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today && eventDate <= nextWeek;
    });

    // Sort by date first, then by shift priority (Morning → Afternoon → Night)
    return sortEvents(filtered);
  });

  /**
   * Get today's events
   */
  const todaysEvents = computed(() => {
    const today = new Date();
    return getEventsForDate(today);
  });

  /**
   * Navigate to previous month
   */
  const prevMonth = () => {
    const newDate = new Date(currentMonth.value);
    newDate.setMonth(newDate.getMonth() - 1);
    currentMonth.value = newDate;
  };

  /**
   * Navigate to next month
   */
  const nextMonth = () => {
    const newDate = new Date(currentMonth.value);
    newDate.setMonth(newDate.getMonth() + 1);
    currentMonth.value = newDate;
  };

  /**
   * Go to today
   */
  const goToToday = () => {
    currentMonth.value = new Date();
  };

  /**
   * Get calendar days for current month view
   */
  const calendarDays = computed(() => {
    const year = currentMonth.value.getFullYear();
    const month = currentMonth.value.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from the first Sunday before or on the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // End on the last Saturday after or on the last day
    const endDate = new Date(lastDay);
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: CalendarEvent[];
    }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const current = new Date(startDate);
    while (current <= endDate) {
      const dateEvents = getEventsForDate(current);
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.getTime() === today.getTime(),
        events: dateEvents,
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  });

  /**
   * Format month/year for display
   */
  const currentMonthLabel = computed(() => {
    return currentMonth.value.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  });

  return {
    // State
    events,
    isLoading,
    currentMonth,

    // Computed
    calendarDays,
    currentMonthLabel,
    upcomingEvents,
    todaysEvents,

    // Methods
    loadEvents,
    getEventsForDate,
    getEventsForMonth,
    prevMonth,
    nextMonth,
    goToToday,
    parseDate,
  };
}
