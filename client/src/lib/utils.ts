import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to format date as month and year
export function formatDateAsMonthYear(date: Date | null | undefined | string): string {
  if (!date) return 'No date';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    return dateObj.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  } catch (error) {
    return 'No date';
  }
}

// Utility function to format date and time
export function formatDateTime(date: Date | null | undefined | string): string {
  if (!date) return 'No date';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    return dateObj.toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'No date';
  }
}

// Test function to verify date formatting (for development only)
export function testDateFormatting() {
  const testDate = new Date('2024-01-15');
  const formatted = formatDateAsMonthYear(testDate);
  console.log('Test date formatting:', formatted); // Should output: "January 2024"
  return formatted;
}
