<template>
  <div class="reports-page">
    <div class="page-header">
      <h1>Reports</h1>
      <p>View and manage your saved reports</p>
      <button class="refresh-btn" :disabled="isRefreshing" @click="handleRefresh">
        <ion-spinner v-if="isRefreshing" name="crescent"></ion-spinner>
        <ion-icon v-else :icon="refreshOutline"></ion-icon>
        <span v-if="!isRefreshing">Refresh</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <ion-spinner name="crescent"></ion-spinner>
      <p>Loading reports...</p>
    </div>

    <!-- Reports Grid -->
    <div v-else-if="reports.length > 0" class="reports-grid">
      <div v-for="report in reports" :key="report.id" class="report-card">
        <div class="report-header">
          <div class="report-title">
            <ion-icon :icon="documentTextOutline" class="report-icon"></ion-icon>
            <div>
              <div class="title-row">
                <h3>{{ getReportName(report) }}</h3>
              </div>
              <span class="report-date">{{ formatDate(report.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="report-details">
          <div class="detail-row">
            <div class="detail-item">
              <ion-icon :icon="calendarOutline"></ion-icon>
              <span>{{ report.reportData?.date || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <ion-icon :icon="peopleOutline"></ion-icon>
              <span>{{ report.reportData?.noOfPeople || 0 }} people</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <ion-icon :icon="callOutline"></ion-icon>
              <span>{{ report.reportData?.phone || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <ion-icon :icon="cashOutline"></ion-icon>
              <span>₹{{ report.reportData?.price || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="report-footer">
          <div class="items-badge">
            <ion-icon :icon="fastFoodOutline"></ion-icon>
            <span>{{ getTotalItems(report.selectedCategories) }} items</span>
          </div>
          <div class="report-actions">
            <button class="action-btn view" @click="viewReport(report)">
              <ion-icon :icon="eyeOutline"></ion-icon>
            </button>
            <button class="action-btn edit" @click="loadReport(report)">
              <ion-icon :icon="createOutline"></ion-icon>
            </button>
            <button class="action-btn delete" @click="confirmDelete(report)">
              <ion-icon :icon="trashOutline"></ion-icon>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <ion-icon :icon="documentTextOutline" class="empty-icon"></ion-icon>
      <h2>No Reports Yet</h2>
      <p>Create your first report to get started</p>
      <button class="create-btn" @click="navigateTo('/create-report')">
        <ion-icon :icon="addCircleOutline"></ion-icon>
        Create Report
      </button>
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
          <p>This action cannot be undone.</p>
          <div class="modal-actions">
            <button class="modal-btn secondary" @click="closeDeleteModal">Cancel</button>
            <button class="modal-btn danger" @click="handleDelete">Delete</button>
          </div>
        </div>
      </ion-content>
    </ion-modal>

    <!-- Loading Overlay -->
    <AppLoader :show="isOperationLoading" :message="operationMessage" />
  </div>
</template>

<script setup lang="ts">
import {
  IonIcon,
  IonSpinner,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
} from '@ionic/vue';
import {
  documentTextOutline,
  calendarOutline,
  peopleOutline,
  callOutline,
  cashOutline,
  fastFoodOutline,
  eyeOutline,
  createOutline,
  trashOutline,
  addCircleOutline,
  closeOutline,
  warningOutline,
  refreshOutline,
} from 'ionicons/icons';
import type { SavedReport } from '~/composables/useSavedReports';

const { deleteReport } = useSavedReports();
const { showToast } = useToast();
const userStore = useUserStore();
const savedReportsStore = useSavedReportsStore();

const reports = computed(() => savedReportsStore.allReports);
const isLoading = computed(() => savedReportsStore.isLoading);
const isRefreshing = ref(false);
const isOperationLoading = ref(false);
const operationMessage = ref('');
const showDeleteModal = ref(false);
const reportToDelete = ref<SavedReport | null>(null);

const loadReports = async () => {
  if (!userStore.user?.uid) return;
  await savedReportsStore.fetchReports(userStore.user.uid);
};

const handleRefresh = async () => {
  if (!userStore.user?.uid) return;
  try {
    isRefreshing.value = true;
    await savedReportsStore.refreshReports(userStore.user.uid);
    showToast('Reports refreshed', 'success', 2000);
  } catch {
    showToast('Failed to refresh', 'danger', 2000);
  } finally {
    isRefreshing.value = false;
  }
};

onMounted(() => {
  loadReports();
});

const getReportName = (report: SavedReport) => {
  return report.reportName || report.reportData?.name || 'Untitled Report';
};

const formatDate = (date: Date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getTotalItems = (categories: any[]) => {
  if (!categories) return 0;
  return categories.reduce((total, cat) => total + (cat.items?.length || 0), 0);
};

const viewReport = (report: SavedReport) => {
  navigateTo(`/preview-report?id=${report.id}`);
};

const loadReport = (report: SavedReport) => {
  // Navigate to create-report with edit mode
  navigateTo(`/create-report?edit=${report.id}`);
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
  if (!reportToDelete.value?.id || !userStore.user?.uid) return;

  try {
    isOperationLoading.value = true;
    operationMessage.value = 'Deleting...';

    const result = await deleteReport(reportToDelete.value.id);

    if (result.success) {
      showToast('Report deleted', 'success', 2000);
      await savedReportsStore.refreshReports(userStore.user.uid);
    } else {
      showToast(result.error || 'Failed to delete', 'danger', 2000);
    }
  } catch {
    showToast('Failed to delete', 'danger', 2000);
  } finally {
    isOperationLoading.value = false;
    closeDeleteModal();
  }
};
</script>

<style scoped>
.reports-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.page-header p {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 16px 0;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #e8e8e8;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn ion-icon {
  font-size: 18px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #888;
}

.loading-state p {
  margin-top: 12px;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.report-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  transition: all 0.2s;
}

.report-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.report-header {
  margin-bottom: 12px;
}

.report-title {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.report-icon {
  font-size: 28px;
  color: #667eea;
  flex-shrink: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.report-title h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
}

.report-date {
  font-size: 0.8rem;
  color: #888;
  margin-top: 2px;
}

.report-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-row {
  display: flex;
  gap: 16px;
}

.detail-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #555;
}

.detail-item ion-icon {
  font-size: 16px;
  color: #667eea;
  flex-shrink: 0;
}

.report-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.items-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 16px;
  font-size: 0.8rem;
  color: #667eea;
  font-weight: 500;
}

.items-badge ion-icon {
  font-size: 16px;
}

.report-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn ion-icon {
  font-size: 18px;
}

.action-btn.view {
  background: #e3f2fd;
  color: #1976D2;
}

.action-btn.view:hover {
  background: #bbdefb;
}

.action-btn.edit {
  background: #e8f5e9;
  color: #388E3C;
}

.action-btn.edit:hover {
  background: #c8e6c9;
}

.action-btn.delete {
  background: #ffebee;
  color: #d32f2f;
}

.action-btn.delete:hover {
  background: #ffcdd2;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #ddd;
  margin-bottom: 16px;
}

.empty-state h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #888;
  margin: 0 0 20px 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.create-btn ion-icon {
  font-size: 20px;
}

/* Modal */
.gradient-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

.delete-modal-content {
  text-align: center;
  padding: 20px;
}

.warning-icon {
  font-size: 56px;
  color: #d32f2f;
  margin-bottom: 12px;
}

.delete-modal-content h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.delete-modal-content p {
  color: #666;
  margin: 0 0 20px 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.modal-btn.secondary:hover {
  background: #e8e8e8;
}

.modal-btn.danger {
  background: #d32f2f;
  color: white;
}

.modal-btn.danger:hover {
  background: #c62828;
}

@media (max-width: 768px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }

  .detail-row {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
