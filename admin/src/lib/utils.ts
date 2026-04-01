import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateSlug(title: string): string {
  let result = title.toLowerCase()
  result = result.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
  result = result.replace(/[èéẹẻẽêềếệểễ]/g, 'e')
  result = result.replace(/[ìíịỉĩ]/g, 'i')
  result = result.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
  result = result.replace(/[ùúụủũưừứựửữ]/g, 'u')
  result = result.replace(/[ỳýỵỷỹ]/g, 'y')
  result = result.replace(/[đ]/g, 'd')
  result = result.replace(/[^a-z0-9\s-]/g, '')
  result = result.replace(/[\s]+/g, '-')
  result = result.replace(/-+/g, '-')
  result = result.replace(/^-|-$/g, '')
  return result
}
