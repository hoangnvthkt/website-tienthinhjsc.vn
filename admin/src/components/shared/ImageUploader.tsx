import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  value: string | null
  onChange: (url: string | null) => void
  bucket: string
  folder?: string
  className?: string
  label?: string
}

export default function ImageUploader({ value, onChange, bucket, folder = '', className, label = 'Ảnh đại diện' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (PNG, JPG, WebP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File quá lớn. Tối đa 10MB.')
      return
    }
    setError('')
    setUploading(true)
    try {
      // Check auth session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Chưa đăng nhập. Vui lòng đăng nhập lại.')
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type,
        })
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error(uploadError.message)
      }
      
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
      onChange(urlData.publicUrl)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload thất bại'
      console.error('Upload error:', err)
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs mb-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <X size={12} />
          </button>
        </div>
      )}

      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200">
          <img src={value} alt="" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => { setError(''); inputRef.current?.click() }} className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100">
              Thay đổi
            </button>
            <button type="button" onClick={() => onChange(null)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600">
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => { setError(''); inputRef.current?.click() }}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50',
            uploading && 'opacity-50 pointer-events-none'
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              <p className="text-sm text-gray-500">Đang upload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {dragActive ? <Upload className="text-primary" size={32} /> : <ImageIcon className="text-gray-400" size={32} />}
              <p className="text-sm text-gray-500">Kéo thả ảnh hoặc <span className="text-primary font-medium">chọn file</span></p>
              <p className="text-xs text-gray-400">PNG, JPG, WebP (max 10MB)</p>
            </div>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" 
        onChange={(e) => { 
          const f = e.target.files?.[0]
          if (f) handleUpload(f)
          e.target.value = ''
        }} 
      />
    </div>
  )
}
