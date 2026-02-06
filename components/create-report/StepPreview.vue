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
    <ion-modal :is-open="showAddItemModal" @didDismiss="closeAddItemModal" class="category-items-modal">
      <div class="modal-wrapper">
        <!-- Modal Header -->
        <div class="modal-header-custom">
          <div class="modal-header-content">
            <div class="modal-icon-wrapper">
              <ion-icon :icon="editingCategory ? createOutline : layersOutline"></ion-icon>
            </div>
            <div class="modal-title-section">
              <h2>{{ editingCategory ? 'Edit Category Items' : 'Create New Category' }}</h2>
              <p>{{ editingCategory ? 'Update items in this category' : 'Add categories and items to your menu' }}</p>
            </div>
          </div>
          <button class="modal-close-btn-custom" @click="closeAddItemModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body-custom">
          <div class="categories-form-modern">
            <div
              v-for="(category, catIndex) in newItemFormData"
              :key="category.tempId"
              class="category-card-form"
            >
              <!-- Category Header -->
              <div class="category-card-header">
                <div class="category-number">
                  <span>{{ catIndex + 1 }}</span>
                </div>
                <div class="category-header-title">
                  <span class="category-label-text">Category</span>
                </div>
                <button
                  v-if="!editingCategory && newItemFormData.length > 1"
                  class="remove-category-btn-modern"
                  @click="removeCategory(catIndex)"
                >
                  <ion-icon :icon="trashOutline"></ion-icon>
                </button>
              </div>

              <!-- Category Name Input -->
              <div class="form-field-modern">
                <div class="input-wrapper">
                  <ion-icon :icon="folderOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="category.name"
                    type="text"
                    class="modern-input"
                    placeholder="Category name"
                    :disabled="editingCategory !== null"
                  />
                </div>
              </div>

              <!-- Items Section -->
              <div class="items-section-modern">
                <div class="items-header-modern">
                  <div class="items-label">
                    <ion-icon :icon="listOutline"></ion-icon>
                    <span>Items</span>
                    <span class="items-count-badge">{{ category.items.filter(i => i.name.trim()).length }}</span>
                  </div>
                  <button class="add-item-btn-modern" @click="addItemToCategory(catIndex)">
                    <ion-icon :icon="addOutline"></ion-icon>
                    <span>Add</span>
                  </button>
                </div>

                <div class="items-list-modern">
                  <div
                    v-for="(item, itemIndex) in category.items"
                    :key="item.tempId"
                    class="item-row-modern"
                  >
                    <div class="item-number">{{ itemIndex + 1 }}</div>
                    <input
                      v-model="item.name"
                      type="text"
                      class="item-input-modern"
                      :placeholder="`Item name`"
                      @keydown.enter="addItemToCategory(catIndex)"
                    />
                    <button
                      v-if="category.items.length > 1"
                      class="remove-item-btn-modern"
                      @click="removeItemFromForm(catIndex, itemIndex)"
                    >
                      <ion-icon :icon="closeCircleOutline"></ion-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Add Another Category Button -->
          <button
            v-if="!editingCategory"
            class="add-another-category-btn"
            @click="addNewCategoryToForm"
          >
            <div class="add-category-icon">
              <ion-icon :icon="addOutline"></ion-icon>
            </div>
            <span>Add Another Category</span>
          </button>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer-custom">
          <button class="cancel-btn-modern" @click="closeAddItemModal">
            Cancel
          </button>
          <button class="submit-btn-modern" @click="saveNewItems">
            <ion-icon :icon="checkmarkOutline"></ion-icon>
            <span>{{ editingCategory ? 'Update Items' : 'Add Items' }}</span>
          </button>
        </div>
      </div>
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
  layersOutline,
  folderOutline,
  closeCircleOutline,
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

// Flag to prevent recursive updates
const isUpdatingFromParent = ref(false);

// Watch for changes from parent
watch(() => props.selectedItems, (newVal) => {
  // Only update if values are different (compare by JSON string)
  const newValStr = JSON.stringify(newVal);
  const localValStr = JSON.stringify(localSelectedItems.value);
  if (newValStr !== localValStr) {
    isUpdatingFromParent.value = true;
    localSelectedItems.value = JSON.parse(newValStr);
    // Reset flag after the current tick
    nextTick(() => {
      isUpdatingFromParent.value = false;
    });
  }
}, { immediate: true, deep: true });

