import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, Save, X, GripVertical, FolderKanban, FileText, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { generateSlug } from '@/lib/utils'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { ProjectCategory, PostCategory } from '@/types/database'

type CategoryType = 'project' | 'post'

interface EditingCategory {
  id: string | null // null = new
  name: string
  slug: string
  sort_order: number
}

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<CategoryType>('project')
  const [projectCats, setProjectCats] = useState<ProjectCategory[]>([])
  const [postCats, setPostCats] = useState<PostCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<EditingCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: CategoryType } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const [projRes, postRes] = await Promise.all([
        supabase.from('project_categories').select('*').order('sort_order'),
        supabase.from('post_categories').select('*').order('sort_order'),
      ])
      setProjectCats(projRes.data || [])
      setPostCats(postRes.data || [])
    } catch (err) {
      console.error('Fetch categories error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const startAdd = () => {
    const cats = activeTab === 'project' ? projectCats : postCats
    const maxOrder = cats.reduce((m, c) => Math.max(m, c.sort_order), 0)
    setEditing({ id: null, name: '', slug: '', sort_order: maxOrder + 1 })
    setError('')
    setTimeout(() => nameInputRef.current?.focus(), 50)
  }

  const startEdit = (cat: ProjectCategory | PostCategory) => {
    setEditing({ id: cat.id, name: cat.name, slug: cat.slug, sort_order: cat.sort_order })
    setError('')
    setTimeout(() => nameInputRef.current?.focus(), 50)
  }

  const handleNameChange = (name: string) => {
    setEditing(prev => prev ? {
      ...prev,
      name,
      slug: prev.id ? prev.slug : generateSlug(name), // auto-slug only for new
    } : null)
  }

  const handleSave = async () => {
    if (!editing || !editing.name.trim()) { setError('Vui lòng nhập tên danh mục'); return }
    setSaving(true)
    setError('')

    const table = activeTab === 'project' ? 'project_categories' : 'post_categories'
    const payload = {
      name: editing.name.trim(),
      slug: editing.slug || generateSlug(editing.name),
      sort_order: editing.sort_order,
    }

    const { error: dbError } = editing.id
      ? await supabase.from(table).update(payload).eq('id', editing.id)
      : await supabase.from(table).insert(payload)

    if (dbError) {
      setError(dbError.message.includes('unique') ? 'Tên hoặc slug đã tồn tại' : dbError.message)
      setSaving(false)
      return
    }

    setEditing(null)
    setSaving(false)
    fetchCategories()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const table = deleteTarget.type === 'project' ? 'project_categories' : 'post_categories'
    await supabase.from(table).delete().eq('id', deleteTarget.id)
    setDeleteTarget(null)
    fetchCategories()
  }

  const currentCats = activeTab === 'project' ? projectCats : postCats

  const tabs = [
    { key: 'project' as CategoryType, label: 'Dự án', icon: FolderKanban, count: projectCats.length },
    { key: 'post' as CategoryType, label: 'Bài viết', icon: FileText, count: postCats.length },
  ]

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quản lý danh mục</h2>
          <p className="text-sm text-gray-500 mt-0.5">Danh mục dự án và bài viết</p>
        </div>
        <button
          onClick={startAdd}
          disabled={!!editing}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-5">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setEditing(null); setError('') }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Tên danh mục</div>
          <div className="col-span-4">Slug</div>
          <div className="col-span-1">Thứ tự</div>
          <div className="col-span-2 text-right">Thao tác</div>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <svg className="animate-spin h-6 w-6 text-primary" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {currentCats.map((cat, idx) => (
              editing?.id === cat.id ? (
                /* Inline edit row */
                <div key={cat.id} className="grid grid-cols-12 gap-2 px-4 py-2 items-center bg-blue-50/50">
                  <div className="col-span-1 text-sm text-gray-400">{idx + 1}</div>
                  <div className="col-span-4">
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={editing.name}
                      onChange={e => handleNameChange(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSave()}
                      className="w-full px-2.5 py-1.5 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="Tên danh mục"
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={editing.slug}
                      onChange={e => setEditing(prev => prev ? { ...prev, slug: e.target.value } : null)}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm font-mono text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="slug"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={editing.sort_order}
                      onChange={e => setEditing(prev => prev ? { ...prev, sort_order: parseInt(e.target.value) || 0 } : null)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <button onClick={handleSave} disabled={saving}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50">
                      <Check size={16} />
                    </button>
                    <button onClick={() => { setEditing(null); setError('') }}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal row */
                <div key={cat.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="col-span-1 flex items-center gap-1">
                    <GripVertical size={12} className="text-gray-300" />
                    <span className="text-sm text-gray-400">{idx + 1}</span>
                  </div>
                  <div className="col-span-4 text-sm font-medium text-gray-800">{cat.name}</div>
                  <div className="col-span-4 text-sm font-mono text-gray-400">{cat.slug}</div>
                  <div className="col-span-1 text-sm text-gray-400 text-center">{cat.sort_order}</div>
                  <div className="col-span-2 flex items-center justify-end gap-0.5">
                    <button onClick={() => startEdit(cat)} disabled={!!editing}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-30">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget({ id: cat.id, name: cat.name, type: activeTab })}
                      disabled={!!editing}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            ))}

            {/* New row (when adding) */}
            {editing && editing.id === null && (
              <div className="grid grid-cols-12 gap-2 px-4 py-2 items-center bg-green-50/50 border-t border-green-100">
                <div className="col-span-1 text-sm text-gray-400">{currentCats.length + 1}</div>
                <div className="col-span-4">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={editing.name}
                    onChange={e => handleNameChange(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditing(null); setError('') } }}
                    className="w-full px-2.5 py-1.5 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Tên danh mục mới"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    value={editing.slug}
                    onChange={e => setEditing(prev => prev ? { ...prev, slug: e.target.value } : null)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm font-mono text-gray-500 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="auto-generated"
                  />
                </div>
                <div className="col-span-1">
                  <input
                    type="number"
                    value={editing.sort_order}
                    onChange={e => setEditing(prev => prev ? { ...prev, sort_order: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button onClick={handleSave} disabled={saving}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50">
                    <Check size={16} />
                  </button>
                  <button onClick={() => { setEditing(null); setError('') }}
                    className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {currentCats.length === 0 && !editing && (
              <div className="py-8 text-center text-gray-400 text-sm">Chưa có danh mục nào</div>
            )}
          </div>
        )}

        {/* Footer */}
        {!loading && (
          <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400">
            Tổng: {currentCats.length} danh mục {activeTab === 'project' ? 'dự án' : 'bài viết'}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa danh mục"
        message={`Bạn có chắc muốn xóa danh mục "${deleteTarget?.name}"? Các bài viết/dự án thuộc danh mục này sẽ không bị xóa.`}
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
