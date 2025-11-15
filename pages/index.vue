<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="categories-container">
        <!-- Search Bar -->
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Search..."
          debounce="300"
          class="search-bar"
        ></ion-searchbar>

        <!-- Show items when searching -->
        <div v-if="searchQuery.trim() && searchResults.length > 0" class="search-results">
          <Card
            @addItem="onAddItem"
            v-for="item in searchResults"
            :key="`${item.categoryId}-${item.id}`"
            :item="item"
            :selected="isItemSelected(item.id, item.categoryId)"
            :categoryName="item.categoryName"
            :showCategoryBadge="true"
          />
        </div>

        <!-- Show categories when not searching -->
        <div v-else-if="!searchQuery.trim()">
          <ion-card
            v-for="category in data"
            :key="category.id"
            button
            @click="onSelectCategory(category.id)"
            class="category-card"
          >
            <ion-card-content class="category-content">
              <ion-thumbnail v-if="category.image" class="category-thumbnail">
                <ion-img :src="category.image" :alt="category.name"></ion-img>
              </ion-thumbnail>
              <ion-card-title class="category-title">
                {{ category.name }}
              </ion-card-title>
            </ion-card-content>
          </ion-card>
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
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonThumbnail,
  IonImg,
  IonSearchbar,
  IonIcon,
} from '@ionic/vue';
import { searchOutline } from 'ionicons/icons';
import { searchInGujarati } from '~/utils/transliterate';

const { data } = useData();
const searchQuery = ref('');
const selectedDataFromStorage = ref<any>(null);

// Search results across all categories
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) {
    return [];
  }

  const query = searchQuery.value.trim();
  const allMatchingItems: any[] = [];

  data.forEach((category: any) => {
    category.items.forEach((item: any) => {
      if (searchInGujarati(item.name, query)) {
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

const onSelectCategory = (categoryId: string) => {
  navigateTo(`/list-item/${categoryId}`);
};

const onAddItem = (itemData: any) => {
  const selectedData =
    JSON.parse(localStorage.getItem('selectedData') || '[]');

  const categoryId = itemData.categoryId;
  const categoryName = itemData.categoryName;

  const categoryIndex = selectedData.findIndex(
    (item: any) => item.id === categoryId
  );

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

  if (!categoryId) {
    return selectedData.some((category: any) =>
      category.items.some((item: any) => item.id === itemId)
    );
  }

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
.categories-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 0;
}

.category-card {
  margin: 16px 0;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.category-card:hover {
  transform: scale(1.02);
}

.category-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.category-thumbnail {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.category-title {
  font-size: 1.5rem;
  font-weight: bold;
  flex: 1;
}

.search-bar {
  margin-bottom: 16px;
  --background: var(--ion-color-light);
  --border-radius: 8px;
}

.search-results {
  margin-top: 8px;
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
