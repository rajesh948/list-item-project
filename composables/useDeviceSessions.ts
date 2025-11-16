import { collection, doc, setDoc, deleteDoc, query, where, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';

interface DeviceSession {
  sessionId: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenResolution: string;
  };
  loginTime: Date;
  lastActive: Date;
  ipAddress?: string;
}

export const useDeviceSessions = () => {
  const { $db } = useNuxtApp();

  // Generate a unique session ID
  const generateSessionId = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Get device info
  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };
  };

  // Create a new session on login
  const createSession = async (userId: string): Promise<string> => {
    try {
      const sessionId = generateSessionId();
      const deviceInfo = getDeviceInfo();

      const sessionData = {
        sessionId,
        userId,
        deviceInfo,
        loginTime: Timestamp.now(),
        lastActive: Timestamp.now(),
      };

      console.log('📝 Creating session:', sessionId, 'for user:', userId);
      await setDoc(doc($db, 'activeSessions', sessionId), sessionData);
      console.log('✅ Session document created in Firestore');

      // Store session ID in localStorage
      localStorage.setItem('sessionId', sessionId);

      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  // Update session activity
  const updateSessionActivity = async (sessionId: string) => {
    try {
      const sessionRef = doc($db, 'activeSessions', sessionId);
      await setDoc(sessionRef, {
        lastActive: Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  // Delete session on logout
  const deleteSession = async (sessionId: string) => {
    try {
      await deleteDoc(doc($db, 'activeSessions', sessionId));
      localStorage.removeItem('sessionId');
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // Get all active sessions for a user
  const getUserSessions = async (userId: string): Promise<DeviceSession[]> => {
    try {
      const sessionsRef = collection($db, 'activeSessions');
      const q = query(sessionsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const sessions: DeviceSession[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          sessionId: data.sessionId,
          userId: data.userId,
          deviceInfo: data.deviceInfo,
          loginTime: data.loginTime?.toDate() || new Date(),
          lastActive: data.lastActive?.toDate() || new Date(),
          ipAddress: data.ipAddress,
        });
      });

      return sessions;
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  };

  // Get active session count for a user
  const getActiveSessionCount = async (userId: string): Promise<number> => {
    try {
      const sessions = await getUserSessions(userId);
      // Filter sessions active in last 30 minutes
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const activeSessions = sessions.filter(
        (session) => session.lastActive >= thirtyMinutesAgo
      );
      return activeSessions.length;
    } catch (error) {
      console.error('Error getting session count:', error);
      return 0;
    }
  };

  // Listen to session changes for a user (real-time)
  const listenToUserSessions = (userId: string, callback: (count: number) => void) => {
    const sessionsRef = collection($db, 'activeSessions');
    const q = query(sessionsRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions: DeviceSession[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          sessionId: data.sessionId,
          userId: data.userId,
          deviceInfo: data.deviceInfo,
          loginTime: data.loginTime?.toDate() || new Date(),
          lastActive: data.lastActive?.toDate() || new Date(),
          ipAddress: data.ipAddress,
        });
      });

      // Filter active sessions (last 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const activeSessions = sessions.filter(
        (session) => session.lastActive >= thirtyMinutesAgo
      );

      callback(activeSessions.length);
    });

    return unsubscribe;
  };

  // Clean up old/inactive sessions (can be run periodically)
  const cleanupInactiveSessions = async (userId: string) => {
    try {
      const sessions = await getUserSessions(userId);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      for (const session of sessions) {
        if (session.lastActive < oneDayAgo) {
          await deleteDoc(doc($db, 'activeSessions', session.sessionId));
        }
      }
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
    }
  };

  return {
    createSession,
    updateSessionActivity,
    deleteSession,
    getUserSessions,
    getActiveSessionCount,
    listenToUserSessions,
    cleanupInactiveSessions,
  };
};
