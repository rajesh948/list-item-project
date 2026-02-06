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

          <!-- App Version Management Section -->
          <div class="settings-card">
            <div class="card-header">
              <ion-icon :icon="phonePortraitOutline" class="card-icon"></ion-icon>
              <h3>App Version Management</h3>
            </div>
            <p class="card-description">
              Manage app versions and release history. Add new versions when you release updates.
            </p>

            <!-- Add New Version Form -->
            <div class="version-add-section">
              <h4 class="section-title">
                <ion-icon :icon="addCircleOutline"></ion-icon>
                Add New Version
              </h4>

              <div class="settings-form">
                <div class="input-row">
                  <div class="input-group">
                    <label class="input-label">Version Number</label>
                    <div class="input-wrapper">
                      <ion-icon :icon="pricetagOutline" class="input-icon"></ion-icon>
                      <input
                        v-model="newVersion.version"
                        type="text"
                        class="custom-input"
                        placeholder="e.g., 1.0.1"
                      />
                    </div>
                  </div>

                  <div class="input-group">
                    <label class="input-label">APK Size</label>
                    <div class="input-wrapper">
                      <ion-icon :icon="cloudDownloadOutline" class="input-icon"></ion-icon>
                      <input
                        v-model="newVersion.size"
                        type="text"
                        class="custom-input"
                        placeholder="e.g., 6 MB"
                      />
                    </div>
                  </div>
                </div>

                <div class="input-group">
                  <label class="input-label">Download URL</label>
                  <div class="input-wrapper">
                    <ion-icon :icon="linkOutline" class="input-icon"></ion-icon>
                    <input
                      v-model="newVersion.downloadUrl"
                      type="text"
                      class="custom-input"
                      placeholder="Google Drive direct link"
                    />
                  </div>
                </div>

                <div class="input-group">
                  <label class="input-label">Release Notes</label>
                  <div class="input-wrapper textarea-wrapper">
                    <textarea
                      v-model="newVersion.releaseNotes"
                      class="custom-textarea"
                      placeholder="What's new in this version..."
                      rows="2"
                    ></textarea>
                  </div>
                </div>

                <div class="checkbox-group">
                  <label class="custom-checkbox">
                    <input type="checkbox" v-model="newVersion.setAsLatest" />
                    <span class="checkmark"></span>
                    Set as Latest Version
                  </label>
                </div>

                <ion-button
                  expand="block"
                  class="version-save-btn"
                  @click="addNewVersion"
                  :disabled="isAddingVersion"
                >
                  <ion-spinner v-if="isAddingVersion" name="crescent"></ion-spinner>
                  <ion-icon v-else slot="start" :icon="addCircleOutline"></ion-icon>
                  <span v-if="!isAddingVersion">Add Version</span>
                </ion-button>
              </div>
            </div>

            <!-- Min Required Version Selector -->
            <div class="version-config-section">
              <h4 class="section-title">
                <ion-icon :icon="warningOutline"></ion-icon>
                Update Configuration
              </h4>

              <div class="input-row">
                <div class="input-group">
                  <label class="input-label">Min Required Version</label>
                  <div class="custom-dropdown" :class="{ 'is-open': isDropdownOpen }">
                    <div class="dropdown-trigger" @click="toggleDropdown">
                      <ion-icon :icon="warningOutline" class="dropdown-icon"></ion-icon>
                      <span class="dropdown-value">
                        v{{ minRequiredVersion }}
                        <span v-if="minRequiredVersion === latestVersion" class="dropdown-badge">Latest</span>
                      </span>
                      <ion-icon :icon="isDropdownOpen ? chevronUpOutline : chevronDownOutline" class="dropdown-arrow"></ion-icon>
                    </div>
                    <div v-if="isDropdownOpen" class="dropdown-menu">
                      <div
                        v-for="ver in versionList"
                        :key="ver.version"
                        class="dropdown-item"
                        :class="{ 'is-selected': ver.version === minRequiredVersion, 'is-latest': ver.isLatest }"
                        @click="selectMinVersion(ver.version)"
                      >
                        <span class="dropdown-item-version">v{{ ver.version }}</span>
                        <span v-if="ver.isLatest" class="dropdown-item-badge">Latest</span>
                        <ion-icon v-if="ver.version === minRequiredVersion" :icon="checkmarkOutline" class="dropdown-item-check"></ion-icon>
                      </div>
                      <div v-if="versionList.length === 0" class="dropdown-empty">
                        No versions added
                      </div>
                    </div>
                  </div>
                  <span class="input-hint">Users below this version will be forced to update</span>
                </div>

                <div class="input-group">
                  <label class="input-label">Landing Page URL</label>
                  <div class="input-wrapper">
                    <ion-icon :icon="linkOutline" class="input-icon"></ion-icon>
                    <input
                      v-model="landingPageUrl"
                      type="text"
                      class="custom-input"
                      placeholder="https://caterhub.web.app"
                      @blur="updateLandingUrl"
                    />
                  </div>
                </div>
              </div>

            </div>

            <!-- Version History List -->
            <div class="version-list-section">
              <h4 class="section-title">
                <ion-icon :icon="timeOutline"></ion-icon>
                Version History
              </h4>

              <div v-if="versionList.length === 0" class="empty-versions">
                <ion-icon :icon="documentOutline"></ion-icon>
                <p>No versions added yet. Add your first version above.</p>
              </div>

              <div v-else class="version-list">
                <div
                  v-for="ver in versionList"
                  :key="ver.version"
                  class="version-item"
                  :class="{
                    'is-latest': ver.isLatest,
                    'hidden-on-landing': ver.showOnLanding === false,
                    'is-expanded': expandedVersion === ver.version
                  }"
                >
                  <!-- Collapsed Header -->
                  <div class="version-collapsed" @click="toggleExpand(ver.version)">
                    <!-- Show on Landing Checkbox -->
                    <div class="version-visibility" @click.stop>
                      <label class="visibility-checkbox" :title="ver.showOnLanding !== false ? 'Visible on landing page' : 'Hidden on landing page'">
                        <input
                          type="checkbox"
                          :checked="ver.showOnLanding !== false"
                          @change="toggleVersionVisibility(ver.version)"
                        />
                        <span class="visibility-icon">
                          <ion-icon v-if="ver.showOnLanding !== false" :icon="eyeOutline"></ion-icon>
                          <ion-icon v-else :icon="eyeOffOutline"></ion-icon>
                        </span>
                      </label>
                    </div>

                    <div class="version-summary">
                      <span class="version-number">v{{ ver.version }}</span>
                      <span v-if="ver.size" class="version-size">{{ ver.size }}</span>
                      <span v-if="ver.isLatest" class="version-badge latest">Latest</span>
                      <span v-if="ver.version === minRequiredVersion" class="version-badge required">Min Required</span>
                    </div>

                    <div class="version-date-compact">
                      <ion-icon :icon="calendarOutline"></ion-icon>
                      {{ formatDate(ver.releaseDate) }}
                    </div>

                    <div class="version-actions" @click.stop>
                      <button
                        v-if="!ver.isLatest"
                        class="action-btn set-latest"
                        @click="setAsLatest(ver.version)"
                        title="Set as Latest"
                      >
                        <ion-icon :icon="starOutline"></ion-icon>
                      </button>
                      <button
                        class="action-btn delete"
                        @click="deleteVersion(ver.version)"
                        title="Delete Version"
                      >
                        <ion-icon :icon="trashOutline"></ion-icon>
                      </button>
                    </div>

                    <div class="expand-icon">
                      <ion-icon :icon="expandedVersion === ver.version ? chevronUpOutline : chevronDownOutline"></ion-icon>
                    </div>
                  </div>

                  <!-- Expanded Content -->
                  <div v-if="expandedVersion === ver.version" class="version-expanded">
                    <!-- Version Number and Size Row -->
                    <div class="expanded-row">
                      <div class="expanded-section">
                        <label class="expanded-label">Version Number</label>
                        <div class="edit-input-wrapper">
                          <ion-icon :icon="pricetagOutline" class="edit-input-icon"></ion-icon>
                          <input
                            :value="ver.version"
                            @input="updateVersionField(ver.version, 'version', ($event.target as HTMLInputElement).value)"
                            type="text"
                            class="edit-input"
                            placeholder="e.g., 1.0.1"
                          />
                        </div>
                      </div>
                      <div class="expanded-section">
                        <label class="expanded-label">APK Size</label>
                        <div class="edit-input-wrapper">
                          <ion-icon :icon="cloudDownloadOutline" class="edit-input-icon"></ion-icon>
                          <input
                            :value="ver.size"
                            @input="updateVersionField(ver.version, 'size', ($event.target as HTMLInputElement).value)"
                            type="text"
                            class="edit-input"
                            placeholder="e.g., 6 MB"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Download URL -->
                    <div class="expanded-section">
                      <label class="expanded-label">Download URL</label>
                      <div class="edit-input-wrapper">
                        <ion-icon :icon="linkOutline" class="edit-input-icon"></ion-icon>
                        <input
                          :value="ver.downloadUrl"
                          @input="updateVersionField(ver.version, 'downloadUrl', ($event.target as HTMLInputElement).value)"
                          type="text"
                          class="edit-input"
                          placeholder="Google Drive direct link"
                        />
                        <a v-if="ver.downloadUrl" :href="ver.downloadUrl" target="_blank" class="url-test-btn" title="Test URL">
                          <ion-icon :icon="openOutline"></ion-icon>
                        </a>
                      </div>
                    </div>

                    <!-- Release Notes -->
                    <div class="expanded-section">
                      <label class="expanded-label">Release Notes</label>
                      <div class="release-notes-editor">
                        <div class="notes-hint">Add each point on a new line (will show as bullet points)</div>
                        <textarea
                          :value="ver.releaseNotes"
                          @input="updateReleaseNotes(ver.version, ($event.target as HTMLTextAreaElement).value)"
                          class="notes-textarea"
                          placeholder="• New feature added&#10;• Bug fixes&#10;• Performance improvements"
                          rows="4"
                        ></textarea>
                      </div>
                    </div>

                    <div class="expanded-actions">
                      <button class="save-notes-btn" @click="saveVersionChanges">
                        <ion-icon :icon="saveOutline"></ion-icon>
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Preview Box -->
            <div class="preview-box version-summary-box" v-if="versionList.length > 0">
              <ion-icon :icon="informationCircleOutline"></ion-icon>
              <span>
                Latest: <strong>v{{ latestVersion }}</strong> |
                Min Required: <strong>v{{ minRequiredVersion }}</strong> |
                Total: <strong>{{ versionList.length }}</strong>
              </span>
            </div>

            <!-- Version Error Message -->
            <div v-if="versionErrorMessage" class="version-error-message">
              <ion-icon :icon="alertCircleOutline"></ion-icon>
              <span>{{ versionErrorMessage }}</span>
            </div>

            <!-- Version Success Message -->
            <div v-if="versionSuccessMessage" class="version-success-message">
              <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
              <span>{{ versionSuccessMessage }}</span>
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
  phonePortraitOutline,
  cloudDownloadOutline,
  warningOutline,
  linkOutline,
  cloudUploadOutline,
  calendarOutline,
  downloadOutline,
  starOutline,
  chevronDownOutline,
  chevronUpOutline,
  listOutline,
  eyeOffOutline,
  checkmarkOutline,
  openOutline,
} from 'ionicons/icons';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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

