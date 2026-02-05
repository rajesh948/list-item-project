<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="gradient-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Report Preview</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Hidden PDF Section (Plain HTML for PDF generation) -->
      <div id="pdfSection" style="display: none;">
        <!-- Full Page Background Watermark for Free Users -->
        <div v-if="!isPremium" class="pdf-watermark-bg">
          <div class="watermark-text">{{ watermarkTextValue }} &nbsp; {{ watermarkTextValue }} &nbsp; {{ watermarkTextValue }}</div>
          <div class="watermark-text">{{ watermarkTextValue }} &nbsp; {{ watermarkTextValue }} &nbsp; {{ watermarkTextValue }}</div>
          <div class="watermark-text">{{ watermarkTextValue }} &nbsp; {{ watermarkTextValue }} &nbsp; {{ watermarkTextValue }}</div>
          <div class="watermark-text">{{ watermarkTextValue }} &nbsp; {{ watermarkTextValue }} &nbsp; {{ watermarkTextValue }}</div>
          <div class="watermark-text">{{ watermarkTextValue }} &nbsp; {{ watermarkTextValue }} &nbsp; {{ watermarkTextValue }}</div>
          <div class="watermark-text">{{ watermarkTextValue }} &nbsp; {{ watermarkTextValue }} &nbsp; {{ watermarkTextValue }}</div>
        </div>

        <div class="pdf-content-wrapper">
          <div class="pdf-header" :style="{ borderBottomColor: effectiveBranding.headerColor }">
            <img v-if="effectiveBranding.logo" :src="effectiveBranding.logo" class="pdf-logo" alt="Logo" />
            <h2 :style="{ color: effectiveBranding.headerColor }">{{ businessName }}</h2>
            <p v-if="effectiveBranding.tagline" class="pdf-tagline">{{ effectiveBranding.tagline }}</p>
            <p v-if="effectiveBranding.showPhone !== false">{{ phoneNumbers }}</p>
            <p v-if="effectiveBranding.showAddress && effectiveBranding.address" class="pdf-address">{{ effectiveBranding.address }}</p>
          </div>

          <div class="pdf-info-box">
            <table class="pdf-info-table">
              <tbody>
                <tr>
                  <td style="width: 45%;"><strong>Name:</strong> <span>{{ reportData?.name }}</span></td>
                  <td style="width: 25%;"><strong>Date:</strong> <span>{{ reportData?.date }}</span></td>
                  <td style="width: 30%;"><strong>People:</strong> <span>{{ reportData?.noOfPeople }}</span></td>
                </tr>
                <tr>
                  <td><strong>Phone:</strong> <span>{{ reportData?.phone }}</span></td>
                  <td><strong>Shift:</strong> <span>{{ reportData?.shift }}</span></td>
                  <td><strong>Price:</strong> <span>{{ reportData?.price }}</span></td>
                </tr>
                <tr>
                  <td colspan="3"><strong>Address:</strong> <span>{{ reportData?.address }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Selected Items by Category -->
          <div v-for="category in selectedCategories" :key="category.name" class="pdf-category">
            <div class="pdf-category-name" :style="{ color: effectiveBranding.accentColor, borderColor: effectiveBranding.accentColor }">
              {{ category.name }}
            </div>
            <div class="pdf-items">
              <span v-for="item in category.items" :key="item.name" class="pdf-item">
                {{ item.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingReport" class="loading-state">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Loading report...</p>
      </div>

      <!-- Main Preview Content -->
      <div v-else-if="reportData" class="preview-container">
        <!-- Preview Header -->
        <div class="preview-header">
          <h2>{{ businessName }}</h2>
          <p v-if="phoneNumbers" class="preview-phone">{{ phoneNumbers }}</p>
        </div>

        <!-- Customer Info Card -->
        <div class="preview-info-card">
          <div class="preview-info-row">
            <div class="preview-info-cell">
              <span class="label">Customer</span>
              <span class="value">{{ reportData?.name || 'N/A' }}</span>
            </div>
            <div class="preview-info-cell">
              <span class="label">Phone</span>
              <span class="value">{{ reportData?.phone || 'N/A' }}</span>
            </div>
          </div>
          <div class="preview-info-row">
            <div class="preview-info-cell">
              <span class="label">Date</span>
              <span class="value">{{ reportData?.date || 'N/A' }}</span>
            </div>
            <div class="preview-info-cell">
              <span class="label">People</span>
              <span class="value">{{ reportData?.noOfPeople || 'N/A' }}</span>
            </div>
          </div>
          <div class="preview-info-row">
            <div class="preview-info-cell">
              <span class="label">Shift</span>
              <span class="value">{{ reportData?.shift || 'N/A' }}</span>
            </div>
            <div class="preview-info-cell">
              <span class="label">Price</span>
              <span class="value price">₹{{ reportData?.price || '0' }}</span>
            </div>
          </div>
          <div class="preview-info-row single">
            <div class="preview-info-cell full">
              <span class="label">Address</span>
              <span class="value">{{ reportData?.address || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Menu Items -->
        <div class="preview-items-section">
          <div class="preview-items-header">
            <span class="items-title">Menu Items</span>
            <span class="items-count">{{ totalItems }} items</span>
          </div>
          <div class="preview-categories">
            <div
              v-for="category in selectedCategories"
              :key="category.id"
              class="preview-category"
            >
              <span class="category-label">{{ category.name }}</span>
              <div class="category-items">
                <span
                  v-for="item in category.items"
                  :key="item.id"
                  class="item-tag"
                >{{ item.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="preview-actions">
          <button class="preview-btn pdf-btn" @click="generatePdf" :disabled="isGeneratingPdf">
            <ion-spinner v-if="isGeneratingPdf" name="crescent"></ion-spinner>
            <template v-else>
              <ion-icon :icon="downloadOutline"></ion-icon>
              <span>Generate PDF</span>
            </template>
          </button>
          <button class="preview-btn whatsapp-btn" @click="shareOnWhatsApp" :disabled="isCreatingShare">
            <ion-spinner v-if="isCreatingShare" name="crescent"></ion-spinner>
            <template v-else>
              <ion-icon :icon="logoWhatsapp"></ion-icon>
              <span>Share on WhatsApp</span>
            </template>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <ion-icon :icon="documentTextOutline" class="empty-icon"></ion-icon>
        <h2>Report Not Found</h2>
        <p>The requested report could not be loaded</p>
        <button class="back-btn" @click="goBack">
          <ion-icon :icon="arrowBackOutline"></ion-icon>
          Go Back
        </button>
      </div>

      <!-- PDF Generation Overlay -->
      <div v-if="isGeneratingPdf" class="pdf-loader-overlay">
        <div class="pdf-loader-content">
          <div class="pdf-loader-animation">
            <div class="pdf-icon-wrapper">
              <ion-icon :icon="documentTextOutline" class="pdf-doc-icon"></ion-icon>
              <div class="pdf-progress-ring"></div>
            </div>
          </div>
          <h3 class="pdf-loader-title">Generating PDF</h3>
          <p class="pdf-loader-subtitle">Please wait while your report is being prepared...</p>
          <div class="pdf-loader-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonSpinner,
} from '@ionic/vue';
import {
  arrowBackOutline,
  downloadOutline,
  logoWhatsapp,
  documentTextOutline,
} from 'ionicons/icons';
import { doc, getDoc } from 'firebase/firestore';
import { Filesystem, Directory } from '@capacitor/filesystem';

const { $db } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const { businessName, phoneNumbers } = useSettings();
const { showToast } = useToast();
const { canGeneratePdf, getRemainingPdfs, incrementPdfCount, isPremium } = useSubscription();
const { shareViaWhatsApp, isCreatingShare } = useShareReport();
const { effectiveBranding } = usePdfBranding();
const appSettingsStore = useAppSettingsStore();
const savedReportsStore = useSavedReportsStore();

const isLoadingReport = ref(true);
const isGeneratingPdf = ref(false);
const reportData = ref<any>(null);
const selectedCategories = ref<any[]>([]);
const reportName = ref<string>('');

const watermarkTextValue = computed(() => appSettingsStore.watermarkText || 'CaterHub');

const totalItems = computed(() => {
  return selectedCategories.value.reduce((total, cat) => total + (cat.items?.length || 0), 0);
});

const goBack = () => {
  router.back();
};

const loadReport = async () => {
  const reportId = route.query.id as string;
  if (!reportId) {
    isLoadingReport.value = false;
    return;
  }

  try {
    // First try to get from store (already fetched)
    const storeReport = savedReportsStore.allReports.find(r => r.id === reportId);
    if (storeReport) {
      reportData.value = storeReport.reportData;
      selectedCategories.value = storeReport.selectedCategories || [];
      reportName.value = storeReport.reportName || '';
      isLoadingReport.value = false;
      return;
    }

    // If not in store, fetch from Firestore
    const reportRef = doc($db, 'savedReports', reportId);
    const reportSnap = await getDoc(reportRef);

    if (reportSnap.exists()) {
      const data = reportSnap.data();
      reportData.value = data.reportData || data.userData;
      selectedCategories.value = data.selectedCategories || data.selectedData || [];
      reportName.value = data.reportName || '';
    }
  } catch (error) {
    console.error('Error loading report:', error);
    showToast('Failed to load report', 'danger', 3000);
  } finally {
    isLoadingReport.value = false;
  }
};

const generatePdf = async () => {
  if (!reportData.value) return;

  // Check PDF limit
  const canGenerate = await canGeneratePdf();
  if (!canGenerate) {
    showToast(
      `PDF limit reached! Upgrade to Premium for unlimited PDFs.`,
      'warning',
      4000
    );
    navigateTo('/subscription');
    return;
  }

  isGeneratingPdf.value = true;

  try {
    if (process.client) {
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      const html2pdf = (await import('html2pdf.js')).default;
      const content = document.getElementById('pdfSection');

      if (!content) {
        throw new Error('PDF section not found');
      }

      // Temporarily make visible for html2canvas to capture
      content.style.display = 'block';

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 300));

      // Use report name for PDF filename, fallback to customer name + date
      const pdfName = reportName.value || `${reportData.value.name}-${reportData.value.date}`;
      const fileName = `${pdfName}.pdf`;
      const folderName = 'Catering App';

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

      // Check if we're running on a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        // Generate PDF as blob for mobile
        const pdfBlob = await html2pdf()
          .from(content)
          .set(pdfOptions)
          .toPdf()
          .output('blob');

        // Hide the PDF section again
        content.style.display = 'none';

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(pdfBlob);
        await new Promise((resolve) => {
          reader.onloadend = async () => {
            const base64Data = reader.result as string;
            const base64String = base64Data.split(',')[1];

            try {
              // Save to custom folder in Documents directory
              await Filesystem.writeFile({
                path: `${folderName}/${fileName}`,
                data: base64String,
                directory: Directory.Documents,
                recursive: true,
              });

              showToast(
                `PDF Saved Successfully!\nLocation: Documents/${folderName}/\nFile: ${fileName}`,
                'success',
                5000
              );

              resolve(true);
            } catch {
              // Fallback to browser download if filesystem fails
              const url = URL.createObjectURL(pdfBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = fileName;
              link.click();
              URL.revokeObjectURL(url);

              showToast('PDF Downloaded to Downloads folder', 'success', 3000);

              resolve(true);
            }
          };
        });
      } else {
        // For web/desktop, use regular download
        await html2pdf()
          .from(content)
          .set(pdfOptions)
          .toPdf()
          .save(fileName);

        // Hide the PDF section again
        content.style.display = 'none';

        showToast('PDF Downloaded Successfully!', 'success', 3000);
      }

      // Increment PDF count for free users
      await incrementPdfCount();
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    // Hide the PDF section if there was an error
    const content = document.getElementById('pdfSection');
    if (content) {
      content.style.display = 'none';
    }
    showToast('Failed to generate PDF', 'danger', 3000);
  } finally {
    isGeneratingPdf.value = false;
  }
};

const shareOnWhatsApp = async () => {
  if (!reportData.value) return;

  const success = await shareViaWhatsApp(reportData.value, selectedCategories.value);

  if (success) {
    showToast('Opening WhatsApp...', 'success', 1500);
  }
};

onMounted(async () => {
  await appSettingsStore.fetchSettings();
  await loadReport();
});
</script>

<style>
/* Global styles for PDF generation - NOT scoped */
#pdfSection {
  font-family: Arial, sans-serif;
  width: 205mm;
  max-width: 205mm;
  background: white;
  padding: 10px;
  box-sizing: border-box;
  overflow: hidden;
  margin: 0 auto;
}

#pdfSection .pdf-header {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 3px solid #333;
  padding-bottom: 15px;
}

#pdfSection .pdf-logo {
  max-width: 200px;
  max-height: 80px;
  margin-bottom: 10px;
  object-fit: contain;
}

#pdfSection .pdf-header h2 {
  margin: 0;
  font-size: 28px;
  color: #333;
  font-weight: bold;
}

#pdfSection .pdf-header p {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #555;
}

