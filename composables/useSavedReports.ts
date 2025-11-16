import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '~/firebase';

export interface SavedReport {
  id?: string;
  userId: string;
  userName: string;
  reportData: {
    name: string;
    address: string;
    phone: string;
    date: string;
    noOfPeople: string;
    shift: string;
    price: string;
  };
  selectedCategories: Array<{
    id: number;
    name: string;
    items: Array<{
      id: number;
      name: string;
      categoryId?: number;
    }>;
  }>;
  selectedTable?: {
    id: number;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export const useSavedReports = () => {
  const fetchSavedReports = async (userId?: string): Promise<SavedReport[]> => {
    try {
      const reportsRef = collection(db, 'savedReports');
      let q;

      if (userId) {
        // Try without orderBy first to avoid index issues
        q = query(reportsRef, where('userId', '==', userId));
      } else {
        q = query(reportsRef);
      }

      const querySnapshot = await getDocs(q);

      const reports = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          reportData: data.reportData,
          selectedCategories: data.selectedCategories || [],
          selectedTable: data.selectedTable || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as SavedReport;
      });

      // Sort manually by createdAt descending
      reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return reports;
    } catch (error) {
      return [];
    }
  };

  const getSavedReport = async (reportId: string): Promise<SavedReport | null> => {
    try {
      const reportRef = doc(db, 'savedReports', reportId);
      const reportDoc = await getDoc(reportRef);

      if (!reportDoc.exists()) {
        return null;
      }

      const data = reportDoc.data();
      return {
        id: reportDoc.id,
        userId: data.userId,
        userName: data.userName,
        reportData: data.reportData,
        selectedCategories: data.selectedCategories || [],
        selectedTable: data.selectedTable || null,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as SavedReport;
    } catch (error) {
      return null;
    }
  };

  const saveReport = async (
    userId: string,
    userName: string,
    reportData: SavedReport['reportData'],
    selectedCategories: SavedReport['selectedCategories'],
    selectedTable?: SavedReport['selectedTable']
  ): Promise<{ success: boolean; error?: string; id?: string }> => {
    try {
      const newReport = {
        userId,
        userName,
        reportData,
        selectedCategories,
        selectedTable: selectedTable || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'savedReports'), newReport);

      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to save report' };
    }
  };

  const updateReport = async (
    reportId: string,
    reportData: SavedReport['reportData'],
    selectedCategories: SavedReport['selectedCategories'],
    selectedTable?: SavedReport['selectedTable']
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const reportRef = doc(db, 'savedReports', reportId);

      await updateDoc(reportRef, {
        reportData,
        selectedCategories,
        selectedTable: selectedTable || null,
        updatedAt: Timestamp.now(),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update report' };
    }
  };

  const deleteReport = async (reportId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const reportRef = doc(db, 'savedReports', reportId);
      await deleteDoc(reportRef);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete report' };
    }
  };

  const getReportsCount = async (userId: string): Promise<number> => {
    try {
      const reportsRef = collection(db, 'savedReports');
      const q = query(reportsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      return 0;
    }
  };

  return {
    fetchSavedReports,
    getSavedReport,
    saveReport,
    updateReport,
    deleteReport,
    getReportsCount,
  };
};
