/**
 * ImageUploader — Single image with 3 source tabs:
 *   1. Upload từ máy local
 *   2. Dùng link URL
 *   3. Chọn từ kho Media
 */
import { useState, useRef } from 'react'
import { Upload, Link2, LayoutGrid, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import MediaPickerModal from './MediaPickerModal'

interface ImageUploaderProps {
  value: string | null
  onChange: (url: string | null) => void
  bucket: string
  folder?: string
  className?: string
  label?: string
}

type Tab = 'upload' | 'url' | 'media'

export default function ImageUploader({
  value,
  onChange,
  bucket,
  folder = '',
  className,
  label = 'Ảnh đại diện',
}: ImageUploaderProps) {
  const [tab, setTab] = useState<Tab>('upload')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [urlValid, setUrlValid] = useState<boolean | null>(null)
  const [showMedia, setShowMedia] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Upload local file ────────────────────────────────────────────────────
  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Chỉ chấp nhận file ảnh (PNG, JPG, WebP)'); return }
    if (file.size > 10 * 1024 * 1024) { setError('File quá lớn. Tối đa 10MB.'); return }
    setError(''); setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Chưa đăng nhập')
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: err } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true, contentType: file.type })
      if (err) throw err
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
      onChange(urlData.publicUrl)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload thất bại')
    } finally {
      setUploading(false)
    }
  }

  // ── Validate URL ─────────────────────────────────────────────────────────
  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) { setError('Vui lòng nhập URL'); return }
    try {
      new URL(trimmed)
      onChange(trimmed)
      setUrlValid(true)
      setError('')
    } catch {
      setError('URL không hợp lệ')
      setUrlValid(false)
    }
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'upload', label: 'Máy tính', icon: <Upload size={13} /> },
    { id: 'url',    label: 'Link URL',  icon: <Link2 size={13} /> },
    { id: 'media',  label: 'Kho media', icon: <LayoutGrid size={13} /> },
  ]

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {/* Preview */}
      {value && (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 mb-3">
          <img src={value} alt="" className="w-full h-44 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => onChange(null)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5">
              <X size={14} /> Xóa ảnh
            </button>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1 mb-3">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); setError(''); if (t.id === 'media') setShowMedia(true) }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all',
              tab === t.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
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
            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f) }}
            onClick={() => { setError(''); inputRef.current?.click() }}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30',
              uploading && 'opacity-50 pointer-events-none'
            )}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="animate-spin h-7 w-7 text-blue-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-blue-600">Đang upload...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                {dragActive ? <Upload className="text-blue-500" size={28} /> : <Upload className="text-gray-400" size={28} />}
                <p className="text-sm text-gray-500">Kéo thả ảnh hoặc <span className="text-blue-500 font-medium">chọn file</span></p>
                <p className="text-xs text-gray-400">PNG, JPG, WebP · Tối đa 10MB</p>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }} />
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
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                placeholder="https://example.com/image.jpg"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
              />
              {urlValid === true && (
                <CheckCircle2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
              )}
            </div>
            <button type="button" onClick={handleUrlSubmit}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              Dùng
            </button>
          </div>
          {urlInput && (
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <img src={urlInput} alt="preview" className="w-full h-32 object-cover"
                onError={() => setError('Không thể tải ảnh từ URL này')}
                onLoad={() => setError('')} />
            </div>
          )}
          <p className="text-xs text-gray-400">Nhập link ảnh công khai từ internet</p>
        </div>
      )}

      {/* Tab: Media library — opens modal */}
      {tab === 'media' && (
        <button type="button" onClick={() => setShowMedia(true)}
          className="w-full border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-6 text-center transition-colors">
          <LayoutGrid className="text-gray-400 mx-auto mb-2" size={28} />
          <p className="text-sm text-gray-500">Mở kho media để chọn ảnh</p>
        </button>
      )}

      <MediaPickerModal
        open={showMedia}
        onSelect={(url) => { onChange(url); setTab('upload') }}
        onClose={() => setShowMedia(false)}
      />
    </div>
  )
}
