<template>
  <div class="step-preview">
    <!-- Report Name Input (Top) -->
    <div class="report-name-section">
      <input
        v-model="reportNameLocal"
        type="text"
        class="report-name-input"
        placeholder="Report name (optional)"
      />
    </div>

    <!-- Preview Content -->
    <div class="preview-content">
      <!-- Customer Info Card -->
      <div class="info-card">
        <div class="card-row">
          <div class="info-cell">
            <span class="label">Customer</span>
            <span class="value">{{ customerData.name }}</span>
          </div>
          <div class="info-cell">
            <span class="label">Phone</span>
            <span class="value">{{ customerData.phone }}</span>
          </div>
        </div>
        <div class="card-row">
          <div class="info-cell">
            <span class="label">Date</span>
            <span class="value">{{ formattedDate }}</span>
          </div>
          <div class="info-cell">
            <span class="label">People</span>
            <span class="value">{{ customerData.noOfPeople }}</span>
          </div>
        </div>
        <div class="card-row">
          <div class="info-cell">
            <span class="label">Shift</span>
            <span class="value">{{ customerData.shift }}</span>
          </div>
          <div class="info-cell">
            <span class="label">Price</span>
            <span class="value price">₹{{ customerData.price }}</span>
          </div>
        </div>
        <div class="card-row single">
          <div class="info-cell full">
            <span class="label">Address</span>
            <span class="value">{{ customerData.address }}</span>
          </div>
        </div>
      </div>

      <!-- Selected Items -->
      <div class="items-section">
        <div class="items-header">
          <span class="items-title">Menu Items</span>
          <div class="items-header-actions">
            <span class="items-count">{{ totalItems }} items</span>
            <button class="add-items-btn" @click="showAddItemModal = true">
              <ion-icon :icon="addOutline"></ion-icon>
              Add
            </button>
          </div>
        </div>
        <div v-if="localSelectedItems.length > 0" class="categories-list">
          <div
            v-for="category in localSelectedItems"
            :key="category.id"
            class="category-block"
          >
            <div class="category-header">
              <span class="category-label">{{ category.name }}</span>
              <button class="category-edit-btn" @click="openEditCategory(category)">
                <ion-icon :icon="createOutline"></ion-icon>
              </button>
            </div>
            <div class="items-row">
              <span
                v-for="item in category.items"
                :key="item.id"
                class="item-tag"
              >
                {{ item.name }}
                <ion-icon
                  :icon="closeOutline"
                  class="remove-icon"
                  @click="removeItem(category.id, item.id)"
                ></ion-icon>
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-items">
          <p>No items selected. Add items to continue.</p>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="nav-buttons">
      <button class="back-btn" @click="$emit('back')">
        <ion-icon :icon="arrowBackOutline"></ion-icon>
        <span>Back</span>
      </button>
      <button class="save-btn" :disabled="isSaving || totalItems === 0" @click="handleSave">
        <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
        <template v-else>
          <ion-icon :icon="checkmarkOutline"></ion-icon>
          <span>{{ isEditMode ? 'Update Report' : 'Save Report' }}</span>
        </template>
      </button>
    </div>

    <!-- Add/Edit Items Modal -->
    <ion-modal :is-open="showAddItemModal" @didDismiss="closeAddItemModal">
      <ion-header>
        <ion-toolbar class="gradient-toolbar">
          <ion-title>{{ editingCategory ? 'Edit Category' : 'Add New Item' }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeAddItemModal">
              <ion-icon slot="icon-only" :icon="closeOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="add-item-content">
          <div class="add-item-header">
            <ion-icon :icon="listOutline" class="add-item-icon"></ion-icon>
            <h2>{{ editingCategory ? 'Edit Category Items' : 'Create New Category' }}</h2>
            <p class="help-text">Add categories and their items to organize your menu</p>
          </div>

          <div class="categories-form">
            <div v-for="(category, catIndex) in newItemFormData" :key="category.tempId" class="category-form-block">
              <div class="category-form-header">
                <ion-icon :icon="restaurantOutline" class="category-icon"></ion-icon>
                <h3>Category {{ catIndex + 1 }}</h3>
                <button
                  v-if="!editingCategory && newItemFormData.length > 1"
                  class="remove-category-btn"
                  @click="removeCategory(catIndex)"
                >
                  <ion-icon :icon="trashOutline"></ion-icon>
                </button>
              </div>

              <div class="form-group">
                <label>Category Name</label>
                <input
                  v-model="category.name"
                  type="text"
                  class="form-input"
                  placeholder="Enter category name"
                  :disabled="editingCategory !== null"
                />
              </div>

              <div class="items-form-section">
                <div class="items-form-header">
                  <label>Items</label>
                  <button class="add-item-inline-btn" @click="addItemToCategory(catIndex)">
                    <ion-icon :icon="addOutline"></ion-icon>
                    Add Item
                  </button>
                </div>
                <div v-for="(item, itemIndex) in category.items" :key="item.tempId" class="item-input-row">
                  <input
                    v-model="item.name"
                    type="text"
                    class="form-input item-input"
                    :placeholder="`Item ${itemIndex + 1}`"
                  />
                  <button
                    v-if="category.items.length > 1"
                    class="remove-item-btn"
                    @click="removeItemFromForm(catIndex, itemIndex)"
                  >
                    <ion-icon :icon="closeOutline"></ion-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button
              v-if="!editingCategory"
              class="add-category-btn"
              @click="addNewCategoryToForm"
            >
              <ion-icon :icon="addOutline"></ion-icon>
              Add Another Category
            </button>
            <button class="save-items-btn" @click="saveNewItems">
              <ion-icon :icon="checkmarkOutline"></ion-icon>
              {{ editingCategory ? 'Update Items' : 'Add Items' }}
            </button>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import {
  IonIcon,
  IonSpinner,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
} from '@ionic/vue';
import {
  arrowBackOutline,
  checkmarkOutline,
  closeOutline,
  addOutline,
  createOutline,
  listOutline,
  restaurantOutline,
  trashOutline,
} from 'ionicons/icons';

interface CustomerData {
  name: string;
  phone: string;
  date: string;
  noOfPeople: string;
  address: string;
  shift: string;
  price: string;
}

interface SelectedCategory {
  id: number;
  name: string;
  items: { id: string; name: string }[];
}

interface FormItem {
  tempId: string;
  name: string;
}

interface FormCategory {
  tempId: string;
  id?: number;
  name: string;
  items: FormItem[];
}

const props = defineProps<{
  customerData: CustomerData;
  selectedItems: SelectedCategory[];
  reportName: string;
  isSaving: boolean;
  isEditMode?: boolean;
}>();

const emit = defineEmits<{
  back: [];
  save: [reportName: string];
  'update:reportName': [value: string];
  'update:selectedItems': [items: SelectedCategory[]];
}>();

// Local copy of selected items for editing
const localSelectedItems = ref<SelectedCategory[]>([]);

// Watch for changes from parent
watch(() => props.selectedItems, (newVal) => {
  localSelectedItems.value = JSON.parse(JSON.stringify(newVal));
}, { immediate: true, deep: true });

// Sync changes back to parent
watch(localSelectedItems, (newVal) => {
  emit('update:selectedItems', newVal);
}, { deep: true });

const reportNameLocal = computed({
  get: () => props.reportName,
  set: (val) => emit('update:reportName', val),
});

const formattedDate = computed(() => {
  if (!props.customerData.date) return '';
  const date = new Date(props.customerData.date);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
});

const totalItems = computed(() => {
  return localSelectedItems.value.reduce((total, cat) => total + cat.items.length, 0);
});

// Modal state
const showAddItemModal = ref(false);
const editingCategory = ref<SelectedCategory | null>(null);
const newItemFormData = ref<FormCategory[]>([]);

const generateTempId = () => Math.random().toString(36).substring(2, 9);

const initializeFormData = () => {
  newItemFormData.value = [{
    tempId: generateTempId(),
    name: '',
    items: [{ tempId: generateTempId(), name: '' }],
  }];
};

const openEditCategory = (category: SelectedCategory) => {
  editingCategory.value = category;
  newItemFormData.value = [{
    tempId: generateTempId(),
    id: category.id,
    name: category.name,
    items: category.items.map(item => ({
      tempId: generateTempId(),
      name: item.name,
    })),
  }];
  // Add empty item for adding new
  newItemFormData.value[0].items.push({ tempId: generateTempId(), name: '' });
  showAddItemModal.value = true;
};

const closeAddItemModal = () => {
  showAddItemModal.value = false;
  editingCategory.value = null;
  initializeFormData();
};

const addNewCategoryToForm = () => {
  newItemFormData.value.push({
    tempId: generateTempId(),
    name: '',
    items: [{ tempId: generateTempId(), name: '' }],
  });
};

const removeCategory = (index: number) => {
  newItemFormData.value.splice(index, 1);
};

const addItemToCategory = (catIndex: number) => {
  newItemFormData.value[catIndex].items.push({
    tempId: generateTempId(),
    name: '',
  });
};

const removeItemFromForm = (catIndex: number, itemIndex: number) => {
  newItemFormData.value[catIndex].items.splice(itemIndex, 1);
};

const removeItem = (categoryId: number, itemId: string) => {
  const categoryIndex = localSelectedItems.value.findIndex(c => c.id === categoryId);
  if (categoryIndex !== -1) {
    const category = localSelectedItems.value[categoryIndex];
    category.items = category.items.filter(item => item.id !== itemId);

    // Remove category if no items left
    if (category.items.length === 0) {
      localSelectedItems.value.splice(categoryIndex, 1);
    }
  }
};

const saveNewItems = () => {
  if (editingCategory.value) {
    // Update existing category
    const categoryIndex = localSelectedItems.value.findIndex(c => c.id === editingCategory.value!.id);
    if (categoryIndex !== -1) {
      const validItems = newItemFormData.value[0].items
        .filter(item => item.name.trim())
        .map(item => ({
          id: generateTempId(),
          name: item.name.trim(),
        }));
      localSelectedItems.value[categoryIndex].items = validItems;
    }
  } else {
    // Add new categories
    const newCategories = newItemFormData.value
      .filter(cat => cat.name.trim() && cat.items.some(item => item.name.trim()))
      .map(cat => ({
        id: Date.now() + Math.random(),
        name: cat.name.trim(),
        items: cat.items
          .filter(item => item.name.trim())
          .map(item => ({
            id: generateTempId(),
            name: item.name.trim(),
          })),
      }));

    localSelectedItems.value.push(...newCategories);
  }

  closeAddItemModal();
};

const handleSave = () => {
  emit('save', reportNameLocal.value);
};

// Initialize form data
onMounted(() => {
  initializeFormData();
});
</script>

<style scoped>
.step-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.report-name-section {
  margin-bottom: 16px;
}

.report-name-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  background: white;
  transition: all 0.2s;
}

