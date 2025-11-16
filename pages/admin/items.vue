<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="admin-container">
        <div class="page-header">
          <h2>Item Management</h2>
          <ion-button color="primary" @click="openAddItemModal">
            <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>
            Add Item
          </ion-button>
        </div>

        <!-- Filter by Category -->
        <div class="filter-section">
          <h3 class="filter-title">Filter by Category</h3>
          <div class="category-scroll-container">
            <div class="category-chips">
              <div
                class="category-chip"
                :class="{ 'active': selectedCategoryFilter === 'all' }"
                @click="selectCategory('all')"
              >
                <ion-icon :icon="appsOutline"></ion-icon>
                <span>All Items</span>
              </div>
              <div
                v-for="category in data"
                :key="category.id"
                class="category-chip"
                :class="{ 'active': selectedCategoryFilter === String(category.id) }"
                @click="selectCategory(String(category.id))"
              >
                <ion-icon :icon="restaurantOutline"></ion-icon>
                <span>{{ category.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Items List -->
        <div class="items-list">
          <ion-card v-for="item in filteredItems" :key="`${item.categoryId}-${item.id}`" class="item-card">
            <ion-card-content>
              <div class="item-header">
                <div class="item-info">
                  <h3>{{ item.name }}</h3>
                  <ion-badge color="primary">{{ item.categoryName }}</ion-badge>
                </div>
                <div class="item-actions">
                  <ion-button fill="clear" color="primary" @click="editItem(item)">
                    <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" color="danger" @click="confirmDelete(item)">
                    <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <div v-if="filteredItems.length === 0" class="empty-state">
            <p>No items found</p>
          </div>
        </div>

        <!-- Add/Edit Item Modal -->
        <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
          <ion-header>
            <ion-toolbar class="gradient-toolbar">
              <ion-title>{{ isEditMode ? 'Edit Item' : 'Add Item' }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closeModal">
                  <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div class="form-content">
              <div class="input-group">
                <label class="input-label">Category</label>
                <div class="input-wrapper">
                  <ion-icon :icon="folderOutline" class="input-icon"></ion-icon>
                  <select v-model="itemForm.categoryId" class="custom-select">
                    <option value="">Select Category</option>
                    <option v-for="category in data" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">Item Name</label>
                <div class="input-wrapper">
                  <ion-icon :icon="fastFoodOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="itemForm.name"
                    type="text"
                    class="custom-input"
                    placeholder="Enter item name"
                  />
                </div>
              </div>

              <div v-if="errorMessage" class="error-message">
                <ion-icon :icon="alertCircleOutline"></ion-icon>
                <span>{{ errorMessage }}</span>
              </div>

              <ion-button expand="block" color="primary" @click="saveItem" class="save-button">
                <ion-icon slot="start" :icon="checkmarkCircleOutline"></ion-icon>
                {{ isEditMode ? 'Update Item' : 'Add Item' }}
              </ion-button>
            </div>
          </ion-content>
        </ion-modal>

        <!-- Delete Confirmation Modal -->
        <ion-modal :is-open="isDeleteModalOpen" @didDismiss="closeDeleteModal">
          <ion-header>
            <ion-toolbar class="gradient-toolbar">
              <ion-title>Confirm Delete</ion-title>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div class="delete-content">
              <div class="warning-icon-wrapper">
                <ion-icon :icon="warningOutline" class="warning-icon"></ion-icon>
              </div>
              <h3>Delete Item?</h3>
              <p>Are you sure you want to delete "{{ itemToDelete?.name }}"?</p>
              <div class="delete-actions">
                <ion-button expand="block" fill="outline" @click="closeDeleteModal">
                  Cancel
                </ion-button>
                <ion-button expand="block" color="danger" @click="deleteItem">
                  <ion-icon slot="start" :icon="trashOutline"></ion-icon>
                  Delete
                </ion-button>
              </div>
            </div>
          </ion-content>
        </ion-modal>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonBadge,
} from '@ionic/vue';
import {
  addCircleOutline,
  createOutline,
  trashOutline,
  closeOutline,
  folderOutline,
  fastFoodOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  warningOutline,
  appsOutline,
  restaurantOutline,
} from 'ionicons/icons';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '~/firebase';

definePageMeta({
  middleware: 'admin',
});

const categoriesStore = useCategoriesStore();
const data = computed(() => categoriesStore.allCategories);
const { showToast } = useToast();

const isModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isEditMode = ref(false);
const errorMessage = ref('');
const selectedCategoryFilter = ref('all');
const itemToDelete = ref<any>(null);

const itemForm = ref({
  id: null as number | null,
  categoryId: null as number | null,
  name: '',
  image: null,
});

// Flatten all items with category info
const allItems = computed(() => {
  const items: any[] = [];
  data.value.forEach((category: any) => {
    category.items.forEach((item: any) => {
      items.push({
        ...item,
        categoryId: category.id,
        categoryName: category.name,
      });
    });
  });
  return items;
});

// Filter items based on selected category
const filteredItems = computed(() => {
  if (selectedCategoryFilter.value === 'all') {
    return allItems.value;
  }
  return allItems.value.filter(item => String(item.categoryId) === selectedCategoryFilter.value);
});

const filterChanged = (event: any) => {
  selectedCategoryFilter.value = event.detail.value;
};

const selectCategory = (categoryId: string) => {
  selectedCategoryFilter.value = categoryId;
};

const openAddItemModal = () => {
  isEditMode.value = false;
  itemForm.value = { id: null, categoryId: null, name: '', image: null };
  errorMessage.value = '';
  isModalOpen.value = true;
};

const editItem = (item: any) => {
  isEditMode.value = true;
  itemForm.value = {
    id: item.id,
    categoryId: item.categoryId,
    name: item.name,
    image: item.image,
  };
  errorMessage.value = '';
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  itemForm.value = { id: null, categoryId: null, name: '', image: null };
  errorMessage.value = '';
};

const saveItem = async () => {
  if (!itemForm.value.categoryId) {
    errorMessage.value = 'Please select a category';
    return;
  }
  if (!itemForm.value.name.trim()) {
    errorMessage.value = 'Please enter an item name';
    return;
  }

  try {
    // Find the category in Firestore
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('id', '==', itemForm.value.categoryId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      errorMessage.value = 'Category not found';
      return;
    }

    const categoryDoc = querySnapshot.docs[0];
    const categoryData = categoryDoc.data();
    let items = categoryData.items || [];

    if (isEditMode.value) {
      // Update existing item
      const itemIndex = items.findIndex((item: any) => item.id === itemForm.value.id);
      if (itemIndex !== -1) {
        items[itemIndex] = {
          id: itemForm.value.id,
          name: itemForm.value.name,
          image: itemForm.value.image,
        };
      }
      showToast('Item updated successfully', 'success', 2000);
    } else {
      // Add new item
      const maxId = items.length > 0 ? Math.max(...items.map((i: any) => i.id)) : 0;
      items.push({
        id: maxId + 1,
        name: itemForm.value.name,
        image: itemForm.value.image,
      });
      showToast('Item added successfully', 'success', 2000);
    }

    // Update the category with new items
    await updateDoc(doc(db, 'categories', categoryDoc.id), {
      items: items,
      updatedAt: new Date(),
    });

    await categoriesStore.refreshCategories();
    closeModal();
  } catch (error) {
    console.error('Error saving item:', error);
    errorMessage.value = 'Failed to save item';
  }
};

const confirmDelete = (item: any) => {
  itemToDelete.value = item;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  itemToDelete.value = null;
};

const deleteItem = async () => {
  if (!itemToDelete.value) return;

  try {
    // Find the category in Firestore
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('id', '==', itemToDelete.value.categoryId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const categoryDoc = querySnapshot.docs[0];
      const categoryData = categoryDoc.data();
      let items = categoryData.items || [];

      // Remove the item
      items = items.filter((item: any) => item.id !== itemToDelete.value.id);

      // Update the category
      await updateDoc(doc(db, 'categories', categoryDoc.id), {
        items: items,
        updatedAt: new Date(),
      });

      showToast('Item deleted successfully', 'success', 2000);
      await categoriesStore.refreshCategories();
    }

    closeDeleteModal();
  } catch (error) {
    console.error('Error deleting item:', error);
    showToast('Failed to delete item', 'error', 2000);
  }
};
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 28px;
  margin: 0;
  color: #333;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.category-scroll-container {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #667eea #f0f0f0;
}

.category-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.category-scroll-container::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

.category-scroll-container::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 3px;
}

