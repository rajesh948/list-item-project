<template>
  <div>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Catering App</ion-title>
        <ion-buttons slot="end">
          <!-- <ion-button @click="onGoto('/decoration-table')">
            <ion-icon slot="icon-only" :icon="restaurantOutline"></ion-icon>
          </ion-button> -->
          <ion-button @click="onGoto('/item-report')">
            <ion-icon slot="icon-only" :icon="documentTextOutline"></ion-icon>
          </ion-button>
          <ion-button @click="onGoto('/')">
            <ion-icon slot="icon-only" :icon="homeOutline"></ion-icon>
          </ion-button>
          <ion-button @click="onToggleSettingsDialog">
            <ion-icon slot="icon-only" :icon="settingsOutline"></ion-icon>
          </ion-button>
          <ion-button @click="onToggleDialog">
            <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-menu content-id="main-content" type="overlay">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Categories</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list>
          <ion-item
            v-for="category in data"
            :key="category.id"
            button
            @click="onSelectCategory(category.id)"
            :class="{ 'ion-activated': selectedCategoryId == category.id }"
          >
            <ion-icon slot="start" :icon="gridOutline"></ion-icon>
            <ion-label class="category-label">{{ category.name }}</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-menu>

    <!-- Settings Dialog -->
    <ion-modal :is-open="isShowSettingsDialog" @didDismiss="onSettingsDialogDismiss">
      <ion-header>
        <ion-toolbar>
          <ion-title>Settings</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeSettingsDialog">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="settings-content">
          <h2>Business Information</h2>
          <p class="help-text">These details will appear on the PDF report</p>

          <ion-item>
            <ion-label position="stacked">Business Name</ion-label>
            <ion-input
              v-model="tempBusinessName"
              placeholder="મહાકાળી કેટર્સ"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Phone Numbers</ion-label>
            <ion-input
              v-model="tempPhoneNumbers"
              placeholder="Phone No: 97274 73918, 98263 52718"
            ></ion-input>
          </ion-item>

          <div class="settings-actions">
            <ion-button expand="block" @click="saveSettingsChanges">
              Save Settings
            </ion-button>
            <ion-button expand="block" fill="outline" @click="resetToDefaults">
              Reset to Defaults
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Alert Dialog for Reset Confirmation -->
    <ion-modal :is-open="isShowDialog" @didDismiss="onDialogDismiss">
      <ion-header>
        <ion-toolbar>
          <ion-title>Confirm Reset</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeDialog">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="dialog-content">
          <h2>Hello!</h2>
          <p>Are you sure you want to reset all selected items?</p>
          <div class="dialog-actions">
            <ion-button expand="block" color="danger" @click="resetDataBase(true)">
              Yes, Reset All
            </ion-button>
            <ion-button expand="block" fill="outline" @click="closeDialog">
              Cancel
            </ion-button>
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
  settingsOutline,
} from 'ionicons/icons';

const isShowDialog = ref(false);
const isShowSettingsDialog = ref(false);
const { data } = useData();
const route = useRoute();
const selectedCategoryId = computed(() => route.params?.id);

// Settings
const { businessName, phoneNumbers, saveSettings, resetSettings } = useSettings();
const tempBusinessName = ref('');
const tempPhoneNumbers = ref('');

const onSelectCategory = async (categoryId: string) => {
  // Close the menu first
  await menuController.close();
  // Then navigate
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
  isShowDialog.value = true;
};

const closeDialog = () => {
  isShowDialog.value = false;
};

const onDialogDismiss = () => {
  // Cleanup when modal is dismissed (if needed in future)
};

const onToggleSettingsDialog = () => {
  tempBusinessName.value = businessName.value;
  tempPhoneNumbers.value = phoneNumbers.value;
  isShowSettingsDialog.value = true;
};

const closeSettingsDialog = () => {
  isShowSettingsDialog.value = false;
};

const onSettingsDialogDismiss = () => {
  // Cleanup when modal is dismissed
};

const saveSettingsChanges = () => {
  saveSettings(tempBusinessName.value, tempPhoneNumbers.value);
  closeSettingsDialog();
};

const resetToDefaults = () => {
  resetSettings();
  tempBusinessName.value = businessName.value;
  tempPhoneNumbers.value = phoneNumbers.value;
};

const onGoto = (path: string) => navigateTo(path);
</script>

<style scoped>
.category-label {
  font-weight: bold !important;
  font-size: 1rem !important;
  padding: 10px;
}

/* Highlight selected category */
ion-item.ion-activated {
  --background: var(--ion-color-primary);
  --color: var(--ion-color-primary-contrast);
}

ion-item.ion-activated ion-icon {
  color: var(--ion-color-primary-contrast);
}

ion-item.ion-activated .category-label {
  color: var(--ion-color-primary-contrast);
  font-weight: 900 !important;
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

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings-content h2 {
  margin: 0;
  font-size: 1.5rem;
}

.settings-content .help-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

.settings-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
</style>
