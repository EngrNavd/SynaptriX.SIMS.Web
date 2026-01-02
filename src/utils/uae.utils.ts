// src/utils/uae.utils.ts
export class UAEUtils {
  // Format UAE mobile number for display
  static formatMobileForDisplay(mobile: string): string {
    if (!mobile) return '';
    
    // Remove any non-digit characters
    const digits = mobile.replace(/\D/g, '');
    
    // Handle different formats
    if (digits.length === 9 && digits.startsWith('5')) {
      // 5xxxxxxxx format
      return `+971 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
    } else if (digits.length === 12 && digits.startsWith('971')) {
      // 9715xxxxxxxx format
      const mobileNumber = digits.substring(3);
      return `+971 ${mobileNumber.substring(0, 2)} ${mobileNumber.substring(2, 5)} ${mobileNumber.substring(5)}`;
    } else if (digits.length === 13 && digits.startsWith('971')) {
      // +9715xxxxxxxx format already
      const mobileNumber = digits.substring(3);
      return `+971 ${mobileNumber.substring(0, 2)} ${mobileNumber.substring(2, 5)} ${mobileNumber.substring(5)}`;
    }
    
    return mobile;
  }

  // Format mobile number for API/backend
  static formatMobileForApi(mobile: string): string {
    if (!mobile) return '';
    
    // Remove any non-digit characters
    const digits = mobile.replace(/\D/g, '');
    
    // Convert to +9715XXXXXXXX format
    if (digits.length === 9 && digits.startsWith('5')) {
      return `+971${digits}`;
    } else if (digits.length === 12 && digits.startsWith('971')) {
      return `+${digits}`;
    } else if (digits.length === 13 && digits.startsWith('971')) {
      return `+${digits}`;
    } else if (digits.startsWith('+971') && digits.length === 13) {
      return digits; // Already in correct format
    }
    
    // If it starts with 0, remove it and add +971
    if (digits.length === 10 && digits.startsWith('05')) {
      return `+971${digits.substring(1)}`;
    }
    
    return mobile;
  }

  // Validate UAE mobile number
  static isValidUaeMobile(mobile: string): boolean {
    if (!mobile) return false;
    
    const formatted = this.formatMobileForApi(mobile);
    
    // UAE mobile regex: +971 followed by 5, 50, 52, 54, 55, 56, 58
    const uaeMobileRegex = /^\+971(5[0-9]|50|52|54|55|56|58)\d{7}$/;
    
    return uaeMobileRegex.test(formatted);
  }

  // Validate UAE TRN (Tax Registration Number)
  static isValidTrn(trn: string): boolean {
    if (!trn) return false;
    
    // Remove any spaces or dashes
    const cleanTrn = trn.replace(/[\s-]/g, '');
    
    // UAE TRN is 15 digits
    if (cleanTrn.length !== 15) return false;
    
    // Check if all characters are digits
    return /^\d{15}$/.test(cleanTrn);
  }

  // Format currency for UAE (AED)
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Get list of UAE Emirates
  static getEmirates(): string[] {
    return [
      'Abu Dhabi',
      'Dubai', 
      'Sharjah',
      'Ajman',
      'Umm Al Quwain',
      'Ras Al Khaimah',
      'Fujairah'
    ];
  }

  // Format date in UAE format
  static formatDate(date: Date | string): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  }

  // Check if mobile number is in UAE format
  static isUaeFormat(mobile: string): boolean {
    return mobile.startsWith('+971');
  }

  // Extract mobile number digits only
  static extractMobileDigits(mobile: string): string {
    if (!mobile) return '';
    return mobile.replace(/\D/g, '');
  }
}

// Export individual functions for convenience
export const {
formatMobileForDisplay,
formatMobileForApi,
isValidUaeMobile,
isValidTrn,
formatCurrency,
getEmirates,
formatDate,
isUaeFormat,
extractMobileDigits,
} = UAEUtils;

// Default export
export default UAEUtils;