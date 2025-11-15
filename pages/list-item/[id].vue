<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div v-if="selectedCategoryData" class="items-container">
        <!-- Search Bar -->
        <ion-searchbar
          v-model="searchQuery"
          placeholder=" Search..."
          debounce="300"
          class="search-bar"
        ></ion-searchbar>

        <!-- Items List -->
        <div v-if="filteredItems.length > 0">
          <Card
            @addItem="onAddItem"
            v-for="item in filteredItems"
            :key="item.id"
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
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonSearchbar, IonIcon } from '@ionic/vue';
import { searchOutline } from 'ionicons/icons';
import { searchInGujarati } from '~/utils/transliterate';

const route = useRoute();
const selectedDataFromStorage = ref<any>(null);
const searchQuery = ref('');
const { data } = useData();

const selectedCategoryData = computed(() =>
  data.find((category: any) => category.id === +route.params.id)
);

// Filtered items based on search query (supports both English and Gujarati)
// Searches across ALL categories when there's a search query
const filteredItems = computed(() => {
  if (!selectedCategoryData.value) return [];

  // If no search query, return items from current category only
  if (!searchQuery.value.trim()) {
    return selectedCategoryData.value.items || [];
  }

  // Search across ALL categories
  const query = searchQuery.value.trim();
  const allMatchingItems: any[] = [];

  data.forEach((category: any) => {
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
  const selectedData =
    JSON.parse(localStorage.getItem('selectedData') || '[]');

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

  localStorage.setItem('selectedData', JSON.stringify(selectedData));
  selectedDataFromStorage.value = selectedData;
};

onMounted(() => {
  selectedDataFromStorage.value =
    JSON.parse(localStorage.getItem('selectedData') || '[]');
});

const isItemSelected = (itemId: string, categoryId?: number) => {
  const selectedData = selectedDataFromStorage.value || [];

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
</script>

<style scoped>
.items-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-bar {
  margin-bottom: 16px;
  --background: var(--ion-color-light);
  --border-radius: 8px;
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
</style>
