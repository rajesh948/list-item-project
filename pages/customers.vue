<template>
  <div class="customers-page">
    <div class="ion-padding customers-content">
      <div class="customers-container">
        <!-- Premium Required Message -->
        <div v-if="!canAccessCustomers" class="premium-required">
          <div class="premium-icon">
            <ion-icon :icon="lockClosedOutline"></ion-icon>
          </div>
          <h2>Premium Feature</h2>
          <p>Customer database is available for premium subscribers only.</p>
          <ion-button @click="navigateTo('/subscription')">
            <ion-icon slot="start" :icon="diamondOutline"></ion-icon>
            Upgrade to Premium
          </ion-button>
        </div>

        <!-- Customer Management (Premium Users) -->
        <template v-else>
          <!-- Header with Add Button -->
          <div class="page-header">
            <div class="header-info">
              <h1>My Customers</h1>
              <p>{{ totalCustomers }} customers saved</p>
            </div>
            <ion-button @click="openAddModal">
              <ion-icon slot="start" :icon="addOutline"></ion-icon>
              Add Customer
            </ion-button>
          </div>

          <!-- Search Bar -->
          <div class="search-bar">
            <ion-icon :icon="searchOutline"></ion-icon>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search by name, phone, or address..."
            />
            <ion-icon
              v-if="searchTerm"
              :icon="closeCircleOutline"
              class="clear-icon"
              @click="searchTerm = ''"
            ></ion-icon>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="loading-container">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Loading customers...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredCustomers.length === 0" class="empty-state">
            <ion-icon :icon="peopleOutline"></ion-icon>
            <h3>{{ searchTerm ? 'No Results Found' : 'No Customers Yet' }}</h3>
            <p>{{ searchTerm ? 'Try a different search term' : 'Add your first customer to get started' }}</p>
            <ion-button v-if="!searchTerm" fill="outline" @click="openAddModal">
              <ion-icon slot="start" :icon="addOutline"></ion-icon>
              Add Customer
            </ion-button>
          </div>

          <!-- Customers List -->
          <div v-else class="customers-list">
            <div
              v-for="customer in filteredCustomers"
              :key="customer.id"
              class="customer-card"
              @click="viewCustomer(customer)"
            >
              <div class="customer-avatar">
                <ion-icon :icon="personOutline"></ion-icon>
              </div>
              <div class="customer-info">
                <h4>{{ customer.name }}</h4>
                <p class="customer-phone">
                  <ion-icon :icon="callOutline"></ion-icon>
                  {{ customer.phone }}
                </p>
                <p v-if="customer.address" class="customer-address">
                  <ion-icon :icon="locationOutline"></ion-icon>
                  {{ customer.address }}
                </p>
              </div>
              <div class="customer-meta">
                <span class="order-count">{{ customer.totalOrders || 0 }} orders</span>
                <ion-icon :icon="chevronForwardOutline" class="chevron"></ion-icon>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Add/Edit Customer Modal -->
      <ion-modal :is-open="showModal" @didDismiss="closeModal">
        <ion-header>
          <ion-toolbar class="gradient-toolbar">
            <ion-title>{{ editingCustomer ? 'Edit Customer' : 'Add Customer' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">
                <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="modal-content">
            <div class="input-group">
              <label>Name <span class="required">*</span></label>
              <input v-model="formData.name" type="text" placeholder="Customer name" />
            </div>

            <div class="input-group">
              <label>Phone <span class="required">*</span></label>
              <input v-model="formData.phone" type="tel" placeholder="Phone number" />
            </div>

            <div class="input-group">
              <label>Email</label>
              <input v-model="formData.email" type="email" placeholder="Email address (optional)" />
            </div>

            <div class="input-group">
              <label>Address</label>
              <textarea v-model="formData.address" placeholder="Address (optional)" rows="2"></textarea>
            </div>

            <div class="input-group">
              <label>Notes</label>
              <textarea v-model="formData.notes" placeholder="Any notes about this customer (optional)" rows="3"></textarea>
            </div>

            <div class="modal-actions">
              <ion-button fill="outline" @click="closeModal">Cancel</ion-button>
              <ion-button @click="saveCustomer" :disabled="isSaving || !formData.name || !formData.phone">
                <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
                <span v-else>{{ editingCustomer ? 'Update' : 'Add' }} Customer</span>
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>

      <!-- View Customer Modal -->
      <ion-modal :is-open="showViewModal" @didDismiss="closeViewModal">
        <ion-header>
          <ion-toolbar class="gradient-toolbar">
            <ion-title>Customer Details</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeViewModal">
                <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding" v-if="selectedCustomer">
          <div class="view-modal-content">
            <div class="customer-profile">
              <div class="profile-avatar">
                <ion-icon :icon="personOutline"></ion-icon>
              </div>
              <h2>{{ selectedCustomer.name }}</h2>
              <p class="customer-orders">{{ selectedCustomer.totalOrders || 0 }} orders placed</p>
            </div>

            <div class="customer-details">
              <div class="detail-item">
                <ion-icon :icon="callOutline"></ion-icon>
                <div>
                  <label>Phone</label>
                  <p>{{ selectedCustomer.phone }}</p>
                </div>
                <button class="action-btn" @click="callCustomer(selectedCustomer.phone)">
                  <ion-icon :icon="callOutline"></ion-icon>
                </button>
                <button class="action-btn whatsapp" @click="whatsappCustomer(selectedCustomer.phone)">
                  <ion-icon :icon="logoWhatsapp"></ion-icon>
                </button>
              </div>

              <div v-if="selectedCustomer.email" class="detail-item">
                <ion-icon :icon="mailOutline"></ion-icon>
                <div>
                  <label>Email</label>
                  <p>{{ selectedCustomer.email }}</p>
                </div>
              </div>

              <div v-if="selectedCustomer.address" class="detail-item">
                <ion-icon :icon="locationOutline"></ion-icon>
                <div>
                  <label>Address</label>
                  <p>{{ selectedCustomer.address }}</p>
                </div>
              </div>

              <div v-if="selectedCustomer.notes" class="detail-item">
                <ion-icon :icon="documentTextOutline"></ion-icon>
                <div>
                  <label>Notes</label>
                  <p>{{ selectedCustomer.notes }}</p>
                </div>
              </div>

              <div class="detail-item">
                <ion-icon :icon="calendarOutline"></ion-icon>
                <div>
                  <label>Added On</label>
                  <p>{{ formatDate(selectedCustomer.createdAt) }}</p>
                </div>
              </div>
            </div>

            <div class="view-modal-actions">
              <ion-button fill="outline" color="danger" @click="confirmDelete">
                <ion-icon slot="start" :icon="trashOutline"></ion-icon>
                Delete
              </ion-button>
              <ion-button @click="editCustomer(selectedCustomer)">
                <ion-icon slot="start" :icon="createOutline"></ion-icon>
                Edit
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  alertController,
} from '@ionic/vue';
import {
  lockClosedOutline,
  diamondOutline,
  addOutline,
  searchOutline,
  closeCircleOutline,
  peopleOutline,
  personOutline,
  callOutline,
  locationOutline,
  chevronForwardOutline,
  closeOutline,
  mailOutline,
  documentTextOutline,
  calendarOutline,
  trashOutline,
  createOutline,
  logoWhatsapp,
} from 'ionicons/icons';
import { Timestamp } from 'firebase/firestore';
import type { Customer } from '~/stores/customers';

const {
  customers,
  totalCustomers,
  isLoading,
  canAccessCustomers,
  loadCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
} = useCustomers();
const { showToast } = useToast();
const { shareToWhatsApp } = useWhatsApp();

const searchTerm = ref('');
const showModal = ref(false);
const showViewModal = ref(false);
const editingCustomer = ref<Customer | null>(null);
const selectedCustomer = ref<Customer | null>(null);
const isSaving = ref(false);

const formData = ref({
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
});

const filteredCustomers = computed(() => {
  if (!searchTerm.value.trim()) return customers.value;
  return searchCustomers(searchTerm.value);
});

const openAddModal = () => {
  editingCustomer.value = null;
  formData.value = { name: '', phone: '', email: '', address: '', notes: '' };
  showModal.value = true;
};

const editCustomer = (customer: Customer) => {
  editingCustomer.value = customer;
  formData.value = {
    name: customer.name,
    phone: customer.phone,
    email: customer.email || '',
    address: customer.address || '',
    notes: customer.notes || '',
  };
  showViewModal.value = false;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingCustomer.value = null;
};

const viewCustomer = (customer: Customer) => {
  selectedCustomer.value = customer;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedCustomer.value = null;
};

const saveCustomer = async () => {
  if (!formData.value.name.trim() || !formData.value.phone.trim()) {
    showToast('Name and phone are required', 'warning', 2000);
    return;
  }

  isSaving.value = true;

  try {
    if (editingCustomer.value) {
      const result = await updateCustomer(editingCustomer.value.id!, {
        name: formData.value.name.trim(),
        phone: formData.value.phone.trim(),
        email: formData.value.email.trim() || undefined,
        address: formData.value.address.trim() || undefined,
        notes: formData.value.notes.trim() || undefined,
      });

      if (result.success) {
        showToast('Customer updated successfully', 'success', 2000);
        closeModal();
      } else {
        showToast(result.error || 'Failed to update customer', 'error', 2000);
      }
    } else {
      const result = await addCustomer({
        name: formData.value.name.trim(),
        phone: formData.value.phone.trim(),
        email: formData.value.email.trim() || undefined,
        address: formData.value.address.trim() || undefined,
        notes: formData.value.notes.trim() || undefined,
      });

      if (result.success) {
        showToast('Customer added successfully', 'success', 2000);
        closeModal();
        // Force refresh the customers list
        await loadCustomers(true);
      } else {
        showToast(result.error || 'Failed to add customer', 'error', 2000);
      }
    }
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async () => {
  if (!selectedCustomer.value) return;

  const alert = await alertController.create({
    header: 'Delete Customer',
    message: `Are you sure you want to delete "${selectedCustomer.value.name}"? This action cannot be undone.`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          const result = await deleteCustomer(selectedCustomer.value!.id!);
          if (result.success) {
            showToast('Customer deleted', 'success', 2000);
            closeViewModal();
          } else {
            showToast(result.error || 'Failed to delete customer', 'error', 2000);
          }
        },
      },
    ],
  });

  await alert.present();
};

