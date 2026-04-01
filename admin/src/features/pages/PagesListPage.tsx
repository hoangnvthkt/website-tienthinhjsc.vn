import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronRight, ChevronDown, GripVertical, FileText, Layers, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Page } from '@/types/database'
import StatusBadge from '@/components/shared/StatusBadge'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface PageNode extends Page {
  children: PageNode[]
}

function buildTree(pages: Page[]): PageNode[] {
  const map: Record<string, PageNode> = {}
  const roots: PageNode[] = []
  // Initialize nodes
  pages.forEach(p => { map[p.id] = { ...p, children: [] } })
  // Build hierarchy
  pages.forEach(p => {
    const node = map[p.id]
    if (p.parent_id && map[p.parent_id]) {
      map[p.parent_id].children.push(node)
    } else {
      roots.push(node)
    }
  })
  // Sort children by sort_order
  const sortNodes = (nodes: PageNode[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order)
    nodes.forEach(n => sortNodes(n.children))
  }
  sortNodes(roots)
  return roots
}

export default function PagesListPage() {
  const { profile } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const fetchPages = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('pages')
        .select('*')
        .order('sort_order', { ascending: true })
      setPages(data || [])
      // Auto-expand parents
      if (data) {
        const parentIds = new Set(data.filter(p => p.parent_id).map(p => p.parent_id!))
        setExpandedIds(parentIds)
      }
    } catch (err) {
      console.error('Fetch pages error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPages() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    await supabase.from('pages').delete().eq('id', deleteId)
    setDeleteId(null)
    fetchPages()
  }

  const toggleStatus = async (page: Page) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published'
    await supabase.from('pages').update({ status: newStatus }).eq('id', page.id)
    fetchPages()
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const tree = buildTree(pages)

  const renderPageRow = (node: PageNode, depth: number = 0) => {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedIds.has(node.id)

    return (
      <div key={node.id}>
        <div className={`flex items-center gap-2 px-4 py-3 hover:bg-gray-50/80 transition-colors border-b border-gray-50 ${depth > 0 ? 'bg-gray-50/30' : ''}`}>
          {/* Indent + expand toggle */}
          <div className="flex items-center gap-1" style={{ paddingLeft: depth * 24 }}>
            <GripVertical size={14} className="text-gray-300 cursor-grab" />
            {hasChildren ? (
              <button onClick={() => toggleExpand(node.id)} className="p-0.5 text-gray-400 hover:text-gray-600">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <span className="w-5" />
            )}
          </div>

          {/* Icon */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${depth > 0 ? 'bg-blue-50 text-blue-400' : 'bg-primary/10 text-primary'}`}>
            {depth > 0 ? <Layers size={14} /> : <FileText size={14} />}
          </div>

          {/* Title + slug */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-800 truncate">{node.title}</p>
              {hasChildren && (
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">
                  {node.children.length} trang con
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono truncate">/{node.slug}</p>
          </div>

          {/* Template */}
          <div className="hidden md:block w-20">
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
              {node.template || 'default'}
            </span>
          </div>

          {/* Status */}
          <div className="w-24">
            <button onClick={() => toggleStatus(node)} title="Click để đổi trạng thái">
              <StatusBadge status={node.status} />
            </button>
          </div>

          {/* Updated */}
          <div className="hidden lg:block w-28 text-sm text-gray-500">
            {formatDate(node.updated_at)}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 w-28 justify-end">
            <Link
              to={`/pages/${node.id}/builder`}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Page Builder"
            >
              <Sparkles size={15} />
            </Link>
            <Link
              to={`/pages/${node.id}/edit`}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Sửa nội dung"
            >
              <Pencil size={15} />
            </Link>
            {profile?.role === 'admin' && (
              <button
                onClick={() => setDeleteId(node.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Xóa"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderPageRow(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Quản lý trang</h2>
          <p className="text-sm text-gray-500 mt-0.5">{pages.length} trang</p>
        </div>
        <Link
          to="/pages/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Tạo trang mới
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="flex-1" style={{ paddingLeft: 38 }}>Tên trang</div>
          <div className="hidden md:block w-20">Template</div>
          <div className="w-24">Trạng thái</div>
          <div className="hidden lg:block w-28">Cập nhật</div>
          <div className="w-28 text-right">Thao tác</div>
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
            <FileText size={32} className="mb-2" />
            <p className="text-sm">Chưa có trang nào</p>
          </div>
        ) : (
          <div>{tree.map(node => renderPageRow(node))}</div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Xóa trang"
        message="Bạn có chắc muốn xóa trang này? Các trang con sẽ trở thành trang gốc."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
