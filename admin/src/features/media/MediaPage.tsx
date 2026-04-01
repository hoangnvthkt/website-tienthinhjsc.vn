import { useState, useEffect, useRef, useCallback } from 'react'
import { Upload, Trash2, Copy, Check, Search, Image as ImageIcon, X, FileImage, AlertCircle, Grid3x3, List } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

interface MediaItem {
  id: string
  file_name: string
  file_url: string
  file_type: string | null
  file_size: number | null
  alt_text: string | null
  uploaded_by: string | null
  created_at: string
}

export default function MediaPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchMedia = useCallback(async () => {
    const { data } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false })
    setItems((data as MediaItem[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMedia() }, [fetchMedia])

  const handleUpload = async (files: FileList | File[]) => {
    setError('')
    setUploading(true)
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) continue
      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadErr } = await supabase.storage
          .from('media')
          .upload(path, file, { contentType: file.type })
        if (uploadErr) throw uploadErr

        const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)

        await supabase.from('media').insert({
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user?.id || null,
        })
      } catch (err) {
        console.error('Upload error:', err)
        setError(`Lỗi upload ${file.name}`)
      }
    }

    setUploading(false)
    fetchMedia()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    // Extract path from URL
    const url = new URL(deleteTarget.file_url)
    const pathParts = url.pathname.split('/storage/v1/object/public/media/')
    if (pathParts[1]) {
      await supabase.storage.from('media').remove([pathParts[1]])
    }
    await supabase.from('media').delete().eq('id', deleteTarget.id)
    setDeleteTarget(null)
    if (selected?.id === deleteTarget.id) setSelected(null)
    fetchMedia()
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const filtered = items.filter(i =>
    i.file_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex gap-6 h-[calc(100vh-6rem)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Thư viện Media</h2>
            <p className="text-sm text-gray-500 mt-0.5">{items.length} file</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm..."
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-56"
              />
            </div>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                <Grid3x3 size={16} />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                <List size={16} />
              </button>
            </div>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              <Upload size={16} /> {uploading ? 'Đang upload...' : 'Upload ảnh'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => { if (e.target.files?.length) { handleUpload(e.target.files); e.target.value = '' } }} />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
            <AlertCircle size={16} /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        {/* Drop Zone + Grid */}
        <div
          onDragOver={e => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={e => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files) }}
          className={`flex-1 overflow-y-auto rounded-xl border-2 transition-colors ${
            dragActive ? 'border-primary bg-primary/5 border-dashed' : 'border-transparent'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FileImage size={48} className="mb-3" />
              <p className="text-sm">{search ? 'Không tìm thấy ảnh nào' : 'Chưa có ảnh nào'}</p>
              <p className="text-xs mt-1">Kéo thả hoặc bấm "Upload ảnh" để thêm</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
              {filtered.map(item => (
                <div key={item.id} onClick={() => setSelected(item)}
                  className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:shadow-lg ${
                    selected?.id === item.id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                  <div className="aspect-square bg-gray-100">
                    <img src={item.file_url} alt={item.alt_text || item.file_name}
                      className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs truncate">{item.file_name}</p>
                      <p className="text-white/60 text-[10px]">{formatSize(item.file_size)}</p>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setDeleteTarget(item) }}
                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {filtered.map(item => (
                <div key={item.id} onClick={() => setSelected(item)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selected?.id === item.id ? 'bg-primary/5 border border-primary/20' : 'hover:bg-gray-50 border border-transparent'
                  }`}>
                  <img src={item.file_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.file_name}</p>
                    <p className="text-xs text-gray-400">{formatSize(item.file_size)} · {new Date(item.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); copyUrl(item.file_url) }}
                    className="text-gray-400 hover:text-primary p-1"><Copy size={14} /></button>
                  <button onClick={e => { e.stopPropagation(); setDeleteTarget(item) }}
                    className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="w-72 shrink-0 bg-white rounded-xl border border-gray-200 p-4 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Chi tiết</h3>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <img src={selected.file_url} alt="" className="w-full rounded-lg mb-3 object-contain max-h-48 bg-gray-50" />
          
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-gray-500 font-medium">Tên file</label>
              <p className="text-gray-800 break-all">{selected.file_name}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Kích thước</label>
              <p className="text-gray-800">{formatSize(selected.file_size)}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Loại</label>
              <p className="text-gray-800">{selected.file_type || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Ngày upload</label>
              <p className="text-gray-800">{new Date(selected.created_at).toLocaleString('vi-VN')}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">URL</label>
              <div className="flex gap-1">
                <input type="text" value={selected.file_url} readOnly
                  className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 min-w-0" />
                <button onClick={() => copyUrl(selected.file_url)}
                  className="shrink-0 bg-primary/10 text-primary px-2 py-1.5 rounded text-xs hover:bg-primary/20 transition-colors">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-4 flex gap-2">
            <a href={selected.file_url} target="_blank" rel="noreferrer"
              className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
              Xem gốc
            </a>
            <button onClick={() => setDeleteTarget(selected)}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
              Xóa
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa ảnh"
        message={`Bạn có chắc muốn xóa "${deleteTarget?.file_name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
