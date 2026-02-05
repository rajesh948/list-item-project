/**
 * Customer Management Composable
 * Provides customer-related functionality for premium users
 */

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useCustomersStore, type Customer } from '~/stores/customers';
import { useUserStore } from '~/stores/user';

export function useCustomers() {
  const { $db } = useNuxtApp();
  const customersStore = useCustomersStore();
  const userStore = useUserStore();
  const { isPremium } = useSubscription();

  /**
   * Check if user can access customer features (premium only)
   */
  const canAccessCustomers = computed(() => isPremium.value);

  /**
   * Load customers for current user
   */
  const loadCustomers = async (force = false) => {
    if (!userStore.user?.uid) return [];
    return customersStore.fetchCustomers(userStore.user.uid, force);
  };

  /**
   * Add a new customer
   */
  const addCustomer = async (customerData: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => {
    if (!userStore.user?.uid) {
      return { success: false, error: 'Not authenticated' };
    }

    if (!canAccessCustomers.value) {
      return { success: false, error: 'Premium subscription required' };
    }

    return customersStore.addCustomer({
      ...customerData,
      userId: userStore.user.uid,
    });
  };

  /**
   * Update an existing customer
   */
  const updateCustomer = async (
    id: string,
    updates: Partial<Customer>
  ) => {
    if (!canAccessCustomers.value) {
      return { success: false, error: 'Premium subscription required' };
    }

    return customersStore.updateCustomer(id, updates);
  };

  /**
   * Delete a customer
   */
  const deleteCustomer = async (id: string) => {
    if (!canAccessCustomers.value) {
      return { success: false, error: 'Premium subscription required' };
    }

    return customersStore.deleteCustomer(id);
  };

  /**
   * Get customer's order history (saved reports)
   */
  const getCustomerHistory = async (customerId: string) => {
    if (!userStore.user?.uid) return [];

    try {
      const customer = customersStore.getCustomerById(customerId);
      if (!customer) return [];

      // Fetch saved reports that match this customer's phone or name
      const q = query(
        collection($db, 'savedReports'),
        where('userId', '==', userStore.user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const reports = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter reports that match this customer (by phone or name)
      return reports.filter((report: any) => {
        const userData = report.userData;
        return (
          userData?.phone === customer.phone ||
          userData?.name?.toLowerCase() === customer.name.toLowerCase()
        );
      });
    } catch (error) {
      console.error('Error fetching customer history:', error);
      return [];
    }
  };

  /**
   * Find or create customer from report data
   */
  const findOrCreateFromReport = async (reportData: {
    name: string;
    phone: string;
    address?: string;
  }) => {
    if (!userStore.user?.uid || !canAccessCustomers.value) {
      return null;
    }

    // Check if customer already exists
    await loadCustomers();
    const existingCustomer = customersStore.getCustomerByPhone(reportData.phone);

    if (existingCustomer) {
      // Update last order
      await customersStore.incrementOrderCount(existingCustomer.id!);
      return existingCustomer;
    }

    // Create new customer
    const result = await addCustomer({
      name: reportData.name,
      phone: reportData.phone,
      address: reportData.address,
    });

    if (result.success && result.id) {
      return customersStore.getCustomerById(result.id);
    }

    return null;
  };

  /**
   * Search customers
   */
  const searchCustomers = (term: string) => {
    return customersStore.searchCustomers(term);
  };

  return {
    // State
    customers: computed(() => customersStore.allCustomers),
    recentCustomers: computed(() => customersStore.recentCustomers),
    totalCustomers: computed(() => customersStore.totalCustomers),
    isLoading: computed(() => customersStore.isLoading),

    // Permissions
    canAccessCustomers,

    // Methods
    loadCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerHistory,
    findOrCreateFromReport,
    searchCustomers,
    getCustomerById: customersStore.getCustomerById,
    getCustomerByPhone: customersStore.getCustomerByPhone,
  };
}
