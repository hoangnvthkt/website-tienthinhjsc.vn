import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ImageUploader from '@/components/shared/ImageUploader'
import RichTextEditor from '@/components/shared/RichTextEditor'

export default function PageFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [featuredImage, setFeaturedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('pages').select('*').eq('id', id!).single().then(({ data, error }) => {
      if (error || !data) { navigate('/pages'); return }
      setTitle(data.title)
      setContent(data.content || '')
      setMetaDescription(data.meta_description || '')
      setFeaturedImage(data.featured_image)
      setLoading(false)
    })
  }, [id, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error: dbError } = await supabase.from('pages').update({
      content: content || null, meta_description: metaDescription || null, featured_image: featuredImage
    }).eq('id', id!)
    if (dbError) { setError(dbError.message); setSaving(false); return }
    navigate('/pages')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate('/pages')} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Quay lại
      </button>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Chỉnh sửa — {title}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tiêu đề</label>
                <input type="text" value={title} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung</label>
                <RichTextEditor content={content} onChange={setContent} storageBucket="pages" placeholder="Viết nội dung trang..." />
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả SEO</label>
              <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" placeholder="Meta description cho SEO..." />
            </div>
            <ImageUploader value={featuredImage} onChange={setFeaturedImage} bucket="pages" label="Ảnh nền trang" />
            <button type="submit" disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              <Save size={16} /> {saving ? 'Đang lưu...' : 'Cập nhật trang'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
