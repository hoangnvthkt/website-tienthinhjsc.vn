import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { generateSlug } from '@/lib/utils'
import { logActivity } from '@/lib/activityLog'
import ImageUploader from '@/components/shared/ImageUploader'
import RichTextEditor from '@/components/shared/RichTextEditor'
import SeoFields from '@/components/shared/SeoFields'
import type { PostCategory } from '@/types/database'

interface FormData {
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string | null
  category: string
  category_id: string | null
  status: 'draft' | 'published'
  meta_title: string
  meta_description: string
}

const initial: FormData = {
  title: '', slug: '', excerpt: '', content: '', featured_image: null, category: '', category_id: null, status: 'draft',
  meta_title: '', meta_description: ''
}

export default function PostFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = !!id

  const [form, setForm] = useState<FormData>(initial)
  const [categories, setCategories] = useState<PostCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('post_categories').select('*').order('sort_order').then(({ data }) => {
      const cats = data || []
      setCategories(cats)
      if (!isEdit && cats.length > 0 && !form.category) {
        setForm(prev => ({ ...prev, category: cats[0].slug, category_id: cats[0].id }))
      }
    })
    if (isEdit) {
      setLoading(true)
      supabase.from('posts').select('*').eq('id', id).single().then(({ data, error }) => {
        if (error || !data) { navigate('/posts'); return }
        setForm({
          title: data.title, slug: data.slug, excerpt: data.excerpt || '', content: data.content || '',
          featured_image: data.featured_image, category: data.category, category_id: data.category_id || null, status: data.status,
          meta_title: data.meta_title || '', meta_description: data.meta_description || ''
        })
        setLoading(false)
      })
    }
  }, [id, isEdit, navigate])

  const handleChange = (field: keyof FormData, value: string | null) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && !isEdit) next.slug = generateSlug(value as string)
      if (field === 'category_id') {
        const cat = categories.find(c => c.id === value)
        if (cat) next.category = cat.slug
      }
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Vui lòng nhập tiêu đề'); return }
    setError('')
    setSaving(true)

    const payload = {
      title: form.title, slug: form.slug || generateSlug(form.title), excerpt: form.excerpt || null,
      content: form.content || null, featured_image: form.featured_image,
      category: form.category, category_id: form.category_id, status: form.status,
      meta_title: form.meta_title || null, meta_description: form.meta_description || null,
      ...(form.status === 'published' ? { published_at: new Date().toISOString() } : {}),
      ...(!isEdit ? { author_id: user?.id } : {}),
    }

    const { data: result, error: dbError } = isEdit
      ? await supabase.from('posts').update(payload).eq('id', id).select('id').single()
      : await supabase.from('posts').insert(payload).select('id').single()

    if (dbError) { setError(dbError.message); setSaving(false); return }

    // Log activity
    logActivity(isEdit ? 'update' : 'create', 'post', form.title, result?.id || id)

    navigate('/posts')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate('/posts')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Quay lại
      </button>
      <h2 className="text-xl font-bold text-gray-800 mb-6">{isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tiêu đề *</label>
                <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Tiêu đề bài viết" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tóm tắt</label>
                <textarea value={form.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)} rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Đoạn mô tả ngắn về bài viết..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung</label>
                <RichTextEditor content={form.content} onChange={(html) => handleChange('content', html)} storageBucket="posts" placeholder="Bắt đầu viết bài..." />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
                <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value="draft">Nháp</option>
                  <option value="published">Xuất bản</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục</label>
                <select value={form.category_id || ''} onChange={(e) => handleChange('category_id', e.target.value || null)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value="">— Chọn danh mục —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            {/* SEO Fields */}
            <SeoFields
              metaTitle={form.meta_title}
              metaDescription={form.meta_description}
              pageTitle={form.title}
              onMetaTitleChange={(v) => handleChange('meta_title', v)}
              onMetaDescriptionChange={(v) => handleChange('meta_description', v)}
            />

            <ImageUploader value={form.featured_image} onChange={(url) => handleChange('featured_image', url)} bucket="posts" label="Ảnh đại diện" />
            <button type="submit" disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              <Save size={16} /> {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Đăng bài'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
