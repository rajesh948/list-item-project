<template>
  <div class="step-items">
    <!-- Template Section (Premium Only) -->
    <div v-if="isPremium" class="template-section">
      <div class="template-row">
        <div class="template-dropdown" ref="dropdownRef">
          <div class="dropdown-trigger" @click="toggleDropdown">
            <ion-icon :icon="documentsOutline" class="template-icon"></ion-icon>
            <span class="dropdown-text">Load from template...</span>
            <ion-icon :icon="chevronDownOutline" class="dropdown-arrow" :class="{ open: isDropdownOpen }"></ion-icon>
          </div>
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <div v-if="templates.length === 0" class="dropdown-empty">
              <ion-icon :icon="documentsOutline"></ion-icon>
              <span>No templates yet</span>
            </div>
            <div
              v-else
              v-for="template in templates"
              :key="template.id"
              class="dropdown-item"
              @click="selectTemplate(template.id)"
            >
              <div class="item-info">
                <span class="item-name">{{ template.name }}</span>
                <span class="item-count">{{ template.itemCount }} items</span>
              </div>
              <ion-icon :icon="arrowForwardOutline" class="item-arrow"></ion-icon>
            </div>
          </div>
        </div>
        <button
          v-if="totalSelected > 0"
          class="save-template-btn"
          @click="showSaveModal = true"
        >
          <ion-icon :icon="saveOutline"></ion-icon>
          <span class="btn-text">Save</span>
        </button>
      </div>
    </div>

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
    <div v-if="totalSelected > 0" class="selected-badge">
      <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
      <span>{{ totalSelected }} items selected</span>
    </div>

    <!-- Content Area -->
    <div class="content-area">
      <!-- Search Results -->
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
            @click="toggleItem(item)"
          >
            <span class="item-name">{{ item.name }}</span>
            <span class="item-category">{{ item.categoryName }}</span>
            <ion-icon v-if="isItemSelected(item.id, item.categoryId)" :icon="checkmarkCircleOutline" class="check-icon"></ion-icon>
          </div>
        </div>
      </div>

      <!-- Category Accordion View -->
      <div v-else class="categories-accordion">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-section"
          :class="{ expanded: expandedCategories.includes(category.id) }"
        >
          <!-- Category Header -->
          <div class="category-header" @click="toggleCategory(category.id)">
            <div class="category-info">
              <ion-icon :icon="expandedCategories.includes(category.id) ? chevronDownOutline : chevronForwardOutline" class="expand-icon"></ion-icon>
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
              @click="toggleItem({ ...item, categoryId: category.id, categoryName: category.name })"
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
    </div>

    <!-- Navigation Buttons -->
    <div class="nav-buttons">
      <button class="back-btn" @click="$emit('back')">
        <ion-icon :icon="arrowBackOutline"></ion-icon>
        <span>Back</span>
      </button>
      <button class="next-btn" :disabled="totalSelected === 0" @click="$emit('next')">
        <span>Next: Preview</span>
        <ion-icon :icon="arrowForwardOutline"></ion-icon>
      </button>
    </div>

    <!-- Save Template Modal -->
    <div v-if="showSaveModal" class="modal-overlay" @click.self="showSaveModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Save as Template</h3>
          <button class="modal-close" @click="showSaveModal = false">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Template Name</label>
            <input
              v-model="templateName"
              type="text"
              class="form-input"
              placeholder="e.g., Wedding Menu, Birthday Party"
              maxlength="50"
            />
          </div>
          <div class="form-group">
            <label>Description (optional)</label>
            <textarea
              v-model="templateDescription"
              class="form-textarea"
              placeholder="Brief description of this template..."
              rows="2"
              maxlength="200"
            ></textarea>
          </div>
          <p class="template-info">
            <ion-icon :icon="informationCircleOutline"></ion-icon>
            This will save {{ totalSelected }} items as a reusable template.
          </p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showSaveModal = false">Cancel</button>
          <button
            class="save-btn"
            :disabled="!templateName.trim() || isSaving"
            @click="handleSaveTemplate"
          >
            <ion-spinner v-if="isSaving" name="crescent"></ion-spinner>
            <span v-else>Save Template</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Load Template Confirmation Modal -->
    <div v-if="showLoadConfirmModal" class="modal-overlay" @click.self="showLoadConfirmModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Load Template</h3>
          <button class="modal-close" @click="showLoadConfirmModal = false">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>
        <div class="modal-body">
          <p class="confirm-message">
            You have <strong>{{ totalSelected }} items</strong> already selected. How would you like to load <strong>"{{ pendingTemplateName }}"</strong>?
          </p>
          <div class="load-options">
            <button class="option-btn replace" @click="handleLoadTemplate('replace')">
              <ion-icon :icon="refreshOutline"></ion-icon>
              <div class="option-text">
                <span class="option-title">Replace All</span>
                <span class="option-desc">Remove current selection and load template</span>
              </div>
            </button>
            <button class="option-btn add" @click="handleLoadTemplate('add')">
              <ion-icon :icon="addOutline"></ion-icon>
              <div class="option-text">
                <span class="option-title">Add to Selection</span>
                <span class="option-desc">Keep current items and add template items</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonSpinner } from '@ionic/vue';
