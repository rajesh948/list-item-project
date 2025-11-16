<template>
  <ion-page>
    <ion-content class="ion-padding">
      <!-- Hidden PDF Section (Plain HTML for PDF generation) -->
      <div id="pdfSection" style="display: none;">
        <div class="pdf-header">
          <h2>{{ businessName }}</h2>
          <p>{{ phoneNumbers }}</p>
        </div>

        <div class="pdf-info-box">
          <table class="pdf-info-table">
            <tbody>
              <tr>
                <td style="width: 45%;"><strong>Name:</strong> <span>{{ userData.name }}</span></td>
                <td style="width: 25%;"><strong>Date:</strong> <span>{{ userData.date }}</span></td>
                <td style="width: 30%;"><strong>People:</strong> <span>{{ userData.noOfPeople }}</span></td>
              </tr>
              <tr>
                
                <td><strong>Phone:</strong> <span>{{ userData.phone }}</span></td>
                <td><strong>Shift:</strong> <span>{{ userData.shift }}</span></td>
                <td><strong>Price:</strong> <span>{{ userData.price }}</span></td>
              </tr>

              <tr>
                <td colspan="3"><strong>Address:</strong> <span>{{ userData.address }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table Decoration -->
        <div v-if="selectedTableFromStorage" class="pdf-decoration">
          <h4>Dish Table Decoration</h4>
          <div class="pdf-decoration-chip">
            {{ selectedTableFromStorage.name }}
          </div>
        </div>

        <!-- Selected Items by Category -->
        <div v-for="category in selectedDataFromStorage" :key="category.name" class="pdf-category">
          <div class="pdf-category-name">
            {{ category.name }}
          </div>
          <div class="pdf-items">
            <span v-for="item in category.items" :key="item.name" class="pdf-item">
              {{ item.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Report Content (Visible on screen) -->
      <div v-if="selectedDataFromStorage?.length" class="report-container">
        <div class="pdf-section">
          <!-- User Info Card -->
          <ion-card class="user-info-card">
            <ion-card-header>
              <ion-button
                v-if="!isViewMode"
                fill="clear"
                class="edit-icon-btn"
                @click="editUserData"
              >
                <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
              </ion-button>
              <ion-card-title class="ion-text-center">
                <h2>{{ businessName }}</h2>
                <p class="phone-numbers">{{ phoneNumbers }}</p>
              </ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-grid>
                <ion-row>
                  <ion-col size="8"><strong>Name:</strong> {{ userData.name }}</ion-col>
                  <ion-col size="4"><strong>Date:</strong> {{ userData.date }}</ion-col>
                </ion-row>
                <ion-row>
                  <ion-col size="8"><strong>Address:</strong> {{ userData.address }}</ion-col>
                  <ion-col size="4"><strong>People:</strong> {{ userData.noOfPeople }}</ion-col>
                </ion-row>
                <ion-row>
                  <ion-col size="4"><strong>Phone:</strong> {{ userData.phone }}</ion-col>
                  <ion-col size="4"><strong>Shift:</strong> {{ userData.shift }}</ion-col>
                  <ion-col size="4"><strong>Price:</strong> {{ userData.price }}</ion-col>
                </ion-row>
              </ion-grid>
            </ion-card-content>
          </ion-card>

          <!-- Table Decoration -->
          <div v-if="selectedTableFromStorage" class="ion-margin-top">
            <h4>Dish Table Decoration</h4>
            <ion-chip color="primary">
              <ion-label>{{ selectedTableFromStorage.name }}</ion-label>
              <ion-icon v-if="isChipClosable" :icon="closeCircle" @click="removeTable"></ion-icon>
            </ion-chip>
          </div>

          <!-- Selected Items by Category -->
          <div v-for="category in selectedDataFromStorage" :key="category.name" class="category-section ion-margin-top">
            <ion-chip color="success" outline>
              <ion-label>
                <h4>{{ category.name }}</h4>
              </ion-label>
            </ion-chip>
            <div class="items-wrap">
              <ion-chip v-for="item in category.items" :key="item.name" class="item-chip">
                <ion-label>{{ item.name }}</ion-label>
                <ion-icon v-if="isChipClosable" :icon="closeCircle"
                  @click="removeItem(item.id, category.id)"></ion-icon>
              </ion-chip>
              <ion-button v-if="isChipClosable" fill="clear" @click="editCategoryItems(category)">
                <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
              </ion-button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="!isViewMode" class="action-buttons-grid">
          <button class="action-card add-item-card" @click="toggleAddItemDialog">
            <div class="action-icon">
              <ion-icon :icon="addCircleOutline"></ion-icon>
            </div>
            <div class="action-content">
              <h3>Add New Item</h3>
              <p>Add categories and items to the list</p>
            </div>
          </button>

          <button class="action-card save-report-card" @click="handleSaveReport">
            <div class="action-icon">
              <ion-icon :icon="saveOutline"></ion-icon>
            </div>
            <div class="action-content">
              <h3>Save Report</h3>
              <p>Save this report for later</p>
            </div>
          </button>

          <button class="action-card generate-pdf-card" @click="getPDF">
            <div class="action-icon">
              <ion-icon :icon="downloadOutline"></ion-icon>
            </div>
            <div class="action-content">
              <h3>Generate PDF</h3>
              <p>Download the complete report</p>
            </div>
          </button>
        </div>

        <!-- View Mode Action Buttons -->
        <div v-else class="action-buttons-grid">
          <button class="action-card generate-pdf-card" @click="getPDF">
            <div class="action-icon">
              <ion-icon :icon="downloadOutline"></ion-icon>
            </div>
            <div class="action-content">
              <h3>Generate PDF</h3>
              <p>Download the complete report</p>
            </div>
          </button>

          <button class="action-card load-report-card" @click="loadReportData">
            <div class="action-icon">
              <ion-icon :icon="createOutline"></ion-icon>
            </div>
            <div class="action-content">
              <h3>Load Report Data</h3>
              <p>Edit this report</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state ion-text-center">
        <ion-chip @click="onGotoHome" class="empty-chip">
          <ion-label>Please Add Items</ion-label>
        </ion-chip>
      </div>

      <!-- Loading -->
      <AppLoader :show="isLoading" message="Generating PDF..." />

      <!-- Add New Item Modal -->
      <ion-modal :is-open="isShowAddItemDialog" @didDismiss="onAddItemModalDismiss" class="add-item-modal">
        <ion-header>
          <ion-toolbar class="gradient-toolbar">
            <ion-title>{{ isEditMode ? 'Edit Items' : 'Add New Item' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeAddItemDialog">
                <ion-icon slot="icon-only" :icon="closeCircle"></ion-icon>
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding add-item-modal-content">
          <div class="add-item-content">
            <div class="add-item-header">
              <ion-icon :icon="listOutline" class="add-item-icon"></ion-icon>
              <h2>{{ isEditMode ? 'Edit Category Items' : 'Create New Category' }}</h2>
              <p class="help-text">Add categories and their items to organize your menu</p>
            </div>

            <div class="categories-list">
              <div v-for="(category, mainIndex) of newItemFormData" :key="category.id" class="category-block">
                <div class="category-header-block">
                  <ion-icon :icon="restaurantOutline" class="category-icon"></ion-icon>
                  <h3>Category {{ mainIndex + 1 }}</h3>
                </div>

                <div class="input-group">
                  <label class="input-label">Category Name</label>
                  <div class="input-wrapper">
                    <ion-icon :icon="folderOutline" class="input-icon"></ion-icon>
                    <input
                      v-model="category.name"
                      type="text"
                      class="item-input"
                      placeholder="Enter category name"
                      :disabled="isEditMode"
                    />
                  </div>
                </div>

                <div class="items-section">
                  <div class="items-header">
                    <h4>Items</h4>
                    <button class="add-sub-btn" @click="onAddNewItem('subItem', category.items)">
                      <ion-icon :icon="addCircleOutline"></ion-icon>
                      Add Item
                    </button>
                  </div>

                  <div v-for="(subItem, index) of category.items" :key="subItem.id" class="input-group">
                    <label class="input-label">Item {{ index + 1 }}</label>
                    <div class="input-wrapper">
                      <ion-icon :icon="fastFoodOutline" class="input-icon"></ion-icon>
                      <input
                        v-model="subItem.name"
                        type="text"
                        class="item-input"
                        placeholder="Enter item name"
                        :disabled="subItem?.disable"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button v-if="!isEditMode" class="secondary-button" @click="onAddNewItem('category')">
                <ion-icon :icon="addCircleOutline"></ion-icon>
                Add Another Category
              </button>

              <ion-button expand="block" color="primary" @click="onSaveData" class="save-button">
                <ion-icon slot="start" :icon="checkmarkCircleOutline"></ion-icon>
                Save All
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonLabel,
  IonIcon,
  IonButton,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/vue';
import {
  closeCircle,
  createOutline,
  downloadOutline,
  addCircleOutline,
  checkmarkCircleOutline,
  listOutline,
  restaurantOutline,
  folderOutline,
  fastFoodOutline,
  saveOutline,
} from 'ionicons/icons';
import { uuid } from 'vue-uuid';
import { Filesystem, Directory } from '@capacitor/filesystem';

// Authentication is handled by global middleware (02-redirect-login.global.ts)

const NAMESPACE = '65f9af5d-f23f-4065-ac85-da725569fdcd';
const { businessName, phoneNumbers } = useSettings();
const { showToast } = useToast();
const { saveReport } = useSavedReports();
const userStore = useUserStore();
const reportStore = useReportStore();
const route = useRoute();
const router = useRouter();
const isLoading = ref(false);
const isShowAddItemDialog = ref(false);
const isViewMode = computed(() => route.query.mode === 'view');
const isChipClosable = computed(() => !isViewMode.value);
const isEditMode = ref(false);

// Use view mode data or current working data
const selectedDataFromStorage = computed(() =>
  isViewMode.value ? reportStore.viewModeCategories : reportStore.selectedCategories
);
const selectedTableFromStorage = computed(() =>
  isViewMode.value ? reportStore.viewModeTable : reportStore.selectedTable
);
const userData = computed(() =>
  isViewMode.value ? reportStore.viewModeUserData : reportStore.userData
);

const newItemFormData = ref([{ id: uuid.v4(), name: null, items: [] }]);

onMounted(() => {
  // Load from localStorage into store on mount
  reportStore.loadFromLocalStorage();
});

// Watch for route changes and clear view mode data when leaving view mode
watch(() => route.query.mode, (newMode, oldMode) => {
  if (oldMode === 'view' && newMode !== 'view') {
    reportStore.clearViewModeData();
  }
});

const getPDF = async () => {
  try {
    if (!Object.values(userData.value).every((value) => value)) {
      showToast('Please fill in event details first', 'warning', 2000);
      setTimeout(() => {
        navigateTo('/event-details');
      }, 500);
      return;
    }

    isLoading.value = true;
    isChipClosable.value = false;

    if (process.client) {
      // Wait a bit for Ionic components to fully render
      await new Promise(resolve => setTimeout(resolve, 500));

      const html2pdf = (await import('html2pdf.js')).default;
      const content = document.getElementById('pdfSection');

      if (!content) {
        throw new Error('PDF section not found');
      }

      // Temporarily make visible for html2canvas to capture
      content.style.display = 'block';

      // Wait a bit more for rendering
      await new Promise(resolve => setTimeout(resolve, 300));

      const fileName = `${userData.value.name}-${userData.value.date}.pdf`;
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
                recursive: true, // Create folder if it doesn't exist
              });

              // Show success message with folder location
              showToast(
                `PDF Saved Successfully!\nLocation: Documents/${folderName}/\nFile: ${fileName}`,
                'success',
                5000
              );

              resolve(true);
            } catch (fsError) {
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

      isLoading.value = false;
      isChipClosable.value = true;

      // Navigate to home after showing the message
      setTimeout(() => {
        navigateTo('/');
      }, 500);
    }
  } catch (error) {
    isLoading.value = false;
    isChipClosable.value = true;

    // Hide the PDF section if there was an error
    const content = document.getElementById('pdfSection');
    if (content) {
      content.style.display = 'none';
    }

    // Show error message
    showToast('PDF Download Failed. Please try again.', 'error', 3000);
  }
};

const handleSaveReport = async () => {
  try {
    if (!Object.values(userData.value).every((value) => value)) {
      showToast('Please fill in event details first', 'warning', 2000);
      setTimeout(() => {
        navigateTo('/event-details');
      }, 500);
      return;
    }

    if (!userStore.user) {
      showToast('Please login to save reports', 'error', 2000);
      return;
    }

    isLoading.value = true;

    const result = await saveReport(
      userStore.user.uid,
      userStore.user.username || 'User',
      userData.value as any,
      selectedDataFromStorage.value || [],
      selectedTableFromStorage.value
    );

    isLoading.value = false;

    if (result.success) {
      showToast('Report saved successfully!', 'success', 2000);
    } else {
      showToast(result.error || 'Failed to save report', 'error', 2000);
    }
  } catch (error) {
    isLoading.value = false;
    showToast('Failed to save report. Please try again.', 'error', 2000);
  }
};

const onGotoHome = () => navigateTo('/');

const removeItem = (itemId: string, categoryId: number) => {
  reportStore.removeItem(itemId, categoryId);
};

const editUserData = () => {
  // Navigate to event details page
  navigateTo('/event-details');
};

const removeTable = () => {
  reportStore.removeTable();
};

const loadReportData = () => {
  // Copy view mode data to working data and exit view mode
  reportStore.loadReportData(
    reportStore.viewModeCategories,
    reportStore.viewModeTable,
    reportStore.viewModeUserData
  );
  reportStore.clearViewModeData();
  router.push('/item-report');
  showToast('Report loaded for editing', 'success', 2000);
};

const toggleAddItemDialog = () => {
  isShowAddItemDialog.value = true;
};

const closeAddItemDialog = () => {
  isShowAddItemDialog.value = false;
};

const onAddItemModalDismiss = () => {
  isEditMode.value = false;
  newItemFormData.value = [{ id: uuid.v4(), name: null, items: [] }];
};

const onSaveData = () => {
  let updatedCategories = [...reportStore.selectedCategories];

  if (isEditMode.value) {
    updatedCategories.forEach((item: any) => {
      if (
        newItemFormData.value.length &&
        item.id === newItemFormData.value[0].id
      ) {
        item.items = newItemFormData.value[0].items;
      }
    });
  } else {
    updatedCategories = [
      ...updatedCategories,
      ...newItemFormData.value.filter((category: any) => category.items.length),
    ];
  }

  reportStore.updateCategories(updatedCategories);
  newItemFormData.value = [{ id: uuid.v4(), name: null, items: [] }];
  isEditMode.value = false;
  closeAddItemDialog();
};

const onAddNewItem = (type: string, item?: any) => {
  if (type === 'subItem') {
    item.push({ id: uuid.v4(), name: null });
  } else if (type === 'category') {
    newItemFormData.value.push({ id: uuid.v4(), name: null, items: [] });
  }
};

const editCategoryItems = (category: any) => {
  if (category?.items?.length) {
    category.items.forEach((item: any) => {
      item['disable'] = true;
    });
  }
  newItemFormData.value = JSON.parse(JSON.stringify([category]));
  toggleAddItemDialog();
  isEditMode.value = true;
};
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

#pdfSection .pdf-decoration {
  margin: 20px 0;
}

#pdfSection .pdf-decoration h4 {
  margin: 10px 0;
  color: #555;
  font-size: 16px;
}

#pdfSection .pdf-decoration-chip {
  display: inline-block;
  background: #3880ff;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  margin: 5px;
  font-size: 14px;
}

