<template>
  <div class="templates-page">
    <div class="page-header">
      <div class="header-left">
        <h1>Report Templates</h1>
        <p>Create and manage your reusable item templates</p>
      </div>
      <button class="create-btn" @click="openCreateModal">
        <ion-icon :icon="addOutline"></ion-icon>
        <span>Create Template</span>
      </button>
    </div>

    <!-- Premium Lock -->
    <div v-if="!isPremium" class="premium-lock">
      <div class="lock-content">
        <div class="lock-icon">
          <ion-icon :icon="lockClosedOutline"></ion-icon>
        </div>
        <h2>Premium Feature</h2>
        <p>Templates help you save time by reusing item selections for similar events.</p>
        <button class="upgrade-btn" @click="navigateTo('/subscription')">
          <ion-icon :icon="sparklesOutline"></ion-icon>
          Upgrade to Premium
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="loading-state">
      <ion-spinner name="crescent"></ion-spinner>
      <p>Loading templates...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="templates.length === 0" class="empty-state">
      <div class="empty-icon">
        <ion-icon :icon="documentsOutline"></ion-icon>
      </div>
      <h3>No Templates Yet</h3>
      <p>Create your first template to save time on future reports.</p>
      <button class="create-btn-empty" @click="openCreateModal">
        <ion-icon :icon="addOutline"></ion-icon>
        Create Your First Template
      </button>
    </div>

    <!-- Templates Grid -->
    <div v-else class="templates-grid">
      <div
        v-for="template in templates"
        :key="template.id"
        class="template-card"
      >
        <div class="card-header">
          <h3>{{ template.name }}</h3>
          <div class="card-actions">
            <button class="action-btn" @click="editTemplate(template)" title="Edit">
              <ion-icon :icon="createOutline"></ion-icon>
            </button>
            <button class="action-btn delete" @click="confirmDelete(template)" title="Delete">
              <ion-icon :icon="trashOutline"></ion-icon>
            </button>
          </div>
        </div>
        <p v-if="template.description" class="card-description">{{ template.description }}</p>
        <div class="card-stats">
          <div class="stat">
            <ion-icon :icon="layersOutline"></ion-icon>
            <span>{{ template.categories?.length || 0 }} categories</span>
          </div>
          <div class="stat">
            <ion-icon :icon="listOutline"></ion-icon>
            <span>{{ template.itemCount }} items</span>
          </div>
        </div>
        <div class="card-footer">
          <span class="date">Updated {{ formatDate(template.updatedAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content large">
        <div class="modal-header">
          <h3>{{ editingTemplate ? 'Edit Template' : 'Create Template' }}</h3>
          <button class="modal-close" @click="closeModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>

        <div class="modal-body">
          <!-- Step 1: Template Info -->
          <div v-if="modalStep === 1" class="step-content">
            <div class="form-group">
              <label>Template Name <span class="required">*</span></label>
              <input
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="e.g., Wedding Menu, Birthday Party"
                maxlength="50"
              />
            </div>
            <div class="form-group">
              <label>Description (optional)</label>
              <textarea
                v-model="formData.description"
                class="form-textarea"
                placeholder="Brief description of when to use this template..."
                rows="3"
                maxlength="200"
              ></textarea>
            </div>
          </div>

          <!-- Step 2: Select Items -->
          <div v-if="modalStep === 2" class="step-content step-items">
            <!-- Loading Categories -->
            <div v-if="isLoadingCategories" class="categories-loading">
              <ion-spinner name="crescent"></ion-spinner>
              <p>Loading items...</p>
            </div>

            <template v-else>
              <!-- Search Bar -->
              <div class="search-container">
                <ion-icon :icon="searchOutline" class="search-icon"></ion-icon>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="search-input"
                  placeholder="Search items across all categories..."
                />
                <ion-icon
                  v-if="searchQuery"
                  :icon="closeCircleOutline"
                  class="clear-icon"
                  @click="searchQuery = ''"
                ></ion-icon>
              </div>

              <!-- Selected Count Badge -->
              <div v-if="selectedItemCount > 0" class="selected-badge">
                <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                <span>{{ selectedItemCount }} items selected</span>
              </div>

              <!-- Content Area -->
              <div class="content-area">
                <!-- Search Results Mode -->
                <div v-if="searchQuery.trim()" class="search-results">
                  <div v-if="filteredItems.length === 0" class="no-results">
                    <ion-icon :icon="searchOutline"></ion-icon>
                    <p>No items found for "{{ searchQuery }}"</p>
                  </div>
                  <div v-else class="search-items-grid">
                    <div
                      v-for="item in filteredItems"
                      :key="`${item.categoryId}-${item.id}`"
                      class="search-item"
                      :class="{ selected: isItemSelected(item.id, item.categoryId) }"
                      @click="toggleSearchItem(item)"
                    >
                      <span class="item-name">{{ item.name }}</span>
                      <span class="item-category">{{ item.categoryName }}</span>
                      <ion-icon v-if="isItemSelected(item.id, item.categoryId)" :icon="checkmarkCircleOutline" class="check-icon"></ion-icon>
                    </div>
                  </div>
                </div>

                <!-- Categories Accordion (when not searching) -->
                <template v-else>
                  <!-- Empty categories state -->
                  <div v-if="filteredCategories.length === 0" class="categories-empty">
                    <ion-icon :icon="layersOutline"></ion-icon>
                    <p>No categories available</p>
                  </div>

                  <!-- Categories Accordion -->
                  <div v-else class="categories-accordion">
                  <div
                    v-for="category in filteredCategories"
                    :key="category.id"
                    class="category-section"
                    :class="{ expanded: expandedCategories.includes(category.id) }"
                  >
                    <!-- Category Header -->
                    <div class="category-header" @click="toggleCategoryExpand(category.id)">
                      <div class="category-info">
                        <ion-icon
                          :icon="expandedCategories.includes(category.id) ? chevronDownOutline : chevronForwardOutline"
                          class="expand-icon"
                        ></ion-icon>
                        <span class="category-name">{{ category.name }}</span>
                      </div>
                      <div class="category-meta">
                        <span v-if="getCategorySelectedCount(category.id)" class="selected-count">
                          {{ getCategorySelectedCount(category.id) }} selected
                        </span>
                        <span class="items-count">{{ category.items?.length || 0 }} items</span>
                      </div>
                    </div>

                    <!-- Category Items (Collapsible) -->
                    <div v-show="expandedCategories.includes(category.id)" class="category-items">
                      <div
                        v-for="item in category.items"
                        :key="item.id"
                        class="item-row"
                        :class="{ selected: isItemSelected(item.id, category.id) }"
                        @click="toggleItem(item, category)"
                      >
                        <span class="item-name">{{ item.name }}</span>
                        <ion-icon
                          :icon="isItemSelected(item.id, category.id) ? checkmarkCircleOutline : addCircleOutline"
                          class="item-action-icon"
                        ></ion-icon>
                      </div>
                    </div>
                  </div>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>

        <div class="modal-footer">
          <div class="step-indicator">
            <span :class="{ active: modalStep === 1 }">1</span>
            <span class="step-line"></span>
            <span :class="{ active: modalStep === 2 }">2</span>
          </div>
          <div class="footer-actions">
            <button v-if="modalStep === 2" class="back-btn" @click="modalStep = 1">
              Back
            </button>
            <button
              v-if="modalStep === 1"
              class="next-btn"
              :disabled="!formData.name.trim()"
              @click="goToStep2"
            >
              Next: Select Items
            </button>
            <button
              v-if="modalStep === 2"
              class="save-btn"
              :disabled="selectedItemCount === 0 || isSaving"
              @click="saveTemplate"
            >
              <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
              <span v-else>{{ editingTemplate ? 'Update Template' : 'Save Template' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content small">
        <div class="modal-header">
          <h3>Delete Template</h3>
          <button class="modal-close" @click="showDeleteModal = false">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>
        <div class="modal-body">
          <p class="delete-message">
            Are you sure you want to delete <strong>{{ templateToDelete?.name }}</strong>?
            This action cannot be undone.
          </p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
          <button class="delete-btn" :disabled="isDeleting" @click="deleteTemplateConfirmed">
            <ion-spinner v-if="isDeleting" name="crescent"></ion-spinner>
            <span v-else>Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonSpinner } from '@ionic/vue';
import {
  addOutline,
  lockClosedOutline,
  sparklesOutline,
  documentsOutline,
  createOutline,
  trashOutline,
  layersOutline,
  listOutline,
  closeOutline,
  searchOutline,
  checkmarkCircleOutline,
  chevronDownOutline,
  chevronForwardOutline,
  closeCircleOutline,
  addCircleOutline,
} from 'ionicons/icons';
import type { ReportTemplate, TemplateCategory } from '~/stores/templates';
import { searchInGujarati } from '~/utils/transliterate';

const { isPremium } = useSubscription();
const { templates, isLoading, fetchTemplates, saveAsTemplate, updateTemplate, deleteTemplate } = useTemplates();
const categoriesStore = useCategoriesStore();
const { showToast } = useToast();

// Modal state
const showModal = ref(false);
const modalStep = ref(1);
const editingTemplate = ref<ReportTemplate | null>(null);
const isSaving = ref(false);

// Form data
const formData = reactive({
  name: '',
  description: '',
});

// Item selection
const selectedCategories = ref<TemplateCategory[]>([]);
const searchQuery = ref('');
const expandedCategories = ref<number[]>([]);

// Delete modal
const showDeleteModal = ref(false);
const templateToDelete = ref<ReportTemplate | null>(null);
const isDeleting = ref(false);

// Computed
const categories = computed(() => categoriesStore.allCategories);
const isLoadingCategories = computed(() => categoriesStore.isLoading);

const filteredCategories = computed(() => {
  return categories.value;
});

// Filtered items for search (flat list across all categories)
const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return [];

  const query = searchQuery.value.trim();
  const results: any[] = [];

  categories.value.forEach((category: any) => {
    category.items?.forEach((item: any) => {
      if (searchInGujarati(item.name, query)) {
        results.push({
          ...item,
          categoryId: category.id,
          categoryName: category.name,
        });
      }
    });
  });

  return results;
});

const selectedItemCount = computed(() => {
  return selectedCategories.value.reduce((total, cat) => total + cat.items.length, 0);
});

// Methods
const openCreateModal = () => {
  editingTemplate.value = null;
  formData.name = '';
  formData.description = '';
  selectedCategories.value = [];
  expandedCategories.value = [];
  modalStep.value = 1;
  showModal.value = true;
};

const editTemplate = (template: ReportTemplate) => {
  editingTemplate.value = template;
  formData.name = template.name;
  formData.description = template.description || '';
  selectedCategories.value = JSON.parse(JSON.stringify(template.categories));
  expandedCategories.value = template.categories.map(c => c.id);
  modalStep.value = 1;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingTemplate.value = null;
};

// Go to step 2 with categories loaded
const goToStep2 = async () => {
  try {
    await categoriesStore.fetchCategories();

    // Set expanded categories after loading
    if (categories.value.length > 0 && expandedCategories.value.length === 0) {
      expandedCategories.value = [categories.value[0].id];
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    showToast('Failed to load categories', 'error');
  }

  // Now show step 2
  modalStep.value = 2;
};

const toggleCategoryExpand = (categoryId: number) => {
  const index = expandedCategories.value.indexOf(categoryId);
  if (index === -1) {
    expandedCategories.value.push(categoryId);
  } else {
    expandedCategories.value.splice(index, 1);
  }
};

const isItemSelected = (itemId: any, categoryId: number) => {
  const category = selectedCategories.value.find(c => c.id === categoryId);
  return category?.items.some((item: any) => String(item.id) === String(itemId)) || false;
};

const getCategorySelectedCount = (categoryId: any) => {
  const category = selectedCategories.value.find((c: any) => c.id === categoryId);
  return category?.items?.length || 0;
};

const isCategoryFullySelected = (category: any) => {
  const selectedCat = selectedCategories.value.find(c => c.id === category.id);
  return selectedCat?.items.length === category.items?.length;
};

const toggleItem = (item: any, category: any) => {
  const selectedData = [...selectedCategories.value];
  const categoryIndex = selectedData.findIndex(c => c.id === category.id);

  const cleanItem = {
    id: item.id,
    name: item.name,
    image: item.image,
  };

  if (categoryIndex !== -1) {
    const itemIndex = selectedData[categoryIndex].items.findIndex((i: any) => String(i.id) === String(item.id));

    if (itemIndex === -1) {
      // Add item
      selectedData[categoryIndex].items.push(cleanItem);
    } else {
      // Remove item
      if (selectedData[categoryIndex].items.length === 1) {
        selectedData.splice(categoryIndex, 1);
      } else {
        selectedData[categoryIndex].items.splice(itemIndex, 1);
      }
    }
  } else {
    // Add new category with item
    selectedData.push({
      id: category.id,
      name: category.name,
      items: [cleanItem],
    });
  }

  selectedCategories.value = selectedData;
};

// Toggle item from search results (includes categoryId and categoryName)
const toggleSearchItem = (item: any) => {
  const selectedData = [...selectedCategories.value];
  const categoryIndex = selectedData.findIndex(c => c.id === item.categoryId);

  const cleanItem = {
    id: item.id,
    name: item.name,
    image: item.image,
  };

  if (categoryIndex !== -1) {
    const itemIndex = selectedData[categoryIndex].items.findIndex((i: any) => String(i.id) === String(item.id));

    if (itemIndex === -1) {
      selectedData[categoryIndex].items.push(cleanItem);
    } else {
      if (selectedData[categoryIndex].items.length === 1) {
        selectedData.splice(categoryIndex, 1);
      } else {
        selectedData[categoryIndex].items.splice(itemIndex, 1);
      }
    }
  } else {
    selectedData.push({
      id: item.categoryId,
      name: item.categoryName,
      items: [cleanItem],
    });
  }

  selectedCategories.value = selectedData;
};

const toggleSelectAllCategory = (category: any) => {
  const isFullySelected = isCategoryFullySelected(category);
  const categoryIndex = selectedCategories.value.findIndex(c => c.id === category.id);

  if (isFullySelected) {
    // Deselect all
    if (categoryIndex !== -1) {
      selectedCategories.value.splice(categoryIndex, 1);
    }
  } else {
    // Select all
    const allItems = category.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      image: item.image,
    }));

    if (categoryIndex !== -1) {
      selectedCategories.value[categoryIndex].items = allItems;
    } else {
      selectedCategories.value.push({
        id: category.id,
        name: category.name,
        items: allItems,
      });
    }
  }
};