import {
  searchOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  addCircleOutline,
  chevronForwardOutline,
  chevronDownOutline,
  arrowBackOutline,
  arrowForwardOutline,
  documentsOutline,
  saveOutline,
  closeOutline,
  informationCircleOutline,
  refreshOutline,
  addOutline,
} from 'ionicons/icons';
import { searchInGujarati } from '~/utils/transliterate';

interface SelectedCategory {
  id: number;
  name: string;
  items: { id: string; name: string; image?: string }[];
}

const props = defineProps<{
  modelValue: SelectedCategory[];
  categories: any[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: SelectedCategory[]];
  next: [];
  back: [];
}>();

const searchQuery = ref('');
const expandedCategories = ref<number[]>([]);

// Template functionality
const { isPremium } = useSubscription();
const { templates, fetchTemplates, saveAsTemplate, loadTemplateItems } = useTemplates();
const { showToast } = useToast();

const showSaveModal = ref(false);
const templateName = ref('');
const templateDescription = ref('');
const isSaving = ref(false);

// Custom dropdown state
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

// Load template confirmation modal
const showLoadConfirmModal = ref(false);
const pendingTemplateId = ref<string | null>(null);
const pendingTemplateName = ref('');

// Fetch templates on mount (for premium users)
onMounted(async () => {
  if (props.categories.length > 0) {
    expandedCategories.value = [props.categories[0].id];
  }

  if (isPremium.value) {
    await fetchTemplates();
  }
});

// Dropdown methods
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectTemplate = (templateId: string) => {
  const template = templates.value.find(t => t.id === templateId);
  if (!template) return;

  // If no items currently selected, load directly
  if (totalSelected.value === 0) {
    const templateCategories = loadTemplateItems(templateId);
    if (templateCategories) {
      emit('update:modelValue', templateCategories);
      showToast('Template loaded!', 'success');
    }
    isDropdownOpen.value = false;
    return;
  }

  // Show confirmation modal if items are already selected
  pendingTemplateId.value = templateId;
  pendingTemplateName.value = template.name;
  showLoadConfirmModal.value = true;
  isDropdownOpen.value = false;
};

// Handle template load confirmation
const handleLoadTemplate = (mode: 'replace' | 'add') => {
  if (!pendingTemplateId.value) return;

  const templateCategories = loadTemplateItems(pendingTemplateId.value);
  if (!templateCategories) {
    showLoadConfirmModal.value = false;
    return;
  }

  if (mode === 'replace') {
    // Replace all existing items
    emit('update:modelValue', templateCategories);
    showToast('Template loaded!', 'success');
  } else {
    // Add to existing selection (merge)
    const currentData = [...props.modelValue];

    templateCategories.forEach((templateCat: any) => {
      const existingCatIndex = currentData.findIndex(c => c.id === templateCat.id);

      if (existingCatIndex !== -1) {
        // Merge items into existing category
        templateCat.items.forEach((templateItem: any) => {
          const itemExists = currentData[existingCatIndex].items.some(
            (i: any) => String(i.id) === String(templateItem.id)
          );
          if (!itemExists) {
            currentData[existingCatIndex].items.push(templateItem);
          }
        });
      } else {
        // Add new category
        currentData.push(templateCat);
      }
    });

    emit('update:modelValue', currentData);
    showToast('Template items added!', 'success');
  }

  showLoadConfirmModal.value = false;
  pendingTemplateId.value = null;
  pendingTemplateName.value = '';
};

// Close dropdown on click outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Handle save template
const handleSaveTemplate = async () => {
  if (!templateName.value.trim()) return;

  isSaving.value = true;
  const result = await saveAsTemplate(
    templateName.value,
    props.modelValue,
    templateDescription.value
  );

  if (result.success) {
    showSaveModal.value = false;
    templateName.value = '';
    templateDescription.value = '';
    // Refresh templates list
    await fetchTemplates(true);
  }
  isSaving.value = false;
};

// Watch for categories changes
watch(() => props.categories, (newCats) => {
  if (newCats.length > 0 && expandedCategories.value.length === 0) {
    expandedCategories.value = [newCats[0].id];
  }
}, { immediate: true });

