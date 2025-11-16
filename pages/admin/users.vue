<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="users-container">
        <div class="users-header">
          <h2>Users</h2>
          <ion-button color="primary" @click="openCreateModal">
            <ion-icon slot="start" :icon="personAddOutline"></ion-icon>
            Create User
          </ion-button>
        </div>

        <div v-if="isLoading" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading users...</p>
        </div>

        <div v-else-if="users.length === 0" class="empty-state">
          <ion-icon :icon="peopleOutline"></ion-icon>
          <p>No users found</p>
          <ion-button fill="outline" @click="openCreateModal">Create First User</ion-button>
        </div>

        <div v-else class="users-table">
          <ion-card v-for="user in users" :key="user.uid" class="user-card">
            <ion-card-content>
              <div class="user-info">
                <div class="user-details">
                  <h3>@{{ user.username }}</h3>
                  <p class="email">{{ user.role }} account</p>
                  <div class="user-meta">
                    <ion-chip :color="user.role === 'admin' ? 'primary' : 'secondary'">
                      <ion-label>{{ user.role }}</ion-label>
                    </ion-chip>
                    <ion-chip :color="user.isActive ? 'success' : 'danger'">
                      <ion-label>{{ user.isActive ? 'Active' : 'Inactive' }}</ion-label>
                    </ion-chip>
                    <ion-chip color="tertiary">
                      <ion-icon :icon="phonePortraitOutline" style="margin-right: 4px;"></ion-icon>
                      <ion-label>{{ sessionCounts[user.uid] || 0 }} device{{ sessionCounts[user.uid] === 1 ? '' : 's' }}</ion-label>
                    </ion-chip>
                  </div>
                </div>
                <div class="user-actions">
                  <div class="action-button-with-badge">
                    <ion-button fill="clear" @click="viewUserSessions(user)" title="View Active Sessions">
                      <ion-icon slot="icon-only" :icon="phonePortraitOutline"></ion-icon>
                    </ion-button>
                    <span v-if="sessionCounts[user.uid] > 0" class="action-badge">{{ sessionCounts[user.uid] }}</span>
                  </div>
                  <div class="action-button-with-badge">
                    <ion-button fill="clear" @click="viewReports(user)" title="View Reports">
                      <ion-icon slot="icon-only" :icon="bookmarkOutline"></ion-icon>
                    </ion-button>
                    <span v-if="reportsCounts[user.uid] > 0" class="action-badge">{{ reportsCounts[user.uid] }}</span>
                  </div>
                  <ion-button fill="clear" @click="openEditModal(user)" title="Edit User">
                    <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" color="danger" @click="confirmDelete(user)" title="Delete User">
                    <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Create/Edit User Modal -->
      <ion-modal :is-open="isModalOpen" @didDismiss="closeModal" class="user-modal">
        <ion-header>
          <ion-toolbar class="gradient-toolbar">
            <ion-title>{{ editingUser ? 'Edit User' : 'Create User' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">
                <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="modal-content">
          <div class="form-container">
            <form @submit.prevent="handleSubmit" autocomplete="off">
              <!-- Username Field -->
              <div class="input-group">
                <label class="input-label">Username</label>
                <div class="input-wrapper">
                  <ion-icon :icon="personCircleOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="formData.username"
                    type="text"
                    class="custom-input"
                    placeholder="Enter username"
                    autocomplete="off"
                    required
                  />
                </div>
              </div>

              <!-- Business Name Field -->
              <div class="input-group">
                <label class="input-label">Business Name</label>
                <div class="input-wrapper">
                  <ion-icon :icon="businessOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="formData.businessName"
                    type="text"
                    class="custom-input"
                    placeholder="Enter business name"
                    autocomplete="off"
                  />
                </div>
              </div>

              <!-- Phone Number Field -->
              <div class="input-group">
                <label class="input-label">Phone Number</label>
                <div class="input-wrapper">
                  <ion-icon :icon="callOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="formData.phoneNumber"
                    type="tel"
                    class="custom-input"
                    placeholder="Enter phone number"
                    autocomplete="off"
                  />
                </div>
              </div>

              <!-- Password Field (Create only) -->
              <div v-if="!editingUser" class="input-group">
                <label class="input-label">Password</label>
                <div class="input-wrapper">
                  <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="formData.password"
                    type="password"
                    class="custom-input"
                    placeholder="Enter password (min 6 characters)"
                    minlength="6"
                    autocomplete="new-password"
                    required
                  />
                </div>
              </div>

              <!-- Role Field -->
              <div class="input-group">
                <label class="input-label">Role</label>
                <div class="input-wrapper">
                  <ion-icon :icon="shieldCheckmarkOutline" class="input-icon"></ion-icon>
                  <select v-model="formData.role" class="custom-select">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <!-- Active Status (Edit only) -->
              <div v-if="editingUser" class="toggle-group">
                <label class="toggle-label">Active Status</label>
                <ion-toggle v-model="formData.isActive" color="success"></ion-toggle>
              </div>

              <!-- Error Message -->
              <div v-if="formError" class="error-message">
                <ion-icon :icon="alertCircleOutline"></ion-icon>
                <span>{{ formError }}</span>
              </div>

              <!-- Submit Button -->
              <ion-button
                expand="block"
                type="submit"
                :disabled="isSubmitting"
                class="submit-button"
                color="primary"
              >
                <ion-spinner v-if="isSubmitting" name="crescent"></ion-spinner>
                <ion-icon v-else slot="start" :icon="editingUser ? saveOutline : personAddOutline"></ion-icon>
                <span v-if="!isSubmitting">{{ editingUser ? 'Update User' : 'Create User' }}</span>
              </ion-button>
            </form>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Delete Confirmation Modal -->
      <ion-modal :is-open="isDeleteModalOpen" @didDismiss="cancelDelete">
        <ion-header>
          <ion-toolbar color="danger">
            <ion-title>Confirm Delete</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="delete-confirmation">
            <ion-icon :icon="warningOutline" color="danger"></ion-icon>
            <h3>Delete User?</h3>
            <p>Are you sure you want to delete <strong>{{ userToDelete?.name }}</strong>?</p>
            <p class="warning-text">This action cannot be undone.</p>

            <div class="delete-actions">
              <ion-button expand="block" fill="outline" @click="cancelDelete">
                Cancel
              </ion-button>
              <ion-button
                expand="block"
                color="danger"
                @click="handleDelete"
                :disabled="isDeleting"
              >
                <ion-spinner v-if="isDeleting" name="crescent"></ion-spinner>
                <span v-else>Delete User</span>
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Active Sessions Modal -->
      <ion-modal :is-open="isSessionsModalOpen" @didDismiss="closeSessionsModal" class="sessions-modal">
        <ion-header>
          <ion-toolbar class="gradient-toolbar">
            <ion-title>Active Sessions - @{{ selectedUserForSessions?.username }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeSessionsModal">
                <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="sessions-container">
            <!-- Loading State -->
            <div v-if="isLoadingSessions" class="loading-sessions">
              <ion-spinner name="crescent"></ion-spinner>
              <p>Loading sessions...</p>
            </div>

            <!-- Sessions List -->
            <div v-else-if="userSessions.length > 0">
              <div class="sessions-header">
                <p>{{ userSessions.length }} active session{{ userSessions.length > 1 ? 's' : '' }}</p>
                <ion-button
                  size="small"
                  color="danger"
                  fill="outline"
                  @click="logoutFromAllDevices"
                  v-if="userSessions.length > 0"
                >
                  <ion-icon slot="start" :icon="logOutOutline"></ion-icon>
                  Logout All
                </ion-button>
              </div>

              <div class="sessions-list">
                <div v-for="session in userSessions" :key="session.sessionId" class="session-card">
                  <div class="session-info">
                    <div class="session-device">
                      <ion-icon
                        :icon="formatDeviceInfo(session) === 'Mobile' ? phonePortraitOutline : (formatDeviceInfo(session) === 'Tablet' ? tabletLandscapeOutline : desktopOutline)"
                        class="device-icon"
                      ></ion-icon>
                      <div class="device-details">
                        <h4>{{ formatDeviceInfo(session) }}</h4>
                        <p class="platform-info">{{ session.deviceInfo?.platform }}</p>
                        <p class="screen-info">{{ session.deviceInfo?.screenResolution }}</p>
                      </div>
                    </div>
                    <div class="session-time">
                      <ion-icon :icon="timeOutline"></ion-icon>
                      <span>{{ formatLastActive(session.lastActive) }}</span>
                    </div>
                  </div>
                  <div class="session-actions">
                    <ion-button
                      size="small"
                      color="danger"
                      fill="outline"
                      @click="logoutFromDevice(session.sessionId)"
                    >
                      <ion-icon slot="start" :icon="logOutOutline"></ion-icon>
                      Logout
                    </ion-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="no-sessions">
              <ion-icon :icon="phonePortraitOutline" class="empty-icon"></ion-icon>
              <h3>No Active Sessions</h3>
              <p>This user is not logged in on any device</p>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonChip,
  IonLabel,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
} from '@ionic/vue';
import {
  personAddOutline,
  peopleOutline,
  createOutline,
  trashOutline,
  alertCircleOutline,
  warningOutline,
  closeOutline,
  personOutline,
  personCircleOutline,
  lockClosedOutline,
  shieldCheckmarkOutline,
  saveOutline,
  businessOutline,
  callOutline,
  bookmarkOutline,
  phonePortraitOutline,
  desktopOutline,
  tabletLandscapeOutline,
  logOutOutline,
  timeOutline,
} from 'ionicons/icons';
import type { UserData } from '~/stores/user';

definePageMeta({
  middleware: 'admin',
});

const { fetchUsers, createUser, updateUser, deleteUser } = useUsers();
const { showToast } = useToast();
const userStore = useUserStore();
const { getActiveSessionCount, getUserSessions, deleteSession } = useDeviceSessions();
const { getReportsCount } = useSavedReports();

const users = ref<UserData[]>([]);
const isLoading = ref(true);
const sessionCounts = ref<Record<string, number>>({});
const reportsCounts = ref<Record<string, number>>({});
const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isSessionsModalOpen = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const formError = ref('');
const editingUser = ref<UserData | null>(null);
const userToDelete = ref<UserData | null>(null);
const selectedUserForSessions = ref<UserData | null>(null);
const userSessions = ref<any[]>([]);
const isLoadingSessions = ref(false);

const formData = ref({
  username: '',
  password: '',
  role: 'user' as 'user' | 'admin',
  isActive: true,
  businessName: '',
  phoneNumber: '',
});

const loadUsers = async () => {
  isLoading.value = true;
  users.value = await fetchUsers();

  // Load session counts and reports counts for each user
  await loadSessionCounts();
  await loadReportsCounts();

  isLoading.value = false;
};

const loadSessionCounts = async () => {
  const counts: Record<string, number> = {};

  for (const user of users.value) {
    try {
      counts[user.uid] = await getActiveSessionCount(user.uid);
    } catch (error) {
      console.error(`Error loading session count for user ${user.uid}:`, error);
      counts[user.uid] = 0;
    }
  }

  sessionCounts.value = counts;
};

const loadReportsCounts = async () => {
  const counts: Record<string, number> = {};

  for (const user of users.value) {
    try {
      counts[user.uid] = await getReportsCount(user.uid);
    } catch (error) {
      console.error(`Error loading reports count for user ${user.uid}:`, error);
      counts[user.uid] = 0;
    }
  }

  reportsCounts.value = counts;
};

const openCreateModal = () => {
  editingUser.value = null;
  formData.value = {
    username: '',
    password: '',
    role: 'user',
    isActive: true,
    businessName: '',
    phoneNumber: '',
  };
  formError.value = '';
  isModalOpen.value = true;
};

const viewReports = (user: UserData) => {
  navigateTo(`/admin/user-reports/${user.uid}`);
};

const openEditModal = (user: UserData) => {
  editingUser.value = user;
  formData.value = {
    username: user.username || '',
    password: '',
    role: user.role,
    isActive: user.isActive,
    businessName: user.businessName || '',
    phoneNumber: user.phoneNumber || '',
  };
  formError.value = '';
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingUser.value = null;
  formError.value = '';
  // Reset form data
  formData.value = {
    username: '',
    password: '',
    role: 'user',
    isActive: true,
    businessName: '',
    phoneNumber: '',
  };
};

const handleSubmit = async () => {
  formError.value = '';
  isSubmitting.value = true;

  try {
    if (editingUser.value) {
      // Update user
      const result = await updateUser(editingUser.value.uid, {
        username: formData.value.username,
        role: formData.value.role,
        isActive: formData.value.isActive,
        businessName: formData.value.businessName,
        phoneNumber: formData.value.phoneNumber,
      });

      if (result.success) {
        showToast('User updated successfully!', 'success', 3000);
        closeModal();
        await loadUsers();
      } else {
        formError.value = result.error || 'Failed to update user';
      }
    } else {
      // Create user
      const result = await createUser(
        formData.value.username,
        formData.value.password,
        formData.value.role,
        formData.value.businessName,
        formData.value.phoneNumber
      );

      if (result.success) {
        showToast('User created successfully!', 'success', 3000);
        closeModal();
        await loadUsers();
      } else {
        formError.value = result.error || 'Failed to create user';
      }
    }
  } catch (error) {
    formError.value = 'An unexpected error occurred';
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = (user: UserData) => {
  userToDelete.value = user;
  isDeleteModalOpen.value = true;
};

const cancelDelete = () => {
  isDeleteModalOpen.value = false;
  userToDelete.value = null;
};

const handleDelete = async () => {
  if (!userToDelete.value) return;

  isDeleting.value = true;

  const result = await deleteUser(userToDelete.value.uid);

  if (result.success) {
    showToast('User deleted successfully!', 'success', 3000);
    cancelDelete();
    await loadUsers();
  } else {
    showToast(result.error || 'Failed to delete user', 'error', 3000);
  }

  isDeleting.value = false;
};

// View user sessions
const viewUserSessions = async (user: UserData) => {
  selectedUserForSessions.value = user;
  isSessionsModalOpen.value = true;
  isLoadingSessions.value = true;

  try {
    const sessions = await getUserSessions(user.uid);
    userSessions.value = sessions;
  } catch (error) {
    console.error('Error loading sessions:', error);
    showToast('Failed to load sessions', 'error', 2000);
  } finally {
    isLoadingSessions.value = false;
  }
};

const closeSessionsModal = () => {
  isSessionsModalOpen.value = false;
  selectedUserForSessions.value = null;
  userSessions.value = [];
};

// Logout user from specific device
const logoutFromDevice = async (sessionId: string) => {
  try {
    await deleteSession(sessionId);
    showToast('User logged out from device', 'success', 2000);

    // Refresh sessions list
    if (selectedUserForSessions.value) {
      const sessions = await getUserSessions(selectedUserForSessions.value.uid);
      userSessions.value = sessions;

      // Update session count
      await loadSessionCounts();
    }
  } catch (error) {
    console.error('Error logging out user:', error);
    showToast('Failed to logout user', 'error', 2000);
  }
};

// Logout from all devices
const logoutFromAllDevices = async () => {
  if (!selectedUserForSessions.value) return;

  try {
    for (const session of userSessions.value) {
      await deleteSession(session.sessionId);
    }
    showToast('User logged out from all devices', 'success', 2000);

    // Clear sessions list
    userSessions.value = [];

    // Update session count
    await loadSessionCounts();
  } catch (error) {
    console.error('Error logging out from all devices:', error);
    showToast('Failed to logout user from all devices', 'error', 2000);
  }
};

const formatDeviceInfo = (session: any) => {
  const ua = session.deviceInfo?.userAgent || '';

  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
    return 'Mobile';
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    return 'Tablet';
  } else {
    return 'Desktop';
  }
};

const formatLastActive = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.users-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.users-header h2 {
  font-size: 28px;
  margin: 0;
  color: #333;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-container p {
  margin-top: 16px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state ion-icon {
  font-size: 64px;
  color: #ccc;
}

.empty-state p {
  font-size: 18px;
  color: #666;
  margin: 16px 0 24px 0;
}

.users-table {
  display: grid;
  gap: 16px;
}

.user-card {
  margin: 0;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-details h3 {
  font-size: 18px;
  margin: 0 0 4px 0;
  color: #333;
}

.email {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.user-meta {
  display: flex;
  gap: 8px;
}

.user-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-button-with-badge {
  position: relative;
  display: inline-block;
}

.action-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #eb445a;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  padding: 2px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

/* Modal Styles */
.gradient-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

.modal-content {
  --background: #f8f9fa;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.input-group {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.input-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.input-icon {
  font-size: 22px;
  color: #667eea;
  margin-right: 12px;
  flex-shrink: 0;
}

.custom-input,
.custom-select {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.custom-input::placeholder {
  color: #999;
  font-weight: 400;
}

.custom-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.custom-select {
  cursor: pointer;
  padding-right: 8px;
}

.toggle-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.toggle-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fee;
  color: #eb445a;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 500;
}

.error-message ion-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.submit-button {
  margin-top: 24px;
  height: 52px;
  font-weight: 600;
  font-size: 16px;
  --border-radius: 12px;
}

.delete-confirmation {
  text-align: center;
  padding: 20px;
}

.delete-confirmation ion-icon {
  font-size: 64px;
}

.delete-confirmation h3 {
  font-size: 24px;
  margin: 16px 0;
}

.delete-confirmation p {
  font-size: 16px;
  color: #666;
  margin: 8px 0;
}

.warning-text {
  color: #eb445a;
  font-weight: 500;
}

.delete-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

/* Sessions Modal Styles */
.sessions-modal {
  --width: 90%;
  --max-width: 700px;
  --height: 80%;
  --border-radius: 12px;
}

.sessions-container {
  max-width: 100%;
}

.loading-sessions {
  text-align: center;
  padding: 60px 20px;
}

.loading-sessions p {
  margin-top: 16px;
  color: #666;
}

.sessions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.sessions-header p {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.session-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.session-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.session-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.session-device {
  display: flex;
  align-items: center;
  gap: 16px;
}

.device-icon {
  font-size: 40px;
  color: #667eea;
}

.device-details h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.platform-info,
.screen-info {
  margin: 2px 0;
  font-size: 13px;
  color: #666;
}

.session-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #999;
}

.session-time ion-icon {
  font-size: 16px;
}

.session-actions {
  display: flex;
  justify-content: flex-end;
}

.no-sessions {
  text-align: center;
  padding: 60px 20px;
}

.no-sessions .empty-icon {
  font-size: 80px;
  color: #ccc;
  margin-bottom: 16px;
}

.no-sessions h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
}

.no-sessions p {
  margin: 0;
  color: #666;
}

@media (max-width: 768px) {
  .users-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .users-header ion-button {
    width: 100%;
  }

  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .user-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .sessions-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .session-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .session-time {
    align-self: flex-start;
  }
}
</style>
