<template>
  <div class="requests-page">
    <div class="requests-container">
        <div class="requests-header">
          <h2>Premium Requests</h2>
          <ion-button fill="outline" color="medium" @click="handleRefresh" :disabled="isRefreshing">
            <ion-spinner v-if="isRefreshing" name="crescent"></ion-spinner>
            <ion-icon v-else slot="start" :icon="refreshOutline"></ion-icon>
            <span v-if="!isRefreshing">Refresh</span>
          </ion-button>
        </div>

        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="filter-tab"
            :class="{ active: currentFilter === filter.value }"
            @click="setFilter(filter.value)"
          >
            {{ filter.label }}
            <span v-if="filter.count > 0" class="tab-badge">{{ filter.count }}</span>
          </button>
        </div>

        <div v-if="isLoading" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading requests...</p>
        </div>

        <div v-else-if="filteredRequests.length === 0" class="empty-state">
          <ion-icon :icon="documentTextOutline"></ion-icon>
          <p>No {{ currentFilter === 'all' ? '' : currentFilter }} requests found</p>
        </div>

        <div v-else class="requests-list">
          <div
            v-for="request in filteredRequests"
            :key="request.id"
            class="request-card"
            :class="request.status"
          >
            <div class="request-header">
              <div class="user-info">
                <div class="user-avatar">
                  <ion-icon :icon="personOutline"></ion-icon>
                </div>
                <div class="user-details">
                  <h4>{{ request.userName || 'Unknown User' }}</h4>
                  <p>{{ request.userEmail }}</p>
                </div>
              </div>
              <div class="request-status-badge" :class="request.status">
                {{ request.status }}
              </div>
            </div>

            <div class="request-details">
              <div class="detail-item">
                <ion-icon :icon="pricetagOutline"></ion-icon>
                <span><strong>Plan:</strong> {{ request.requestedPlan }}</span>
              </div>
              <div class="detail-item">
                <ion-icon :icon="calendarOutline"></ion-icon>
                <span><strong>Requested:</strong> {{ formatDate(request.createdAt) }}</span>
              </div>
              <div v-if="request.transactionId" class="detail-item">
                <ion-icon :icon="receiptOutline"></ion-icon>
                <span><strong>Transaction ID:</strong> {{ request.transactionId }}</span>
              </div>
              <div v-if="request.reviewedAt" class="detail-item">
                <ion-icon :icon="checkmarkDoneOutline"></ion-icon>
                <span><strong>Reviewed:</strong> {{ formatDate(request.reviewedAt) }}</span>
              </div>
              <div v-if="request.adminNotes" class="detail-item notes">
                <ion-icon :icon="chatbubbleOutline"></ion-icon>
                <span><strong>Notes:</strong> {{ request.adminNotes }}</span>
              </div>
            </div>

            <div v-if="request.status === 'pending'" class="request-actions">
              <ion-button
                fill="outline"
                color="danger"
                @click="openRejectModal(request)"
              >
                <ion-icon slot="start" :icon="closeOutline"></ion-icon>
                Reject
              </ion-button>
              <ion-button
                color="success"
                @click="handleApprove(request)"
                :disabled="isProcessing === request.id"
              >
                <ion-spinner v-if="isProcessing === request.id" name="crescent" color="light"></ion-spinner>
                <template v-else>
                  <ion-icon slot="start" :icon="checkmarkOutline"></ion-icon>
                  Approve
                </template>
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reject Modal -->
      <ion-modal :is-open="showRejectModal" @didDismiss="closeRejectModal">
        <ion-header>
          <ion-toolbar color="danger">
            <ion-title>Reject Request</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeRejectModal">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="reject-modal-content">
            <p class="reject-info">
              You are about to reject the request from <strong>{{ requestToReject?.userName }}</strong> for the <strong>{{ requestToReject?.requestedPlan }}</strong> plan.
            </p>

            <div class="input-group">
              <label class="input-label">Rejection Notes (Optional)</label>
              <textarea
                v-model="rejectNotes"
                class="reject-textarea"
                placeholder="Enter reason for rejection..."
                rows="4"
              ></textarea>
            </div>

            <div class="reject-actions">
              <ion-button fill="outline" @click="closeRejectModal">Cancel</ion-button>
              <ion-button
                color="danger"
                @click="handleReject"
                :disabled="isRejecting"
              >
                <ion-spinner v-if="isRejecting" name="crescent" color="light"></ion-spinner>
                <span v-else>Confirm Reject</span>
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>
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
} from '@ionic/vue';
import {
  refreshOutline,
  documentTextOutline,
  personOutline,
  pricetagOutline,
  calendarOutline,
  receiptOutline,
  checkmarkDoneOutline,
  chatbubbleOutline,
  closeOutline,
  checkmarkOutline,
} from 'ionicons/icons';
import { Timestamp } from 'firebase/firestore';
import type { PremiumRequest } from '~/composables/usePremiumRequests';

definePageMeta({
  middleware: 'admin',
});

const { approveRequest, rejectRequest } = usePremiumRequests();
const premiumRequestsStore = usePremiumRequestsStore();
const { showToast } = useToast();

const isLoading = ref(true);
const isRefreshing = ref(false);
const isProcessing = ref<string | null>(null);
const isRejecting = ref(false);
const currentFilter = ref<'pending' | 'approved' | 'rejected' | 'all'>('pending');

const showRejectModal = ref(false);
const requestToReject = ref<PremiumRequest | null>(null);
const rejectNotes = ref('');

