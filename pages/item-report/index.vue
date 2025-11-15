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
          <ion-card>
            <ion-card-header>
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
        <div class="action-buttons ion-margin-top">
          <ion-button expand="block" @click="onToggleDialog">
            <ion-icon slot="start" :icon="createOutline"></ion-icon>
            Edit User Info
          </ion-button>
          <ion-button expand="block" color="success" @click="getPDF">
            <ion-icon slot="start" :icon="downloadOutline"></ion-icon>
            Generate PDF
          </ion-button>
          <ion-button expand="block" color="tertiary" @click="toggleAddItemDialog">
            <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>
            Add New Item
          </ion-button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state ion-text-center">
        <ion-chip @click="onGotoHome" class="empty-chip">
          <ion-label>Please Add Items</ion-label>
        </ion-chip>
      </div>

      <!-- User Info Modal -->
      <ion-modal :is-open="isShowDialog" @didDismiss="onUserModalDismiss">
        <ion-header>
          <ion-toolbar>
            <ion-title>User Profile</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeUserDialog">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-input label="Enter Name" label-placement="floating" v-model="userFormData.name" required></ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Phone Number" label-placement="floating" type="tel" v-model="userFormData.phone"
              required></ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Number of People" label-placement="floating" type="number"
              v-model="userFormData.noOfPeople" required></ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Date" label-placement="floating" type="date" v-model="userFormData.date"
              required></ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Address" label-placement="floating" v-model="userFormData.address" required></ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Price" label-placement="floating" type="number" v-model="userFormData.price"
              required></ion-input>
          </ion-item>
          <ion-item>
            <ion-select label="Select Shift" label-placement="floating" v-model="userFormData.shift">
              <ion-select-option value="Morning">Morning</ion-select-option>
              <ion-select-option value="Afternoon">Afternoon</ion-select-option>
              <ion-select-option value="Night">Night</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-chip v-if="errorMessage" color="danger" class="ion-margin-top">
            <ion-label>{{ errorMessage }}</ion-label>
          </ion-chip>

          <ion-button expand="block" class="ion-margin-top" @click="onAddUser">
            Save
          </ion-button>
        </ion-content>
      </ion-modal>

      <!-- Loading -->
      <ion-loading
        :is-open="isLoading"
        message="Generating PDF..."
        spinner="crescent"
        :backdrop-dismiss="false"
        css-class="custom-loading"
      ></ion-loading>

      <!-- Add New Item Modal -->
      <ion-modal :is-open="isShowAddItemDialog" @didDismiss="onAddItemModalDismiss">
        <ion-header>
          <ion-toolbar>
            <ion-title>Add New Item</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeAddItemDialog">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div v-for="(category, mainIndex) of newItemFormData" :key="category.id">
            <ion-item>
              <ion-input :label="`Category ${mainIndex + 1}`" label-placement="floating" v-model="category.name"
                :disabled="isEditMode"></ion-input>
            </ion-item>

            <div v-for="(subItem, index) of category.items" :key="subItem.id">
              <ion-item>
                <ion-input :label="`Item ${index + 1}`" label-placement="floating" v-model="subItem.name"
                  :disabled="subItem?.disable"></ion-input>
              </ion-item>
            </div>

            <ion-button fill="outline" @click="onAddNewItem('subItem', category.items)">
              <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>
              Add Sub Item
            </ion-button>
          </div>

          <ion-button v-if="!isEditMode" expand="block" class="ion-margin-top" @click="onAddNewItem('category')">
            <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>
            Add Category
          </ion-button>

          <ion-button expand="block" color="success" class="ion-margin-top" @click="onSaveData">
            Save
          </ion-button>
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
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonLoading,
} from '@ionic/vue';
import {
  closeCircle,
  createOutline,
  downloadOutline,
  addCircleOutline,
} from 'ionicons/icons';
import { uuid } from 'vue-uuid';
import { Filesystem, Directory } from '@capacitor/filesystem';

