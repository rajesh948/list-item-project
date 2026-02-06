<template>
  <div class="items-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Menu Items</h1>
        <p class="page-subtitle">{{ filteredItems.length }} items {{ selectedCategoryFilter !== 'all' ? `in ${getSelectedCategoryName}` : 'total' }}</p>
      </div>
      <button class="add-btn" @click="openAddItemModal">
        <ion-icon :icon="addOutline"></ion-icon>
        <span>Add Item</span>
      </button>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-dropdown" @click="toggleCategoryDropdown">
        <ion-icon :icon="filterOutline" class="filter-icon"></ion-icon>
        <span class="selected-category">{{ getSelectedCategoryName }} ({{ selectedCategoryFilter === 'all' ? allItems.length : getCategoryItemCount }})</span>
        <ion-icon :icon="chevronDownOutline" class="dropdown-icon" :class="{ rotated: isCategoryDropdownOpen }"></ion-icon>

        <!-- Custom Dropdown List -->
        <div v-if="isCategoryDropdownOpen" class="dropdown-list">
          <div
            class="dropdown-item"
            :class="{ active: selectedCategoryFilter === 'all' }"
            @click.stop="selectCategoryOption('all')"
          >
            <span class="dropdown-item-name">All Categories</span>
            <span class="dropdown-item-count">{{ allItems.length }}</span>
          </div>
          <div
            v-for="category in data"
            :key="category.id"
            class="dropdown-item"
            :class="{ active: selectedCategoryFilter === String(category.id) }"
            @click.stop="selectCategoryOption(String(category.id))"
          >
            <span class="dropdown-item-name">{{ category.name }}</span>
            <span class="dropdown-item-count">{{ category.items?.length || 0 }}</span>
          </div>
        </div>
      </div>
      <div class="search-box">
        <ion-icon :icon="searchOutline" class="search-icon"></ion-icon>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search items..."
        />
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
          <ion-icon :icon="closeCircleOutline"></ion-icon>
        </button>
      </div>
    </div>

    <!-- Dropdown Overlay -->
    <div v-if="isCategoryDropdownOpen" class="dropdown-overlay" @click="isCategoryDropdownOpen = false"></div>

    <!-- Items Grid -->
    <div v-if="filteredItems.length > 0" class="items-grid">
      <div
        v-for="item in filteredItems"
        :key="`${item.categoryId}-${item.id}`"
        class="item-card"
      >
        <div class="item-content">
          <div class="item-icon">
            <ion-icon :icon="fastFoodOutline"></ion-icon>
          </div>
          <div class="item-details">
            <h3 class="item-name">{{ item.name }}</h3>
            <span class="item-category">{{ item.categoryName }}</span>
          </div>
        </div>
        <div class="item-actions">
          <button class="action-btn edit" @click="editItem(item)" title="Edit">
            <ion-icon :icon="createOutline"></ion-icon>
          </button>
          <button class="action-btn delete" @click="confirmDelete(item)" title="Delete">
            <ion-icon :icon="trashOutline"></ion-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <ion-icon :icon="fastFoodOutline"></ion-icon>
      </div>
      <h3>No Items Found</h3>
      <p v-if="selectedCategoryFilter !== 'all'">No items in this category yet</p>
      <p v-else>Start by adding your first menu item</p>
      <button class="empty-btn" @click="openAddItemModal">
        <ion-icon :icon="addOutline"></ion-icon>
        Add Item
      </button>
    </div>

    <!-- Add/Edit Item Modal -->
    <ion-modal :is-open="isModalOpen" @didDismiss="closeModal" class="item-modal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Edit Item' : 'Add New Item' }}</h2>
          <button class="modal-close-btn" @click="closeModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>

        <div class="modal-body">
          <!-- Item Name Field - First for Add mode -->
          <div class="form-field">
            <label class="field-label">
              <ion-icon :icon="fastFoodOutline"></ion-icon>
              Item Name
            </label>
            <input
              v-model="itemForm.name"
              type="text"
              class="field-input"
              placeholder="Enter item name"
            />
          </div>

          <!-- Category Field -->
          <div class="form-field">
            <label class="field-label">
              <ion-icon :icon="folderOutline"></ion-icon>
              {{ isEditMode ? 'Change Category' : 'Select Category' }}
            </label>
            <div class="custom-select-wrapper" @click="toggleModalDropdown">
              <div class="custom-select-display" :class="{ 'has-value': itemForm.categoryId }">
                <span v-if="itemForm.categoryId">{{ getSelectedCategoryNameForForm }}</span>
                <span v-else class="placeholder">Choose a category</span>
                <ion-icon :icon="chevronDownOutline" class="select-arrow" :class="{ rotated: isModalDropdownOpen }"></ion-icon>
              </div>

              <!-- Custom Dropdown -->
              <div v-if="isModalDropdownOpen" class="custom-select-dropdown">
                <div class="dropdown-search">
                  <ion-icon :icon="searchOutline" class="dropdown-search-icon"></ion-icon>
                  <input
                    v-model="categorySearchQuery"
                    type="text"
                    class="dropdown-search-input"
                    placeholder="Search categories..."
                    @click.stop
                  />
                </div>
                <div class="dropdown-options">
                  <div
                    v-for="category in filteredCategoriesForDropdown"
                    :key="category.id"
                    class="dropdown-option"
                    :class="{ selected: itemForm.categoryId === category.id }"
                    @click.stop="selectCategory(category)"
                  >
                    <div class="option-icon">
                      <ion-icon :icon="folderOutline"></ion-icon>
                    </div>
                    <div class="option-content">
                      <span class="option-name">{{ category.name }}</span>
                      <span class="option-count">{{ category.items?.length || 0 }} items</span>
                    </div>
                    <ion-icon v-if="itemForm.categoryId === category.id" :icon="checkmarkOutline" class="option-check"></ion-icon>
                  </div>
                  <div v-if="filteredCategoriesForDropdown.length === 0" class="dropdown-empty">
                    No categories found
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Dropdown Overlay for Modal -->
          <div v-if="isModalDropdownOpen" class="modal-dropdown-overlay" @click="isModalDropdownOpen = false"></div>

          <div v-if="errorMessage" class="error-alert">
            <ion-icon :icon="alertCircleOutline"></ion-icon>
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="closeModal">Cancel</button>
          <button class="submit-btn" @click="saveItem">
            <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
            {{ isEditMode ? 'Update Item' : 'Add Item' }}
          </button>
        </div>
      </div>
    </ion-modal>

    <!-- Delete Confirmation Modal -->
    <ion-modal :is-open="isDeleteModalOpen" @didDismiss="closeDeleteModal" class="delete-modal">
      <div class="modal-container delete-container">
        <div class="modal-header delete-header">
          <h2>Delete Item</h2>
          <button class="modal-close-btn" @click="closeDeleteModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>

        <div class="modal-body delete-body">
          <div class="delete-icon-wrapper">
            <ion-icon :icon="trashOutline"></ion-icon>
          </div>
          <h3 class="delete-title">Are you sure?</h3>
          <p class="delete-message">
            You are about to delete "<strong>{{ itemToDelete?.name }}</strong>". This action cannot be undone.
          </p>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="closeDeleteModal">Cancel</button>
          <button class="delete-btn" @click="deleteItem">
            <ion-icon :icon="trashOutline"></ion-icon>
            Delete Item
          </button>
        </div>
      </div>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonButton,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/vue';
