/**
 * Redirect admin users away from regular user pages
 * Runs AFTER auth check (01, 02)
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.client) {
    const { $auth, $db } = useNuxtApp();
    const userStore = useUserStore();

    // Skip if going to login or admin pages
    if (to.path === '/login' || to.path.startsWith('/admin')) {
      return;
    }

    // If user store has role, use it
    if (userStore.user && userStore.user.role) {
      if (userStore.isAdmin) {
        console.log('🔄 Admin user accessing regular page, redirecting to /admin');
        return navigateTo('/admin');
      }
      return;
    }

    // Otherwise, check role from Firestore
    const currentUser = $auth.currentUser;
    if (currentUser) {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const userDoc = await getDoc(doc($db, 'users', currentUser.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          if (userData.role === 'admin') {
            console.log('🔄 Admin user accessing regular page, redirecting to /admin');
            return navigateTo('/admin');
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    }
  }
});
