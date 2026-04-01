import { useState, useEffect, useCallback } from 'react'
import { Users, Shield, ShieldCheck, ShieldAlert, Loader2, Search, UserPlus, X, Save, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'editor' | 'viewer'
  created_at: string
  updated_at: string
  email?: string
}

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: 'text-red-600 bg-red-50 border-red-200', icon: ShieldAlert, desc: 'Toàn quyền quản trị' },
  editor: { label: 'Editor', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: ShieldCheck, desc: 'Tạo & sửa nội dung' },
  viewer: { label: 'Viewer', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: Shield, desc: 'Chỉ xem' },
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePassword, setInvitePassword] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [inviting, setInviting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingRole, setEditingRole] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await supabase 
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true })
      setUsers((data as UserProfile[]) || [])
    } catch (err) {
      console.error('Fetch users error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleInvite = async () => {
    if (!inviteEmail || !invitePassword) {
      setError('Vui lòng nhập email và mật khẩu')
      return
    }
    if (invitePassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    setInviting(true)
    setError('')

    try {
      // Create user via Supabase Auth admin (only works with service role key in edge function)
      // For now, use signUp and then update the profile
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: inviteEmail,
        password: invitePassword,
        options: {
          data: { full_name: inviteName || inviteEmail.split('@')[0] }
        }
      })

      if (signUpErr) throw signUpErr

      // Update the profile with the correct role
      if (signUpData.user) {
        // Wait for trigger to create profile
        await new Promise(r => setTimeout(r, 1000))
        await supabase.from('profiles').update({ 
          role: inviteRole,
          full_name: inviteName || inviteEmail.split('@')[0]
        }).eq('id', signUpData.user.id)
      }

      setSuccess(`Đã tạo tài khoản ${inviteEmail}`)
      setShowInvite(false)
      setInviteEmail('')
      setInvitePassword('')
      setInviteName('')
      setInviteRole('editor')
      setTimeout(() => setSuccess(''), 3000)
      fetchUsers()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tạo tài khoản'
      setError(msg)
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    setEditingRole(null)
  }

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý người dùng</h2>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} tài khoản</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-48"
            />
          </div>
          <button onClick={() => setShowInvite(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <UserPlus size={16} /> Thêm tài khoản
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm mb-4">
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-lg text-sm mb-4">
          ✅ {success}
        </div>
      )}

      {/* Invite Form */}
      {showInvite && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Thêm tài khoản mới</h3>
            <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
              <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                placeholder="email@company.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={invitePassword} onChange={e => setInvitePassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                <option value="editor">Editor — Tạo & sửa nội dung</option>
                <option value="viewer">Viewer — Chỉ xem</option>
                <option value="admin">Admin — Toàn quyền</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleInvite} disabled={inviting}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {inviting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {inviting ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Người dùng</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vai trò</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(u => {
              const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.viewer
              const RoleIcon = roleConf.icon
              const isCurrentUser = u.id === currentUser?.id

              return (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {(u.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {u.full_name || 'Chưa đặt tên'}
                          {isCurrentUser && <span className="ml-2 text-xs text-primary font-normal">(Bạn)</span>}
                        </p>
                        <p className="text-xs text-gray-400">{u.email || u.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {editingRole === u.id ? (
                      <select value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value as 'admin' | 'editor' | 'viewer')}
                        onBlur={() => setEditingRole(null)}
                        autoFocus
                        className="px-2 py-1 border border-gray-200 rounded text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none">
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleConf.color}`}>
                        <RoleIcon size={12} /> {roleConf.label}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {new Date(u.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {!isCurrentUser && (
                      <button onClick={() => setEditingRole(editingRole === u.id ? null : u.id)}
                        className="text-xs text-gray-500 hover:text-primary transition-colors">
                        Đổi vai trò
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            <Users size={32} className="mx-auto mb-2 opacity-50" />
            Không tìm thấy người dùng nào
          </div>
        )}
      </div>

      {/* Role Legend */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Phân quyền</h4>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(ROLE_CONFIG).map(([key, conf]) => {
            const Icon = conf.icon
            return (
              <div key={key} className="flex items-start gap-2">
                <Icon size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{conf.label}</p>
                  <p className="text-xs text-gray-400">{conf.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
