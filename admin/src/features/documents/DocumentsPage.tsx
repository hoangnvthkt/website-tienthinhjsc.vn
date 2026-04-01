import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Download, FileText, File, Eye, EyeOff, Search, AlertCircle, X, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

interface Document {
  id: string
  title: string
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
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchDocs = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    setDocs((data as Document[]) || [])
    setLoading(false)
  }

  useEffect(() => { fetchDocs() }, [])

  const handleUpload = async (files: FileList) => {
    setError('')
    setUploading(true)

    for (const file of Array.from(files)) {
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
      } catch (err) {
        console.error('Upload error:', err)
        setError(`Lỗi upload ${file.name}`)
      }
    }

    setUploading(false)
    fetchDocs()
  }

  const toggleStatus = async (doc: Document) => {
    const newStatus = doc.status === 'published' ? 'draft' : 'published'
    await supabase.from('documents').update({ status: newStatus }).eq('id', doc.id)
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
    setDeleteTarget(null)
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
    if (type?.includes('image')) return '🖼️'
    return '📎'
  }

  const filtered = docs.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tài liệu</h2>
          <p className="text-sm text-gray-500 mt-0.5">{docs.length} tài liệu</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm..." className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-52" />
          </div>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            <Upload size={16} /> {uploading ? 'Đang upload...' : 'Upload tài liệu'}
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
            onChange={e => { if (e.target.files?.length) { handleUpload(e.target.files); e.target.value = '' } }} />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-xl border border-gray-200">
          <FileText size={48} className="mb-3" />
          <p className="text-sm">{search ? 'Không tìm thấy tài liệu' : 'Chưa có tài liệu nào'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tài liệu</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-24">Kích thước</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-24">Lượt tải</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-28">Trạng thái</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getFileIcon(doc.file_type)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{doc.title}</p>
                        <p className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa tài liệu"
        message={`Bạn có chắc muốn xóa "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
