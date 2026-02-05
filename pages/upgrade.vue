<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="upgrade-container">
        <!-- Back Button -->
        <button class="back-btn" @click="goBack">
          <ion-icon :icon="arrowBackOutline"></ion-icon>
          Back to Plans
        </button>

        <div class="upgrade-header">
          <h1>Upgrade to {{ planLabel }}</h1>
          <p>Complete your payment to unlock premium features</p>
        </div>

        <!-- Payment Amount -->
        <div class="payment-amount-card">
          <div class="amount-label">Amount to Pay</div>
          <div class="amount-value">₹{{ planPrice }}</div>
          <div class="amount-period">{{ plan === 'monthly' ? 'per month' : 'per year' }}</div>
        </div>

        <!-- Payment Methods Section -->
        <div class="payment-methods-section">
          <h2>Select Payment Method</h2>

          <!-- No Payment Methods -->
          <div v-if="allPaymentMethods.length === 0" class="no-methods">
            <ion-icon :icon="alertCircleOutline"></ion-icon>
            <p>Payment methods not configured. Please contact support.</p>
          </div>

          <!-- Payment Method Dropdown -->
          <div v-else class="method-selector">
            <label>Choose how you'll pay <span class="required">*</span></label>
            <select v-model="selectedMethodId" class="method-select">
              <option value="">-- Select a payment method --</option>
              <optgroup v-if="upiMethods.length > 0" label="UPI">
                <option v-for="upi in upiMethods" :key="upi.id" :value="'upi-' + upi.id">
                  {{ upi.name }} ({{ upi.upiId }})
                </option>
              </optgroup>
              <optgroup v-if="bankMethods.length > 0" label="Bank Transfer">
                <option v-for="bank in bankMethods" :key="bank.id" :value="'bank-' + bank.id">
                  {{ bank.bankName }}
                </option>
              </optgroup>
            </select>
          </div>

          <!-- Selected Method Details -->
          <div v-if="selectedMethod" class="selected-method-details">
            <!-- UPI Details -->
            <div v-if="selectedMethod.type === 'upi'" class="method-card">
              <div class="method-info">
                <span class="method-label">UPI ID</span>
                <span class="method-value">{{ selectedMethod.data.upiId }}</span>
              </div>
              <button class="copy-btn" @click="copyToClipboard(selectedMethod.data.upiId, 'UPI ID')">
                <ion-icon :icon="copyOutline"></ion-icon>
              </button>
            </div>

            <!-- Bank Details -->
            <div v-if="selectedMethod.type === 'bank'" class="method-card bank-card">
              <div class="method-info">
                <span class="method-label">{{ selectedMethod.data.bankName }}</span>
                <div class="bank-details">
                  <div class="bank-row">
                    <span><strong>A/C:</strong> {{ selectedMethod.data.accountNumber }}</span>
                    <button class="copy-btn-small" @click="copyToClipboard(selectedMethod.data.accountNumber, 'Account Number')">
                      <ion-icon :icon="copyOutline"></ion-icon>
                    </button>
                  </div>
                  <div class="bank-row">
                    <span><strong>IFSC:</strong> {{ selectedMethod.data.ifscCode }}</span>
                    <button class="copy-btn-small" @click="copyToClipboard(selectedMethod.data.ifscCode, 'IFSC Code')">
                      <ion-icon :icon="copyOutline"></ion-icon>
                    </button>
                  </div>
                  <p v-if="selectedMethod.data.accountHolder"><strong>Name:</strong> {{ selectedMethod.data.accountHolder }}</p>
                </div>
              </div>
            </div>

            <div class="payment-instruction">
              <ion-icon :icon="informationCircleOutline"></ion-icon>
              <p>Make payment using the details above, then enter your transaction ID below.</p>
            </div>
          </div>
        </div>

        <!-- Transaction ID Section -->
        <div class="transaction-section">
          <h2>Payment Verification</h2>
          <p class="section-hint">After making payment, enter your transaction ID/UPI reference number below.</p>

          <div class="transaction-id-input">
            <label>Transaction ID / UPI Reference Number <span class="required">*</span></label>
            <input
              v-model="transactionId"
              type="text"
              placeholder="Enter transaction/reference ID"
              required
            />
          </div>

          <div class="info-box">
            <ion-icon :icon="informationCircleOutline"></ion-icon>
            <p>Your transaction ID can be found in your payment app's transaction history or SMS confirmation.</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="uploadError" class="error-message">
          <ion-icon :icon="alertCircleOutline"></ion-icon>
          <span>{{ uploadError }}</span>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="success-message">
          <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
          <span>{{ successMessage }}</span>
        </div>

        <!-- Submit Button -->
        <button
          class="submit-btn"
          :disabled="!selectedMethodId || !transactionId.trim() || isSubmitting"
          @click="submitRequest"
        >
          <ion-spinner v-if="isSubmitting" name="crescent" color="light"></ion-spinner>
          <span v-else>Submit Request</span>
        </button>
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
} from '@ionic/vue';
import {
  arrowBackOutline,
  qrCodeOutline,
  cardOutline,
  copyOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  informationCircleOutline,
} from 'ionicons/icons';

