<template>
  <div class="step-items">
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
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import {
  searchOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  addCircleOutline,
  chevronForwardOutline,
  chevronDownOutline,
  arrowBackOutline,
  arrowForwardOutline,
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

// Expand first category by default
onMounted(() => {
  if (props.categories.length > 0) {
    expandedCategories.value = [props.categories[0].id];
  }
});

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
</style>
