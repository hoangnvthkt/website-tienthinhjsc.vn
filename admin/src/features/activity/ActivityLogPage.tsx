import { useState, useEffect } from 'react'
import { Clock, FolderKanban, FileText, BookOpen, Mail, FileDown, Image, Settings, Users, Search, Filter, Menu, Tags, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getActionLabel, getEntityLabel } from '@/lib/activityLog'
import type { ActivityLog } from '@/types/database'

const entityIcons: Record<string, React.ElementType> = {
  project: FolderKanban,
  post: FileText,
  page: BookOpen,
  contact: Mail,
  document: FileDown,
  media: Image,
  navigation: Menu,
  category: Tags,
  settings: Settings,
  user: Users,
}

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-700 border-green-200',
  update: 'bg-blue-100 text-blue-700 border-blue-200',
  delete: 'bg-red-100 text-red-700 border-red-200',
}

const actionLabelsVi: Record<string, string> = {
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchLogs = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100) as any

      if (filterType !== 'all') {
        query = query.eq('entity_type', filterType)
      }
      if (filterAction !== 'all') {
        query = query.eq('action', filterAction)
      }

      const { data } = await query
      setLogs((data || []) as ActivityLog[])
    } catch (err) {
      console.error('Failed to fetch activity logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filterType, filterAction])

  const filteredLogs = searchTerm
    ? logs.filter(log =>
        (log.entity_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user_email || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : logs

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Nhật ký hoạt động</h2>
          <p className="text-sm text-gray-500 mt-1">Theo dõi mọi thay đổi trong hệ thống</p>
        </div>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên, email..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          {/* Entity Type Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            >
              <option value="all">Tất cả loại</option>
              <option value="project">Dự án</option>
              <option value="post">Bài viết</option>
              <option value="page">Trang</option>
              <option value="contact">Liên hệ</option>
              <option value="document">Tài liệu</option>
              <option value="media">Media</option>
              <option value="navigation">Menu</option>
              <option value="category">Danh mục</option>
              <option value="settings">Cài đặt</option>
            </select>
          </div>

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          >
            <option value="all">Tất cả hành động</option>
            <option value="create">Tạo mới</option>
            <option value="update">Cập nhật</option>
            <option value="delete">Xóa</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Clock size={40} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">Chưa có hoạt động nào</p>
            <p className="text-xs mt-1">Các thay đổi sẽ được ghi nhận tại đây</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredLogs.map((log) => {
              const IconComp = entityIcons[log.entity_type] || Clock
              const colorClass = actionColors[log.action] || 'bg-gray-100 text-gray-700 border-gray-200'

              return (
                <div key={log.id} className="px-5 py-4 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    <IconComp size={16} className="text-gray-500" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{log.user_email?.split('@')[0] || 'Hệ thống'}</span>
                      {' '}{getActionLabel(log.action)}{' '}
                      {getEntityLabel(log.entity_type)}{' '}
                      {log.entity_title && (
                        <span className="font-medium">"{log.entity_title}"</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${colorClass}`}>
                        {actionLabelsVi[log.action] || log.action}
                      </span>
                      <span className="text-xs text-gray-400">{log.created_at ? timeAgo(log.created_at) : '—'}</span>
                    </div>
                  </div>

                  {/* Time */}
                  <span className="text-xs text-gray-400 shrink-0 mt-1">
                    {log.created_at ? new Date(log.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        {filteredLogs.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            Hiển thị {filteredLogs.length} hoạt động
          </div>
        )}
      </div>
    </div>
  )
}
