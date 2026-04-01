import { useState } from 'react'
import { ChevronDown, Search, Globe } from 'lucide-react'

interface SeoFieldsProps {
  metaTitle: string
  metaDescription: string
  ogImage?: string
  pageTitle: string
  onMetaTitleChange: (value: string) => void
  onMetaDescriptionChange: (value: string) => void
  onOgImageChange?: (value: string) => void
}

export default function SeoFields({
  metaTitle,
  metaDescription,
  pageTitle,
  onMetaTitleChange,
  onMetaDescriptionChange,
}: SeoFieldsProps) {
  const [expanded, setExpanded] = useState(false)

  const displayTitle = metaTitle || pageTitle || 'Tiêu đề trang'
  const displayDesc = metaDescription || 'Mô tả sẽ hiển thị trên Google khi trang được tìm thấy.'
  const titleLength = (metaTitle || '').length
  const descLength = (metaDescription || '').length

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Search size={15} className="text-orange-500" />
          SEO Settings
        </h3>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expandable Content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          {/* Google Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Globe size={10} /> Bản xem trước Google
            </p>
            <p className="text-blue-700 text-base font-medium leading-tight hover:underline cursor-pointer truncate">
              {displayTitle.length > 60 ? displayTitle.slice(0, 60) + '...' : displayTitle}
            </p>
            <p className="text-green-700 text-xs mt-0.5">tienthinhjsc.vn</p>
            <p className="text-gray-600 text-xs mt-1 line-clamp-2 leading-relaxed">
              {displayDesc.length > 160 ? displayDesc.slice(0, 160) + '...' : displayDesc}
            </p>
          </div>

          {/* Meta Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Meta Title</label>
              <span className={`text-xs ${titleLength > 60 ? 'text-red-500 font-medium' : titleLength > 50 ? 'text-amber-500' : 'text-gray-400'}`}>
                {titleLength}/60
              </span>
            </div>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => onMetaTitleChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder={pageTitle || 'Tiêu đề SEO cho Google...'}
            />
            {titleLength > 60 && (
              <p className="text-xs text-red-500 mt-1">⚠ Nên giữ dưới 60 ký tự để hiển thị đầy đủ trên Google</p>
            )}
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Meta Description</label>
              <span className={`text-xs ${descLength > 160 ? 'text-red-500 font-medium' : descLength > 140 ? 'text-amber-500' : 'text-gray-400'}`}>
                {descLength}/160
              </span>
            </div>
            <textarea
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              placeholder="Mô tả ngắn gọn, hấp dẫn cho công cụ tìm kiếm..."
            />
            {descLength > 160 && (
              <p className="text-xs text-red-500 mt-1">⚠ Nên giữ dưới 160 ký tự để hiển thị đầy đủ trên Google</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
