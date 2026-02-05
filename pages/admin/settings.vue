<template>
  <div class="settings-page">
    <div class="settings-container">
        <div class="settings-header">
          <h2>App Settings</h2>
          <ion-button fill="outline" color="medium" @click="handleRefresh" :disabled="isRefreshing">
            <ion-spinner v-if="isRefreshing" name="crescent"></ion-spinner>
            <ion-icon v-else slot="start" :icon="refreshOutline"></ion-icon>
            <span v-if="!isRefreshing">Refresh</span>
          </ion-button>
        </div>

        <div v-if="isLoading" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Loading settings...</p>
        </div>

        <div v-else class="settings-content">
          <!-- Watermark Settings Section -->
          <div class="settings-card">
            <div class="card-header">
              <ion-icon :icon="waterOutline" class="card-icon"></ion-icon>
              <h3>PDF Watermark</h3>
            </div>
            <p class="card-description">
              Set the watermark text that appears on PDFs for free users.
            </p>

            <div class="settings-form">
              <div class="input-group">
                <label class="input-label">Watermark Text</label>
                <div class="input-wrapper">
                  <ion-icon :icon="textOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="watermarkText"
                    type="text"
                    class="custom-input"
                    placeholder="Enter watermark text"
                    maxlength="30"
                    required
                  />
                </div>
              </div>

              <div class="preview-box">
                <ion-icon :icon="eyeOutline"></ion-icon>
                <span>Watermark preview: <strong style="opacity: 0.4; letter-spacing: 2px;">{{ watermarkText || 'CaterHub' }}</strong></span>
              </div>
            </div>
          </div>

          <!-- PDF Limits Section -->
          <div class="settings-card">
            <div class="card-header">
              <ion-icon :icon="documentOutline" class="card-icon"></ion-icon>
              <h3>PDF Limits (Free Users)</h3>
            </div>
            <p class="card-description">
              Set the maximum number of PDFs free users can generate within a time period.
            </p>

            <div class="settings-form">
              <div class="input-row">
                <div class="input-group">
                  <label class="input-label">PDF Limit</label>
                  <div class="input-wrapper">
                    <ion-icon :icon="documentTextOutline" class="input-icon"></ion-icon>
                    <input
                      v-model.number="pdfLimitCount"
                      type="number"
                      class="custom-input"
                      placeholder="Enter PDF limit"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div class="input-group">
                  <label class="input-label">Per Period</label>
                  <div class="input-wrapper">
                    <ion-icon :icon="timeOutline" class="input-icon"></ion-icon>
                    <select v-model="pdfLimitPeriod" class="custom-select">
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="year">Year</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="preview-box">
                <ion-icon :icon="informationCircleOutline"></ion-icon>
                <span>Free users can generate up to <strong>{{ pdfLimitCount }} PDFs per {{ pdfLimitPeriod }}</strong></span>
              </div>
            </div>
          </div>

          <!-- Pricing Section -->
          <div class="settings-card">
            <div class="card-header">
              <ion-icon :icon="pricetagOutline" class="card-icon"></ion-icon>
              <h3>Subscription Pricing</h3>
            </div>
            <p class="card-description">
              Set the pricing for premium subscription plans (in INR).
            </p>

            <div class="settings-form">
              <div class="input-row">
                <div class="input-group">
                  <label class="input-label">Monthly Price (INR)</label>
                  <div class="input-wrapper">
                    <span class="currency-symbol">₹</span>
                    <input
                      v-model.number="monthlyPrice"
                      type="number"
                      class="custom-input"
                      placeholder="Monthly price"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div class="input-group">
                  <label class="input-label">Yearly Price (INR)</label>
                  <div class="input-wrapper">
                    <span class="currency-symbol">₹</span>
                    <input
                      v-model.number="yearlyPrice"
                      type="number"
                      class="custom-input"
                      placeholder="Yearly price"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div class="preview-box" v-if="savingsPercent > 0">
                <ion-icon :icon="trendingDownOutline"></ion-icon>
                <span>Yearly plan saves <strong>{{ savingsPercent }}%</strong> compared to monthly (₹{{ monthlySavings }} savings)</span>
              </div>
            </div>
          </div>

          <!-- Payment Methods Section -->
          <div class="settings-card">
            <div class="card-header">
              <ion-icon :icon="walletOutline" class="card-icon"></ion-icon>
              <h3>Payment Methods</h3>
            </div>
            <p class="card-description">
              Add payment methods that users can use to pay for subscriptions.
            </p>

            <!-- UPI Methods -->
            <div class="payment-section">
              <div class="payment-section-header">
                <h4><ion-icon :icon="qrCodeOutline"></ion-icon> UPI</h4>
                <button class="add-btn" @click="addUpiMethod">
                  <ion-icon :icon="addCircleOutline"></ion-icon>
                  Add UPI
                </button>
              </div>

              <div v-if="upiMethods.length === 0" class="empty-methods">
                <p>No UPI methods added yet</p>
              </div>

              <div v-for="(upi, index) in upiMethods" :key="upi.id" class="method-item-card">
                <div class="method-inputs">
                  <div class="input-group small">
                    <label class="input-label">Name/Label</label>
                    <input
                      v-model="upi.name"
                      type="text"
                      class="custom-input small"
                      placeholder="e.g., Business UPI"
                    />
                  </div>
                  <div class="input-group small">
                    <label class="input-label">UPI ID</label>
                    <input
                      v-model="upi.upiId"
                      type="text"
                      class="custom-input small"
                      placeholder="e.g., business@upi"
                    />
                  </div>
                </div>
                <button class="delete-btn" @click="removeUpiMethod(index)">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </button>
              </div>
            </div>

            <!-- Bank Methods -->
            <div class="payment-section">
              <div class="payment-section-header">
                <h4><ion-icon :icon="cardOutline"></ion-icon> Bank Accounts</h4>
                <button class="add-btn" @click="addBankMethod">
                  <ion-icon :icon="addCircleOutline"></ion-icon>
                  Add Bank
                </button>
              </div>

              <div v-if="bankMethods.length === 0" class="empty-methods">
                <p>No bank accounts added yet</p>
              </div>

              <div v-for="(bank, index) in bankMethods" :key="bank.id" class="method-item-card">
                <div class="method-inputs bank-inputs">
                  <div class="input-group small">
                    <label class="input-label">Bank Name</label>
                    <input
                      v-model="bank.bankName"
                      type="text"
                      class="custom-input small"
                      placeholder="e.g., HDFC Bank"
                    />
                  </div>
                  <div class="input-group small">
                    <label class="input-label">Account Number</label>
                    <input
                      v-model="bank.accountNumber"
                      type="text"
                      class="custom-input small"
                      placeholder="Account number"
                    />
                  </div>
                  <div class="input-group small">
                    <label class="input-label">IFSC Code</label>
                    <input
                      v-model="bank.ifscCode"
                      type="text"
                      class="custom-input small"
                      placeholder="IFSC code"
                    />
                  </div>
                  <div class="input-group small">
                    <label class="input-label">Account Holder</label>
                    <input
                      v-model="bank.accountHolder"
                      type="text"
                      class="custom-input small"
                      placeholder="Account holder name"
                    />
                  </div>
                </div>
                <button class="delete-btn" @click="removeBankMethod(index)">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Appearance Section -->
          <div class="settings-card">
            <div class="card-header">
              <ion-icon :icon="contrastOutline" class="card-icon"></ion-icon>
              <h3>Appearance</h3>
            </div>
            <p class="card-description">
              Choose your preferred color scheme for the admin panel.
            </p>

            <div class="appearance-setting">
              <div class="appearance-info">
                <span class="appearance-label">Theme</span>
                <span class="appearance-description">Select light, dark, or system default theme</span>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <!-- Last Updated Info -->
          <div v-if="lastUpdatedInfo" class="last-updated">
            <ion-icon :icon="timeOutline"></ion-icon>
            <span>Last updated: {{ lastUpdatedInfo }}</span>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            <ion-icon :icon="alertCircleOutline"></ion-icon>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="success-message">
            <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
            <span>{{ successMessage }}</span>
          </div>

          <!-- Save Button -->
          <ion-button
            expand="block"
            class="save-button"
            @click="saveSettings"
            :disabled="isSaving || !hasChanges"
          >
            <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
            <ion-icon v-else slot="start" :icon="saveOutline"></ion-icon>
            <span v-if="!isSaving">Save Settings</span>
          </ion-button>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonIcon,
  IonSpinner,
} from '@ionic/vue';
import {
  refreshOutline,
  documentOutline,
  documentTextOutline,
  timeOutline,
  pricetagOutline,
  informationCircleOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  saveOutline,
  trendingDownOutline,
  walletOutline,
  qrCodeOutline,
  cardOutline,
  addCircleOutline,
  trashOutline,
  waterOutline,
  textOutline,
  eyeOutline,
  contrastOutline,
} from 'ionicons/icons';
import type { UpiMethod, BankMethod } from '~/stores/appSettings';

