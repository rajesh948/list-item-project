<template>
  <div class="create-report-page">
    <!-- Progress Indicator -->
    <CreateReportWizardProgress
      :current-step="currentStep"
      :steps="['Details', 'Items', 'Preview']"
    />

    <!-- Step Content -->
    <div class="step-content">
      <!-- Step 1: Customer Details -->
      <CreateReportStepCustomerDetails
        v-if="currentStep === 1"
        v-model="customerData"
        :selected-customer="selectedCustomer"
        :is-premium="isPremium"
        @next="currentStep = 2"
        @open-customer-modal="showCustomerModal = true"
        @clear-customer="clearSelectedCustomer"
      />

      <!-- Step 2: Item Selection -->
      <CreateReportStepItemSelection
        v-if="currentStep === 2"
        v-model="selectedItems"
        :categories="categories"
        @next="currentStep = 3"
        @back="currentStep = 1"
      />

      <!-- Step 3: Preview -->
      <CreateReportStepPreview
        v-if="currentStep === 3"
        :customer-data="customerData"
        v-model:selected-items="selectedItems"
        v-model:report-name="reportName"
        :is-saving="isSaving"
        :is-edit-mode="isEditMode"
        @back="currentStep = 2"
        @save="handleSaveReport"
      />
    </div>

    <!-- Customer Selection Modal -->
    <ion-modal :is-open="showCustomerModal" @didDismiss="showCustomerModal = false">
      <ion-header>
        <ion-toolbar class="gradient-toolbar">
          <ion-title>Select Customer</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showCustomerModal = false">
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
            />
            <ion-icon
              v-if="customerSearchTerm"
              :icon="closeCircleOutline"
              class="clear-icon"
              @click="customerSearchTerm = ''"
            ></ion-icon>
          </div>

          <!-- Loading -->
          <div v-if="isLoadingCustomers" class="customer-loading">
            <ion-spinner name="crescent"></ion-spinner>
            <p>Loading customers...</p>
          </div>

          <!-- Empty -->
          <div v-else-if="filteredCustomers.length === 0" class="customer-empty">
            <ion-icon :icon="peopleOutline"></ion-icon>
            <p>{{ customerSearchTerm ? 'No customers found' : 'No customers yet' }}</p>
          </div>

          <!-- Customer List -->
          <div v-else class="customer-list">
            <div
              v-for="customer in filteredCustomers"
              :key="customer.id"
              class="customer-item"
              @click="selectCustomer(customer)"
            >
              <ion-icon :icon="personOutline" class="customer-icon"></ion-icon>
              <div class="customer-info">
                <span class="customer-name">{{ customer.name }}</span>
                <span class="customer-phone">{{ customer.phone }}</span>
              </div>
              <ion-icon :icon="chevronForwardOutline" class="chevron"></ion-icon>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Unsaved Changes Modal -->
    <ion-modal :is-open="showUnsavedModal" @didDismiss="handleModalDismiss" class="unsaved-modal">
      <div class="unsaved-modal-content">
        <div class="unsaved-icon edit-mode">
          <ion-icon :icon="alertCircleOutline"></ion-icon>
        </div>
        <h2>Unsaved Changes</h2>
        <p>You have unsaved changes. Would you like to save this report?</p>
        <div class="unsaved-actions">
          <button class="btn-discard" @click="handleDiscard" :disabled="isSavingDraft">
            Discard
          </button>
          <button class="btn-save" @click="handleSaveChanges" :disabled="isSavingDraft">
            <ion-spinner v-if="isSavingDraft" name="crescent"></ion-spinner>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </div>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonSpinner,
} from '@ionic/vue';
import {
  closeOutline,
  searchOutline,
  closeCircleOutline,
  peopleOutline,
  personOutline,
  chevronForwardOutline,
  alertCircleOutline,
} from 'ionicons/icons';

