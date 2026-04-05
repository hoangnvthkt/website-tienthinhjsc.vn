import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { generateSlug } from '@/lib/utils'
import { logActivity } from '@/lib/activityLog'
import ImageUploader from '@/components/shared/ImageUploader'
import SeoFields from '@/components/shared/SeoFields'
import type { ProjectCategory } from '@/types/database'

// Display page options matching the website navigation
const DISPLAY_PAGE_OPTIONS = [
  { value: 'proj-done', label: 'Dự án đã triển khai', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'proj-ongoing', label: 'Dự án đang triển khai', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'exhibitions', label: 'Dự án tiêu biểu', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'proj-country', label: 'Theo quốc gia', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'proj-field', label: 'Theo lĩnh vực', color: 'bg-rose-100 text-rose-700 border-rose-200' },
]

const COUNTRY_OPTIONS = [
  'Việt Nam', 'Trung Quốc', 'Đài Loan', 'Hàn Quốc', 'Mỹ', 'Anh', 'Pháp', 'Đức'
]

interface FormData {
  title: string
  slug: string
  subtitle: string
  category: string
  category_id: string
  year: string
  description: string
  specs: string
  featured_image: string | null
  status: 'draft' | 'published'
  sort_order: number
  display_pages: string[]
  country: string
  meta_title: string
  meta_description: string
}

const initial: FormData = {
  title: '', slug: '', subtitle: '', category: '', category_id: '', year: new Date().getFullYear().toString(),
  description: '', specs: '', featured_image: null, status: 'draft', sort_order: 0,
  display_pages: ['proj-done'], country: '',
  meta_title: '', meta_description: ''
}

export default function ProjectFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = !!id

  const [form, setForm] = useState<FormData>(initial)
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('project_categories').select('*').order('sort_order').then(({ data }) => setCategories(data || []))
    if (isEdit) {
      setLoading(true)
      supabase.from('projects').select('*').eq('id', id).single().then(({ data, error }) => {
        if (error || !data) { navigate('/projects'); return }
        setForm({
          title: data.title, slug: data.slug, subtitle: data.subtitle || '', category: data.category || '',
          category_id: data.category_id || '', year: data.year || '', description: data.description || '',
          specs: data.specs || '', featured_image: data.featured_image, status: (data.status as FormData['status']) || 'draft',
          sort_order: data.sort_order,
          display_pages: (data as Record<string, unknown>).display_pages as string[] || ['proj-done'],
          country: (data as Record<string, unknown>).country as string || '',
          meta_title: data.meta_title || '', meta_description: data.meta_description || ''
        })
        setLoading(false)
      })
    }
  }, [id, isEdit, navigate])

  const handleChange = (field: keyof FormData, value: string | number | string[] | null) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && !isEdit) next.slug = generateSlug(value as string)
      if (field === 'category_id') {
        const cat = categories.find(c => c.id === value)
        if (cat) next.category = cat.name
      }
      return next
    })
  }

  const toggleDisplayPage = (page: string) => {
    setForm(prev => {
      const currentPages = prev.display_pages || []
      const pages = currentPages.includes(page)
        ? currentPages.filter(p => p !== page)
        : [...currentPages, page]
      // Ensure at least one page is selected
      if (pages.length === 0) return prev
      return { ...prev, display_pages: pages }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Vui lòng nhập tên dự án'); return }
    if (!form.display_pages?.length) { setError('Vui lòng chọn ít nhất 1 trang hiển thị'); return }
    if (form.display_pages.includes('proj-country') && !form.country) { setError('Vui lòng chọn quốc gia khi trang "Theo quốc gia" được chọn'); return }
    setError('')
    setSaving(true)

    const payload = {
      title: form.title, slug: form.slug || generateSlug(form.title), subtitle: form.subtitle || null,
      category: form.category || null, category_id: form.category_id || null, year: form.year || null,
      description: form.description || null, specs: form.specs || null, featured_image: form.featured_image,
      status: form.status, sort_order: form.sort_order,
      display_pages: form.display_pages,
      country: form.country || null,
      meta_title: form.meta_title || null, meta_description: form.meta_description || null,
      ...(form.status === 'published' ? { published_at: new Date().toISOString() } : {}),
      ...(!isEdit ? { author_id: user?.id } : {}),
    }

    const { data: result, error: dbError } = isEdit
      ? await supabase.from('projects').update(payload).eq('id', id).select('id').single()
      : await supabase.from('projects').insert(payload).select('id').single()

    if (dbError) { setError(dbError.message); setSaving(false); return }

    // Log activity
    logActivity(isEdit ? 'update' : 'create', 'project', form.title, result?.id || id)

    navigate('/projects')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
    </div>
  )

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate('/projects')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>

      <h2 className="text-xl font-bold text-gray-800 mb-6">{isEdit ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên dự án *</label>
                <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="VD: Nhà Xưởng Samsung" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả phụ</label>
                <input type="text" value={form.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="VD: Khu công nghiệp Bắc Ninh" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả chi tiết</label>
                <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={5}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Mô tả chi tiết về dự án..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Thông số kỹ thuật</label>
                <input type="text" value={form.specs} onChange={(e) => handleChange('specs', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="VD: Diện tích: 25.000m² | Khẩu độ: 36m" />
              </div>
            </div>

            {/* Display Pages Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trang hiển thị *</label>
                <p className="text-xs text-gray-400 mb-3">Chọn các trang mà dự án sẽ xuất hiện trên website. Có thể chọn nhiều trang.</p>
                <div className="flex flex-wrap gap-2">
                  {DISPLAY_PAGE_OPTIONS.map(opt => {
                    const isActive = (form.display_pages || []).includes(opt.value)
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleDisplayPage(opt.value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                          isActive
                            ? opt.color + ' ring-2 ring-offset-1 ring-current/20 shadow-sm'
                            : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-600'
                        }`}
                      >
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                        {opt.label}
                        {isActive && <X size={12} className="ml-0.5 opacity-60" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Country field - only shown when proj-country is selected */}
              {(form.display_pages || []).includes('proj-country') && (
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Quốc gia *</label>
                  <select value={form.country} onChange={(e) => handleChange('country', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                    <option value="">— Chọn quốc gia —</option>
                    {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
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
                <select value={form.category_id} onChange={(e) => handleChange('category_id', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option value="">— Chọn danh mục —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Năm thực hiện</label>
                <input type="text" value={form.year} onChange={(e) => handleChange('year', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="2024" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Thứ tự sắp xếp</label>
                <input type="number" value={form.sort_order} onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
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

            <ImageUploader value={form.featured_image} onChange={(url) => handleChange('featured_image', url)} bucket="projects" label="Ảnh đại diện" />

            <button type="submit" disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              <Save size={16} />
              {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật dự án' : 'Tạo dự án'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
