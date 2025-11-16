/**
 * Global middleware to ensure Firebase Auth is initialized
 * This runs FIRST on EVERY route change (01- prefix ensures it runs first)
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.client) {
    const { $auth } = useNuxtApp();

    // Skip if going to login page
    if (to.path === '/login') {
      return;
    }

    // Wait for Firebase Auth to initialize
    const user = await new Promise((resolve) => {
      if ($auth.currentUser) {
        resolve($auth.currentUser);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(null);
      }, 3000);

      const unsubscribe = $auth.onAuthStateChanged((firebaseUser) => {
        clearTimeout(timeout);
        unsubscribe();
        resolve(firebaseUser);
      });
    });
  }
});
