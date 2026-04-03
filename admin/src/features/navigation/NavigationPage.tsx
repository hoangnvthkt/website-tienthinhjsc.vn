import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Trash2, Eye, EyeOff, GripVertical, Save, ChevronDown, ChevronUp,
  X, Menu, ExternalLink, FileText, Link2, FolderTree, Pencil
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { NavigationItem, Page } from '@/types/database'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

interface NavNode extends NavigationItem {
  children: NavNode[]
}

type LocationTab = 'header' | 'footer'

interface EditForm {
  title: string
  link_type: 'custom' | 'page' | 'category'
  link_value: string
  parent_id: string | null
  target: string
  icon: string
  is_visible: boolean
}

const emptyForm: EditForm = {
  title: '', link_type: 'custom', link_value: '', parent_id: null,
  target: '_self', icon: '', is_visible: true,
}

function buildNavTree(items: NavigationItem[]): NavNode[] {
  const map: Record<string, NavNode> = {}
  const roots: NavNode[] = []
  items.forEach(item => { map[item.id] = { ...item, children: [] } })
  items.forEach(item => {
    const node = map[item.id]
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(node)
    } else {
      roots.push(node)
    }
  })
  const sortNodes = (nodes: NavNode[]) => {
    nodes.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    nodes.forEach(n => sortNodes(n.children))
  }
  sortNodes(roots)
  return roots
}