const callCustomer = (phone: string) => {
  window.open(`tel:${phone}`, '_self');
};

const whatsappCustomer = (phone: string) => {
  shareToWhatsApp(phone, 'Hello!');
};

const formatDate = (timestamp: Timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as any);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

onMounted(() => {
  if (canAccessCustomers.value) {
    loadCustomers();
  }
});
</script>

<style scoped>
.customers-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 0;
}

/* Premium Required */
.premium-required {
  text-align: center;
  padding: 60px 20px;
}

.premium-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.premium-icon ion-icon {
  font-size: 40px;
  color: white;
}

.premium-required h2 {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
}

.premium-required p {
  font-size: 16px;
  color: #666;
  margin: 0 0 24px 0;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-info h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.header-info p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* Search Bar */
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: #f5f5f5;
  border-radius: 12px;
  margin-bottom: 24px;
}

.search-bar ion-icon {
  font-size: 20px;
  color: #999;
}

.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  outline: none;
}

.search-bar .clear-icon {
  cursor: pointer;
}

/* Loading */
.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-container p {
  margin-top: 16px;
  color: #666;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state ion-icon {
  font-size: 64px;
  color: #ccc;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 8px 0;
}

.empty-state p {
  font-size: 15px;
  color: #666;
  margin: 0 0 24px 0;
}

