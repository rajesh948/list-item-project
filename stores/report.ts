import { defineStore } from 'pinia';

interface ReportData {
  name: string | null;
  phone: string | null;
  noOfPeople: string | null;
  date: string | null;
  address: string | null;
  price: string | null;
  shift: string | null;
}

interface CategoryItem {
  id: number;
  name: string;
  categoryId?: number;
}

interface Category {
  id: number;
  name: string;
  items: CategoryItem[];
}

interface TableDecoration {
  id: number;
  name: string;
}

export const useReportStore = defineStore('report', {
  state: () => ({
    // Current working report (user's active editing)
    selectedCategories: [] as Category[],
    selectedTable: null as TableDecoration | null,
    userData: {
      name: null,
      phone: null,
      noOfPeople: null,
      date: null,
      address: null,
      price: null,
      shift: null,
    } as ReportData,

    // View mode report (temporary view from saved reports)
    viewModeCategories: [] as Category[],
    viewModeTable: null as TableDecoration | null,
    viewModeUserData: {
      name: null,
      phone: null,
      noOfPeople: null,
      date: null,
      address: null,
      price: null,
      shift: null,
    } as ReportData,
  }),

  getters: {
    totalSelectedItems(): number {
      return this.selectedCategories.reduce((total, category) => {
        return total + (category.items?.length || 0);
      }, 0);
    },

    hasData(): boolean {
      return this.selectedCategories.length > 0;
    },
  },

  actions: {
    // Load from localStorage (current working report)
    loadFromLocalStorage() {
      try {
        const savedCategories = localStorage.getItem('selectedData');
        const savedTable = localStorage.getItem('selectedTable');
        const savedUserData = localStorage.getItem('userData');

        if (savedCategories) {
          this.selectedCategories = JSON.parse(savedCategories);
        }
        if (savedTable) {
          this.selectedTable = JSON.parse(savedTable);
        }
        if (savedUserData) {
          this.userData = JSON.parse(savedUserData);
        }
      } catch (error) {
        // Error handling
      }
    },

    // Save to localStorage (current working report)
    saveToLocalStorage() {
      try {
        localStorage.setItem('selectedData', JSON.stringify(this.selectedCategories));
        localStorage.setItem('selectedTable', JSON.stringify(this.selectedTable));
        localStorage.setItem('userData', JSON.stringify(this.userData));
      } catch (error) {
        // Error handling
      }
    },

    // Set view mode data (temporary, not saved to localStorage)
    setViewModeData(categories: Category[], table: TableDecoration | null, userData: ReportData) {
      this.viewModeCategories = categories;
      this.viewModeTable = table;
      this.viewModeUserData = userData;
    },

    // Clear view mode data
    clearViewModeData() {
      this.viewModeCategories = [];
      this.viewModeTable = null;
      this.viewModeUserData = {
        name: null,
        phone: null,
        noOfPeople: null,
        date: null,
        address: null,
        price: null,
        shift: null,
      };
    },

    // Load report data for editing (from saved report)
    loadReportData(categories: Category[], table: TableDecoration | null, userData: ReportData) {
      this.selectedCategories = categories;
      this.selectedTable = table;
      this.userData = userData;
      this.saveToLocalStorage();
    },

    // Update selected categories
    updateCategories(categories: Category[]) {
      this.selectedCategories = categories;
      this.saveToLocalStorage();
    },

    // Update selected table
    updateTable(table: TableDecoration | null) {
      this.selectedTable = table;
      this.saveToLocalStorage();
    },

    // Update user data
    updateUserData(data: ReportData) {
      this.userData = data;
      this.saveToLocalStorage();
    },

    // Remove item from category
    removeItem(itemId: string | number, categoryId: number) {
      const categoryIndex = this.selectedCategories.findIndex(
        (item) => item.id === categoryId
      );

      if (categoryIndex !== -1) {
        const itemIndex = this.selectedCategories[categoryIndex].items.findIndex(
          (item) => item.id === itemId
        );

        if (itemIndex !== -1) {
          if (this.selectedCategories[categoryIndex].items.length === 1) {
            this.selectedCategories.splice(categoryIndex, 1);
          } else {
            this.selectedCategories[categoryIndex].items.splice(itemIndex, 1);
          }
          this.saveToLocalStorage();
        }
      }
    },

    // Remove table
    removeTable() {
      this.selectedTable = null;
      localStorage.removeItem('selectedTable');
    },

    // Clear all report data
    clearReportData() {
      this.selectedCategories = [];
      this.selectedTable = null;
      this.userData = {
        name: null,
        phone: null,
        noOfPeople: null,
        date: null,
        address: null,
        price: null,
        shift: null,
      };
      localStorage.removeItem('selectedData');
      localStorage.removeItem('selectedTable');
      localStorage.removeItem('userData');
    },
  },
});
