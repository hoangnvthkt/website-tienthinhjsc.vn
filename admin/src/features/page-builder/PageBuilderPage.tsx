import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Save, Eye, EyeOff, Trash2, GripVertical,
  Copy, ChevronUp, ChevronDown, X, Plus, Sparkles,
  Undo2, Redo2, PanelLeftClose, PanelLeftOpen,
  Bookmark, BookmarkPlus, LayoutGrid, Keyboard, Wand2,
  Columns, GripHorizontal
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import type {
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '@/lib/supabase'
import { SECTION_TYPES, getSectionType } from './sectionTypes'
import SectionEditor from './SectionEditor'
import SectionPreview from './SectionPreview'
import BlocksSidebar from './BlocksSidebar'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { useBuilderHistory } from './useBuilderHistory'

// ============================================
// Types
// ============================================
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
  col_span: number // 1-12, default 12 (full width)
}

// Column width presets for the Inspector
const COL_SPAN_OPTIONS = [
  { value: 12, label: 'Full (100%)', icon: '████████████' },
  { value: 9, label: '3/4 (75%)', icon: '█████████░░░' },
  { value: 8, label: '2/3 (66%)', icon: '████████░░░░' },
  { value: 6, label: '1/2 (50%)', icon: '██████░░░░░░' },
  { value: 4, label: '1/3 (33%)', icon: '████░░░░░░░░' },
  { value: 3, label: '1/4 (25%)', icon: '███░░░░░░░░░' },
]

// Helper: group sections into rows based on col_span
function groupIntoRows(sections: SectionData[]): SectionData[][] {
  const rows: SectionData[][] = []
  let currentRow: SectionData[] = []
  let currentSpan = 0

  for (const section of sections) {
    const span = section.col_span || 12
    if (currentSpan + span > 12 && currentRow.length > 0) {
      rows.push(currentRow)
      currentRow = [section]
      currentSpan = span
    } else {
      currentRow.push(section)
      currentSpan += span
    }
  }
  if (currentRow.length > 0) rows.push(currentRow)
  return rows
}

interface SectionTemplate {
  id: string
  name: string
  section_type: string
  config: Record<string, unknown>
  title: string | null
  content: string | null
  media_urls: string[]
  created_at: string
}

// ============================================
// Resize Handle between adjacent columns
// ============================================
function ResizeHandle({ leftSection, rightSection, onResize }: {
  leftSection: SectionData
  rightSection: SectionData
  onResize: (leftSpan: number, rightSpan: number) => void
}) {
  const handleRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)

    const totalSpan = (leftSection.col_span || 12) + (rightSection.col_span || 12)
    const parentRow = handleRef.current?.closest('[style*="grid-template-columns"]') as HTMLElement | null
    if (!parentRow) return

    const startX = e.clientX
    const rowRect = parentRow.getBoundingClientRect()
    const colWidth = rowRect.width / 12

    const handleMouseMove = (moveE: MouseEvent) => {
      const deltaX = moveE.clientX - startX
      const deltaCols = Math.round(deltaX / colWidth)
      const newLeft = Math.max(1, Math.min(totalSpan - 1, (leftSection.col_span || 12) + deltaCols))
      const newRight = totalSpan - newLeft
      if (newLeft >= 1 && newRight >= 1 && newLeft <= 11 && newRight <= 11) {
        onResize(newLeft, newRight)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [leftSection.col_span, rightSection.col_span, onResize])

  return (
    <div
      ref={handleRef}
      onMouseDown={handleMouseDown}
      className={`absolute top-0 right-0 bottom-0 w-3 z-30 cursor-col-resize group flex items-center justify-center
        ${isDragging ? 'bg-primary/20' : 'hover:bg-primary/10'}`}
      style={{ transform: 'translateX(50%)' }}
    >
      <div className={`w-1 h-12 rounded-full transition-all ${
        isDragging ? 'bg-primary scale-y-110' : 'bg-gray-300 group-hover:bg-primary/60'
      }`} />
    </div>
  )
}