definePageMeta({
  middleware: 'admin',
});

const appSettingsStore = useAppSettingsStore();
const userStore = useUserStore();

const isLoading = ref(true);
const isRefreshing = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Form values
const pdfLimitCount = ref(5);
const pdfLimitPeriod = ref<'day' | 'week' | 'month' | 'year'>('month');
const monthlyPrice = ref(99);
const yearlyPrice = ref(999);
const upiMethods = ref<UpiMethod[]>([]);
const bankMethods = ref<BankMethod[]>([]);
const watermarkText = ref('CaterHub');

// Original values to track changes
const originalValues = ref({
  pdfLimitCount: 5,
  pdfLimitPeriod: 'month',
  monthlyPrice: 99,
  yearlyPrice: 999,
  upiMethods: '[]',
  bankMethods: '[]',
  watermarkText: 'CaterHub',
});

const hasChanges = computed(() => {
  return pdfLimitCount.value !== originalValues.value.pdfLimitCount ||
         pdfLimitPeriod.value !== originalValues.value.pdfLimitPeriod ||
         monthlyPrice.value !== originalValues.value.monthlyPrice ||
         yearlyPrice.value !== originalValues.value.yearlyPrice ||
         JSON.stringify(upiMethods.value) !== originalValues.value.upiMethods ||
         JSON.stringify(bankMethods.value) !== originalValues.value.bankMethods ||
         watermarkText.value !== originalValues.value.watermarkText;
});

