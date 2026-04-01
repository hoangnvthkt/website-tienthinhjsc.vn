import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Post, PostCategory } from '@/types/database'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { formatDate, truncate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'


export default function PostsListPage() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<PostCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchPosts = async () => {
    setLoading(true)
    try {
      let query = supabase.from('posts').select('*').order('created_at', { ascending: false })
      if (catFilter !== 'all') query = query.eq('category', catFilter)
      if (search) query = query.ilike('title', `%${search}%`)
      const { data } = await query
      setPosts(data || [])
    } catch (err) {
      console.error('Fetch posts error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    supabase.from('post_categories').select('*').order('sort_order').then(({ data }) => setCategories(data || []))
  }, [])

  useEffect(() => { fetchPosts() }, [catFilter, search])

  const handleDelete = async () => {
    if (!deleteId) return
    await supabase.from('posts').delete().eq('id', deleteId)
    setDeleteId(null)
    fetchPosts()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Tìm bài viết..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-64" />
          </div>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
            <option value="all">Tất cả danh mục</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <Link to="/posts/new" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Viết bài mới
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tiêu đề</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Danh mục</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ngày tạo</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                <svg className="animate-spin h-6 w-6 text-primary mx-auto" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              </td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">Chưa có bài viết nào</td></tr>
            ) : posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{truncate(post.excerpt || '', 60)}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{categories.find(c => c.slug === post.category)?.name || post.category}</span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={post.status} /></td>
                <td className="px-4 py-3 text-gray-500">{formatDate(post.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/posts/${post.id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></Link>
                    {profile?.role === 'admin' && (
                      <button onClick={() => setDeleteId(post.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-500">Tổng: {posts.length} bài viết</div>}
      </div>

      <ConfirmDialog open={!!deleteId} title="Xóa bài viết" message="Bạn có chắc muốn xóa bài viết này?" confirmLabel="Xóa" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  )
}
