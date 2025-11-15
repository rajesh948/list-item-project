export function useSettings() {
  const DEFAULT_BUSINESS_NAME = 'મહાકાળી કેટર્સ';
  const DEFAULT_PHONE_NUMBERS = 'Phone No: 97274 73918, 98263 52718';

  const businessName = ref(DEFAULT_BUSINESS_NAME);
  const phoneNumbers = ref(DEFAULT_PHONE_NUMBERS);

  // Load settings from localStorage
  const loadSettings = () => {
    if (process.client) {
      const savedName = localStorage.getItem('businessName');
      const savedPhone = localStorage.getItem('phoneNumbers');

      if (savedName) {
        businessName.value = savedName;
      }
      if (savedPhone) {
        phoneNumbers.value = savedPhone;
      }
    }
  };

  // Save settings to localStorage
  const saveSettings = (name: string, phone: string) => {
    if (process.client) {
      businessName.value = name;
      phoneNumbers.value = phone;
      localStorage.setItem('businessName', name);
      localStorage.setItem('phoneNumbers', phone);
    }
  };

  // Reset to defaults
  const resetSettings = () => {
    saveSettings(DEFAULT_BUSINESS_NAME, DEFAULT_PHONE_NUMBERS);
  };

  // Load settings on initialization
  if (process.client) {
    loadSettings();
  }

  return {
    businessName,
    phoneNumbers,
    saveSettings,
    resetSettings,
    DEFAULT_BUSINESS_NAME,
    DEFAULT_PHONE_NUMBERS,
  };
}
