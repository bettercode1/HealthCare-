import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to format date as month and year
export function formatDateAsMonthYear(date: Date | null | undefined): string {
  if (!date) return 'No date';
  
  try {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
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
