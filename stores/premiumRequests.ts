import { defineStore } from 'pinia';
import type { PremiumRequest } from '~/composables/usePremiumRequests';

export const usePremiumRequestsStore = defineStore('premiumRequests', {
  state: () => ({
    requests: [] as PremiumRequest[],
    isLoading: false,
    lastFetched: null as Date | null,
    currentFilter: 'pending' as 'pending' | 'approved' | 'rejected' | 'all',
  }),

  getters: {
    pendingRequests: (state) => state.requests.filter(r => r.status === 'pending'),
    approvedRequests: (state) => state.requests.filter(r => r.status === 'approved'),
    rejectedRequests: (state) => state.requests.filter(r => r.status === 'rejected'),
    pendingCount: (state) => state.requests.filter(r => r.status === 'pending').length,
    filteredRequests: (state) => {
      if (state.currentFilter === 'all') return state.requests;
      return state.requests.filter(r => r.status === state.currentFilter);
    },
  },

  actions: {
    async fetchRequests(filter?: 'pending' | 'approved' | 'rejected' | 'all', force = false) {
      // Cache for 2 minutes
      if (!force && this.lastFetched) {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        if (this.lastFetched > twoMinutesAgo) {
          // Just update filter, no need to refetch
          if (filter) this.currentFilter = filter;
          return this.requests;
        }
      }

      this.isLoading = true;
      if (filter) this.currentFilter = filter;

      try {
        const { fetchAllRequests } = usePremiumRequests();
        // Always fetch ALL requests to keep accurate counts
        this.requests = await fetchAllRequests();
        this.lastFetched = new Date();
        return this.requests;
      } catch (error) {
        console.error('Error fetching premium requests:', error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    async refreshRequests() {
      return this.fetchRequests(this.currentFilter, true);
    },

    setFilter(filter: 'pending' | 'approved' | 'rejected' | 'all') {
      this.currentFilter = filter;
      // Only refetch if we don't have data yet
      if (!this.lastFetched) {
        this.fetchRequests(filter, true);
      }
    },

    updateRequestStatus(requestId: string, status: 'approved' | 'rejected') {
      const index = this.requests.findIndex(r => r.id === requestId);
      if (index !== -1) {
        this.requests[index].status = status;
      }
    },

    clearRequests() {
      this.requests = [];
      this.lastFetched = null;
      this.currentFilter = 'pending';
    },
  },
});