// App Version Management
interface AppVersionEntry {
  version: string;
  downloadUrl: string;
  releaseNotes: string;
  size: string;
  releaseDate: any;
  isLatest: boolean;
  showOnLanding?: boolean;
}

const versionList = ref<AppVersionEntry[]>([]);
const newVersion = ref({
  version: '',
  downloadUrl: '',
  releaseNotes: '',
  size: '',
  setAsLatest: true,
});
const minRequiredVersion = ref('1.0.0');
const landingPageUrl = ref('https://caterhub.web.app');
const isAddingVersion = ref(false);
const expandedVersion = ref<string | null>(null);
const isDropdownOpen = ref(false);
const versionErrorMessage = ref('');
const versionSuccessMessage = ref('');

const latestVersion = computed(() => {
  const latest = versionList.value.find(v => v.isLatest);
  return latest?.version || '1.0.0';
});

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

// Load version settings from Firestore
const loadVersionSettings = async () => {
  try {
    const { $db } = useNuxtApp();
    const versionDoc = await getDoc(doc($db, 'appConfig', 'version'));

    if (versionDoc.exists()) {
      const data = versionDoc.data();
      versionList.value = data.versions || [];
      minRequiredVersion.value = data.minRequiredVersion || '1.0.0';
      landingPageUrl.value = data.updateUrl || 'https://caterhub.web.app';

      // Sort versions by release date (newest first)
      versionList.value.sort((a, b) => {
        const dateA = a.releaseDate?.toDate?.() || new Date(a.releaseDate);
        const dateB = b.releaseDate?.toDate?.() || new Date(b.releaseDate);
        return dateB.getTime() - dateA.getTime();
      });
    }
  } catch (error) {
    console.error('Error loading version settings:', error);
  }
};

