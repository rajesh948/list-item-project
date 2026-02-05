<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="requests-container">
        <!-- Back Button -->
        <button class="back-btn" @click="goBack">
          <ion-icon :icon="arrowBackOutline"></ion-icon>
          Back to Subscription
        </button>

        <div class="page-header">
          <h1>My Subscription Requests</h1>
          <p>Track the status of your premium subscription requests</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading requests...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="requests.length === 0" class="empty-state">
          <ion-icon :icon="documentTextOutline"></ion-icon>
          <h3>No Requests Yet</h3>
          <p>You haven't submitted any subscription requests.</p>
          <ion-button @click="goToUpgrade">
            <ion-icon slot="start" :icon="diamondOutline"></ion-icon>
            Upgrade to Premium
          </ion-button>
        </div>

        <!-- Requests List -->
        <div v-else class="requests-list">
          <div
            v-for="request in requests"
            :key="request.id"
            class="request-card"
            :class="request.status"
          >
            <div class="request-header">
              <div class="plan-badge" :class="request.requestedPlan">
                <ion-icon :icon="diamondOutline"></ion-icon>
                {{ request.requestedPlan === 'monthly' ? 'Monthly' : 'Yearly' }} Plan
              </div>
              <div class="status-badge" :class="request.status">
                <ion-icon :icon="getStatusIcon(request.status)"></ion-icon>
                {{ request.status }}
              </div>
            </div>

            <div class="request-details">
              <div class="detail-row">
                <ion-icon :icon="calendarOutline"></ion-icon>
                <span><strong>Requested:</strong> {{ formatDate(request.createdAt) }}</span>
              </div>
              <div class="detail-row">
                <ion-icon :icon="receiptOutline"></ion-icon>
                <span><strong>Transaction ID:</strong> {{ request.transactionId }}</span>
              </div>
              <div v-if="request.reviewedAt" class="detail-row">
                <ion-icon :icon="checkmarkDoneOutline"></ion-icon>
                <span><strong>Reviewed:</strong> {{ formatDate(request.reviewedAt) }}</span>
              </div>
            </div>

            <!-- Status Messages -->
            <div v-if="request.status === 'pending'" class="status-message pending">
              <ion-icon :icon="timeOutline"></ion-icon>
              <p>Your request is being reviewed. We'll update the status once verified.</p>
            </div>

            <div v-else-if="request.status === 'approved'" class="status-message approved">
              <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
              <p>Your subscription has been activated! Enjoy premium features.</p>
            </div>

            <div v-else-if="request.status === 'rejected'" class="status-message rejected">
              <ion-icon :icon="closeCircleOutline"></ion-icon>
              <div>
                <p>Your request was not approved.</p>
                <p v-if="request.adminNotes" class="admin-notes">
                  <strong>Reason:</strong> {{ request.adminNotes }}
                </p>
                <ion-button size="small" fill="outline" @click="goToUpgrade">
                  Try Again
                </ion-button>
              </div>
            </div>
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
  IonSpinner,
  IonButton,
} from '@ionic/vue';
import {
  arrowBackOutline,
  documentTextOutline,
  diamondOutline,
  calendarOutline,
  receiptOutline,
  checkmarkDoneOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  hourglassOutline,
} from 'ionicons/icons';
import { Timestamp } from 'firebase/firestore';
import type { PremiumRequest } from '~/composables/usePremiumRequests';

const router = useRouter();
const { fetchUserRequests } = usePremiumRequests();

const requests = ref<PremiumRequest[]>([]);
const isLoading = ref(true);

const goBack = () => {
  router.push('/subscription');
};

const goToUpgrade = () => {
  router.push('/subscription');
};

const formatDate = (timestamp: Timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as any);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return hourglassOutline;
    case 'approved': return checkmarkCircleOutline;
    case 'rejected': return closeCircleOutline;
    default: return hourglassOutline;
  }
};

onMounted(async () => {
  try {
    requests.value = await fetchUserRequests();
  } catch (error) {
    console.error('Error loading requests:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.requests-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #667eea;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 20px;
}

.back-btn:hover {
  color: #764ba2;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 15px;
  color: #666;
  margin: 0;
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
  background: #f8f9fa;
  border-radius: 16px;
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

/* Requests List */
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
  border-left-color: #ff9800;
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
  align-items: center;
  margin-bottom: 20px;
}

.plan-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.plan-badge ion-icon {
  font-size: 16px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.pending {
  background: #fff3e0;
  color: #e65100;
}

.status-badge.approved {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.rejected {
  background: #ffebee;
  color: #c62828;
}

.status-badge ion-icon {
  font-size: 16px;
}

/* Request Details */
.request-details {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row ion-icon {
  font-size: 18px;
  color: #667eea;
  flex-shrink: 0;
}

/* Status Messages */
.status-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
}

.status-message.pending {
  background: #fff3e0;
}

.status-message.approved {
  background: #e8f5e9;
}

.status-message.rejected {
  background: #ffebee;
}

.status-message ion-icon {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}

.status-message.pending ion-icon {
  color: #e65100;
}

.status-message.approved ion-icon {
  color: #2e7d32;
}

.status-message.rejected ion-icon {
  color: #c62828;
}

.status-message p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.status-message.pending p {
  color: #e65100;
}

.status-message.approved p {
  color: #2e7d32;
}

.status-message.rejected p {
  color: #c62828;
}

.admin-notes {
  margin-top: 8px !important;
  padding-top: 8px;
  border-top: 1px solid rgba(198, 40, 40, 0.2);
}

.status-message ion-button {
  margin-top: 12px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .requests-container {
    padding: 16px 0;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .request-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .detail-row {
    flex-wrap: wrap;
  }
}
</style>