.report-name-input:focus {
  outline: none;
  border-color: #667eea;
}

.report-name-input::placeholder {
  color: #999;
  font-weight: 400;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

/* Info Card */
.info-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
}

.card-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}

.card-row:last-child {
  border-bottom: none;
}

.card-row.single {
  display: block;
}

.info-cell {
  flex: 1;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-cell:not(:last-child) {
  border-right: 1px solid #f0f0f0;
}

.card-row.single .info-cell {
  border-right: none;
}

.info-cell.full {
  flex: none;
  width: 100%;
}

.info-cell .label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #888;
  font-weight: 500;
}

.info-cell .value {
  font-size: 0.95rem;
  color: #1a1a1a;
  font-weight: 500;
}

.info-cell .value.price {
  color: #4CAF50;
  font-weight: 600;
}

/* Items Section */
.items-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  padding: 16px;
}

.items-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.items-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
}

.items-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.items-count {
  font-size: 0.8rem;
  color: #667eea;
  font-weight: 600;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
}

.add-items-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-items-btn:hover {
  transform: scale(1.05);
}

.add-items-btn ion-icon {
  font-size: 16px;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #667eea;
  font-weight: 600;
}

.category-edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(102, 126, 234, 0.1);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-edit-btn ion-icon {
  font-size: 14px;
  color: #667eea;
}

