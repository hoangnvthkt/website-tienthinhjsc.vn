import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, FileText, Mail, Image, TrendingUp, Eye, Clock, BarChart3, PieChart, Menu, Users, Settings, ClipboardList } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'
import { getActionLabel, getEntityLabel } from '@/lib/activityLog'

interface Stats {
  projects: number
  posts: number
  contacts: number
  newContacts: number
  media: number
  pages: number
  navItems: number
  users: number
}

interface RecentContact {
  id: string
  name: string
  subject: string | null
  status: string
  created_at: string
}

interface ContentBreakdown {
  label: string
  count: number
  color: string
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({ projects: 0, posts: 0, contacts: 0, newContacts: 0, media: 0, pages: 0, navItems: 0, users: 0 })
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [contactsByStatus, setContactsByStatus] = useState<ContentBreakdown[]>([])
  const [projectsByCategory, setProjectsByCategory] = useState<ContentBreakdown[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, postsRes, contactsRes, newContactsRes, mediaRes, recentRes, pagesRes, navRes, usersRes, allContactsRes, projCatRes, catListRes] = await Promise.all([
          supabase.from('projects').select('id', { count: 'exact', head: true }),
          supabase.from('posts').select('id', { count: 'exact', head: true }),
          supabase.from('contacts').select('id', { count: 'exact', head: true }),
          supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('status', 'new'),
          supabase.from('media').select('id', { count: 'exact', head: true }),
          supabase.from('contacts').select('id, name, subject, status, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('pages').select('id', { count: 'exact', head: true }),
          supabase.from('navigation_items').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('contacts').select('status'),
          supabase.from('projects').select('category_id'),
          supabase.from('project_categories').select('id, name'),
        ])

        setStats({
          projects: projectsRes.count || 0,
          posts: postsRes.count || 0,
          contacts: contactsRes.count || 0,
          newContacts: newContactsRes.count || 0,
          media: mediaRes.count || 0,
          pages: pagesRes.count || 0,
          navItems: navRes.count || 0,
          users: usersRes.count || 0,
        })
        setRecentContacts(recentRes.data || [])

        // Contacts by status
        const statusCounts: Record<string, number> = {}
        const statusColors: Record<string, string> = { new: '#ef4444', read: '#f59e0b', replied: '#22c55e' }
        const statusLabels: Record<string, string> = { new: 'Mới', read: 'Đã đọc', replied: 'Đã trả lời' }
        ;(allContactsRes.data || []).forEach((c: { status: string }) => {
          statusCounts[c.status] = (statusCounts[c.status] || 0) + 1
        })
        setContactsByStatus(Object.entries(statusCounts).map(([k, v]) => ({
          label: statusLabels[k] || k, count: v, color: statusColors[k] || '#94a3b8'
        })))

        // Projects by category
        const catCounts: Record<string, number> = {}
        const catColors = ['#3b82f6', '#8b5cf6', '#ef4444', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#64748b']
        const catMap: Record<string, string> = {}
        ;(catListRes.data || []).forEach((c: { id: string; name: string }) => { catMap[c.id] = c.name })
        ;(projCatRes.data || []).forEach((p: { category_id: string | null }) => {
          const name = (p.category_id && catMap[p.category_id]) || 'Chưa phân loại'
          catCounts[name] = (catCounts[name] || 0) + 1
        })
        setProjectsByCategory(Object.entries(catCounts).map(([k, v], i) => ({
          label: k, count: v, color: catColors[i % catColors.length]
        })))

        // Fetch recent activity logs
        const { data: actLogs } = await (supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8) as any)
        setRecentActivities(actLogs || [])
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Dự án', value: stats.projects, icon: FolderKanban, color: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50' },
    { label: 'Bài viết', value: stats.posts, icon: FileText, color: 'from-purple-500 to-purple-600', bgLight: 'bg-purple-50' },
    { label: 'Liên hệ mới', value: stats.newContacts, icon: Mail, color: 'from-red-500 to-red-600', bgLight: 'bg-red-50' },
    { label: 'Media', value: stats.media, icon: Image, color: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50' },
    { label: 'Trang', value: stats.pages, icon: FileText, color: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50' },
    { label: 'Menu Items', value: stats.navItems, icon: Menu, color: 'from-cyan-500 to-cyan-600', bgLight: 'bg-cyan-50' },
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

  const totalContacts = contactsByStatus.reduce((s, c) => s + c.count, 0)
  const totalProjectsCat = projectsByCategory.reduce((s, c) => s + c.count, 0)

  return (
    <div className="space-y-6">
      {/* Welcome Bar */}
      <div className="bg-gradient-to-r from-primary via-primary-dark to-primary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute right-20 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-white/70 text-sm">Tổng quan hệ thống Tiến Thịnh JSC — {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="relative z-10 flex gap-8 mt-4">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Users size={16} /> {stats.users} người dùng
          </div>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Settings size={16} /> v2.0
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bgLight }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={`${bgLight} w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`bg-gradient-to-br ${color} bg-clip-text`} size={18} style={{ color: color.includes('blue') ? '#3b82f6' : color.includes('purple') ? '#8b5cf6' : color.includes('red') ? '#ef4444' : color.includes('amber') ? '#f59e0b' : color.includes('emerald') ? '#10b981' : '#06b6d4' }} />
              </div>
              <TrendingUp size={14} className="text-green-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contacts by Status - Horizontal Bar */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-gray-400" />
            <h3 className="font-semibold text-gray-800">Liên hệ theo trạng thái</h3>
          </div>
          {contactsByStatus.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              <Clock size={16} className="mr-2" /> Chưa có dữ liệu
            </div>
          ) : (
            <div className="space-y-3">
              {contactsByStatus.map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-800">{item.count}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" 
                      style={{ width: `${totalContacts > 0 ? (item.count / totalContacts) * 100 : 0}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 mt-2">Tổng: {totalContacts} liên hệ</p>
            </div>
          )}
        </div>

        {/* Projects by Category - Donut-like */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={18} className="text-gray-400" />
            <h3 className="font-semibold text-gray-800">Dự án theo danh mục</h3>
          </div>
          {projectsByCategory.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              <Clock size={16} className="mr-2" /> Chưa có dữ liệu
            </div>
          ) : (
            <div>
              {/* Stacked bar */}
              <div className="w-full h-5 rounded-full overflow-hidden flex mb-4">
                {projectsByCategory.map(item => (
                  <div key={item.label} className="h-full transition-all duration-700 first:rounded-l-full last:rounded-r-full"
                    style={{ width: `${totalProjectsCat > 0 ? (item.count / totalProjectsCat) * 100 : 0}%`, backgroundColor: item.color }}
                    title={`${item.label}: ${item.count}`} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {projectsByCategory.map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600 truncate">{item.label}</span>
                    <span className="font-medium text-gray-800 ml-auto">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Contacts */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Liên hệ gần đây</h3>
            <span className="text-xs text-gray-400">{stats.contacts} tổng</span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentContacts.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">Chưa có liên hệ nào</p>
            ) : (
              recentContacts.map((c) => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.status === 'new' ? 'bg-red-500 animate-pulse' : c.status === 'read' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.subject || 'Không có tiêu đề'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      c.status === 'new' ? 'bg-red-50 text-red-600 border border-red-100' :
                      c.status === 'read' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                      {c.status === 'new' ? 'Mới' : c.status === 'read' ? 'Đã đọc' : 'Đã trả lời'}
                    </span>
                    <span className="text-xs text-gray-400">{formatDateTime(c.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Eye size={16} className="text-gray-400" /> Menu nhanh
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Thêm dự án', href: '/projects/new', icon: FolderKanban, color: 'text-blue-500' },
                { label: 'Viết bài mới', href: '/posts/new', icon: FileText, color: 'text-purple-500' },
                { label: 'Upload media', href: '/media', icon: Image, color: 'text-amber-500' },
                { label: 'Cài đặt', href: '/settings', icon: Settings, color: 'text-gray-500' },
              ].map(action => (
                <a key={action.href} href={action.href}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                  <action.icon size={16} className={`${action.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm text-gray-700">{action.label}</span>
                </a>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <ClipboardList size={14} /> Hoạt động gần đây
              </h3>
              <button onClick={() => navigate('/activity')} className="text-[10px] text-white/50 hover:text-white/80 transition-colors">
                Xem tất cả →
              </button>
            </div>
            {recentActivities.length === 0 ? (
              <p className="text-white/40 text-xs">Chưa có hoạt động</p>
            ) : (
              <div className="space-y-2">
                {recentActivities.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      log.action === 'create' ? 'bg-green-400' :
                      log.action === 'delete' ? 'bg-red-400' : 'bg-blue-400'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-white/70 text-[11px] leading-tight">
                        <span className="text-white/90 font-medium">{(log.user_email || '').split('@')[0] || 'System'}</span>
                        {' '}{getActionLabel(log.action)} {getEntityLabel(log.entity_type)}
                        {log.entity_title && <span className="text-white/50"> "{log.entity_title}"</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
