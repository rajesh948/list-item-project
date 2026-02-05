<template>
  <div class="share-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="share-container">
      <div class="share-card">
        <div class="loading-content">
          <div class="loader-spinner"></div>
          <h2>Loading Report...</h2>
          <p>Please wait while we fetch your document</p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="share-container">
      <div class="share-card error-card">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h2>{{ error }}</h2>
        <p v-if="error === 'Link Expired'">This share link has expired. Please request a new link from the sender.</p>
        <p v-else>The requested report could not be found. It may have been deleted or the link is invalid.</p>
        <a href="https://caterhub.com" class="home-btn">Visit CaterHub</a>
      </div>
    </div>

    <!-- Success State -->
    <div v-else-if="downloadComplete" class="share-container">
      <div class="share-card success-card">
        <!-- Business Header -->
        <div class="business-header">
          <img v-if="sharedReport?.branding?.logo" :src="sharedReport.branding.logo" class="business-logo" alt="Logo" />
          <h1 class="business-name">{{ sharedReport?.businessName || 'CaterHub' }}</h1>
          <p v-if="sharedReport?.phoneNumbers" class="business-phone">{{ sharedReport.phoneNumbers }}</p>
        </div>

        <!-- Success Icon -->
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <h2 class="success-title">Download Complete!</h2>
        <p class="success-message">Your PDF has been downloaded successfully.</p>

        <!-- Download Again Button -->
        <button class="download-btn" @click="downloadPdf" :disabled="isGeneratingPdf">
          <span v-if="isGeneratingPdf" class="btn-loader"></span>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download Again
          </template>
        </button>

        <!-- Branding -->
        <div class="powered-by">
          <span>Powered by</span>
          <a href="https://caterhub.com" target="_blank">CaterHub</a>
        </div>
      </div>
    </div>


    <!-- Full Page PDF Generation Overlay -->
    <div v-if="isGeneratingPdf" class="pdf-overlay">
      <div class="pdf-overlay-content">
        <div class="pdf-animation">
          <div class="pdf-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="progress-ring"></div>
        </div>
        <h2>Generating PDF...</h2>
        <p>Your download will start automatically</p>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- Hidden PDF Section for generation -->
    <div id="sharePdfSection" style="display: none;">
      <div v-if="sharedReport" class="pdf-content-wrapper">
        <div class="pdf-header" :style="{ borderBottomColor: sharedReport.branding?.headerColor || '#667eea' }">
          <img v-if="sharedReport.branding?.logo" :src="sharedReport.branding.logo" class="pdf-logo" alt="Logo" />
          <h2 :style="{ color: sharedReport.branding?.headerColor || '#667eea' }">{{ sharedReport.businessName }}</h2>
          <p v-if="sharedReport.branding?.tagline" class="pdf-tagline">{{ sharedReport.branding.tagline }}</p>
          <p v-if="sharedReport.branding?.showPhone !== false">{{ sharedReport.phoneNumbers }}</p>
          <p v-if="sharedReport.branding?.showAddress && sharedReport.branding?.address" class="pdf-address">{{ sharedReport.branding.address }}</p>
        </div>

        <div class="pdf-info-box">
          <table class="pdf-info-table">
            <tbody>
              <tr>
                <td style="width: 45%;"><strong>Name:</strong> <span>{{ sharedReport.reportData?.name }}</span></td>
                <td style="width: 25%;"><strong>Date:</strong> <span>{{ sharedReport.reportData?.date }}</span></td>
                <td style="width: 30%;"><strong>People:</strong> <span>{{ sharedReport.reportData?.noOfPeople }}</span></td>
              </tr>
              <tr>
                <td><strong>Phone:</strong> <span>{{ sharedReport.reportData?.phone }}</span></td>
                <td><strong>Shift:</strong> <span>{{ sharedReport.reportData?.shift }}</span></td>
                <td><strong>Price:</strong> <span>{{ sharedReport.reportData?.price }}</span></td>
              </tr>
              <tr>
                <td colspan="3"><strong>Address:</strong> <span>{{ sharedReport.reportData?.address }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-for="category in sharedReport.selectedCategories" :key="category.id" class="pdf-category">
          <div class="pdf-category-name" :style="{ color: sharedReport.branding?.accentColor || '#667eea', borderColor: sharedReport.branding?.accentColor || '#667eea' }">
            {{ category.name }}
          </div>
          <div class="pdf-items">
            <span v-for="item in category.items" :key="item.id" class="pdf-item">
              {{ item.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, Timestamp } from 'firebase/firestore';

// Define page meta - no layout, no auth
definePageMeta({
  layout: false,
  middleware: [],
});

// Firebase config (same as main app)
const firebaseConfig = {
  apiKey: "AIzaSyAudiW6v9OlVudtm2hIS3O68z86c-MjiJE",
  authDomain: "catering-app-e0a17.firebaseapp.com",
  projectId: "catering-app-e0a17",
  storageBucket: "catering-app-e0a17.firebasestorage.app",
  messagingSenderId: "4179994158",
  appId: "1:4179994158:web:a56fa92eebe7c9358be1bf",
};

interface SharedReportData {
  reportData: {
    name: string;
    phone: string;
    date: string;
    noOfPeople: string;
    shift: string;
    price: string;
    address: string;
  };
  selectedCategories: Array<{
    id: string;
    name: string;
    items: Array<{ id: string; name: string }>;
  }>;
  businessName: string;
  phoneNumbers: string;
  branding?: {
    logo?: string;
    headerColor?: string;
    accentColor?: string;
    tagline?: string;
    address?: string;
    showPhone?: boolean;
    showAddress?: boolean;
  };
  expiresAt?: Timestamp;
}

const route = useRoute();
const shareId = computed(() => route.params.id as string);

const isLoading = ref(true);
const isGeneratingPdf = ref(false);
const downloadComplete = ref(false);
const error = ref<string | null>(null);
const sharedReport = ref<SharedReportData | null>(null);

const totalItems = computed(() => {
  if (!sharedReport.value?.selectedCategories) return 0;
  return sharedReport.value.selectedCategories.reduce(
    (total, cat) => total + (cat.items?.length || 0),
    0
  );
});

// Initialize Firebase independently (this page doesn't use the plugin)
let db: any = null;

const initFirebase = () => {
  try {
    const app = initializeApp(firebaseConfig, 'share-app');
    db = getFirestore(app);
  } catch {
    // App might already be initialized
    const { getApps, getApp } = require('firebase/app');
    const apps = getApps();
    const app = apps.find((a: any) => a.name === 'share-app') || apps[0];
    if (app) {
      db = getFirestore(app);
    }
  }
};

const fetchSharedReport = async () => {
  if (!shareId.value || !db) {
    error.value = 'Report Not Found';
    isLoading.value = false;
    return;
  }

  try {
    const docRef = doc(db, 'sharedReports', shareId.value);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      error.value = 'Report Not Found';
      isLoading.value = false;
      return;
    }

    const data = docSnap.data() as SharedReportData;

    // Check if expired
    if (data.expiresAt) {
      const expiryDate = data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt as any);
      if (expiryDate < new Date()) {
        error.value = 'Link Expired';
        isLoading.value = false;
        return;
      }
    }

    sharedReport.value = data;
    isLoading.value = false;

    // Auto-download PDF after a short delay
    setTimeout(() => {
      downloadPdf();
    }, 500);
  } catch (err) {
    console.error('Error fetching shared report:', err);
    error.value = 'Report Not Found';
    isLoading.value = false;
  }
};