#pdfSection .pdf-tagline {
  font-style: italic;
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #666;
}

#pdfSection .pdf-address {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #666;
}

#pdfSection .pdf-info-box {
  margin-bottom: 25px;
  border: 2px solid #ddd;
  padding: 10px;
  border-radius: 8px;
  background: #fafafa;
}

#pdfSection .pdf-info-table {
  width: 100%;
  border-collapse: collapse;
}

#pdfSection .pdf-info-table td {
  padding: 6px 0;
  font-size: 15px;
}

#pdfSection .pdf-info-table td strong {
  color: #333;
}

#pdfSection .pdf-info-table td span {
  color: #000;
}

#pdfSection .pdf-category {
  margin: 20px 0;
  page-break-inside: avoid;
}

#pdfSection .pdf-category-name {
  background-color: transparent;
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

#pdfSection .pdf-items {
  margin-left: 10px;
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
}

#pdfSection .pdf-item {
  display: inline-block;
  background-color: #f4f5f8;
  background: #f4f5f8;
  padding: 6px 12px;
  border-radius: 15px;
  margin: 4px;
  border: 1px solid #ddd;
  color: #000000;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 8px);
}

/* Full Page Background Watermark for Free Users */
#pdfSection {
  position: relative;
  min-height: 100%;
}