// Save all version data to Firestore
const saveVersionData = async () => {
  try {
    const { $db } = useNuxtApp();
    const latest = versionList.value.find(v => v.isLatest);

    await setDoc(doc($db, 'appConfig', 'version'), {
      versions: versionList.value,
      latestVersion: latest?.version || '1.0.0',
      minRequiredVersion: minRequiredVersion.value,
      updateUrl: landingPageUrl.value,
      releaseNotes: latest?.releaseNotes || '',
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error saving version data:', error);
    return false;
  }
};

// Add new version
const addNewVersion = async () => {
  const versionRegex = /^\d+\.\d+\.\d+$/;

  if (!versionRegex.test(newVersion.value.version)) {
    versionErrorMessage.value = 'Invalid version format. Use format: 1.0.0';
    setTimeout(() => { versionErrorMessage.value = ''; }, 3000);
    return;
  }

  if (!newVersion.value.downloadUrl) {
    versionErrorMessage.value = 'Download URL is required';
    setTimeout(() => { versionErrorMessage.value = ''; }, 3000);
    return;
  }

  // Check if version already exists
  if (versionList.value.some(v => v.version === newVersion.value.version)) {
    versionErrorMessage.value = 'This version already exists';
    setTimeout(() => { versionErrorMessage.value = ''; }, 3000);
    return;
  }

  isAddingVersion.value = true;
  versionErrorMessage.value = '';

  // If setting as latest, unmark current latest
  if (newVersion.value.setAsLatest) {
    versionList.value = versionList.value.map(v => ({ ...v, isLatest: false }));
  }

  // Add new version
  versionList.value.unshift({
    version: newVersion.value.version,
    downloadUrl: newVersion.value.downloadUrl,
    releaseNotes: newVersion.value.releaseNotes,
    size: newVersion.value.size || '~6 MB',
    releaseDate: new Date(),
    isLatest: newVersion.value.setAsLatest,
    showOnLanding: true,
  });

  const success = await saveVersionData();

  if (success) {
    versionSuccessMessage.value = `Version ${newVersion.value.version} added successfully!`;
    // Reset form
    newVersion.value = {
      version: '',
      downloadUrl: '',
      releaseNotes: '',
      size: '',
      setAsLatest: true,
    };
  } else {
    versionErrorMessage.value = 'Failed to add version';
  }

  setTimeout(() => {
    versionSuccessMessage.value = '';
    versionErrorMessage.value = '';
  }, 3000);

  isAddingVersion.value = false;
};

// Set a version as latest
const setAsLatest = async (version: string) => {
  versionList.value = versionList.value.map(v => ({
    ...v,
    isLatest: v.version === version,
  }));

  const success = await saveVersionData();

  if (success) {
    versionSuccessMessage.value = `Version ${version} set as latest!`;
  } else {
    versionErrorMessage.value = 'Failed to update latest version';
  }

  setTimeout(() => {
    versionSuccessMessage.value = '';
    versionErrorMessage.value = '';
  }, 3000);
};

// Delete a version
const deleteVersion = async (version: string) => {
  if (versionList.value.length === 1) {
    versionErrorMessage.value = 'Cannot delete the only version';
    setTimeout(() => { versionErrorMessage.value = ''; }, 3000);
    return;
  }

  const ver = versionList.value.find(v => v.version === version);
  const wasLatest = ver?.isLatest;

  versionList.value = versionList.value.filter(v => v.version !== version);

  // If deleted version was latest, set the first remaining as latest
  if (wasLatest && versionList.value.length > 0) {
    versionList.value[0].isLatest = true;
  }

  // If deleted version was min required, set to lowest available
  if (minRequiredVersion.value === version) {
    const sorted = [...versionList.value].sort((a, b) => {
      const partsA = a.version.split('.').map(Number);
      const partsB = b.version.split('.').map(Number);
      for (let i = 0; i < 3; i++) {
        if (partsA[i] !== partsB[i]) return partsA[i] - partsB[i];
      }
      return 0;
    });
    minRequiredVersion.value = sorted[0]?.version || '1.0.0';
  }

  // Close expanded if deleted
  if (expandedVersion.value === version) {
    expandedVersion.value = null;
  }

  const success = await saveVersionData();

  if (success) {
    versionSuccessMessage.value = `Version ${version} deleted!`;
  } else {
    versionErrorMessage.value = 'Failed to delete version';
  }

  setTimeout(() => {
    versionSuccessMessage.value = '';
    versionErrorMessage.value = '';
  }, 3000);
};

// Update min required version
const updateMinRequired = async () => {
  await saveVersionData();
  versionSuccessMessage.value = 'Min required version updated!';
  setTimeout(() => { versionSuccessMessage.value = ''; }, 3000);
};

// Toggle dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Select min version from dropdown
const selectMinVersion = async (version: string) => {
  minRequiredVersion.value = version;
  isDropdownOpen.value = false;
  await updateMinRequired();
};

// Close dropdown when clicking outside
const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.custom-dropdown')) {
    isDropdownOpen.value = false;
  }
};


