export function useSettings() {
  const userStore = useUserStore();
  const DEFAULT_BUSINESS_NAME = 'મહાકાળી કેટર્સ';
  const DEFAULT_PHONE_NUMBERS = 'Phone No: 97274 73918, 98263 52718';

  // Get business name and phone number from user store, fallback to defaults
  const businessName = computed(() => {
    return userStore.user?.businessName || DEFAULT_BUSINESS_NAME;
  });

  const phoneNumbers = computed(() => {
    return userStore.user?.phoneNumber || DEFAULT_PHONE_NUMBERS;
  });

  return {
    businessName,
    phoneNumbers,
    DEFAULT_BUSINESS_NAME,
    DEFAULT_PHONE_NUMBERS,
  };
}