.category-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #5568d3;
}

.category-chips {
  display: flex;
  gap: 12px;
  padding: 4px 0 12px 0;
  min-width: min-content;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  user-select: none;
}

.category-chip ion-icon {
  font-size: 18px;
  color: #666;
  transition: color 0.3s ease;
}

.category-chip span {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: color 0.3s ease;
}

.category-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.category-chip:hover ion-icon {
  color: #667eea;
}

.category-chip.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.category-chip.active ion-icon,
.category-chip.active span {
  color: white;
}

.category-chip:active {
  transform: scale(0.98);
}

.items-list {
  display: grid;
  gap: 16px;
}

.item-card {
  margin: 0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-info h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  color: #333;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.gradient-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

.form-content {
  max-width: 500px;
  margin: 0 auto;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px 16px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  background: white;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.input-icon {
  font-size: 22px;
  color: #667eea;
  margin-right: 12px;
}

.custom-input,
.custom-select {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.custom-input::placeholder {
  color: #999;
}

.custom-select {
  cursor: pointer;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fee;
  color: #eb445a;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
}

.save-button {
  height: 48px;
  font-weight: 600;
  font-size: 16px;
  margin-top: 24px;
}

.delete-content {
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}

.warning-icon-wrapper {
  margin-bottom: 16px;
}

.warning-icon {
  font-size: 64px;
  color: #eb445a;
}

.delete-content h3 {
  font-size: 1.5rem;
  margin: 0 0 12px 0;
  color: #333;
}

.delete-content p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 24px;
}

.delete-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.delete-actions ion-button {
  height: 48px;
  font-weight: 600;
}
</style>
