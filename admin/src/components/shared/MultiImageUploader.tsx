/**
 * MultiImageUploader — Multiple images with 3 source tabs:
 *   1. Upload từ máy local (multiple files, drag & drop)
 *   2. Dùng link URL (thêm từng link)
 *   3. Chọn từ kho Media (multi-select)
 * Supports drag-to-reorder after adding images.
 */
import { useState, useRef, useCallback } from 'react'
import { Upload, Link2, LayoutGrid, X, GripVertical, AlertCircle, Plus, ImageIcon, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import MediaPickerModal from './MediaPickerModal'

interface MultiImageUploaderProps {
  values: string[]
  onChange: (urls: string[]) => void
  bucket: string
  folder?: string
  maxImages?: number
  label?: string
  hint?: string
}

type Tab = 'upload' | 'url' | 'media'

const FACE_LABELS = ['Trước', 'Phải', 'Sau', 'Trái']

export default function MultiImageUploader({
  values,
  onChange,
  bucket,
  folder = '',
  maxImages = 8,
  label = 'Hình ảnh',
  hint,
}: MultiImageUploaderProps) {
  const [tab, setTab] = useState<Tab>('upload')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [urlValid, setUrlValid] = useState<boolean | null>(null)
  const [showMedia, setShowMedia] = useState(false)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [dragSrcIdx, setDragSrcIdx] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const remaining = maxImages - values.length
  const canAdd = remaining > 0

  // ── Upload multiple local files ──────────────────────────────────────────
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) { setError('Chỉ chấp nhận file ảnh'); return null }
    if (file.size > 10 * 1024 * 1024) { setError('File quá lớn. Tối đa 10MB.'); return null }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Chưa đăng nhập'); return null }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error: err } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true, contentType: file.type })
    if (err) { setError(err.message); return null }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return urlData.publicUrl
  }, [bucket, folder])

  const handleFiles = useCallback(async (files: FileList) => {
    if (!canAdd) { setError(`Đã đạt tối đa ${maxImages} ảnh`); return }
    setError(''); setUploading(true)
    const toUpload = Array.from(files).slice(0, remaining)
    const results: string[] = []
    for (const f of toUpload) {
      const url = await uploadFile(f)
      if (url) results.push(url)
    }
    if (results.length) onChange([...values, ...results])
    setUploading(false)
  }, [values, remaining, canAdd, maxImages, uploadFile, onChange])

  // ── Add URL ──────────────────────────────────────────────────────────────
  const handleUrlAdd = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) { setError('Vui lòng nhập URL'); return }
    if (!canAdd) { setError(`Đã đạt tối đa ${maxImages} ảnh`); return }
    try {
      new URL(trimmed)
      onChange([...values, trimmed])
      setUrlInput('')
      setUrlValid(null)
      setError('')
    } catch {
      setError('URL không hợp lệ')
      setUrlValid(false)
    }
  }

  // ── From media library ───────────────────────────────────────────────────
  const handleMediaSelect = (urls: string[]) => {
    const toAdd = urls.slice(0, remaining)
    onChange([...values, ...toAdd])
  }

  // ── Reorder thumbs ───────────────────────────────────────────────────────
  const handleThumbDragStart = (idx: number) => setDragSrcIdx(idx)
  const handleThumbDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx) }
  const handleThumbDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    if (dragSrcIdx === null || dragSrcIdx === targetIdx) { setDragOverIdx(null); return }
    const next = [...values]
    const [moved] = next.splice(dragSrcIdx, 1)
    next.splice(targetIdx, 0, moved)
    onChange(next)
    setDragSrcIdx(null); setDragOverIdx(null)
  }
  const handleThumbDragEnd = () => { setDragSrcIdx(null); setDragOverIdx(null) }
  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx))

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'upload', label: 'Máy tính', icon: <Upload size={13} /> },
    { id: 'url',    label: 'Link URL',  icon: <Link2 size={13} /> },
    { id: 'media',  label: 'Kho media', icon: <LayoutGrid size={13} /> },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-400">{values.length}/{maxImages} ảnh</span>
      </div>
      {hint && <p className="text-xs text-gray-400 mb-3">{hint}</p>}

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
                dragOverIdx === idx && dragSrcIdx !== idx ? 'border-blue-400 scale-105'
                  : dragSrcIdx === idx ? 'border-blue-300 opacity-50'
                  : 'border-gray-200 hover:border-gray-400'
              )}
            >
              <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-between p-1.5">
                <div className="bg-black/50 text-white rounded px-1.5 py-0.5 text-xs font-mono">{idx + 1}</div>
                <button type="button" onClick={() => remove(idx)}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors">
                  <X size={10} />
                </button>
              </div>
              <div className="absolute bottom-1 right-1 text-white/60 pointer-events-none"><GripVertical size={14} /></div>
              {idx < 4 && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                  {FACE_LABELS[idx]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab switcher — only show if can still add */}
      {canAdd && (
        <>
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1 mb-3">
            {TABS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setTab(t.id); setError(''); if (t.id === 'media') setShowMedia(true) }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all',
                  tab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs mb-2">
              <AlertCircle size={13} />
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} className="ml-auto"><X size={11} /></button>
            </div>
          )}

          {/* Tab: Local upload */}
          {tab === 'upload' && (
            <>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files) }}
                onClick={() => { setError(''); inputRef.current?.click() }}
                className={cn(
                  'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors',
                  uploading ? 'border-blue-300 bg-blue-50 pointer-events-none'
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
                    {values.length === 0 ? <ImageIcon className="text-gray-400" size={28} /> : <Plus className="text-blue-400" size={24} />}
                    <p className="text-sm text-gray-500">
                      {values.length === 0 ? <>Kéo thả hoặc <span className="text-blue-500 font-medium">chọn ảnh</span></> : <>Thêm ảnh ({remaining} còn lại)</>}
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG, WebP · Max 10MB · Chọn nhiều cùng lúc</p>
                  </div>
                )}
              </div>
              <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = '' }} />
            </>
          )}

          {/* Tab: URL */}
          {tab === 'url' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => { setUrlInput(e.target.value); setUrlValid(null); setError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlAdd()}
                    placeholder="https://example.com/image.jpg"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                  />
                  {urlValid === true && <CheckCircle2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
                </div>
                <button type="button" onClick={handleUrlAdd}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                  + Thêm
                </button>
              </div>
              {urlInput && (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img src={urlInput} alt="preview" className="w-full h-28 object-cover"
                    onError={() => setError('Không thể tải ảnh từ URL này')}
                    onLoad={() => setError('')} />
                </div>
              )}
              <p className="text-xs text-gray-400">Nhấn Enter hoặc "+ Thêm" để thêm ảnh từ link</p>
            </div>
          )}

          {/* Tab: Media library */}
          {tab === 'media' && (
            <button type="button" onClick={() => setShowMedia(true)}
              className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-5 text-center transition-colors">
              <LayoutGrid className="text-gray-400 mx-auto mb-1.5" size={24} />
              <p className="text-sm text-gray-500">Mở kho media để chọn ảnh</p>
              <p className="text-xs text-gray-400 mt-0.5">Có thể chọn nhiều ảnh cùng lúc</p>
            </button>
          )}
        </>
      )}

      {!canAdd && (
        <p className="text-xs text-gray-400 text-center mt-2">Đã đạt tối đa {maxImages} ảnh. Xóa ảnh để thêm mới.</p>
      )}

      {/* Media picker modal — multi mode */}
      <MediaPickerModal
        open={showMedia}
        multi
        onSelect={() => {}}
        onMultiSelect={handleMediaSelect}
        onClose={() => setShowMedia(false)}
      />
    </div>
  )
}