#pdfSection .pdf-category {
  margin: 20px 0;
  page-break-inside: avoid;
}

#pdfSection .pdf-category-name {
  background-color: transparent;
  background: transparent;
  color: #2dd36f;
  padding: 5px 10px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 5px;
  font-size: 16px;
  font-weight: bold;
  border: 2px solid #2dd36f;
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
</style>

<style scoped>
.report-container {
  max-width: 800px;
  margin: 0 auto;
}

.pdf-section {
  background: white;
  padding: 16px;
}

.user-info-card {
  position: relative;
}

.edit-icon-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  --color: #667eea;
  --background-hover: rgba(102, 126, 234, 0.1);
}

.edit-icon-btn ion-icon {
  font-size: 24px;
}

.phone-numbers {
  font-size: 0.9rem;
  margin-top: 8px;
}

.category-section {
  margin-top: 16px;
}

.items-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
}

.item-chip {
  font-weight: bold;
}

/* Action Buttons Grid */
.action-buttons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 32px;
}

.action-card {
  position: relative;
  background: white;
  border: none;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transition: height 0.3s ease;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.action-card:hover::before {
  height: 100%;
  opacity: 0.05;
}

.add-item-card::before {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.save-report-card::before {
  background: linear-gradient(135deg, #ffc409 0%, #ff9500 100%);
}

.generate-pdf-card::before {
  background: linear-gradient(135deg, #2dd36f 0%, #1aa251 100%);
}

.load-report-card::before {
  background: linear-gradient(135deg, #3880ff 0%, #1a5cff 100%);
}

.action-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  position: relative;
  z-index: 1;
}

.add-item-card .action-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-report-card .action-icon {
  background: linear-gradient(135deg, #ffc409 0%, #ff9500 100%);
  box-shadow: 0 4px 12px rgba(255, 196, 9, 0.3);
}

.generate-pdf-card .action-icon {
  background: linear-gradient(135deg, #2dd36f 0%, #1aa251 100%);
  box-shadow: 0 4px 12px rgba(45, 211, 111, 0.3);
}

.load-report-card .action-icon {
  background: linear-gradient(135deg, #3880ff 0%, #1a5cff 100%);
  box-shadow: 0 4px 12px rgba(56, 128, 255, 0.3);
}

.action-icon ion-icon {
  font-size: 32px;
  color: white;
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.action-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
}

.action-card p {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.action-card:active {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .action-buttons-grid {
    grid-template-columns: 1fr;
  }

  .action-card {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    padding: 20px;
    gap: 16px;
  }

  .action-icon {
    width: 56px;
    height: 56px;
    margin: 0;
    flex-shrink: 0;
  }

  .action-icon ion-icon {
    font-size: 28px;
  }

  .action-content {
    flex: 1;
    align-items: flex-start;
    text-align: left;
  }

  .action-card h3 {
    margin-bottom: 6px;
    margin-top: 0;
    font-size: 1.1rem;
    text-align: left;
  }

  .action-card p {
    font-size: 0.85rem;
    text-align: left;
    margin: 0;
  }
}

.empty-state {
  padding: 64px 16px;
}

.empty-chip {
  font-size: 1.5rem;
  padding: 32px;
  cursor: pointer;
}

/* Gradient Toolbar */
.gradient-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

/* Add Item Modal Styling */
.add-item-modal-content {
  --background: #f8f9fa;
}

.add-item-content {
  max-width: 700px;
  margin: 0 auto;
}

.add-item-header {
  text-align: center;
  margin-bottom: 32px;
}

.add-item-icon {
  font-size: 64px;
  color: #667eea;
  margin-bottom: 16px;
}

.add-item-content h2 {
  margin: 0 0 8px 0;
  font-size: 1.75rem;
  color: #333;
  font-weight: 700;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-block {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.category-header-block {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.category-icon {
  font-size: 32px;
  color: #667eea;
}

.category-header-block h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
  font-weight: 700;
}

.items-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px dashed #e0e0e0;
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.items-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #666;
  font-weight: 600;
}

.add-sub-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid #667eea;
  color: #667eea;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-sub-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.add-sub-btn ion-icon {
  font-size: 18px;
}

.item-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.item-input::placeholder {
  color: #999;
  font-weight: 400;
}

.item-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 32px;
}

.secondary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 48px;
}

.secondary-button:hover {
  background: rgba(102, 126, 234, 0.05);
}

.secondary-button ion-icon {
  font-size: 22px;
}
</style>
