<template>
  <div>
    <ion-header>
      <ion-toolbar class="gradient-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title
          :class="{ 'title-hidden': isHeaderMenuOpen }"
          @click="navigateTo('/')"
          style="cursor: pointer;"
        >
          {{ isAdmin ? (props.title || 'CaterPro') : businessName }}
        </ion-title>
        <ion-buttons slot="end">
          <!-- For Admin Users: Only show Logout button (no toggle) -->
          <template v-if="isAdmin">
            <ion-button @click="handleLogout" class="menu-item">
              <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
            </ion-button>
          </template>

          <!-- For Regular Users: Show toggle button and menu items -->
          <template v-else>
            <!-- Toggle Button -->
            <ion-button @click="toggleHeaderMenu">
              <ion-icon
                slot="icon-only"
                :icon="chevronBackOutline"
                class="toggle-icon"
                :class="{ 'icon-open': isHeaderMenuOpen }"
              ></ion-icon>
            </ion-button>

            <!-- Header Menu Items - Show/Hide with Animation -->
            <transition name="slide-fade">
              <ion-button v-if="isHeaderMenuOpen" @click="onGoto('/item-report')" class="menu-item" style="transition-delay: 0.1s">
                <ion-icon slot="icon-only" :icon="documentTextOutline"></ion-icon>
              </ion-button>
            </transition>
            <transition name="slide-fade">
              <ion-button v-if="isHeaderMenuOpen" @click="onGoto('/')" class="menu-item" style="transition-delay: 0.15s">
                <ion-icon slot="icon-only" :icon="homeOutline"></ion-icon>
              </ion-button>
            </transition>
            <transition name="slide-fade">
              <ion-button v-if="isHeaderMenuOpen" @click="onToggleDialog" class="menu-item" style="transition-delay: 0.2s">
                <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
              </ion-button>
            </transition>
            <transition name="slide-fade">
              <ion-button v-if="isHeaderMenuOpen" @click="handleLogout" class="menu-item" style="transition-delay: 0.25s">
                <ion-icon slot="icon-only" :icon="logOutOutline"></ion-icon>
              </ion-button>
            </transition>
          </template>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-menu content-id="main-content" type="overlay" class="modern-menu">
      <ion-header>
        <ion-toolbar class="gradient-toolbar">
          <ion-title class="menu-title">{{ isAdmin ? 'Admin Panel' : 'Categories' }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="menu-content">
        <!-- Admin Menu -->
        <ion-list v-if="isAdmin" class="category-list" lines="none">
          <ion-item
            button
            @click="navigateToAdmin('/admin')"
            class="category-item admin-menu-item"
            :class="{
              'ion-activated': route.path === '/admin',
              'selected-category': route.path === '/admin'
            }"
          >
            <ion-icon :icon="homeOutline" slot="start" class="admin-icon"></ion-icon>
            <ion-label class="category-label">Home</ion-label>
            <ion-icon
              v-if="route.path === '/admin'"
              :icon="chevronForwardOutline"
              slot="end"
              class="category-arrow"
            ></ion-icon>
          </ion-item>

          <ion-item
            button
            @click="navigateToAdmin('/admin/categories')"
            class="category-item admin-menu-item"
            :class="{
              'ion-activated': route.path === '/admin/categories',
              'selected-category': route.path === '/admin/categories'
            }"
          >
            <ion-icon :icon="gridOutline" slot="start" class="admin-icon"></ion-icon>
            <ion-label class="category-label">Category Management</ion-label>
            <ion-icon
              v-if="route.path === '/admin/categories'"
              :icon="chevronForwardOutline"
              slot="end"
              class="category-arrow"
            ></ion-icon>
          </ion-item>

          <ion-item
            button
            @click="navigateToAdmin('/admin/items')"
            class="category-item admin-menu-item"
            :class="{
              'ion-activated': route.path === '/admin/items',
              'selected-category': route.path === '/admin/items'
            }"
          >
            <ion-icon :icon="fastFoodOutline" slot="start" class="admin-icon"></ion-icon>
            <ion-label class="category-label">Item Management</ion-label>
            <ion-icon
              v-if="route.path === '/admin/items'"
              :icon="chevronForwardOutline"
              slot="end"
              class="category-arrow"
            ></ion-icon>
          </ion-item>

          <ion-item
            button
            @click="navigateToAdmin('/admin/users')"
            class="category-item admin-menu-item"
            :class="{
              'ion-activated': route.path === '/admin/users',
              'selected-category': route.path === '/admin/users'
            }"
          >
            <ion-icon :icon="peopleOutline" slot="start" class="admin-icon"></ion-icon>
            <ion-label class="category-label">User Management</ion-label>
            <ion-icon
              v-if="route.path === '/admin/users'"
              :icon="chevronForwardOutline"
              slot="end"
              class="category-arrow"
            ></ion-icon>
          </ion-item>
        </ion-list>

        <!-- Regular User Menu (Categories) -->
        <ion-list v-else class="category-list" lines="none">
          <ion-item
            v-for="category in data"
            :key="category.id"
            button
            @click="onSelectCategory(category.id)"
            :class="{
              'ion-activated': selectedCategoryId == category.id,
              'selected-category': selectedCategoryId == category.id
            }"
            class="category-item"
          >
            <ion-label class="category-label">{{ category.name }}</ion-label>
            <ion-icon
              v-if="selectedCategoryId == category.id"
              :icon="chevronForwardOutline"
              slot="end"
              class="category-arrow"
            ></ion-icon>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <!-- Alert Dialog for Reset Confirmation -->
    <ion-modal :is-open="isShowDialog" @didDismiss="onDialogDismiss" class="reset-modal">
      <ion-header>
        <ion-toolbar class="gradient-toolbar">
          <ion-title>Confirm Reset</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeDialog">
              <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding reset-modal-content">
        <div class="dialog-content">
          <div class="warning-icon-wrapper">
            <ion-icon :icon="warningOutline" class="warning-icon"></ion-icon>
          </div>
          <div class="content-wrapper">
            <h2>Reset All Data?</h2>
            <p>This will permanently delete all your selected items and categories. This action cannot be undone.</p>
            <div class="dialog-actions">
              <ion-button expand="block" fill="outline" color="medium" @click="closeDialog">
                <ion-icon slot="start" :icon="closeOutline"></ion-icon>
                Cancel
              </ion-button>
              <ion-button expand="block" color="danger" @click="resetDataBase(true)">
                <ion-icon slot="start" :icon="trashOutline"></ion-icon>
                Yes, Reset All
              </ion-button>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonMenuButton,
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonModal,
  IonInput,
  menuController,
} from '@ionic/vue';
import {
  homeOutline,
  documentTextOutline,
  restaurantOutline,
  trashOutline,
  gridOutline,
  logOutOutline,
  shieldCheckmarkOutline,
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
  warningOutline,
  fastFoodOutline,
  peopleOutline,
} from 'ionicons/icons';

