/**
 * MediaPickerModal — Shared modal to browse the Supabase media library.
 * Used by both ImageUploader and MultiImageUploader.
 */
import { useState, useEffect, useCallback } from 'react'
import { X, Search, Check, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: string
  file_name: string
  file_url: string
  file_type: string | null
  file_size: number | null
}

interface MediaPickerModalProps {
  open: boolean
  /** optional custom title */
  title?: string
  /** multi=true → can select multiple; returns string[] via onMultiSelect */
  multi?: boolean
  onSelect: (url: string) => void
  onMultiSelect?: (urls: string[]) => void
  onClose: () => void
}

const PAGE_SIZE = 30

export default function MediaPickerModal({
  open,
  title,
  multi = false,
  onSelect,
  onMultiSelect,
  onClose,
}: MediaPickerModalProps) {

  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const load = useCallback(async (reset = false) => {
    setLoading(true)
    const from = reset ? 0 : page * PAGE_SIZE
    let query = supabase
      .from('media')
      .select('id, file_name, file_url, file_type, file_size')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (search.trim()) {
      query = query.ilike('file_name', `%${search.trim()}%`)
    }

    const { data } = await query
    setLoading(false)
    if (!data) return

    if (reset) {
      setItems(data)
      setPage(0)
    } else {
      setItems(prev => [...prev, ...data])
    }
    setHasMore(data.length === PAGE_SIZE)
  }, [page, search])

  useEffect(() => {
    if (open) {
      setSelected([])
      setSearch('')
      setPage(0)
      load(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => { setPage(0); load(true) }, 350)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, open])

  const toggle = (url: string) => {
    if (!multi) {
      onSelect(url)
      onClose()
      return
    }
    setSelected(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    )
  }

  const confirmMulti = () => {
    if (onMultiSelect) onMultiSelect(selected)
    onClose()
  }

  const fmt = (bytes: number | null) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-800">{title || 'Kho Media'}</h3>
            {multi && selected.length > 0 && (
              <p className="text-xs text-blue-600 mt-0.5">Đã chọn {selected.length} ảnh</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {multi && (
              <button
                type="button"
                onClick={confirmMulti}
                disabled={selected.length === 0}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Check size={14} />
                Dùng {selected.length > 0 ? `(${selected.length})` : ''}
              </button>
            )}
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên file..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && items.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="animate-spin text-blue-500" size={28} />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <p className="text-sm">Không tìm thấy ảnh nào</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {items.map(item => {
                  const isSel = selected.includes(item.file_url)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggle(item.file_url)}
                      className={cn(
                        'relative group rounded-lg overflow-hidden border-2 transition-all text-left',
                        isSel
                          ? 'border-blue-500 ring-2 ring-blue-500/30'
                          : 'border-transparent hover:border-gray-300'
                      )}
                    >
                      <img
                        src={item.file_url}
                        alt={item.file_name}
                        className="w-full aspect-square object-cover"
                        loading="lazy"
                      />
                      {/* Hover overlay with filename */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-1.5">
                        <p className="text-white text-[10px] leading-tight truncate">{item.file_name}</p>
                        {item.file_size && (
                          <p className="text-white/70 text-[10px]">{fmt(item.file_size)}</p>
                        )}
                      </div>
                      {/* Check mark */}
                      {isSel && (
                        <div className="absolute top-1.5 right-1.5 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center shadow">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={() => { setPage(p => p + 1); load() }}
                    disabled={loading}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                    Xem thêm
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
