import { collection, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore';

export interface SharedReportData {
  reportData: {
    name: string;
    phone: string;
    date: string;
    noOfPeople: string;
    shift: string;
    price: string;
    address: string;
  };
  selectedCategories: Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      name: string;
    }>;
  }>;
  businessName: string;
  phoneNumbers: string;
  branding?: {
    logo?: string;
    headerColor?: string;
    accentColor?: string;
    tagline?: string;
    address?: string;
    showPhone?: boolean;
    showAddress?: boolean;
  };
  createdBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export function useShareReport() {
  const { $db } = useNuxtApp();
  const { showToast } = useToast();
  const userStore = useUserStore();
  const { businessName, phoneNumbers } = useSettings();
  const { effectiveBranding } = usePdfBranding();

  const isCreatingShare = ref(false);

  // Create a shared report and return the share ID
  const createShareLink = async (
    reportData: any,
    selectedCategories: any[]
  ): Promise<string | null> => {
    if (!userStore.user?.uid) {
      showToast('Please login to share reports', 'warning');
      return null;
    }

    isCreatingShare.value = true;

    try {
      // Create expiry date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const shareData: SharedReportData = {
        reportData: {
          name: reportData.name || '',
          phone: reportData.phone || '',
          date: reportData.date || '',
          noOfPeople: reportData.noOfPeople || '',
          shift: reportData.shift || '',
          price: reportData.price || '',
          address: reportData.address || '',
        },
        selectedCategories: selectedCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          items: cat.items.map((item: any) => ({
            id: item.id,
            name: item.name,
          })),
        })),
        businessName: businessName.value || 'CaterHub',
        phoneNumbers: phoneNumbers.value || '',
        branding: {
          logo: effectiveBranding.value?.logo || '',
          headerColor: effectiveBranding.value?.headerColor || '#667eea',
          accentColor: effectiveBranding.value?.accentColor || '#667eea',
          tagline: effectiveBranding.value?.tagline || '',
          address: effectiveBranding.value?.address || '',
          showPhone: effectiveBranding.value?.showPhone !== false,
          showAddress: effectiveBranding.value?.showAddress || false,
        },
        createdBy: userStore.user.uid,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expiresAt),
      };

      // Add to sharedReports collection
      const docRef = await addDoc(collection($db, 'sharedReports'), shareData);

      return docRef.id;
    } catch (error) {
      console.error('Error creating share link:', error);
      showToast('Failed to create share link', 'danger');
      return null;
    } finally {
      isCreatingShare.value = false;
    }
  };

  // Get shared report data (for public page)
  const getSharedReport = async (shareId: string): Promise<SharedReportData | null> => {
    try {
      const docRef = doc($db, 'sharedReports', shareId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data() as SharedReportData;

      // Check if expired
      if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
        return null; // Expired
      }

      return data;
    } catch (error) {
      console.error('Error fetching shared report:', error);
      return null;
    }
  };

  // Generate share URL
  const getShareUrl = (shareId: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${shareId}`;
  };

  // Open WhatsApp with share link
  const shareViaWhatsApp = async (
    reportData: any,
    selectedCategories: any[]
  ): Promise<boolean> => {
    const shareId = await createShareLink(reportData, selectedCategories);

    if (!shareId) {
      return false;
    }

    const shareUrl = getShareUrl(shareId);
    const totalItems = selectedCategories.reduce(
      (total, cat) => total + (cat.items?.length || 0),
      0
    );

    // Create WhatsApp message (no emojis)
    const message = `*CaterHub Menu Quote*

Customer: ${reportData.name || 'N/A'}
Date: ${reportData.date || 'N/A'}
Items: ${totalItems}
${reportData.price ? `Price: Rs.${reportData.price}` : ''}

Download PDF: ${shareUrl}`;

    // Open WhatsApp without pre-filled phone number
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    return true;
  };

  return {
    isCreatingShare,
    createShareLink,
    getSharedReport,
    getShareUrl,
    shareViaWhatsApp,
  };
}
