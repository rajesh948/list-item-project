<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="subscription-container">
        <!-- Current Plan Status -->
        <div class="current-plan-section">
          <div class="plan-status" :class="isPremium ? 'premium' : 'free'">
            <div class="status-icon">
              <ion-icon :icon="isPremium ? starOutline : personOutline"></ion-icon>
            </div>
            <div class="status-info">
              <h3>{{ isPremium ? 'Premium Member' : 'Free Plan' }}</h3>
              <p v-if="isPremium && formatSubscriptionEndDate">
                Valid until {{ formatSubscriptionEndDate }}
              </p>
              <p v-else-if="!isPremium">
                {{ remainingPdfs >= 0 ? `${remainingPdfs} PDFs remaining this ${limitPeriod}` : 'Loading...' }}
              </p>
            </div>
          </div>

          <!-- Expiry Warning -->
          <div v-if="isExpiringSoon" class="expiry-warning">
            <ion-icon :icon="alertCircleOutline"></ion-icon>
            <span>Your subscription expires in {{ daysUntilExpiry }} days. Renew now!</span>
          </div>
        </div>

        <!-- Pending Request Status -->
        <div v-if="hasPendingRequest" class="pending-request-card" @click="goToMyRequests">
          <div class="pending-icon">
            <ion-icon :icon="timeOutline"></ion-icon>
          </div>
          <div class="pending-info">
            <h4>Request Pending</h4>
            <p>Your upgrade request is being reviewed. Tap to view details.</p>
          </div>
          <ion-icon :icon="chevronForwardOutline" class="chevron-icon"></ion-icon>
        </div>

        <!-- Plans Section -->
        <h2 class="section-title">Choose Your Plan</h2>

        <div class="plans-grid">
          <!-- Free Plan -->
          <div class="plan-card dark-card" :class="{ active: subscriptionPlan === 'free' && !isPremium }">
            <div class="plan-badge" v-if="subscriptionPlan === 'free' && !isPremium">Current</div>
            <div class="plan-header">
              <h3>Free</h3>
              <div class="plan-price">
                <span class="price">₹0</span>
                <span class="period">/forever</span>
              </div>
            </div>
            <ul class="plan-features">
              <li><ion-icon :icon="checkmarkOutline"></ion-icon> {{ pdfLimit }} PDFs per {{ limitPeriod }}</li>
              <li><ion-icon :icon="checkmarkOutline"></ion-icon> All menu categories</li>
              <li><ion-icon :icon="checkmarkOutline"></ion-icon> Basic report generation</li>
              <li class="disabled"><ion-icon :icon="closeOutline"></ion-icon> Unlimited PDFs</li>
              <li class="disabled"><ion-icon :icon="closeOutline"></ion-icon> Priority support</li>
            </ul>
            <div class="current-plan-label" v-if="subscriptionPlan === 'free' && !isPremium">
              Your Current Plan
            </div>
          </div>

          <!-- Monthly Plan -->
          <div
            class="plan-card dark-card"
            :class="{
              active: subscriptionPlan === 'monthly' && isPremium,
              popular: true
            }"
            @click="!isPremium && !hasPendingRequest && selectPlan('monthly')"
          >
            <div class="popular-badge" v-if="!isPremium">Popular</div>
            <div class="plan-badge" v-if="subscriptionPlan === 'monthly' && isPremium">Current</div>
            <div class="plan-header">
              <h3>Monthly</h3>
              <div class="plan-price">
                <span class="price">₹{{ monthlyPrice }}</span>
                <span class="period">/month</span>
              </div>
            </div>
            <ul class="plan-features">
              <li><ion-icon :icon="checkmarkOutline"></ion-icon> Unlimited PDFs</li>
              <li><ion-icon :icon="checkmarkOutline"></ion-icon> All menu categories</li>
              <li><ion-icon :icon="checkmarkOutline"></ion-icon> Advanced reports</li>
              <li><ion-icon :icon="checkmarkOutline"></ion-icon> Priority support</li>
              <li><ion-icon :icon="checkmarkOutline"></ion-icon> Cancel anytime</li>
            </ul>
            <button
              v-if="!isPremium && !hasPendingRequest"
              class="upgrade-btn"
              @click.stop="selectPlan('monthly')"
            >
              Upgrade Now
            </button>
          </div>

          <!-- Yearly Plan -->
          <div
            class="plan-card dark-card"
            :class="{ active: subscriptionPlan === 'yearly' && isPremium }"
            @click="!isPremium && !hasPendingRequest && selectPlan('yearly')"
          >
            <div class="savings-badge" v-if="!isPremium">Save {{ savingsPercent }}%</div>
            <div class="plan-badge" v-if="subscriptionPlan === 'yearly' && isPremium">Current</div>
            <div class="plan-header">
              <h3>Yearly</h3>
              <div class="plan-price">
                <span class="price">₹{{ yearlyPrice }}</span>
                <span class="period">/year</span>
              </div>
            </div>
            <ul class="plan-features">
              <li><ion-icon :icon="checkmarkOutline"></ion-icon> Unlimited PDFs</li>
              <li><ion-icon :icon="checkmarkOutline"></ion-icon> All menu categories</li>
              <li><ion-icon :icon="checkmarkOutline"></ion-icon> Advanced reports</li>
              <li><ion-icon :icon="checkmarkOutline"></ion-icon> Priority support</li>
              <li><ion-icon :icon="checkmarkOutline"></ion-icon> Best value</li>
            </ul>
            <button
              v-if="!isPremium && !hasPendingRequest"
              class="upgrade-btn"
              @click.stop="selectPlan('yearly')"
            >
              Upgrade Now
            </button>
          </div>
        </div>

        <!-- User's Past Requests -->
        <div v-if="userRequests.length > 0" class="requests-history">
          <div class="section-header">
            <h3 class="section-title">Your Requests</h3>
            <button class="view-all-btn" @click="goToMyRequests">
              View All
              <ion-icon :icon="chevronForwardOutline"></ion-icon>
            </button>
          </div>
          <div
            v-for="request in userRequests.slice(0, 3)"
            :key="request.id"
            class="request-item"
            :class="request.status"
            @click="goToMyRequests"
          >
            <div class="request-status-icon">
              <ion-icon
                :icon="request.status === 'approved' ? checkmarkCircleOutline :
                       request.status === 'rejected' ? closeCircleOutline : timeOutline"
              ></ion-icon>
            </div>
            <div class="request-details">
              <span class="request-plan">{{ request.requestedPlan }} plan</span>
              <span class="request-date">{{ formatDate(request.createdAt) }}</span>
            </div>
            <div class="request-status-badge" :class="request.status">
              {{ request.status }}
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
} from '@ionic/vue';
import {
  starOutline,
  personOutline,
  checkmarkOutline,
  closeOutline,
  alertCircleOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { Timestamp } from 'firebase/firestore';

const { isPremium, subscriptionPlan, formatSubscriptionEndDate, daysUntilExpiry, isExpiringSoon, getRemainingPdfs } = useSubscription();
const { fetchUserRequests, hasPendingRequest: checkPendingRequest } = usePremiumRequests();
const appSettingsStore = useAppSettingsStore();

const hasPendingRequest = ref(false);
const userRequests = ref<any[]>([]);
const remainingPdfs = ref(-1);

const pdfLimit = computed(() => appSettingsStore.pdfLimit);
const limitPeriod = computed(() => appSettingsStore.limitPeriod);
const monthlyPrice = computed(() => appSettingsStore.monthlyPrice);
const yearlyPrice = computed(() => appSettingsStore.yearlyPrice);

const savingsPercent = computed(() => {
  const monthlyTotal = monthlyPrice.value * 12;
  const savings = ((monthlyTotal - yearlyPrice.value) / monthlyTotal) * 100;
  return Math.round(savings);
});

const selectPlan = (plan: 'monthly' | 'yearly') => {
  navigateTo(`/upgrade?plan=${plan}`);
};

const goToMyRequests = () => {
  navigateTo('/my-requests');
};

const formatDate = (timestamp: Timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

onMounted(async () => {
  await appSettingsStore.fetchSettings();
  hasPendingRequest.value = await checkPendingRequest();
  userRequests.value = await fetchUserRequests();

  if (!isPremium.value) {
    remainingPdfs.value = await getRemainingPdfs();
  }
});
</script>

<style scoped>
.subscription-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 0;
}

/* Current Plan Section */
.current-plan-section {
  margin-bottom: 40px;
}

.plan-status {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}

.plan-status.premium {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.status-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.plan-status.free .status-icon {
  background: rgba(102, 126, 234, 0.1);
}

.status-icon ion-icon {
  font-size: 28px;
}

.plan-status.free .status-icon ion-icon {
  color: #667eea;
}

.status-info h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
}

.status-info p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.expiry-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-size: 14px;
}