// ============================================
// Sortable Canvas Section Wrapper
// ============================================
function SortableSection({
  section,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onInsertBefore,
  onInsertAfter,
  onUpdateTitle,
}: {
  section: SectionData
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleVisibility: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
  onInsertBefore: () => void
  onInsertAfter: () => void
  onUpdateTitle: (title: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto' as string | number,
  }

  const sType = getSectionType(section.section_type)
  const [showInsertBefore, setShowInsertBefore] = useState(false)
  const [showInsertAfter, setShowInsertAfter] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(section.title || '')
  const titleInputRef = useRef<HTMLInputElement>(null)

  return (
    <div ref={setNodeRef} style={style} className="relative group/section">
      {/* Insert Point Before */}
      <div
        className="relative h-0"
        onMouseEnter={() => setShowInsertBefore(true)}
        onMouseLeave={() => setShowInsertBefore(false)}
      >
        <div className={`absolute left-0 right-0 -top-3 h-6 z-20 flex items-center justify-center transition-opacity ${
          showInsertBefore ? 'opacity-100' : 'opacity-0'
        }`}>
          {isFirst && (
            <button
              onClick={(e) => { e.stopPropagation(); onInsertBefore() }}
              className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Section Card */}
      <div
        onClick={onSelect}
        onDoubleClick={(e) => { e.stopPropagation(); onSelect(); }}
        className={`relative rounded-xl border-2 transition-all overflow-hidden cursor-pointer ${
          isSelected
            ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20'
            : 'border-transparent hover:border-gray-300'
        } ${isDragging ? 'shadow-2xl' : ''}`}
      >
        {/* Hidden Section Overlay */}
        {!section.is_visible && (
          <div className="absolute inset-0 z-20 bg-gray-100/70 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <EyeOff size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Section đã ẩn</span>
            </div>
          </div>
        )}

        {/* Floating Toolbar */}
        <div className={`absolute top-2 right-2 z-30 flex items-center gap-0.5 bg-white/95 backdrop-blur rounded-lg border border-gray-200 shadow-sm px-1 py-0.5 transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover/section:opacity-100'
        }`}>
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="p-1.5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing rounded"
            title="Kéo để di chuyển"
          >
            <GripVertical size={14} />
          </div>

          <div className="w-px h-4 bg-gray-200" />

          <button onClick={(e) => { e.stopPropagation(); onMoveUp() }} disabled={isFirst}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded disabled:opacity-30" title="Di chuyển lên">
            <ChevronUp size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown() }} disabled={isLast}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded disabled:opacity-30" title="Di chuyển xuống">
            <ChevronDown size={14} />
          </button>

          <div className="w-px h-4 bg-gray-200" />

          <button onClick={(e) => { e.stopPropagation(); onDuplicate() }}
            className="p-1.5 text-gray-400 hover:text-blue-500 rounded" title="Nhân bản (⌘D)">
            <Copy size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onToggleVisibility() }}
            className={`p-1.5 rounded transition-colors ${
              section.is_visible ? 'text-gray-400 hover:text-gray-600' : 'text-amber-500 hover:text-amber-600 bg-amber-50'
            }`} title={section.is_visible ? 'Ẩn' : 'Hiện'}>
            {section.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded" title="Xóa (Delete)">
            <Trash2 size={14} />
          </button>
        </div>

        {/* Section Type Badge + Inline Title */}
        <div className={`absolute top-2 left-2 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur rounded-lg px-2 py-1 border border-gray-200 shadow-sm transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover/section:opacity-100'
        }`}>
          <span className="text-sm">{sType?.icon || '📦'}</span>
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false)
                if (editTitle.trim() !== (section.title || '')) {
                  onUpdateTitle(editTitle.trim())
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.currentTarget.blur() }
                if (e.key === 'Escape') { setEditTitle(section.title || ''); setIsEditingTitle(false) }
                e.stopPropagation()
              }}
              onClick={e => e.stopPropagation()}
              className="text-[10px] font-semibold text-gray-700 bg-transparent border-b border-primary outline-none w-28 py-0"
              autoFocus
            />
          ) : (
            <span
              className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide cursor-text hover:text-primary transition-colors"
              onDoubleClick={(e) => {
                e.stopPropagation()
                setEditTitle(section.title || sType?.label || '')
                setIsEditingTitle(true)
              }}
              title="Double-click để sửa tiêu đề"
            >
              {section.title || sType?.label}
            </span>
          )}
        </div>

        {/* New Badge */}
        {section.is_new && (
          <span className="absolute -top-1.5 -right-1.5 z-40 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow">MỚI</span>
        )}

        {/* Preview Content */}
        <SectionPreview section={section} />
      </div>

      {/* Insert Point After */}
      <div
        className="relative h-0"
        onMouseEnter={() => setShowInsertAfter(true)}
        onMouseLeave={() => setShowInsertAfter(false)}
      >
        <div className={`absolute left-0 right-0 top-0 h-6 z-20 flex items-center justify-center transition-opacity ${
          showInsertAfter ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={(e) => { e.stopPropagation(); onInsertAfter() }}
            className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Drag Overlay Component
// ============================================
function DragOverlayContent({ section }: { section: SectionData | null }) {
  if (!section) return null
  const sType = getSectionType(section.section_type)

  return (
    <div className="bg-white/90 backdrop-blur border-2 border-primary rounded-xl shadow-2xl p-3 max-w-md">
      <div className="flex items-center gap-2">
        <span className="text-lg">{sType?.icon || '📦'}</span>
        <div>
          <p className="text-sm font-medium text-gray-700">{section.title || sType?.label}</p>
          <p className="text-[10px] text-gray-400">{sType?.label}</p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Main Page Builder
// ============================================
export default function PageBuilderPage() {
  const { id: pageId } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLDivElement>(null)

  const [pageTitle, setPageTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [insertAtIndex, setInsertAtIndex] = useState<number | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [templates, setTemplates] = useState<SectionTemplate[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [saveTemplateName, setSaveTemplateName] = useState('')
  const [saveTemplateFor, setSaveTemplateFor] = useState<string | null>(null)
  const [isDroppingFromSidebar, setIsDroppingFromSidebar] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // === Undo/Redo ===
  const {
    state: sections,
    setState: setSections,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  } = useBuilderHistory<SectionData[]>([])

  const hasChanges = canUndo // If we can undo, there are unsaved changes

  // === DnD Sensors ===
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // === Fetch Data ===
  useEffect(() => {
    if (!pageId) return
    setLoading(true)
    Promise.all([
      (supabase.from('pages') as any).select('title').eq('id', pageId).single(),
      (supabase.from('page_sections') as any).select('*').eq('page_id', pageId).order('sort_order'),
    ]).then(([pageRes, secRes]: any[]) => {
      setPageTitle(pageRes.data?.title || 'Untitled')
      const loaded = (secRes.data || []).map((s: any) => ({
        ...s,
        config: (typeof s.config === 'object' && s.config !== null ? s.config : {}) as Record<string, unknown>,
        media_urls: Array.isArray(s.media_urls) ? s.media_urls as string[] : [],
        col_span: typeof s.col_span === 'number' ? s.col_span : 12,
      }))
      setSections(loaded)
      resetHistory()
      setLoading(false)
    })
  }, [pageId])

  // === Load Templates ===
  useEffect(() => {
    (supabase.from('section_templates') as any)
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }: any) => {
        if (data) setTemplates(data as SectionTemplate[])
      })
  }, [])

  // === Section CRUD ===
  const addSection = useCallback((type: string, atIndex?: number) => {
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
      sort_order: 0,
      is_visible: true,
      is_new: true,
      col_span: 12,
    }

    setSections(prev => {
      const idx = atIndex !== undefined ? atIndex : prev.length
      const next = [...prev]
      next.splice(idx, 0, newSection)
      return next.map((s, i) => ({ ...s, sort_order: i }))
    })
    setSelectedId(newSection.id)
    setInsertAtIndex(null)
  }, [setSections])

  const addFromTemplate = useCallback((template: SectionTemplate) => {
    const newSection: SectionData = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      section_type: template.section_type,
      title: template.title,
      subtitle: null,
      content: template.content,
      config: { ...template.config },
      media_urls: [...template.media_urls],
      sort_order: 0,
      is_visible: true,
      is_new: true,
      col_span: 12,
    }

    setSections(prev => {
      const idx = insertAtIndex !== null ? insertAtIndex : prev.length
      const next = [...prev]
      next.splice(idx, 0, newSection)
      return next.map((s, i) => ({ ...s, sort_order: i }))
    })
    setSelectedId(newSection.id)
    setShowTemplates(false)
    setInsertAtIndex(null)
  }, [setSections, insertAtIndex])

  const duplicateSection = useCallback((sectionId: string) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === sectionId)
      if (idx === -1) return prev

      const source = prev[idx]
      const clone: SectionData = {
        ...source,
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: source.title ? `${source.title} (copy)` : null,
        config: { ...source.config },
        media_urls: [...source.media_urls],
        is_new: true,
      }

      const next = [...prev]
      next.splice(idx + 1, 0, clone)
      return next.map((s, i) => ({ ...s, sort_order: i }))
    })
  }, [setSections])

  const updateSection = useCallback((sectionId: string, key: string, value: unknown) => {
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s
      if (key.startsWith('config.')) {
        const configKey = key.slice(7)
        return { ...s, config: { ...s.config, [configKey]: value } }
      }
      return { ...s, [key]: value }
    }))
  }, [setSections])

  const toggleVisibility = useCallback((sectionId: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, is_visible: !s.is_visible } : s
    ))
  }, [setSections])

  const moveSection = useCallback((idx: number, dir: -1 | 1) => {
    setSections(prev => {
      const swapIdx = idx + dir
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next.map((s, i) => ({ ...s, sort_order: i }))
    })
  }, [setSections])

  // === Drag & Drop ===
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    setSections(prev => {
      const oldIdx = prev.findIndex(s => s.id === active.id)
      const newIdx = prev.findIndex(s => s.id === over.id)
      if (oldIdx === -1 || newIdx === -1) return prev
      return arrayMove(prev, oldIdx, newIdx).map((s, i) => ({ ...s, sort_order: i }))
    })
  }

  // === Canvas Drop (new block from sidebar) ===
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDroppingFromSidebar(false)
    const blockType = e.dataTransfer.getData('block-type')
    if (blockType) {
      addSection(blockType)
    }
  }

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    if (!isDroppingFromSidebar) setIsDroppingFromSidebar(true)
  }

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    // Only trigger when leaving the canvas boundary
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) {
      setIsDroppingFromSidebar(false)
    }
  }

  // === Delete ===
  const handleDelete = async () => {
    if (!deleteTarget) return
    const section = sections.find(s => s.id === deleteTarget)
    if (section && !section.is_new) {
      await (supabase.from('page_sections') as any).delete().eq('id', deleteTarget)
    }
    setSections(prev => prev.filter(s => s.id !== deleteTarget))
    if (selectedId === deleteTarget) setSelectedId(null)
    setDeleteTarget(null)
  }

  // === Save ===
  const handleSave = async () => {
    if (!pageId) return
    setSaving(true)
    try {
      const newSections = [...sections]
      for (let i = 0; i < newSections.length; i++) {
        const s = newSections[i]
        const payload: any = {
          page_id: pageId,
          section_type: s.section_type,
          title: s.title,
          subtitle: s.subtitle,
          content: s.content,
          config: s.config,
          media_urls: s.media_urls,
          sort_order: i,
          is_visible: s.is_visible,
          col_span: s.col_span || 12,
        }
        if (s.is_new) {
          const { data } = await (supabase.from('page_sections') as any).insert(payload).select('id').single()
          if (data) {
            newSections[i] = { ...s, id: data.id, sort_order: i, is_new: false }
          }
        } else {
          await (supabase.from('page_sections') as any).update(payload).eq('id', s.id)
        }
      }
      setSections(newSections.map((s, i) => ({ ...s, sort_order: i, is_new: false })))
      resetHistory()
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  // === Save as Template ===
  const handleSaveTemplate = async () => {
    if (!saveTemplateFor || !saveTemplateName.trim()) return
    const section = sections.find(s => s.id === saveTemplateFor)
    if (!section) return

    const { data } = await (supabase.from('section_templates') as any).insert({
      name: saveTemplateName.trim(),
      section_type: section.section_type,
      config: section.config,
      title: section.title,
      content: section.content,
      media_urls: section.media_urls,
    } as any).select().single() as any

    if (data) {
      setTemplates(prev => [data as SectionTemplate, ...prev])
    }
    setSaveTemplateFor(null)
    setSaveTemplateName('')
  }

  // === Keyboard Shortcuts ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not editing text
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          e.preventDefault()
          setDeleteTarget(selectedId)
        }
      }

      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const modKey = isMac ? e.metaKey : e.ctrlKey

      if (modKey && e.key === 'd') {
        e.preventDefault()
        if (selectedId) duplicateSection(selectedId)
      }
      if (modKey && e.key === 's') {
        e.preventDefault()
        if (hasChanges) handleSave()
      }
      if (e.key === 'Escape') {
        setSelectedId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, hasChanges, duplicateSection])

  // === Derived ===
  const selectedSection = sections.find(s => s.id === selectedId)
  const selectedType = selectedSection ? getSectionType(selectedSection.section_type) : null
  const activeDragSection = activeId ? sections.find(s => s.id === activeId) || null : null

  // === Loading ===
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
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2 shrink-0">
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

        <div className="flex items-center gap-1.5">
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 mr-2">
            <button onClick={undo} disabled={!canUndo}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors"
              title="Hoàn tác (Ctrl+Z)">
              <Undo2 size={16} />
            </button>
            <button onClick={redo} disabled={!canRedo}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors"
              title="Làm lại (Ctrl+Shift+Z)">
              <Redo2 size={16} />
            </button>
          </div>

          {/* Sidebar Toggle */}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={sidebarCollapsed ? 'Mở sidebar' : 'Thu sidebar'}>
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>

          {/* Keyboard Shortcuts */}
          <button onClick={() => setShowShortcuts(!showShortcuts)}
            className={`p-1.5 rounded-lg transition-colors ${
              showShortcuts ? 'bg-gray-200 text-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Phím tắt">
            <Keyboard size={16} />
          </button>

          {/* Templates */}
          <button onClick={() => setShowTemplates(!showTemplates)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showTemplates ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <Bookmark size={14} /> Templates
          </button>

          {/* Save */}
          <button onClick={handleSave} disabled={!hasChanges || saving}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ml-1">
            <Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* ===== MAIN 3-PANEL LAYOUT ===== */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: Blocks Sidebar */}
        <BlocksSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onAddSection={(type) => addSection(type, insertAtIndex ?? undefined)}
        />

        {/* CENTER: Canvas */}
        <div
          ref={canvasRef}
          className={`flex-1 overflow-y-auto transition-colors duration-200 ${
            isDroppingFromSidebar ? 'bg-primary/5' : 'bg-gray-100/80'
          }`}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onClick={() => setSelectedId(null)}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="max-w-[900px] mx-auto py-6 px-4">
              {/* Canvas Header */}
              <div className="text-center mb-4">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{pageTitle}</p>
              </div>

              {/* Sections Canvas */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                {sections.length > 0 ? (
                  <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="divide-y divide-gray-100">
                      {(() => {
                        const rows = groupIntoRows(sections)
                        return rows.map((row, rowIdx) => (
                          <div key={`row-${rowIdx}`} className="relative">
                            <div
                              className="grid gap-0"
                              style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}
                            >
                              {row.map((section, colIdx) => {
                                const globalIdx = sections.findIndex(s => s.id === section.id)
                                return (
                                  <div
                                    key={section.id}
                                    className="relative"
                                    style={{ gridColumn: `span ${section.col_span || 12}` }}
                                  >
                                    <SortableSection
                                      section={section}
                                      isSelected={selectedId === section.id}
                                      onSelect={() => { setSelectedId(section.id); }}
                                      onDelete={() => setDeleteTarget(section.id)}
                                      onDuplicate={() => duplicateSection(section.id)}
                                      onToggleVisibility={() => toggleVisibility(section.id)}
                                      onMoveUp={() => moveSection(globalIdx, -1)}
                                      onMoveDown={() => moveSection(globalIdx, 1)}
                                      onUpdateTitle={(title) => updateSection(section.id, 'title', title)}
                                      isFirst={globalIdx === 0}
                                      isLast={globalIdx === sections.length - 1}
                                      onInsertBefore={() => setInsertAtIndex(globalIdx)}
                                      onInsertAfter={() => setInsertAtIndex(globalIdx + 1)}
                                    />
                                    {/* Resize Handle between columns */}
                                    {colIdx < row.length - 1 && (
                                      <ResizeHandle
                                        leftSection={section}
                                        rightSection={row[colIdx + 1]}
                                        onResize={(leftSpan, rightSpan) => {
                                          updateSection(section.id, 'col_span', leftSpan)
                                          updateSection(row[colIdx + 1].id, 'col_span', rightSpan)
                                        }}
                                      />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  </SortableContext>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                      <Wand2 size={28} className="text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-1">Bắt đầu xây dựng trang</h3>
                    <p className="text-sm text-gray-400 mb-6 text-center max-w-md">
                      Chọn block từ sidebar bên trái, hoặc bắt đầu nhanh với một mẫu có sẵn bên dưới
                    </p>

                    {/* Quick Start Templates */}
                    <div className="grid grid-cols-3 gap-3 w-full max-w-lg mb-6">
                      {[
                        { type: 'hero', icon: '🎯', label: 'Hero Banner', desc: 'Ảnh bìa + tiêu đề chính' },
                        { type: 'text', icon: '📝', label: 'Nội dung', desc: 'Văn bản rich-text' },
                        { type: 'features', icon: '⭐', label: 'Tính năng', desc: 'Grid tính năng / dịch vụ' },
                      ].map(t => (
                        <button
                          key={t.type}
                          onClick={() => addSection(t.type)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-100 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                        >
                          <span className="text-2xl">{t.icon}</span>
                          <span className="text-xs font-semibold text-gray-600 group-hover:text-primary">{t.label}</span>
                          <span className="text-[10px] text-gray-400 text-center">{t.desc}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setInsertAtIndex(0)}
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                      <LayoutGrid size={14} /> Xem tất cả blocks
                    </button>
                  </div>
                )}
              </div>

              {/* Add Section at Bottom */}
              {sections.length > 0 && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setInsertAtIndex(sections.length)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-gray-300 hover:border-primary rounded-xl text-gray-400 hover:text-primary transition-colors text-sm font-medium"
                  >
                    <Plus size={16} /> Thêm section
                  </button>
                </div>
              )}

              {/* Drop Zone Indicator (when dragging from sidebar) */}
              {isDroppingFromSidebar && (
                <div className="mt-4 mx-4 border-2 border-dashed border-primary/40 rounded-xl py-8 flex flex-col items-center justify-center bg-primary/5 animate-pulse">
                  <Plus size={24} className="text-primary/50 mb-2" />
                  <p className="text-sm text-primary/60 font-medium">Thả block vào đây</p>
                </div>
              )}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              <DragOverlayContent section={activeDragSection} />
            </DragOverlay>
          </DndContext>
        </div>

        {/* RIGHT: Inspector Panel */}
        {selectedSection && selectedType && (
          <div className="w-[360px] bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
            {/* Inspector Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">{selectedType.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{selectedType.label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{selectedType.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {/* Save as Template */}
                <button
                  onClick={() => { setSaveTemplateFor(selectedSection.id); setSaveTemplateName(selectedSection.title || selectedType.label) }}
                  className="p-1.5 text-gray-400 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition-colors"
                  title="Lưu làm template"
                >
                  <BookmarkPlus size={14} />
                </button>
                <button onClick={() => setSelectedId(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Inspector Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Column Width Selector */}
              <div className="mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2.5">
                  <Columns size={14} className="text-gray-400" />
                  <label className="text-xs font-semibold text-gray-600">Chiều rộng</label>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {COL_SPAN_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateSection(selectedSection.id, 'col_span', opt.value)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all text-center ${
                        (selectedSection.col_span || 12) === opt.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <div className="font-mono text-[8px] tracking-tighter mb-0.5 leading-none">{opt.icon}</div>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <SectionEditor
                fields={selectedType.fields}
                data={selectedSection as unknown as Record<string, unknown>}
                onChange={(key, value) => updateSection(selectedSection.id, key, value)}
              />
            </div>

            {/* Inspector Footer */}
            <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-2 shrink-0">
              <button onClick={() => duplicateSection(selectedSection.id)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors">
                <Copy size={13} /> Nhân bản
              </button>
              <button onClick={() => setDeleteTarget(selectedSection.id)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors">
                <Trash2 size={13} /> Xóa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== TEMPLATES PANEL (slide-over) ===== */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setShowTemplates(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-[380px] bg-white shadow-2xl border-l border-gray-200 flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-800">Section Templates</h3>
                <p className="text-xs text-gray-400 mt-0.5">{templates.length} template đã lưu</p>
              </div>
              <button onClick={() => setShowTemplates(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {templates.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Bookmark size={36} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">Chưa có template</p>
                  <p className="text-xs mt-1">Chọn section → bấm <BookmarkPlus size={12} className="inline" /> để lưu template</p>
                </div>
              ) : (
                templates.map(t => {
                  const sType = getSectionType(t.section_type)
                  return (
                    <button
                      key={t.id}
                      onClick={() => addFromTemplate(t)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                    >
                      <span className="text-lg shrink-0">{sType?.icon || '📦'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-700 truncate">{t.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{sType?.label}</p>
                        {t.title && <p className="text-xs text-gray-500 mt-1 truncate">{t.title}</p>}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== SAVE TEMPLATE MODAL ===== */}
      {saveTemplateFor && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center" onClick={() => setSaveTemplateFor(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[400px] p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-800 mb-1">Lưu Section Template</h3>
            <p className="text-xs text-gray-400 mb-4">Template này có thể dùng lại cho bất kỳ trang nào</p>
            <input
              type="text"
              value={saveTemplateName}
              onChange={e => setSaveTemplateName(e.target.value)}
              placeholder="Tên template..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none mb-4"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleSaveTemplate() }}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setSaveTemplateFor(null)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
                Hủy
              </button>
              <button onClick={handleSaveTemplate} disabled={!saveTemplateName.trim()}
                className="px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg text-sm font-medium disabled:opacity-50">
                <BookmarkPlus size={14} className="inline mr-1.5" /> Lưu template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRM ===== */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa section"
        message="Bạn có chắc muốn xóa section này? Hành động không thể hoàn tác."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ===== INSERT AT INDEX: Show quick section picker ===== */}
      {insertAtIndex !== null && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={() => setInsertAtIndex(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-h-[70vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-800">Thêm section</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Chèn vào vị trí {insertAtIndex + 1} / {sections.length + 1}
                </p>
              </div>
              <button onClick={() => setInsertAtIndex(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2.5 overflow-y-auto max-h-[50vh]">
              {SECTION_TYPES.map(sType => (
                <button key={sType.type} onClick={() => addSection(sType.type, insertAtIndex)}
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

      {/* ===== KEYBOARD SHORTCUTS PANEL ===== */}
      {showShortcuts && (
        <div className="fixed inset-0 z-40" onClick={() => setShowShortcuts(false)}>
          <div
            className="absolute top-[52px] right-[300px] bg-white rounded-xl shadow-2xl border border-gray-200 w-[280px] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Keyboard size={14} className="text-primary" />
                <h3 className="text-xs font-bold text-gray-700">Phím tắt</h3>
              </div>
              <button onClick={() => setShowShortcuts(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={14} />
              </button>
            </div>
            <div className="p-3 space-y-1.5">
              {[
                { keys: '⌘ Z', label: 'Hoàn tác' },
                { keys: '⌘ ⇧ Z', label: 'Làm lại' },
                { keys: '⌘ S', label: 'Lưu thay đổi' },
                { keys: '⌘ D', label: 'Nhân bản section' },
                { keys: 'Delete', label: 'Xóa section đang chọn' },
                { keys: 'Escape', label: 'Bỏ chọn section' },
                { keys: 'Double-click', label: 'Sửa tiêu đề trên canvas' },
              ].map(s => (
                <div key={s.keys} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50">
                  <span className="text-xs text-gray-600">{s.label}</span>
                  <kbd className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                💡 Kéo thả block từ sidebar trái → canvas để thêm section mới. Click section để chỉnh sửa trong Inspector bên phải.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
