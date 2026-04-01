import { useEffect, useState } from 'react'
import { Mail, Eye, Reply, Trash2, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Contact } from '@/types/database'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { formatDateTime } from '@/lib/utils'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchContacts = async () => {
    setLoading(true)
    let query = supabase.from('contacts').select('*').order('created_at', { ascending: false })
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    const { data } = await query
    setContacts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchContacts() }, [statusFilter, search])

  const markAsRead = async (contact: Contact) => {
    setSelected(contact)
    if (contact.status === 'new') {
      await supabase.from('contacts').update({ status: 'read' }).eq('id', contact.id)
      fetchContacts()
    }
  }

  const markAsReplied = async (id: string) => {
    await supabase.from('contacts').update({ status: 'replied' }).eq('id', id)
    setSelected(null)
    fetchContacts()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await supabase.from('contacts').delete().eq('id', deleteId)
    setDeleteId(null)
    if (selected?.id === deleteId) setSelected(null)
    fetchContacts()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-8rem)]">
      {/* List */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-gray-100 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div className="flex gap-1">
            {['all', 'new', 'read', 'replied'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                {s === 'all' ? 'Tất cả' : s === 'new' ? 'Mới' : s === 'read' ? 'Đã đọc' : 'Đã trả lời'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loading ? (
            <div className="flex items-center justify-center h-32"><svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">Không có liên hệ</div>
          ) : contacts.map((c) => (
            <button key={c.id} onClick={() => markAsRead(c)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selected?.id === c.id ? 'bg-primary/5 border-l-2 border-primary' : ''} ${c.status === 'new' ? 'bg-blue-50/50' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${c.status === 'new' ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{c.name}</span>
                <StatusBadge status={c.status} />
              </div>
              <p className="text-xs text-gray-500 truncate">{c.subject || 'Không có tiêu đề'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(c.created_at)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">{selected.subject || 'Không có tiêu đề'}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">{selected.name}</span>
                  {selected.email && <span>• {selected.email}</span>}
                  {selected.phone && <span>• {selected.phone}</span>}
                </div>
                {selected.company && <p className="text-xs text-gray-400 mt-0.5">Công ty: {selected.company}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => markAsReplied(selected.id)}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Đánh dấu đã trả lời">
                  <Reply size={18} />
                </button>
                <button onClick={() => setDeleteId(selected.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Xóa">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 p-5 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              <p className="text-xs text-gray-400 mt-4">{formatDateTime(selected.created_at)}</p>
            </div>
            {selected.email && (
              <div className="p-4 border-t border-gray-100">
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || ''}`}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Mail size={16} /> Trả lời qua email
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Eye size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Chọn một liên hệ để xem chi tiết</p>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog open={!!deleteId} title="Xóa liên hệ" message="Bạn có chắc muốn xóa liên hệ này?" confirmLabel="Xóa" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
