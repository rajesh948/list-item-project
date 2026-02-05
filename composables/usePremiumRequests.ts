import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { useUserStore } from '~/stores/user';

export interface PremiumRequest {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestedPlan: 'monthly' | 'yearly';
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
}

export function usePremiumRequests() {
  const { $db } = useNuxtApp();
  const userStore = useUserStore();

  // Submit a premium request
  const submitPremiumRequest = async (
    requestedPlan: 'monthly' | 'yearly',
    transactionId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!userStore.user?.uid) {
      return { success: false, error: 'User not authenticated' };
    }

    if (!transactionId.trim()) {
      return { success: false, error: 'Transaction ID is required' };
    }

    try {
      const requestData: Omit<PremiumRequest, 'id'> = {
        userId: userStore.user.uid,
        userName: userStore.user.username || '',
        userEmail: userStore.user.email || '',
        requestedPlan,
        transactionId: transactionId.trim(),
        status: 'pending',
        createdAt: Timestamp.now(),
      };

      await addDoc(collection($db, 'premiumRequests'), requestData);

      return { success: true };
    } catch (error: any) {
      console.error('Error submitting premium request:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit request',
      };
    }
  };

  // Fetch user's own premium requests
  const fetchUserRequests = async (): Promise<PremiumRequest[]> => {
    if (!userStore.user?.uid) {
      return [];
    }

    try {
      // Query without orderBy to avoid composite index requirement
      const q = query(
        collection($db, 'premiumRequests'),
        where('userId', '==', userStore.user.uid)
      );

      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PremiumRequest[];

      // Sort client-side by createdAt descending
      return requests.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error('Error fetching user requests:', error);
      return [];
    }
  };

  // Fetch all premium requests (admin only)
  // Always fetches all requests and filters client-side to avoid composite index requirement
  const fetchAllRequests = async (status?: 'pending' | 'approved' | 'rejected'): Promise<PremiumRequest[]> => {
    if (!userStore.isAdmin) {
      return [];
    }

    try {
      // Fetch all requests without status filter to avoid composite index requirement
      const q = query(
        collection($db, 'premiumRequests'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      let requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PremiumRequest[];

      // Filter client-side if status is specified
      if (status) {
        requests = requests.filter(r => r.status === status);
      }

      return requests;
    } catch (error) {
      console.error('Error fetching all requests:', error);
      return [];
    }
  };

  // Approve a premium request (admin only)
  const approveRequest = async (
    requestId: string,
    userId: string,
    plan: 'monthly' | 'yearly'
  ): Promise<{ success: boolean; error?: string }> => {
    if (!userStore.isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      // Calculate subscription dates
      const startDate = Timestamp.now();
      const endDate = new Date();
      if (plan === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Update user's subscription
      const userRef = doc($db, 'users', userId);
      await updateDoc(userRef, {
        subscription: {
          plan,
          startDate,
          endDate: Timestamp.fromDate(endDate),
          status: 'active',
        },
        updatedAt: Timestamp.now(),
      });

      // Update the request status
      const requestRef = doc($db, 'premiumRequests', requestId);
      await updateDoc(requestRef, {
        status: 'approved',
        reviewedAt: Timestamp.now(),
        reviewedBy: userStore.user?.uid,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error approving request:', error);
      return {
        success: false,
        error: error.message || 'Failed to approve request',
      };
    }
  };

  // Reject a premium request (admin only)
  const rejectRequest = async (
    requestId: string,
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!userStore.isAdmin) {
      return { success: false, error: 'Unauthorized' };
    }

    try {
      const requestRef = doc($db, 'premiumRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        adminNotes: adminNotes || '',
        reviewedAt: Timestamp.now(),
        reviewedBy: userStore.user?.uid,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      return {
        success: false,
        error: error.message || 'Failed to reject request',
      };
    }
  };

  // Check if user has a pending request
  const hasPendingRequest = async (): Promise<boolean> => {
    if (!userStore.user?.uid) {
      return false;
    }

    try {
      const q = query(
        collection($db, 'premiumRequests'),
        where('userId', '==', userStore.user.uid),
        where('status', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking pending request:', error);
      return false;
    }
  };

  return {
    submitPremiumRequest,
    fetchUserRequests,
    fetchAllRequests,
    approveRequest,
    rejectRequest,
    hasPendingRequest,
  };
}
