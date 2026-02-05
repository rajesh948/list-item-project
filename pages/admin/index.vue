<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Admin Dashboard</h1>
      <p class="dashboard-subtitle">Manage your CaterHub platform</p>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card categories">
        <div class="stat-icon">
          <ion-icon :icon="gridOutline"></ion-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ totalCategories }}</span>
          <span class="stat-label">Categories</span>
        </div>
      </div>

      <div class="stat-card items">
        <div class="stat-icon">
          <ion-icon :icon="fastFoodOutline"></ion-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ totalItems }}</span>
          <span class="stat-label">Menu Items</span>
        </div>
      </div>

      <div class="stat-card users">
        <div class="stat-icon">
          <ion-icon :icon="peopleOutline"></ion-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ totalUsers }}</span>
          <span class="stat-label">Users</span>
        </div>
      </div>

      <div class="stat-card requests">
        <div class="stat-icon">
          <ion-icon :icon="cardOutline"></ion-icon>
          <span v-if="pendingRequestsCount > 0" class="pending-badge">{{ pendingRequestsCount }}</span>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ pendingRequestsCount }}</span>
          <span class="stat-label">Pending Requests</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions Section -->
    <div class="section-header">
      <h2 class="section-title">Quick Actions</h2>
    </div>

    <div class="actions-grid">
      <div class="action-card" @click="navigateTo('/admin/categories')">
        <div class="action-icon categories">
          <ion-icon :icon="gridOutline"></ion-icon>
        </div>
        <div class="action-content">
          <h3>Category Management</h3>
          <p>Add, edit, and delete categories</p>
        </div>
        <ion-icon :icon="chevronForwardOutline" class="action-arrow"></ion-icon>
      </div>

      <div class="action-card" @click="navigateTo('/admin/items')">
        <div class="action-icon items">
          <ion-icon :icon="fastFoodOutline"></ion-icon>
        </div>
        <div class="action-content">
          <h3>Item Management</h3>
          <p>Manage items across all categories</p>
        </div>
        <ion-icon :icon="chevronForwardOutline" class="action-arrow"></ion-icon>
      </div>

      <div class="action-card" @click="navigateTo('/admin/users')">
        <div class="action-icon users">
          <ion-icon :icon="peopleOutline"></ion-icon>
        </div>
        <div class="action-content">
          <h3>User Management</h3>
          <p>Create, edit, and manage user accounts</p>
        </div>
        <ion-icon :icon="chevronForwardOutline" class="action-arrow"></ion-icon>
      </div>

      <div class="action-card" @click="navigateTo('/admin/requests')">
        <div class="action-icon requests">
          <ion-icon :icon="cardOutline"></ion-icon>
          <span v-if="pendingRequestsCount > 0" class="card-badge">{{ pendingRequestsCount }}</span>
        </div>
        <div class="action-content">
          <h3>Premium Requests</h3>
          <p>Review and approve subscription requests</p>
        </div>
        <ion-icon :icon="chevronForwardOutline" class="action-arrow"></ion-icon>
      </div>

      <div class="action-card" @click="navigateTo('/admin/settings')">
        <div class="action-icon settings">
          <ion-icon :icon="settingsOutline"></ion-icon>
        </div>
        <div class="action-content">
          <h3>App Settings</h3>
          <p>Configure PDF limits and pricing</p>
        </div>
        <ion-icon :icon="chevronForwardOutline" class="action-arrow"></ion-icon>
      </div>
    </div>

    <!-- Database Initialization Section -->
    <div v-if="totalCategories === 0" class="init-section">
      <div class="init-card">
        <div class="init-icon">
          <ion-icon :icon="alertCircleOutline"></ion-icon>
        </div>
        <h3>No Categories Found</h3>
        <p>Initialize your database with sample categories and items to get started.</p>
        <button class="init-btn" @click="initializeDatabase" :disabled="isInitializing">
          <ion-spinner v-if="isInitializing" name="crescent"></ion-spinner>
          <template v-else>
            <ion-icon :icon="cloudDownloadOutline"></ion-icon>
            <span>Initialize Sample Data</span>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonSpinner } from '@ionic/vue';
import {
  peopleOutline,
  gridOutline,
  fastFoodOutline,
  alertCircleOutline,
  cloudDownloadOutline,
  cardOutline,
  settingsOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { initializeCategories } from '~/scripts/initCategories';

definePageMeta({
  middleware: 'admin',
});

const categoriesStore = useCategoriesStore();
const usersStore = useUsersStore();
const premiumRequestsStore = usePremiumRequestsStore();
const { showToast } = useToast();

// Calculate statistics
const totalCategories = computed(() => categoriesStore.totalCategories);
const totalItems = computed(() => categoriesStore.totalItems);
const totalUsers = computed(() => usersStore.totalUsers);
const pendingRequestsCount = computed(() => premiumRequestsStore.pendingCount);

const isInitializing = ref(false);

onMounted(async () => {
  // Fetch data from stores (will use cache if available)
  try {
    await Promise.all([
      categoriesStore.fetchCategories(),
      usersStore.fetchUsers(),
      premiumRequestsStore.fetchRequests('pending'),
    ]);
  } catch (error) {
    // Error handling
  }
});

const initializeDatabase = async () => {
  isInitializing.value = true;

  try {
    const result = await initializeCategories();

    if (result.success) {
      showToast('Sample categories initialized successfully!', 'success', 3000);
      await categoriesStore.refreshCategories();
    } else {
      showToast(result.message || 'Failed to initialize categories', 'warning', 3000);
    }
  } catch (error) {
    showToast('An error occurred while initializing', 'error', 3000);
  } finally {
    isInitializing.value = false;
  }
};
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.dashboard-header {
  margin-bottom: 28px;
}

.dashboard-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dashboard-subtitle {
  font-size: 0.95rem;
  color: #888;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.stat-icon ion-icon {
  font-size: 28px;
  color: white;
}

.stat-card.categories .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.items .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.users .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.requests .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.pending-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #eb445a;
  color: white;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(235, 68, 90, 0.4);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  color: #888;
  font-weight: 500;
}

/* Section Header */
.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.action-card:hover .action-arrow {
  transform: translateX(4px);
  color: #667eea;
}

.action-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.action-icon ion-icon {
  font-size: 26px;
  color: white;
}

.action-icon.categories {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.action-icon.items {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.action-icon.users {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.action-icon.requests {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.action-icon.settings {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.action-icon.settings ion-icon {
  color: #555;
}

.card-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #eb445a;
  color: white;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(235, 68, 90, 0.4);
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.action-content p {
  font-size: 0.85rem;
  color: #888;
  margin: 0;
}

.action-arrow {
  font-size: 20px;
  color: #ccc;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

/* Init Section */
.init-section {
  margin-top: 32px;
}

.init-card {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  border: 1px solid #ffc107;
}

.init-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.init-icon ion-icon {
  font-size: 32px;
  color: #ffc107;
}

.init-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #856404;
  margin: 0 0 8px 0;
}

.init-card p {
  font-size: 0.9rem;
  color: #856404;
  margin: 0 0 20px 0;
}

.init-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.init-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.init-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.init-btn ion-icon {
  font-size: 20px;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-icon ion-icon {
    font-size: 24px;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
