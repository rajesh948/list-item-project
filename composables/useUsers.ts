import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc, query, where, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '~/firebase';
import type { UserData } from '~/stores/user';

export const useUsers = () => {
  /**
   * Fetch all users from Firestore
   */
  const fetchUsers = async (): Promise<UserData[]> => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      return usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        username: doc.data().userName,
        role: doc.data().role,
        isActive: doc.data().isActive,
        businessName: doc.data().businessName,
        phoneNumber: doc.data().phoneNumber,
      } as UserData));
    } catch (error) {
      return [];
    }
  };

  /**
   * Create a new user in Firebase Auth and Firestore
   */
  const createUser = async (
    username: string,
    password: string,
    role: 'user' | 'admin' = 'user',
    businessName: string = '',
    phoneNumber: string = ''
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if username already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userName', '==', username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return { success: false, error: 'Username already exists' };
      }

      // Get current admin user info and password from Firestore
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'You must be logged in to create users' };
      }

      const adminRef = doc(db, 'users', currentUser.uid);
      const adminDoc = await getDoc(adminRef);
      if (!adminDoc.exists()) {
        return { success: false, error: 'Admin user not found' };
      }

      const adminData = adminDoc.data();
      const adminPassword = adminData.password;
      const adminUsername = adminData.userName;

      if (!adminPassword) {
        return { success: false, error: 'Admin password not found in database' };
      }

      // Convert username to email format for Firebase Auth
      // Use .com domain for valid email format
      const email = `${username}@caterhub.app`;

      // Create user in Firebase Auth (this will automatically sign them in)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create user document in Firestore using UID from Firebase Auth
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        userName: username,
        email: email,
        password: password, // Store password in Firestore
        role,
        isActive: true,
        businessName: businessName || '',
        phoneNumber: phoneNumber || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Sign out the newly created user
      await signOut(auth);

      // Re-login as admin using stored password
      const adminEmail = `${adminUsername}@caterhub.app`;
      try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      } catch (reloginError: any) {
        // If re-login fails, user was still created successfully
        // Just return success since the user creation itself worked
        return { success: true };
      }

      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Failed to create user';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Username already exists';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMessage = 'Could not re-authenticate. Please refresh the page and log in again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid username format';
      }

      return { success: false, error: errorMessage };
    }
  };

  /**
   * Update user data in Firestore
   */
  const updateUser = async (
    uid: string,
    updates: Partial<Pick<UserData, 'username' | 'role' | 'isActive' | 'businessName' | 'phoneNumber'>>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Update user document directly using UID
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }

      // Map username to userName for Firestore
      const firestoreUpdates: any = { ...updates };
      if (firestoreUpdates.username) {
        firestoreUpdates.userName = firestoreUpdates.username;
        delete firestoreUpdates.username;
      }

      await updateDoc(userRef, {
        ...firestoreUpdates,
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update user' };
    }
  };

  /**
   * Delete user from Firestore
   * Note: Deleting from Firebase Auth requires Admin SDK on server side
   */
  const deleteUser = async (uid: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Delete user document directly using UID
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' };
      }

      await deleteDoc(userRef);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete user' };
    }
  };

  return {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};
