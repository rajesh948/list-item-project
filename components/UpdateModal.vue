<template>
  <Transition name="fade">
    <div v-if="show" class="update-overlay">
      <div class="update-modal">
        <!-- Header -->
        <div class="update-header">
          <div class="update-icon">
            <ion-icon :icon="cloudDownloadOutline"></ion-icon>
          </div>
          <h2 class="update-title">Update Available!</h2>
        </div>

        <!-- Content -->
        <div class="update-content">
          <div class="version-info">
            <div class="version-row">
              <span class="version-label">Current Version:</span>
              <span class="version-value">{{ updateInfo?.currentVersion }}</span>
            </div>
            <div class="version-row">
              <span class="version-label">New Version:</span>
              <span class="version-value highlight">{{ updateInfo?.latestVersion }}</span>
            </div>
          </div>

          <div class="release-notes" v-if="updateInfo?.releaseNotes">
            <h4>What's New:</h4>
            <p>{{ updateInfo.releaseNotes }}</p>
          </div>

          <p class="update-message" v-if="updateInfo?.forceUpdate">
            <ion-icon :icon="alertCircleOutline" class="warning-icon"></ion-icon>
            This update is required to continue using the app.
          </p>
        </div>

        <!-- Actions -->
        <div class="update-actions">
          <button
            v-if="!updateInfo?.forceUpdate || isAdmin"
            class="btn-later"
            @click="$emit('dismiss')"
          >
            Later
          </button>
          <button class="btn-update" @click="$emit('update')">
            <ion-icon :icon="downloadOutline"></ion-icon>
            Update Now
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { cloudDownloadOutline, downloadOutline, alertCircleOutline } from 'ionicons/icons';
import type { AppVersionInfo } from '~/composables/useAppUpdate';

interface Props {
  show: boolean;
  updateInfo: AppVersionInfo | null;
  isAdmin?: boolean;
}

defineProps<Props>();
defineEmits(['dismiss', 'update']);
</script>

<style scoped>
.update-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.update-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 380px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.update-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 24px;
  text-align: center;
  color: white;
}

.update-icon {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.update-icon ion-icon {
  font-size: 36px;
}

.update-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.update-content {
  padding: 24px;
}

.version-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.version-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.version-row:first-child {
  border-bottom: 1px solid #e9ecef;
}

.version-label {
  color: #6c757d;
  font-size: 14px;
}

.version-value {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.version-value.highlight {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
}

.release-notes {
  margin-bottom: 16px;
}

.release-notes h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.release-notes p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.update-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff3cd;
  color: #856404;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  margin: 0;
}

.warning-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.update-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

.btn-later {
  flex: 1;
  padding: 14px 20px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-later:hover {
  border-color: #ccc;
  background: #f8f9fa;
}

.btn-update {
  flex: 1.5;
  padding: 14px 20px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-update:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-update ion-icon {
  font-size: 20px;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .update-modal {
    background: #1e1e1e;
  }

  .update-title {
    color: white;
  }

  .version-info {
    background: #2d2d2d;
  }

  .version-row:first-child {
    border-bottom-color: #404040;
  }

  .version-label {
    color: #aaa;
  }

  .version-value {
    color: #fff;
  }

  .release-notes h4 {
    color: #fff;
  }

  .release-notes p {
    color: #bbb;
  }

  .btn-later {
    background: #2d2d2d;
    border-color: #404040;
    color: #ccc;
  }

  .btn-later:hover {
    background: #3d3d3d;
  }
}

/* Mobile responsive */
@media (max-width: 400px) {
  .update-modal {
    max-width: 100%;
  }

  .update-header {
    padding: 24px 20px;
  }

  .update-content {
    padding: 20px;
  }

  .update-actions {
    padding: 0 20px 20px;
    flex-direction: column;
  }

  .btn-later,
  .btn-update {
    flex: none;
    width: 100%;
  }
}
</style>