.category-edit-btn:hover {
  background: rgba(102, 126, 234, 0.2);
}

.items-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.item-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #333;
  transition: all 0.2s;
}

.item-tag:hover {
  background: #ebebeb;
}

.item-tag .remove-icon {
  font-size: 14px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.item-tag .remove-icon:hover {
  color: #d32f2f;
}

.empty-items {
  text-align: center;
  padding: 24px;
  color: #888;
}

.empty-items p {
  margin: 0;
}

/* Navigation */
.nav-buttons {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.back-btn,
.save-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn {
  background: #f5f5f5;
  color: #666;
}

.back-btn:hover {
  background: #e8e8e8;
}

.save-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.5);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-btn ion-icon,
.back-btn ion-icon {
  font-size: 18px;
}

/* Modal Styles */
.gradient-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
}

.add-item-content {
  max-width: 600px;
  margin: 0 auto;
}

.add-item-header {
  text-align: center;
  margin-bottom: 24px;
}

.add-item-icon {
  font-size: 48px;
  color: #667eea;
  margin-bottom: 12px;
}

.add-item-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
}

.add-item-header .help-text {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.categories-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category-form-block {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.category-form-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.category-icon {
  font-size: 24px;
  color: #667eea;
}

.category-form-header h3 {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.remove-category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #ffebee;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-category-btn ion-icon {
  font-size: 18px;
  color: #d32f2f;
}

.remove-category-btn:hover {
  background: #ffcdd2;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-input:disabled {
  background: #f5f5f5;
  color: #666;
}

.items-form-section {
  margin-top: 16px;
}

.items-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.items-form-header label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
}

.add-item-inline-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: 2px solid #667eea;
  border-radius: 8px;
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-item-inline-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

.add-item-inline-btn ion-icon {
  font-size: 16px;
}

.item-input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.item-input {
  flex: 1;
}

.remove-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f5f5f5;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-item-btn ion-icon {
  font-size: 18px;
  color: #999;
}

.remove-item-btn:hover {
  background: #ffebee;
}

.remove-item-btn:hover ion-icon {
  color: #d32f2f;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.add-category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: white;
  border: 2px dashed #667eea;
  border-radius: 12px;
  color: #667eea;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-category-btn:hover {
  background: rgba(102, 126, 234, 0.05);
}

.add-category-btn ion-icon {
  font-size: 20px;
}

.save-items-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-items-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.save-items-btn ion-icon {
  font-size: 20px;
}

@media (max-width: 480px) {
  .info-cell {
    padding: 10px 12px;
  }

  .info-cell .value {
    font-size: 0.9rem;
  }

  .item-tag {
    padding: 5px 10px;
    font-size: 0.8rem;
  }
}
</style>
