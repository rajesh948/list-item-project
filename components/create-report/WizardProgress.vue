<template>
  <div class="wizard-progress">
    <div
      v-for="(step, index) in stepsData"
      :key="index"
      class="step"
      :class="{
        active: currentStep === index + 1,
        completed: currentStep > index + 1
      }"
    >
      <div class="step-indicator">
        <ion-icon v-if="currentStep > index + 1" :icon="checkmarkOutline"></ion-icon>
        <ion-icon v-else :icon="step.icon"></ion-icon>
      </div>
      <span class="step-label">{{ step.label }}</span>
      <div v-if="index < stepsData.length - 1" class="step-line"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import {
  checkmarkOutline,
  personOutline,
  restaurantOutline,
  documentTextOutline,
} from 'ionicons/icons';

defineProps<{
  currentStep: number;
  steps: string[];
}>();

const stepsData = [
  { label: 'Details', icon: personOutline },
  { label: 'Items', icon: restaurantOutline },
  { label: 'Preview', icon: documentTextOutline },
];
</script>

<style scoped>
.wizard-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  margin-bottom: 16px;
}

.step {
  display: flex;
  align-items: center;
  position: relative;
}

.step-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8e8e8;
  color: #888;
  transition: all 0.3s;
}

.step-indicator ion-icon {
  font-size: 20px;
}

.step.active .step-indicator {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.step.completed .step-indicator {
  background: #4CAF50;
  color: white;
}

.step-label {
  margin-left: 8px;
  font-size: 0.85rem;
  color: #888;
  font-weight: 500;
  white-space: nowrap;
}

.step.active .step-label {
  color: #667eea;
  font-weight: 600;
}

.step.completed .step-label {
  color: #4CAF50;
}

.step-line {
  width: 50px;
  height: 2px;
  background: #e8e8e8;
  margin: 0 12px;
}

.step.completed .step-line {
  background: #4CAF50;
}

@media (max-width: 500px) {
  .step-label {
    display: none;
  }

  .step-line {
    width: 30px;
    margin: 0 8px;
  }

  .step-indicator {
    width: 36px;
    height: 36px;
  }

  .step-indicator ion-icon {
    font-size: 18px;
  }
}
</style>
