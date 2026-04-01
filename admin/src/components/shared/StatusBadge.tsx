import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  published: { label: 'Đã xuất bản', classes: 'bg-green-50 text-green-700 border-green-200' },
  draft: { label: 'Nháp', classes: 'bg-gray-50 text-gray-600 border-gray-200' },
  new: { label: 'Mới', classes: 'bg-red-50 text-red-700 border-red-200' },
  read: { label: 'Đã đọc', classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  replied: { label: 'Đã trả lời', classes: 'bg-green-50 text-green-700 border-green-200' },
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, classes: 'bg-gray-50 text-gray-600 border-gray-200' }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', config.classes, className)}>
      {config.label}
    </span>
  )
}
