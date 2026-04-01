import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban, FileText, BookOpen,
  Mail, FileDown, Image, Settings, LogOut, Tags, Menu, Users, ClipboardList
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Dự án' },
  { to: '/posts', icon: FileText, label: 'Bài viết' },
  { to: '/pages', icon: BookOpen, label: 'Trang' },
  { to: '/categories', icon: Tags, label: 'Danh mục' },
  { to: '/navigation', icon: Menu, label: 'Navigation' },
  { to: '/contacts', icon: Mail, label: 'Liên hệ' },
  { to: '/documents', icon: FileDown, label: 'Tài liệu' },
  { to: '/media', icon: Image, label: 'Media' },
  { to: '/users', icon: Users, label: 'Người dùng' },
  { to: '/activity', icon: ClipboardList, label: 'Nhật ký' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
]

export default function Sidebar() {
  const { profile, signOut } = useAuth()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-sidebar flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TT</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm leading-tight">Tiến Thịnh</h1>
            <p className="text-gray-500 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-active text-white'
                  : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-primary-light text-xs font-semibold">
              {profile?.full_name?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {profile?.full_name || 'Admin'}
            </p>
            <p className="text-gray-500 text-xs capitalize">{profile?.role}</p>
          </div>
          <button
            onClick={signOut}
            className="text-gray-500 hover:text-red-400 transition-colors p-1"
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