// Payment methods functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const addUpiMethod = () => {
  upiMethods.value.push({
    id: generateId(),
    name: '',
    upiId: '',
  });
};

const removeUpiMethod = (index: number) => {
  upiMethods.value.splice(index, 1);
};

const addBankMethod = () => {
  bankMethods.value.push({
    id: generateId(),
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolder: '',
  });
};

const removeBankMethod = (index: number) => {
  bankMethods.value.splice(index, 1);
};

const savingsPercent = computed(() => {
  if (monthlyPrice.value <= 0) return 0;
  const monthlyTotal = monthlyPrice.value * 12;
  const savings = ((monthlyTotal - yearlyPrice.value) / monthlyTotal) * 100;
  return Math.round(Math.max(0, savings));
});

const monthlySavings = computed(() => {
  const monthlyTotal = monthlyPrice.value * 12;
  return Math.max(0, monthlyTotal - yearlyPrice.value);
});

const lastUpdatedInfo = computed(() => {
  const settings = appSettingsStore.settings;
  if (!settings.updatedAt) return null;

  const date = settings.updatedAt.toDate ? settings.updatedAt.toDate() : new Date(settings.updatedAt);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
});

const loadSettings = async () => {
  isLoading.value = true;
  await appSettingsStore.fetchSettings();

  // Set form values from store
  pdfLimitCount.value = appSettingsStore.pdfLimit;
  pdfLimitPeriod.value = appSettingsStore.limitPeriod;
  monthlyPrice.value = appSettingsStore.monthlyPrice;
  yearlyPrice.value = appSettingsStore.yearlyPrice;
  upiMethods.value = JSON.parse(JSON.stringify(appSettingsStore.upiMethods));
  bankMethods.value = JSON.parse(JSON.stringify(appSettingsStore.bankMethods));
  watermarkText.value = appSettingsStore.watermarkText;

  // Store original values
  originalValues.value = {
    pdfLimitCount: pdfLimitCount.value,
    pdfLimitPeriod: pdfLimitPeriod.value,
    monthlyPrice: monthlyPrice.value,
    yearlyPrice: yearlyPrice.value,
    upiMethods: JSON.stringify(upiMethods.value),
    bankMethods: JSON.stringify(bankMethods.value),
    watermarkText: watermarkText.value,
  };

  isLoading.value = false;
};

