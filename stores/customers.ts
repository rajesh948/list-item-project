import { defineStore } from 'pinia';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';

export interface Customer {
  id?: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  totalOrders: number;
  lastOrderAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const useCustomersStore = defineStore('customers', {
  state: () => ({
    customers: [] as Customer[],
    isLoading: false,
    lastFetched: null as Date | null,
  }),

  getters: {
    allCustomers: (state) => state.customers,

    getCustomerById: (state) => (id: string) =>
      state.customers.find((c) => c.id === id),

    getCustomerByPhone: (state) => (phone: string) =>
      state.customers.find((c) => c.phone === phone),

    totalCustomers: (state) => state.customers.length,

    recentCustomers: (state) =>
      [...state.customers]
        .sort((a, b) => {
          const timeA = a.lastOrderAt?.toMillis?.() || a.createdAt?.toMillis?.() || 0;
          const timeB = b.lastOrderAt?.toMillis?.() || b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        })
        .slice(0, 10),

    searchCustomers: (state) => (searchTerm: string) => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return state.customers;
      return state.customers.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.phone.includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.address?.toLowerCase().includes(term)
      );
    },
  },

  actions: {
    async fetchCustomers(userId: string, force = false) {
      // Cache for 5 minutes
      if (!force && this.customers.length > 0 && this.lastFetched) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (this.lastFetched > fiveMinutesAgo) {
          return this.customers;
        }
      }

      this.isLoading = true;
      try {
        const { $db } = useNuxtApp();
        const q = query(
          collection($db, 'customers'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        this.customers = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Customer)
        );
        this.lastFetched = new Date();
        return this.customers;
      } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    async addCustomer(
      customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'totalOrders' | 'lastOrderAt'>
    ): Promise<{ success: boolean; id?: string; error?: string }> {
      try {
        const { $db } = useNuxtApp();

        // Build customer data, filtering out undefined values
        const customerData: Record<string, any> = {
          userId: customer.userId,
          name: customer.name,
          phone: customer.phone,
          totalOrders: 0,
          lastOrderAt: null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        // Only add optional fields if they have values
        if (customer.email !== undefined && customer.email !== '') {
          customerData.email = customer.email;
        }
        if (customer.address !== undefined && customer.address !== '') {
          customerData.address = customer.address;
        }
        if (customer.notes !== undefined && customer.notes !== '') {
          customerData.notes = customer.notes;
        }

        const docRef = await addDoc(collection($db, 'customers'), customerData);

        // Add to local state
        this.customers.unshift({
          id: docRef.id,
          ...customerData,
        } as Customer);

        return { success: true, id: docRef.id };
      } catch (error: any) {
        console.error('Error adding customer:', error);
        return { success: false, error: error.message };
      }
    },

    async updateCustomer(
      id: string,
      updates: Partial<Customer>
    ): Promise<{ success: boolean; error?: string }> {
      try {
        const { $db } = useNuxtApp();
        const docRef = doc($db, 'customers', id);

        // Filter out undefined values from updates
        const cleanUpdates: Record<string, any> = {
          updatedAt: Timestamp.now(),
        };
        Object.entries(updates).forEach(([key, value]) => {
          if (value !== undefined) {
            cleanUpdates[key] = value;
          }
        });

        await updateDoc(docRef, cleanUpdates);

        // Update local state
        const index = this.customers.findIndex((c) => c.id === id);
        if (index !== -1) {
          this.customers[index] = {
            ...this.customers[index],
            ...cleanUpdates,
          } as Customer;
        }

        return { success: true };
      } catch (error: any) {
        console.error('Error updating customer:', error);
        return { success: false, error: error.message };
      }
    },

    async deleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
      try {
        const { $db } = useNuxtApp();
        await deleteDoc(doc($db, 'customers', id));

        // Remove from local state
        this.customers = this.customers.filter((c) => c.id !== id);

        return { success: true };
      } catch (error: any) {
        console.error('Error deleting customer:', error);
        return { success: false, error: error.message };
      }
    },

    async incrementOrderCount(id: string): Promise<void> {
      const customer = this.customers.find((c) => c.id === id);
      if (customer) {
        await this.updateCustomer(id, {
          totalOrders: (customer.totalOrders || 0) + 1,
          lastOrderAt: Timestamp.now(),
        });
      }
    },

    clearCustomers() {
      this.customers = [];
      this.lastFetched = null;
    },
  },
});
