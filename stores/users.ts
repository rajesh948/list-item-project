import { defineStore } from 'pinia';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '~/firebase';
import type { UserData } from './user';

interface DeviceSession {
  sessionId: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenResolution: string;
  };
  loginTime: Date;
  lastActive: Date;
  ipAddress?: string;
}

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

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as UserData[],
    userSessions: {} as Record<string, DeviceSession[]>,
    userReports: {} as Record<string, SavedReport[]>,
    isLoading: false,
    isLoadingCounts: false,
    lastFetched: null as Date | null,
    lastCountsFetched: null as Date | null,
  }),

  getters: {
    allUsers: (state) => state.users,
    getUserById: (state) => (uid: string) => {
      return state.users.find(user => user.uid === uid);
    },
    totalUsers: (state) => state.users.length,
    activeUsers: (state) => state.users.filter(user => user.isActive).length,
    adminUsers: (state) => state.users.filter(user => user.role === 'admin').length,

    // Get active session count from cached sessions
    getSessionCount: (state) => (uid: string) => {
      const sessions = state.userSessions[uid] || [];
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      return sessions.filter(session => new Date(session.lastActive) >= thirtyMinutesAgo).length;
    },

    // Get reports count from cached reports
    getReportsCount: (state) => (uid: string) => {
      return (state.userReports[uid] || []).length;
    },

    // Get all sessions for a user
    getUserSessions: (state) => (uid: string) => {
      return state.userSessions[uid] || [];
    },

    // Get all reports for a user
    getUserReports: (state) => (uid: string) => {
      return state.userReports[uid] || [];
    },

    // Computed counts for all users (for display in users list)
    sessionCounts: (state) => {
      const counts: Record<string, number> = {};
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      Object.keys(state.userSessions).forEach(uid => {
        counts[uid] = state.userSessions[uid].filter(
          session => new Date(session.lastActive) >= thirtyMinutesAgo
        ).length;
      });
      return counts;
    },

    reportsCounts: (state) => {
      const counts: Record<string, number> = {};
      Object.keys(state.userReports).forEach(uid => {
        counts[uid] = state.userReports[uid].length;
      });
      return counts;
    },
  },

  actions: {
    async fetchUsers(force = false) {
      // If already loaded and not forcing refresh, return cached data
      if (!force && this.users.length > 0 && this.lastFetched) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (this.lastFetched > fiveMinutesAgo) {
          return this.users;
        }
      }

      this.isLoading = true;

      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));

        const fetchedUsers: UserData[] = [];
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedUsers.push({
            uid: doc.id,
            username: data.userName || data.username || '',
            role: data.role || 'user',
            isActive: data.isActive !== undefined ? data.isActive : true,
            businessName: data.businessName || '',
            phoneNumber: data.phoneNumber || '',
          });
        });

        this.users = fetchedUsers;
        this.lastFetched = new Date();

        return this.users;
      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async refreshUsers() {
      return await this.fetchUsers(true);
    },

    async fetchUserCounts(force = false) {
      // If already loaded and not forcing refresh, return cached data
      if (!force && this.lastCountsFetched) {
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        if (this.lastCountsFetched > twoMinutesAgo) {
          return;
        }
      }

      this.isLoadingCounts = true;

      try {
        const { getUserSessions } = useDeviceSessions();
        const { fetchSavedReports } = useSavedReports();

        const userSessions: Record<string, DeviceSession[]> = {};
        const userReports: Record<string, SavedReport[]> = {};

        // Fetch full sessions and reports data for all users
        await Promise.all(
          this.users.map(async (user) => {
            try {
              const [sessions, reports] = await Promise.all([
                getUserSessions(user.uid),
                fetchSavedReports(user.uid),
              ]);
              userSessions[user.uid] = sessions;
              userReports[user.uid] = reports;
            } catch (error) {
              userSessions[user.uid] = [];
              userReports[user.uid] = [];
            }
          })
        );

        this.userSessions = userSessions;
        this.userReports = userReports;
        this.lastCountsFetched = new Date();
      } catch (error) {
        // Error handling
      } finally {
        this.isLoadingCounts = false;
      }
    },

    async refreshUserCounts() {
      return await this.fetchUserCounts(true);
    },

    // Update a specific user's sessions after logout
    async updateUserSessions(uid: string) {
      const { getUserSessions } = useDeviceSessions();
      try {
        this.userSessions[uid] = await getUserSessions(uid);
      } catch (error) {
        // Error handling
      }
    },

    // Update a specific user's reports after deletion
    async updateUserReports(uid: string) {
      const { fetchSavedReports } = useSavedReports();
      try {
        this.userReports[uid] = await fetchSavedReports(uid);
      } catch (error) {
        // Error handling
      }
    },

    clearUsers() {
      this.users = [];
      this.userSessions = {};
      this.userReports = {};
      this.lastFetched = null;
      this.lastCountsFetched = null;
    },
  },
});
