<template>
  <div class="users-page">
    <div class="users-container">
        <div class="users-header">
          <h2>Users</h2>
          <div class="header-actions">
            <ion-button fill="outline" color="medium" @click="handleRefresh" :disabled="isRefreshing">
              <ion-spinner v-if="isRefreshing" name="crescent"></ion-spinner>
              <ion-icon v-else slot="start" :icon="refreshOutline"></ion-icon>
              <span v-if="!isRefreshing">Refresh</span>
            </ion-button>
            <ion-button color="primary" @click="openCreateModal">
              <ion-icon slot="start" :icon="personAddOutline"></ion-icon>
              Create User
            </ion-button>
          </div>
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
                  <p class="email">{{ user.email || `${user.username}@caterhub.app` }}</p>
                  <div class="user-meta">
                    <ion-chip :color="user.role === 'admin' ? 'primary' : 'secondary'">
                      <ion-label>{{ user.role }}</ion-label>
                    </ion-chip>
                    <ion-chip :color="user.isActive ? 'success' : 'danger'">
                      <ion-label>{{ user.isActive ? 'Active' : 'Inactive' }}</ion-label>
                    </ion-chip>
                    <ion-chip :color="getSubscriptionColor(user)" class="subscription-chip">
                      <ion-icon :icon="diamondOutline" style="margin-right: 4px;"></ion-icon>
                      <ion-label>{{ getSubscriptionLabel(user) }}</ion-label>
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
                  <ion-button fill="clear" color="warning" @click="viewUserRequests(user)" title="Subscription Requests">
                    <ion-icon slot="icon-only" :icon="receiptOutline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" color="tertiary" @click="viewSubscriptionHistory(user)" title="Subscription Details">
                    <ion-icon slot="icon-only" :icon="diamondOutline"></ion-icon>
                  </ion-button>
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
        <div class="modal-container">
          <div class="modal-header">
            <h2>{{ editingUser ? 'Edit User' : 'Create New User' }}</h2>
            <button class="modal-close-btn" @click="closeModal">
              <ion-icon :icon="closeOutline"></ion-icon>
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="handleSubmit" autocomplete="off">
              <!-- Username Field -->
              <div class="form-field">
                <label class="field-label">
                  <ion-icon :icon="personCircleOutline"></ion-icon>
                  Username
                </label>
                <input
                  v-model="formData.username"
                  type="text"
                  class="field-input"
                  placeholder="Enter username"
                  autocomplete="off"
                  required
                />
              </div>

              <!-- Business Name Field -->
              <div class="form-field">
                <label class="field-label">
                  <ion-icon :icon="businessOutline"></ion-icon>
                  Business Name
                </label>
                <input
                  v-model="formData.businessName"
                  type="text"
                  class="field-input"
                  placeholder="Enter business name"
                  autocomplete="off"
                />
              </div>

              <!-- Phone Number Field -->
              <div class="form-field">
                <label class="field-label">
                  <ion-icon :icon="callOutline"></ion-icon>
                  Phone Number
                </label>
                <input
                  v-model="formData.phoneNumber"
                  type="tel"
                  class="field-input"
                  placeholder="Enter phone number"
                  autocomplete="off"
                />
              </div>

              <!-- Email Field (Edit only) -->
              <div v-if="editingUser" class="form-field">
                <label class="field-label">
                  <ion-icon :icon="mailOutline"></ion-icon>
                  Email Address
                </label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="field-input"
                  placeholder="Enter email address"
                  autocomplete="off"
                />
              </div>

              <!-- Password Field (Create only) -->
              <div v-if="!editingUser" class="form-field">
                <label class="field-label">
                  <ion-icon :icon="lockClosedOutline"></ion-icon>
                  Password
                </label>
                <input
                  v-model="formData.password"
                  type="password"
                  class="field-input"
                  placeholder="Enter password (min 6 characters)"
                  minlength="6"
                  autocomplete="new-password"
                  required
                />
              </div>

              <!-- Role Field -->
              <div class="form-field">
                <label class="field-label">
                  <ion-icon :icon="shieldCheckmarkOutline"></ion-icon>
                  Role
                </label>
                <div class="select-wrapper">
                  <select v-model="formData.role" class="field-select">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ion-icon :icon="chevronDownOutline" class="select-arrow"></ion-icon>
                </div>
              </div>

              <!-- Active Status (Edit only) -->
              <div v-if="editingUser" class="toggle-field">
                <div class="toggle-info">
                  <ion-icon :icon="checkmarkCircleOutline" :class="{ active: formData.isActive }"></ion-icon>
                  <span>Active Status</span>
                </div>
                <ion-toggle v-model="formData.isActive" color="success"></ion-toggle>
              </div>

              <!-- Error Message -->
              <div v-if="formError" class="error-alert">
                <ion-icon :icon="alertCircleOutline"></ion-icon>
                <span>{{ formError }}</span>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <button class="cancel-btn" @click="closeModal">Cancel</button>
            <button class="submit-btn" @click="handleSubmit" :disabled="isSubmitting">
              <ion-spinner v-if="isSubmitting" name="crescent"></ion-spinner>
              <template v-else>
                <ion-icon :icon="editingUser ? saveOutline : personAddOutline"></ion-icon>
                {{ editingUser ? 'Update User' : 'Create User' }}
              </template>
            </button>
          </div>
        </div>
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

      <!-- Subscription History Modal -->
      <ion-modal :is-open="isSubscriptionHistoryModalOpen" @didDismiss="closeSubscriptionHistoryModal" class="subscription-history-modal">
        <ion-header>
          <ion-toolbar class="gradient-toolbar">
            <ion-title>Subscription Details</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeSubscriptionHistoryModal">
                <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding subscription-modal-content">
          <div class="subscription-history-container">
            <!-- User Info Header -->
            <div class="user-info-header">
              <div class="user-avatar">
                <ion-icon :icon="personCircleOutline"></ion-icon>
              </div>
              <div class="user-name-section">
                <h3>@{{ selectedUserForSubscription?.username }}</h3>
                <span class="plan-badge" :class="getSubscriptionColor(selectedUserForSubscription)">
                  {{ getSubscriptionLabel(selectedUserForSubscription) }}
                </span>
              </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon plan">
                  <ion-icon :icon="diamondOutline"></ion-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-label">Current Plan</span>
                  <span class="stat-value">{{ getSubscriptionLabel(selectedUserForSubscription) }}</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon pdf">
                  <ion-icon :icon="documentTextOutline"></ion-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-label">PDFs Generated</span>
                  <span class="stat-value">{{ selectedUserForSubscription?.pdfUsage?.count || 0 }}</span>
                </div>
              </div>
              <div v-if="selectedUserForSubscription?.subscription?.startDate" class="stat-card">
                <div class="stat-icon start">
                  <ion-icon :icon="calendarOutline"></ion-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-label">Start Date</span>
                  <span class="stat-value">{{ formatSubscriptionDate(selectedUserForSubscription?.subscription?.startDate) }}</span>
                </div>
              </div>
              <div v-if="selectedUserForSubscription?.subscription?.endDate" class="stat-card">
                <div class="stat-icon end">
                  <ion-icon :icon="calendarOutline"></ion-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-label">End Date</span>
                  <span class="stat-value">{{ formatSubscriptionDate(selectedUserForSubscription?.subscription?.endDate) }}</span>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
              <button class="action-btn primary" @click="openSetSubscriptionFromHistory">
                <ion-icon :icon="createOutline"></ion-icon>
                Change Plan
              </button>
            </div>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Set Subscription Modal -->
      <ion-modal :is-open="isSetSubscriptionModalOpen" @didDismiss="closeSetSubscriptionModal" class="set-subscription-modal">
        <ion-header>
          <ion-toolbar class="gradient-toolbar">
            <ion-title>Set Subscription - @{{ selectedUserForSubscription?.username }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeSetSubscriptionModal">
                <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="set-subscription-container">
            <p class="current-plan-info">
              Current Plan: <strong :class="getSubscriptionColor(selectedUserForSubscription)">{{ getSubscriptionLabel(selectedUserForSubscription) }}</strong>
            </p>

            <!-- Plan Selection -->
            <div class="plan-selection">
              <h4>Select New Plan</h4>
              <div class="plan-options">
                <div
                  class="plan-option"
                  :class="{ selected: subscriptionForm.plan === 'free' }"
                  @click="subscriptionForm.plan = 'free'"
                >
                  <div class="plan-icon free">
                    <ion-icon :icon="personOutline"></ion-icon>
                  </div>
                  <div class="plan-info">
                    <h5>Free</h5>
                    <p>Limited PDFs per period</p>
                  </div>
                </div>
                <div
                  class="plan-option"
                  :class="{ selected: subscriptionForm.plan === 'monthly' }"
                  @click="subscriptionForm.plan = 'monthly'"
                >
                  <div class="plan-icon monthly">
                    <ion-icon :icon="diamondOutline"></ion-icon>
                  </div>
                  <div class="plan-info">
                    <h5>Monthly Premium</h5>
                    <p>Unlimited PDFs for 1 month</p>
                  </div>
                </div>
                <div
                  class="plan-option"
                  :class="{ selected: subscriptionForm.plan === 'yearly' }"
                  @click="subscriptionForm.plan = 'yearly'"
                >
                  <div class="plan-icon yearly">
                    <ion-icon :icon="diamondOutline"></ion-icon>
                  </div>
                  <div class="plan-info">
                    <h5>Yearly Premium</h5>
                    <p>Unlimited PDFs for 1 year</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Duration (for premium plans) -->
            <div v-if="subscriptionForm.plan !== 'free'" class="duration-section">
              <h4>Subscription Duration</h4>
              <div class="date-inputs">
                <div class="date-input">
                  <label>Start Date</label>
                  <input type="date" v-model="subscriptionForm.startDate" class="custom-date-input" />
                </div>
                <div class="date-input">
                  <label>End Date</label>
                  <input type="date" v-model="subscriptionForm.endDate" class="custom-date-input" />
                </div>
              </div>
            </div>

            <!-- Admin Notes -->
            <div class="notes-section">
              <h4>Admin Notes (Optional)</h4>
              <textarea
                v-model="subscriptionForm.notes"
                placeholder="Add notes about this subscription change..."
                class="notes-textarea"
                rows="3"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <ion-button
              expand="block"
              @click="handleSetSubscription"
              :disabled="isSettingSubscription"
              class="submit-btn"
            >
              <ion-spinner v-if="isSettingSubscription" name="crescent"></ion-spinner>
              <ion-icon v-else slot="start" :icon="saveOutline"></ion-icon>
              <span v-if="!isSettingSubscription">Update Subscription</span>
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>

      <!-- User Requests Modal -->
      <ion-modal :is-open="isUserRequestsModalOpen" @didDismiss="closeUserRequestsModal" class="user-requests-modal">
        <ion-header>
          <ion-toolbar class="gradient-toolbar">
            <ion-title>Subscription Requests</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeUserRequestsModal">
                <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding requests-modal-content">
          <div class="requests-container">
            <!-- User Header -->
            <div class="requests-user-header">
              <ion-icon :icon="personCircleOutline"></ion-icon>
              <span>@{{ selectedUserForRequests?.username }}</span>
            </div>

            <!-- Loading -->
            <div v-if="isLoadingRequests" class="loading-requests">
              <ion-spinner name="crescent"></ion-spinner>
              <p>Loading requests...</p>
            </div>

            <!-- Requests List -->
            <div v-else-if="userRequests.length > 0" class="requests-list">
              <div v-for="request in userRequests" :key="request.id" class="request-card" :class="request.status">
                <div class="request-header">
                  <div class="request-plan">
                    <ion-icon :icon="diamondOutline"></ion-icon>
                    <span>{{ request.requestedPlan === 'yearly' ? 'Yearly Premium' : 'Monthly Premium' }}</span>
                  </div>
                  <span class="request-status" :class="request.status">
                    {{ request.status === 'pending' ? 'Pending' : request.status === 'approved' ? 'Approved' : 'Rejected' }}
                  </span>
                </div>
                <div class="request-details">
                  <div class="request-detail">
                    <ion-icon :icon="calendarOutline"></ion-icon>
                    <span>Requested: {{ formatRequestDate(request.createdAt) }}</span>
                  </div>
                  <div v-if="request.transactionId" class="request-detail">
                    <ion-icon :icon="receiptOutline"></ion-icon>
                    <span>Transaction: {{ request.transactionId }}</span>
                  </div>
                  <div v-if="request.reviewedAt" class="request-detail">
                    <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                    <span>Reviewed: {{ formatRequestDate(request.reviewedAt) }}</span>
                  </div>
                  <div v-if="request.adminNotes" class="request-notes">
                    <ion-icon :icon="chatboxOutline"></ion-icon>
                    <span>{{ request.adminNotes }}</span>
                  </div>
                </div>
                <div v-if="request.paymentScreenshotUrl" class="request-screenshot">
                  <button class="view-screenshot-btn" @click="viewScreenshot(request.paymentScreenshotUrl)">
                    <ion-icon :icon="imageOutline"></ion-icon>
                    View Payment Screenshot
                  </button>
                </div>
              </div>
            </div>

            <!-- No Requests -->
            <div v-else class="no-requests">
              <div class="no-requests-icon">
                <ion-icon :icon="receiptOutline"></ion-icon>
              </div>
              <h4>No Requests Found</h4>
              <p>This user hasn't submitted any subscription requests</p>
            </div>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Screenshot Preview Modal -->
      <ion-modal :is-open="isScreenshotModalOpen" @didDismiss="closeScreenshotModal" class="screenshot-modal">
        <ion-header>
          <ion-toolbar class="gradient-toolbar">
            <ion-title>Payment Screenshot</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeScreenshotModal">
                <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="screenshot-content">
          <div class="screenshot-container">
            <img :src="currentScreenshotUrl" alt="Payment Screenshot" />
          </div>
        </ion-content>
      </ion-modal>
    </div>
</template>

<script setup lang="ts">
import {
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
  refreshOutline,
  diamondOutline,
  receiptOutline,
  calendarOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  chatboxOutline,
  imageOutline,
  chevronDownOutline,
  mailOutline,
} from 'ionicons/icons';
import type { UserData } from '~/stores/user';
import { doc, updateDoc, Timestamp, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

definePageMeta({
  middleware: 'admin',
});

const { createUser, updateUser, deleteUser } = useUsers();
const { showToast } = useToast();
const userStore = useUserStore();
const usersStore = useUsersStore();
const { getUserSessions, deleteSession } = useDeviceSessions();

const users = computed(() => usersStore.allUsers);
const isLoading = computed(() => usersStore.isLoading);
const isRefreshing = ref(false);
const sessionCounts = computed(() => usersStore.sessionCounts);
const reportsCounts = computed(() => usersStore.reportsCounts);
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

// Subscription related state
const isSubscriptionHistoryModalOpen = ref(false);
const isSetSubscriptionModalOpen = ref(false);
const selectedUserForSubscription = ref<UserData | null>(null);
const subscriptionHistory = ref<any[]>([]);
const isSettingSubscription = ref(false);
const subscriptionForm = ref({
  plan: 'free' as 'free' | 'monthly' | 'yearly',
  startDate: '',
  endDate: '',
  notes: '',
});

// User requests state
const isUserRequestsModalOpen = ref(false);
const selectedUserForRequests = ref<UserData | null>(null);
const userRequests = ref<any[]>([]);
const isLoadingRequests = ref(false);

// Screenshot modal
const isScreenshotModalOpen = ref(false);
const currentScreenshotUrl = ref('');

const formData = ref({
  username: '',
  password: '',
  role: 'user' as 'user' | 'admin',
  isActive: true,
  businessName: '',
  phoneNumber: '',
  email: '',
});

const loadUsers = async () => {
  // Fetch users from store (will use cache if available)
  await usersStore.fetchUsers();

  // Fetch counts from store (will use cache if available)
  await usersStore.fetchUserCounts();
};

const handleRefresh = async () => {
  isRefreshing.value = true;
  try {
    // Force refresh users from Firebase
    await usersStore.refreshUsers();

    // Force refresh counts
    await usersStore.refreshUserCounts();

    showToast('Users refreshed successfully', 'success', 2000);
  } catch (error) {
    showToast('Failed to refresh users', 'error', 2000);
  } finally {
    isRefreshing.value = false;
  }
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
    email: '',
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
    email: user.email || '',
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
    email: '',
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
        email: formData.value.email,
      });

      if (result.success) {
        showToast('User updated successfully!', 'success', 3000);
        closeModal();
        // Force refresh to bypass cache and show updated user
        await usersStore.refreshUsers();
        await usersStore.refreshUserCounts();
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
        // Force refresh to bypass cache and show new user
        await usersStore.refreshUsers();
        await usersStore.refreshUserCounts();
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
    // Force refresh to bypass cache and update user list
    await usersStore.refreshUsers();
    await usersStore.refreshUserCounts();
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
    // Use cached sessions from store
    userSessions.value = usersStore.getUserSessions(user.uid);
  } catch (error) {
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

    // Update cached sessions for this user
    if (selectedUserForSessions.value) {
      await usersStore.updateUserSessions(selectedUserForSessions.value.uid);

      // Update local sessions list from store
      userSessions.value = usersStore.getUserSessions(selectedUserForSessions.value.uid);
    }
  } catch (error) {
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

    // Update cached sessions for this user
    await usersStore.updateUserSessions(selectedUserForSessions.value.uid);

    // Update local sessions list from store
    userSessions.value = usersStore.getUserSessions(selectedUserForSessions.value.uid);
  } catch (error) {
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

// Subscription Helper Functions
const getSubscriptionLabel = (user: UserData | null) => {
  if (!user?.subscription) return 'Free';
  const plan = user.subscription.plan;
  if (plan === 'yearly') return 'Yearly Premium';
  if (plan === 'monthly') return 'Monthly Premium';
  return 'Free';
};

const getSubscriptionColor = (user: UserData | null) => {
  if (!user?.subscription) return 'medium';
  const plan = user.subscription.plan;
  const status = user.subscription.status;
  if (status === 'expired') return 'danger';
  if (plan === 'yearly' || plan === 'monthly') return 'warning';
  return 'medium';
};

// View Subscription History
const viewSubscriptionHistory = (user: UserData) => {
  selectedUserForSubscription.value = user;
  subscriptionHistory.value = user.subscriptionHistory || [];
  isSubscriptionHistoryModalOpen.value = true;
};

const closeSubscriptionHistoryModal = () => {
  isSubscriptionHistoryModalOpen.value = false;
  selectedUserForSubscription.value = null;
  subscriptionHistory.value = [];
};

// Computed history that includes current subscription if no history exists
const computedHistory = computed(() => {
  const history = subscriptionHistory.value || [];
  const user = selectedUserForSubscription.value;

  // If there's existing history, format and return it
  if (history.length > 0) {
    return history.map((entry: any) => ({
      ...entry,
      title: entry.action === 'upgraded' ? 'Plan Upgraded' :
             entry.action === 'downgraded' ? 'Plan Downgraded' :
             entry.action === 'expired' ? 'Subscription Expired' :
             entry.action === 'renewed' ? 'Subscription Renewed' : 'Plan Changed',
    })).reverse(); // Show newest first
  }

  // If no history but has a subscription, create an initial entry
  if (user?.subscription && user.subscription.plan !== 'free') {
    return [{
      action: 'upgraded',
      title: 'Subscription Started',
      description: `${getSubscriptionLabel(user)} plan activated`,
      date: user.subscription.startDate || null,
      notes: null,
    }];
  }

  return [];
});

const openSetSubscriptionFromHistory = () => {
  const user = selectedUserForSubscription.value;
  closeSubscriptionHistoryModal();
  if (user) {
    // Small delay to allow modal to close
    setTimeout(() => {
      openSetSubscriptionModal(user);
    }, 300);
  }
};

// Set Subscription
const { $db } = useNuxtApp();

const openSetSubscriptionModal = (user: UserData) => {
  selectedUserForSubscription.value = user;

  // Set current plan in form
  const currentPlan = user.subscription?.plan || 'free';
  subscriptionForm.value.plan = currentPlan;

  // Set dates
  const today = new Date();
  subscriptionForm.value.startDate = today.toISOString().split('T')[0];

  // Calculate end date based on plan
  const endDate = new Date(today);
  if (currentPlan === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (currentPlan === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  subscriptionForm.value.endDate = endDate.toISOString().split('T')[0];
  subscriptionForm.value.notes = '';

  isSetSubscriptionModalOpen.value = true;
};

const closeSetSubscriptionModal = () => {
  isSetSubscriptionModalOpen.value = false;
  selectedUserForSubscription.value = null;
};

// Update end date when plan changes
watch(() => subscriptionForm.value.plan, (newPlan) => {
  if (subscriptionForm.value.startDate) {
    const startDate = new Date(subscriptionForm.value.startDate);
    const endDate = new Date(startDate);

    if (newPlan === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (newPlan === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    subscriptionForm.value.endDate = endDate.toISOString().split('T')[0];
  }
});

const handleSetSubscription = async () => {
  if (!selectedUserForSubscription.value) return;

  isSettingSubscription.value = true;

  try {
    const userRef = doc($db, 'users', selectedUserForSubscription.value.uid);

    // Prepare subscription data
    const subscriptionData: any = {
      plan: subscriptionForm.value.plan,
      status: subscriptionForm.value.plan === 'free' ? 'active' : 'active',
      startDate: subscriptionForm.value.plan !== 'free' ? Timestamp.fromDate(new Date(subscriptionForm.value.startDate)) : null,
      endDate: subscriptionForm.value.plan !== 'free' ? Timestamp.fromDate(new Date(subscriptionForm.value.endDate)) : null,
    };

    // Create history entry
    const historyEntry = {
      action: subscriptionForm.value.plan === 'free' ? 'downgraded' : 'upgraded',
      description: `Plan changed to ${getSubscriptionLabel({ subscription: subscriptionData } as any)} by admin`,
      date: Timestamp.now(),
      notes: subscriptionForm.value.notes || null,
      adminId: userStore.user?.uid,
    };

    // Get current history
    const currentHistory = selectedUserForSubscription.value.subscriptionHistory || [];

    await updateDoc(userRef, {
      subscription: subscriptionData,
      subscriptionHistory: [...currentHistory, historyEntry],
      updatedAt: Timestamp.now(),
    });

    showToast('Subscription updated successfully!', 'success', 3000);
    closeSetSubscriptionModal();

    // Refresh users list
    await usersStore.refreshUsers();
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    showToast(error.message || 'Failed to update subscription', 'error', 3000);
  } finally {
    isSettingSubscription.value = false;
  }
};

const formatSubscriptionDate = (date: any) => {
  if (!date) return 'N/A';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatHistoryDate = (date: any) => {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// View user's subscription requests
const viewUserRequests = async (user: UserData) => {
  selectedUserForRequests.value = user;
  isUserRequestsModalOpen.value = true;
  isLoadingRequests.value = true;

  try {
    const q = query(
      collection($db, 'premiumRequests'),
      where('userId', '==', user.uid)
    );
    const snapshot = await getDocs(q);

    const requests: any[] = [];
    snapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort by createdAt descending (newest first)
    requests.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    userRequests.value = requests;
  } catch (error) {
    console.error('Error fetching user requests:', error);
    showToast('Failed to load requests', 'error', 2000);
  } finally {
    isLoadingRequests.value = false;
  }
};

const closeUserRequestsModal = () => {
  isUserRequestsModalOpen.value = false;
  selectedUserForRequests.value = null;
  userRequests.value = [];
};

const formatRequestDate = (date: any) => {
  if (!date) return 'N/A';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const viewScreenshot = (url: string) => {
  currentScreenshotUrl.value = url;
  isScreenshotModalOpen.value = true;
};

const closeScreenshotModal = () => {
  isScreenshotModalOpen.value = false;
  currentScreenshotUrl.value = '';
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.users-page {
  max-width: 1200px;
  margin: 0 auto;
}

.users-container {
  max-width: 1200px;
  margin: 0 auto;
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

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.header-actions .button-text {
  display: inline;
  margin-left: 4px;
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

/* Modal Container Styles */
.modal-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-close-btn ion-icon {
  font-size: 20px;
}

.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #fafafa;
}

.form-field {
  margin-bottom: 18px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 10px;
}

.field-label ion-icon {
  font-size: 18px;
  color: #667eea;
}

.field-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 15px;
  color: #333;
  background: white;
  transition: all 0.2s;
  outline: none;
}

.field-input:focus {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.field-input::placeholder {
  color: #999;
}

.select-wrapper {
  position: relative;
}

.field-select {
  width: 100%;
  padding: 14px 44px 14px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 15px;
  color: #333;
  background: white;
  transition: all 0.2s;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.field-select:focus {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #888;
  pointer-events: none;
}

.toggle-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 18px;
}

.toggle-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-info ion-icon {
  font-size: 22px;
  color: #ccc;
  transition: color 0.2s;
}

.toggle-info ion-icon.active {
  color: #2dd36f;
}

.toggle-info span {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff5f5;
  border: 1px solid #feb2b2;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 10px;
}

.error-alert ion-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #f0f0f0;
  background: white;
}

.modal-footer .cancel-btn {
  flex: 1;
  padding: 14px;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-footer .cancel-btn:hover {
  background: #f5f5f5;
  border-color: #ddd;
}

.modal-footer .submit-btn {
  flex: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-footer .submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.modal-footer .submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.modal-footer .submit-btn ion-icon {
  font-size: 18px;
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

  .header-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }

  .header-actions ion-button {
    flex: 1;
    font-size: 0.875rem;
  }

  .header-actions .button-text {
    display: none !important;
  }

  .header-actions ion-button ion-icon {
    margin: 0;
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

/* Subscription Chip */
.subscription-chip ion-icon {
  color: inherit;
}

/* Subscription History Modal */
.subscription-history-modal {
  --width: 90%;
  --max-width: 500px;
  --height: 90%;
  --border-radius: 16px;
}

.subscription-modal-content {
  --background: linear-gradient(180deg, #f8f9fa 0%, #fff 100%);
}

.subscription-history-container {
  max-width: 100%;
  padding-bottom: 20px;
}

/* User Info Header */
.user-info-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.user-avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar ion-icon {
  font-size: 40px;
  color: white;
}

.user-name-section h3 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
}

.plan-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-badge.warning {
  background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
  color: #333;
}

.plan-badge.medium {
  background: rgba(255, 255, 255, 0.9);
  color: #666;
}

.plan-badge.danger {
  background: #eb445a;
  color: white;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 16px;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.plan {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.pdf {
  background: linear-gradient(135deg, #2dd36f 0%, #1aa251 100%);
}

.stat-icon.start {
  background: linear-gradient(135deg, #3dc2ff 0%, #0ca7e6 100%);
}

.stat-icon.end {
  background: linear-gradient(135deg, #ffc409 0%, #e6a800 100%);
}

.stat-icon ion-icon {
  font-size: 22px;
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-label {
  font-size: 0.75rem;
  color: #888;
  font-weight: 500;
}

.stat-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Timeline History */
.history-timeline-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.history-timeline-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px 0;
  font-size: 1rem;
  font-weight: 700;
  color: #333;
}

.history-timeline-section h4 ion-icon {
  font-size: 20px;
  color: #667eea;
}

.timeline {
  position: relative;
  padding-left: 24px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, #667eea 0%, #e0e0e0 100%);
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -24px;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #667eea;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.timeline-item.upgraded .timeline-dot {
  background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
  box-shadow: 0 2px 6px rgba(255, 212, 0, 0.4);
}

.timeline-item.downgraded .timeline-dot {
  background: #999;
}

.timeline-item.expired .timeline-dot {
  background: #eb445a;
}

.timeline-content {
  background: #f8f9fa;
  padding: 14px 16px;
  border-radius: 12px;
  border-left: 3px solid #667eea;
}

.timeline-item.upgraded .timeline-content {
  border-left-color: #ffd700;
}

.timeline-item.downgraded .timeline-content {
  border-left-color: #999;
}

.timeline-item.expired .timeline-content {
  border-left-color: #eb445a;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.timeline-action {
  font-weight: 700;
  font-size: 0.9rem;
  color: #333;
}

.timeline-date {
  font-size: 0.75rem;
  color: #888;
}

.timeline-description {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}

.timeline-notes {
  margin: 8px 0 0 0;
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
}

.no-history-modern {
  text-align: center;
  padding: 30px 20px;
}

.no-history-icon {
  width: 60px;
  height: 60px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.no-history-icon ion-icon {
  font-size: 28px;
  color: #bbb;
}

.no-history-modern p {
  margin: 0;
  color: #888;
  font-size: 0.9rem;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.action-btn ion-icon {
  font-size: 20px;
}

/* User Requests Modal */
.user-requests-modal {
  --width: 90%;
  --max-width: 550px;
  --height: 85%;
  --border-radius: 16px;
}

.requests-modal-content {
  --background: #f8f9fa;
}

.requests-container {
  padding-bottom: 20px;
}

.requests-user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 14px;
  margin-bottom: 20px;
  color: white;
}

.requests-user-header ion-icon {
  font-size: 32px;
}

.requests-user-header span {
  font-size: 1.1rem;
  font-weight: 700;
}

.loading-requests {
  text-align: center;
  padding: 60px 20px;
}

.loading-requests p {
  margin-top: 12px;
  color: #666;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-card {
  background: white;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #ffc409;
}

.request-card.approved {
  border-left-color: #2dd36f;
}

.request-card.rejected {
  border-left-color: #eb445a;
}

.request-card.pending {
  border-left-color: #ffc409;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.request-plan {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #333;
}

.request-plan ion-icon {
  font-size: 20px;
  color: #667eea;
}

.request-status {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.request-status.pending {
  background: #fff3cd;
  color: #856404;
}

.request-status.approved {
  background: #d4edda;
  color: #155724;
}

.request-status.rejected {
  background: #f8d7da;
  color: #721c24;
}

.request-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.request-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #555;
}

.request-detail ion-icon {
  font-size: 16px;
  color: #888;
}

.request-notes {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 0.85rem;
  color: #666;
  background: #f8f9fa;
  padding: 10px 12px;
  border-radius: 8px;
  margin-top: 4px;
}

.request-notes ion-icon {
  font-size: 16px;
  color: #667eea;
  flex-shrink: 0;
  margin-top: 2px;
}

.request-screenshot {
  margin-top: 4px;
}

.view-screenshot-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #667eea;
  background: transparent;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
}

.view-screenshot-btn:hover {
  background: #667eea;
  color: white;
}

.view-screenshot-btn ion-icon {
  font-size: 18px;
}

.no-requests {
  text-align: center;
  padding: 60px 20px;
}

.no-requests-icon {
  width: 80px;
  height: 80px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.no-requests-icon ion-icon {
  font-size: 36px;
  color: #bbb;
}

.no-requests h4 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #333;
}

.no-requests p {
  margin: 0;
  color: #888;
  font-size: 0.9rem;
}

/* Screenshot Modal */
.screenshot-modal {
  --width: 95%;
  --max-width: 800px;
  --height: 90%;
  --border-radius: 12px;
}

.screenshot-content {
  --background: #000;
}

.screenshot-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 20px;
}

.screenshot-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

/* Set Subscription Modal */
.set-subscription-modal {
  --width: 90%;
  --max-width: 550px;
  --height: 85%;
  --border-radius: 12px;
}

.set-subscription-modal ion-content {
  --background: #f8f9fa;
}

.set-subscription-container {
  padding: 8px;
}

.current-plan-info {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1rem;
  color: #666;
}

.current-plan-info strong {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.current-plan-info strong.warning {
  background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
  color: #333;
}

.current-plan-info strong.medium {
  background: #f0f0f0;
  color: #666;
}

/* Plan Selection */
.plan-selection h4,
.duration-section h4,
.notes-section h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.plan-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.plan-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.plan-option:hover {
  border-color: #667eea;
}

.plan-option.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.plan-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.plan-icon.free {
  background: #f0f0f0;
}

.plan-icon.monthly {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.plan-icon.yearly {
  background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
}

.plan-icon ion-icon {
  font-size: 24px;
  color: white;
}

.plan-icon.free ion-icon {
  color: #666;
}

.plan-info h5 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.plan-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #888;
}

/* Duration Section */
.duration-section {
  margin-bottom: 20px;
}

.date-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.date-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-input label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
}

.custom-date-input {
  padding: 12px 14px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
}

.custom-date-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Notes Section */
.notes-section {
  margin-bottom: 20px;
}

.notes-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  resize: none;
  font-family: inherit;
  transition: all 0.3s ease;
}

.notes-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.submit-btn {
  --border-radius: 12px;
  height: 52px;
  font-weight: 600;
}
</style>

<style>
/* Non-scoped styles for user modal */
.user-modal {
  --width: 90%;
  --max-width: 500px;
  --height: 85vh;
  --border-radius: 16px;
  --box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.user-modal::part(content) {
  margin: auto;
}
</style>
