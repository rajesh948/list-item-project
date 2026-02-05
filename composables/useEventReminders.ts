/**
 * Event Reminders Composable
 * Handles event reminder notifications and settings
 */

import { doc, updateDoc } from 'firebase/firestore';
import { useUserStore, type ReminderSettings } from '~/stores/user';

export function useEventReminders() {
  const { $db } = useNuxtApp();
  const userStore = useUserStore();
  const { showToast } = useToast();

  // Default reminder settings
  const defaultSettings: ReminderSettings = {
    enabled: false,
    timing: '1_day_before',
    time: '09:00',
    notificationPermission: 'default',
  };

  // Get current settings
  const reminderSettings = computed(() => userStore.reminderSettings);

  /**
   * Check if browser notifications are supported
   */
  const isNotificationSupported = computed(() => {
    return typeof window !== 'undefined' && 'Notification' in window;
  });

  /**
   * Get current notification permission
   */
  const notificationPermission = computed(() => {
    if (!isNotificationSupported.value) return 'denied';
    return Notification.permission;
  });

  /**
   * Request notification permission
   */
  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!isNotificationSupported.value) {
      showToast('Notifications are not supported in this browser', 'warning', 3000);
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();

      // Update user settings with permission status
      if (userStore.user?.uid) {
        await updateReminderSettings({
          ...reminderSettings.value,
          notificationPermission: permission,
        });
      }

      if (permission === 'granted') {
        showToast('Notifications enabled successfully!', 'success', 2000);
      } else if (permission === 'denied') {
        showToast('Notification permission denied. Please enable in browser settings.', 'warning', 4000);
      }

      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      showToast('Failed to request notification permission', 'error', 3000);
      return 'default';
    }
  };

  /**
   * Update reminder settings in Firestore
   */
  const updateReminderSettings = async (settings: ReminderSettings): Promise<{ success: boolean; error?: string }> => {
    if (!userStore.user?.uid) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const userRef = doc($db, 'users', userStore.user.uid);
      await updateDoc(userRef, {
        reminderSettings: settings,
        updatedAt: new Date(),
      });

      // Update local store
      userStore.setUser({
        ...userStore.user,
        reminderSettings: settings,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating reminder settings:', error);
      return { success: false, error: error.message || 'Failed to update settings' };
    }
  };

  /**
   * Show a browser notification
   */
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!isNotificationSupported.value || notificationPermission.value !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon.png',
        badge: '/icon.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  };

  /**
   * Get the reminder date based on event date and timing setting
   */
  const getReminderDate = (eventDate: Date, timing: ReminderSettings['timing']): Date => {
    const reminderDate = new Date(eventDate);

    switch (timing) {
      case 'same_day':
        // Reminder on the same day
        break;
      case '1_day_before':
        reminderDate.setDate(reminderDate.getDate() - 1);
        break;
      case '2_days_before':
        reminderDate.setDate(reminderDate.getDate() - 2);
        break;
      case '1_week_before':
        reminderDate.setDate(reminderDate.getDate() - 7);
        break;
    }

    return reminderDate;
  };

  /**
   * Check if an event needs a reminder today
   */
  const shouldRemindToday = (eventDate: Date, timing: ReminderSettings['timing']): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminderDate = getReminderDate(eventDate, timing);
    reminderDate.setHours(0, 0, 0, 0);

    return reminderDate.getTime() === today.getTime();
  };

  /**
   * Get timing label for display
   */
  const getTimingLabel = (timing: ReminderSettings['timing']): string => {
    switch (timing) {
      case 'same_day':
        return 'Same day';
      case '1_day_before':
        return '1 day before';
      case '2_days_before':
        return '2 days before';
      case '1_week_before':
        return '1 week before';
      default:
        return timing;
    }
  };

  /**
   * Check events and show reminders
   * This should be called periodically or on app load
   */
  const checkAndShowReminders = async (events: Array<{ id: string; title: string; date: Date; shift?: string }>) => {
    const settings = reminderSettings.value;

    if (!settings.enabled || notificationPermission.value !== 'granted') {
      return;
    }

    const today = new Date();
    const [reminderHour, reminderMinute] = settings.time.split(':').map(Number);

    // Only show reminders if it's past the reminder time
    if (today.getHours() < reminderHour ||
        (today.getHours() === reminderHour && today.getMinutes() < reminderMinute)) {
      return;
    }

    // Check localStorage to see which reminders we've already shown today
    const shownKey = `reminders_shown_${today.toDateString()}`;
    const shownReminders: string[] = JSON.parse(localStorage.getItem(shownKey) || '[]');

    for (const event of events) {
      if (shownReminders.includes(event.id)) continue;

      if (shouldRemindToday(event.date, settings.timing)) {
        const daysUntil = Math.ceil((event.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        let body = '';

        if (daysUntil === 0) {
          body = `Event today${event.shift ? ` (${event.shift})` : ''}`;
        } else if (daysUntil === 1) {
          body = `Event tomorrow${event.shift ? ` (${event.shift})` : ''}`;
        } else {
          body = `Event in ${daysUntil} days${event.shift ? ` (${event.shift})` : ''}`;
        }

        showNotification(`Upcoming Event: ${event.title}`, {
          body,
          tag: `event-${event.id}`,
          requireInteraction: true,
        });

        // Mark as shown
        shownReminders.push(event.id);
      }
    }

    // Save shown reminders
    localStorage.setItem(shownKey, JSON.stringify(shownReminders));

    // Clean up old entries
    cleanupOldReminderLogs();
  };

  /**
   * Clean up old reminder logs from localStorage
   */
  const cleanupOldReminderLogs = () => {
    const today = new Date();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('reminders_shown_')) {
        const dateStr = key.replace('reminders_shown_', '');
        const date = new Date(dateStr);
        // Remove entries older than 7 days
        if (today.getTime() - date.getTime() > 7 * 24 * 60 * 60 * 1000) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  /**
   * Get upcoming events that need reminders
   */
  const getUpcomingReminders = (events: Array<{ id: string; title: string; date: Date; shift?: string }>) => {
    const settings = reminderSettings.value;
    if (!settings.enabled) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        // Event is in the future
        if (eventDate < today) return false;
        // Check if reminder would fire within the next 7 days
        const reminderDate = getReminderDate(eventDate, settings.timing);
        reminderDate.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        return reminderDate >= today && reminderDate <= sevenDaysFromNow;
      })
      .map(event => ({
        ...event,
        reminderDate: getReminderDate(event.date, settings.timing),
      }));
  };

  return {
    // State
    reminderSettings,
    isNotificationSupported,
    notificationPermission,
    defaultSettings,

    // Methods
    requestNotificationPermission,
    updateReminderSettings,
    showNotification,
    checkAndShowReminders,
    getUpcomingReminders,
    shouldRemindToday,
    getReminderDate,
    getTimingLabel,
  };
}