// Props
const props = defineProps<{
  title?: string;
}>();

const isShowDialog = ref(false);
const isHeaderMenuOpen = ref(false);
const categoriesStore = useCategoriesStore();
const data = computed(() => categoriesStore.allCategories);
const route = useRoute();
const selectedCategoryId = computed(() => route.params?.id);

// Auth
const { isAuthenticated, isAdmin, userName, logout } = useAuth();

const handleLogout = async () => {
  isHeaderMenuOpen.value = false;
  const result = await logout();
  if (result.success) {
    await navigateTo('/login');
  }
};

// Business Info
const { businessName } = useSettings();

const onSelectCategory = async (categoryId: string) => {
  // Close the menu first
  await menuController.close();

  // If clicking on already selected category, do nothing
  if (selectedCategoryId.value == categoryId) {
    return;
  }

  // Navigate to the selected category
  navigateTo(`/list-item/${categoryId}`);
};

const resetDataBase = (isReset: boolean) => {
  if (isReset) {
    localStorage.clear();
    onGoto('/');
  }
  closeDialog();
};

const onToggleDialog = () => {
  isHeaderMenuOpen.value = false;
  isShowDialog.value = true;
};

const closeDialog = () => {
  isShowDialog.value = false;
};

const onDialogDismiss = () => {
  // Cleanup when modal is dismissed (if needed in future)
};

const onGoto = (path: string) => {
  isHeaderMenuOpen.value = false;
  navigateTo(path);
};

const navigateToAdmin = async (path: string) => {
  await menuController.close();
  navigateTo(path);
};

