import { defineStore } from 'pinia';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export interface TemplateItem {
  id: string;
  name: string;
  image?: string;
}

export interface TemplateCategory {
  id: number;
  name: string;
  items: TemplateItem[];
}

export interface ReportTemplate {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  categories: TemplateCategory[];
  itemCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const useTemplatesStore = defineStore('templates', {
  state: () => ({
    templates: [] as ReportTemplate[],
    isLoading: false,
    lastFetched: null as Date | null,
  }),

  getters: {
    allTemplates: (state) => state.templates,
    templateById: (state) => (id: string) => state.templates.find(t => t.id === id),
    templateCount: (state) => state.templates.length,
  },

  actions: {
    async fetchTemplates(userId: string, force = false) {
      // Cache for 5 minutes
      if (!force && this.lastFetched) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (this.lastFetched > fiveMinutesAgo && this.templates.length > 0) {
          return this.templates;
        }
      }

      this.isLoading = true;
      try {
        const { $db } = useNuxtApp();
        const q = query(
          collection($db, 'templates'),
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc')
        );
        const snapshot = await getDocs(q);

        this.templates = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ReportTemplate[];

        this.lastFetched = new Date();
        return this.templates;
      } catch (error) {
        console.error('Error fetching templates:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createTemplate(templateData: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
      try {
        const { $db } = useNuxtApp();
        const newTemplate = {
          ...templateData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection($db, 'templates'), newTemplate);

        const template = { id: docRef.id, ...newTemplate } as ReportTemplate;
        this.templates.unshift(template);

        return { success: true, templateId: docRef.id };
      } catch (error) {
        console.error('Error creating template:', error);
        return { success: false, error: 'Failed to create template' };
      }
    },

    async updateTemplate(templateId: string, updates: Partial<ReportTemplate>) {
      try {
        const { $db } = useNuxtApp();
        const templateRef = doc($db, 'templates', templateId);

        await updateDoc(templateRef, {
          ...updates,
          updatedAt: Timestamp.now(),
        });

        // Update local state
        const index = this.templates.findIndex(t => t.id === templateId);
        if (index !== -1) {
          this.templates[index] = {
            ...this.templates[index],
            ...updates,
            updatedAt: Timestamp.now(),
          };
        }

        return { success: true };
      } catch (error) {
        console.error('Error updating template:', error);
        return { success: false, error: 'Failed to update template' };
      }
    },

    async deleteTemplate(templateId: string) {
      try {
        const { $db } = useNuxtApp();
        await deleteDoc(doc($db, 'templates', templateId));

        // Remove from local state
        this.templates = this.templates.filter(t => t.id !== templateId);

        return { success: true };
      } catch (error) {
        console.error('Error deleting template:', error);
        return { success: false, error: 'Failed to delete template' };
      }
    },

    clearTemplates() {
      this.templates = [];
      this.lastFetched = null;
    },
  },
});
