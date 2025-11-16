import { doc, getDoc } from 'firebase/firestore';
import { db } from '~/firebase';

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.client) {
    const { $auth } = useNuxtApp();
    const userStore = useUserStore();

    // Check if user is logged in
    if (!$auth.currentUser) {
      return navigateTo('/login');
    }

    try {
      // Fetch user data from Firestore
      const userRef = doc(db, 'users', $auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return navigateTo('/');
      }

      const userData = userDoc.data();

      // Check if user has admin role and is active
      if (userData.role !== 'admin' || !userData.isActive) {
        return navigateTo('/');
      }

      return; // Allow access
    } catch (error) {
      return navigateTo('/');
    }
  }
});
