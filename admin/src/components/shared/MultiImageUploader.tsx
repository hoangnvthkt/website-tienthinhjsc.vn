import { useState, useRef, useCallback } from 'react'
import { Upload, X, GripVertical, AlertCircle, Plus, ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface MultiImageUploaderProps {
  values: string[]
  onChange: (urls: string[]) => void
  bucket: string
  folder?: string
  maxImages?: number
  label?: string
  hint?: string
}

export default function MultiImageUploader({
  values,
  onChange,
  bucket,
  folder = '',
  maxImages = 8,
  label = 'Hình ảnh',
  hint,
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [dragSrcIdx, setDragSrcIdx] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ─── Upload one file → Supabase Storage ──────────────────────────────────
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file ảnh (PNG, JPG, WebP)')
      return null
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File quá lớn. Tối đa 10MB mỗi ảnh.')
      return null
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Chưa đăng nhập. Vui lòng đăng nhập lại.'); return null }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true, contentType: file.type })

    if (uploadError) { setError(uploadError.message); return null }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return urlData.publicUrl
  }, [bucket, folder])

  // ─── Handle file selection (multiple) ────────────────────────────────────
  const handleFiles = useCallback(async (files: FileList) => {
    const remaining = maxImages - values.length
    if (remaining <= 0) { setError(`Tối đa ${maxImages} ảnh.`); return }
    setError('')
    setUploading(true)

    const toUpload = Array.from(files).slice(0, remaining)
    const results: string[] = []
    for (const f of toUpload) {
      const url = await uploadFile(f)
      if (url) results.push(url)
    }

    if (results.length) onChange([...values, ...results])
    setUploading(false)
  }, [values, maxImages, uploadFile, onChange])

  // ─── Drag-and-drop onto the zone ─────────────────────────────────────────
  const handleZoneDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }

  // ─── Reorder via drag between thumb cards ─────────────────────────────────
  const handleThumbDragStart = (idx: number) => setDragSrcIdx(idx)
  const handleThumbDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDragOverIdx(idx)
  }
  const handleThumbDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    if (dragSrcIdx === null || dragSrcIdx === targetIdx) { setDragOverIdx(null); return }
    const next = [...values]
    const [moved] = next.splice(dragSrcIdx, 1)
    next.splice(targetIdx, 0, moved)
    onChange(next)
    setDragSrcIdx(null)
    setDragOverIdx(null)
  }
  const handleThumbDragEnd = () => { setDragSrcIdx(null); setDragOverIdx(null) }

  // ─── Remove ──────────────────────────────────────────────────────────────
  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx))

  const canAdd = values.length < maxImages

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-400">{values.length}/{maxImages} ảnh</span>
      </div>
      {hint && <p className="text-xs text-gray-400 mb-3">{hint}</p>}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs mb-3">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Thumbnail grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {values.map((url, idx) => (
            <div
              key={url + idx}
              draggable
              onDragStart={() => handleThumbDragStart(idx)}
              onDragOver={(e) => handleThumbDragOver(e, idx)}
              onDrop={(e) => handleThumbDrop(e, idx)}
              onDragEnd={handleThumbDragEnd}
              className={cn(
                'relative group rounded-lg overflow-hidden border-2 transition-all cursor-grab select-none',
                dragOverIdx === idx && dragSrcIdx !== idx
                  ? 'border-blue-400 scale-105'
                  : dragSrcIdx === idx
                  ? 'border-blue-300 opacity-50'
                  : 'border-gray-200 hover:border-gray-400'
              )}
            >
              <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-24 object-cover" />
              
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-between p-1.5">
                <div className="bg-black/50 text-white rounded px-1.5 py-0.5 text-xs font-mono">
                  {idx + 1}
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                >
                  <X size={10} />
                </button>
              </div>

              {/* Drag handle icon */}
              <div className="absolute bottom-1 right-1 text-white/60 pointer-events-none">
                <GripVertical size={14} />
              </div>

              {/* Label for cube face positioning */}
              {idx < 4 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                  {['Trước', 'Phải', 'Sau', 'Trái'][idx]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {canAdd && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleZoneDrop}
          onClick={() => { setError(''); inputRef.current?.click() }}
          className={cn(
            'border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors',
            uploading
              ? 'border-blue-300 bg-blue-50 pointer-events-none'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-blue-600">Đang upload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              {values.length === 0 ? (
                <ImageIcon className="text-gray-400" size={28} />
              ) : (
                <Plus className="text-blue-400" size={24} />
              )}
              <p className="text-sm text-gray-500">
                {values.length === 0 ? (
                  <>Kéo thả hoặc <span className="text-blue-500 font-medium">chọn ảnh</span></>
                ) : (
                  <>Thêm ảnh ({maxImages - values.length} ảnh còn lại)</>
                )}
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, WebP · Tối đa 10MB/ảnh · Chọn nhiều cùng lúc</p>
            </div>
          )}
        </div>
      )}

      {!canAdd && (
        <p className="text-xs text-gray-400 text-center mt-1">Đã đạt tối đa {maxImages} ảnh. Xóa ảnh để thêm mới.</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