// Update landing page URL
const updateLandingUrl = async () => {
  await saveVersionData();
};

// Toggle version visibility on landing page
const toggleVersionVisibility = async (version: string) => {
  const ver = versionList.value.find(v => v.version === version);
  if (ver) {
    ver.showOnLanding = ver.showOnLanding === false ? true : false;
    await saveVersionData();
    versionSuccessMessage.value = `v${version} ${ver.showOnLanding ? 'visible' : 'hidden'} on landing page`;
    setTimeout(() => { versionSuccessMessage.value = ''; }, 3000);
  }
};

// Toggle expand/collapse version
const toggleExpand = (version: string) => {
  expandedVersion.value = expandedVersion.value === version ? null : version;
};

// Update release notes for a version
const updateReleaseNotes = (version: string, notes: string) => {
  const ver = versionList.value.find(v => v.version === version);
  if (ver) {
    ver.releaseNotes = notes;
  }
};

// Update any field of a version
const updateVersionField = (currentVersion: string, field: string, value: string) => {
  const ver = versionList.value.find(v => v.version === currentVersion);
  if (ver) {
    if (field === 'version') {
      // Check if new version already exists (excluding current)
      const exists = versionList.value.some(v => v.version === value && v.version !== currentVersion);
      if (exists) {
        versionErrorMessage.value = 'This version number already exists';
        setTimeout(() => { versionErrorMessage.value = ''; }, 3000);
        return;
      }
      // Update the version number
      ver.version = value;
      // Update expandedVersion to track the new version
      expandedVersion.value = value;
      // Update minRequiredVersion if it was pointing to the old version
      if (minRequiredVersion.value === currentVersion) {
        minRequiredVersion.value = value;
      }
    } else if (field === 'size') {
      ver.size = value;
    } else if (field === 'downloadUrl') {
      ver.downloadUrl = value;
    }
  }
};