// Sync changes back to parent (only when changes originate from this component)
watch(localSelectedItems, (newVal) => {
  if (!isUpdatingFromParent.value) {
    emit('update:selectedItems', JSON.parse(JSON.stringify(newVal)));
  }
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
.modal-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
}

.modal-header-custom {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header-content {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.modal-icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-icon-wrapper ion-icon {
  font-size: 24px;
  color: #667eea;
}

.modal-title-section h2 {
  margin: 0 0 4px 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a1a;
}

.modal-title-section p {
  margin: 0;
  font-size: 0.85rem;
  color: #888;
}

.modal-close-btn-custom {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.modal-close-btn-custom:hover {
  background: #e8e8e8;
}

.modal-close-btn-custom ion-icon {
  font-size: 20px;
  color: #666;
}

.modal-body-custom {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.categories-form-modern {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-card-form {
  background: white;
  border-radius: 16px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
}

.category-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-bottom: 1px solid #e8e8e8;
}

.category-number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-number span {
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
}

.category-header-title {
  flex: 1;
}

.category-label-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.remove-category-btn-modern {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-category-btn-modern:hover {
  background: rgba(239, 68, 68, 0.2);
}

.remove-category-btn-modern ion-icon {
  font-size: 18px;
  color: #ef4444;
}

.form-field-modern {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 20px;
  color: #888;
  pointer-events: none;
}

.modern-input {
  width: 100%;
  padding: 14px 14px 14px 46px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #333;
  background: #fafafa;
  transition: all 0.2s;
}

.modern-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modern-input:disabled {
  background: #f0f0f0;
  color: #888;
}

.modern-input::placeholder {
  color: #aaa;
}

.items-section-modern {
  padding: 16px;
}

.items-header-modern {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.items-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.items-label ion-icon {
  font-size: 18px;
  color: #667eea;
}

.items-label span {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.items-count-badge {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.add-item-btn-modern {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-item-btn-modern:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.add-item-btn-modern ion-icon {
  font-size: 16px;
}

.items-list-modern {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-row-modern {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-number {
  width: 24px;
  height: 24px;
  background: #f0f0f0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #888;
  flex-shrink: 0;
}

.item-input-modern {
  flex: 1;
  padding: 12px 14px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #333;
  background: #fafafa;
  transition: all 0.2s;
}

.item-input-modern:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.item-input-modern::placeholder {
  color: #aaa;
}

.remove-item-btn-modern {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-item-btn-modern ion-icon {
  font-size: 22px;
  color: #ccc;
  transition: color 0.2s;
}

.remove-item-btn-modern:hover ion-icon {
  color: #ef4444;
}

.add-another-category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  margin-top: 16px;
  background: white;
  border: 2px dashed #d0d0d0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-another-category-btn:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.02);
}

.add-category-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-category-icon ion-icon {
  font-size: 18px;
  color: #667eea;
}

.add-another-category-btn span {
  font-size: 0.9rem;
  font-weight: 600;
  color: #667eea;
}

.modal-footer-custom {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e8e8e8;
}

.cancel-btn-modern {
  flex: 1;
  padding: 14px;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn-modern:hover {
  background: #f5f5f5;
  border-color: #ddd;
}

.submit-btn-modern {
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
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-btn-modern:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.submit-btn-modern ion-icon {
  font-size: 18px;
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

  /* Modal Mobile Styles */
  .modal-header-custom {
    padding: 16px;
  }

  .modal-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .modal-icon-wrapper ion-icon {
    font-size: 20px;
  }

  .modal-title-section h2 {
    font-size: 1rem;
  }

  .modal-title-section p {
    font-size: 0.8rem;
  }

  .modal-body-custom {
    padding: 16px;
  }

  .category-card-header {
    padding: 12px 14px;
  }

  .category-number {
    width: 24px;
    height: 24px;
  }

  .category-number span {
    font-size: 0.75rem;
  }

  .form-field-modern {
    padding: 14px;
  }

  .modern-input {
    padding: 12px 12px 12px 42px;
    font-size: 0.9rem;
  }

  .input-icon {
    left: 12px;
    font-size: 18px;
  }

  .items-section-modern {
    padding: 14px;
  }

  .item-row-modern {
    gap: 8px;
  }

  .item-input-modern {
    padding: 10px 12px;
    font-size: 0.85rem;
  }

  .modal-footer-custom {
    padding: 14px 16px;
    gap: 10px;
  }

  .cancel-btn-modern,
  .submit-btn-modern {
    padding: 12px;
    font-size: 0.9rem;
  }
}
</style>

<style>
/* Global Modal Styles */
.category-items-modal {
  --width: 100%;
  --max-width: 520px;
  --height: 100%;
  --max-height: 90vh;
  --border-radius: 20px;
  --box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.category-items-modal::part(content) {
  margin: auto;
}

@media (max-width: 540px) {
  .category-items-modal {
    --max-width: 100%;
    --max-height: 100%;
    --border-radius: 0;
  }
}
</style>