/* Pending Request Card */
.pending-request-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 12px;
  margin-bottom: 32px;
}

.pending-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #2196f3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pending-icon ion-icon {
  font-size: 24px;
  color: white;
}

.pending-info h4 {
  margin: 0 0 4px 0;
  color: #1565c0;
  font-size: 16px;
}

.pending-info p {
  margin: 0;
  color: #1976d2;
  font-size: 14px;
}

.pending-request-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.pending-request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
}

.chevron-icon {
  font-size: 24px;
  color: #2196f3;
}

/* Section Title */
.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 24px 0;
  padding-top: 8px;
}

/* Plans Grid */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.plan-card {
  position: relative;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.plan-card.dark-card {
  background: #1a1a2e;
  border: 2px solid #2a2a4a;
}

.plan-card.dark-card .plan-header h3 {
  color: #ffffff;
}

.plan-card.dark-card .plan-price .price {
  color: #667eea;
}

.plan-card.dark-card .plan-price .period {
  color: #999;
}

.plan-card.dark-card .plan-features li {
  color: #e0e0e0;
}

.plan-card.dark-card .plan-features li.disabled {
  color: #666;
}

.plan-card.dark-card .plan-features li.disabled ion-icon {
  color: #666;
}

.plan-card:hover {
  border-color: #667eea;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
}

.plan-card.dark-card:hover {
  border-color: #667eea;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.25);
  transform: translateY(-4px);
}

.plan-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.plan-card.dark-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #1a1a3e 0%, #2a1a4e 100%);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.plan-card.popular {
  border-color: #667eea;
}