// Save version changes
const saveVersionChanges = async () => {
  const success = await saveVersionData();
  if (success) {
    versionSuccessMessage.value = 'Version updated successfully!';
    setTimeout(() => { versionSuccessMessage.value = ''; }, 3000);
  } else {
    versionErrorMessage.value = 'Failed to save changes';
    setTimeout(() => { versionErrorMessage.value = ''; }, 3000);
  }
};

// Format date for display
const formatDate = (date: any) => {
  if (!date) return 'Unknown';
  const d = date?.toDate?.() || new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

onMounted(() => {
  loadSettings();
  loadVersionSettings();
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
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
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 30px;
  min-width: 150px;
}

.select-wrapper {
  position: relative;
}

.select-wrapper .select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #667eea;
  pointer-events: none;
  transition: transform 0.2s;
}

.select-wrapper:focus-within .select-arrow {
  transform: translateY(-50%) rotate(180deg);
}

.custom-select option {
  padding: 12px 16px;
  background: var(--color-surface, white);
  color: var(--color-text-primary, #333);
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid #eee;
}

.custom-select option:checked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.custom-select option:hover {
  background: #f0f4ff;
}

.custom-select option:disabled {
  color: var(--color-text-muted, #999);
  font-style: italic;
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

/* Textarea wrapper for version release notes */
.textarea-wrapper {
  padding: 8px 16px;
}

.custom-textarea {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--color-text-primary, #333);
  font-weight: 500;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.custom-textarea::placeholder {
  color: var(--color-text-muted, #999);
  font-weight: 400;
}

/* Version Save Button */
.version-save-btn {
  margin-top: 8px;
  height: 48px;
  font-weight: 600;
  font-size: 15px;
  --border-radius: 10px;
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.version-save-btn:disabled {
  opacity: 0.6;
}

/* Version Management Sections */
.version-add-section,
.version-config-section,
.version-list-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border, #e0e0e0);
}

.version-add-section:first-of-type {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #333);
}

.section-title ion-icon {
  font-size: 20px;
  color: #667eea;
}

.input-hint {
  font-size: 12px;
  color: var(--color-text-muted, #888);
  margin-top: 4px;
}

/* Checkbox Group */
.checkbox-group {
  margin: 8px 0;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-primary, #333);
}

.custom-checkbox input {
  display: none;
}

.custom-checkbox .checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #667eea;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.custom-checkbox input:checked + .checkmark {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.custom-checkbox input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Toggle Switch */
.toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-surface-secondary, #f8f9fa);
  border-radius: 10px;
}

.custom-toggle {
  position: relative;
  width: 52px;
  height: 28px;
  cursor: pointer;
}

.custom-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ddd;
  border-radius: 28px;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.custom-toggle input:checked + .toggle-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.custom-toggle input:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #333);
}

/* Empty Versions */
.empty-versions {
  text-align: center;
  padding: 32px;
  background: var(--color-surface-secondary, #f8f9fa);
  border-radius: 12px;
  border: 2px dashed var(--color-border, #ddd);
}

.empty-versions ion-icon {
  font-size: 48px;
  color: var(--color-text-muted, #999);
  margin-bottom: 12px;
}

.empty-versions p {
  margin: 0;
  color: var(--color-text-muted, #888);
  font-size: 14px;
}

/* Version List */
.version-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.version-item {
  background: var(--color-surface-secondary, #f8f9fa);
  border-radius: 12px;
  border: 1px solid var(--color-border, #e0e0e0);
  transition: all 0.2s;
  overflow: hidden;
}

.version-item.is-latest {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-color: rgba(102, 126, 234, 0.3);
}

.version-item.hidden-on-landing {
  opacity: 0.6;
}

.version-item.is-expanded {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

/* Collapsed Header */
.version-collapsed {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  gap: 12px;
}

.version-collapsed:hover {
  background: rgba(102, 126, 234, 0.05);
}

.version-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.version-date-compact {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted, #888);
}

.version-date-compact ion-icon {
  font-size: 14px;
}

.expand-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted, #888);
  transition: transform 0.2s;
}

.expand-icon ion-icon {
  font-size: 18px;
}

/* Expanded Content */
.version-expanded {
  padding: 16px;
  border-top: 1px solid var(--color-border, #e0e0e0);
  background: var(--color-surface, white);
}

.expanded-section {
  margin-bottom: 16px;
}

.expanded-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary, #666);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.release-notes-editor {
  background: var(--color-surface-secondary, #f8f9fa);
  border-radius: 8px;
  padding: 12px;
}

.notes-hint {
  font-size: 11px;
  color: var(--color-text-muted, #888);
  margin-bottom: 8px;
}

.notes-textarea {
  width: 100%;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 6px;
  padding: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  background: var(--color-surface, white);
  color: var(--color-text-primary, #333);
}

.notes-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.download-link-full {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: var(--color-surface-secondary, #f8f9fa);
  border-radius: 6px;
  color: #667eea;
  text-decoration: none;
  font-size: 13px;
  word-break: break-all;
}

.download-link-full ion-icon {
  flex-shrink: 0;
}

/* Edit Input Styles for Version Fields */
.edit-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface-secondary, #f8f9fa);
  border-radius: 8px;
  padding: 10px 14px;
  border: 1px solid var(--color-border, #e0e0e0);
  transition: all 0.2s;
}

.edit-input-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: var(--color-surface, white);
}

.edit-input-icon {
  font-size: 18px;
  color: #667eea;
  flex-shrink: 0;
}

.edit-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--color-text-primary, #333);
  font-weight: 500;
  min-width: 0;
}

.edit-input::placeholder {
  color: var(--color-text-muted, #999);
  font-weight: 400;
}

.url-test-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  transition: all 0.2s;
  flex-shrink: 0;
}

.url-test-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.url-test-btn ion-icon {
  font-size: 16px;
}

.expanded-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 480px) {
  .expanded-row {
    grid-template-columns: 1fr;
  }
}

.expanded-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--color-border, #eee);
}

.save-notes-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-notes-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-notes-btn ion-icon {
  font-size: 16px;
}

/* Version Summary Box - bottom spacing */
.version-summary-box {
  margin-bottom: 16px;
}

/* Version Error and Success Messages */
.version-error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 10px;
  color: #c62828;
  font-size: 14px;
  margin-top: 12px;
}

.version-success-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #e8f5e9;
  border: 1px solid #4caf50;
  border-radius: 10px;
  color: #2e7d32;
  font-size: 14px;
  margin-top: 12px;
}

.version-error-message ion-icon,
.version-success-message ion-icon {
  font-size: 20px;
  flex-shrink: 0;
}

/* Version actions in collapsed header */
.version-collapsed .version-actions {
  display: flex;
  gap: 6px;
}

.version-collapsed .action-btn {
  width: 32px;
  height: 32px;
}

.version-collapsed .action-btn ion-icon {
  font-size: 16px;
}

/* Custom Dropdown */
.custom-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-surface-secondary, #f8f9fa);
  border-radius: 10px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-trigger:hover {
  border-color: rgba(102, 126, 234, 0.3);
}

.custom-dropdown.is-open .dropdown-trigger {
  border-color: #667eea;
  background: var(--color-surface, white);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.dropdown-icon {
  font-size: 20px;
  color: #667eea;
  flex-shrink: 0;
}

.dropdown-value {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary, #333);
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.dropdown-arrow {
  font-size: 18px;
  color: #667eea;
  transition: transform 0.2s;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--color-surface, white);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--color-border, #e0e0e0);
  z-index: 100;
  overflow: hidden;
  animation: dropdownFadeIn 0.2s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.15s;
  border-bottom: 1px solid var(--color-border, #f0f0f0);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
}

.dropdown-item.is-selected {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%);
}

.dropdown-item-version {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary, #333);
}

.dropdown-item-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.dropdown-item-check {
  margin-left: auto;
  font-size: 18px;
  color: #667eea;
}

.dropdown-empty {
  padding: 16px;
  text-align: center;
  color: var(--color-text-muted, #888);
  font-size: 14px;
}

/* Version Visibility Checkbox */
.version-visibility {
  flex-shrink: 0;
  margin-right: 12px;
}

.visibility-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.visibility-checkbox:hover {
  background: rgba(102, 126, 234, 0.1);
}

.visibility-checkbox input {
  display: none;
}

.visibility-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.visibility-icon ion-icon {
  font-size: 22px;
  color: #667eea;
  transition: all 0.2s;
}

.version-item.hidden-on-landing .visibility-icon ion-icon {
  color: var(--color-text-muted, #999);
}

.version-size {
  font-size: 12px;
  color: var(--color-text-muted, #888);
  background: var(--color-surface-secondary, #f0f0f0);
  padding: 2px 8px;
  border-radius: 4px;
}

.version-info {
  flex: 1;
}

.version-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.version-number {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary, #333);
}

.version-badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.version-badge.latest {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.version-badge.required {
  background: #fff3e0;
  color: #e65100;
}

.version-notes {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: var(--color-text-secondary, #666);
  line-height: 1.4;
}

.version-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: var(--color-text-muted, #888);
}

.version-date,
.version-link {
  display: flex;
  align-items: center;
  gap: 4px;
}

.version-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.version-link:hover {
  text-decoration: underline;
}

.version-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn ion-icon {
  font-size: 18px;
}

.action-btn.set-latest {
  background: #fff8e1;
  color: #f9a825;
}

.action-btn.set-latest:hover {
  background: #f9a825;
  color: white;
}

.action-btn.delete {
  background: #ffebee;
  color: #f44336;
}

.action-btn.delete:hover:not(:disabled) {
  background: #f44336;
  color: white;
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
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
