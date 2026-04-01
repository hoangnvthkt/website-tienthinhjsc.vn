import { useState, useEffect } from 'react'
import { Save, Globe, Phone, Mail, MapPin, Link2, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Setting {
  key: string
  value: string | null
  type: string
  label: string | null
}

const SETTING_GROUPS = [
  {
    title: 'Thông tin công ty',
    icon: Globe,
    keys: [
      { key: 'company_name', label: 'Tên công ty', type: 'text' },
      { key: 'company_slogan', label: 'Slogan', type: 'text' },
      { key: 'company_description', label: 'Mô tả ngắn', type: 'text' },
    ]
  },
  {
    title: 'Liên hệ',
    icon: Phone,
    keys: [
      { key: 'contact_phone', label: 'Số điện thoại', type: 'text', icon: Phone },
      { key: 'contact_email', label: 'Email', type: 'text', icon: Mail },
      { key: 'contact_address', label: 'Địa chỉ', type: 'text', icon: MapPin },
      { key: 'contact_hotline', label: 'Hotline', type: 'text', icon: Phone },
    ]
  },
  {
    title: 'Mạng xã hội',
    icon: Link2,
    keys: [
      { key: 'social_facebook', label: 'Facebook', type: 'text' },
      { key: 'social_youtube', label: 'YouTube', type: 'text' },
      { key: 'social_linkedin', label: 'LinkedIn', type: 'text' },
      { key: 'social_zalo', label: 'Zalo', type: 'text' },
      { key: 'social_tiktok', label: 'TikTok', type: 'text' },
    ]
  },
  {
    title: 'SEO & Meta',
    icon: Globe,
    keys: [
      { key: 'seo_title', label: 'Tiêu đề SEO', type: 'text' },
      { key: 'seo_description', label: 'Mô tả SEO', type: 'text' },
      { key: 'seo_keywords', label: 'Keywords', type: 'text' },
      { key: 'google_analytics', label: 'Google Analytics ID', type: 'text' },
    ]
  },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('site_settings').select('*')
        const map: Record<string, string> = {}
        ;(data as Setting[] || []).forEach(s => { map[s.key] = s.value || '' })
        setSettings(map)
      } catch (err) {
        console.error('Fetch settings error:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const allKeys = SETTING_GROUPS.flatMap(g => g.keys)
      for (const { key, label, type } of allKeys) {
        const value = settings[key] || ''
        // Upsert: try update first, insert if not exists
        const { data: existing } = await supabase
          .from('site_settings')
          .select('key')
          .eq('key', key)
          .single()

        if (existing) {
          await supabase.from('site_settings')
            .update({ value: value || null })
            .eq('key', key)
        } else {
          await supabase.from('site_settings')
            .insert({ key, value: value || null, type: type as 'text' | 'number' | 'json' | 'image' | 'html', label })
        }
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Có lỗi khi lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Cài đặt Website</h2>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý thông tin hiển thị trên website</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
          {saving ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu thay đổi'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>
      )}

      <div className="space-y-6">
        {SETTING_GROUPS.map(group => {
          const Icon = group.icon
          return (
            <div key={group.title} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                <Icon size={18} className="text-primary" />
                <h3 className="font-semibold text-gray-800 text-sm">{group.title}</h3>
              </div>
              <div className="p-5 space-y-4">
                {group.keys.map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <input
                      type="text"
                      value={settings[key] || ''}
                      onChange={e => handleChange(key, e.target.value)}
                      placeholder={`Nhập ${label?.toLowerCase()}...`}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sticky Save Bar */}
      <div className="sticky bottom-0 mt-6 bg-white/80 backdrop-blur-sm border-t border-gray-200 -mx-6 px-6 py-3 flex items-center justify-end">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  )
}
