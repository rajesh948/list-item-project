import { getToken, onMessage, type Messaging } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { NotificationPreferences } from '~/stores/user';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, string>;
}

export function useNotifications() {
  const { $messaging, $db } = useNuxtApp();
  const userStore = useUserStore();
  const { showToast } = useToast();

  const permissionStatus = ref<'granted' | 'denied' | 'default'>('default');
  const isSupported = ref(false);
  const currentToken = ref<string | null>(null);

  // VAPID key for FCM (you need to generate this in Firebase Console)
  const VAPID_KEY = 'YOUR_VAPID_KEY_HERE'; // Replace with actual VAPID key from Firebase Console

  // Check if notifications are supported
  const checkSupport = () => {
    isSupported.value = 'Notification' in window && 'serviceWorker' in navigator;
    if (isSupported.value) {
      permissionStatus.value = Notification.permission as 'granted' | 'denied' | 'default';
    }
    return isSupported.value;
  };

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!checkSupport()) {
      showToast('Notifications are not supported in this browser', 'warning');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      permissionStatus.value = permission as 'granted' | 'denied' | 'default';

      if (permission === 'granted') {
        showToast('Notifications enabled!', 'success');
        await registerServiceWorker();
        await getAndSaveToken();
        return true;
      } else if (permission === 'denied') {
        showToast('Notifications blocked. Enable them in browser settings.', 'warning');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      showToast('Failed to enable notifications', 'error');
      return false;
    }
  };

  // Register service worker for FCM
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  };

  // Get FCM token and save to user document
  const getAndSaveToken = async () => {
    if (!$messaging || !userStore.user?.uid) return null;

    try {
      const messaging = $messaging as Messaging;
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });

      if (token) {
        currentToken.value = token;

        // Save token to user document
        const userRef = doc($db, 'users', userStore.user.uid);
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(token),
        });

        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  };

  // Remove FCM token (on logout or disable notifications)
  const removeToken = async () => {
    if (!currentToken.value || !userStore.user?.uid) return;

    try {
      const userRef = doc($db, 'users', userStore.user.uid);
      await updateDoc(userRef, {
        fcmTokens: arrayRemove(currentToken.value),
      });
      currentToken.value = null;
    } catch (error) {
      console.error('Error removing FCM token:', error);
    }
  };

  // Update notification preferences
  const updatePreferences = async (preferences: Partial<NotificationPreferences>) => {
    if (!userStore.user?.uid) return;

    try {
      const userRef = doc($db, 'users', userStore.user.uid);
      const currentPrefs = userStore.notificationPreferences;

      await updateDoc(userRef, {
        notificationPreferences: {
          ...currentPrefs,
          ...preferences,
        },
      });

      showToast('Notification preferences updated', 'success');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      showToast('Failed to update preferences', 'error');
    }
  };

  // Setup foreground message listener
  const setupMessageListener = () => {
    if (!$messaging) return;

    const messaging = $messaging as Messaging;
    onMessage(messaging, (payload) => {
      // Show in-app notification
      if (payload.notification) {
        showInAppNotification({
          title: payload.notification.title || 'CaterHub',
          body: payload.notification.body || '',
          icon: payload.notification.icon,
          data: payload.data,
        });
      }
    });
  };

  // Show in-app notification (toast or custom UI)
  const showInAppNotification = (notification: NotificationPayload) => {
    // Show as toast for now
    showToast(`${notification.title}: ${notification.body}`, 'info', 5000);

    // Also show browser notification if page is in background
    if (document.hidden && permissionStatus.value === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/icon-192.png',
      });
    }
  };

  // Send local notification (for testing)
  const sendLocalNotification = (title: string, body: string) => {
    if (permissionStatus.value !== 'granted') {
      showToast('Please enable notifications first', 'warning');
      return;
    }

    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-72.png',
    });
  };

  // Initialize notifications on mount
  const initNotifications = async () => {
    checkSupport();

    if (permissionStatus.value === 'granted' && userStore.user?.uid) {
      await registerServiceWorker();
      await getAndSaveToken();
      setupMessageListener();
    }
  };

  return {
    permissionStatus,
    isSupported,
    currentToken,
    checkSupport,
    requestPermission,
    removeToken,
    updatePreferences,
    setupMessageListener,
    showInAppNotification,
    sendLocalNotification,
    initNotifications,
  };
}
