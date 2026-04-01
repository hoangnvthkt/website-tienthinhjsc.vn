import { useEffect, useState } from 'react'
import { FolderKanban, FileText, Mail, Image } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'

interface Stats {
  projects: number
  posts: number
  contacts: number
  newContacts: number
  media: number
}

interface RecentContact {
  id: string
  name: string
  subject: string | null
  status: string
  created_at: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ projects: 0, posts: 0, contacts: 0, newContacts: 0, media: 0 })
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [projectsRes, postsRes, contactsRes, newContactsRes, mediaRes, recentRes] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('contacts').select('id', { count: 'exact', head: true }),
        supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('media').select('id', { count: 'exact', head: true }),
        supabase.from('contacts').select('id, name, subject, status, created_at').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        projects: projectsRes.count || 0,
        posts: postsRes.count || 0,
        contacts: contactsRes.count || 0,
        newContacts: newContactsRes.count || 0,
        media: mediaRes.count || 0,
      })
      setRecentContacts(recentRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Dự án', value: stats.projects, icon: FolderKanban, color: 'bg-blue-500' },
    { label: 'Bài viết', value: stats.posts, icon: FileText, color: 'bg-purple-500' },
    { label: 'Liên hệ mới', value: stats.newContacts, icon: Mail, color: 'bg-red-500' },
    { label: 'Media', value: stats.media, icon: Image, color: 'bg-amber-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <Icon className="text-white" size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Contacts */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Liên hệ gần đây</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentContacts.length === 0 ? (
            <p className="px-5 py-8 text-center text-gray-400 text-sm">Chưa có liên hệ nào</p>
          ) : (
            recentContacts.map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${c.status === 'new' ? 'bg-red-500' : c.status === 'read' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.subject || 'Không có tiêu đề'}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{formatDateTime(c.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Hướng dẫn nhanh</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>Dự án:</strong> Thêm/sửa/xóa portfolio dự án xây dựng</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>Bài viết:</strong> Tin công trường, tuyển dụng, kiến thức</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>Trang:</strong> Chỉnh sửa nội dung các trang tĩnh</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>Media:</strong> Upload và quản lý hình ảnh</span>
            </li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-5 text-white">
          <h3 className="font-semibold mb-2">Tổng quan hệ thống</h3>
          <div className="space-y-1.5 text-sm text-white/80">
            <p>Tổng dự án: <span className="text-white font-semibold">{stats.projects}</span></p>
            <p>Tổng bài viết: <span className="text-white font-semibold">{stats.posts}</span></p>
            <p>Tổng liên hệ: <span className="text-white font-semibold">{stats.contacts}</span></p>
            <p>Phiên bản: <span className="text-white font-semibold">v1.0</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