export default function NavigationPage() {
  const [items, setItems] = useState<NavigationItem[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [location, setLocation] = useState<LocationTab>('header')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [form, setForm] = useState<EditForm>(emptyForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const [navRes, pagesRes] = await Promise.all([
        supabase.from('navigation_items').select('*').eq('menu_location', location).order('sort_order'),
        supabase.from('pages').select('id, title, slug').eq('status', 'published').order('title'),
      ])
      setItems((navRes.data || []) as NavigationItem[])
      setPages((pagesRes.data || []) as Page[])
    } catch (err) {
      console.error('Fetch nav error:', err)
    } finally {
      setLoading(false)
    }
  }, [location])

  useEffect(() => { fetchItems() }, [fetchItems])

  const tree = buildNavTree(items)
  const rootItems = items.filter(i => !i.parent_id)

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Start editing
  const startEdit = (item: NavigationItem) => {
    setEditingId(item.id)
    setIsNew(false)
    setForm({
      title: item.title,
      link_type: (item.link_type as EditForm['link_type']) || 'custom',
      link_value: item.link_value || '',
      parent_id: item.parent_id,
      target: item.target || '_self',
      icon: item.icon || '',
      is_visible: item.is_visible ?? true,
    })
  }

  // Start adding new
  const startAdd = () => {
    setEditingId('__new__')
    setIsNew(true)
    setForm({ ...emptyForm })
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null)
    setIsNew(false)
    setForm(emptyForm)
  }

  // Save
  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const payload = {
      menu_location: location,
      title: form.title.trim(),
      link_type: form.link_type,
      link_value: form.link_value || null,
      parent_id: form.parent_id || null,
      target: form.target,
      icon: form.icon || null,
      is_visible: form.is_visible,
    }

    if (isNew) {
      const maxOrder = items.filter(i => i.parent_id === form.parent_id).reduce((max, i) => Math.max(max, i.sort_order ?? 0), -1)
      await supabase.from('navigation_items').insert({ ...payload, sort_order: maxOrder + 1 })
    } else if (editingId) {
      await supabase.from('navigation_items').update(payload).eq('id', editingId)
    }

    setSaving(false)
    cancelEdit()
    fetchItems()
  }

  // Delete
  const handleDelete = async () => {
    if (!deleteId) return
    await supabase.from('navigation_items').delete().eq('id', deleteId)
    setDeleteId(null)
    if (editingId === deleteId) cancelEdit()
    fetchItems()
  }

  // Toggle visibility
  const toggleVisibility = async (id: string, currentVisible: boolean | null) => {
    await supabase.from('navigation_items').update({ is_visible: !currentVisible }).eq('id', id)
    fetchItems()
  }

  // Move item up/down (within same parent group)
  const moveItem = async (item: NavigationItem, dir: -1 | 1) => {
    const siblings = items.filter(i => i.parent_id === item.parent_id).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    const idx = siblings.findIndex(s => s.id === item.id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= siblings.length) return

    const current = siblings[idx]
    const swap = siblings[swapIdx]
    await Promise.all([
      supabase.from('navigation_items').update({ sort_order: swap.sort_order }).eq('id', current.id),
      supabase.from('navigation_items').update({ sort_order: current.sort_order }).eq('id', swap.id),
    ])
    fetchItems()
  }

  // Flat list for drag-drop of root items
  const flatRoots = items.filter(i => !i.parent_id).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  const handleDragStart = (idx: number) => setDragIdx(idx)
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDropIdx(idx) }
  const handleDrop = async (idx: number) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDropIdx(null); return }
    const reordered = [...flatRoots]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(idx, 0, moved)
    // Update sort_order in DB
    await Promise.all(reordered.map((item, i) =>
      supabase.from('navigation_items').update({ sort_order: i }).eq('id', item.id)
    ))
    setDragIdx(null)
    setDropIdx(null)
    fetchItems()
  }

  // Link type display
  const getLinkDisplay = (item: NavigationItem) => {
    if (item.link_type === 'page') return `📄 ${item.link_value || '—'}`
    if (item.link_type === 'category') return `🏷️ ${item.link_value || '—'}`
    return `🔗 ${item.link_value || '#'}`
  }

  // Render tree row
  const renderRow = (node: NavNode, depth = 0) => {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedIds.has(node.id)
    const isEditing = editingId === node.id
    const siblings = items.filter(i => i.parent_id === node.parent_id).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    const siblingIdx = siblings.findIndex(s => s.id === node.id)

    return (
      <div key={node.id}>
        <div
          className={`group flex items-center gap-2 px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${
            isEditing ? 'bg-primary/5 border-l-2 border-l-primary' : ''
          } ${!node.is_visible ? 'opacity-50' : ''}`}
          style={{ paddingLeft: 12 + depth * 28 }}
          {...(depth === 0 ? {
            draggable: true,
            onDragStart: () => handleDragStart(flatRoots.findIndex(r => r.id === node.id)),
            onDragOver: (e: React.DragEvent) => handleDragOver(e, flatRoots.findIndex(r => r.id === node.id)),
            onDragEnd: () => { setDragIdx(null); setDropIdx(null) },
            onDrop: () => handleDrop(flatRoots.findIndex(r => r.id === node.id)),
          } : {})}
        >
          {/* Drag handle (root only) */}
          {depth === 0 && (
            <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0">
              <GripVertical size={14} />
            </div>
          )}
          {depth > 0 && <div className="w-3.5 shrink-0" />}

          {/* Expand/collapse */}
          {hasChildren ? (
            <button onClick={() => toggleExpand(node.id)} className="p-0.5 text-gray-400 hover:text-gray-600 shrink-0">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} className="rotate-90" />}
            </button>
          ) : (
            <div className="w-5 shrink-0" />
          )}

          {/* Title */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${depth > 0 ? 'text-gray-600' : 'text-gray-800'}`}>
              {node.icon && <span className="mr-1">{node.icon}</span>}
              {node.title}
            </p>
          </div>

          {/* Link badge */}
          <span className="hidden md:inline-block text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono truncate max-w-[140px]">
            {getLinkDisplay(node)}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => moveItem(node, -1)} disabled={siblingIdx === 0}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30">
              <ChevronUp size={13} />
            </button>
            <button onClick={() => moveItem(node, 1)} disabled={siblingIdx === siblings.length - 1}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30">
              <ChevronDown size={13} />
            </button>
            <button onClick={() => toggleVisibility(node.id, node.is_visible ?? true)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title={node.is_visible ? 'Ẩn' : 'Hiện'}>
              {node.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
            <button onClick={() => startEdit(node)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
              <Pencil size={13} />
            </button>
            <button onClick={() => setDeleteId(node.id)}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && node.children.map(child => renderRow(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Quản lý Navigation</h2>
          <p className="text-sm text-gray-500 mt-0.5">Cấu trúc menu website</p>
        </div>
        <button onClick={startAdd}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Thêm menu item
        </button>
      </div>

      {/* Location tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(['header', 'footer'] as LocationTab[]).map(loc => (
          <button key={loc} onClick={() => { setLocation(loc); cancelEdit() }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              location === loc ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {loc === 'header' ? '🔝 Header' : '📋 Footer'}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Menu Tree */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Table header */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="flex-1" style={{ paddingLeft: 38 }}>Menu item</div>
              <div className="hidden md:block w-36">Liên kết</div>
              <div className="w-32 text-right">Thao tác</div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : tree.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <Menu size={32} className="mb-2" />
                <p className="text-sm">Chưa có menu item nào cho {location}</p>
              </div>
            ) : (
              <div>{tree.map(node => renderRow(node))}</div>
            )}
          </div>

          {/* Stats */}
          {!loading && (
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><FolderTree size={12} /> {rootItems.length} nhóm</span>
              <span className="flex items-center gap-1"><FileText size={12} /> {items.length} items</span>
              <span className="flex items-center gap-1"><Eye size={12} /> {items.filter(i => i.is_visible).length} hiển thị</span>
            </div>
          )}
        </div>

        {/* Editor Panel */}
        {editingId && (
          <div className="w-[340px] shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-sm font-semibold text-gray-800">
                  {isNew ? '✨ Thêm menu item' : '✏️ Chỉnh sửa'}
                </h3>
                <button onClick={cancelEdit} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <div className="p-4 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tiêu đề *</label>
                  <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="VD: GIỚI THIỆU" />
                </div>

                {/* Link type */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Loại liên kết</label>
                  <div className="flex gap-1">
                    {[
                      { value: 'custom', label: 'URL', icon: <Link2 size={13} /> },
                      { value: 'page', label: 'Trang', icon: <FileText size={13} /> },
                      { value: 'category', label: 'Danh mục', icon: <FolderTree size={13} /> },
                    ].map(opt => (
                      <button key={opt.value}
                        onClick={() => setForm(f => ({ ...f, link_type: opt.value as EditForm['link_type'], link_value: '' }))}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          form.link_type === opt.value
                            ? 'bg-primary/10 text-primary border border-primary/30'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent'
                        }`}>
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link value */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {form.link_type === 'custom' ? 'URL / data-page' : form.link_type === 'page' ? 'Chọn trang' : 'Slug danh mục'}
                  </label>
                  {form.link_type === 'page' ? (
                    <select value={form.link_value} onChange={e => setForm(f => ({ ...f, link_value: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                      <option value="">— Chọn trang —</option>
                      {pages.map(p => (
                        <option key={p.id} value={p.slug}>{p.title}</option>
                      ))}
                      {/* Also show common data-page values */}
                      <optgroup label="Trang SPA (data-page)">
                        {['home','about-letter','about-vision','about-values','history','about-org','about-cert','about-awards',
                          'cap-hr','cap-prod','cap-construct','cap-factory','cap-safety',
                          'svc-general','svc-fdi','svc-steel','svc-design','svc-trade',
                          'proj-done','proj-ongoing','exhibitions','proj-country','proj-field',
                          'news','news-site','news-recruit','news-knowledge','contact','documents'
                        ].map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </optgroup>
                    </select>
                  ) : (
                    <input type="text" value={form.link_value} onChange={e => setForm(f => ({ ...f, link_value: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder={form.link_type === 'custom' ? 'VD: # hoặc /about' : 'VD: tin-cong-ty'} />
                  )}
                </div>

                {/* Parent */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Menu cha</label>
                  <select value={form.parent_id || ''} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                    <option value="">— Root (cấp 1) —</option>
                    {(() => {
                      const options: { id: string; label: string }[] = []
                      const renderOptions = (nodes: NavNode[], depth = 0) => {
                        nodes.forEach(node => {
                          if (node.id === editingId) return
                          const prefix = depth === 0 ? '' : '— '.repeat(depth)
                          const icon = depth === 0 ? '📂 ' : depth === 1 ? '📁 ' : '📄 '
                          options.push({ id: node.id, label: `${prefix}${icon}${node.title}` })
                          if (node.children.length > 0) {
                            renderOptions(node.children, depth + 1)
                          }
                        })
                      }
                      renderOptions(tree)
                      return options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))
                    })()}
                  </select>
                </div>

                {/* Icon + Target row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Icon (emoji)</label>
                    <input type="text" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="🏠" maxLength={4} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mở tab</label>
                    <select value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                      <option value="_self">Cùng tab</option>
                      <option value="_blank">Tab mới</option>
                    </select>
                  </div>
                </div>

                {/* Visibility toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.is_visible}
                    onChange={e => setForm(f => ({ ...f, is_visible: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30" />
                  <span className="text-sm text-gray-700">Hiển thị menu item</span>
                </label>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSave} disabled={saving || !form.title.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                    <Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button onClick={cancelEdit}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Xóa menu item"
        message="Bạn có chắc muốn xóa menu item này? Các sub-menu bên trong cũng sẽ bị xóa."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