/* Customers List */
.customers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.customer-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}

.customer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.customer-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.customer-avatar ion-icon {
  font-size: 24px;
  color: white;
}

.customer-info {
  flex: 1;
  min-width: 0;
}

.customer-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.customer-phone,
.customer-address {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  margin: 2px 0;
}

.customer-phone ion-icon,
.customer-address ion-icon {
  font-size: 14px;
}

.customer-address {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.customer-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-count {
  font-size: 12px;
  color: #999;
  background: #f0f0f0;
  padding: 4px 10px;
  border-radius: 12px;
}

.chevron {
  font-size: 18px;
  color: #ccc;
}

/* Modal Styles */
.gradient-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

.modal-content {
  max-width: 500px;
  margin: 0 auto;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.input-group .required {
  color: #f44336;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.input-group textarea {
  resize: vertical;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

/* View Modal */
.view-modal-content {
  max-width: 500px;
  margin: 0 auto;
}

.customer-profile {
  text-align: center;
  padding: 24px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 24px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar ion-icon {
  font-size: 40px;
  color: white;
}

.customer-profile h2 {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
}

.customer-orders {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.customer-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
}

.detail-item > ion-icon {
  font-size: 20px;
  color: #667eea;
  margin-top: 2px;
}

.detail-item > div {
  flex: 1;
}

.detail-item label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}

.detail-item p {
  margin: 0;
  font-size: 15px;
  color: #333;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: scale(1.05);
}

.action-btn.whatsapp {
  background: #25D366;
}

.action-btn ion-icon {
  font-size: 18px;
}

.view-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-header ion-button {
    width: 100%;
  }

  .modal-actions,
  .view-modal-actions {
    flex-direction: column;
  }

  .modal-actions ion-button,
  .view-modal-actions ion-button {
    width: 100%;
  }
}
</style>