#pdfSection .pdf-watermark-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

#pdfSection .pdf-watermark-bg .watermark-text {
  font-size: 48px;
  font-weight: 800;
  color: rgba(102, 126, 234, 0.1);
  white-space: nowrap;
  transform: rotate(-30deg);
  user-select: none;
  letter-spacing: 15px;
  margin: 40px 0;
  text-align: center;
  width: 200%;
  margin-left: -50%;
}

#pdfSection .pdf-content-wrapper {
  position: relative;
  z-index: 1;
}
</style>

<style scoped>
.gradient-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
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

.preview-container {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-header {
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 3px solid #667eea;
}

.preview-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: #667eea;
}

.preview-header .preview-phone {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 0.9rem;
}

.preview-info-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
}

.preview-info-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.preview-info-row:last-child {
  border-bottom: none;
}

.preview-info-row.single {
  display: block;
}

.preview-info-cell {
  flex: 1;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.preview-info-cell:not(:last-child) {
  border-right: 1px solid #f0f0f0;
}

.preview-info-row.single .preview-info-cell {
  border-right: none;
}

.preview-info-cell.full {
  flex: none;
  width: 100%;
}

.preview-info-cell .label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  font-weight: 500;
}

.preview-info-cell .value {
  font-size: 0.9rem;
  color: #1a1a1a;
  font-weight: 500;
}

