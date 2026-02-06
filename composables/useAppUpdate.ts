import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { doc, getDoc } from 'firebase/firestore';

export interface AppVersionInfo {
  currentVersion: string;
  latestVersion: string;
  minRequiredVersion: string;
  updateUrl: string;
  releaseNotes: string;
  forceUpdate: boolean;
  isUpdateAvailable: boolean;
  isOptionalUpdate: boolean; // Update available but not required
}

export function useAppUpdate() {
  const { $db } = useNuxtApp();
  const { showToast } = useToast();

  const isChecking = ref(false);
  const updateInfo = ref<AppVersionInfo | null>(null);
  const showUpdateModal = ref(false);
  const hasUpdateNotification = ref(false); // For header notification icon

  // Current app version (update this when releasing new versions)
  const APP_VERSION = '1.0.1';

  // Get current app version
  const getCurrentVersion = async (): Promise<string> => {
    if (Capacitor.isNativePlatform()) {
      try {
        const info = await App.getInfo();
        return info.version;
      } catch {
        return APP_VERSION;
      }
    }
    return APP_VERSION;
  };

  // Compare versions (returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2)
  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }
    return 0;
  };

  // Check for updates from Firestore (ONLY on native mobile apps, not web)
  const checkForUpdate = async (): Promise<AppVersionInfo | null> => {
    if (!process.client) return null;

    // Only check for updates on native mobile apps (Android/iOS)
    // Web app is always up-to-date via CI/CD deployment
    if (!Capacitor.isNativePlatform()) {
      console.log('Skipping update check - web app is always up-to-date');
      return null;
    }

    isChecking.value = true;

    try {
      const currentVersion = await getCurrentVersion();

      // Get latest version info from Firestore
      const versionDoc = await getDoc(doc($db, 'appConfig', 'version'));

      if (!versionDoc.exists()) {
        console.log('No version config found in Firestore');
        return null;
      }

      const data = versionDoc.data();
      const latestVersion = data.latestVersion || '1.0.0';
      const minRequiredVersion = data.minRequiredVersion || '1.0.0';
      const updateUrl = data.updateUrl || 'https://caterhub.web.app';
      const releaseNotes = data.releaseNotes || 'Bug fixes and improvements';

      const isUpdateAvailable = compareVersions(currentVersion, latestVersion) < 0;
      const forceUpdate = compareVersions(currentVersion, minRequiredVersion) < 0;
      const isOptionalUpdate = isUpdateAvailable && !forceUpdate;

      updateInfo.value = {
        currentVersion,
        latestVersion,
        minRequiredVersion,
        updateUrl,
        releaseNotes,
        forceUpdate,
        isUpdateAvailable,
        isOptionalUpdate,
      };

      // Set notification flag if update available
      if (isUpdateAvailable) {
        hasUpdateNotification.value = true;

        // Show modal only for force updates on app launch
        // For optional updates, just show notification icon
        if (forceUpdate) {
          showUpdateModal.value = true;
        }
      }

      return updateInfo.value;
    } catch (error) {
      console.error('Error checking for update:', error);
      return null;
    } finally {
      isChecking.value = false;
    }
  };

  // Open update URL (landing page or Play Store)
  const openUpdateUrl = async () => {
    if (!updateInfo.value?.updateUrl) return;

    const url = updateInfo.value.updateUrl;

    if (Capacitor.isNativePlatform()) {
      // Open in external browser
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url });
    } else {
      // Web - open in new tab
      window.open(url, '_blank');
    }
  };

  // Dismiss update modal (only if not force update)
  const dismissUpdate = () => {
    if (updateInfo.value?.forceUpdate) {
      showToast('This update is required to continue using the app', 'error');
      return;
    }
    showUpdateModal.value = false;
  };

  // Check for update on app launch (call this in app.vue or layout)
  const initUpdateCheck = async () => {
    // Small delay to let app initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    await checkForUpdate();
  };

  // Show update modal manually (when user clicks notification icon)
  const showUpdateModalManually = () => {
    if (updateInfo.value?.isUpdateAvailable) {
      showUpdateModal.value = true;
    }
  };

  // Clear notification (after user has seen the modal)
  const clearUpdateNotification = () => {
    hasUpdateNotification.value = false;
  };

  return {
    isChecking,
    updateInfo,
    showUpdateModal,
    hasUpdateNotification,
    APP_VERSION,
    getCurrentVersion,
    checkForUpdate,
    openUpdateUrl,
    dismissUpdate,
    initUpdateCheck,
    showUpdateModalManually,
    clearUpdateNotification,
  };
}
