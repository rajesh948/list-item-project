<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="user-reports-container">
        <div class="page-header">
          <ion-button fill="clear" @click="navigateTo('/admin/users')" class="back-button">
            <ion-icon slot="start" :icon="arrowBackOutline"></ion-icon>
            Back to Users
          </ion-button>
          <h1>{{ userName }}'s Reports</h1>
          <p>View and manage user's saved reports</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading reports...</p>
        </div>

        <!-- Reports List -->
        <div v-else-if="reports.length > 0" class="reports-grid">
          <div v-for="report in reports" :key="report.id" class="report-card">
            <div class="report-header">
              <div class="report-title">
                <ion-icon :icon="documentTextOutline" class="report-icon"></ion-icon>
                <h3>{{ report.reportData.name }}</h3>
              </div>
              <div class="report-date">
                {{ formatDate(report.createdAt) }}
              </div>
            </div>

            <div class="report-details">
              <div class="detail-item">
                <ion-icon :icon="calendarOutline"></ion-icon>
                <span>{{ report.reportData.date }}</span>
              </div>
              <div class="detail-item">
                <ion-icon :icon="peopleOutline"></ion-icon>
                <span>{{ report.reportData.noOfPeople }} people</span>
              </div>
              <div class="detail-item">
                <ion-icon :icon="callOutline"></ion-icon>
                <span>{{ report.reportData.phone }}</span>
              </div>
              <div class="detail-item">
                <ion-icon :icon="cashOutline"></ion-icon>
                <span>₹{{ report.reportData.price }}</span>
              </div>
              <div class="detail-item">
                <ion-icon :icon="locationOutline"></ion-icon>
                <span>{{ report.reportData.address }}</span>
              </div>
              <div class="detail-item">
                <ion-icon :icon="timeOutline"></ion-icon>
                <span>{{ report.reportData.shift }}</span>
              </div>
            </div>

            <div class="report-items-count">
              <ion-chip color="primary">
                <ion-icon :icon="fastFoodOutline"></ion-icon>
                <ion-label>{{ getTotalItems(report.selectedCategories) }} items</ion-label>
              </ion-chip>
              <ion-chip v-if="report.selectedTable" color="secondary">
                <ion-icon :icon="restaurantOutline"></ion-icon>
                <ion-label>{{ report.selectedTable.name }}</ion-label>
              </ion-chip>
            </div>

            <div class="report-actions">
              <ion-button size="small" fill="outline" color="primary" @click="viewReport(report)">
                <ion-icon slot="start" :icon="eyeOutline"></ion-icon>
                View Details
              </ion-button>
              <ion-button size="small" fill="outline" color="danger" @click="confirmDelete(report)">
                <ion-icon slot="start" :icon="trashOutline"></ion-icon>
                Delete
              </ion-button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <ion-icon :icon="documentOutline" class="empty-icon"></ion-icon>
          <h2>No Saved Reports</h2>
          <p>This user hasn't saved any reports yet</p>
        </div>
      </div>

      <!-- View Report Modal -->
      <ion-modal :is-open="showViewModal" @didDismiss="closeViewModal" class="view-report-modal">
        <ion-header>
          <ion-toolbar class="gradient-toolbar">
            <ion-title>Report Details</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeViewModal">
                <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding" v-if="selectedReport">
          <div class="report-detail-view">
            <div class="section">
              <h3>Event Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Name:</strong> {{ selectedReport.reportData.name }}
                </div>
                <div class="info-item">
                  <strong>Date:</strong> {{ selectedReport.reportData.date }}
                </div>
                <div class="info-item">
                  <strong>People:</strong> {{ selectedReport.reportData.noOfPeople }}
                </div>
                <div class="info-item">
                  <strong>Phone:</strong> {{ selectedReport.reportData.phone }}
                </div>
                <div class="info-item">
                  <strong>Shift:</strong> {{ selectedReport.reportData.shift }}
                </div>
                <div class="info-item">
                  <strong>Price:</strong> ₹{{ selectedReport.reportData.price }}
                </div>
                <div class="info-item full-width">
                  <strong>Address:</strong> {{ selectedReport.reportData.address }}
                </div>
              </div>
            </div>

            <div class="section" v-if="selectedReport.selectedTable">
              <h3>Table Decoration</h3>
              <ion-chip color="secondary">
                <ion-label>{{ selectedReport.selectedTable.name }}</ion-label>
              </ion-chip>
            </div>

            <div class="section">
              <h3>Selected Items</h3>
              <div v-for="category in selectedReport.selectedCategories" :key="category.id" class="category-section">
                <h4>{{ category.name }}</h4>
                <div class="items-list">
                  <ion-chip v-for="item in category.items" :key="item.id" color="primary" outline>
                    <ion-label>{{ item.name }}</ion-label>
                  </ion-chip>
                </div>
              </div>
            </div>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Delete Confirmation Modal -->
      <ion-modal :is-open="showDeleteModal" @didDismiss="closeDeleteModal">
        <ion-header>
          <ion-toolbar class="gradient-toolbar">
            <ion-title>Confirm Delete</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeDeleteModal">
                <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="delete-modal-content">
            <ion-icon :icon="warningOutline" class="warning-icon"></ion-icon>
            <h2>Delete Report?</h2>
            <p>Are you sure you want to delete this report? This action cannot be undone.</p>
            <div class="modal-actions">
              <ion-button expand="block" fill="outline" @click="closeDeleteModal">
                Cancel
              </ion-button>
              <ion-button expand="block" color="danger" @click="handleDelete">
                Delete Report
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Loading for operations -->
      <AppLoader :show="isOperationLoading" :message="operationMessage" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonChip,
  IonLabel,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/vue';
