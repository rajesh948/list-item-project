<template>
  <VitePwaManifest />

  <ion-app>
    <!-- Loading Screen -->
    <AppLoader :show="showLoading" :message="loadingMessage" />

    <!-- Main App -->
    <template v-if="!showLoading">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp } from '@ionic/vue';
import { App } from '@capacitor/app';

// Initialize authentication
const { initAuth, isLoading: isAuthLoading } = useAuth();

const showLoading = ref(true);
const loadingMessage = ref('Loading...');

onMounted(async () => {
  // Initialize auth
  initAuth();

  // Wait for auth to complete
  const checkAuth = setInterval(() => {
    if (!isAuthLoading.value) {
      loadingMessage.value = 'Ready!';
      setTimeout(() => {
        showLoading.value = false;
      }, 300);
      clearInterval(checkAuth);
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

<style>
/* Global styles */
ion-app {
  --ion-background-color: #f8f9fa;
}
</style>
