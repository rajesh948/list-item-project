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
                  </div>
                </div>
                <div class="user-actions">
                  <ion-button fill="clear" @click="openEditModal(user)">
                    <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" color="danger" @click="confirmDelete(user)">
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
} from 'ionicons/icons';
import type { UserData } from '~/stores/user';

definePageMeta({
  middleware: 'admin',
});

const { fetchUsers, createUser, updateUser, deleteUser } = useUsers();
const { showToast } = useToast();
const userStore = useUserStore();

const users = ref<UserData[]>([]);
const isLoading = ref(true);
const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const formError = ref('');
const editingUser = ref<UserData | null>(null);
const userToDelete = ref<UserData | null>(null);

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
  isLoading.value = false;
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
}
</style>
