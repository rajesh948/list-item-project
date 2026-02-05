import { defineStore } from 'pinia';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

export interface UpiMethod {
  id: string;
  name: string;
  upiId: string;
}

export interface BankMethod {
  id: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolder: string;
}

export interface AppSettings {
  pdfLimits: {
    count: number;
    period: 'day' | 'week' | 'month' | 'year';
  };
  pricing: {
    monthly: number;
    yearly: number;
    currency: 'INR';
  };
  paymentMethods: {
    upi: UpiMethod[];
    bank: BankMethod[];
  };
  watermarkText: string;
  updatedAt: Timestamp | null;
  updatedBy: string | null;
}

const DEFAULT_SETTINGS: AppSettings = {
  pdfLimits: { count: 5, period: 'month' },
  pricing: { monthly: 99, yearly: 999, currency: 'INR' },
  paymentMethods: {
    upi: [],
    bank: [],
  },
  watermarkText: 'CaterHub',
  updatedAt: null,
  updatedBy: null,
};

export const useAppSettingsStore = defineStore('appSettings', {
  state: () => ({
    settings: { ...DEFAULT_SETTINGS } as AppSettings,
    isLoading: false,
    lastFetched: null as Date | null,
  }),

  getters: {
    pdfLimit: (state) => state.settings.pdfLimits.count,
    limitPeriod: (state) => state.settings.pdfLimits.period,
    monthlyPrice: (state) => state.settings.pricing.monthly,
    yearlyPrice: (state) => state.settings.pricing.yearly,
    currency: (state) => state.settings.pricing.currency,
    upiMethods: (state) => state.settings.paymentMethods?.upi || [],
    bankMethods: (state) => state.settings.paymentMethods?.bank || [],
    watermarkText: (state) => state.settings.watermarkText || 'CaterHub',
  },

  actions: {
    async fetchSettings(force = false) {
      const { $db } = useNuxtApp();

      // Cache for 5 minutes
      if (!force && this.lastFetched) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (this.lastFetched > fiveMinutesAgo) {
          return this.settings;
        }
      }

      this.isLoading = true;
      try {
        const docRef = doc($db, 'appSettings', 'config');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.settings = docSnap.data() as AppSettings;
        } else {
          // Create default settings if not exists
          await setDoc(docRef, {
            ...DEFAULT_SETTINGS,
            updatedAt: Timestamp.now(),
          });
          this.settings = { ...DEFAULT_SETTINGS };
        }
        this.lastFetched = new Date();
        return this.settings;
      } catch (error) {
        console.error('Error fetching app settings:', error);
        return this.settings;
      } finally {
        this.isLoading = false;
      }
    },

    async refreshSettings() {
      return this.fetchSettings(true);
    },

    async updateSettings(updates: Partial<AppSettings>, updatedBy: string) {
      const { $db } = useNuxtApp();

      try {
        const docRef = doc($db, 'appSettings', 'config');
        const newSettings = {
          ...this.settings,
          ...updates,
          updatedAt: Timestamp.now(),
          updatedBy,
        };
        await setDoc(docRef, newSettings);
        this.settings = newSettings as AppSettings;
        this.lastFetched = new Date();
        return { success: true };
      } catch (error) {
        console.error('Error updating app settings:', error);
        return { success: false, error: 'Failed to update settings' };
      }
    },

    async updatePdfLimits(count: number, period: 'day' | 'week' | 'month' | 'year', updatedBy: string) {
      return this.updateSettings({
        pdfLimits: { count, period },
      }, updatedBy);
    },

    async updatePricing(monthly: number, yearly: number, updatedBy: string) {
      return this.updateSettings({
        pricing: { monthly, yearly, currency: 'INR' },
      }, updatedBy);
    },

    async updatePaymentMethods(paymentMethods: { upi: UpiMethod[], bank: BankMethod[] }, updatedBy: string) {
      return this.updateSettings({
        paymentMethods,
      }, updatedBy);
    },

    clearSettings() {
      this.settings = { ...DEFAULT_SETTINGS };
      this.lastFetched = null;
    },
  },
});