const { showToast } = useToast();
const { saveReport, getSavedReport } = useSavedReports();
const { isPremium } = useSubscription();
const { templates, fetchTemplates, loadTemplateItems } = useTemplates();
const categoriesStore = useCategoriesStore();
const customersStore = useCustomersStore();
const userStore = useUserStore();
const savedReportsStore = useSavedReportsStore();
const router = useRouter();
const route = useRoute();

// Edit mode
const isEditMode = ref(false);
const editReportId = ref<string | null>(null);
const originalData = ref<string | null>(null); // Store original data as JSON for comparison

// Wizard state
const currentStep = ref(1);
const isSaving = ref(false);
const reportName = ref('');
const isSaved = ref(false);
const isLoadingReport = ref(false);

// Customer data
const customerData = ref({
  name: '',
  phone: '',
  date: new Date().toISOString().split('T')[0],
  noOfPeople: '',
  address: '',
  shift: '',
  price: '',
});

// Selected items
const selectedItems = ref<{
  id: number;
  name: string;
  items: { id: string; name: string; image?: string }[];
}[]>([]);

// Customer modal
const showCustomerModal = ref(false);
const customerSearchTerm = ref('');
const selectedCustomer = ref<{ id: string; name: string; phone: string; address?: string } | null>(null);
const isLoadingCustomers = ref(false);

// Unsaved changes modal
const showUnsavedModal = ref(false);
const isSavingDraft = ref(false);
const pendingNavigation = ref<string | null>(null);

// Categories from store
const categories = computed(() => categoriesStore.allCategories);

// Get current data as JSON for comparison
const getCurrentDataJson = () => {
  return JSON.stringify({
    customerData: customerData.value,
    selectedItems: selectedItems.value,
    reportName: reportName.value,
  });
};

// Check if form has any data or changes
const hasUnsavedData = computed(() => {
  if (isSaved.value) return false;

  if (isEditMode.value) {
    // In edit mode, compare with original data
    if (!originalData.value) return false;
    return getCurrentDataJson() !== originalData.value;
  } else {
    // In create mode, check if any data entered
    const hasCustomerData = customerData.value.name.trim() !== '' ||
      customerData.value.phone.trim() !== '' ||
      customerData.value.address.trim() !== '' ||
      customerData.value.noOfPeople !== '' ||
      customerData.value.price !== '';

    const hasItems = selectedItems.value.length > 0;

    return hasCustomerData || hasItems;
  }
});

// Filtered customers
const filteredCustomers = computed(() => {
  const customers = customersStore.customers || [];
  if (!customerSearchTerm.value.trim()) return customers;

  const term = customerSearchTerm.value.toLowerCase();
  return customers.filter((c: any) =>
    c.name?.toLowerCase().includes(term) ||
    c.phone?.includes(term)
  );
});

// Navigation guard
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedData.value && !showUnsavedModal.value) {
    pendingNavigation.value = to.fullPath;
    showUnsavedModal.value = true;
    next(false);
  } else {
    next();
  }
});

// Load categories on mount
onMounted(async () => {
  if (categories.value.length === 0) {
    await categoriesStore.fetchCategories();
  }

  // Load customers if premium
  if (isPremium.value && userStore.user?.uid) {
    isLoadingCustomers.value = true;
    await customersStore.fetchCustomers(userStore.user.uid);
    isLoadingCustomers.value = false;
  }

  // Check for edit mode
  const editId = route.query.edit as string;
  if (editId) {
    isEditMode.value = true;
    editReportId.value = editId;
    await loadReportForEdit(editId);
    return;
  }

  // Check for template to load (from templates page "Use Template" button)
  const templateId = localStorage.getItem('useTemplateId');
  if (templateId && isPremium.value) {
    localStorage.removeItem('useTemplateId'); // Clear it immediately

    // Fetch templates first if not loaded
    await fetchTemplates();

    // Load template items
    const templateCategories = loadTemplateItems(templateId);
    if (templateCategories) {
      selectedItems.value = templateCategories;
      currentStep.value = 2; // Go directly to item selection step
      showToast('Template items loaded! Review and continue.', 'success');
    }
  }
});