const downloadPdf = async () => {
  if (!sharedReport.value || isGeneratingPdf.value) return;

  isGeneratingPdf.value = true;
  downloadComplete.value = false;

  try {
    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 300));

    const html2pdf = (await import('html2pdf.js')).default;
    const content = document.getElementById('sharePdfSection');

    if (!content) {
      throw new Error('PDF section not found');
    }

    // Make visible for capture
    content.style.display = 'block';
    await new Promise(resolve => setTimeout(resolve, 300));

    const pdfName = `${sharedReport.value.reportData.name || 'Quote'}-${sharedReport.value.reportData.date || 'Report'}`;
    const fileName = `${pdfName}.pdf`;

    const pdfOptions = {
      margin: [2, 2, 2, 2],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await html2pdf()
      .from(content)
      .set(pdfOptions)
      .toPdf()
      .save(fileName);

    // Hide again
    content.style.display = 'none';
    downloadComplete.value = true;
  } catch (err) {
    console.error('PDF generation error:', err);
    const content = document.getElementById('sharePdfSection');
    if (content) {
      content.style.display = 'none';
    }
    error.value = 'Failed to generate PDF';
  } finally {
    isGeneratingPdf.value = false;
  }
};

onMounted(() => {
  if (process.client) {
    initFirebase();
    fetchSharedReport();
  }
});
</script>

<style>
/* Global PDF Styles */
#sharePdfSection {
  font-family: Arial, sans-serif;
  width: 205mm;
  max-width: 205mm;
  background: white;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
  margin: 0 auto;
}