const filteredRequests = computed(() => premiumRequestsStore.filteredRequests);

const filters = computed(() => [
  { label: 'Pending', value: 'pending' as const, count: premiumRequestsStore.pendingRequests.length },
  { label: 'Approved', value: 'approved' as const, count: premiumRequestsStore.approvedRequests.length },
  { label: 'Rejected', value: 'rejected' as const, count: premiumRequestsStore.rejectedRequests.length },
  { label: 'All', value: 'all' as const, count: premiumRequestsStore.requests.length },
]);

const loadRequests = async () => {
  isLoading.value = true;
  await premiumRequestsStore.fetchRequests(currentFilter.value);
  isLoading.value = false;
};

const handleRefresh = async () => {
  isRefreshing.value = true;
  await premiumRequestsStore.refreshRequests();
  isRefreshing.value = false;
  showToast('Requests refreshed', 'success', 2000);
};

const setFilter = (filter: 'pending' | 'approved' | 'rejected' | 'all') => {
  currentFilter.value = filter;
  premiumRequestsStore.setFilter(filter);
};

const formatDate = (timestamp: Timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const handleApprove = async (request: PremiumRequest) => {
  if (!request.id) return;

  isProcessing.value = request.id;

  const result = await approveRequest(request.id, request.userId, request.requestedPlan);

  if (result.success) {
    showToast('Request approved! User subscription has been activated.', 'success', 3000);
    premiumRequestsStore.updateRequestStatus(request.id, 'approved');
    await premiumRequestsStore.refreshRequests();
  } else {
    showToast(result.error || 'Failed to approve request', 'error', 3000);
  }

  isProcessing.value = null;
};

const openRejectModal = (request: PremiumRequest) => {
  requestToReject.value = request;
  rejectNotes.value = '';
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  requestToReject.value = null;
  rejectNotes.value = '';
};

const handleReject = async () => {
  if (!requestToReject.value?.id) return;

  isRejecting.value = true;

  const result = await rejectRequest(requestToReject.value.id, rejectNotes.value);

  if (result.success) {
    showToast('Request rejected', 'success', 3000);
    premiumRequestsStore.updateRequestStatus(requestToReject.value.id, 'rejected');
    closeRejectModal();
    await premiumRequestsStore.refreshRequests();
  } else {
    showToast(result.error || 'Failed to reject request', 'error', 3000);
  }

  isRejecting.value = false;
};

onMounted(() => {
  loadRequests();
});
</script>

<style scoped>
.requests-page {
  max-width: 1200px;
  margin: 0 auto;
}

.requests-container {
  max-width: 1000px;
  margin: 0 auto;
}

.requests-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.requests-header h2 {
  font-size: 28px;
  margin: 0;
  color: #333;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-tab:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.tab-badge {
  background: rgba(0, 0, 0, 0.15);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.filter-tab.active .tab-badge {
  background: rgba(255, 255, 255, 0.3);
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-container p {
  margin-top: 16px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state ion-icon {
  font-size: 64px;
  color: #ccc;
}

.empty-state p {
  font-size: 18px;
  color: #666;
  margin: 16px 0;
}

/* Request List */
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.request-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #2196f3;
}

.request-card.pending {
  border-left-color: #2196f3;
}

.request-card.approved {
  border-left-color: #4caf50;
}

.request-card.rejected {
  border-left-color: #f44336;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar ion-icon {
  font-size: 24px;
  color: white;
}

.user-details h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.user-details p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.request-status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.request-status-badge.pending {
  background: #e3f2fd;
  color: #1565c0;
}

.request-status-badge.approved {
  background: #e8f5e9;
  color: #2e7d32;
}

.request-status-badge.rejected {
  background: #ffebee;
  color: #c62828;
}

.request-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
}

.detail-item.notes {
  grid-column: 1 / -1;
}

.detail-item ion-icon {
  font-size: 18px;
  color: #667eea;
  flex-shrink: 0;
}

.request-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

/* Reject Modal */
.reject-modal-content {
  max-width: 500px;
  margin: 0 auto;
}

.reject-info {
  font-size: 15px;
  color: #555;
  margin-bottom: 20px;
  line-height: 1.6;
}

.input-group {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reject-textarea {
  width: 100%;
  padding: 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;
}

.reject-textarea:focus {
  outline: none;
  border-color: #f44336;
}

.reject-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .requests-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .requests-header ion-button {
    width: 100%;
  }

  .request-header {
    flex-direction: column;
    gap: 12px;
  }

  .request-status-badge {
    align-self: flex-start;
  }

  .request-details {
    grid-template-columns: 1fr;
  }

  .request-actions {
    flex-direction: column;
  }

  .request-actions ion-button {
    width: 100%;
  }

  .reject-actions {
    flex-direction: column;
  }

  .reject-actions ion-button {
    width: 100%;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .filter-tab {
    background: #2a2a2a;
    border-color: #444;
    color: #ccc;
  }

  .filter-tab:hover {
    color: #667eea;
  }

  .request-card {
    background: #1a1a1a;
  }

  .user-details h4 {
    color: #fff;
  }

  .request-details {
    background: #2a2a2a;
  }

  .detail-item {
    color: #ccc;
  }

  .reject-info {
    color: #ccc;
  }

  .reject-textarea {
    background: #2a2a2a;
    border-color: #444;
    color: #fff;
  }
}
</style>
