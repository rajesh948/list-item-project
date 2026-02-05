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
            <!-- Customer Selection (Premium Feature) -->
            <div v-if="canAccessCustomers" class="customer-select-section">
              <button
                v-if="!selectedCustomer"
                class="select-customer-btn"
                @click="openCustomerModal"
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
                <button class="change-customer-btn" @click="clearSelectedCustomer">
                  <ion-icon :icon="closeCircleOutline"></ion-icon>
                </button>
              </div>
              <div class="divider">
                <span>or fill manually</span>
              </div>
            </div>

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

      <!-- Customer Selection Modal -->
      <ion-modal :is-open="showCustomerModal" @didDismiss="closeCustomerModal">
        <ion-header>
          <ion-toolbar class="gradient-toolbar">
            <ion-title>Select Customer</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeCustomerModal">
                <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="customer-modal-content">
            <!-- Search Bar -->
            <div class="customer-search-bar">
              <ion-icon :icon="searchOutline"></ion-icon>
              <input
                v-model="customerSearchTerm"
                type="text"
                placeholder="Search by name or phone..."
                @input="onCustomerSearch"
              />
              <ion-icon
                v-if="customerSearchTerm"
                :icon="closeCircleOutline"
                class="clear-icon"
                @click="customerSearchTerm = ''"
              ></ion-icon>
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingCustomers" class="customer-loading">
              <ion-spinner name="crescent"></ion-spinner>
              <p>Loading customers...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredCustomersList.length === 0" class="customer-empty">
              <ion-icon :icon="peopleOutline"></ion-icon>
              <p>{{ customerSearchTerm ? 'No customers found' : 'No customers yet' }}</p>
              <ion-button v-if="!customerSearchTerm" fill="outline" size="small" @click="goToCustomers">
                Add Customer
              </ion-button>
            </div>

            <!-- Customer List -->
            <div v-else class="customer-list">
              <div
                v-for="customer in filteredCustomersList"
                :key="customer.id"
                class="customer-item"
                @click="selectCustomer(customer)"
              >
                <div class="customer-avatar">
                  <ion-icon :icon="personOutline"></ion-icon>
                </div>
                <div class="customer-details">
                  <h4>{{ customer.name }}</h4>
                  <p>{{ customer.phone }}</p>
                  <p v-if="customer.address" class="customer-address">{{ customer.address }}</p>
                </div>
                <div class="customer-orders">
                  <span>{{ customer.totalOrders || 0 }} orders</span>
                </div>
              </div>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonIcon,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonSpinner,
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
  chevronForwardOutline,
  closeCircleOutline,
  closeOutline,
  searchOutline,
} from 'ionicons/icons';
import type { Customer } from '~/stores/customers';

// Authentication is handled by global middleware (02-redirect-login.global.ts)

const { showToast } = useToast();
const reportStore = useReportStore();
const router = useRouter();
const {
  customers,
  isLoading: isLoadingCustomers,
  canAccessCustomers,
  loadCustomers,
  searchCustomers,
} = useCustomers();

const errorMessage = ref<string | null>(null);
const showCustomerModal = ref(false);
const customerSearchTerm = ref('');
const selectedCustomer = ref<Customer | null>(null);

const userFormData = ref({
  name: null,
  phone: null,
  noOfPeople: null,
  date: null,
  address: null,
  price: null,
  shift: null,
});

// Filtered customers list based on search
const filteredCustomersList = computed(() => {
  if (!customerSearchTerm.value.trim()) return customers.value;
  return searchCustomers(customerSearchTerm.value);
});

onMounted(async () => {
  // Load existing userData from store
  reportStore.loadFromLocalStorage();
  if (reportStore.userData.name) {
    userFormData.value = { ...reportStore.userData } as any;
  }

  // Load customers if premium user
  if (canAccessCustomers.value) {
    await loadCustomers();
  }
});

