import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Xác nhận', cancelLabel = 'Hủy', variant = 'default', onConfirm, onCancel }: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50',
              variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-primary hover:bg-primary-dark'
            )}
          >
            {loading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
