/**
 * Global middleware to redirect to login if not authenticated
 * Checks Firebase Auth for authentication state
 */
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const { $auth } = useNuxtApp();

    // Public routes that don't require authentication
    const publicRoutes = ['/login'];

    // Check if trying to access a public route
    if (publicRoutes.includes(to.path)) {
      return; // Allow access to public routes
    }

    // Check if user is authenticated via Firebase Auth
    if (!$auth.currentUser) {
      return navigateTo('/login');
    }
  }
});
