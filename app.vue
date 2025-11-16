<template>
  <VitePwaManifest />

  <ion-app>
    <!-- Loading Screen -->
    <AppLoader :show="showLoading" :message="loadingMessage" />

    <!-- Main App -->
    <template v-if="!showLoading">
      <Header v-if="showHeader" />
      <ion-content id="main-content">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </ion-content>
    </template>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonContent } from '@ionic/vue';
import { App } from '@capacitor/app';

const route = useRoute();

// Initialize authentication
const { initAuth, isLoading: isAuthLoading } = useAuth();

const showLoading = ref(true);
const loadingMessage = ref('Loading user data...');

onMounted(async () => {
  // Initialize auth
  initAuth();

  // Wait for auth to complete
  const checkAuth = setInterval(() => {
    if (!isAuthLoading.value) {
      loadingMessage.value = 'Ready!';
      // Keep loading screen for a brief moment to show "Ready!" message
      setTimeout(() => {
        showLoading.value = false;
      }, 500);
      clearInterval(checkAuth);
    } else {
      loadingMessage.value = 'Loading user data...';
    }
  }, 100);

  // Timeout after 5 seconds
  setTimeout(() => {
    if (showLoading.value) {
      showLoading.value = false;
      clearInterval(checkAuth);
    }
  }, 5000);
});

// Show header only when not on login page
const showHeader = computed(() => route.path !== '/login');

// Handle Android hardware back button
if (process.client) {
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.exitApp();
    }
  });
}
</script>

<style scoped>
/* App styles */
</style>
