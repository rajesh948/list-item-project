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
} from '@ionic/vue';
import {
  personCircleOutline,
  businessOutline,
  callOutline,
  diamondOutline,
  timeOutline,
  documentOutline,
  arrowUpCircleOutline,
  lockClosedOutline,
  saveOutline,
  createOutline,
  closeOutline,
  checkmarkOutline,
} from 'ionicons/icons';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const { $auth, $db } = useNuxtApp();
const userStore = useUserStore();
const { businessName, phoneNumbers } = useSettings();
const { showToast } = useToast();
const { isPremium } = useSubscription();
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
</style>
