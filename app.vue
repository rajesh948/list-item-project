<template>
  <VitePwaManifest />
  <ion-app>
    <Header />
    <ion-content id="main-content">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </ion-content>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonContent } from '@ionic/vue';
import { App } from '@capacitor/app';

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
