<template>
  <div class="profile-page">
    <div class="ion-padding profile-content">
      <div class="profile-container">
        <!-- Profile Card -->
        <ion-card class="profile-card">
          <ion-card-header>
            <div class="profile-header">
              <div class="avatar-container">
                <ion-icon :icon="personCircleOutline" class="avatar-icon"></ion-icon>
              </div>
              <div class="profile-info">
                <h2>{{ userStore.userName || 'User' }}</h2>
                <p>{{ userStore.userEmail }}</p>
              </div>
              <button class="edit-profile-btn" @click="toggleEditMode">
                <ion-icon :icon="isEditing ? closeOutline : createOutline"></ion-icon>
              </button>
            </div>
          </ion-card-header>
          <ion-card-content>
            <!-- View Mode -->
            <div v-if="!isEditing" class="info-grid">
              <div class="info-item">
                <ion-icon :icon="businessOutline"></ion-icon>
                <div>
                  <label>Business Name</label>
                  <span>{{ businessName || 'Not set' }}</span>
                </div>
              </div>
              <div class="info-item">
                <ion-icon :icon="callOutline"></ion-icon>
                <div>
                  <label>Phone</label>
                  <span>{{ userStore.user?.phoneNumber || phoneNumbers || 'Not set' }}</span>
                </div>
              </div>
            </div>

            <!-- Edit Mode -->
            <div v-else class="edit-form">
              <div class="form-group">
                <label>Business Name</label>
                <input
                  v-model="profileForm.businessName"
                  type="text"
                  placeholder="Enter business name"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input
                  v-model="profileForm.phoneNumber"
                  type="tel"
                  placeholder="Enter phone number"
                  class="form-input"
                />
              </div>
              <div class="edit-actions">
                <button class="cancel-btn" @click="cancelEdit">Cancel</button>
                <button class="save-btn" @click="saveProfile" :disabled="isSavingProfile">
                  <ion-icon :icon="checkmarkOutline"></ion-icon>
                  {{ isSavingProfile ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Subscription Status Card -->
        <ion-card class="subscription-card">
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="diamondOutline"></ion-icon>
              Subscription Status
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="subscription-info">
              <div class="plan-badge" :class="isPremium ? 'premium' : 'free'">
                {{ isPremium ? (subscriptionPlan === 'yearly' ? 'Yearly Premium' : 'Monthly Premium') : 'Free Plan' }}
              </div>
              <div v-if="isPremium && subscriptionEndDate" class="expiry-info">
                <ion-icon :icon="timeOutline"></ion-icon>
                <span>Expires: {{ formatDate(subscriptionEndDate) }}</span>
              </div>
              <div v-if="!isPremium" class="usage-info">
                <ion-icon :icon="documentOutline"></ion-icon>
                <span>PDFs Used: {{ pdfCount }} / {{ pdfLimit }}</span>
              </div>
            </div>
            <ion-button v-if="!isPremium" expand="block" @click="goToSubscription" class="upgrade-btn">
              <ion-icon slot="start" :icon="arrowUpCircleOutline"></ion-icon>
              Upgrade to Premium
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- PDF Branding Section (Premium Only) -->
        <div class="branding-section-wrapper" :class="{ 'locked': !isPremium }">
          <div class="section-header">
            <div class="section-title">
              <ion-icon :icon="colorPaletteOutline"></ion-icon>
              <h3>PDF Branding</h3>
              <span v-if="!isPremium" class="premium-badge">Premium</span>
            </div>
          </div>

          <!-- Locked State -->
          <div v-if="!isPremium" class="locked-content">
            <div class="lock-icon-wrapper">
              <ion-icon :icon="lockClosedOutline"></ion-icon>
            </div>
            <h4>Unlock PDF Customization</h4>
            <p>Customize your PDF reports with your own branding, colors, and business details</p>
            <button class="upgrade-btn-modern" @click="goToSubscription">
              <ion-icon :icon="arrowUpCircleOutline"></ion-icon>
              Upgrade to Premium
            </button>
          </div>

          <!-- Branding Content -->
          <div v-else class="branding-grid">
            <!-- Left Column - Settings -->
            <div class="branding-settings">
              <!-- Tagline Input -->
              <div class="setting-card">
                <div class="setting-header">
                  <ion-icon :icon="textOutline"></ion-icon>
                  <span>Tagline</span>
                </div>
                <input
                  v-model="brandingForm.tagline"
                  type="text"
                  placeholder="e.g., Quality Catering Since 1990"
                  class="setting-input"
                  @blur="saveBranding"
                />
              </div>

              <!-- Address Input -->
              <div class="setting-card">
                <div class="setting-header">
                  <ion-icon :icon="locationOutline"></ion-icon>
                  <span>Business Address</span>
                </div>
                <textarea
                  v-model="brandingForm.address"
                  placeholder="Enter your business address for PDF"
                  class="setting-textarea"
                  rows="2"
                  @blur="saveBranding"
                ></textarea>
              </div>

              <!-- Toggle Options -->
              <div class="toggle-cards">
                <div class="toggle-card">
                  <div class="toggle-info">
                    <ion-icon :icon="locationOutline"></ion-icon>
                    <span>Show Address</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="brandingForm.showAddress" @change="saveBranding">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="toggle-card">
                  <div class="toggle-info">
                    <ion-icon :icon="callOutline"></ion-icon>
                    <span>Show Phone</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="brandingForm.showPhone" @change="saveBranding">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <!-- Color Pickers -->
              <div class="color-section">
                <h4>Brand Colors</h4>
                <div class="color-cards">
                  <div class="color-card">
                    <div class="color-preview" :style="{ background: brandingForm.headerColor }"></div>
                    <div class="color-info">
                      <label>Header</label>
                      <input
                        type="color"
                        v-model="brandingForm.headerColor"
                        @change="saveBranding"
                        class="color-input-hidden"
                      />
                      <span class="color-code">{{ brandingForm.headerColor }}</span>
                    </div>
                  </div>
                  <div class="color-card">
                    <div class="color-preview" :style="{ background: brandingForm.accentColor }"></div>
                    <div class="color-info">
                      <label>Accent</label>
                      <input
                        type="color"
                        v-model="brandingForm.accentColor"
                        @change="saveBranding"
                        class="color-input-hidden"
                      />
                      <span class="color-code">{{ brandingForm.accentColor }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Reset Button -->
              <button class="reset-btn" @click="handleResetBranding">
                <ion-icon :icon="refreshOutline"></ion-icon>
                Reset to Defaults
              </button>
            </div>

            <!-- Right Column - Preview -->
            <div class="branding-preview">
              <div class="preview-label">
                <ion-icon :icon="eyeOutline"></ion-icon>
                Preview
              </div>
              <div class="pdf-preview-card">
                <div class="preview-header-area" :style="{ borderBottomColor: brandingForm.headerColor }">
                  <h3 :style="{ color: brandingForm.headerColor }">{{ businessName || 'Your Business Name' }}</h3>
                  <p v-if="brandingForm.tagline" class="preview-tagline">{{ brandingForm.tagline }}</p>
                  <p v-if="brandingForm.showPhone" class="preview-contact">{{ phoneNumbers || '1234567890' }}</p>
                  <p v-if="brandingForm.showAddress && brandingForm.address" class="preview-address">{{ brandingForm.address }}</p>
                </div>
                <div class="preview-body">
                  <div class="preview-category-pill" :style="{ color: brandingForm.accentColor, borderColor: brandingForm.accentColor }">
                    Sample Category
                  </div>
                  <div class="preview-items">
                    <div class="preview-item">Item 1</div>
                    <div class="preview-item">Item 2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Event Reminders Card -->
        <div class="reminders-section-wrapper">
          <div class="section-header">
            <div class="section-title">
              <ion-icon :icon="notificationsOutline"></ion-icon>
              <h3>Event Reminders</h3>
            </div>
          </div>

          <div class="reminders-content">
            <!-- Enable Reminders Toggle -->
            <div class="toggle-card full-width">
              <div class="toggle-info">
                <ion-icon :icon="notificationsOutline"></ion-icon>
                <div class="toggle-text">
                  <span class="toggle-label">Enable Reminders</span>
                  <span class="toggle-description">Get notified about upcoming events</span>
                </div>
              </div>
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="reminderForm.enabled"
                  @change="saveReminderSettings"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>

            <!-- Reminder Settings (only show if enabled) -->
            <div v-if="reminderForm.enabled" class="reminder-settings">
              <!-- Notification Permission -->
              <div v-if="notificationPermission !== 'granted'" class="permission-card">
                <div class="permission-icon">
                  <ion-icon :icon="alertCircleOutline"></ion-icon>
                </div>
                <div class="permission-text">
                  <h4>Enable Notifications</h4>
                  <p>Allow notifications to receive event reminders</p>
                </div>
                <button class="permission-btn" @click="handleRequestPermission">
                  <ion-icon :icon="notificationsOutline"></ion-icon>
                  Allow
                </button>
              </div>

              <!-- Permission Granted Indicator -->
              <div v-else class="permission-granted">
                <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                <span>Notifications enabled</span>
              </div>

              <!-- Timing Selection -->
              <div class="setting-card">
                <div class="setting-header">
                  <ion-icon :icon="calendarOutline"></ion-icon>
                  <span>Remind me</span>
                </div>
                <div class="timing-options">
                  <button
                    v-for="option in timingOptions"
                    :key="option.value"
                    class="timing-option"
                    :class="{ active: reminderForm.timing === option.value }"
                    @click="selectTiming(option.value)"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <!-- Time Selection -->
              <div class="setting-card">
                <div class="setting-header">
                  <ion-icon :icon="timeOutline"></ion-icon>
                  <span>At time</span>
                </div>
                <div class="time-selector">
                  <select v-model="reminderForm.time" @change="saveReminderSettings" class="time-select">
                    <option value="07:00">7:00 AM</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="20:00">8:00 PM</option>
                  </select>
                </div>
              </div>

              <!-- Test Notification Button -->
              <button
                v-if="notificationPermission === 'granted'"
                class="test-notification-btn"
                @click="testNotification"
              >
                <ion-icon :icon="notificationsOutline"></ion-icon>
                Test Notification
              </button>
            </div>
          </div>
        </div>

        <!-- Change Password Card -->
        <ion-card class="password-card">
          <ion-card-header>
            <ion-card-title>
              <ion-icon :icon="lockClosedOutline"></ion-icon>
              Change Password
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-input
              v-model="passwordForm.currentPassword"
              type="password"
              label="Current Password"
              label-placement="floating"
              fill="outline"
              class="password-input"
            ></ion-input>
            <ion-input
              v-model="passwordForm.newPassword"
              type="password"
              label="New Password"
              label-placement="floating"
              fill="outline"
              class="password-input"
            ></ion-input>
            <ion-input
              v-model="passwordForm.confirmPassword"
              type="password"
              label="Confirm New Password"
              label-placement="floating"
              fill="outline"
              class="password-input"
            ></ion-input>
            <ion-button expand="block" @click="handleChangePassword" :disabled="!canChangePassword">
              <ion-icon slot="start" :icon="saveOutline"></ion-icon>
              Update Password
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>

      <AppLoader :show="isLoading" message="Saving..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
  IonItem,
  IonLabel,
  IonToggle,
  IonBadge,
} from '@ionic/vue';
import {
  personCircleOutline,
  businessOutline,
  callOutline,
  diamondOutline,
  timeOutline,
  documentOutline,
  arrowUpCircleOutline,
  colorPaletteOutline,
  lockClosedOutline,
  refreshOutline,
  saveOutline,
  createOutline,
  closeOutline,
  checkmarkOutline,
  textOutline,
  locationOutline,
  eyeOutline,
  notificationsOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  calendarOutline,
} from 'ionicons/icons';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const { $auth, $db } = useNuxtApp();
const userStore = useUserStore();
const { businessName, phoneNumbers } = useSettings();
const { showToast } = useToast();
const { isPremium } = useSubscription();
const { effectiveBranding, updateBranding, resetBranding } = usePdfBranding();
const {
  reminderSettings,
  notificationPermission,
  requestNotificationPermission,
  updateReminderSettings,
  showNotification,
} = useEventReminders();
const appSettingsStore = useAppSettingsStore();
const router = useRouter();

const isLoading = ref(false);
const isEditing = ref(false);
const isSavingProfile = ref(false);

// Profile edit form
const profileForm = reactive({
  businessName: '',
  phoneNumber: '',
});

// Reminder settings form
const reminderForm = reactive({
  enabled: false,
  timing: '1_day_before' as '1_day_before' | 'same_day' | '2_days_before' | '1_week_before',
  time: '09:00',
});

// Timing options for reminder
const timingOptions = [
  { value: 'same_day', label: 'Same day' },
  { value: '1_day_before', label: '1 day before' },
  { value: '2_days_before', label: '2 days before' },
  { value: '1_week_before', label: '1 week before' },
];

// Computed values
const subscriptionPlan = computed(() => userStore.subscriptionPlan);
const subscriptionEndDate = computed(() => {
  const sub = userStore.user?.subscription;
  if (sub?.endDate) {
    return sub.endDate.toDate ? sub.endDate.toDate() : new Date(sub.endDate);
  }
  return null;
});
const pdfCount = computed(() => userStore.pdfCount);
const pdfLimit = computed(() => appSettingsStore.pdfLimit);

// Branding form
const brandingForm = reactive({
  tagline: effectiveBranding.value.tagline || '',
  address: effectiveBranding.value.address || '',
  showAddress: effectiveBranding.value.showAddress ?? true,
  showPhone: effectiveBranding.value.showPhone ?? true,
  headerColor: effectiveBranding.value.headerColor || '#333333',
  accentColor: effectiveBranding.value.accentColor || '#667eea',
});

// Watch for branding changes from store
watch(effectiveBranding, (newVal) => {
  brandingForm.tagline = newVal.tagline || '';
  brandingForm.address = newVal.address || '';
  brandingForm.showAddress = newVal.showAddress ?? true;
  brandingForm.showPhone = newVal.showPhone ?? true;
  brandingForm.headerColor = newVal.headerColor || '#333333';
  brandingForm.accentColor = newVal.accentColor || '#667eea';
}, { immediate: true });

// Watch for reminder settings changes from store
watch(reminderSettings, (newVal) => {
  reminderForm.enabled = newVal.enabled ?? false;
  reminderForm.timing = newVal.timing ?? '1_day_before';
  reminderForm.time = newVal.time ?? '09:00';
}, { immediate: true });

// Password form
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const canChangePassword = computed(() => {
  return (
    passwordForm.currentPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmPassword &&
    passwordForm.newPassword === passwordForm.confirmPassword &&
    passwordForm.newPassword.length >= 6
  );
});

// Load settings on mount
onMounted(async () => {
  await appSettingsStore.fetchSettings();
});

// Methods
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const goToSubscription = () => {
  router.push('/subscription');
};

const toggleEditMode = () => {
  if (!isEditing.value) {
    // Entering edit mode - populate form
    profileForm.businessName = businessName.value || '';
    profileForm.phoneNumber = userStore.user?.phoneNumber || phoneNumbers.value || '';
  }
  isEditing.value = !isEditing.value;
};

const cancelEdit = () => {
  isEditing.value = false;
  // Reset form
  profileForm.businessName = '';
  profileForm.phoneNumber = '';
};

const saveProfile = async () => {
  if (!userStore.user?.uid) return;

  isSavingProfile.value = true;
  try {
    const userRef = doc($db, 'users', userStore.user.uid);
    await updateDoc(userRef, {
      businessName: profileForm.businessName || null,
      phoneNumber: profileForm.phoneNumber || null,
      updatedAt: new Date(),
    });

    // Update local store
    userStore.setUser({
      ...userStore.user,
      businessName: profileForm.businessName || undefined,
      phoneNumber: profileForm.phoneNumber || undefined,
    });

    showToast('Profile updated successfully!', 'success', 2000);
    isEditing.value = false;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    showToast(error.message || 'Failed to update profile', 'error', 3000);
  } finally {
    isSavingProfile.value = false;
  }
};

const saveBranding = async () => {
  // Build updates object, only including non-empty values
  const updates: Record<string, any> = {
    showAddress: brandingForm.showAddress,
    showPhone: brandingForm.showPhone,
    headerColor: brandingForm.headerColor,
    accentColor: brandingForm.accentColor,
  };

  // Only include tagline and address if they have values
  if (brandingForm.tagline) {
    updates.tagline = brandingForm.tagline;
  }
  if (brandingForm.address) {
    updates.address = brandingForm.address;
  }

  const result = await updateBranding(updates);

  if (!result.success) {
    showToast(result.error || 'Failed to save branding', 'error', 2000);
  }
};

const handleResetBranding = async () => {
  isLoading.value = true;
  const result = await resetBranding();
  isLoading.value = false;

  if (result.success) {
    showToast('Branding reset to defaults', 'success', 2000);
  } else {
    showToast(result.error || 'Failed to reset branding', 'error', 3000);
  }
};

// Reminder Settings Methods
const saveReminderSettings = async () => {
  const result = await updateReminderSettings({
    enabled: reminderForm.enabled,
    timing: reminderForm.timing,
    time: reminderForm.time,
    notificationPermission: notificationPermission.value,
  });

  if (!result.success) {
    showToast(result.error || 'Failed to save reminder settings', 'error', 2000);
  }
};

const selectTiming = async (timing: typeof reminderForm.timing) => {
  reminderForm.timing = timing;
  await saveReminderSettings();
};

const handleRequestPermission = async () => {
  await requestNotificationPermission();
  await saveReminderSettings();
};

const testNotification = () => {
  showNotification('Test Reminder', {
    body: 'This is how event reminders will look!',
    tag: 'test-notification',
  });
  showToast('Test notification sent!', 'success', 2000);
};

const handleChangePassword = async () => {
  if (!canChangePassword.value) return;

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showToast('Passwords do not match', 'error', 2000);
    return;
  }

  isLoading.value = true;

  try {
    const user = $auth.currentUser;
    if (!user || !user.email) {
      throw new Error('Not authenticated');
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, passwordForm.newPassword);

    showToast('Password updated successfully!', 'success', 2000);

    // Clear form
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  } catch (error: any) {
    console.error('Error changing password:', error);
    if (error.code === 'auth/wrong-password') {
      showToast('Current password is incorrect', 'error', 3000);
    } else {
      showToast(error.message || 'Failed to change password', 'error', 3000);
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.profile-content {
  --background: #f8f9fa;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 24px;
}

/* Profile Card */
.profile-card {
  border-radius: 16px;
  overflow: hidden;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.edit-profile-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
}

.edit-profile-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.edit-profile-btn ion-icon {
  font-size: 20px;
  color: white;
}

.avatar-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 60px;
  color: white;
}

.profile-info h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.profile-info p {
  margin: 4px 0 0 0;
  color: #666;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-item ion-icon {
  font-size: 24px;
  color: #667eea;
}

.info-item label {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 2px;
}

.info-item span {
  font-weight: 600;
  color: #333;
}

/* Edit Form */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.cancel-btn {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  border-color: #ccc;
  background: #f8f8f8;
}

.save-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-btn ion-icon {
  font-size: 18px;
}

/* Subscription Card */
.subscription-card {
  border-radius: 16px;
}

.subscription-card ion-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subscription-card ion-card-title ion-icon {
  color: #ffd700;
}

.subscription-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.plan-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.plan-badge.free {
  background: #f0f0f0;
  color: #666;
}

.plan-badge.premium {
  background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
  color: #333;
}

.expiry-info,
.usage-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.expiry-info ion-icon,
.usage-info ion-icon {
  font-size: 18px;
}

.upgrade-btn {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* PDF Branding Section */
.branding-section-wrapper {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.branding-section-wrapper.locked {
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title ion-icon {
  font-size: 24px;
  color: #667eea;
}

.section-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.premium-badge {
  background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
  color: #333;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

/* Locked Content */
.locked-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
}

.lock-icon-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.lock-icon-wrapper ion-icon {
  font-size: 36px;
  color: #999;
}

.locked-content h4 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.locked-content p {
  margin: 0 0 20px 0;
  color: #666;
  max-width: 300px;
}

.upgrade-btn-modern {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35);
}

.upgrade-btn-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.45);
}

.upgrade-btn-modern ion-icon {
  font-size: 20px;
}

/* Branding Grid */
.branding-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .branding-grid {
    grid-template-columns: 1fr;
  }
}

/* Branding Settings */
.branding-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.setting-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.setting-header ion-icon {
  font-size: 18px;
  color: #667eea;
}

.setting-header span {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.setting-input,
.setting-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  outline: none;
  resize: none;
}

.setting-input:focus,
.setting-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Toggle Cards */
.toggle-cards {
  display: flex;
  gap: 12px;
}

.toggle-card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 14px;
}

.toggle-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-info ion-icon {
  font-size: 18px;
  color: #667eea;
}

.toggle-info span {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
}

/* Custom Toggle Switch */
.toggle-switch {
  position: relative;
  width: 48px;
  height: 26px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ccc;
  border-radius: 26px;
  transition: 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

/* Color Section */
.color-section h4 {
  margin: 0 0 12px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.color-cards {
  display: flex;
  gap: 12px;
}

.color-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  position: relative;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.color-info {
  display: flex;
  flex-direction: column;
  position: relative;
}

.color-info label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 2px;
}

.color-info .color-code {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  font-family: monospace;
}

.color-input-hidden {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  cursor: pointer;
}

.reset-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.reset-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.reset-btn ion-icon {
  font-size: 18px;
}

/* Branding Preview */
.branding-preview {
  display: flex;
  flex-direction: column;
}

.preview-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 12px;
}

.preview-label ion-icon {
  font-size: 18px;
}

.pdf-preview-card {
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  padding: 20px;
  flex: 1;
}

.preview-header-area {
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 3px solid #333;
  margin-bottom: 16px;
}

.preview-header-area h3 {
  margin: 0 0 4px 0;
  font-size: 1.3rem;
  font-weight: 700;
}

.preview-header-area .preview-tagline {
  margin: 4px 0;
  font-style: italic;
  font-size: 0.85rem;
  color: #666;
}

.preview-header-area .preview-contact {
  margin: 4px 0;
  font-size: 0.85rem;
  color: #555;
}

.preview-header-area .preview-address {
  margin: 4px 0;
  font-size: 0.75rem;
  color: #777;
}

.preview-body {
  padding-top: 8px;
}

.preview-category-pill {
  display: inline-block;
  padding: 6px 16px;
  border: 2px solid;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 12px;
}

.preview-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-item {
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #555;
}

/* Password Card */
.password-card {
  border-radius: 16px;
}

.password-card ion-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-card ion-card-title ion-icon {
  color: #eb445a;
}

.password-input {
  margin-bottom: 16px;
}

/* Event Reminders Section */
.reminders-section-wrapper {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.reminders-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toggle-card.full-width {
  width: 100%;
  padding: 16px 20px;
}

.toggle-text {
  display: flex;
  flex-direction: column;
}

.toggle-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.toggle-description {
  font-size: 0.8rem;
  color: #888;
  margin-top: 2px;
}

.reminder-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

/* Permission Card */
.permission-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  padding: 16px;
}

.permission-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.permission-icon ion-icon {
  font-size: 24px;
  color: white;
}

.permission-text {
  flex: 1;
}

.permission-text h4 {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.permission-text p {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
}

.permission-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
}

.permission-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.permission-btn ion-icon {
  font-size: 18px;
}

/* Permission Granted */
.permission-granted {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(45, 211, 111, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
  border: 1px solid rgba(45, 211, 111, 0.3);
  border-radius: 10px;
  color: #2dd36f;
  font-weight: 600;
  font-size: 0.9rem;
}

.permission-granted ion-icon {
  font-size: 20px;
}

/* Timing Options */
.timing-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.timing-option {
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.timing-option:hover {
  border-color: #667eea;
  color: #667eea;
}

.timing-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  font-weight: 600;
}

/* Time Selector */
.time-selector {
  margin-top: 10px;
}

.time-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
  background: white;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.time-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

/* Test Notification Button */
.test-notification-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: 2px dashed #667eea;
  background: transparent;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.test-notification-btn:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-style: solid;
}

.test-notification-btn ion-icon {
  font-size: 20px;
}

@media (max-width: 480px) {
  .timing-options {
    grid-template-columns: 1fr;
  }

  .permission-card {
    flex-direction: column;
    text-align: center;
  }

  .permission-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