const handleRefresh = async () => {
  isRefreshing.value = true;
  await appSettingsStore.refreshSettings();

  // Update form values
  pdfLimitCount.value = appSettingsStore.pdfLimit;
  pdfLimitPeriod.value = appSettingsStore.limitPeriod;
  monthlyPrice.value = appSettingsStore.monthlyPrice;
  yearlyPrice.value = appSettingsStore.yearlyPrice;
  upiMethods.value = JSON.parse(JSON.stringify(appSettingsStore.upiMethods));
  bankMethods.value = JSON.parse(JSON.stringify(appSettingsStore.bankMethods));
  watermarkText.value = appSettingsStore.watermarkText;

  // Update original values
  originalValues.value = {
    pdfLimitCount: pdfLimitCount.value,
    pdfLimitPeriod: pdfLimitPeriod.value,
    monthlyPrice: monthlyPrice.value,
    yearlyPrice: yearlyPrice.value,
    upiMethods: JSON.stringify(upiMethods.value),
    bankMethods: JSON.stringify(bankMethods.value),
    watermarkText: watermarkText.value,
  };

  isRefreshing.value = false;
  successMessage.value = 'Settings refreshed';
  setTimeout(() => { successMessage.value = ''; }, 3000);
};

const saveSettings = async () => {
  // Validation
  if (pdfLimitCount.value < 1) {
    errorMessage.value = 'PDF limit must be at least 1';
    return;
  }
  if (monthlyPrice.value < 0 || yearlyPrice.value < 0) {
    errorMessage.value = 'Prices cannot be negative';
    return;
  }

  // Validate payment methods
  const invalidUpi = upiMethods.value.find(u => !u.name || !u.upiId);
  if (invalidUpi) {
    errorMessage.value = 'Please fill all UPI method fields or remove empty ones';
    return;
  }

  const invalidBank = bankMethods.value.find(b => !b.bankName || !b.accountNumber || !b.ifscCode);
  if (invalidBank) {
    errorMessage.value = 'Please fill all Bank account fields (Bank Name, Account Number, IFSC) or remove empty ones';
    return;
  }

  isSaving.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const result = await appSettingsStore.updateSettings({
    pdfLimits: {
      count: pdfLimitCount.value,
      period: pdfLimitPeriod.value,
    },
    pricing: {
      monthly: monthlyPrice.value,
      yearly: yearlyPrice.value,
      currency: 'INR',
    },
    paymentMethods: {
      upi: upiMethods.value,
      bank: bankMethods.value,
    },
    watermarkText: watermarkText.value || 'CaterHub',
  }, userStore.user?.uid || '');

  if (result.success) {
    successMessage.value = 'Settings saved successfully!';

    // Update original values
    originalValues.value = {
      pdfLimitCount: pdfLimitCount.value,
      pdfLimitPeriod: pdfLimitPeriod.value,
      monthlyPrice: monthlyPrice.value,
      yearlyPrice: yearlyPrice.value,
      upiMethods: JSON.stringify(upiMethods.value),
      bankMethods: JSON.stringify(bankMethods.value),
      watermarkText: watermarkText.value,
    };

    setTimeout(() => { successMessage.value = ''; }, 3000);
  } else {
    errorMessage.value = result.error || 'Failed to save settings';
  }

  isSaving.value = false;
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.settings-page {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.settings-header h2 {
  font-size: 28px;
  margin: 0;
  color: var(--color-text-primary, #333);
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-container p {
  margin-top: 16px;
  color: var(--color-text-secondary, #666);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Settings Card */
.settings-card {
  background: var(--color-surface, white);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.card-icon {
  font-size: 28px;
  color: #667eea;
}

.card-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary, #333);
}

.card-description {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: var(--color-text-secondary, #666);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary, #333);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-surface-secondary, #f8f9fa);
  border-radius: 10px;
  padding: 12px 16px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  background: var(--color-surface, white);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.input-icon {
  font-size: 20px;
  color: #667eea;
  margin-right: 12px;
  flex-shrink: 0;
}

.currency-symbol {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
  margin-right: 8px;
}

.custom-input,
.custom-select {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--color-text-primary, #333);
  font-weight: 500;
}

.custom-input::placeholder {
  color: var(--color-text-muted, #999);
  font-weight: 400;
}

.custom-select {
  cursor: pointer;
}

.preview-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 10px;
  font-size: 14px;
  color: var(--color-text-secondary, #555);
}

.preview-box ion-icon {
  font-size: 20px;
  color: #667eea;
  flex-shrink: 0;
}

/* Last Updated */
.last-updated {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted, #888);
  padding: 12px 16px;
  background: var(--color-surface-secondary, #f5f5f5);
  border-radius: 8px;
}

.last-updated ion-icon {
  font-size: 16px;
}

/* Messages */
.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 10px;
  color: #c62828;
  font-size: 14px;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #e8f5e9;
  border: 1px solid #4caf50;
  border-radius: 10px;
  color: #2e7d32;
  font-size: 14px;
}

.error-message ion-icon,
.success-message ion-icon {
  font-size: 20px;
  flex-shrink: 0;
}

/* Payment Methods Section */
.payment-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border, #e0e0e0);
}

.payment-section:first-of-type {
  margin-top: 16px;
  padding-top: 0;
  border-top: none;
}

.payment-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.payment-section-header h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #333);
}

.payment-section-header h4 ion-icon {
  font-size: 20px;
  color: #667eea;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.add-btn ion-icon {
  font-size: 16px;
}

.empty-methods {
  text-align: center;
  padding: 24px;
  background: var(--color-surface-secondary, #f8f9fa);
  border-radius: 10px;
  border: 2px dashed var(--color-border, #ddd);
}

.empty-methods p {
  margin: 0;
  color: var(--color-text-muted, #999);
  font-size: 14px;
}

.method-item-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--color-surface-secondary, #f8f9fa);
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid var(--color-border, #e0e0e0);
}

.method-inputs {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.method-inputs.bank-inputs {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.input-group.small {
  margin-bottom: 0;
}

.input-group.small .input-label {
  font-size: 11px;
  margin-bottom: 4px;
  color: var(--color-text-secondary, #666);
}

.custom-input.small {
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 8px;
  width: 100%;
  transition: all 0.2s;
  background: var(--color-surface, white);
  color: var(--color-text-primary, #333);
}

.custom-input.small:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.delete-btn {
  background: #ffebee;
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: 20px;
}

.delete-btn:hover {
  background: #f44336;
}

.delete-btn:hover ion-icon {
  color: white;
}

.delete-btn ion-icon {
  font-size: 20px;
  color: #f44336;
}

/* Save Button */
.save-button {
  margin-top: 8px;
  height: 52px;
  font-weight: 600;
  font-size: 16px;
  --border-radius: 12px;
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.save-button:disabled {
  opacity: 0.6;
}

/* Appearance Section */
.appearance-setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface-secondary, #f8f9fa);
  border-radius: 12px;
  padding: 16px 20px;
}

.appearance-info {
  display: flex;
  flex-direction: column;
}

.appearance-label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary, #333);
}

.appearance-description {
  font-size: 13px;
  color: var(--color-text-muted, #888);
  margin-top: 2px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .settings-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .settings-header ion-button {
    width: 100%;
  }

  .input-row {
    grid-template-columns: 1fr;
  }
}

/* Dark mode styles are handled by CSS variables from theme.css */
</style>
