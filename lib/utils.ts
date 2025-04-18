import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A"

  // Check if the date is valid
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Invalid date"

  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Date error"
  }
}

// Add the missing formatCurrency function
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "N/A"

  // Convert to number if it's a string
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  // Check if it's a valid number
  if (isNaN(numAmount)) return "Invalid amount"

  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount)
}
