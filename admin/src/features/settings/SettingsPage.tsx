import { useState, useEffect, useRef } from 'react'
import { Save, Globe, Phone, Mail, MapPin, Link2, Loader2, CheckCircle, Music, Volume2, Upload, Play, Pause, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────
interface Setting {
  key: string
  value: string | null
  type: string
  label: string | null
}
interface MediaItem { id: string; file_url: string; file_name: string }

// ── Static config ──────────────────────────────────────────────────────────
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

// ── Audio Media Picker Modal ───────────────────────────────────────────────
function MediaPickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (url: string, name: string) => void
  onClose: () => void
}) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await supabase
          .from('media')
          .select('id, file_url, file_name')
          .or(
            'file_type.ilike.%audio%,file_name.ilike.%.mp3,file_name.ilike.%.ogg,file_name.ilike.%.wav,file_name.ilike.%.m4a,file_name.ilike.%.aac'
          )
          .order('created_at', { ascending: false })
        setItems((data as MediaItem[]) || [])
      } catch {
        /* silent */
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = items.filter(
    (i) =>
      i.file_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.file_url?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3'
      const path = `uploads/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from('media').upload(path, file, { contentType: file.type })
      if (upErr) throw upErr
      const { data: pub } = supabase.storage.from('media').getPublicUrl(path)
      const fileUrl = pub.publicUrl
      const { error: insertErr } = await supabase.from('media').insert({
        file_name: file.name,
        file_url: fileUrl,
        file_type: file.type || 'audio/mpeg',
        file_size: file.size,
      })
      if (insertErr) throw insertErr
      onSelect(fileUrl, file.name)
    } catch (err: unknown) {
      console.error('Upload error:', err)
      setUploadError(err instanceof Error ? err.message : 'Upload thất bại. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Music size={18} className="text-violet-400" />
            <h3 className="font-semibold text-white">Chọn file âm thanh</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={13} />}
              {uploading ? 'Đang upload...' : 'Upload file'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.ogg,.wav,.m4a,.aac"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        {/* Upload error */}
        {uploadError && (
          <div className="mx-5 mt-3 px-3 py-2 bg-red-900/30 border border-red-700/40 rounded-lg text-xs text-red-300">
            ⚠️ {uploadError}
          </div>
        )}

        {/* Search */}
        <div className="px-5 py-3 border-b border-white/10">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm file âm thanh..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        {/* List */}
        <div className="p-4 max-h-72 overflow-y-auto space-y-1" style={{ scrollbarWidth: 'thin' }}>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-violet-400" size={24} />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">
              {items.length === 0
                ? 'Chưa có file âm thanh. Hãy upload!'
                : 'Không tìm thấy kết quả.'}
            </p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.file_url, item.file_name)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-violet-900/30 border border-violet-700/30 flex items-center justify-center flex-shrink-0">
                  <Music size={14} className="text-violet-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white truncate">{item.file_name}</p>
                  <p className="text-xs text-gray-500 truncate">{item.file_url}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ── Mini audio preview ─────────────────────────────────────────────────────
function AudioPreview({ url, label }: { url: string; label: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  function toggle() {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.pause()
      setPlaying(false)
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  useEffect(() => {
    return () => { audioRef.current?.pause() }
  }, [])

  useEffect(() => {
    setPlaying(false)
    audioRef.current?.pause()
  }, [url])

  return (
    <div className="flex items-center gap-3 mt-2 p-3 bg-violet-950/30 border border-violet-700/20 rounded-xl">
      <audio ref={audioRef} src={url} loop />
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 flex items-center justify-center transition-colors"
      >
        {playing ? (
          <Pause size={14} className="text-violet-300" />
        ) : (
          <Play size={14} className="text-violet-300" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white/80 truncate">{label || 'Nhạc nền'}</p>
        <p className="text-xs text-gray-500 truncate">{url}</p>
      </div>
      {playing && (
        <div className="flex items-end gap-[2px] h-4">
          {[0, 0.15, 0.3, 0.45].map((d) => (
            <span
              key={d}
              className="w-[3px] rounded-full bg-violet-400 animate-pulse"
              style={{ height: '100%', animationDelay: `${d}s` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Settings Page ─────────────────────────────────────────────────────
export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await supabase.from('site_settings').select('*')
        const map: Record<string, string> = {}
        ;(data as Setting[] || []).forEach((s) => { map[s.key] = s.value || '' })
        setSettings(map)
      } catch (err) {
        console.error('Fetch settings error:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const upsertKey = async (key: string, value: string, label: string, type = 'text') => {
    const { data: existing } = await supabase
      .from('site_settings')
      .select('key')
      .eq('key', key)
      .single()

    if (existing) {
      await supabase.from('site_settings').update({ value: value || null }).eq('key', key)
    } else {
      await supabase
        .from('site_settings')
        .insert({ key, value: value || null, type: type as 'text' | 'number' | 'json' | 'image' | 'html', label })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      // Standard settings
      const allKeys = SETTING_GROUPS.flatMap((g) => g.keys)
      for (const { key, label, type } of allKeys) {
        await upsertKey(key, settings[key] || '', label || key, type)
      }

      // Music settings
      await upsertKey('bg_music_url', settings.bg_music_url || '', 'URL nhạc nền homepage')
      await upsertKey('bg_music_enabled', settings.bg_music_enabled || 'false', 'Bật nhạc nền homepage')
      await upsertKey('bg_music_volume', settings.bg_music_volume || '0.3', 'Âm lượng nhạc nền (0-1)')
      await upsertKey('bg_music_label', settings.bg_music_label || '', 'Tên bài nhạc nền')

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

  const musicEnabled = settings.bg_music_enabled === 'true'
  const musicVol = parseFloat(settings.bg_music_volume || '0.3')

  return (
    <div className="max-w-3xl">
      {showMediaPicker && (
        <MediaPickerModal
          onSelect={(url, name) => {
            handleChange('bg_music_url', url)
            if (!settings.bg_music_label) {
              handleChange('bg_music_label', name.replace(/\.[^.]+$/, ''))
            }
            setShowMediaPicker(false)
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Cài đặt Website</h2>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý thông tin hiển thị trên website</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <CheckCircle size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu thay đổi'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Standard setting groups */}
        {SETTING_GROUPS.map((group) => {
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
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={`Nhập ${label?.toLowerCase()}...`}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* ── Nhạc nền ── */}
        <div className="bg-gray-900 rounded-xl border border-violet-800/30 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-violet-950/40 border-b border-violet-800/20">
            <div className="flex items-center gap-3">
              <Music size={18} className="text-violet-400" />
              <h3 className="font-semibold text-white text-sm">Nhạc nền Homepage</h3>
            </div>
            {/* Enable toggle */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleChange('bg_music_enabled', musicEnabled ? 'false' : 'true')}>
              <div
                className="relative w-10 h-5 rounded-full transition-colors"
                style={{ background: musicEnabled ? '#7c3aed' : '#4b5563' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  style={{ transform: musicEnabled ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </div>
              <span className="text-xs text-gray-400">{musicEnabled ? 'Đang bật' : 'Đang tắt'}</span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* File URL + picker button */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">File nhạc</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.bg_music_url || ''}
                  onChange={(e) => handleChange('bg_music_url', e.target.value)}
                  placeholder="Paste URL hoặc chọn từ thư viện..."
                  className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-colors"
                />
                <button
                  onClick={() => setShowMediaPicker(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-700 hover:bg-violet-600 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
                >
                  <Music size={14} />
                  Chọn file
                </button>
              </div>

              {/* Audio preview */}
              {settings.bg_music_url && (
                <AudioPreview
                  url={settings.bg_music_url}
                  label={settings.bg_music_label || 'Nhạc nền'}
                />
              )}
            </div>

            {/* Track label */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Tên bài nhạc{' '}
                <span className="text-gray-500 font-normal">(hiển thị trong player)</span>
              </label>
              <input
                type="text"
                value={settings.bg_music_label || ''}
                onChange={(e) => handleChange('bg_music_label', e.target.value)}
                placeholder="Ví dụ: Nhạc nền Tiến Thịnh..."
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Volume */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Volume2 size={14} className="text-violet-400" />
                <label className="text-sm font-medium text-gray-300">
                  Âm lượng mặc định:{' '}
                  <span className="text-violet-400 font-bold">{Math.round(musicVol * 100)}%</span>
                </label>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={musicVol}
                onChange={(e) => handleChange('bg_music_volume', e.target.value)}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Info note */}
            <p className="text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2.5 border border-white/5">
              💡 Nhạc sẽ tự phát khi trang tải (nếu trình duyệt cho phép). Người dùng có thể
              điều chỉnh hoặc tắt bằng nút nhạc góc dưới-trái màn hình.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 mt-6 bg-white/80 backdrop-blur-sm border-t border-gray-200 -mx-6 px-6 py-3 flex items-center justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  )
}