.current-plan-label {
  text-align: center;
  padding: 12px;
  margin-top: 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  color: #667eea;
  font-weight: 600;
  font-size: 14px;
}

.plan-badge,
.popular-badge,
.savings-badge {
  position: absolute;
  top: -12px;
  right: 16px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 1;
}

.plan-badge {
  background: #667eea;
  color: white;
}

.popular-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.savings-badge {
  background: #4caf50;
  color: white;
}

.plan-header {
  text-align: center;
  margin-bottom: 20px;
}

.plan-header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.plan-price .price {
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
}

.plan-price .period {
  font-size: 14px;
  color: #666;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 14px;
  color: #333;
}

.plan-features li.disabled {
  color: #999;
}

.plan-features li ion-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.plan-features li:not(.disabled) ion-icon {
  color: #4caf50;
}

.plan-features li.disabled ion-icon {
  color: #ccc;
}

.upgrade-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upgrade-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Requests History */
.requests-history {
  margin-top: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header .section-title {
  margin: 0;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.view-all-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

.view-all-btn ion-icon {
  font-size: 16px;
}

.request-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.request-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.request-status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.request-item.pending .request-status-icon {
  background: #e3f2fd;
  color: #2196f3;
}

.request-item.approved .request-status-icon {
  background: #e8f5e9;
  color: #4caf50;
}

.request-item.rejected .request-status-icon {
  background: #ffebee;
  color: #f44336;
}

.request-status-icon ion-icon {
  font-size: 20px;
}

.request-details {
  flex: 1;
}

.request-plan {
  display: block;
  font-weight: 600;
  color: #333;
  text-transform: capitalize;
}

.request-date {
  font-size: 13px;
  color: #666;
}

.request-status-badge {
  padding: 4px 12px;
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }

  .plan-status {
    flex-direction: column;
    text-align: center;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .request-item {
    background: #1a1a1a;
    border-color: #333;
  }

  .request-plan {
    color: #fff;
  }
}
</style>
