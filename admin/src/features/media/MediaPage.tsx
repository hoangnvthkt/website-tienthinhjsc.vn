import { useState, useEffect, useRef, useCallback } from 'react'
import { Upload, Trash2, Copy, Check, Search, Image as ImageIcon, X, FileImage, AlertCircle, Grid3x3, List, CheckSquare, Square, Filter, Music } from 'lucide-react'
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
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [altText, setAltText] = useState('')
  const [savingAlt, setSavingAlt] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchMedia = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false })
      setItems((data as MediaItem[]) || [])
    } catch (err) {
      console.error('Fetch media error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMedia() }, [fetchMedia])

  useEffect(() => {
    if (selected) setAltText(selected.alt_text || '')
  }, [selected])

  const handleUpload = async (files: FileList | File[]) => {
    setError('')
    setUploading(true)
    const fileArray = Array.from(files)
    setUploadProgress({ current: 0, total: fileArray.length })

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('application/pdf') && !file.type.startsWith('audio/')) continue
      setUploadProgress({ current: i + 1, total: fileArray.length })
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
    setUploadProgress({ current: 0, total: 0 })
    fetchMedia()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
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

  const handleBulkDelete = async () => {
    for (const id of bulkSelected) {
      const item = items.find(i => i.id === id)
      if (!item) continue
      try {
        const url = new URL(item.file_url)
        const pathParts = url.pathname.split('/storage/v1/object/public/media/')
        if (pathParts[1]) {
          await supabase.storage.from('media').remove([pathParts[1]])
        }
        await supabase.from('media').delete().eq('id', id)
      } catch (e) { console.error(e) }
    }
    setBulkSelected(new Set())
    setBulkDeleteOpen(false)
    setBulkMode(false)
    if (selected && bulkSelected.has(selected.id)) setSelected(null)
    fetchMedia()
  }

  const toggleBulkItem = (id: string) => {
    setBulkSelected(prev => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id); else s.add(id)
      return s
    })
  }

  const handleSaveAlt = async () => {
    if (!selected) return
    setSavingAlt(true)
    await supabase.from('media').update({ alt_text: altText || null }).eq('id', selected.id)
    setItems(prev => prev.map(i => i.id === selected.id ? { ...i, alt_text: altText || null } : i))
    setSelected(prev => prev ? { ...prev, alt_text: altText || null } : null)
    setSavingAlt(false)
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

  // Unique file types for filter
  const fileTypes = [...new Set(items.map(i => {
    if (i.file_type?.startsWith('image/')) return 'image'
    if (i.file_type?.startsWith('video/')) return 'video'
    if (i.file_type?.includes('pdf')) return 'pdf'
    if (i.file_type?.startsWith('audio/')) return 'audio'
    return 'other'
  }))]

  const filtered = items.filter(i => {
    const matchSearch = i.file_name.toLowerCase().includes(search.toLowerCase())
    if (typeFilter === 'all') return matchSearch
    if (typeFilter === 'image') return matchSearch && i.file_type?.startsWith('image/')
    if (typeFilter === 'video') return matchSearch && i.file_type?.startsWith('video/')
    if (typeFilter === 'pdf') return matchSearch && i.file_type?.includes('pdf')
    if (typeFilter === 'audio') return matchSearch && i.file_type?.startsWith('audio/')
    return matchSearch
  })

  return (
    <div className="flex gap-6 h-[calc(100vh-6rem)]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Thư viện Media</h2>
            <p className="text-sm text-gray-500 mt-0.5">{items.length} file{bulkMode && bulkSelected.size > 0 ? ` · ${bulkSelected.size} đã chọn` : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm..."
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-48"
              />
            </div>
            {/* Type filter */}
            {fileTypes.length > 1 && (
              <div className="relative">
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  className="appearance-none pl-8 pr-6 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value="all">Tất cả</option>
                  {fileTypes.includes('image') && <option value="image">🖼️ Ảnh</option>}
                  {fileTypes.includes('video') && <option value="video">🎬 Video</option>}
                  {fileTypes.includes('pdf') && <option value="pdf">📄 PDF</option>}
                  {fileTypes.includes('audio') && <option value="audio">🎵 Âm thanh</option>}
                </select>
                <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )}
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
            {/* Bulk mode toggle */}
            <button onClick={() => { setBulkMode(!bulkMode); setBulkSelected(new Set()) }}
              className={`p-2 rounded-lg border transition-colors ${bulkMode ? 'bg-amber-50 border-amber-200 text-amber-600' : 'border-gray-200 text-gray-400 hover:text-gray-600'}`}
              title="Chọn nhiều">
              <CheckSquare size={16} />
            </button>
            {/* Bulk delete */}
            {bulkMode && bulkSelected.size > 0 && (
              <button onClick={() => setBulkDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                <Trash2 size={14} /> Xóa {bulkSelected.size}
              </button>
            )}
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              <Upload size={16} /> {uploading ? `${uploadProgress.current}/${uploadProgress.total}` : 'Upload'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,audio/*,.mp3,.ogg,.wav,.m4a,.aac" multiple className="hidden"
              onChange={e => { if (e.target.files?.length) { handleUpload(e.target.files); e.target.value = '' } }} />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
            <AlertCircle size={16} /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Đang upload... {uploadProgress.current}/{uploadProgress.total}</span>
              <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }} />
            </div>
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
              <p className="text-sm">{search ? 'Không tìm thấy file nào' : 'Chưa có file nào'}</p>
              <p className="text-xs mt-1">Kéo thả hoặc bấm "Upload" để thêm</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-1">
              {filtered.map(item => (
                <div key={item.id}
                  onClick={() => bulkMode ? toggleBulkItem(item.id) : setSelected(item)}
                  className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:shadow-lg ${
                    bulkMode && bulkSelected.has(item.id) ? 'border-amber-400 ring-2 ring-amber-200' :
                    selected?.id === item.id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-gray-200'
                  }`}>
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {item.file_type?.startsWith('audio/') ? (
                      <div className="flex flex-col items-center gap-1 text-violet-400">
                        <Music size={32} />
                        <span className="text-[10px] text-gray-400 font-medium uppercase">{item.file_name.split('.').pop()}</span>
                      </div>
                    ) : (
                      <img src={item.file_url} alt={item.alt_text || item.file_name}
                        className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>
                  {/* Bulk checkbox */}
                  {bulkMode && (
                    <div className="absolute top-2 left-2">
                      {bulkSelected.has(item.id)
                        ? <CheckSquare size={20} className="text-amber-500 drop-shadow" />
                        : <Square size={20} className="text-white drop-shadow" />}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs truncate">{item.file_name}</p>
                      <p className="text-white/60 text-[10px]">{formatSize(item.file_size)}</p>
                    </div>
                  </div>
                  {!bulkMode && (
                    <button onClick={e => { e.stopPropagation(); setDeleteTarget(item) }}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {filtered.map(item => (
                <div key={item.id}
                  onClick={() => bulkMode ? toggleBulkItem(item.id) : setSelected(item)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    bulkMode && bulkSelected.has(item.id) ? 'bg-amber-50 border border-amber-200' :
                    selected?.id === item.id ? 'bg-primary/5 border border-primary/20' : 'hover:bg-gray-50 border border-transparent'
                  }`}>
                  {bulkMode && (
                    <div className="shrink-0">
                      {bulkSelected.has(item.id)
                        ? <CheckSquare size={18} className="text-amber-500" />
                        : <Square size={18} className="text-gray-300" />}
                    </div>
                  )}
                  {item.file_type?.startsWith('audio/') ? (
                    <div className="w-12 h-12 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                      <Music size={20} className="text-violet-500" />
                    </div>
                  ) : (
                    <img src={item.file_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.file_name}</p>
                    <p className="text-xs text-gray-400">{formatSize(item.file_size)} · {new Date(item.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  {!bulkMode && (
                    <>
                      <button onClick={e => { e.stopPropagation(); copyUrl(item.file_url) }}
                        className="text-gray-400 hover:text-primary p-1"><Copy size={14} /></button>
                      <button onClick={e => { e.stopPropagation(); setDeleteTarget(item) }}
                        className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selected && !bulkMode && (
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
            {/* Alt Text Editing */}
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Alt Text (SEO)</label>
              <div className="flex gap-1">
                <input type="text" value={altText}
                  onChange={e => setAltText(e.target.value)}
                  placeholder="Mô tả ảnh cho SEO..."
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs min-w-0 focus:ring-1 focus:ring-primary/30 focus:border-primary outline-none" />
                <button onClick={handleSaveAlt} disabled={savingAlt || altText === (selected.alt_text || '')}
                  className="shrink-0 bg-primary/10 text-primary px-2 py-1.5 rounded text-xs hover:bg-primary/20 transition-colors disabled:opacity-30">
                  {savingAlt ? '...' : <Check size={12} />}
                </button>
              </div>
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
        title="Xóa file"
        message={`Bạn có chắc muốn xóa "${deleteTarget?.file_name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Xóa nhiều file"
        message={`Bạn có chắc muốn xóa ${bulkSelected.size} file đã chọn? Hành động này không thể hoàn tác.`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  )
}