const route = useRoute();
const router = useRouter();
const { showToast } = useToast();
const { submitPremiumRequest } = usePremiumRequests();
const appSettingsStore = useAppSettingsStore();

const plan = computed(() => (route.query.plan as string) || 'monthly');
const planLabel = computed(() => plan.value === 'monthly' ? 'Monthly' : 'Yearly');
const planPrice = computed(() => plan.value === 'monthly' ? appSettingsStore.monthlyPrice : appSettingsStore.yearlyPrice);

const upiMethods = computed(() => appSettingsStore.upiMethods);
const bankMethods = computed(() => appSettingsStore.bankMethods);

const allPaymentMethods = computed(() => [
  ...upiMethods.value.map(u => ({ type: 'upi', id: 'upi-' + u.id, data: u })),
  ...bankMethods.value.map(b => ({ type: 'bank', id: 'bank-' + b.id, data: b })),
]);

const selectedMethodId = ref('');
const selectedMethod = computed(() => {
  if (!selectedMethodId.value) return null;
  return allPaymentMethods.value.find(m => m.id === selectedMethodId.value) || null;
});

const transactionId = ref('');
const isSubmitting = ref(false);
const uploadError = ref('');
const successMessage = ref('');

const goBack = () => {
  router.push('/subscription');
};

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied!`, 'success', 1500);
  } catch {
    showToast('Failed to copy', 'error', 1500);
  }
};

const submitRequest = async () => {
  if (!selectedMethodId.value) {
    uploadError.value = 'Please select a payment method';
    return;
  }
  if (!transactionId.value.trim()) {
    uploadError.value = 'Please enter your transaction ID';
    return;
  }

  isSubmitting.value = true;
  uploadError.value = '';
  successMessage.value = '';

  try {
    const result = await submitPremiumRequest(
      plan.value as 'monthly' | 'yearly',
      transactionId.value
    );

    if (result.success) {
      successMessage.value = 'Request submitted successfully! We will verify your payment and notify you soon.';
      showToast('Request submitted successfully!', 'success', 3000);

      // Redirect after delay
      setTimeout(() => {
        router.push('/subscription');
      }, 2000);
    } else {
      uploadError.value = result.error || 'Failed to submit request';
    }
  } catch (error: any) {
    uploadError.value = error.message || 'An error occurred';
  }

  isSubmitting.value = false;
};

onMounted(async () => {
  await appSettingsStore.fetchSettings();

  // Validate plan parameter
  if (!['monthly', 'yearly'].includes(plan.value)) {
    router.push('/subscription');
  }
});
</script>

<style scoped>
.upgrade-container {
  max-width: 600px;
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

.upgrade-header {
  text-align: center;
  margin-bottom: 32px;
}

.upgrade-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.upgrade-header p {
  font-size: 15px;
  color: #666;
  margin: 0;
}

/* Payment Amount Card */
.payment-amount-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  color: white;
  margin-bottom: 32px;
}

.amount-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.amount-value {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 4px;
}

.amount-period {
  font-size: 14px;
  opacity: 0.8;
}

/* Payment Methods Section */
.payment-methods-section {
  margin-bottom: 32px;
}

.payment-methods-section h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

/* Method Selector Dropdown */
.method-selector {
  margin-bottom: 20px;
}

.method-selector label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.method-select {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  background: #f8f9fa;
  cursor: pointer;
  transition: border-color 0.3s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23667eea' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
}

.method-select:focus {
  outline: none;
  border-color: #667eea;
  background-color: white;
}

.method-select optgroup {
  font-weight: 600;
  color: #333;
}

.method-select option {
  padding: 10px;
}

/* Selected Method Details */
.selected-method-details {
  margin-top: 16px;
}

.method-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.method-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1a1a2e;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.method-info {
  flex: 1;
}

.method-name {
  display: block;
  font-size: 14px;
  color: #999;
  margin-bottom: 4px;
}

.method-value {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.bank-card .method-info {
  flex: 1;
}

.bank-details {
  margin-top: 8px;
}

.bank-details p {
  margin: 4px 0;
  font-size: 14px;
  color: #ccc;
}

.bank-details strong {
  color: #999;
}

.bank-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0;
}

.bank-row span {
  font-size: 14px;
  color: #ccc;
}

.copy-btn-small {
  background: rgba(102, 126, 234, 0.2);
  border: none;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn-small:hover {
  background: rgba(102, 126, 234, 0.4);
}

.copy-btn-small ion-icon {
  font-size: 14px;
  color: #667eea;
}

.payment-instruction {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  background: #e8f5e9;
  border-radius: 10px;
  margin-top: 16px;
}

.payment-instruction ion-icon {
  font-size: 20px;
  color: #2e7d32;
  flex-shrink: 0;
  margin-top: 2px;
}

.payment-instruction p {
  margin: 0;
  font-size: 13px;
  color: #1b5e20;
  line-height: 1.4;
}

.copy-btn {
  background: rgba(102, 126, 234, 0.2);
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: rgba(102, 126, 234, 0.4);
}

.copy-btn ion-icon {
  font-size: 20px;
  color: #667eea;
}

.no-methods {
  text-align: center;
  padding: 32px;
  background: #fff3cd;
  border-radius: 12px;
  color: #856404;
}

.no-methods ion-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.no-methods p {
  margin: 0;
  font-size: 15px;
}

/* Transaction Section */
.transaction-section {
  margin-bottom: 24px;
}

.transaction-section h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.section-hint {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
}

.info-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  background: #e3f2fd;
  border-radius: 10px;
  margin-top: 16px;
}

.info-box ion-icon {
  font-size: 20px;
  color: #1976d2;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-box p {
  margin: 0;
  font-size: 13px;
  color: #1565c0;
  line-height: 1.4;
}

.required {
  color: #f44336;
}

.transaction-id-input {
  margin-top: 20px;
}

.transaction-id-input label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.transaction-id-input input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  transition: border-color 0.3s;
  background: #f8f9fa;
}

.transaction-id-input input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

/* Messages */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 10px;
  color: #c62828;
  font-size: 14px;
  margin-bottom: 20px;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: #e8f5e9;
  border: 1px solid #4caf50;
  border-radius: 10px;
  color: #2e7d32;
  font-size: 14px;
  margin-bottom: 20px;
}

.error-message ion-icon,
.success-message ion-icon {
  font-size: 20px;
  flex-shrink: 0;
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


/* Mobile Responsive */
@media (max-width: 768px) {
  .upgrade-container {
    padding: 16px 0;
  }

  .upgrade-header h1 {
    font-size: 24px;
  }

  .amount-value {
    font-size: 40px;
  }
}
</style>