const NAMESPACE = '65f9af5d-f23f-4065-ac85-da725569fdcd';
const { businessName, phoneNumbers } = useSettings();
const { showToast } = useToast();
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);
const isShowAddItemDialog = ref(false);
const selectedDataFromStorage = ref<any>(null);
const selectedTableFromStorage = ref<any>(null);
const isChipClosable = ref(true);
const isShowDialog = ref(false);
const isEditMode = ref(false);

const userData = ref({
  name: null,
  phone: null,
  noOfPeople: null,
  date: null,
  address: null,
  price: null,
  shift: null,
});

const userFormData = ref({
  name: null,
  phone: null,
  noOfPeople: null,
  date: null,
  address: null,
  price: null,
  shift: null,
});

const newItemFormData = ref([{ id: uuid.v4(), name: null, items: [] }]);

onMounted(() => {
  selectedDataFromStorage.value =
    JSON.parse(localStorage.getItem('selectedData') || '[]');
  selectedTableFromStorage.value =
    JSON.parse(localStorage.getItem('selectedTable') || 'null');
  if (localStorage.getItem('userData')) {
    userData.value = JSON.parse(localStorage.getItem('userData')!);
  }
  userFormData.value = { ...userFormData.value, ...userData.value };
});

const getPDF = async () => {
  try {
    if (!Object.values(userData.value).every((value) => value)) {
      return onToggleDialog();
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
              console.error('Filesystem error:', fsError);
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
    console.log('PDF generate error:', error);
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

const onGotoHome = () => navigateTo('/');

const removeItem = (itemId: string, categoryId: number) => {
  const categoryIndex = selectedDataFromStorage.value.findIndex(
    (item: any) => item.id === categoryId
  );
  if (categoryIndex != -1) {
    const itemIndex = selectedDataFromStorage.value[
      categoryIndex
    ].items.findIndex((item: any) => item.id === itemId);
    if (itemIndex != -1) {
      if (selectedDataFromStorage.value[categoryIndex].items.length === 1) {
        selectedDataFromStorage.value.splice(categoryIndex, 1);
      } else {
        selectedDataFromStorage.value[categoryIndex].items.splice(itemIndex, 1);
      }
      localStorage.setItem(
        'selectedData',
        JSON.stringify(selectedDataFromStorage.value)
      );
    }
  }
};

const onAddUser = () => {
  if (!Object.values(userFormData.value).every((value) => value)) {
    return (errorMessage.value = 'Please Fill All Fields!');
  }
  localStorage.setItem('userData', JSON.stringify(userFormData.value));
  userData.value = { ...userFormData.value };
  closeUserDialog();
};

const onToggleDialog = () => {
  isShowDialog.value = true;
};

const closeUserDialog = () => {
  isShowDialog.value = false;
};

const onUserModalDismiss = () => {
  userFormData.value = { ...userFormData.value, ...userData.value };
  errorMessage.value = null;
};

const removeTable = () => {
  localStorage.removeItem('selectedTable');
  selectedTableFromStorage.value = null;
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
  if (isEditMode.value) {
    selectedDataFromStorage.value.forEach((item: any) => {
      if (
        newItemFormData.value.length &&
        item.id === newItemFormData.value[0].id
      ) {
        item.items = newItemFormData.value[0].items;
      }
    });
  } else {
    selectedDataFromStorage.value = [
      ...selectedDataFromStorage.value,
      ...newItemFormData.value.filter((category: any) => category.items.length),
    ];
  }

  localStorage.setItem(
    'selectedData',
    JSON.stringify(selectedDataFromStorage.value)
  );
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

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.empty-state {
  padding: 64px 16px;
}

.empty-chip {
  font-size: 1.5rem;
  padding: 32px;
  cursor: pointer;
}
</style>

<style>
/* Global styles for loading overlay - NOT scoped */
ion-loading.custom-loading {
  --backdrop-opacity: 1;
  --background: #ffffff;
  --spinner-color: #3880ff;
}

ion-loading.custom-loading::part(backdrop) {
  background: #ffffff !important;
  opacity: 1 !important;
}

ion-loading.custom-loading {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 99999 !important;
  
}
</style>