// Load report data for editing
const loadReportForEdit = async (reportId: string) => {
  isLoadingReport.value = true;

  try {
    // Try to get from store first
    let report = savedReportsStore.allReports.find(r => r.id === reportId);

    // If not in store, fetch from Firestore
    if (!report) {
      report = await getSavedReport(reportId);
    }

    if (report) {
      // Populate form data
      reportName.value = report.reportName || '';

      customerData.value = {
        name: report.reportData?.name || '',
        phone: report.reportData?.phone || '',
        date: report.reportData?.date || new Date().toISOString().split('T')[0],
        noOfPeople: report.reportData?.noOfPeople || '',
        address: report.reportData?.address || '',
        shift: report.reportData?.shift || '',
        price: report.reportData?.price || '',
      };

      // Populate selected items
      if (report.selectedCategories && report.selectedCategories.length > 0) {
        selectedItems.value = report.selectedCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          items: cat.items?.map(item => ({
            id: String(item.id),
            name: item.name,
            image: item.image,
          })) || [],
        }));
      }

      // Set customer if available
      if (report.customerId) {
        selectedCustomer.value = {
          id: report.customerId,
          name: report.customerName || '',
          phone: report.customerPhone || '',
        };
      }

      // Store original data for change detection
      // Use nextTick to ensure all refs are updated before taking snapshot
      await nextTick();
      originalData.value = getCurrentDataJson();

      // Mark as not having unsaved changes initially
      isSaved.value = false;

      showToast('Report loaded for editing', 'success', 2000);
    } else {
      showToast('Report not found', 'danger', 2000);
      navigateTo('/reports');
    }
  } catch (error) {
    console.error('Error loading report:', error);
    showToast('Failed to load report', 'danger', 2000);
    navigateTo('/reports');
  } finally {
    isLoadingReport.value = false;
  }
};

const selectCustomer = (customer: any) => {
  selectedCustomer.value = customer;
  customerData.value.name = customer.name || '';
  customerData.value.phone = customer.phone || '';
  customerData.value.address = customer.address || '';
  showCustomerModal.value = false;
};

const clearSelectedCustomer = () => {
  selectedCustomer.value = null;
};

const handleSaveReport = async (name: string) => {
  if (!userStore.user?.uid) {
    showToast('Please login to save reports', 'warning');
    return;
  }

  isSaving.value = true;

  try {
    const reportData = {
      reportName: name || `${customerData.value.name} - ${customerData.value.date}`,
      customerName: customerData.value.name,
      customerPhone: customerData.value.phone,
      customerId: selectedCustomer.value?.id || null,
      userData: { ...customerData.value },
      selectedData: [...selectedItems.value],
      selectedTable: null,
      isDraft: false,
    };

    if (isEditMode.value && editReportId.value) {
      // Update existing report
      await updateExistingReport(editReportId.value, reportData);
    } else {
      // Create new report
      await saveReport(userStore.user.uid, reportData);

      // Increment customer order count if a customer was selected (only for new reports)
      if (selectedCustomer.value?.id) {
        await customersStore.incrementOrderCount(selectedCustomer.value.id);
      }
    }

    isSaved.value = true;
    showToast(isEditMode.value ? 'Report updated successfully!' : 'Report saved successfully!', 'success');

    // Refresh reports in store
    await savedReportsStore.refreshReports(userStore.user.uid);

    // Navigate to reports page
    await navigateTo('/reports');
  } catch (error) {
    console.error('Error saving report:', error);
    showToast('Failed to save report', 'danger');
  } finally {
    isSaving.value = false;
  }
};

const updateExistingReport = async (reportId: string, data: any) => {
  const { $db } = useNuxtApp();
  const { doc, updateDoc, Timestamp } = await import('firebase/firestore');

  const reportRef = doc($db, 'savedReports', reportId);
  await updateDoc(reportRef, {
    reportName: data.reportName,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerId: data.customerId,
    reportData: data.userData,
    selectedCategories: data.selectedData,
    selectedTable: data.selectedTable,
    isDraft: data.isDraft,
    updatedAt: Timestamp.now(),
  });
};

