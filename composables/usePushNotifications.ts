import { PushNotifications, type Token, type PushNotificationSchema, type ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export function usePushNotifications() {
  const { $db } = useNuxtApp();
  const userStore = useUserStore();
  const { showToast } = useToast();

  const isNative = ref(false);
  const permissionStatus = ref<'granted' | 'denied' | 'default'>('default');
  const currentToken = ref<string | null>(null);
  const isSupported = ref(false);

  // Check platform
  const checkPlatform = () => {
    if (process.client) {
      isNative.value = Capacitor.isNativePlatform();
      isSupported.value = isNative.value || ('Notification' in window && 'serviceWorker' in navigator);
    }
    return isSupported.value;
  };

  // Initialize push notifications
  const initPushNotifications = async () => {
    if (!process.client) return;

    checkPlatform();

    if (isNative.value) {
      await initNativePush();
    } else {
      await initWebPush();
    }
  };

  // Native (Android/iOS) Push Notifications
  const initNativePush = async () => {
    try {
      // Request permission
      let permResult = await PushNotifications.checkPermissions();

      if (permResult.receive === 'prompt') {
        permResult = await PushNotifications.requestPermissions();
      }

      if (permResult.receive !== 'granted') {
        permissionStatus.value = 'denied';
        return;
      }

      permissionStatus.value = 'granted';

      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration success
      PushNotifications.addListener('registration', async (token: Token) => {
        currentToken.value = token.value;
        await saveTokenToFirestore(token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Push registration error:', error);
      });

      // Listen for push notifications received while app is in foreground
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        // Show in-app notification
        showToast(`${notification.title}: ${notification.body}`, 'info', 5000);
      });

      // Listen for notification action (user tapped notification)
      PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
        const data = action.notification.data;
        handleNotificationAction(data);
      });

    } catch (error) {
      console.error('Error initializing native push:', error);
    }
  };

  // Web Push Notifications (using Firebase)
  const initWebPush = async () => {
    if (!('Notification' in window)) {
      isSupported.value = false;
      return;
    }

    permissionStatus.value = Notification.permission as 'granted' | 'denied' | 'default';

    if (permissionStatus.value === 'granted') {
      // Web FCM is handled by useNotifications composable
      // This is just for permission status tracking
    }
  };

  // Request permission
  const requestPermission = async (): Promise<boolean> => {
    if (!checkPlatform()) {
      showToast('Push notifications not supported', 'warning');
      return false;
    }

    try {
      if (isNative.value) {
        const result = await PushNotifications.requestPermissions();
        permissionStatus.value = result.receive === 'granted' ? 'granted' : 'denied';

        if (result.receive === 'granted') {
          await PushNotifications.register();
          showToast('Notifications enabled!', 'success');
          return true;
        } else {
          showToast('Notifications permission denied', 'warning');
          return false;
        }
      } else {
        // Web notification permission
        const permission = await Notification.requestPermission();
        permissionStatus.value = permission as 'granted' | 'denied' | 'default';
        return permission === 'granted';
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  // Save FCM token to Firestore
  const saveTokenToFirestore = async (token: string) => {
    if (!userStore.user?.uid || !token) return;

    try {
      const userRef = doc($db, 'users', userStore.user.uid);
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(token),
        lastTokenUpdate: new Date(),
      });
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  };

  // Remove FCM token from Firestore
  const removeToken = async () => {
    if (!userStore.user?.uid || !currentToken.value) return;

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

  // Handle notification action (when user taps notification)
  const handleNotificationAction = (data: any) => {
    if (!data) return;

    // Navigate based on notification type
    if (data.type === 'event_reminder' && data.eventId) {
      navigateTo(`/calendar?event=${data.eventId}`);
    } else if (data.type === 'premium_approved') {
      navigateTo('/subscription');
    } else if (data.type === 'ticket_reply' && data.ticketId) {
      navigateTo(`/support?ticket=${data.ticketId}`);
    }
  };

  // Send local notification (for testing)
  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    if (!isNative.value) {
      // Web notification
      if (permissionStatus.value === 'granted') {
        new Notification(title, { body, icon: '/icon-192.png' });
      }
      return;
    }

    // Native local notification
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            extra: data,
          },
        ],
      });
    } catch {
      // Local notifications plugin not installed, use toast instead
      showToast(`${title}: ${body}`, 'info', 5000);
    }
  };

  // Cleanup listeners
  const cleanup = async () => {
    if (isNative.value) {
      await PushNotifications.removeAllListeners();
    }
  };

  return {
    isNative,
    isSupported,
    permissionStatus,
    currentToken,
    checkPlatform,
    initPushNotifications,
    requestPermission,
    removeToken,
    sendLocalNotification,
    cleanup,
  };
}
