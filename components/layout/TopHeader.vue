<template>
  <header class="top-header">
    <!-- Mobile Menu Button -->
    <button v-if="isMobile" class="menu-btn" @click="$emit('toggle-menu')">
      <ion-icon :icon="menuOutline"></ion-icon>
    </button>

    <!-- Page Title -->
    <div class="header-title">
      <h1>{{ pageTitle }}</h1>
    </div>

    <!-- Header Actions -->
    <div class="header-actions">
      <!-- Update Notification Icon -->
      <button
        v-if="hasUpdateNotification"
        class="action-btn update-btn"
        @click="$emit('show-update')"
        title="Update Available"
      >
        <ion-icon :icon="cloudDownloadOutline"></ion-icon>
        <span class="update-badge"></span>
      </button>

    <!-- Action Buttons (hidden for admin) -->
    <template v-if="!isAdmin">
      <!-- Premium Button -->
      <button
        class="action-btn premium-btn"
        :class="{ 'is-premium': isPremium }"
        @click="navigateTo('/subscription')"
        title="Subscription"
      >
        <ion-icon :icon="diamondOutline"></ion-icon>
      </button>

      <!-- Create Report Button -->
      <button
        class="action-btn create-btn"
        @click="navigateTo('/create-report')"
        title="Create Report"
      >
        <ion-icon :icon="addOutline"></ion-icon>
      </button>
    </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { menuOutline, diamondOutline, addOutline, cloudDownloadOutline } from 'ionicons/icons';

defineProps<{
  isMobile?: boolean;
  hasUpdateNotification?: boolean;
}>();

defineEmits<{
  (e: 'toggle-menu'): void;
  (e: 'show-update'): void;
}>();

const route = useRoute();
const userStore = useUserStore();
const { isPremium } = useSubscription();

const isAdmin = computed(() => userStore.user?.role === 'admin');

// Page titles mapping
const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/reports': 'Reports',
  '/calendar': 'Calendar',
  '/customers': 'Customers',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/subscription': 'Subscription',
  '/create-report': 'Create Report',
  '/admin': 'Admin Dashboard',
  '/admin/categories': 'Categories',
  '/admin/items': 'Menu Items',
  '/admin/users': 'Users',
  '/admin/requests': 'Premium Requests',
  '/admin/settings': 'App Settings',
};

const pageTitle = computed(() => {
  // Check exact match first
  if (pageTitles[route.path]) {
    return pageTitles[route.path];
  }
  // Check prefix matches
  for (const [path, title] of Object.entries(pageTitles)) {
    if (route.path.startsWith(path) && path !== '/') {
      return title;
    }
  }
  return 'CaterHub';
});
</script>

<style scoped>
.top-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  height: 65px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-sizing: border-box;
}

.menu-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f5f5f5;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #333;
  transition: all 0.2s;
}

.menu-btn:hover {
  background: #e8e8e8;
}

.header-title {
  flex: 1;
}

.header-title h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  transition: all 0.2s;
}

.premium-btn {
  background: #f5f5f5;
  color: #888;
}

.premium-btn:hover {
  background: #e8e8e8;
  color: #667eea;
}

.premium-btn.is-premium {
  background: linear-gradient(135deg, #ffd700 0%, #ff9500 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.premium-btn.is-premium:hover {
  transform: scale(1.05);
}

.create-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.create-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.update-btn {
  background: #fff3e0;
  color: #e65100;
  position: relative;
  animation: pulse-update 2s infinite;
}

.update-btn:hover {
  background: #ffe0b2;
  transform: scale(1.05);
}

.update-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 10px;
  height: 10px;
  background: #f44336;
  border-radius: 50%;
  border: 2px solid #fff3e0;
}

@keyframes pulse-update {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(230, 81, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(230, 81, 0, 0);
  }
}

@media (max-width: 767px) {
  .top-header {
    padding: 12px 16px;
  }

  .header-title h1 {
    font-size: 1.1rem;
  }
}
</style>
