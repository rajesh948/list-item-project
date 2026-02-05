<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div v-if="selectedCategoryData" class="items-container">
        <!-- Category Header with Back Button -->
        <div class="category-header">
          <button class="back-button" @click="goBack">
            <ion-icon :icon="arrowBackOutline"></ion-icon>
          </button>
          <h1 class="category-title">{{ selectedCategoryData.name }}</h1>
        </div>

        <!-- Modern Search Bar -->
        <div class="modern-search-container">
          <ion-icon :icon="searchOutline" class="search-icon"></ion-icon>
          <input
            v-model="searchQuery"
            type="text"
            class="modern-search-input"
            placeholder="Search items..."
          />
          <ion-icon
            v-if="searchQuery"
            :icon="closeCircleOutline"
            class="clear-icon"
            @click="searchQuery = ''"
          ></ion-icon>
        </div>

        <!-- Items List -->
        <div v-if="filteredItems.length > 0">
          <Card
            @addItem="onAddItem"
            v-for="item in filteredItems"
            :key="`${item.categoryId}-${item.id}`"
            :item="item"
            :selected="isItemSelected(item.id, item.categoryId)"
            :categoryName="item.categoryName || selectedCategoryData.name"
            :showCategoryBadge="!!searchQuery.trim()"
          />
        </div>

        <!-- No Results Message -->
        <div v-else class="no-results">
          <ion-icon :icon="searchOutline" size="large"></ion-icon>
          <p>No results found</p>
        </div>
      </div>

      <!-- Floating Report Button -->
      <ion-fab v-if="totalSelectedItems > 0" slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="goToReport">
          <ion-icon :icon="documentTextOutline"></ion-icon>
        </ion-fab-button>
        <div class="item-count-badge">{{ totalSelectedItems }}</div>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon, IonFab, IonFabButton } from '@ionic/vue';
import { searchOutline, closeCircleOutline, documentTextOutline, arrowBackOutline } from 'ionicons/icons';
import { searchInGujarati } from '~/utils/transliterate';

// Authentication is handled by global middleware (02-redirect-login.global.ts)

const route = useRoute();
const searchQuery = ref('');
const categoriesStore = useCategoriesStore();
const reportStore = useReportStore();
const data = computed(() => categoriesStore.allCategories);

const selectedCategoryData = computed(() =>
  data.value.find((category: any) => category.id === +route.params.id)
);

// Filtered items based on search query (supports both English and Gujarati)
// Searches across ALL categories when there's a search query
const filteredItems = computed(() => {
  if (!selectedCategoryData.value) return [];

  // If no search query, return items from current category only with categoryId attached
  if (!searchQuery.value.trim()) {
    const items = selectedCategoryData.value.items || [];
    return items.map((item: any) => ({
      ...item,
      categoryId: selectedCategoryData.value.id
    }));
  }

  // Search across ALL categories
  const query = searchQuery.value.trim();
  const allMatchingItems: any[] = [];

  data.value.forEach((category: any) => {
    category.items.forEach((item: any) => {
      if (searchInGujarati(item.name, query)) {
        // Add category info to each item for display
        allMatchingItems.push({
          ...item,
          categoryName: category.name,
          categoryId: category.id
        });
      }
    });
  });

  return allMatchingItems;
});

const onAddItem = (itemData: any) => {
  const selectedData = [...reportStore.selectedCategories];

  // Use the item's category if available (global search), otherwise use selected category
  const categoryId = itemData.categoryId || selectedCategoryData.value.id;
  const categoryName = itemData.categoryName || selectedCategoryData.value.name;

  const categoryIndex = selectedData.findIndex(
    (item: any) => item.id === categoryId
  );

  // Create clean item data without category metadata
  const cleanItemData = {
    id: itemData.id,
    name: itemData.name,
    image: itemData.image
  };

  if (categoryIndex != -1) {
    const itemIndex = selectedData[categoryIndex].items.findIndex(
      (item: any) => item.id === cleanItemData.id
    );
    if (itemIndex === -1) {
      selectedData[categoryIndex].items.push(cleanItemData);
    } else {
      if (selectedData[categoryIndex].items.length === 1) {
        selectedData.splice(categoryIndex, 1);
      } else {
        selectedData[categoryIndex].items.splice(itemIndex, 1);
      }
    }
  } else {
    selectedData.push({
      id: categoryId,
      name: categoryName,
      items: [cleanItemData],
    });
  }

  reportStore.updateCategories(selectedData);
};

onMounted(() => {
  reportStore.loadFromLocalStorage();
});

const isItemSelected = (itemId: string, categoryId?: number) => {
  const selectedData = reportStore.selectedCategories || [];

  // During global search, check all categories
  if (!categoryId) {
    return selectedData.some((category: any) =>
      category.items.some((item: any) => item.id === itemId)
    );
  }

  // For specific category, check that category only
  const index = selectedData.findIndex((item: any) => item.id === categoryId);
  if (index != -1) {
    const itemIndex = selectedData[index].items.findIndex(
      (item: any) => item.id === itemId
    );
    if (itemIndex != -1) {
      return true;
    }
  }
  return false;
};

// Calculate total selected items from store
const totalSelectedItems = computed(() => reportStore.totalSelectedItems);

const router = useRouter();

const goBack = () => {
  router.back();
};

const goToReport = () => {
  navigateTo('/item-report');
};
</script>

<style scoped>
.items-container {
  max-width: 600px;
  margin: 0 auto;
}

/* Category Header */
.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.back-button:hover {
  transform: translateX(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.back-button ion-icon {
  font-size: 24px;
  color: white;
}

.category-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  flex: 1;
}

/* Modern Search Bar */
.modern-search-container {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 12px 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.modern-search-container:focus-within {
  border-color: #667eea;
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.25);
}

.search-icon {
  font-size: 22px;
  color: #667eea;
  margin-right: 12px;
  flex-shrink: 0;
}

.modern-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  background: transparent;
  font-weight: 500;
}

.modern-search-input::placeholder {
  color: #999;
  font-weight: 400;
}

.clear-icon {
  font-size: 20px;
  color: #999;
  cursor: pointer;
  margin-left: 8px;
  transition: color 0.2s;
  flex-shrink: 0;
}

.clear-icon:hover {
  color: #eb445a;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--ion-color-medium);
}

.no-results ion-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results p {
  font-size: 1rem;
  margin: 0;
}

/* Floating Action Button */
ion-fab {
  overflow: visible !important;
}

ion-fab-button {
  --background: var(--gradient-primary);
  --box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  overflow: visible !important;
  position: relative;
}

.item-count-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #eb445a;
  color: white;
  border-radius: 50%;
  min-width: 26px;
  width: 26px;
  height: 26px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid white;
  box-shadow: 0 3px 8px rgba(235, 68, 90, 0.6), 0 1px 4px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  pointer-events: none;
}
</style>
