// src/utils/uae.utils.ts
export class UAEUtils {
  // Format UAE mobile number for display
	static formatMobileForDisplay(mobile: string): string {
	  if (!mobile) return '';
	  
	  const digits = mobile.replace(/\D/g, '');
	  
	  // Convert to +971 5X XXX XXXX format for display
	  if (digits.length === 10 && digits.startsWith('05')) {
		// 0555588380 → +971 55 558 8380
		const mobilePart = digits.substring(1); // Remove leading 0
		return `+971 ${mobilePart.substring(0, 2)} ${mobilePart.substring(2, 5)} ${mobilePart.substring(5)}`;
	  } else if (digits.length === 9 && digits.startsWith('5')) {
		// 555588380 → +971 55 558 8380
		return `+971 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
	  } else if (digits.length === 12 && digits.startsWith('971')) {
		// 971555588380 → +971 55 558 8380
		const mobilePart = digits.substring(3);
		return `+971 ${mobilePart.substring(0, 2)} ${mobilePart.substring(2, 5)} ${mobilePart.substring(5)}`;
	  }
	  
	  return mobile;
	}

  // Format mobile number for API/backend
	static formatMobileForApi(mobile: string): string {
	  if (!mobile) return '';
	  
	  // Remove any non-digit characters
	  const digits = mobile.replace(/\D/g, '');
	  
	  console.log('DEBUG - formatMobileForApi input:', mobile, 'digits:', digits); // Add this
	  
	  // Convert to 05XXXXXXXX format (what backend expects)
	  if (digits.length === 9 && digits.startsWith('5')) {
		// 555588380 → 0555588380
		return `0${digits}`;
	  } else if (digits.length === 12 && digits.startsWith('971')) {
		// 971555588380 → 0555588380
		return `0${digits.substring(3)}`; // Remove 971, add 0
	  } else if (digits.length === 13 && digits.startsWith('971')) {
		// +971555588380 → 0555588380
		return `0${digits.substring(3)}`; // Remove 971, add 0
	  } else if (digits.startsWith('+971') && digits.length === 13) {
		// +971555588380 → 0555588380
		return `0${digits.substring(4)}`; // Remove +971, add 0
	  } else if (digits.length === 10 && digits.startsWith('05')) {
		// 0555588380 → 0555588380 (already correct)
		return digits;
	  }
	  
	  // If we can't determine the format, return as-is
	  return mobile;
	}
  // Validate UAE mobile number
	static isValidUaeMobile(mobile: string): boolean {
	  if (!mobile) return false;
	  
	  const digits = mobile.replace(/\D/g, '');
	  
	  // Accept multiple formats but all must be valid UAE mobile
	  if (digits.length === 10 && digits.startsWith('05')) {
		// 0555588386 format
		const mobilePart = digits.substring(1);
		return mobilePart.length === 9 && mobilePart.startsWith('5');
	  } else if (digits.length === 9 && digits.startsWith('5')) {
		// 555588386 format
		return true;
	  } else if ((digits.length === 12 || digits.length === 13) && digits.startsWith('971')) {
		// 971555588386 or +971555588386 format
		const mobilePart = digits.substring(3);
		return mobilePart.length === 9 && mobilePart.startsWith('5');
	  }
	  
	  return false;
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