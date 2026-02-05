/**
 * PDF Branding Composable
 * Provides branding functionality for PDF generation (Premium feature)
 */

import { doc, updateDoc } from 'firebase/firestore';
import { useUserStore, type PdfBranding } from '~/stores/user';

export function usePdfBranding() {
  const { $db } = useNuxtApp();
  const userStore = useUserStore();
  const { isPremium } = useSubscription();

  /**
   * Check if user can access branding features (premium only)
   */
  const canAccessBranding = computed(() => isPremium.value);

  /**
   * Get current branding settings
   */
  const branding = computed(() => userStore.pdfBranding);

  /**
   * Default branding values
   */
  const defaultBranding: PdfBranding = {
    accentColor: '#667eea',
    headerColor: '#333333',
    showAddress: true,
    showPhone: true,
  };

  /**
   * Get effective branding (user's or defaults)
   */
  const effectiveBranding = computed(() => ({
    ...defaultBranding,
    ...branding.value,
  }));

  /**
   * Compress and convert image to base64
   * Limits image size to fit within Firestore limits
   */
  const compressImage = (file: File, maxWidth = 300, maxHeight = 150): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Calculate new dimensions
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw image with white background (for transparent PNGs)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with quality compression
          const base64 = canvas.toDataURL('image/jpeg', 0.8);

          // Check size (max ~100KB for Firestore safety)
          if (base64.length > 100000) {
            // Try with lower quality
            const lowerQuality = canvas.toDataURL('image/jpeg', 0.5);
            if (lowerQuality.length > 100000) {
              reject(new Error('Image too large. Please use a smaller image.'));
              return;
            }
            resolve(lowerQuality);
          } else {
            resolve(base64);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  /**
   * Remove undefined values from object (Firestore doesn't accept undefined)
   */
  const removeUndefined = (obj: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        result[key] = obj[key];
      }
    }
    return result;
  };

  /**
   * Update branding settings
   */
  const updateBranding = async (
    updates: Partial<PdfBranding>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!userStore.user?.uid) {
      return { success: false, error: 'Not authenticated' };
    }

    if (!canAccessBranding.value) {
      return { success: false, error: 'Premium subscription required' };
    }

    try {
      const userRef = doc($db, 'users', userStore.user.uid);
      // Remove undefined values as Firestore doesn't accept them
      const cleanedUpdates = removeUndefined(updates);
      const newBranding = removeUndefined({
        ...branding.value,
        ...cleanedUpdates,
      });

      await updateDoc(userRef, {
        pdfBranding: newBranding,
      });

      // Update local state
      if (userStore.user) {
        userStore.setUser({
          ...userStore.user,
          pdfBranding: newBranding,
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating branding:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Upload and save logo
   */
  const uploadLogo = async (
    file: File
  ): Promise<{ success: boolean; error?: string }> => {
    if (!canAccessBranding.value) {
      return { success: false, error: 'Premium subscription required' };
    }

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Please upload an image file' };
      }

      // Compress and convert to base64
      const base64 = await compressImage(file);

      // Save to user document
      return await updateBranding({ logo: base64 });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Remove logo
   */
  const removeLogo = async (): Promise<{ success: boolean; error?: string }> => {
    return await updateBranding({ logo: undefined });
  };

  /**
   * Reset branding to defaults
   */
  const resetBranding = async (): Promise<{ success: boolean; error?: string }> => {
    if (!userStore.user?.uid) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const userRef = doc($db, 'users', userStore.user.uid);
      await updateDoc(userRef, {
        pdfBranding: defaultBranding,
      });

      // Update local state
      if (userStore.user) {
        userStore.setUser({
          ...userStore.user,
          pdfBranding: defaultBranding,
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error resetting branding:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    // State
    branding,
    effectiveBranding,
    canAccessBranding,
    defaultBranding,

    // Methods
    updateBranding,
    uploadLogo,
    removeLogo,
    resetBranding,
    compressImage,
  };
}
