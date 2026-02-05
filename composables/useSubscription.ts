import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { useUserStore } from '~/stores/user';
import { useAppSettingsStore } from '~/stores/appSettings';

export function useSubscription() {
  const { $db } = useNuxtApp();
  const userStore = useUserStore();
  const appSettingsStore = useAppSettingsStore();

  const isPremium = computed(() => userStore.isPremium);

  const subscriptionPlan = computed(() => userStore.subscriptionPlan);

  const subscriptionStatus = computed(() => userStore.subscriptionStatus);

  const subscriptionEndDate = computed(() => {
    const endDate = userStore.user?.subscription?.endDate;
    if (!endDate) return null;
    return endDate.toDate ? endDate.toDate() : new Date(endDate);
  });

  const getPeriodStart = (period: string): Date => {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const dayOfWeek = now.getDay();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  };

  const canGeneratePdf = async (): Promise<boolean> => {
    // Premium users have unlimited PDFs
    if (isPremium.value) return true;

    // Fetch settings to get current limits
    await appSettingsStore.fetchSettings();
    const limit = appSettingsStore.pdfLimit;
    const period = appSettingsStore.limitPeriod;

    const pdfUsage = userStore.user?.pdfUsage;

    // If no usage data exists, user can generate
    if (!pdfUsage) return true;

    const periodStart = getPeriodStart(period);
    const usagePeriodStart = pdfUsage.periodStart?.toDate?.()
      || (pdfUsage.periodStart ? new Date(pdfUsage.periodStart) : new Date(0));

    // Reset if new period has started
    if (usagePeriodStart < periodStart) {
      return true;
    }

    return pdfUsage.count < limit;
  };

  const getRemainingPdfs = async (): Promise<number> => {
    // Premium users have unlimited PDFs
    if (isPremium.value) return -1; // -1 indicates unlimited

    await appSettingsStore.fetchSettings();
    const limit = appSettingsStore.pdfLimit;
    const period = appSettingsStore.limitPeriod;

    const pdfUsage = userStore.user?.pdfUsage;

    // If no usage data exists, user has full limit
    if (!pdfUsage) return limit;

    const periodStart = getPeriodStart(period);
    const usagePeriodStart = pdfUsage.periodStart?.toDate?.()
      || (pdfUsage.periodStart ? new Date(pdfUsage.periodStart) : new Date(0));

    // If new period has started, user has full limit
    if (usagePeriodStart < periodStart) {
      return limit;
    }

    return Math.max(0, limit - pdfUsage.count);
  };

  const incrementPdfCount = async (): Promise<void> => {
    if (!userStore.user?.uid) return;

    // Premium users don't need tracking
    if (isPremium.value) return;

    await appSettingsStore.fetchSettings();
    const period = appSettingsStore.limitPeriod;
    const periodStart = getPeriodStart(period);

    const pdfUsage = userStore.user?.pdfUsage;
    const usagePeriodStart = pdfUsage?.periodStart?.toDate?.()
      || (pdfUsage?.periodStart ? new Date(pdfUsage.periodStart) : new Date(0));

    let newCount = 1;
    let newPeriodStart = Timestamp.fromDate(periodStart);

    // If still in same period, increment existing count
    if (usagePeriodStart >= periodStart) {
      newCount = (pdfUsage?.count || 0) + 1;
      newPeriodStart = pdfUsage?.periodStart || Timestamp.fromDate(periodStart);
    }

    try {
      const userRef = doc($db, 'users', userStore.user.uid);
      await updateDoc(userRef, {
        pdfUsage: {
          count: newCount,
          periodStart: newPeriodStart,
        },
        updatedAt: Timestamp.now(),
      });

      // Update local store
      if (userStore.user) {
        userStore.user.pdfUsage = {
          count: newCount,
          periodStart: newPeriodStart,
        };
      }
    } catch (error) {
      console.error('Error incrementing PDF count:', error);
    }
  };

  const formatSubscriptionEndDate = computed(() => {
    const endDate = subscriptionEndDate.value;
    if (!endDate) return null;
    return endDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  const daysUntilExpiry = computed(() => {
    const endDate = subscriptionEndDate.value;
    if (!endDate) return null;
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  });

  const isExpiringSoon = computed(() => {
    const days = daysUntilExpiry.value;
    if (days === null) return false;
    return days <= 7 && days > 0;
  });

  return {
    isPremium,
    subscriptionPlan,
    subscriptionStatus,
    subscriptionEndDate,
    formatSubscriptionEndDate,
    daysUntilExpiry,
    isExpiringSoon,
    canGeneratePdf,
    getRemainingPdfs,
    incrementPdfCount,
  };
}
