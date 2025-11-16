<template>
  <ion-page>
    <ion-content class="ion-padding event-details-page">
      <div class="event-details-container">
        <div class="user-form-content">
          <div class="user-form-header">
            <ion-icon :icon="personCircleOutline" class="user-icon"></ion-icon>
            <h2>Event Details</h2>
            <p class="help-text">Fill in the details for this catering event</p>
          </div>

          <div class="user-form">
            <div class="input-group">
              <label class="input-label">Name</label>
              <div class="input-wrapper">
                <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
                <input
                  v-model="userFormData.name"
                  type="text"
                  class="user-input"
                  placeholder="Enter customer name"
                  required
                />
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">Phone Number</label>
              <div class="input-wrapper">
                <ion-icon :icon="callOutline" class="input-icon"></ion-icon>
                <input
                  v-model="userFormData.phone"
                  type="tel"
                  class="user-input"
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div class="input-row">
              <div class="input-group half">
                <label class="input-label">Number of People</label>
                <div class="input-wrapper">
                  <ion-icon :icon="peopleOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="userFormData.noOfPeople"
                    type="number"
                    class="user-input"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div class="input-group half">
                <label class="input-label">Date</label>
                <div class="input-wrapper">
                  <ion-icon :icon="calendarOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="userFormData.date"
                    type="date"
                    class="user-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="input-group">
              <label class="input-label">Address</label>
              <div class="input-wrapper">
                <ion-icon :icon="locationOutline" class="input-icon"></ion-icon>
                <input
                  v-model="userFormData.address"
                  type="text"
                  class="user-input"
                  placeholder="Enter event address"
                  required
                />
              </div>
            </div>

            <div class="input-row">
              <div class="input-group half">
                <label class="input-label">Price</label>
                <div class="input-wrapper">
                  <ion-icon :icon="cashOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="userFormData.price"
                    type="number"
                    class="user-input"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div class="input-group half">
                <label class="input-label">Shift</label>
                <div class="input-wrapper">
                  <ion-icon :icon="timeOutline" class="input-icon"></ion-icon>
                  <select v-model="userFormData.shift" class="user-input select-input">
                    <option value="" disabled>Select shift</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>
            </div>

            <div v-if="errorMessage" class="error-message">
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <ion-button expand="block" color="primary" @click="onSaveDetails" class="save-button">
              <ion-icon slot="start" :icon="checkmarkCircleOutline"></ion-icon>
              Save Details
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonIcon,
  IonButton,
} from '@ionic/vue';
import {
  personCircleOutline,
  personOutline,
  callOutline,
  peopleOutline,
  calendarOutline,
  locationOutline,
  cashOutline,
  timeOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

// Authentication is handled by global middleware (02-redirect-login.global.ts)

const { showToast } = useToast();
const errorMessage = ref<string | null>(null);

const userFormData = ref({
  name: null,
  phone: null,
  noOfPeople: null,
  date: null,
  address: null,
  price: null,
  shift: null,
});

onMounted(() => {
  // Load existing userData if available
  if (localStorage.getItem('userData')) {
    const userData = JSON.parse(localStorage.getItem('userData')!);
    userFormData.value = { ...userFormData.value, ...userData };
  }
});

const onSaveDetails = () => {
  if (!Object.values(userFormData.value).every((value) => value)) {
    return (errorMessage.value = 'Please Fill All Fields!');
  }
  localStorage.setItem('userData', JSON.stringify(userFormData.value));
  errorMessage.value = null;
  showToast('Event details saved successfully!', 'success', 2000);

  // Navigate to report page
  setTimeout(() => {
    navigateTo('/item-report');
  }, 500);
};
</script>

<style scoped>
.event-details-page {
  --background: #f8f9fa;
}

.event-details-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 0;
}

.user-form-content {
  width: 100%;
}

.user-form-header {
  text-align: center;
  margin-bottom: 32px;
}

.user-icon {
  font-size: 64px;
  color: #667eea;
  margin-bottom: 16px;
}

.user-form-content h2 {
  margin: 0 0 8px 0;
  font-size: 1.75rem;
  color: #333;
  font-weight: 700;
}

.user-form-content .help-text {
  margin: 0;
  font-size: 0.95rem;
  color: #666;
}

.user-form {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.input-group {
  margin-bottom: 20px;
}

.input-group:last-child {
  margin-bottom: 0;
}

.input-group.half {
  flex: 1;
}

.input-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px 16px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  background: white;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.input-icon {
  font-size: 22px;
  color: #667eea;
  margin-right: 12px;
  flex-shrink: 0;
}

.user-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.user-input::placeholder {
  color: #999;
  font-weight: 400;
}

.select-input {
  cursor: pointer;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fee;
  color: #eb445a;
  padding: 12px 16px;
  border-radius: 12px;
  margin-top: 20px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
}

.error-message ion-icon {
  font-size: 20px;
}

.save-button {
  height: 48px;
  font-weight: 600;
  font-size: 16px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .input-row {
    flex-direction: column;
    gap: 0;
  }

  .input-group.half {
    margin-bottom: 20px;
  }
}
</style>