import {
  documentTextOutline,
  calendarOutline,
  peopleOutline,
  callOutline,
  cashOutline,
  fastFoodOutline,
  eyeOutline,
  trashOutline,
  closeOutline,
  warningOutline,
  arrowBackOutline,
  locationOutline,
  timeOutline,
  restaurantOutline,
  documentOutline,
} from 'ionicons/icons';
import type { SavedReport } from '~/composables/useSavedReports';

definePageMeta({
  middleware: 'admin',
});

const route = useRoute();
const { deleteReport } = useSavedReports();
const { showToast } = useToast();
const usersStore = useUsersStore();

const userId = route.params.uid as string;
const userName = ref('User');
const reports = ref<SavedReport[]>([]);
const isLoading = ref(true);
const isOperationLoading = ref(false);
const operationMessage = ref('');
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const selectedReport = ref<SavedReport | null>(null);
const reportToDelete = ref<SavedReport | null>(null);

const loadReports = async () => {
  try {
    isLoading.value = true;

    // Use cached reports from store
    reports.value = usersStore.getUserReports(userId);
    console.log('📦 Using cached reports for user:', userId);

    if (reports.value.length > 0) {
      userName.value = reports.value[0].userName;
    }
  } catch (error) {
    console.error('Error loading reports:', error);
    showToast('Failed to load reports', 'error', 2000);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadReports();
});

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getTotalItems = (categories: any[]) => {
  return categories.reduce((total, category) => total + (category.items?.length || 0), 0);
};

const viewReport = (report: SavedReport) => {
  selectedReport.value = report;
  showViewModal.value = true;
};

const closeViewModal = () => {
  showViewModal.value = false;
  selectedReport.value = null;
};

const confirmDelete = (report: SavedReport) => {
  reportToDelete.value = report;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  reportToDelete.value = null;
};

const handleDelete = async () => {
  if (!reportToDelete.value?.id) return;

  try {
    isOperationLoading.value = true;
    operationMessage.value = 'Deleting report...';

    const result = await deleteReport(reportToDelete.value.id);

    if (result.success) {
      showToast('Report deleted successfully', 'success', 2000);

      // Update cached reports in store
      await usersStore.updateUserReports(userId);

      // Refresh local reports list from store
      reports.value = usersStore.getUserReports(userId);
    } else {
      showToast(result.error || 'Failed to delete report', 'error', 2000);
    }
  } catch (error) {
    console.error('Error deleting report:', error);
    showToast('Failed to delete report', 'error', 2000);
  } finally {
    isOperationLoading.value = false;
    closeDeleteModal();
  }
};
</script>

<style scoped>
.user-reports-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.back-button {
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.page-header p {
  color: #666;
  font-size: 1rem;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state p {
  margin-top: 16px;
  color: #666;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.report-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.report-card:hover {
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
  border-color: #667eea;
  transform: translateY(-2px);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.report-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-icon {
  font-size: 24px;
  color: #667eea;
}

.report-title h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
}

.report-date {
  font-size: 0.875rem;
  color: #999;
}

.report-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #666;
}

.detail-item ion-icon {
  font-size: 16px;
  color: #667eea;
}

.report-items-count {
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.report-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.report-actions ion-button {
  flex: 1;
  min-width: 120px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  color: #ccc;
  margin-bottom: 24px;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #666;
  margin-bottom: 24px;
}

.delete-modal-content {
  text-align: center;
  padding: 20px;
}

.warning-icon {
  font-size: 64px;
  color: #eb445a;
  margin-bottom: 16px;
}

.delete-modal-content h2 {
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  color: #333;
}

.delete-modal-content p {
  color: #666;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.report-detail-view {
  padding: 20px 0;
}

.section {
  margin-bottom: 32px;
}

.section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  font-size: 0.9375rem;
  color: #666;
}

.info-item strong {
  color: #333;
  display: block;
  margin-bottom: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.category-section {
  margin-bottom: 24px;
}

.category-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 12px;
}

.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gradient-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

@media (max-width: 768px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }

  .report-actions {
    flex-direction: column;
  }

  .report-actions ion-button {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
