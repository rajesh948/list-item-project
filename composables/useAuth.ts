import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useUserStore } from '~/stores/user';
import { useCategoriesStore } from '~/stores/categories';

export function useAuth() {
  const { $auth, $db } = useNuxtApp();
  const router = useRouter();
  const userStore = useUserStore();
  const categoriesStore = useCategoriesStore();
  const { createSession, updateSessionActivity, deleteSession } = useDeviceSessions();

  const user = ref<User | null>(null);
  const isLoading = ref(true);

  // Get data from store
  const userRole = computed(() => userStore.user?.role || null);
  const userName = computed(() => userStore.user?.username || '');
  const isActive = computed(() => userStore.user?.isActive || true);
  const isAdmin = computed(() => userStore.isAdmin);

  // Initialize auth state listener
  const initAuth = () => {
    if (process.client) {
      onAuthStateChanged($auth, async (firebaseUser) => {
        if (firebaseUser) {
          user.value = firebaseUser;
          userStore.setLoading(true);

          // Fetch user details from Firestore using UID
          try {
            const userRef = doc($db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();

              // Save to store
              userStore.setUser({
                uid: firebaseUser.uid,
                username: userData.userName,
                role: userData.role || 'user',
                isActive: userData.isActive !== undefined ? userData.isActive : true,
                businessName: userData.businessName || '',
                phoneNumber: userData.phoneNumber || '',
              });

              // Load categories from Firebase and cache in store
              await categoriesStore.fetchCategories();

            } else {
              userStore.setUser({
                uid: firebaseUser.uid,
                username: firebaseUser.email?.split('@')[0] || 'User',
                role: 'user',
                isActive: true,
                businessName: '',
                phoneNumber: '',
              });
            }
          } catch (error) {
            // Error handling
            userStore.setUser({
              uid: firebaseUser.uid,
              username: firebaseUser.email?.split('@')[0] || 'User',
              role: 'user',
              isActive: true,
              businessName: '',
              phoneNumber: '',
            });
          }

          userStore.setLoading(false);
        } else {
          user.value = null;
          userStore.clearUser();
          categoriesStore.clearCategories();
        }
        isLoading.value = false;
      });
    }
  };

  // Login function - username-based with Firebase Auth
  const login = async (username: string, password: string) => {
    try {
      // Convert username to email format for Firebase Auth
      const email = `${username}@catering.local`;

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword($auth, email, password);

      // Fetch user data from Firestore using UID
      const userRef = doc($db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check if user is active
        if (!userData.isActive) {
          await signOut($auth);
          return { success: false, error: 'Your account has been deactivated. Please contact an administrator.' };
        }

        // Save to store
        userStore.setUser({
          uid: userCredential.user.uid,
          username: userData.userName || username,
          role: userData.role || 'user',
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          businessName: userData.businessName || '',
          phoneNumber: userData.phoneNumber || '',
        });

        // Load categories from Firebase and cache in store
        await categoriesStore.fetchCategories();

        // Create session tracking
        try {
          await createSession(userCredential.user.uid);
        } catch (error) {
          // Error handling
        }

        // Return success with redirect path
        return {
          success: true,
          redirectTo: userStore.user?.role === 'admin' && userStore.user?.isActive ? '/admin' : '/'
        };
      } else {
        await signOut($auth);
        return { success: false, error: 'User account not found. Please contact an administrator.' };
      }
    } catch (error: any) {
      let message = 'Login failed. Please try again.';

      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        message = 'Invalid username or password.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'Invalid username or password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      }

      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Delete session before signing out
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        try {
          await deleteSession(sessionId);
        } catch (error) {
          // Error handling
        }
      }

      await signOut($auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = computed(() => user.value !== null);

  return {
    user,
    userRole,
    userName,
    isActive,
    isAdmin,
    isAuthenticated,
    isLoading,
    login,
    logout,
    initAuth,
  };
}