const toggleCategory = (categoryId: number) => {
  const index = expandedCategories.value.indexOf(categoryId);
  if (index === -1) {
    expandedCategories.value.push(categoryId);
  } else {
    expandedCategories.value.splice(index, 1);
  }
};

const totalSelected = computed(() => {
  return props.modelValue.reduce((total, cat) => total + cat.items.length, 0);
});

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return [];

  const query = searchQuery.value.trim();
  const results: any[] = [];

  props.categories.forEach((category: any) => {
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

const isItemSelected = (itemId: string, categoryId: number) => {
  const category = props.modelValue.find((c) => c.id === categoryId);
  return category?.items.some((item) => item.id === itemId) || false;
};

const getCategorySelectedCount = (categoryId: number) => {
  const category = props.modelValue.find((c) => c.id === categoryId);
  return category?.items.length || 0;
};

const toggleItem = (item: { id: string; name: string; image?: string; categoryId: number; categoryName: string }) => {
  const selectedData = [...props.modelValue];
  const categoryIndex = selectedData.findIndex((c) => c.id === item.categoryId);

  const cleanItem = {
    id: item.id,
    name: item.name,
    image: item.image,
  };

  if (categoryIndex !== -1) {
    const itemIndex = selectedData[categoryIndex].items.findIndex((i) => i.id === item.id);

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

  emit('update:modelValue', selectedData);
};
</script>

<style scoped>
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
  margin-bottom: 16px;
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

/* Navigation */
.nav-buttons {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.back-btn,
.next-btn {
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

.next-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.next-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.next-btn ion-icon,
.back-btn ion-icon {
  font-size: 18px;
}

@media (max-width: 480px) {
  .category-header {
    padding: 12px 14px;
  }

  .item-row {
    padding: 10px 14px 10px 36px;
  }

  .category-meta {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
}

/* Template Section */
.template-section {
  margin-bottom: 12px;
}

.template-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Custom Dropdown */
.template-dropdown {
  flex: 1;
  position: relative;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 10px;
  padding: 10px 14px;
  border: 2px solid #e8e8e8;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-trigger:hover {
  border-color: #667eea;
}

.template-icon {
  font-size: 20px;
  color: #667eea;
  margin-right: 10px;
  flex-shrink: 0;
}

.dropdown-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.dropdown-arrow {
  font-size: 18px;
  color: #888;
  transition: transform 0.2s;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
}

/* Custom scrollbar for dropdown */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
}

.dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  color: #888;
  gap: 8px;
}

.dropdown-empty ion-icon {
  font-size: 28px;
  opacity: 0.5;
}

.dropdown-empty span {
  font-size: 13px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.15s;
  border-bottom: 1px solid #f0f0f0;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
}

.dropdown-item .item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-item .item-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.dropdown-item .item-count {
  font-size: 12px;
  color: #888;
}

.dropdown-item .item-arrow {
  font-size: 18px;
  color: #667eea;
  opacity: 0;
  transition: opacity 0.15s;
}

.dropdown-item:hover .item-arrow {
  opacity: 1;
}

.save-template-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.save-template-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.save-template-btn ion-icon {
  font-size: 18px;
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
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e8e8e8;
  color: #333;
}

.modal-close ion-icon {
  font-size: 20px;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-of-type {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 14px;
  color: #333;
  transition: all 0.2s;
  outline: none;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #667eea;
}

.form-textarea {
  resize: none;
}

.template-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 8px;
  font-size: 13px;
  color: #555;
  margin: 0;
}

.template-info ion-icon {
  font-size: 18px;
  color: #667eea;
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e8e8e8;
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-btn ion-spinner {
  width: 20px;
  height: 20px;
}

/* Load Template Confirmation Modal */
.confirm-message {
  margin: 0 0 20px 0;
  font-size: 15px;
  color: #555;
  line-height: 1.5;
}

.confirm-message strong {
  color: #333;
}

.load-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.option-btn:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.option-btn.replace:hover {
  border-color: #ff9800;
}

.option-btn.add:hover {
  border-color: #4CAF50;
}

.option-btn ion-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.option-btn.replace ion-icon {
  color: #ff9800;
}

.option-btn.add ion-icon {
  color: #4CAF50;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.option-desc {
  font-size: 13px;
  color: #888;
}

@media (max-width: 480px) {
  .template-row {
    flex-direction: column;
  }

  .template-select-wrapper {
    width: 100%;
  }

  .save-template-btn {
    width: 100%;
    justify-content: center;
  }

  .save-template-btn .btn-text {
    display: inline;
  }
}
</style>
