<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="admin-container">
        <div class="page-header">
          <h2>Category Management</h2>
          <ion-button color="primary" @click="openAddCategoryModal">
            <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>
            Add Category
          </ion-button>
        </div>

        <!-- Categories List -->
        <div class="categories-list">
          <ion-card v-for="category in data" :key="category.id" class="category-card">
            <ion-card-content>
              <div class="category-header">
                <div class="category-info">
                  <h3>{{ category.name }}</h3>
                  <p>{{ category.items.length }} items</p>
                </div>
                <div class="category-actions">
                  <ion-button fill="clear" color="primary" @click="editCategory(category)">
                    <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
                  </ion-button>
                  <ion-button fill="clear" color="danger" @click="confirmDelete(category)">
                    <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
                  </ion-button>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Add/Edit Category Modal -->
        <ion-modal :is-open="isModalOpen" @didDismiss="closeModal">
          <ion-header>
            <ion-toolbar class="gradient-toolbar">
              <ion-title>{{ isEditMode ? 'Edit Category' : 'Add Category' }}</ion-title>
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
                <label class="input-label">Category Name</label>
                <div class="input-wrapper">
                  <ion-icon :icon="folderOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="categoryForm.name"
                    type="text"
                    class="custom-input"
                    placeholder="Enter category name"
                  />
                </div>
              </div>

              <div v-if="errorMessage" class="error-message">
                <ion-icon :icon="alertCircleOutline"></ion-icon>
                <span>{{ errorMessage }}</span>
              </div>

              <ion-button expand="block" color="primary" @click="saveCategory" class="save-button">
                <ion-icon slot="start" :icon="checkmarkCircleOutline"></ion-icon>
                {{ isEditMode ? 'Update Category' : 'Add Category' }}
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
              <h3>Delete Category?</h3>
              <p>Are you sure you want to delete "{{ categoryToDelete?.name }}"? This will also delete all {{ categoryToDelete?.items?.length || 0 }} items in this category.</p>
              <div class="delete-actions">
                <ion-button expand="block" fill="outline" @click="closeDeleteModal">
                  Cancel
                </ion-button>
                <ion-button expand="block" color="danger" @click="deleteCategory">
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
} from '@ionic/vue';
import {
  addCircleOutline,
  createOutline,
  trashOutline,
  closeOutline,
  folderOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  warningOutline,
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
      // Update existing category using Firestore document ID
      const categoryRef = doc(db, 'categories', categoryForm.value.docId);
      await updateDoc(categoryRef, {
        name: categoryForm.value.name,
        updatedAt: new Date(),
      });
      showToast('Category updated successfully', 'success', 2000);
    } else {
      // Add new category
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

.categories-list {
  display: grid;
  gap: 16px;
}

.category-card {
  margin: 0;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-info h3 {
  margin: 0 0 4px 0;
  font-size: 1.25rem;
  color: #333;
}

.category-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.category-actions {
  display: flex;
  gap: 8px;
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

.custom-input {
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