.preview-info-cell .value.price {
  color: #4CAF50;
  font-weight: 600;
}

.preview-items-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  padding: 14px;
}

.preview-items-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.preview-items-header .items-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
}

.preview-items-header .items-count {
  font-size: 0.8rem;
  color: #667eea;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
}

.preview-categories {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-category {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-category .category-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #667eea;
  font-weight: 600;
}

.preview-category .category-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preview-category .item-tag {
  display: inline-block;
  padding: 5px 10px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #333;
}

.preview-actions {
  display: flex;
  gap: 12px;
  padding-top: 8px;
}

.preview-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.preview-btn.pdf-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.preview-btn.pdf-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.preview-btn.whatsapp-btn {
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
}

.preview-btn.whatsapp-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
}

.preview-btn ion-icon {
  font-size: 20px;
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

.back-btn {
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
}

.back-btn:hover {
  transform: translateY(-2px);
}

.back-btn ion-icon {
  font-size: 20px;
}

@media (max-width: 480px) {
  .preview-actions {
    flex-direction: column;
  }
}

/* PDF Generation Loader */
.pdf-loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.pdf-loader-content {
  background: white;
  border-radius: 20px;
  padding: 40px 50px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 320px;
  width: 90%;
}

.pdf-loader-animation {
  margin-bottom: 24px;
}

.pdf-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-doc-icon {
  font-size: 40px;
  color: #667eea;
  animation: pulse-icon 1.5s ease-in-out infinite;
}

.pdf-progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 80px;
  height: 80px;
  border: 3px solid #f0f0f0;
  border-top-color: #667eea;
  border-right-color: #764ba2;
  border-radius: 50%;
  animation: spin-ring 1s linear infinite;
}

@keyframes spin-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse-icon {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.pdf-loader-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pdf-loader-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.pdf-loader-dots {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.pdf-loader-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: bounce-dot 1.4s ease-in-out infinite;
}

.pdf-loader-dots span:nth-child(1) {
  animation-delay: 0s;
}

.pdf-loader-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.pdf-loader-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce-dot {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
