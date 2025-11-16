import { doc, getDoc } from 'firebase/firestore';
import { db } from '~/firebase';

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.client) {
    const { $auth } = useNuxtApp();
    const userStore = useUserStore();

    // Check if user is logged in
    if (!$auth.currentUser) {
      console.warn('🔒 Admin middleware: No authenticated user, redirecting to login');
      return navigateTo('/login');
    }

    try {
      // Fetch user data from Firestore
      const userRef = doc(db, 'users', $auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.error('❌ User document not found in Firestore');
        return navigateTo('/');
      }

      const userData = userDoc.data();

      console.log('🔐 Admin middleware check:', {
        path: to.path,
        email: $auth.currentUser.email,
        role: userData.role,
        isActive: userData.isActive
      });

      // Check if user has admin role and is active
      if (userData.role !== 'admin' || !userData.isActive) {
        console.warn('❌ Access denied: User is not an admin or is inactive', {
          role: userData.role,
          isActive: userData.isActive
        });
        return navigateTo('/');
      }

      console.log('✅ Admin access granted');
      return; // Allow access
    } catch (error) {
      console.error('❌ Error in admin middleware:', error);
      return navigateTo('/');
    }
  }
});
