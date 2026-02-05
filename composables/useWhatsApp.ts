/**
 * WhatsApp Integration Composable
 * Provides functions to share reports and messages via WhatsApp
 */

export function useWhatsApp() {
  const { businessName } = useSettings();

  /**
   * Format phone number for WhatsApp
   * Removes spaces, adds country code if needed
   */
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    let formatted = phone.replace(/\D/g, '');

    // If starts with 0, replace with India country code
    if (formatted.startsWith('0')) {
      formatted = '91' + formatted.substring(1);
    }

    // If no country code (10 digits), add India code
    if (formatted.length === 10) {
      formatted = '91' + formatted;
    }

    return formatted;
  };

  /**
   * Open WhatsApp with pre-filled message
   */
  const shareToWhatsApp = (phone: string, message: string) => {
    const formattedPhone = formatPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  /**
   * Share report details via WhatsApp
   */
  const shareReportToWhatsApp = (reportData: {
    customerName: string;
    customerPhone: string;
    eventDate: string;
    shift?: string;
    address?: string;
    noOfPeople?: string;
  }) => {
    const { customerName, customerPhone, eventDate, shift, address, noOfPeople } = reportData;

    let message = `Hello ${customerName},\n\n`;
    message += `Thank you for choosing *${businessName.value}*!\n\n`;
    message += `*Event Details:*\n`;
    message += `Date: ${eventDate}\n`;

    if (shift) {
      message += `Shift: ${shift}\n`;
    }

    if (noOfPeople) {
      message += `No. of People: ${noOfPeople}\n`;
    }

    if (address) {
      message += `Address: ${address}\n`;
    }

    message += `\nWe look forward to serving you!\n\n`;
    message += `Best regards,\n*${businessName.value}*`;

    shareToWhatsApp(customerPhone, message);
  };

  /**
   * Share a simple message via WhatsApp (opens without phone number)
   */
  const shareMessage = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  /**
   * Generate report summary message
   */
  const generateReportSummary = (
    userData: {
      name: string;
      date: string;
      shift?: string;
      noOfPeople?: string;
      address?: string;
      price?: string;
    },
    categories: Array<{ name: string; items: Array<{ name: string }> }>
  ): string => {
    let message = `*${businessName.value}*\n`;
    message += `━━━━━━━━━━━━━━━\n\n`;

    message += `*Customer:* ${userData.name}\n`;
    message += `*Date:* ${userData.date}\n`;

    if (userData.shift) {
      message += `*Shift:* ${userData.shift}\n`;
    }

    if (userData.noOfPeople) {
      message += `*People:* ${userData.noOfPeople}\n`;
    }

    if (userData.address) {
      message += `*Address:* ${userData.address}\n`;
    }

    if (userData.price) {
      message += `*Price:* ${userData.price}\n`;
    }

    message += `\n━━━━━━━━━━━━━━━\n`;
    message += `*Menu Items:*\n\n`;

    categories.forEach(category => {
      message += `*${category.name}:*\n`;
      category.items.forEach(item => {
        message += `  • ${item.name}\n`;
      });
      message += `\n`;
    });

    message += `━━━━━━━━━━━━━━━\n`;
    message += `Thank you for choosing us!`;

    return message;
  };

  /**
   * Share full report summary via WhatsApp to customer
   */
  const shareFullReport = (
    customerPhone: string,
    userData: {
      name: string;
      date: string;
      shift?: string;
      noOfPeople?: string;
      address?: string;
      price?: string;
    },
    categories: Array<{ name: string; items: Array<{ name: string }> }>
  ) => {
    const message = generateReportSummary(userData, categories);
    shareToWhatsApp(customerPhone, message);
  };

  return {
    formatPhoneNumber,
    shareToWhatsApp,
    shareReportToWhatsApp,
    shareMessage,
    generateReportSummary,
    shareFullReport,
  };
}
