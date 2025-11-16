/**
 * Redirect admin users away from regular user pages
 * Runs AFTER auth check (01, 02)
 */
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const { $auth } = useNuxtApp();

    // Skip if going to login or admin pages
    if (to.path === '/login' || to.path.startsWith('/admin')) {
      return;
    }

    // Check if user is admin from localStorage
    const userRole = localStorage.getItem('userRole');

    if (userRole === 'admin' && $auth.currentUser) {
      console.log('🔄 Admin user accessing regular page, redirecting to /admin');
      return navigateTo('/admin');
    }
  }
});
