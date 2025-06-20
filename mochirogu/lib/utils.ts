import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr = "yyyy年MM月dd日"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: ja })
}

export function getMoodEmoji(moodLevel: number): string {
  switch (moodLevel) {
    case 1:
      return "😢"
    case 2:
      return "😕"
    case 3:
      return "😐"
    case 4:
      return "🙂"
    case 5:
      return "😄"
    default:
      return "❓"
  }
}

export function getMoodColor(moodLevel: number): string {
  switch (moodLevel) {
    case 1:
      return "bg-red-200"
    case 2:
      return "bg-orange-200"
    case 3:
      return "bg-yellow-200"
    case 4:
      return "bg-blue-200"
    case 5:
      return "bg-green-200"
    default:
      return "bg-gray-200"
  }
}
