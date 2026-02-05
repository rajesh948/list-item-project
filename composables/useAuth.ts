import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  type User
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
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
                email: userData.email || firebaseUser.email || '',
                role: userData.role || 'user',
                isActive: userData.isActive !== undefined ? userData.isActive : true,
                businessName: userData.businessName || '',
                phoneNumber: userData.phoneNumber || '',
                emailVerified: userData.emailVerified || firebaseUser.emailVerified || false,
                subscription: userData.subscription || { plan: 'free', startDate: null, endDate: null, status: 'active' },
                pdfUsage: userData.pdfUsage || { count: 0, periodStart: Timestamp.now() },
                registrationSource: userData.registrationSource || 'admin',
              });

              // Load categories from Firebase and cache in store
              await categoriesStore.fetchCategories();

            } else {
              userStore.setUser({
                uid: firebaseUser.uid,
                username: firebaseUser.email?.split('@')[0] || 'User',
                email: firebaseUser.email || '',
                role: 'user',
                isActive: true,
                businessName: '',
                phoneNumber: '',
                emailVerified: firebaseUser.emailVerified || false,
                subscription: { plan: 'free', startDate: null, endDate: null, status: 'active' },
                pdfUsage: { count: 0, periodStart: Timestamp.now() },
                registrationSource: 'self',
              });
            }
          } catch (error) {
            // Error handling
            userStore.setUser({
              uid: firebaseUser.uid,
              username: firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              role: 'user',
              isActive: true,
              businessName: '',
              phoneNumber: '',
              emailVerified: firebaseUser.emailVerified || false,
              subscription: { plan: 'free', startDate: null, endDate: null, status: 'active' },
              pdfUsage: { count: 0, periodStart: Timestamp.now() },
              registrationSource: 'self',
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

  // Login function - supports both username and email
  const login = async (identifier: string, password: string) => {
    try {
      // Check if identifier is an email or username
      let email = identifier;
      if (!identifier.includes('@')) {
        // Username login - use old format
        email = `${identifier}@caterhub.app`;
      }

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

        // Check email verification for self-registered users
        if (userData.registrationSource === 'self' && !userCredential.user.emailVerified) {
          await signOut($auth);
          return {
            success: false,
            error: 'Please verify your email before logging in. Check your inbox for the verification link.',
            needsVerification: true
          };
        }

        // Clear any previous user's report data from localStorage
        localStorage.removeItem('selectedData');
        localStorage.removeItem('selectedTable');
        localStorage.removeItem('userData');

        // Save to store
        userStore.setUser({
          uid: userCredential.user.uid,
          username: userData.userName || identifier.split('@')[0],
          email: userData.email || userCredential.user.email || '',
          role: userData.role || 'user',
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          businessName: userData.businessName || '',
          phoneNumber: userData.phoneNumber || '',
          emailVerified: userData.emailVerified || userCredential.user.emailVerified || false,
          subscription: userData.subscription || { plan: 'free', startDate: null, endDate: null, status: 'active' },
          pdfUsage: userData.pdfUsage || { count: 0, periodStart: Timestamp.now() },
          registrationSource: userData.registrationSource || 'admin',
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

      // Clear report data from localStorage
      localStorage.removeItem('selectedData');
      localStorage.removeItem('selectedTable');
      localStorage.removeItem('userData');
      localStorage.removeItem('sessionId');

      await signOut($auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = computed(() => user.value !== null);

  // Register with email - for self-registration
  const registerWithEmail = async (
    email: string,
    password: string,
    businessName?: string,
    phoneNumber?: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword($auth, email, password);

      // Send verification email
      await sendEmailVerification(userCredential.user);

      // Create user document in Firestore
      const userRef = doc($db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        uid: userCredential.user.uid,
        userName: email.split('@')[0],
        email: email,
        role: 'user',
        isActive: true,
        emailVerified: false,
        businessName: businessName || '',
        phoneNumber: phoneNumber || '',
        subscription: {
          plan: 'free',
          startDate: null,
          endDate: null,
          status: 'active',
        },
        pdfUsage: {
          count: 0,
          periodStart: Timestamp.now(),
        },
        registrationSource: 'self',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Sign out after registration - user needs to verify email first
      await signOut($auth);

      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
      };
    } catch (error: any) {
      let message = 'Registration failed. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please login or use forgot password.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }

      return { success: false, error: message };
    }
  };

  // Request password reset
  const requestPasswordReset = async (email: string) => {
    try {
      // Check if it's a username, convert to email
      let resetEmail = email;
      if (!email.includes('@')) {
        resetEmail = `${email}@caterhub.app`;
      }

      await sendPasswordResetEmail($auth, resetEmail);
      return {
        success: true,
        message: 'Password reset email sent! Check your inbox.',
      };
    } catch (error: any) {
      let message = 'Failed to send reset email. Please try again.';

      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }

      return { success: false, error: message };
    }
  };

  // Resend verification email (requires signed-in user)
  const resendVerificationEmail = async () => {
    try {
      const currentUser = $auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'No user is currently signed in.' };
      }

      await sendEmailVerification(currentUser);
      return {
        success: true,
        message: 'Verification email sent! Check your inbox.',
      };
    } catch (error: any) {
      let message = 'Failed to send verification email.';

      if (error.code === 'auth/too-many-requests') {
        message = 'Too many requests. Please try again later.';
      }

      return { success: false, error: message };
    }
  };

  // Resend verification email with credentials (for users who are signed out)
  const resendVerificationWithCredentials = async (email: string, password: string) => {
    try {
      // Sign in temporarily
      const userCredential = await signInWithEmailAndPassword($auth, email, password);

      // Check if already verified
      if (userCredential.user.emailVerified) {
        await signOut($auth);
        return {
          success: true,
          message: 'Your email is already verified! You can now sign in.',
        };
      }

      // Send verification email
      await sendEmailVerification(userCredential.user);

      // Sign out again
      await signOut($auth);

      return {
        success: true,
        message: 'Verification email sent! Check your inbox.',
      };
    } catch (error: any) {
      // Make sure to sign out if something goes wrong
      try {
        await signOut($auth);
      } catch {}

      let message = 'Failed to send verification email.';

      if (error.code === 'auth/too-many-requests') {
        message = 'Too many requests. Please wait a few minutes and try again.';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }

      return { success: false, error: message };
    }
  };

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
    registerWithEmail,
    requestPasswordReset,
    resendVerificationEmail,
    resendVerificationWithCredentials,
  };
}
