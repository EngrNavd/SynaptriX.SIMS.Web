export class UAEUtils {
  static formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Convert to UAE format
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `+971${cleaned.substring(1)}`;
    } else if (cleaned.startsWith('971') && cleaned.length === 12) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('+971') && cleaned.length === 13) {
      return cleaned;
    }
    
    return cleaned;
  }

  static formatPhoneForDisplay(phone: string): string {
    const formatted = this.formatPhoneNumber(phone);
    if (formatted.startsWith('+971') && formatted.length === 13) {
      const number = formatted.substring(4);
      return `+971 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
    }
    return formatted;
  }

  static isValidUaePhone(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    return formatted.startsWith('+971') && formatted.length === 13;
  }

  static formatCurrency(amount: number, currency: string = 'AED'): string {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  static getUAECities(): Array<{ value: string; label: string }> {
    return [
      { value: 'DXB', label: 'Dubai' },
      { value: 'AUH', label: 'Abu Dhabi' },
      { value: 'SHJ', label: 'Sharjah' },
      { value: 'AJM', label: 'Ajman' },
      { value: 'RKT', label: 'Ras Al Khaimah' },
      { value: 'FJR', label: 'Fujairah' },
      { value: 'UQA', label: 'Umm Al Quwain' },
      { value: 'ADH', label: 'Al Ain' },
      { value: 'RWD', label: 'Ruwais' },
      { value: 'LWA', label: 'Liwa Oasis' },
    ];
  }

  static getUAEStates(): Array<{ value: string; label: string }> {
    return [
      { value: 'DU', label: 'Dubai' },
      { value: 'AD', label: 'Abu Dhabi' },
      { value: 'SH', label: 'Sharjah' },
      { value: 'AJ', label: 'Ajman' },
      { value: 'RAK', label: 'Ras Al Khaimah' },
      { value: 'FU', label: 'Fujairah' },
      { value: 'UAQ', label: 'Umm Al Quwain' },
    ];
  }

  static validateTRN(taxNumber?: string): boolean {
    if (!taxNumber) return true; // TRN is optional
    // UAE TRN is 15 digits starting with 1
    return /^1\d{14}$/.test(taxNumber);
  }
}