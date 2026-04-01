import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Eye, Layers, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { generateSlug } from '@/lib/utils'
import { logActivity } from '@/lib/activityLog'
import ImageUploader from '@/components/shared/ImageUploader'
import RichTextEditor from '@/components/shared/RichTextEditor'
import SeoFields from '@/components/shared/SeoFields'
import type { Page } from '@/types/database'

interface FormData {
  title: string
  slug: string
  content: string
  meta_title: string
  meta_description: string
  featured_image: string | null
  parent_id: string | null
  status: 'draft' | 'published'
  sort_order: number
  template: string
}

const initial: FormData = {
  title: '', slug: '', content: '', meta_title: '', meta_description: '', featured_image: null,
  parent_id: null, status: 'published', sort_order: 0, template: 'default'
}

const templates = [
  { value: 'default', label: 'Mặc định' },
  { value: 'full-width', label: 'Toàn màn hình' },
  { value: 'sidebar', label: 'Có sidebar' },
  { value: 'landing', label: 'Landing Page' },
]

export default function PageFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = !!id

  const [form, setForm] = useState<FormData>(initial)
  const [allPages, setAllPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch all pages for parent selector
    supabase.from('pages').select('id, title, parent_id').order('sort_order').then(({ data }) => {
      setAllPages((data as Page[]) || [])
    })

    if (isEdit) {
      setLoading(true)
      supabase.from('pages').select('*').eq('id', id).single().then(({ data, error }) => {
        if (error || !data) { navigate('/pages'); return }
        setForm({
          title: data.title,
          slug: data.slug,
          content: data.content || '',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          featured_image: data.featured_image,
          parent_id: data.parent_id,
          status: data.status || 'published',
          sort_order: data.sort_order || 0,
          template: data.template || 'default',
        })
        setLoading(false)
      })
    }
  }, [id, isEdit, navigate])

  const handleChange = (field: keyof FormData, value: string | number | null) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && !isEdit) next.slug = generateSlug(value as string)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Vui lòng nhập tên trang'); return }
    setError('')
    setSaving(true)

    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      content: form.content || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      featured_image: form.featured_image,
      parent_id: form.parent_id || null,
      status: form.status,
      sort_order: form.sort_order,
      template: form.template,
      ...(!isEdit ? { author_id: user?.id } : {}),
    }

    const { data: result, error: dbError } = isEdit
      ? await supabase.from('pages').update(payload).eq('id', id).select('id').single()
      : await supabase.from('pages').insert(payload).select('id').single()

    if (dbError) { setError(dbError.message); setSaving(false); return }

    // Log activity
    logActivity(isEdit ? 'update' : 'create', 'page', form.title, result?.id || id)

    navigate('/pages')
  }

  // Filter available parents (can't be self or own children)
  const availableParents = allPages.filter(p => p.id !== id)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )

  return (
    <div className="max-w-5xl">
      <button onClick={() => navigate('/pages')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>
      <h2 className="text-xl font-bold text-gray-800 mb-6">{isEdit ? `Chỉnh sửa — ${form.title}` : 'Tạo trang mới'}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên trang *</label>
                <input
                  type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="VD: Giới thiệu công ty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug (URL)</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">/</span>
                  <input
                    type="text" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="gioi-thieu-cong-ty"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung</label>
                <RichTextEditor content={form.content} onChange={(html) => handleChange('content', html)} storageBucket="pages" placeholder="Viết nội dung trang..." />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Publish Settings */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Eye size={15} className="text-primary" /> Xuất bản
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
                <select value={form.status} onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value="published">Xuất bản</option>
                  <option value="draft">Nháp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Thứ tự sắp xếp</label>
                <input type="number" value={form.sort_order} onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
            </div>

            {/* Hierarchy */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Layers size={15} className="text-blue-500" /> Phân cấp
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Trang cha</label>
                <select value={form.parent_id || ''} onChange={(e) => handleChange('parent_id', e.target.value || null)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value="">— Trang gốc (không có cha) —</option>
                  {availableParents.map(p => (
                    <option key={p.id} value={p.id}>{p.parent_id ? '　↳ ' : ''}{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Template</label>
                <select value={form.template} onChange={(e) => handleChange('template', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  {templates.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
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

            {/* Featured Image */}
            <ImageUploader value={form.featured_image} onChange={(url) => handleChange('featured_image', url)} bucket="pages" label="Ảnh nền trang" />

            {/* Page Builder Link - only in edit mode */}
            {isEdit && (
              <button type="button" onClick={() => navigate(`/pages/${id}/builder`)}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md">
                <Sparkles size={16} /> Mở Page Builder
              </button>
            )}

            {/* Submit */}
            <button type="submit" disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              <Save size={16} /> {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật trang' : 'Tạo trang'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