#sharePdfSection .pdf-header {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 3px solid #333;
  padding-bottom: 15px;
}

#sharePdfSection .pdf-logo {
  max-width: 200px;
  max-height: 80px;
  margin-bottom: 10px;
  object-fit: contain;
}

#sharePdfSection .pdf-header h2 {
  margin: 0;
  font-size: 28px;
  color: #333;
  font-weight: bold;
}

#sharePdfSection .pdf-header p {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #555;
}

#sharePdfSection .pdf-tagline {
  font-style: italic;
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #666;
}

#sharePdfSection .pdf-address {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #666;
}

#sharePdfSection .pdf-info-box {
  margin-bottom: 25px;
  border: 2px solid #ddd;
  padding: 10px;
  border-radius: 8px;
  background: #fafafa;
}

#sharePdfSection .pdf-info-table {
  width: 100%;
  border-collapse: collapse;
}

#sharePdfSection .pdf-info-table td {
  padding: 6px 0;
  font-size: 15px;
}

#sharePdfSection .pdf-info-table td strong {
  color: #333;
}

#sharePdfSection .pdf-info-table td span {
  color: #000;
}

#sharePdfSection .pdf-category {
  margin: 20px 0;
  page-break-inside: avoid;
}

#sharePdfSection .pdf-category-name {
  background: transparent;
  color: #667eea;
  padding: 5px 10px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 5px;
  font-size: 16px;
  font-weight: bold;
  border: 2px solid #667eea;
}

#sharePdfSection .pdf-items {
  margin-left: 10px;
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
}

#sharePdfSection .pdf-item {
  display: inline-block;
  background: #f4f5f8;
  padding: 6px 12px;
  border-radius: 15px;
  margin: 4px;
  border: 1px solid #ddd;
  color: #000;
  font-size: 13px;
  white-space: nowrap;
}
</style>

<style scoped>
.share-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
}

/* Full Page PDF Overlay */
.pdf-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.pdf-overlay-content {
  background: white;
  border-radius: 20px;
  padding: 50px 60px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
}

.pdf-overlay-content .pdf-animation {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 30px;
}

.pdf-overlay-content .pdf-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #667eea;
  animation: pulse 1.5s ease-in-out infinite;
}

.pdf-overlay-content .progress-ring {
  width: 100px;
  height: 100px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-right-color: #764ba2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.pdf-overlay-content h2 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin: 0 0 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pdf-overlay-content p {
  color: #666;
  margin: 0 0 24px;
  font-size: 1rem;
}

.pdf-overlay-content .loading-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.pdf-overlay-content .loading-dots span {
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite;
}

.pdf-overlay-content .loading-dots span:nth-child(1) { animation-delay: 0s; }
.pdf-overlay-content .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.pdf-overlay-content .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

.share-container {
  width: 100%;
  max-width: 450px;
}

.share-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

/* Loading State */
.loading-content {
  padding: 20px 0;
}

.loader-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

.loading-content h2 {
  font-size: 1.25rem;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.loading-content p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

/* Error State */
.error-card {
  background: #fff5f5;
}

.error-icon {
  color: #e53e3e;
  margin-bottom: 16px;
}

.error-card h2 {
  font-size: 1.25rem;
  color: #c53030;
  margin: 0 0 8px;
}

.error-card p {
  color: #666;
  margin: 0 0 24px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.home-btn {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: transform 0.2s;
}

.home-btn:hover {
  transform: translateY(-2px);
}

/* Success State */
.business-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #667eea;
}

.business-logo {
  max-width: 120px;
  max-height: 60px;
  object-fit: contain;
  margin-bottom: 8px;
}

.business-name {
  font-size: 1.5rem;
  color: #667eea;
  margin: 0;
  font-weight: 700;
}

.business-phone {
  color: #666;
  margin: 4px 0 0;
  font-size: 0.9rem;
}

.success-icon {
  color: #38a169;
  margin-bottom: 16px;
}

.success-title {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin: 0 0 8px;
  font-weight: 700;
}

.success-message {
  color: #666;
  margin: 0 0 24px;
  font-size: 0.95rem;
}

.download-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.download-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.download-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.powered-by {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
  font-size: 0.8rem;
  color: #888;
}

.powered-by a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .share-page {
    padding: 16px;
  }

  .share-card {
    padding: 30px 20px;
  }

  .business-name {
    font-size: 1.25rem;
  }

  .success-title {
    font-size: 1.25rem;
  }
}
</style>
