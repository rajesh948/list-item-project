<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="admin-container">
        <h2>Welcome, Admin!</h2>

        <!-- Statistics Cards -->
        <div class="stats-cards">
          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-value">{{ totalCategories }}</div>
              <div class="stat-label">Categories</div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-value">{{ totalItems }}</div>
              <div class="stat-label">Total Items</div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-value">{{ totalUsers }}</div>
              <div class="stat-label">Users</div>
            </ion-card-content>
          </ion-card>
        </div>

        <div class="admin-cards">
          <ion-card class="admin-card" button @click="navigateTo('/admin/categories')">
            <ion-card-content>
              <div class="card-icon">
                <ion-icon :icon="gridOutline"></ion-icon>
              </div>
              <h3>Category Management</h3>
              <p>Add, edit, and delete categories</p>
            </ion-card-content>
          </ion-card>

          <ion-card class="admin-card" button @click="navigateTo('/admin/items')">
            <ion-card-content>
              <div class="card-icon">
                <ion-icon :icon="fastFoodOutline"></ion-icon>
              </div>
              <h3>Item Management</h3>
              <p>Manage items across all categories</p>
            </ion-card-content>
          </ion-card>

          <ion-card class="admin-card" button @click="navigateTo('/admin/users')">
            <ion-card-content>
              <div class="card-icon">
                <ion-icon :icon="peopleOutline"></ion-icon>
              </div>
              <h3>User Management</h3>
              <p>Create, edit, and manage user accounts</p>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Database Initialization Section -->
        <div v-if="totalCategories === 0" class="init-section">
          <ion-card color="warning">
            <ion-card-content>
              <div class="init-content">
                <ion-icon :icon="alertCircleOutline" class="init-icon"></ion-icon>
                <h3>No Categories Found</h3>
                <p>Initialize your database with sample categories and items to get started.</p>
                <ion-button
                  expand="block"
                  color="primary"
                  @click="initializeDatabase"
                  :disabled="isInitializing"
                >
                  <ion-spinner v-if="isInitializing" name="crescent"></ion-spinner>
                  <ion-icon v-else slot="start" :icon="cloudDownloadOutline"></ion-icon>
                  <span v-if="!isInitializing">Initialize Sample Data</span>
                  <span v-else>Initializing...</span>
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
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
} from '@ionic/vue';
import {
  peopleOutline,
  gridOutline,
  fastFoodOutline,
  alertCircleOutline,
  cloudDownloadOutline,
} from 'ionicons/icons';
import { initializeCategories } from '~/scripts/initCategories';

definePageMeta({
  middleware: 'admin',
});

const categoriesStore = useCategoriesStore();
const usersStore = useUsersStore();
const { showToast } = useToast();

// Calculate statistics
const totalCategories = computed(() => categoriesStore.totalCategories);
const totalItems = computed(() => categoriesStore.totalItems);
const totalUsers = computed(() => usersStore.totalUsers);

const isInitializing = ref(false);

onMounted(async () => {
  // Fetch data from stores (will use cache if available)
  try {
    await Promise.all([
      categoriesStore.fetchCategories(),
      usersStore.fetchUsers(),
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
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-container h2 {
  font-size: 28px;
  margin-bottom: 24px;
  color: #333;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-left: 4px solid #667eea;
}

.stat-card ion-card-content {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admin-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.admin-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.admin-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.admin-card ion-card-content {
  text-align: center;
  padding: 24px;
}

.card-icon {
  font-size: 48px;
  color: #3880ff;
  margin-bottom: 16px;
}

.admin-card h3 {
  font-size: 20px;
  margin: 0 0 8px 0;
  color: #333;
}

.admin-card p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.init-section {
  margin-top: 40px;
}

.init-content {
  text-align: center;
  padding: 20px;
}

.init-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.init-content h3 {
  font-size: 20px;
  margin: 0 0 8px 0;
  color: #333;
}

.init-content p {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.init-content ion-button {
  max-width: 400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .admin-container {
    padding: 16px;
  }

  .admin-container h2 {
    font-size: 24px;
  }

  .admin-cards {
    grid-template-columns: 1fr;
  }
}
</style>
