<template>
  <aside class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed, 'sidebar-mobile-open': isMobileOpen }">
    <!-- Logo/Brand -->
    <div class="sidebar-header">
      <div class="brand" @click="navigateTo('/')">
        <span class="brand-icon">🍽️</span>
        <span v-show="!isCollapsed" class="brand-text">CaterHub</span>
      </div>
      <button v-if="!isMobile" class="collapse-btn" @click="toggleCollapse">
        <ion-icon :icon="isCollapsed ? chevronForwardOutline : chevronBackOutline"></ion-icon>
      </button>
    </div>

    <!-- Navigation Links -->
    <nav class="sidebar-nav">
      <div class="nav-section">
        <LayoutSidebarItem
          v-for="item in mainNavItems"
          :key="item.path"
          :icon="item.icon"
          :label="item.label"
          :path="item.path"
          :is-active="isActive(item.path)"
          :is-collapsed="isCollapsed"
          @click="handleNavClick(item.path)"
        />
      </div>

      <div class="nav-divider"></div>

      <div class="nav-section">
        <LayoutSidebarItem
          v-for="item in bottomNavItems"
          :key="item.path"
          :icon="item.icon"
          :label="item.label"
          :path="item.path"
          :is-active="isActive(item.path)"
          :is-collapsed="isCollapsed"
          @click="handleNavClick(item.path)"
        />
        <LayoutSidebarItem
          icon="log-out-outline"
          label="Logout"
          :is-collapsed="isCollapsed"
          @click="handleLogout"
        />
      </div>
    </nav>

    <!-- User Info (Bottom) - Hidden for admin -->
    <div v-if="!isCollapsed && user && !isAdmin" class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">
          <ion-icon :icon="personCircleOutline"></ion-icon>
        </div>
        <div class="user-details">
          <span class="user-name">{{ user.username || 'User' }}</span>
          <span class="user-plan" :class="isPremium ? 'premium' : 'free'">
            {{ isPremium ? 'Premium' : 'Free Plan' }}
          </span>
        </div>
      </div>
    </div>
  </aside>

  <!-- Mobile Overlay -->
  <div v-if="isMobileOpen" class="sidebar-overlay" @click="closeMobile"></div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import {
  homeOutline,
  documentTextOutline,
  calendarOutline,
  peopleOutline,
  personCircleOutline,
  settingsOutline,
  chevronBackOutline,
  chevronForwardOutline,
  gridOutline,
  fastFoodOutline,
  cardOutline,
  shieldOutline,
} from 'ionicons/icons';

const props = defineProps<{
  isMobileOpen?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close-mobile'): void;
}>();

const route = useRoute();
const userStore = useUserStore();
const { logout } = useAuth();
const { isPremium } = useSubscription();

const user = computed(() => userStore.user);
const isAdmin = computed(() => userStore.user?.role === 'admin');
const isCollapsed = ref(false);
const isMobile = ref(false);

// Navigation items for regular users
const userMainNavItems = [
  { path: '/', icon: homeOutline, label: 'Dashboard' },
  { path: '/reports', icon: documentTextOutline, label: 'Reports' },
  { path: '/calendar', icon: calendarOutline, label: 'Calendar' },
  { path: '/customers', icon: peopleOutline, label: 'Customers' },
];

// Navigation items for admin users
const adminMainNavItems = [
  { path: '/admin', icon: shieldOutline, label: 'Admin Panel' },
  { path: '/admin/categories', icon: gridOutline, label: 'Categories' },
  { path: '/admin/items', icon: fastFoodOutline, label: 'Menu Items' },
  { path: '/admin/users', icon: peopleOutline, label: 'Users' },
  { path: '/admin/requests', icon: cardOutline, label: 'Requests' },
  { path: '/admin/settings', icon: settingsOutline, label: 'Settings' },
];

// Computed nav items based on user role
const mainNavItems = computed(() => isAdmin.value ? adminMainNavItems : userMainNavItems);

const bottomNavItems = computed(() => {
  if (isAdmin.value) {
    return [];
  }
  return [
    { path: '/profile', icon: personCircleOutline, label: 'Profile' },
    { path: '/settings', icon: settingsOutline, label: 'Settings' },
  ];
});

const isActive = (path: string) => {
  if (path === '/') return route.path === '/';
  if (path === '/admin') return route.path === '/admin';
  return route.path.startsWith(path);
};

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem('sidebar-collapsed', String(isCollapsed.value));
};

const closeMobile = () => {
  emit('close-mobile');
};

const handleNavClick = (path: string) => {
  navigateTo(path);
  if (props.isMobileOpen) {
    closeMobile();
  }
};

const handleLogout = async () => {
  const result = await logout();
  if (result.success) {
    navigateTo('/login');
  }
};

// Check screen size
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (isMobile.value) {
    isCollapsed.value = false;
  }
};

onMounted(() => {
  checkMobile();

  // Restore collapsed state only on desktop, default to expanded
  if (!isMobile.value) {
    const saved = localStorage.getItem('sidebar-collapsed');
    isCollapsed.value = saved === 'true';
  }

  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width 0.3s ease, transform 0.3s ease;
}

.sidebar-collapsed {
  width: 72px;
}

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #e8e8e8;
  height: 65px;
  box-sizing: border-box;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.brand:hover {
  opacity: 0.8;
}

.brand-icon {
  font-size: 28px;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.collapse-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.sidebar-collapsed .collapse-btn {
  display: none;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 12px 8px;
}

/* Footer */
.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-plan {
  font-size: 0.75rem;
  color: #888;
}

.user-plan.premium {
  color: #667eea;
  font-weight: 500;
}

/* Mobile */
@media (max-width: 767px) {
  .sidebar {
    transform: translateX(-100%);
    width: 280px;
    box-shadow: none;
  }

  .sidebar-mobile-open {
    transform: translateX(0);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 99;
  }
}
</style>
