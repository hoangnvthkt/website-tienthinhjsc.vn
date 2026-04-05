import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/types/database'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { formatDate, truncate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const PAGE_LABELS: Record<string, { label: string; color: string }> = {
  'proj-done': { label: 'Đã TK', color: 'bg-green-100 text-green-700' },
  'proj-ongoing': { label: 'Đang TK', color: 'bg-blue-100 text-blue-700' },
  'exhibitions': { label: 'Tiêu biểu', color: 'bg-amber-100 text-amber-700' },
  'proj-country': { label: 'Quốc gia', color: 'bg-purple-100 text-purple-700' },
  'proj-field': { label: 'Lĩnh vực', color: 'bg-rose-100 text-rose-700' },
}

const PAGE_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trang' },
  { value: 'proj-done', label: 'Dự án đã triển khai' },
  { value: 'proj-ongoing', label: 'Dự án đang triển khai' },
  { value: 'exhibitions', label: 'Dự án tiêu biểu' },
  { value: 'proj-country', label: 'Theo quốc gia' },
  { value: 'proj-field', label: 'Theo lĩnh vực' },
]

// Extended type to include new columns
interface ProjectWithPages extends Project {
  display_pages?: string[]
  country?: string | null
}

export default function ProjectsListPage() {
  const { profile } = useAuth()
  const [projects, setProjects] = useState<ProjectWithPages[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [pageFilter, setPageFilter] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      let query = supabase.from('projects').select('*').order('sort_order', { ascending: true })
      if (statusFilter !== 'all') query = query.eq('status', statusFilter as 'draft' | 'published')
      if (search) query = query.ilike('title', `%${search}%`)
      if (pageFilter !== 'all') query = query.contains('display_pages', [pageFilter])
      const { data } = await query
      setProjects((data as ProjectWithPages[]) || [])
    } catch (err) {
      console.error('Fetch projects error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [statusFilter, search, pageFilter])

  const handleDelete = async () => {
    if (!deleteId) return
    await supabase.from('projects').delete().eq('id', deleteId)
    setDeleteId(null)
    fetchProjects()
  }

  const toggleStatus = async (project: ProjectWithPages) => {
    const newStatus = project.status === 'published' ? 'draft' : 'published'
    await supabase.from('projects').update({
      status: newStatus,
      published_at: newStatus === 'published' ? new Date().toISOString() : null
    }).eq('id', project.id)
    fetchProjects()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm dự án..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-56"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Nháp</option>
          </select>
          <select
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            {PAGE_FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Thêm dự án
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-12">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ảnh</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tên dự án</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Trang hiển thị</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Danh mục</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Năm</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Trạng thái</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ngày tạo</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                  <svg className="animate-spin h-6 w-6 text-primary mx-auto" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">Không có dự án nào</td></tr>
              ) : (
                projects.map((project, idx) => (
                  <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {project.featured_image ? (
                        <img src={project.featured_image} alt="" className="w-14 h-10 object-cover rounded-md border border-gray-200" />
                      ) : (
                        <div className="w-14 h-10 bg-gray-100 rounded-md flex items-center justify-center"><Eye className="text-gray-300" size={16} /></div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{project.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{truncate(project.subtitle || '', 40)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(project.display_pages || ['proj-done']).map(page => {
                          const info = PAGE_LABELS[page]
                          return info ? (
                            <span key={page} className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${info.color}`}>
                              {info.label}
                            </span>
                          ) : null
                        })}
                        {project.country && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                            🌍 {project.country}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{project.category}</td>
                    <td className="px-4 py-3 text-gray-600">{project.year}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(project)} title="Click để đổi trạng thái">
                        <StatusBadge status={project.status} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(project.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/projects/${project.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Pencil size={16} />
                        </Link>
                        {profile?.role === 'admin' && (
                          <button
                            onClick={() => setDeleteId(project.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            Tổng: {projects.length} dự án
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Xóa dự án"
        message="Bạn có chắc muốn xóa dự án này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
