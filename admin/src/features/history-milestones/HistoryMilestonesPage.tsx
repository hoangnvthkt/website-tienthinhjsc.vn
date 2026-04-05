import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Plus, Pencil, Trash2, GripVertical, Eye, EyeOff,
  Save, X, ChevronUp, ChevronDown, Milestone, Loader2, AlertCircle, RefreshCw
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface HistoryMilestone {
  id: string
  year: number
  title: string
  description: string | null
  stat_value: string | null
  stat_label: string | null
  image_url: string | null
  color: string
  sort_order: number
  is_active: boolean
  created_at: string
}

const PRESET_COLORS = [
  '#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e',
  '#ef4444', '#06b6d4', '#10b981', '#ec4899', '#f97316'
]

const EMPTY_FORM: Omit<HistoryMilestone, 'id' | 'created_at'> = {
  year: new Date().getFullYear(),
  title: '',
  description: '',
  stat_value: '',
  stat_label: '',
  image_url: '',
  color: '#3b82f6',
  sort_order: 0,
  is_active: true,
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HistoryMilestonesPage() {
  const [milestones, setMilestones] = useState<HistoryMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // ── Fetch ──
  async function fetchMilestones() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('history_milestones')
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) setError(error.message)
    else setMilestones(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchMilestones() }, [])

  // ── Open form ──
  function openAdd() {
    setForm({ ...EMPTY_FORM, sort_order: milestones.length })
    setEditId(null)
    setShowForm(true)
    setTimeout(() => document.getElementById('h-form-year')?.focus(), 100)
  }

  function openEdit(m: HistoryMilestone) {
    setForm({
      year: m.year,
      title: m.title,
      description: m.description || '',
      stat_value: m.stat_value || '',
      stat_label: m.stat_label || '',
      image_url: m.image_url || '',
      color: m.color || '#3b82f6',
      sort_order: m.sort_order,
      is_active: m.is_active,
    })
    setEditId(m.id)
    setShowForm(true)
    setTimeout(() => document.getElementById('h-form-year')?.focus(), 100)
  }

  function closeForm() {
    setShowForm(false)
    setEditId(null)
    setForm({ ...EMPTY_FORM })
  }

  // ── Save ──
  async function handleSave() {
    if (!form.title.trim() || !form.year) {
      setError('Vui lòng nhập năm và tên mốc lịch sử')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      year: Number(form.year),
      title: form.title.trim(),
      description: form.description?.trim() || null,
      stat_value: form.stat_value?.trim() || null,
      stat_label: form.stat_label?.trim() || null,
      image_url: form.image_url?.trim() || null,
      color: form.color,
      sort_order: Number(form.sort_order),
      is_active: form.is_active,
    }

    let err
    if (editId) {
      const res = await supabase.from('history_milestones').update(payload).eq('id', editId)
      err = res.error
    } else {
      const res = await supabase.from('history_milestones').insert(payload)
      err = res.error
    }

    if (err) { setError(err.message); setSaving(false); return }
    setSaving(false)
    closeForm()
    fetchMilestones()
  }

  // ── Delete ──
  async function handleDelete(id: string) {
    const { error } = await supabase.from('history_milestones').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setDeleteConfirm(null)
    fetchMilestones()
  }

  // ── Toggle active ──
  async function toggleActive(m: HistoryMilestone) {
    await supabase.from('history_milestones').update({ is_active: !m.is_active }).eq('id', m.id)
    fetchMilestones()
  }

  // ── Move order ──
  async function moveOrder(m: HistoryMilestone, dir: 'up' | 'down') {
    const sorted = [...milestones].sort((a, b) => a.sort_order - b.sort_order)
    const idx = sorted.findIndex(x => x.id === m.id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const a = sorted[idx]
    const b = sorted[swapIdx]

    await Promise.all([
      supabase.from('history_milestones').update({ sort_order: b.sort_order }).eq('id', a.id),
      supabase.from('history_milestones').update({ sort_order: a.sort_order }).eq('id', b.id),
    ])
    fetchMilestones()
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-lg">
            <Milestone className="text-violet-400" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Lịch Sử 3D</h1>
            <p className="text-sm text-gray-400">Quản lý các mốc lịch sử trong section xoắn ốc 3D trên homepage</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchMilestones}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            Thêm mốc mới
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Info banner */}
      <div className="flex items-start gap-3 p-3 mb-5 bg-violet-500/5 border border-violet-500/15 rounded-lg text-violet-300 text-xs">
        <Milestone size={14} className="shrink-0 mt-0.5" />
        <span>Dữ liệu tại đây sẽ hiển thị trực tiếp trong section <strong>"LỊCH SỬ 3D"</strong> trên homepage. Thay đổi sẽ có hiệu lực ngay lập tức khi khách hàng tải lại trang.</span>
      </div>

      {/* ── ADD/EDIT FORM ── */}
      {showForm && (
        <div className="mb-6 bg-[#141824] border border-white/8 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/8 bg-white/2">
            <h2 className="text-sm font-semibold text-white">
              {editId ? '✏️ Chỉnh sửa mốc lịch sử' : '➕ Thêm mốc mới'}
            </h2>
            <button onClick={closeForm} className="text-gray-500 hover:text-white transition-colors"><X size={16} /></button>
          </div>

          <div className="p-5 grid grid-cols-2 gap-4">
            {/* Year */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Năm <span className="text-red-400">*</span></label>
              <input
                id="h-form-year"
                type="number"
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) || 2000 }))}
                min={1990} max={2100}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="2008"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Tên mốc <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Ví dụ: Thành lập công ty"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Mô tả</label>
              <textarea
                value={form.description || ''}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
                placeholder="Mô tả ngắn về mốc lịch sử này..."
              />
            </div>

            {/* Stat value */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Số liệu nổi bật</label>
              <input
                type="text"
                value={form.stat_value || ''}
                onChange={e => setForm(f => ({ ...f, stat_value: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Ví dụ: 50+, 2,000, 100%"
              />
            </div>

            {/* Stat label */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Nhãn số liệu</label>
              <input
                type="text"
                value={form.stat_label || ''}
                onChange={e => setForm(f => ({ ...f, stat_label: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Ví dụ: Dự án hoàn thành"
              />
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Màu accent</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-[#141824] ring-white scale-110' : 'opacity-70 hover:opacity-100 hover:scale-110'}`}
                    style={{ background: c }}
                    title={c}
                  />
                ))}
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent"
                  title="Màu tùy chỉnh"
                />
                <span className="text-xs text-gray-500 font-mono">{form.color}</span>
              </div>
            </div>

            {/* Sort order + Active */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Thứ tự</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  min={0}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div className="pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-5' : ''}`} />
                  </div>
                  <span className="text-xs text-gray-400">{form.is_active ? 'Hiển thị' : 'Ẩn'}</span>
                </label>
              </div>
            </div>

            {/* Image URL */}
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">URL ảnh (tùy chọn)</label>
              <input
                type="url"
                value={form.image_url || ''}
                onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors font-mono"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Form actions */}
          <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-white/8 bg-white/2">
            <button
              onClick={closeForm}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      )}

      {/* ── MILESTONE LIST ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 size={24} className="animate-spin mr-3" />
          Đang tải...
        </div>
      ) : milestones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Milestone size={40} className="mb-4 opacity-30" />
          <p className="text-sm">Chưa có mốc lịch sử nào</p>
          <button onClick={openAdd} className="mt-3 text-violet-400 text-sm hover:underline">+ Thêm mốc đầu tiên</button>
        </div>
      ) : (
        <div className="space-y-2">
          {milestones.map((m, idx) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                m.is_active
                  ? 'bg-[#141824] border-white/8 hover:border-white/15'
                  : 'bg-[#0f1219] border-white/4 opacity-50 hover:opacity-70'
              }`}
            >
              {/* Drag handle */}
              <GripVertical size={16} className="text-gray-600 shrink-0 cursor-grab" />

              {/* Color dot */}
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: m.color, outline: `2px solid ${m.color}`, outlineOffset: '2px' }}
              />

              {/* Year badge */}
              <div
                className="text-xs font-mono font-bold px-2 py-0.5 rounded shrink-0"
                style={{ background: m.color + '20', color: m.color }}
              >
                {m.year}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white truncate">{m.title}</span>
                  {!m.is_active && <span className="text-xs text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">Ẩn</span>}
                </div>
                {m.description && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{m.description}</p>
                )}
              </div>

              {/* Stat */}
              {m.stat_value && (
                <div className="text-right shrink-0 hidden sm:block">
                  <div className="text-sm font-bold" style={{ color: m.color }}>{m.stat_value}</div>
                  <div className="text-xs text-gray-500">{m.stat_label}</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Move up/down */}
                <button
                  onClick={() => moveOrder(m, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 text-gray-500 hover:text-white disabled:opacity-20 transition-colors rounded"
                  title="Di lên"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => moveOrder(m, 'down')}
                  disabled={idx === milestones.length - 1}
                  className="p-1.5 text-gray-500 hover:text-white disabled:opacity-20 transition-colors rounded"
                  title="Di xuống"
                >
                  <ChevronDown size={14} />
                </button>

                {/* Toggle show/hide */}
                <button
                  onClick={() => toggleActive(m)}
                  className={`p-1.5 transition-colors rounded ${m.is_active ? 'text-green-400 hover:text-gray-400' : 'text-gray-600 hover:text-green-400'}`}
                  title={m.is_active ? 'Ẩn' : 'Hiển thị'}
                >
                  {m.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEdit(m)}
                  className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors rounded"
                  title="Chỉnh sửa"
                >
                  <Pencil size={14} />
                </button>

                {/* Delete */}
                {deleteConfirm === m.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 text-gray-400 rounded transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(m.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded"
                    title="Xóa"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats footer */}
      {milestones.length > 0 && (
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5 text-xs text-gray-500">
          <span>{milestones.filter(m => m.is_active).length} mốc đang hiển thị</span>
          <span>{milestones.filter(m => !m.is_active).length} mốc đang ẩn</span>
          <span className="ml-auto">Tổng: {milestones.length} mốc</span>
        </div>
      )}
    </div>
  )
}
