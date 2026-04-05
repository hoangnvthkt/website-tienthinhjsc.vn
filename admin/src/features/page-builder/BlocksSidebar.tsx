import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react'
import { SECTION_TYPES } from './sectionTypes'

interface BlocksSidebarProps {
  collapsed: boolean
  onToggle: () => void
  onAddSection: (type: string) => void
}

const BLOCK_CATEGORIES = [
  { key: 'content', label: 'Nội dung', types: ['text', 'hero', 'video', 'image_gallery', 'tabs', 'rich_accordion'] },
  { key: 'layout', label: 'Bố cục', types: ['features', 'stats', 'cta', 'divider', 'process_steps', 'animated_counter'] },
  { key: 'interactive', label: 'Tương tác', types: ['faq', 'testimonial', 'contact_form', 'before_after'] },
  { key: 'data', label: 'Dữ liệu', types: ['featured_projects', 'latest_posts', 'partners', 'timeline', 'team'] },
  { key: 'media', label: 'Media', types: ['masonry_gallery', 'video_gallery', 'map_section'] },
  { key: 'business', label: 'Doanh nghiệp', types: ['pricing', 'download_box', 'certifications'] },
]

export default function BlocksSidebar({ collapsed, onToggle, onAddSection }: BlocksSidebarProps) {
  const [search, setSearch] = useState('')
  const [dragType, setDragType] = useState<string | null>(null)

  const filteredTypes = search.trim()
    ? SECTION_TYPES.filter(t =>
        t.label.toLowerCase().includes(search.toLowerCase()) ||
        t.type.toLowerCase().includes(search.toLowerCase())
      )
    : null

  if (collapsed) {
    return (
      <div className="w-12 bg-white border-r border-gray-200 flex flex-col items-center py-3 shrink-0">
        <button
          onClick={onToggle}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Mở danh sách blocks"
        >
          <ChevronRight size={16} />
        </button>
        <div className="mt-4 space-y-2">
          {SECTION_TYPES.slice(0, 8).map(sType => (
            <button
              key={sType.type}
              onClick={() => onAddSection(sType.type)}
              className="w-8 h-8 flex items-center justify-center text-sm rounded-lg hover:bg-gray-100 transition-colors"
              title={sType.label}
            >
              {sType.icon}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-[220px] bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Blocks</h3>
        <button
          onClick={onToggle}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm block..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Block List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredTypes ? (
          /* Search results */
          <div className="space-y-1">
            {filteredTypes.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Không tìm thấy block nào</p>
            )}
            {filteredTypes.map(sType => (
              <BlockItem
                key={sType.type}
                type={sType.type}
                icon={sType.icon}
                label={sType.label}
                description={sType.description}
                isDragging={dragType === sType.type}
                onDragStart={() => setDragType(sType.type)}
                onDragEnd={() => setDragType(null)}
                onClick={() => onAddSection(sType.type)}
              />
            ))}
          </div>
        ) : (
          /* Categorized */
          <div className="space-y-3">
            {BLOCK_CATEGORIES.map(cat => {
              const catTypes = SECTION_TYPES.filter(t => cat.types.includes(t.type))
              if (catTypes.length === 0) return null

              return (
                <div key={cat.key}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1.5">
                    {cat.label}
                  </p>
                  <div className="space-y-0.5">
                    {catTypes.map(sType => (
                      <BlockItem
                        key={sType.type}
                        type={sType.type}
                        icon={sType.icon}
                        label={sType.label}
                        description={sType.description}
                        isDragging={dragType === sType.type}
                        onDragStart={() => setDragType(sType.type)}
                        onDragEnd={() => setDragType(null)}
                        onClick={() => onAddSection(sType.type)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/50">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          💡 Click để thêm block vào cuối trang, hoặc kéo thả vào vị trí mong muốn trên canvas.
        </p>
      </div>
    </div>
  )
}

/* Individual Block Item */
function BlockItem({
  type,
  icon,
  label,
  description,
  isDragging,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  type: string
  icon: string
  label: string
  description: string
  isDragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onClick: () => void
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('block-type', type)
        e.dataTransfer.effectAllowed = 'copy'
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all ${
        isDragging
          ? 'opacity-50 scale-95 bg-primary/10'
          : 'hover:bg-gray-50 active:bg-gray-100'
      }`}
    >
      <div className="shrink-0 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical size={12} />
      </div>
      <span className="text-base shrink-0">{icon}</span>
      <span className="text-xs font-medium text-gray-600 truncate">{label}</span>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute left-full ml-2 z-50 w-48 bg-gray-900 text-white text-[11px] rounded-lg px-3 py-2 shadow-xl pointer-events-none">
          <p className="font-medium mb-0.5">{label}</p>
          <p className="text-gray-300 leading-relaxed">{description}</p>
          <div className="absolute right-full top-3 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-gray-900" />
        </div>
      )}
    </div>
  )
}

