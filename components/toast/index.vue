<template>
  <Transition name="slide-right">
    <div v-if="isVisible" class="custom-toast" :class="[type]">
      <div class="toast-content">
        <ion-icon :icon="getIcon()" class="toast-icon"></ion-icon>
        <div class="toast-message">{{ message }}</div>
        <ion-icon :icon="closeOutline" class="toast-close" @click="hide"></ion-icon>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { checkmarkCircleOutline, alertCircleOutline, informationCircleOutline, closeOutline } from 'ionicons/icons';

interface Props {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 3000,
});

const isVisible = ref(false);
let timeoutId: NodeJS.Timeout | null = null;

const getIcon = () => {
  switch (props.type) {
    case 'success':
      return checkmarkCircleOutline;
    case 'error':
      return alertCircleOutline;
    case 'info':
      return informationCircleOutline;
    default:
      return informationCircleOutline;
  }
};

const show = () => {
  isVisible.value = true;

  if (props.duration > 0) {
    timeoutId = setTimeout(() => {
      hide();
    }, props.duration);
  }
};

const hide = () => {
  isVisible.value = false;
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
};

defineExpose({
  show,
  hide,
});

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});
</script>

<style scoped>
.custom-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  min-width: 300px;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
}

.toast-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: #333;
  white-space: pre-line;
}

.toast-close {
  font-size: 20px;
  cursor: pointer;
  color: #666;
  flex-shrink: 0;
  transition: color 0.2s;
}

.toast-close:hover {
  color: #333;
}

/* Success variant */
.custom-toast.success {
  border-left: 4px solid #2dd36f;
}

.custom-toast.success .toast-icon {
  color: #2dd36f;
}

/* Error variant */
.custom-toast.error {
  border-left: 4px solid #eb445a;
}

.custom-toast.error .toast-icon {
  color: #eb445a;
}

/* Info variant */
.custom-toast.info {
  border-left: 4px solid #3880ff;
}

.custom-toast.info .toast-icon {
  color: #3880ff;
}

/* Slide from right animation */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  transform: translateX(120%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(120%);
  opacity: 0;
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .custom-toast {
    top: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
    max-width: none;
  }

  .toast-content {
    padding: 14px 16px;
  }

  .toast-message {
    font-size: 13px;
  }
}
</style>