const saveTemplate = async () => {
  if (!formData.name.trim() || selectedItemCount.value === 0) return;

  isSaving.value = true;

  if (editingTemplate.value) {
    // Update existing
    const result = await updateTemplate(editingTemplate.value.id!, {
      name: formData.name.trim(),
      description: formData.description.trim(),
      categories: selectedCategories.value,
    });

    if (result.success) {
      closeModal();
      await fetchTemplates(true);
    }
  } else {
    // Create new
    const result = await saveAsTemplate(
      formData.name.trim(),
      selectedCategories.value,
      formData.description.trim()
    );

    if (result.success) {
      closeModal();
    }
  }

  isSaving.value = false;
};

const confirmDelete = (template: ReportTemplate) => {
  templateToDelete.value = template;
  showDeleteModal.value = true;
};

const deleteTemplateConfirmed = async () => {
  if (!templateToDelete.value?.id) return;

  isDeleting.value = true;
  const result = await deleteTemplate(templateToDelete.value.id);

  if (result.success) {
    showDeleteModal.value = false;
    templateToDelete.value = null;
  }
  isDeleting.value = false;
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

// Fetch data on mount
onMounted(async () => {
  // Always fetch categories (needed for the modal)
  await categoriesStore.fetchCategories();

  if (isPremium.value) {
    await fetchTemplates();
  }
});
</script>

<style scoped>
.templates-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}

