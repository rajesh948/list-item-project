import { defineStore } from 'pinia';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '~/firebase';

export interface CategoryItem {
  id: number;
  name: string;
  image: string | null;
}

export interface Category {
  id: number;
  docId?: string; // Firestore document ID
  name: string;
  items: CategoryItem[];
}

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    isLoading: false,
    lastFetched: null as Date | null,
  }),

  getters: {
    allCategories: (state) => state.categories,
    getCategoryById: (state) => (id: number) => {
      return state.categories.find(cat => cat.id === id);
    },
    totalCategories: (state) => state.categories.length,
    totalItems: (state) => {
      return state.categories.reduce((total, category) => total + category.items.length, 0);
    },
  },

  actions: {
    async fetchCategories(force = false) {
      // If already loaded and not forcing refresh, return cached data
      if (!force && this.categories.length > 0 && this.lastFetched) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (this.lastFetched > fiveMinutesAgo) {
          console.log('📦 Using cached categories');
          return this.categories;
        }
      }

      this.isLoading = true;

      try {
        console.log('🔄 Fetching categories from Firebase...');
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));

        const fetchedCategories: Category[] = [];
        categoriesSnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedCategories.push({
            id: data.id,
            docId: doc.id, // Save Firestore document ID
            name: data.name,
            items: data.items || [],
          });
        });

        // Sort by id
        fetchedCategories.sort((a, b) => a.id - b.id);

        this.categories = fetchedCategories;
        this.lastFetched = new Date();

        console.log(`✅ Loaded ${fetchedCategories.length} categories from Firebase`);

        return this.categories;
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async refreshCategories() {
      return await this.fetchCategories(true);
    },

    clearCategories() {
      this.categories = [];
      this.lastFetched = null;
    },
  },
});
