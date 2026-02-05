import { defineStore } from 'pinia';
import type { Timestamp } from 'firebase/firestore';

export interface Subscription {
  plan: 'free' | 'monthly' | 'yearly';
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  status: 'active' | 'expired' | 'pending';
}

export interface PdfUsage {
  count: number;
  periodStart: Timestamp;
}

export interface PdfBranding {
  logo?: string; // Base64 encoded logo
  accentColor?: string; // Hex color for accent
  headerColor?: string; // Hex color for header
  showAddress?: boolean;
  showPhone?: boolean;
  address?: string;
  tagline?: string;
}

export interface ReminderSettings {
  enabled: boolean;
  timing: 'same_day' | '1_day_before' | '2_days_before' | '1_week_before';
  time: string; // HH:mm format e.g., "09:00"
  notificationPermission?: 'granted' | 'denied' | 'default';
}

export interface NotificationPreferences {
  premiumExpiry: boolean;      // Notify before subscription expires
  newFeatures: boolean;        // Notify about new features/updates
  eventReminders: boolean;     // Remind about upcoming events
  requestUpdates: boolean;     // Notify when premium request approved/rejected
}

export interface SubscriptionHistoryEntry {
  action: 'upgraded' | 'downgraded' | 'expired' | 'renewed';
  description: string;
  date: Timestamp;
  notes?: string;
  adminId?: string;
}

export interface UserData {
  uid: string;
  username?: string;
  email?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  businessName?: string;
  phoneNumber?: string;
  // Subscription fields
  emailVerified?: boolean;
  subscription?: Subscription;
  subscriptionHistory?: SubscriptionHistoryEntry[];
  pdfUsage?: PdfUsage;
  registrationSource?: 'admin' | 'self';
  // PDF Branding (Premium feature)
  pdfBranding?: PdfBranding;
  // Event Reminder Settings
  reminderSettings?: ReminderSettings;
  // Push Notification Settings
  fcmTokens?: string[];                        // Array of FCM tokens (multiple devices)
  notificationPreferences?: NotificationPreferences;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as UserData | null,
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
    isAdmin: (state) => state.user?.role === 'admin',
    userName: (state) => state.user?.username || '',
    userEmail: (state) => state.user?.email || '',
    subscriptionPlan: (state) => state.user?.subscription?.plan || 'free',
    subscriptionStatus: (state) => state.user?.subscription?.status || 'active',
    isPremium: (state) => {
      const sub = state.user?.subscription;
      if (!sub) return false;
      if (sub.plan === 'free') return false;
      if (sub.status !== 'active') return false;
      if (sub.endDate) {
        const endDate = sub.endDate.toDate ? sub.endDate.toDate() : new Date(sub.endDate);
        if (endDate < new Date()) return false;
      }
      return true;
    },
    pdfCount: (state) => state.user?.pdfUsage?.count || 0,
    pdfBranding: (state) => state.user?.pdfBranding || null,
    reminderSettings: (state) => state.user?.reminderSettings || {
      enabled: false,
      timing: '1_day_before',
      time: '09:00',
      notificationPermission: 'default',
    },
    notificationPreferences: (state) => state.user?.notificationPreferences || {
      premiumExpiry: true,
      newFeatures: true,
      eventReminders: true,
      requestUpdates: true,
    },
    fcmTokens: (state) => state.user?.fcmTokens || [],
  },

  actions: {
    setUser(userData: UserData) {
      this.user = userData;
    },

    clearUser() {
      this.user = null;
    },

    setLoading(loading: boolean) {
      this.isLoading = loading;
    },
  },
});