.header-left h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary, #1a1a1a);
  margin: 0 0 4px 0;
}

.header-left p {
  color: var(--color-text-secondary, #666);
  font-size: 0.9rem;
  margin: 0;
}

.create-btn {
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
  white-space: nowrap;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.create-btn ion-icon {
  font-size: 20px;
}

/* Premium Lock */
.premium-lock {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.lock-content {
  text-align: center;
  max-width: 400px;
}

.lock-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.lock-icon ion-icon {
  font-size: 36px;
  color: #999;
}

.lock-content h2 {
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  color: var(--color-text-primary, #333);
}

.lock-content p {
  margin: 0 0 24px 0;
  color: var(--color-text-secondary, #666);
}

.upgrade-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.35);
}

.upgrade-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.45);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-text-secondary, #666);
}

.loading-state ion-spinner {
  width: 40px;
  height: 40px;
  margin-bottom: 16px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon ion-icon {
  font-size: 36px;
  color: #667eea;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: var(--color-text-primary, #333);
}

.empty-state p {
  margin: 0 0 24px 0;
  color: var(--color-text-secondary, #666);
}

.create-btn-empty {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn-empty:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Templates Grid */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.template-card {
  background: var(--color-surface, white);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
}

.template-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary, #1a1a1a);
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-surface-secondary, #f5f5f5);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary, #666);
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e8e8e8;
  color: #333;
}

.action-btn.delete:hover {
  background: #ffebee;
  color: #f44336;
}

.action-btn ion-icon {
  font-size: 18px;
}

.card-description {
  margin: 0 0 12px 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
  line-height: 1.4;
}

.card-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #888);
}

.stat ion-icon {
  font-size: 18px;
  color: #667eea;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid var(--color-border, #f0f0f0);
}

.date {
  font-size: 0.8rem;
  color: var(--color-text-muted, #999);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--color-surface, white);
  border-radius: 20px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content.large {
  max-width: 600px;
}

.modal-content.small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border, #e8e8e8);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-primary, #1a1a1a);
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--color-surface-secondary, #f5f5f5);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary, #666);
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e8e8e8;
  color: #333;
}

.modal-close ion-icon {
  font-size: 22px;
}

.modal-body {
  flex: 1;
  overflow: hidden;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.step-content {
  min-height: 200px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #333);
  margin-bottom: 8px;
}

.required {
  color: #f44336;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-border, #e8e8e8);
  border-radius: 12px;
  font-size: 15px;
  color: var(--color-text-primary, #333);
  transition: all 0.2s;
  outline: none;
  background: var(--color-surface, white);
}

.form-input:focus,
.form-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: none;
}

/* Step Items - matching StepItemSelection */
.step-items {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-container {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 12px;
  border: 2px solid #e8e8e8;
  transition: all 0.2s;
}

.search-container:focus-within {
  border-color: #667eea;
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
  font-size: 14px;
  color: #333;
  background: transparent;
}

.search-input::placeholder {
  color: #999;
}

.clear-icon {
  font-size: 20px;
  color: #999;
  cursor: pointer;
}

.clear-icon:hover {
  color: #eb445a;
}

.selected-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.15) 100%);
  border-radius: 8px;
  margin-bottom: 12px;
}

.selected-badge ion-icon {
  color: #4CAF50;
  font-size: 18px;
}

.selected-badge span {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4CAF50;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  max-height: 350px;
}

/* Custom scrollbar */
.content-area::-webkit-scrollbar {
  width: 6px;
}

.content-area::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.content-area::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.content-area::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
}

/* Categories Accordion */
.categories-accordion {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-section {
  background: white;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  transition: all 0.2s;
}

.category-section.expanded {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.category-header:hover {
  background: #f8f9fa;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.expand-icon {
  font-size: 18px;
  color: #667eea;
  transition: transform 0.2s;
}

.category-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.category-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
}

.items-count {
  font-size: 0.8rem;
  color: #888;
}

.category-items {
  border-top: 1px solid #f0f0f0;
  max-height: 300px;
  overflow-y: auto;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 12px 44px;
  cursor: pointer;
  transition: all 0.15s;
  border-bottom: 1px solid #f5f5f5;
}

.item-row:last-child {
  border-bottom: none;
}

.item-row:hover {
  background: #f8f9fa;
}

.item-row.selected {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.12) 100%);
}

