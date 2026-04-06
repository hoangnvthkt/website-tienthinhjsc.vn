/**
 * MediaPickerModal — reusable image picker from the media library
 * Usage:
 *   <MediaPickerModal
 *     open={showPicker}
 *     onSelect={(url) => { setForm(f => ({ ...f, image_url: url })); setShowPicker(false) }}
 *     onClose={() => setShowPicker(false)}
 *   />
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { Upload, Search, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface MediaItem {
  id: string
  file_name: string
  file_url: string
  file_type: string | null
  file_size: number | null
  created_at: string
}

interface Props {
  open: boolean
  onSelect: (url: string) => void
  onClose: () => void
  title?: string
}

export default function MediaPickerModal({ open, onSelect, onClose, title = 'Chọn ảnh' }: Props) {
  const { user } = useAuth()
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('media')
      .select('id, file_name, file_url, file_type, file_size, created_at')
      .order('created_at', { ascending: false })
    setItems((data as MediaItem[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (open) {
      setSelected(null)
      setSearch('')
      fetchMedia()
    }
  }, [open, fetchMedia])

  const handleUpload = async (files: FileList) => {
    setUploading(true)
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from('media').upload(path, file, { contentType: file.type })
        if (upErr) continue
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
        await supabase.from('media').insert({
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user?.id || null,
        })
      } catch { /* skip */ }
    }
    setUploading(false)
    fetchMedia()
  }

  const filtered = items.filter(i =>
    i.file_type?.startsWith('image/') &&
    i.file_name.toLowerCase().includes(search.toLowerCase())
  )

  const formatSize = (bytes: number | null) => {
    if (!bytes) return ''
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#141824] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-violet-500/15 rounded-lg">
              <ImageIcon size={18} className="text-violet-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/8 hover:bg-white/12 text-gray-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {uploading
                ? <Loader2 size={13} className="animate-spin" />
                : <Upload size={13} />}
              {uploading ? 'Đang upload...' : 'Upload ảnh'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => { if (e.target.files?.length) { handleUpload(e.target.files); e.target.value = '' } }}
            />
            <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white transition-colors rounded">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-5 py-3 border-b border-white/8">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm ảnh..."
              className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <Loader2 size={28} className="animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <ImageIcon size={40} className="mb-3 opacity-30" />
              <p className="text-sm">{search ? 'Không tìm thấy ảnh nào' : 'Chưa có ảnh nào'}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-violet-400 text-sm hover:underline"
              >
                + Upload ảnh đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item.file_url)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selected === item.file_url
                      ? 'border-violet-500 ring-2 ring-violet-500/30'
                      : 'border-white/8 hover:border-white/25'
                  }`}
                >
                  <img
                    src={item.file_url}
                    alt={item.file_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                    <p className="text-white text-[10px] font-medium text-center leading-tight truncate w-full px-1">
                      {item.file_name}
                    </p>
                    <p className="text-white/60 text-[9px]">{formatSize(item.file_size)}</p>
                  </div>
                  {/* Check mark when selected */}
                  {selected === item.file_url && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/8 bg-white/2">
          <p className="text-xs text-gray-500">
            {filtered.length} ảnh · {selected ? '1 đã chọn' : 'Chưa chọn'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => selected && onSelect(selected)}
              disabled={!selected}
              className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Check size={14} />
              Chọn ảnh này
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
