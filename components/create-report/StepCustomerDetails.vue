<template>
  <div class="step-customer">
    <!-- Customer Selection (Premium Feature) -->
    <div v-if="isPremium" class="customer-select-section">
      <button
        v-if="!selectedCustomer"
        class="select-customer-btn"
        @click="$emit('openCustomerModal')"
      >
        <ion-icon :icon="peopleOutline"></ion-icon>
        <span>Select from Customers</span>
        <ion-icon :icon="chevronForwardOutline" class="chevron"></ion-icon>
      </button>
      <div v-else class="selected-customer-card">
        <div class="customer-info">
          <ion-icon :icon="personOutline" class="customer-icon"></ion-icon>
          <div>
            <span class="customer-name">{{ selectedCustomer.name }}</span>
            <span class="customer-phone">{{ selectedCustomer.phone }}</span>
          </div>
        </div>
        <button class="change-customer-btn" @click="$emit('clearCustomer')">
          <ion-icon :icon="closeCircleOutline"></ion-icon>
        </button>
      </div>
      <div class="divider">
        <span>or fill manually</span>
      </div>
    </div>

    <form class="form-fields" @submit.prevent="validateAndNext">
      <div class="input-group">
        <label class="input-label">Name *</label>
        <div class="input-wrapper">
          <ion-icon :icon="personOutline" class="input-icon"></ion-icon>
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            placeholder="Customer name"
            required
          />
        </div>
      </div>

      <div class="input-group">
        <label class="input-label">Phone *</label>
        <div class="input-wrapper">
          <ion-icon :icon="callOutline" class="input-icon"></ion-icon>
          <input
            v-model="formData.phone"
            type="tel"
            class="form-input"
            placeholder="Phone number"
            required
          />
        </div>
      </div>

      <div class="input-group">
        <label class="input-label">Address *</label>
        <div class="input-wrapper">
          <ion-icon :icon="locationOutline" class="input-icon"></ion-icon>
          <input
            v-model="formData.address"
            type="text"
            class="form-input"
            placeholder="Event address"
            required
          />
        </div>
      </div>

      <div class="input-row">
        <div class="input-group half">
          <label class="input-label">Date *</label>
          <div class="input-wrapper">
            <ion-icon :icon="calendarOutline" class="input-icon"></ion-icon>
            <input
              v-model="formData.date"
              type="date"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="input-group half">
          <label class="input-label">People *</label>
          <div class="input-wrapper">
            <ion-icon :icon="peopleOutline" class="input-icon"></ion-icon>
            <input
              v-model="formData.noOfPeople"
              type="number"
              class="form-input"
              placeholder="0"
              required
            />
          </div>
        </div>
      </div>

      <div class="input-row">
        <div class="input-group half">
          <label class="input-label">Shift *</label>
          <div class="input-wrapper">
            <ion-icon :icon="timeOutline" class="input-icon"></ion-icon>
            <select v-model="formData.shift" class="form-input" required>
              <option value="" disabled>Select</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Night">Night</option>
            </select>
          </div>
        </div>

        <div class="input-group half">
          <label class="input-label">Price *</label>
          <div class="input-wrapper">
            <ion-icon :icon="cashOutline" class="input-icon"></ion-icon>
            <input
              v-model="formData.price"
              type="number"
              class="form-input"
              placeholder="0"
              required
            />
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message">
        <ion-icon :icon="alertCircleOutline"></ion-icon>
        <span>{{ error }}</span>
      </div>

      <button type="submit" class="next-btn">
        <span>Next: Select Items</span>
        <ion-icon :icon="arrowForwardOutline"></ion-icon>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import {
  personOutline,
  callOutline,
  calendarOutline,
  peopleOutline,
  locationOutline,
  timeOutline,
  cashOutline,
  chevronForwardOutline,
  closeCircleOutline,
  arrowForwardOutline,
  alertCircleOutline,
} from 'ionicons/icons';

interface CustomerData {
  name: string;
  phone: string;
  date: string;
  noOfPeople: string;
  address: string;
  shift: string;
  price: string;
}

const props = defineProps<{
  modelValue: CustomerData;
  selectedCustomer?: { name: string; phone: string; address?: string } | null;
  isPremium: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: CustomerData];
  next: [];
  openCustomerModal: [];
  clearCustomer: [];
}>();

const error = ref('');

const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const validateAndNext = () => {
  error.value = '';

  if (!formData.value.name?.trim()) {
    error.value = 'Please enter customer name';
    return;
  }
  if (!formData.value.phone?.trim()) {
    error.value = 'Please enter phone number';
    return;
  }
  if (!formData.value.date) {
    error.value = 'Please select a date';
    return;
  }
  if (!formData.value.noOfPeople) {
    error.value = 'Please enter number of people';
    return;
  }
  if (!formData.value.address?.trim()) {
    error.value = 'Please enter address';
    return;
  }
  if (!formData.value.shift) {
    error.value = 'Please select a shift';
    return;
  }
  if (!formData.value.price) {
    error.value = 'Please enter price';
    return;
  }

  emit('next');
};
</script>

<style scoped>
.step-customer {
  max-width: 500px;
  margin: 0 auto;
}

.customer-select-section {
  margin-bottom: 20px;
}

.select-customer-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.select-customer-btn:hover {
  border-color: #667eea;
  background: #f5f5ff;
}

.select-customer-btn ion-icon {
  font-size: 20px;
  color: #667eea;
}

.select-customer-btn span {
  flex: 1;
  text-align: left;
  color: #333;
  font-weight: 500;
}

.select-customer-btn .chevron {
  color: #999;
}

.selected-customer-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid #667eea;
  border-radius: 12px;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-icon {
  font-size: 32px;
  color: #667eea;
}

.customer-info div {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 600;
  color: #1a1a1a;
}

.customer-phone {
  font-size: 0.85rem;
  color: #666;
}

.change-customer-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
}

.change-customer-btn ion-icon {
  font-size: 24px;
  color: #999;
}

.divider {
  display: flex;
  align-items: center;
  margin: 16px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  padding: 0 12px;
  font-size: 0.8rem;
  color: #999;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-row {
  display: flex;
  gap: 12px;
}

.input-group {
  flex: 1;
}

.input-group.half {
  flex: 1;
}

.input-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 18px;
  color: #999;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 12px 14px 12px 44px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  background: #f8f9fa;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

select.form-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
}

.error-message ion-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.next-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  margin-top: 8px;
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.next-btn ion-icon {
  font-size: 20px;
}

@media (max-width: 480px) {
  .input-row {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
