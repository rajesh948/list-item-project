<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="saved-reports-container">
        <div class="page-header">
          <h1>Saved Reports</h1>
          <p>View and manage your saved reports</p>

          <!-- Refresh Button -->
          <div class="header-actions">
            <ion-button fill="outline" color="medium" @click="handleRefresh" :disabled="isRefreshing">
              <ion-spinner v-if="isRefreshing" name="crescent"></ion-spinner>
              <ion-icon v-else slot="start" :icon="refreshOutline"></ion-icon>
              <span v-if="!isRefreshing">Refresh</span>
            </ion-button>
          </div>
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
            </div>

            <div class="report-items-count">
              <ion-chip color="primary">
                <ion-icon :icon="fastFoodOutline"></ion-icon>
                <ion-label>{{ getTotalItems(report.selectedCategories) }} items</ion-label>
              </ion-chip>
            </div>

            <div class="report-actions">
              <ion-button size="small" fill="outline" color="primary" @click="viewReport(report)">
                <ion-icon slot="start" :icon="eyeOutline"></ion-icon>
                View
              </ion-button>
              <ion-button size="small" fill="outline" color="secondary" @click="loadReport(report)">
                <ion-icon slot="start" :icon="openOutline"></ion-icon>
                Load
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
          <ion-icon :icon="bookmarkOutline" class="empty-icon"></ion-icon>
          <h2>No Saved Reports</h2>
          <p>You haven't saved any reports yet</p>
          <ion-button @click="navigateTo('/item-report')">
            <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>
            Create Report
          </ion-button>
        </div>
      </div>

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
  downloadOutline,
  trashOutline,
  bookmarkOutline,
  addCircleOutline,
  closeOutline,
  warningOutline,
  openOutline,
  refreshOutline,
} from 'ionicons/icons';
import type { SavedReport } from '~/composables/useSavedReports';

// Authentication is handled by global middleware (02-redirect-login.global.ts)

const { deleteReport } = useSavedReports();
const { showToast } = useToast();
const userStore = useUserStore();
const reportStore = useReportStore();
const savedReportsStore = useSavedReportsStore();

const reports = computed(() => savedReportsStore.allReports);
const isLoading = computed(() => savedReportsStore.isLoading);
const isRefreshing = ref(false);
const isOperationLoading = ref(false);
const operationMessage = ref('');
const showDeleteModal = ref(false);
const reportToDelete = ref<SavedReport | null>(null);

const loadReports = async () => {
  try {
    if (!userStore.user) {
      return;
    }

    await savedReportsStore.fetchReports(userStore.user.uid);
  } catch (error) {
    showToast('Failed to load reports', 'error', 2000);
  }
};

const handleRefresh = async () => {
  if (!userStore.user) return;

  try {
    isRefreshing.value = true;
    await savedReportsStore.refreshReports(userStore.user.uid);
    showToast('Reports refreshed successfully', 'success', 2000);
  } catch (error) {
    showToast('Failed to refresh reports', 'error', 2000);
  } finally {
    isRefreshing.value = false;
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
  // Store in view mode (temporary, won't affect current working report)
  reportStore.setViewModeData(
    report.selectedCategories,
    report.selectedTable || null,
    report.reportData as any
  );
  navigateTo('/item-report?mode=view');
};

const loadReport = (report: SavedReport) => {
  // Load into working report for editing
  reportStore.loadReportData(
    report.selectedCategories,
    report.selectedTable || null,
    report.reportData as any
  );
  navigateTo('/item-report');
  showToast('Report loaded successfully!', 'success', 2000);
};

const generatePDF = async (report: SavedReport) => {
  // Store in view mode for PDF generation
  reportStore.setViewModeData(
    report.selectedCategories,
    report.selectedTable || null,
    report.reportData as any
  );
  navigateTo('/item-report?mode=view');
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
  if (!reportToDelete.value?.id || !userStore.user) return;

  try {
    isOperationLoading.value = true;
    operationMessage.value = 'Deleting report...';

    const result = await deleteReport(reportToDelete.value.id);

    if (result.success) {
      showToast('Report deleted successfully', 'success', 2000);

      // Refresh the store to update the cached reports
      await savedReportsStore.refreshReports(userStore.user.uid);
    } else {
      showToast(result.error || 'Failed to delete report', 'error', 2000);
    }
  } catch (error) {
    showToast('Failed to delete report', 'error', 2000);
  } finally {
    isOperationLoading.value = false;
    closeDeleteModal();
  }
};
</script>

<style scoped>
.saved-reports-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
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
  margin-bottom: 16px;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
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
}

.report-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.report-actions ion-button {
  flex: 1;
  min-width: 90px;
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

.gradient-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

@media (max-width: 768px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }

  .report-actions ion-button {
    font-size: 0.75rem;
    min-width: auto;
    flex: 1;
  }

  .report-actions ion-button span {
    display: none;
  }
}
</style>