const handleModalDismiss = () => {
  if (!isSavingDraft.value) {
    showUnsavedModal.value = false;
    pendingNavigation.value = null;
  }
};

const handleDiscard = () => {
  isSaved.value = true; // Prevent re-trigger
  showUnsavedModal.value = false;

  if (pendingNavigation.value) {
    navigateTo(pendingNavigation.value);
  }
};

const handleSaveChanges = async () => {
  if (!userStore.user?.uid) {
    showToast('Please login to save', 'warning');
    return;
  }

  isSavingDraft.value = true;

  try {
    const reportDataName = reportName.value ||
      (customerData.value.name ? `${customerData.value.name} - ${customerData.value.date}` : `Report - ${new Date().toLocaleDateString()}`);

    const reportData = {
      reportName: reportDataName,
      customerName: customerData.value.name || '',
      customerPhone: customerData.value.phone || '',
      customerId: selectedCustomer.value?.id || null,
      userData: { ...customerData.value },
      selectedData: [...selectedItems.value],
      selectedTable: null,
      isDraft: false,
    };

    if (isEditMode.value && editReportId.value) {
      // Edit mode: Update existing report
      await updateExistingReport(editReportId.value, reportData);
    } else {
      // New report: Save as regular report
      await saveReport(userStore.user.uid, reportData);
    }

    showToast('Report saved!', 'success');
    isSaved.value = true;
    showUnsavedModal.value = false;

    // Refresh reports in store
    await savedReportsStore.refreshReports(userStore.user.uid);

    if (pendingNavigation.value) {
      await navigateTo(pendingNavigation.value);
    }
  } catch (error) {
    console.error('Error saving:', error);
    showToast('Failed to save report', 'danger');
  } finally {
    isSavingDraft.value = false;
  }
};
</script>

<style scoped>
.create-report-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.step-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

/* Customer Modal */
.gradient-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

.customer-modal-content {
  padding: 8px 0;
}

.customer-search-bar {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 16px;
}

.customer-search-bar ion-icon {
  font-size: 20px;
  color: #667eea;
  margin-right: 12px;
}

.customer-search-bar input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
}

.customer-search-bar .clear-icon {
  color: #999;
  cursor: pointer;
  margin-left: 8px;
  margin-right: 0;
}

.customer-loading,
.customer-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #888;
}

.customer-loading ion-spinner,
.customer-empty ion-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: #667eea;
}

.customer-empty ion-icon {
  opacity: 0.5;
}

.customer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.customer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.customer-item:hover {
  background: #f0f0f0;
}

.customer-item .customer-icon {
  font-size: 32px;
  color: #667eea;
}

.customer-item .customer-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.customer-item .customer-name {
  font-weight: 600;
  color: #1a1a1a;
}

.customer-item .customer-phone {
  font-size: 0.85rem;
  color: #666;
}

.customer-item .chevron {
  font-size: 20px;
  color: #999;
}

.unsaved-modal-content {
  padding: 32px 24px;
  text-align: center;
}

.unsaved-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.unsaved-icon.edit-mode {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.unsaved-icon ion-icon {
  font-size: 36px;
  color: white;
}

.unsaved-modal-content h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.unsaved-modal-content p {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.unsaved-actions {
  display: flex;
  gap: 12px;
}

.btn-discard,
.btn-save {
  flex: 1;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-discard {
  background: #f5f5f5;
  color: #666;
}

.btn-discard:hover:not(:disabled) {
  background: #e8e8e8;
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.btn-discard:disabled,
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

<style>
/* Unsaved Changes Modal - Non-scoped for Ionic ::part selectors */
.unsaved-modal {
  --width: 90%;
  --max-width: 400px;
  --height: auto;
  --border-radius: 16px;
}

.unsaved-modal::part(backdrop) {
  background: rgba(0, 0, 0, 0.5);
}

.unsaved-modal::part(content) {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
}
</style>