import {
  addOutline,
  createOutline,
  trashOutline,
  closeOutline,
  folderOutline,
  fastFoodOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  warningOutline,
  filterOutline,
  chevronDownOutline,
  searchOutline,
  closeCircleOutline,
  checkmarkOutline,
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
const searchQuery = ref('');
const itemToDelete = ref<any>(null);
const isCategoryDropdownOpen = ref(false);
const isModalDropdownOpen = ref(false);
const categorySearchQuery = ref('');

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

// Filter items based on selected category and search query
const filteredItems = computed(() => {
  let items = allItems.value;

  // Filter by category
  if (selectedCategoryFilter.value !== 'all') {
    items = items.filter(item => String(item.categoryId) === selectedCategoryFilter.value);
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    items = items.filter(item => item.name.toLowerCase().includes(query));
  }

  return items;
});

const getSelectedCategoryName = computed(() => {
  if (selectedCategoryFilter.value === 'all') return 'All Categories';
  const category = data.value.find((c: any) => String(c.id) === selectedCategoryFilter.value);
  return category?.name || '';
});

const getCategoryItemCount = computed(() => {
  if (selectedCategoryFilter.value === 'all') return allItems.value.length;
  const category = data.value.find((c: any) => String(c.id) === selectedCategoryFilter.value);
  return category?.items?.length || 0;
});

const toggleCategoryDropdown = () => {
  isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value;
};

const selectCategoryOption = (value: string) => {
  selectedCategoryFilter.value = value;
  isCategoryDropdownOpen.value = false;
};

// Modal dropdown functions
const getSelectedCategoryNameForForm = computed(() => {
  if (!itemForm.value.categoryId) return '';
  const category = data.value.find((c: any) => c.id === itemForm.value.categoryId);
  return category?.name || '';
});

const filteredCategoriesForDropdown = computed(() => {
  if (!categorySearchQuery.value.trim()) return data.value;
  const query = categorySearchQuery.value.toLowerCase().trim();
  return data.value.filter((c: any) => c.name.toLowerCase().includes(query));
});

const toggleModalDropdown = () => {
  isModalDropdownOpen.value = !isModalDropdownOpen.value;
  if (isModalDropdownOpen.value) {
    categorySearchQuery.value = '';
  }
};

const selectCategory = (category: any) => {
  itemForm.value.categoryId = category.id;
  isModalDropdownOpen.value = false;
  categorySearchQuery.value = '';
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
  isModalDropdownOpen.value = false;
  categorySearchQuery.value = '';
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
    showToast('Failed to delete item', 'error', 2000);
  }
};
</script>

