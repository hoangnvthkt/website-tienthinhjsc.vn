import { useState, useEffect, useRef, useCallback } from 'react'
import { Upload, Trash2, Download, FileText, File, Eye, EyeOff, Search, AlertCircle, X, ExternalLink, Edit3, Check, GripVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

interface Document {
  id: string
  title: string
  description: string | null
  file_url: string
  file_type: string | null
  file_size: number | null
  download_count: number
  status: 'draft' | 'published'
  created_at: string
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const fetchDocs = async () => {
    try {
      const { data } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
      setDocs((data as Document[]) || [])
    } catch (err) {
      console.error('Fetch docs error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocs() }, [])

  // Auto-dismiss success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleUpload = async (files: FileList | File[]) => {
    setError('')
    setUploading(true)
    setUploadProgress(0)
    const fileArray = Array.from(files)
    let uploaded = 0

    for (const file of fileArray) {
      // Validate size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError(`File "${file.name}" vượt quá 50MB`)
        continue
      }

      try {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
        const path = `docs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadErr } = await supabase.storage
          .from('documents')
          .upload(path, file, { contentType: file.type })
        if (uploadErr) throw uploadErr

        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)

        await supabase.from('documents').insert({
          title: file.name.replace(/\.[^.]+$/, ''),
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          status: 'draft',
        })

        uploaded++
        setUploadProgress(Math.round((uploaded / fileArray.length) * 100))
      } catch (err) {
        console.error('Upload error:', err)
        setError(`Lỗi upload ${file.name}`)
      }
    }

    setUploading(false)
    setUploadProgress(0)
    if (uploaded > 0) {
      setSuccess(`Đã upload thành công ${uploaded} tài liệu`)
    }
    fetchDocs()
  }

  const toggleStatus = async (doc: Document) => {
    const newStatus = doc.status === 'published' ? 'draft' : 'published'
    await supabase.from('documents').update({ status: newStatus }).eq('id', doc.id)
    setSuccess(newStatus === 'published' ? `"${doc.title}" đã được công khai` : `"${doc.title}" đã chuyển về nháp`)
    fetchDocs()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const url = new URL(deleteTarget.file_url)
    const pathParts = url.pathname.split('/storage/v1/object/public/documents/')
    if (pathParts[1]) {
      await supabase.storage.from('documents').remove([pathParts[1]])
    }
    await supabase.from('documents').delete().eq('id', deleteTarget.id)
    setSuccess(`Đã xóa "${deleteTarget.title}"`)
    setDeleteTarget(null)
    fetchDocs()
  }

  const startEdit = (doc: Document) => {
    setEditingId(doc.id)
    setEditTitle(doc.title)
    setEditDescription(doc.description || '')
  }

  const saveEdit = async () => {
    if (!editingId || !editTitle.trim()) return
    await supabase.from('documents').update({
      title: editTitle.trim(),
      description: editDescription.trim() || null,
    }).eq('id', editingId)
    setEditingId(null)
    setSuccess('Đã cập nhật tài liệu')
    fetchDocs()
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
  }

  const publishAll = async () => {
    const draftDocs = docs.filter(d => d.status === 'draft')
    if (!draftDocs.length) return
    await supabase.from('documents').update({ status: 'published' }).in('id', draftDocs.map(d => d.id))
    setSuccess(`Đã công khai ${draftDocs.length} tài liệu`)
    fetchDocs()
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string | null) => {
    if (type?.includes('pdf')) return '📄'
    if (type?.includes('word') || type?.includes('document')) return '📝'
    if (type?.includes('excel') || type?.includes('spreadsheet')) return '📊'
    if (type?.includes('powerpoint') || type?.includes('presentation')) return '📊'
    if (type?.includes('image')) return '🖼️'
    if (type?.includes('zip') || type?.includes('rar') || type?.includes('archive')) return '📦'
    return '📎'
  }

  const getFileExtension = (type: string | null, url: string) => {
    if (type?.includes('pdf')) return 'PDF'
    if (type?.includes('word') || type?.includes('document')) return 'DOCX'
    if (type?.includes('excel') || type?.includes('spreadsheet')) return 'XLSX'
    if (type?.includes('powerpoint') || type?.includes('presentation')) return 'PPTX'
    if (type?.includes('zip')) return 'ZIP'
    if (type?.includes('rar')) return 'RAR'
    const ext = url.split('.').pop()?.toUpperCase()
    return ext || 'FILE'
  }

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files?.length) {
      handleUpload(files)
    }
  }, [])

  const filtered = docs.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  const draftCount = docs.filter(d => d.status === 'draft').length
  const publishedCount = docs.filter(d => d.status === 'published').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tài liệu</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {docs.length} tài liệu
            {publishedCount > 0 && <span className="text-green-600"> · {publishedCount} công khai</span>}
            {draftCount > 0 && <span className="text-gray-400"> · {draftCount} nháp</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm..." className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-52" />
          </div>
          {draftCount > 0 && (
            <button onClick={publishAll}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Eye size={16} /> Công khai tất cả ({draftCount})
            </button>
          )}
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            <Upload size={16} /> {uploading ? `Đang upload ${uploadProgress}%...` : 'Upload tài liệu'}
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.dwg,.dxf"
            onChange={e => { if (e.target.files?.length) { handleUpload(e.target.files); e.target.value = '' } }} />
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm mb-4 animate-fade-in">
          <Check size={16} /> {success}
          <button onClick={() => setSuccess('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Upload progress bar */}
      {uploading && (
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <>
          {/* Drag & Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !docs.length && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all duration-200 cursor-pointer ${
              isDragOver
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
            } ${!docs.length ? 'py-16' : 'py-6'}`}
          >
            <div className={`flex flex-col items-center gap-2 ${isDragOver ? 'text-primary' : 'text-gray-400'}`}>
              <Upload size={docs.length ? 24 : 40} className={isDragOver ? 'animate-bounce' : ''} />
              <p className="text-sm font-medium">
                {isDragOver ? 'Thả file tại đây để upload' : 'Kéo thả file vào đây hoặc click để chọn'}
              </p>
              <p className="text-xs text-gray-400">
                Hỗ trợ: PDF, Word, Excel, PowerPoint, ZIP, RAR, DWG · Tối đa 50MB/file
              </p>
            </div>
          </div>

          {/* Documents Table */}
          {filtered.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tài liệu</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-20">Loại</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-24">Kích thước</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-24">Lượt tải</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-28">Trạng thái</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-36">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(doc => (
                    <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        {editingId === doc.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              className="w-full text-sm font-medium px-2 py-1 border border-primary/30 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                              autoFocus
                              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
                            />
                            <input
                              type="text"
                              value={editDescription}
                              onChange={e => setEditDescription(e.target.value)}
                              placeholder="Thêm mô tả (tùy chọn)..."
                              className="w-full text-xs px-2 py-1 border border-gray-200 rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-500"
                              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit() }}
                            />
                            <div className="flex gap-2">
                              <button onClick={saveEdit} className="text-xs text-primary hover:text-primary-dark font-medium">Lưu</button>
                              <button onClick={cancelEdit} className="text-xs text-gray-400 hover:text-gray-600">Hủy</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{getFileIcon(doc.file_type)}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{doc.title}</p>
                              {doc.description && <p className="text-xs text-gray-400 mt-0.5">{doc.description}</p>}
                              <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString('vi-VN')}</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 text-xs font-mono font-medium bg-gray-100 text-gray-600 rounded">
                          {getFileExtension(doc.file_type, doc.file_url)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatSize(doc.file_size)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">
                        <span className="inline-flex items-center gap-1">
                          <Download size={12} /> {doc.download_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleStatus(doc)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            doc.status === 'published'
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}>
                          {doc.status === 'published' ? <><Eye size={12} /> Công khai</> : <><EyeOff size={12} /> Nháp</>}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => startEdit(doc)}
                            className="text-gray-400 hover:text-primary p-1.5 rounded-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                            title="Sửa tên">
                            <Edit3 size={14} />
                          </button>
                          <a href={doc.file_url} target="_blank" rel="noreferrer"
                            className="text-gray-400 hover:text-primary p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                            title="Mở file">
                            <ExternalLink size={14} />
                          </a>
                          <button onClick={() => setDeleteTarget(doc)}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                            title="Xóa">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa tài liệu"
        message={`Bạn có chắc muốn xóa "${deleteTarget?.title}"? File sẽ bị xóa vĩnh viễn.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
