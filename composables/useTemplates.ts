import type { TemplateCategory, ReportTemplate } from '~/stores/templates';

export function useTemplates() {
  const templatesStore = useTemplatesStore();
  const userStore = useUserStore();
  const { showToast } = useToast();
  const { isPremium } = useSubscription();

  const isLoading = computed(() => templatesStore.isLoading);
  const templates = computed(() => templatesStore.allTemplates);

  // Fetch user templates
  const fetchTemplates = async (force = false) => {
    if (!userStore.user?.uid) return [];

    try {
      return await templatesStore.fetchTemplates(userStore.user.uid, force);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showToast('Failed to load templates', 'error');
      return [];
    }
  };

  // Save current selection as a template
  const saveAsTemplate = async (
    name: string,
    categories: TemplateCategory[],
    description?: string
  ): Promise<{ success: boolean; templateId?: string; error?: string }> => {
    if (!userStore.user?.uid) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check premium status
    if (!isPremium.value) {
      showToast('Templates are a premium feature. Upgrade to use this feature.', 'warning');
      return { success: false, error: 'Premium feature' };
    }

    if (!name.trim()) {
      return { success: false, error: 'Template name is required' };
    }

    if (categories.length === 0) {
      return { success: false, error: 'No items selected' };
    }

    // Calculate total item count
    const itemCount = categories.reduce((total, cat) => total + cat.items.length, 0);

    const result = await templatesStore.createTemplate({
      userId: userStore.user.uid,
      name: name.trim(),
      description: description?.trim(),
      categories,
      itemCount,
    });

    if (result.success) {
      showToast('Template saved successfully!', 'success');
    } else {
      showToast(result.error || 'Failed to save template', 'error');
    }

    return result;
  };

  // Update an existing template
  const updateTemplate = async (
    templateId: string,
    updates: { name?: string; description?: string; categories?: TemplateCategory[] }
  ) => {
    if (!isPremium.value) {
      showToast('Templates are a premium feature', 'warning');
      return { success: false, error: 'Premium feature' };
    }

    const updateData: any = { ...updates };

    // Recalculate item count if categories changed
    if (updates.categories) {
      updateData.itemCount = updates.categories.reduce((total, cat) => total + cat.items.length, 0);
    }

    const result = await templatesStore.updateTemplate(templateId, updateData);

    if (result.success) {
      showToast('Template updated!', 'success');
    } else {
      showToast(result.error || 'Failed to update template', 'error');
    }

    return result;
  };

  // Delete a template
  const deleteTemplate = async (templateId: string) => {
    const result = await templatesStore.deleteTemplate(templateId);

    if (result.success) {
      showToast('Template deleted', 'success');
    } else {
      showToast(result.error || 'Failed to delete template', 'error');
    }

    return result;
  };

  // Get template by ID
  const getTemplateById = (templateId: string): ReportTemplate | undefined => {
    return templatesStore.templateById(templateId);
  };

  // Load template items (returns categories for selection)
  const loadTemplateItems = (templateId: string): TemplateCategory[] | null => {
    const template = getTemplateById(templateId);
    if (!template) {
      showToast('Template not found', 'error');
      return null;
    }

    // Deep clone to avoid reference issues
    return JSON.parse(JSON.stringify(template.categories));
  };

  return {
    isLoading,
    templates,
    fetchTemplates,
    saveAsTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    loadTemplateItems,
  };
}