<style scoped>
.items-page {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  min-width: 0;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 0.9rem;
  color: #888;
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.add-btn ion-icon {
  font-size: 18px;
}

/* Filter Section */
.filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

/* Filter Dropdown */
.filter-dropdown {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  padding: 12px 16px;
  position: relative;
  transition: all 0.2s;
  min-width: 220px;
  max-width: 320px;
  cursor: pointer;
  user-select: none;
}

.filter-dropdown:hover {
  border-color: #667eea;
}

.filter-icon {
  font-size: 20px;
  color: #667eea;
  margin-right: 12px;
  flex-shrink: 0;
}

.selected-category {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-icon {
  font-size: 18px;
  color: #888;
  margin-left: 8px;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

/* Dropdown List */
.dropdown-list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-item:first-child {
  border-radius: 10px 10px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 10px 10px;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.dropdown-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.dropdown-item.active .dropdown-item-name {
  color: #667eea;
  font-weight: 600;
}

.dropdown-item-count {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.dropdown-item.active .dropdown-item-count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Dropdown Overlay */
.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

/* Dropdown Scrollbar */
.dropdown-list::-webkit-scrollbar {
  width: 6px;
}

.dropdown-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.dropdown-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

/* Search Box */
.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  padding: 12px 16px;
  flex: 1;
  max-width: 400px;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.search-icon {
  font-size: 20px;
  color: #667eea;
  margin-right: 12px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

.clear-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn ion-icon {
  font-size: 20px;
  color: #999;
  transition: color 0.2s;
}

.clear-btn:hover ion-icon {
  color: #667eea;
}

/* Items Grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.item-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.2s;
}

.item-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.item-content {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.item-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-icon ion-icon {
  font-size: 22px;
  color: #667eea;
}

.item-details {
  min-width: 0;
  flex: 1;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-category {
  font-size: 0.8rem;
  color: #888;
}

.item-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn ion-icon {
  font-size: 18px;
}

.action-btn.edit {
  background: #e8f5e9;
  color: #388e3c;
}

.action-btn.edit:hover {
  background: #c8e6c9;
}

.action-btn.delete {
  background: #ffebee;
  color: #d32f2f;
}

.action-btn.delete:hover {
  background: #ffcdd2;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e8e8e8;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon ion-icon {
  font-size: 40px;
  color: #667eea;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #888;
  margin: 0 0 20px 0;
}

.empty-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-btn:hover {
  transform: translateY(-2px);
}

/* Modal Container Styles */
.modal-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-close-btn ion-icon {
  font-size: 20px;
}

.modal-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.form-field {
  margin-bottom: 20px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 10px;
}

.field-label ion-icon {
  font-size: 18px;
  color: #667eea;
}

.field-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 15px;
  color: #333;
  background: #fafafa;
  transition: all 0.2s;
  outline: none;
}

.field-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.field-input::placeholder {
  color: #999;
}

/* Custom Select Dropdown */
.custom-select-wrapper {
  position: relative;
}

.custom-select-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 15px;
  color: #333;
  background: #fafafa;
  transition: all 0.2s;
  cursor: pointer;
}

.custom-select-display:hover {
  border-color: #667eea;
}

.custom-select-display.has-value {
  background: white;
}

.custom-select-display .placeholder {
  color: #999;
}

.custom-select-display .select-arrow {
  font-size: 18px;
  color: #888;
  transition: transform 0.2s;
}

.custom-select-display .select-arrow.rotated {
  transform: rotate(180deg);
}

.custom-select-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  overflow: hidden;
}

.dropdown-search {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.dropdown-search-icon {
  font-size: 18px;
  color: #888;
  margin-right: 10px;
}

.dropdown-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
}

.dropdown-search-input::placeholder {
  color: #aaa;
}

.dropdown-options {
  max-height: 220px;
  overflow-y: auto;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-option:hover {
  background: #f5f5f5;
}

.dropdown-option.selected {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.option-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-icon ion-icon {
  font-size: 18px;
  color: #667eea;
}

.option-content {
  flex: 1;
  min-width: 0;
}

.option-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.option-count {
  display: block;
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.option-check {
  font-size: 20px;
  color: #667eea;
  flex-shrink: 0;
}

.dropdown-empty {
  padding: 24px;
  text-align: center;
  color: #888;
  font-size: 14px;
}

/* Modal Dropdown Overlay */
.modal-dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

/* Dropdown Scrollbar */
.dropdown-options::-webkit-scrollbar {
  width: 6px;
}

.dropdown-options::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 10px;
}

.dropdown-options::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff5f5;
  border: 1px solid #feb2b2;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
}

.error-alert ion-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #f0f0f0;
}

.modal-footer .cancel-btn {
  flex: 1;
  padding: 14px;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-footer .cancel-btn:hover {
  background: #f5f5f5;
  border-color: #ddd;
}

.modal-footer .submit-btn {
  flex: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-footer .submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.modal-footer .submit-btn ion-icon {
  font-size: 18px;
}

/* Delete Modal Specific Styles */
.delete-container {
  background: white;
}

.delete-header {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.delete-body {
  text-align: center;
  padding: 32px 24px;
}

.delete-icon-wrapper {
  width: 70px;
  height: 70px;
  margin: 0 auto 20px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon-wrapper ion-icon {
  font-size: 32px;
  color: #ef4444;
}

.delete-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.delete-message {
  font-size: 0.95rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.delete-message strong {
  color: #333;
}

.delete-btn {
  flex: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.delete-btn ion-icon {
  font-size: 18px;
}

/* Responsive */
@media (max-width: 1024px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
  }

  .filter-dropdown,
  .search-box {
    max-width: 100%;
  }

  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.8rem;
  }

  .add-btn {
    padding: 10px 16px;
    font-size: 13px;
  }

  .add-btn span {
    display: none;
  }

  .add-btn ion-icon {
    font-size: 20px;
  }
}

@media (max-width: 540px) {
  .items-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .item-card {
    padding: 12px;
  }

  .item-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .item-icon ion-icon {
    font-size: 18px;
  }

  .item-name {
    font-size: 0.9rem;
  }

  .item-category {
    font-size: 0.75rem;
  }

  .action-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }

  .action-btn ion-icon {
    font-size: 16px;
  }

  .delete-actions {
    flex-direction: column;
  }
}

</style>

<style>
/* Non-scoped styles for modal */
.item-modal {
  --width: 90%;
  --max-width: 450px;
  --height: auto;
  --min-height: 380px;
  --max-height: 90vh;
  --border-radius: 16px;
  --box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.item-modal::part(content) {
  margin: auto;
}

.delete-modal {
  --width: 90%;
  --max-width: 400px;
  --height: auto;
  --min-height: 300px;
  --border-radius: 16px;
  --box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.delete-modal::part(content) {
  margin: auto;
}
</style>
