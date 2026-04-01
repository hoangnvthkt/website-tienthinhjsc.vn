import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, GripVertical, Save, ChevronDown, ChevronUp, X, Layers, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SECTION_TYPES, getSectionType } from './sectionTypes'
import SectionEditor from './SectionEditor'
import SectionPreview from './SectionPreview'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

interface SectionData {
  id: string
  section_type: string
  title: string | null
  subtitle: string | null
  content: string | null
  config: Record<string, unknown>
  media_urls: string[]
  sort_order: number
  is_visible: boolean
  is_new?: boolean
}

export default function PageBuilderPage() {
  const { id: pageId } = useParams()
  const navigate = useNavigate()

  const [pageTitle, setPageTitle] = useState('')
  const [sections, setSections] = useState<SectionData[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dropIdx, setDropIdx] = useState<number | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Fetch page info + sections
  useEffect(() => {
    if (!pageId) return
    setLoading(true)
    Promise.all([
      supabase.from('pages').select('title').eq('id', pageId).single(),
      supabase.from('page_sections').select('*').eq('page_id', pageId).order('sort_order'),
    ]).then(([pageRes, secRes]) => {
      setPageTitle(pageRes.data?.title || 'Untitled')
      setSections((secRes.data || []).map(s => ({
        ...s,
        config: (typeof s.config === 'object' && s.config !== null ? s.config : {}) as Record<string, unknown>,
        media_urls: Array.isArray(s.media_urls) ? s.media_urls as string[] : [],
      })))
      setLoading(false)
    })
  }, [pageId])

  // Add a new section
  const addSection = (type: string) => {
    const sectionType = getSectionType(type)
    if (!sectionType) return
    const newSection: SectionData = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      section_type: type,
      title: null,
      subtitle: null,
      content: null,
      config: { ...sectionType.defaultConfig },
      media_urls: [],
      sort_order: sections.length,
      is_visible: true,
      is_new: true,
    }
    setSections(prev => [...prev, newSection])
    setSelectedId(newSection.id)
    setShowAddPanel(false)
    setHasChanges(true)
  }

  // Update a section field
  const updateSection = useCallback((sectionId: string, key: string, value: unknown) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s
      if (key.startsWith('config.')) {
        const configKey = key.slice(7)
        return { ...s, config: { ...s.config, [configKey]: value } }
      }
      return { ...s, [key]: value }
    }))
    setHasChanges(true)
  }, [])

  // Toggle section visibility
  const toggleVisibility = (sectionId: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, is_visible: !s.is_visible } : s
    ))
    setHasChanges(true)
  }

  // Delete section
  const handleDelete = async () => {
    if (!deleteTarget) return
    const section = sections.find(s => s.id === deleteTarget)
    if (section && !section.is_new) {
      await supabase.from('page_sections').delete().eq('id', deleteTarget)
    }
    setSections(prev => prev.filter(s => s.id !== deleteTarget))
    if (selectedId === deleteTarget) setSelectedId(null)
    setDeleteTarget(null)
    setHasChanges(true)
  }

  // Move section up/down
  const moveSection = (idx: number, dir: -1 | 1) => {
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= sections.length) return
    setSections(prev => {
      const next = [...prev]
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next.map((s, i) => ({ ...s, sort_order: i }))
    })
    setHasChanges(true)
  }

  // Drag & Drop handlers
  const handleDragStart = (idx: number) => {
    setDragIdx(idx)
  }

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDropIdx(idx)
  }

  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDropIdx(null); return }
    setSections(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx, 1)
      next.splice(idx, 0, moved)
      return next.map((s, i) => ({ ...s, sort_order: i }))
    })
    setDragIdx(null)
    setDropIdx(null)
    setHasChanges(true)
  }

  // Save all sections
  const handleSave = async () => {
    if (!pageId) return
    setSaving(true)

    try {
      for (let i = 0; i < sections.length; i++) {
        const s = sections[i]
        const payload = {
          page_id: pageId,
          section_type: s.section_type,
          title: s.title,
          subtitle: s.subtitle,
          content: s.content,
          config: s.config,
          media_urls: s.media_urls,
          sort_order: i,
          is_visible: s.is_visible,
        }

        if (s.is_new) {
          const { data } = await supabase.from('page_sections').insert(payload).select('id').single()
          if (data) {
            sections[i] = { ...s, id: data.id, sort_order: i, is_new: false }
          }
        } else {
          await supabase.from('page_sections').update(payload).eq('id', s.id)
        }
      }

      setSections(prev => prev.map((s, i) => ({ ...s, sort_order: i, is_new: false })))
      setHasChanges(false)
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const selectedSection = sections.find(s => s.id === selectedId)
  const selectedType = selectedSection ? getSectionType(selectedSection.section_type) : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2.5 shrink-0 rounded-t-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/pages/${pageId}/edit`)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-primary" />
              <h2 className="text-sm font-bold text-gray-800">Page Builder</h2>
            </div>
            <p className="text-xs text-gray-400">{pageTitle} — {sections.length} section{sections.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreviewMode(!previewMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              previewMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <Eye size={14} /> {previewMode ? 'Đang xem trước' : 'Xem trước'}
          </button>
          <button onClick={handleSave} disabled={!hasChanges || saving}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
            <Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Sections List + Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4">
          {previewMode ? (
            /* Preview mode */
            <div className="max-w-4xl mx-auto space-y-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {sections.filter(s => s.is_visible).map(section => (
                <SectionPreview key={section.id} section={section} />
              ))}
              {sections.length === 0 && (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p className="text-sm">Chưa có section nào. Thêm section để xem trước.</p>
                </div>
              )}
            </div>
          ) : (
            /* Editor mode: section list */
            <div className="max-w-2xl mx-auto space-y-2">
              {sections.map((section, idx) => {
                const sType = getSectionType(section.section_type)
                const isSelected = selectedId === section.id
                const isDragTarget = dropIdx === idx && dragIdx !== idx

                return (
                  <div key={section.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={() => { setDragIdx(null); setDropIdx(null) }}
                    onDrop={() => handleDrop(idx)}
                    onClick={() => setSelectedId(section.id)}
                    className={`group relative bg-white rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected ? 'border-primary shadow-md shadow-primary/10' :
                      isDragTarget ? 'border-blue-300 border-dashed' :
                      'border-gray-200 hover:border-gray-300'
                    } ${dragIdx === idx ? 'opacity-50 scale-[0.98]' : ''} ${!section.is_visible ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      {/* Drag handle */}
                      <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0"
                        onMouseDown={(e) => e.stopPropagation()}>
                        <GripVertical size={16} />
                      </div>

                      {/* Icon + label */}
                      <span className="text-lg shrink-0">{sType?.icon || '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {section.title || sType?.label || section.section_type}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{sType?.label}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); moveSection(idx, -1) }}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30">
                          <ChevronUp size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); moveSection(idx, 1) }}
                          disabled={idx === sections.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30">
                          <ChevronDown size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); toggleVisibility(section.id) }}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          title={section.is_visible ? 'Ẩn section' : 'Hiện section'}>
                          {section.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(section.id) }}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Mini preview */}
                    {!isSelected && section.is_visible && (
                      <div className="px-3 pb-2.5 -mt-0.5">
                        <SectionPreview section={section} compact />
                      </div>
                    )}

                    {/* New badge */}
                    {section.is_new && (
                      <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">MỚI</span>
                    )}
                  </div>
                )
              })}

              {/* Add Section Button */}
              <button onClick={() => setShowAddPanel(true)}
                className="w-full border-2 border-dashed border-gray-300 hover:border-primary rounded-lg py-4 flex items-center justify-center gap-2 text-gray-400 hover:text-primary transition-colors">
                <Plus size={18} /> <span className="text-sm font-medium">Thêm section</span>
              </button>

              {sections.length === 0 && (
                <div className="text-center py-12">
                  <Layers size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Trang chưa có section nào</p>
                  <p className="text-sm text-gray-400 mt-1">Bấm "Thêm section" để bắt đầu xây dựng trang</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Section Editor Panel */}
        {selectedSection && selectedType && !previewMode && (
          <div className="w-[380px] bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
            {/* Editor header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-base">{selectedType.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{selectedType.label}</p>
                  <p className="text-[10px] text-gray-400">{selectedType.description}</p>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>

            {/* Editor body */}
            <div className="flex-1 overflow-y-auto p-4">
              <SectionEditor
                fields={selectedType.fields}
                data={selectedSection as unknown as Record<string, unknown>}
                onChange={(key, value) => updateSection(selectedSection.id, key, value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Section Panel (modal overlay) */}
      {showAddPanel && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setShowAddPanel(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-h-[70vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-800">Thêm section</h3>
                <p className="text-xs text-gray-400 mt-0.5">Chọn loại section muốn thêm vào trang</p>
              </div>
              <button onClick={() => setShowAddPanel(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2.5 overflow-y-auto max-h-[50vh]">
              {SECTION_TYPES.map(sType => (
                <button key={sType.type} onClick={() => addSection(sType.type)}
                  className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-gray-100 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group">
                  <span className="text-2xl shrink-0 mt-0.5">{sType.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors truncate">{sType.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{sType.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa section"
        message="Bạn có chắc muốn xóa section này? Hành động không thể hoàn tác."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