const toggleHeaderMenu = () => {
  isHeaderMenuOpen.value = !isHeaderMenuOpen.value;
};
</script>

<style scoped>
.gradient-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

/* Modern Menu Styling */
.modern-menu {
  --width: 240px;
}

.menu-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Menu content */
.menu-content {
  --background: #f8f9fa;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}

/* Category list in sidebar */
.category-list {
  padding: 16px 12px !important;
  margin: 0 !important;
  background: transparent;
}

/* Category items in sidebar */
.category-item {
  --min-height: 40px;
  height: 40px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 0;
  --padding-bottom: 0;
  --background: white;
  --background-hover: rgba(102, 126, 234, 0.05);
  --background-activated: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: #333;
  --border-radius: 8px;
  margin: 8px 0;
  border-radius: 8px;
  font-size: 13px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: visible;
  position: relative;
}

.category-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 4px 4px 0;
  transition: height 0.3s ease;
}

.category-item:hover {
  transform: translateX(2px);
  box-shadow: 0 3px 10px rgba(102, 126, 234, 0.15);
}

.category-item:hover::before {
  height: 60%;
}

.category-item:first-child {
  margin-top: 0 !important;
}

.category-label {
  font-weight: 600 !important;
  font-size: 13px !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #333;
}

.category-arrow {
  color: white;
  font-size: 18px;
  transition: transform 0.3s ease;
}

/* Admin menu styles */
.admin-menu-item .admin-icon {
  color: #667eea;
  font-size: 20px;
  margin-right: 8px;
}

.admin-menu-item:hover .admin-icon {
  color: white;
}

/* Highlight selected category */
ion-item.ion-activated,
ion-item.selected-category {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  --color: white !important;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.35) !important;
  transform: translateX(2px);
}

ion-item.ion-activated::before,
ion-item.selected-category::before {
  height: 80% !important;
  width: 4px !important;
}

ion-item.ion-activated .category-label,
ion-item.selected-category .category-label {
  color: white !important;
  font-weight: 700 !important;
}

ion-item.ion-activated .category-arrow,
ion-item.selected-category .category-arrow {
  color: white !important;
}

ion-item.ion-activated:hover,
ion-item.selected-category:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
}

/* Hide scrollbar in menu */
ion-menu ion-content::part(scroll) {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

ion-menu ion-content::part(scroll)::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dialog-content h2 {
  margin: 0;
  font-size: 1.5rem;
}

.dialog-content p {
  margin: 0;
  font-size: 1rem;
}

.dialog-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

/* Header Menu Responsive */
.title-hidden {
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* Toggle Icon Animation */
.toggle-icon {
  transition: transform 0.3s ease;
}

.toggle-icon.icon-open {
  transform: scaleX(-1);
}

/* Slide Fade Animation - Right to Left on Open, Left to Right on Close */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-fade-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.menu-item {
  display: inline-block;
}

/* Reset Modal Styling */
.reset-modal-content {
  --background: #f8f9fa;
}

.dialog-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.warning-icon-wrapper {
  margin-bottom: 24px;
}

.warning-icon {
  font-size: 64px;
  color: #eb445a;
}

.dialog-content h2 {
  margin: 0 0 12px 0;
  font-size: 1.75rem;
  color: #333;
  font-weight: 700;
}

.dialog-content p {
  margin: 0 0 24px 0;
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.dialog-actions ion-button {
  height: 48px;
  font-weight: 600;
  font-size: 16px;
}

/* Mobile Layout - Icon left, Content right */
@media (max-width: 768px) {
  .dialog-content {
    display: flex !important;
    flex-direction: row !important;
    align-items: flex-start !important;
    text-align: left !important;
    gap: 16px !important;
  }

  .warning-icon-wrapper {
    margin-bottom: 0 !important;
    flex-shrink: 0 !important;
    order: -1 !important;
  }

  .warning-icon {
    font-size: 48px !important;
  }

  .content-wrapper {
    flex: 1 !important;
    order: 1 !important;
  }

  .dialog-content h2 {
    font-size: 1.5rem !important;
    text-align: left !important;
  }

  .dialog-content p {
    font-size: 0.95rem !important;
    text-align: left !important;
  }

  .dialog-actions {
    margin-top: 16px !important;
  }
}
</style>
