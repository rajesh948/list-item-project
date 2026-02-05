<template>
  <div class="categories-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Categories</h1>
        <p class="page-subtitle">{{ data.length }} categories total</p>
      </div>
      <button class="add-btn" @click="openAddCategoryModal">
        <ion-icon :icon="addOutline"></ion-icon>
        <span>Add Category</span>
      </button>
    </div>

    <!-- Categories Grid -->
    <div v-if="data.length > 0" class="categories-grid">
      <div
        v-for="category in data"
        :key="category.id"
        class="category-card"
      >
        <div class="category-content">
          <div class="category-icon">
            <ion-icon :icon="folderOutline"></ion-icon>
          </div>
          <div class="category-details">
            <h3 class="category-name">{{ category.name }}</h3>
            <span class="category-count">{{ category.items.length }} items</span>
          </div>
        </div>
        <div class="category-actions">
          <button class="action-btn edit" @click="editCategory(category)" title="Edit">
            <ion-icon :icon="createOutline"></ion-icon>
          </button>
          <button class="action-btn delete" @click="confirmDelete(category)" title="Delete">
            <ion-icon :icon="trashOutline"></ion-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <ion-icon :icon="folderOutline"></ion-icon>
      </div>
      <h3>No Categories Found</h3>
      <p>Start by adding your first category</p>
      <button class="empty-btn" @click="openAddCategoryModal">
        <ion-icon :icon="addOutline"></ion-icon>
        Add Category
      </button>
    </div>

    <!-- Add/Edit Category Modal -->
    <ion-modal :is-open="isModalOpen" @didDismiss="closeModal" class="category-modal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Edit Category' : 'Add New Category' }}</h2>
          <button class="modal-close-btn" @click="closeModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-field">
            <label class="field-label">
              <ion-icon :icon="folderOutline"></ion-icon>
              Category Name
            </label>
            <input
              v-model="categoryForm.name"
              type="text"
              class="field-input"
              placeholder="Enter category name"
            />
          </div>

          <div v-if="errorMessage" class="error-alert">
            <ion-icon :icon="alertCircleOutline"></ion-icon>
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="closeModal">Cancel</button>
          <button class="submit-btn" @click="saveCategory">
            <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
            {{ isEditMode ? 'Update Category' : 'Add Category' }}
          </button>
        </div>
      </div>
    </ion-modal>

    <!-- Delete Confirmation Modal -->
    <ion-modal :is-open="isDeleteModalOpen" @didDismiss="closeDeleteModal" class="delete-modal">
      <div class="modal-container delete-container">
        <div class="modal-header delete-header">
          <h2>Delete Category</h2>
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
            You are about to delete "<strong>{{ categoryToDelete?.name }}</strong>".
            This will also delete all <strong>{{ categoryToDelete?.items?.length || 0 }} items</strong> in this category.
          </p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="closeDeleteModal">Cancel</button>
          <button class="delete-btn" @click="deleteCategory">
            <ion-icon :icon="trashOutline"></ion-icon>
            Delete Category
          </button>
        </div>
      </div>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import {
  IonIcon,
  IonModal,
} from '@ionic/vue';
import {
  addOutline,
  createOutline,
  trashOutline,
  closeOutline,
  folderOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
const categoryToDelete = ref<any>(null);

const categoryForm = ref({
  id: null as number | null,
  docId: '',
  name: '',
});

const openAddCategoryModal = () => {
  isEditMode.value = false;
  categoryForm.value = { id: null, docId: '', name: '' };
  errorMessage.value = '';
  isModalOpen.value = true;
};

const editCategory = (category: any) => {
  isEditMode.value = true;
  categoryForm.value = { id: category.id, docId: category.docId, name: category.name };
  errorMessage.value = '';
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  categoryForm.value = { id: null, docId: '', name: '' };
  errorMessage.value = '';
};

const saveCategory = async () => {
  if (!categoryForm.value.name.trim()) {
    errorMessage.value = 'Please enter a category name';
    return;
  }

  try {
    if (isEditMode.value && categoryForm.value.docId) {
      const categoryRef = doc(db, 'categories', categoryForm.value.docId);
      await updateDoc(categoryRef, {
        name: categoryForm.value.name,
        updatedAt: new Date(),
      });
      showToast('Category updated successfully', 'success', 2000);
    } else {
      const maxId = data.value.length > 0 ? Math.max(...data.value.map(c => c.id)) : 0;
      await addDoc(collection(db, 'categories'), {
        id: maxId + 1,
        name: categoryForm.value.name,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      showToast('Category added successfully', 'success', 2000);
    }

    await categoriesStore.refreshCategories();
    closeModal();
  } catch (error) {
    errorMessage.value = 'Failed to save category';
  }
};

const confirmDelete = (category: any) => {
  categoryToDelete.value = category;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  categoryToDelete.value = null;
};

const deleteCategory = async () => {
  if (!categoryToDelete.value || !categoryToDelete.value.docId) return;

  try {
    const categoryRef = doc(db, 'categories', categoryToDelete.value.docId);
    await deleteDoc(categoryRef);

    showToast('Category deleted successfully', 'success', 2000);
    await categoriesStore.refreshCategories();
    closeDeleteModal();
  } catch (error) {
    showToast('Failed to delete category', 'error', 2000);
  }
};
</script>

<style scoped>
.categories-page {
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

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.category-card {
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

.category-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.category-content {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.category-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-icon ion-icon {
  font-size: 22px;
  color: #667eea;
}

.category-details {
  min-width: 0;
  flex: 1;
}

.category-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-count {
  font-size: 0.8rem;
  color: #888;
}

.category-actions {
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
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.delete-message strong {
  color: #333;
}

.delete-warning {
  font-size: 0.85rem;
  color: #ef4444;
  margin: 0;
  font-weight: 500;
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
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
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

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 540px) {
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .category-card {
    padding: 12px;
  }

  .category-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .category-icon ion-icon {
    font-size: 18px;
  }

  .category-name {
    font-size: 0.9rem;
  }

  .category-count {
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
}
</style>

<style>
/* Non-scoped styles for modal */
.category-modal {
  --width: 90%;
  --max-width: 450px;
  --height: auto;
  --min-height: 300px;
  --max-height: 90vh;
  --border-radius: 16px;
  --box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.category-modal::part(content) {
  margin: auto;
}

.delete-modal {
  --width: 90%;
  --max-width: 420px;
  --height: auto;
  --min-height: 340px;
  --border-radius: 16px;
  --box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.delete-modal::part(content) {
  margin: auto;
}
</style>
