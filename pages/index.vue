<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="categories-container">
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
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonThumbnail,
  IonImg,
  IonIcon,
  IonFab,
  IonFabButton,
} from '@ionic/vue';
import { searchOutline, closeCircleOutline, documentTextOutline } from 'ionicons/icons';
import { searchInGujarati } from '~/utils/transliterate';

// Authentication is handled by global middleware (02-redirect-login.global.ts)

const categoriesStore = useCategoriesStore();
const reportStore = useReportStore();
const data = computed(() => categoriesStore.allCategories);
const searchQuery = ref('');

// Search results across all categories
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) {
    return [];
  }

  const query = searchQuery.value.trim();
  const allMatchingItems: any[] = [];

  data.value.forEach((category: any) => {
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
  const selectedData = [...reportStore.selectedCategories];

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

  reportStore.updateCategories(selectedData);
};

onMounted(() => {
  reportStore.loadFromLocalStorage();
});

const isItemSelected = (itemId: string, categoryId?: number) => {
  const selectedData = reportStore.selectedCategories || [];

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

// Calculate total selected items from store
const totalSelectedItems = computed(() => reportStore.totalSelectedItems);

const goToReport = () => {
  navigateTo('/item-report');
};
</script>

<style scoped>
.categories-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 0;
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

/* Floating Action Button */
ion-fab-button {
  --background: var(--gradient-primary);
  --box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.item-count-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #eb445a;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