.item-row .item-name {
  font-size: 0.9rem;
  color: #333;
}

.item-row.selected .item-name {
  color: #2e7d32;
  font-weight: 500;
}

.item-action-icon {
  font-size: 22px;
  color: #ccc;
  transition: all 0.2s;
}

.item-row:hover .item-action-icon {
  color: #667eea;
}

.item-row.selected .item-action-icon {
  color: #4CAF50;
}

/* Search Results */
.search-results {
  padding: 8px 0;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #888;
}

.no-results ion-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.no-results p {
  margin: 0;
  font-size: 0.9rem;
}

.search-items-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.search-item:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.search-item.selected {
  border-color: #4CAF50;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.12) 100%);
}

.search-item .item-name {
  flex: 1;
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.search-item.selected .item-name {
  color: #2e7d32;
}

.search-item .item-category {
  font-size: 0.75rem;
  color: #888;
  margin-right: 12px;
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 4px;
}

.search-item .check-icon {
  font-size: 22px;
  color: #4CAF50;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid var(--color-border, #e8e8e8);
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-indicator span {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  background: var(--color-surface-secondary, #f0f0f0);
  color: var(--color-text-secondary, #888);
}

.step-indicator span.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.step-line {
  width: 24px;
  height: 2px;
  background: var(--color-border, #e0e0e0);
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.back-btn,
.next-btn,
.save-btn,
.cancel-btn,
.delete-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn,
.cancel-btn {
  background: var(--color-surface-secondary, #f5f5f5);
  color: var(--color-text-secondary, #666);
}

.back-btn:hover,
.cancel-btn:hover {
  background: #e8e8e8;
}

.next-btn,
.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.next-btn:hover:not(:disabled),
.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.next-btn:disabled,
.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn {
  background: #f44336;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #d32f2f;
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-message {
  margin: 0;
  font-size: 15px;
  color: var(--color-text-secondary, #555);
  line-height: 1.5;
}

.delete-message strong {
  color: var(--color-text-primary, #333);
}

.categories-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-text-secondary, #666);
}

.categories-loading ion-spinner {
  width: 36px;
  height: 36px;
  margin-bottom: 12px;
}

.categories-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--color-text-secondary, #888);
}

.categories-empty ion-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.categories-empty p {
  margin: 0;
  font-size: 14px;
}

@media (max-width: 600px) {
  .page-header {
    flex-direction: column;
  }

  .create-btn {
    width: 100%;
    justify-content: center;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }

  .items-header {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .selected-count {
    width: 100%;
    justify-content: center;
  }

  .category-items {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
    gap: 16px;
  }

  .footer-actions {
    width: 100%;
  }

  .footer-actions button {
    flex: 1;
  }
}
</style>
