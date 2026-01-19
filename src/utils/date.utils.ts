// utils/date.utils.ts
import { format, parseISO, formatISO, addHours } from 'date-fns';

export class DateUtils {
  // GMT+4 offset in hours
  static readonly GMT4_OFFSET_HOURS = 4;
  static readonly GMT4_TIMEZONE = 'Asia/Dubai';

  /**
   * Convert any date to GMT+4 string
   */
  static toGMT4String(date: Date | string): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    const gmt4Date = addHours(d, this.GMT4_OFFSET_HOURS);
    return formatISO(gmt4Date);
  }

  /**
   * Format date for display in GMT+4
   */
  static formatGMT4(date: Date | string, formatStr: string = 'dd/MM/yyyy HH:mm'): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    const gmt4Date = addHours(d, this.GMT4_OFFSET_HOURS);
    return format(gmt4Date, formatStr);
  }

  /**
   * Get start and end dates for period filter
   */
  static getPeriodDates(period: string): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = new Date();

    switch (period.toLowerCase()) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        break;
      case 'thisweek':
        start = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
        end = new Date(now.setDate(now.getDate() - now.getDay() + 6)); // Saturday
        break;
      case 'lastweek':
        start = new Date(now.setDate(now.getDate() - now.getDay() - 7));
        end = new Date(now.setDate(now.getDate() - now.getDay() - 1));
        break;
      case 'thismonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastmonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    return { start, end };
  }

  /**
   * Format period for display
   */
  static getPeriodDisplayName(period: string): string {
    const periods: Record<string, string> = {
      today: 'Today',
      yesterday: 'Yesterday',
      thisweek: 'This Week',
      lastweek: 'Last Week',
      thismonth: 'This Month',
      lastmonth: 'Last Month',
    };
    return periods[period.toLowerCase()] || period;
  }

  /**
   * Check if date is within GMT+4 working hours (9 AM to 6 PM)
   */
  static isWithinBusinessHours(date: Date): boolean {
    const gmt4Date = addHours(date, this.GMT4_OFFSET_HOURS);
    const hour = gmt4Date.getHours();
    return hour >= 9 && hour < 18;
  }

  /**
   * Get current time in GMT+4
   */
  static getCurrentGMT4Time(): string {
    return this.formatGMT4(new Date(), 'HH:mm:ss');
  }

  /**
   * Get current date in GMT+4
   */
  static getCurrentGMT4Date(): string {
    return this.formatGMT4(new Date(), 'yyyy-MM-dd');
  }
}

export default DateUtils;