// Customer Modal Functions
const openCustomerModal = async () => {
  customerSearchTerm.value = '';
  showCustomerModal.value = true;
  // Load/refresh customers when modal opens
  if (canAccessCustomers.value) {
    await loadCustomers(true); // Force refresh
  }
};

const closeCustomerModal = () => {
  showCustomerModal.value = false;
};

const onCustomerSearch = () => {
  // Search is handled reactively via computed
};

const selectCustomer = (customer: Customer) => {
  selectedCustomer.value = customer;

  // Auto-fill form data
  userFormData.value.name = customer.name as any;
  userFormData.value.phone = customer.phone as any;
  if (customer.address) {
    userFormData.value.address = customer.address as any;
  }

  closeCustomerModal();
  showToast(`Selected ${customer.name}`, 'success', 1500);
};

const clearSelectedCustomer = () => {
  selectedCustomer.value = null;
  // Optionally clear the form fields
  userFormData.value.name = null;
  userFormData.value.phone = null;
  userFormData.value.address = null;
};

const goToCustomers = () => {
  closeCustomerModal();
  router.push('/customers');
};

const onSaveDetails = () => {
  if (!Object.values(userFormData.value).every((value) => value)) {
    return (errorMessage.value = 'Please Fill All Fields!');
  }

  // Store customer ID if selected
  const reportData = {
    ...userFormData.value,
    customerId: selectedCustomer.value?.id || null,
  };

  reportStore.updateUserData(reportData as any);
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

/* Customer Selection Section */
.customer-select-section {
  margin-bottom: 24px;
}

.select-customer-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px dashed #667eea;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-customer-btn:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-style: solid;
}

.select-customer-btn ion-icon:first-child {
  font-size: 24px;
  color: #667eea;
}

.select-customer-btn span {
  flex: 1;
  text-align: left;
  font-size: 15px;
  font-weight: 600;
  color: #667eea;
}

.select-customer-btn .chevron {
  font-size: 20px;
  color: #667eea;
}

/* Selected Customer Card */
.selected-customer-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.selected-customer-card .customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-customer-card .customer-icon {
  font-size: 28px;
  opacity: 0.9;
}

.selected-customer-card .customer-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
}

.selected-customer-card .customer-phone {
  display: block;
  font-size: 13px;
  opacity: 0.85;
}

.change-customer-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.change-customer-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.change-customer-btn ion-icon {
  font-size: 22px;
  color: white;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.divider span {
  padding: 0 16px;
  font-size: 13px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Customer Modal */
.gradient-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

.customer-modal-content {
  max-width: 600px;
  margin: 0 auto;
}

.customer-search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 20px;
}

.customer-search-bar ion-icon {
  font-size: 20px;
  color: #999;
}

.customer-search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  outline: none;
}

.customer-search-bar .clear-icon {
  cursor: pointer;
}

.customer-loading {
  text-align: center;
  padding: 40px 20px;
}

.customer-loading p {
  margin-top: 12px;
  color: #666;
}

.customer-empty {
  text-align: center;
  padding: 40px 20px;
}

.customer-empty ion-icon {
  font-size: 48px;
  color: #ccc;
}

.customer-empty p {
  margin: 12px 0 16px 0;
  color: #666;
}

.customer-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.customer-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.customer-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  transform: translateY(-1px);
}

.customer-item:active {
  transform: scale(0.98);
}

.customer-item .customer-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.customer-item .customer-avatar ion-icon {
  font-size: 22px;
  color: white;
}

.customer-item .customer-details {
  flex: 1;
  min-width: 0;
}

.customer-item .customer-details h4 {
  margin: 0 0 2px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.customer-item .customer-details p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.customer-item .customer-details .customer-address {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #888;
  font-size: 12px;
}

.customer-item .customer-orders {
  flex-shrink: 0;
}

.customer-item .customer-orders span {
  font-size: 11px;
  color: #999;
  background: #f0f0f0;
  padding: 4px 10px;
  border-radius: 12px;
}
</style>
