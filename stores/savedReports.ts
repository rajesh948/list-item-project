import { defineStore } from 'pinia';

interface SavedReport {
  id?: string;
  userId: string;
  userName: string;
  reportData: any;
  selectedCategories: any[];
  selectedTable?: any;
  createdAt: Date;
  updatedAt: Date;
}

export const useSavedReportsStore = defineStore('savedReports', {
  state: () => ({
    reports: [] as SavedReport[],
    isLoading: false,
    lastFetched: null as Date | null,
  }),

  getters: {
    allReports: (state) => state.reports,
    totalReports: (state) => state.reports.length,
  },

  actions: {
    async fetchReports(userId: string, force = false) {
      // If already loaded and not forcing refresh, return cached data
      if (!force && this.reports.length > 0 && this.lastFetched) {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        if (this.lastFetched > twoMinutesAgo) {
          return this.reports;
        }
      }

      this.isLoading = true;

      try {
        const { fetchSavedReports } = useSavedReports();

        const fetchedReports = await fetchSavedReports(userId);
        this.reports = fetchedReports;
        this.lastFetched = new Date();

        return this.reports;
      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async refreshReports(userId: string) {
      return await this.fetchReports(userId, true);
    },

    clearReports() {
      this.reports = [];
      this.lastFetched = null;
    },
  },
});
