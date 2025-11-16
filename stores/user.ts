import { defineStore } from 'pinia';

export interface UserData {
  uid: string;
  username?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  businessName?: string;
  phoneNumber?: string;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as UserData | null,
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
    isAdmin: (state) => state.user?.role === 'admin',
    userName: (state) => state.user?.username || '',
  },

  actions: {
    setUser(userData: UserData) {
      this.user = userData;
    },

    clearUser() {
      this.user = null;
    },

    setLoading(loading: boolean) {
      this.isLoading = loading;
    },
  },
});
