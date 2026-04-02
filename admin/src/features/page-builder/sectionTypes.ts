// Section type definitions for the Page Builder

export interface SectionTypeConfig {
  type: string
  label: string
  icon: string
  description: string
  defaultConfig: Record<string, unknown>
  fields: SectionField[]
}

export interface SectionField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'richtext' | 'image' | 'images' | 'color' | 'select' | 'number' | 'toggle' | 'url' | 'icon-text-list' | 'items-list'
  placeholder?: string
  options?: { value: string; label: string }[]
  required?: boolean
  group?: 'content' | 'style' | 'advanced'
}

export const SECTION_TYPES: SectionTypeConfig[] = [
  {
    type: 'hero',
    label: 'Hero Banner',
    icon: '🎯',
    description: 'Banner lớn với tiêu đề, mô tả và nút CTA',
    defaultConfig: {
      alignment: 'center',
      overlay_opacity: 50,
      cta_text: 'Liên hệ ngay',
      cta_url: '/lien-he',
      height: 'large',
    },
    fields: [
      { key: 'title', label: 'Tiêu đề chính', type: 'text', placeholder: 'Tiêu đề hero banner', group: 'content' },
      { key: 'subtitle', label: 'Mô tả ngắn', type: 'textarea', placeholder: 'Mô tả bên dưới tiêu đề', group: 'content' },
      { key: 'background_image', label: 'Ảnh nền', type: 'image', group: 'content' },
      { key: 'cta_text', label: 'Nội dung nút CTA', type: 'text', placeholder: 'Liên hệ ngay', group: 'content' },
      { key: 'cta_url', label: 'Liên kết CTA', type: 'url', placeholder: '/lien-he', group: 'content' },
      { key: 'alignment', label: 'Căn chỉnh', type: 'select', options: [
        { value: 'left', label: 'Trái' }, { value: 'center', label: 'Giữa' }, { value: 'right', label: 'Phải' }
      ], group: 'style' },
      { key: 'overlay_opacity', label: 'Độ tối overlay (%)', type: 'number', group: 'style' },
      { key: 'height', label: 'Chiều cao', type: 'select', options: [
        { value: 'small', label: 'Nhỏ (300px)' }, { value: 'medium', label: 'Vừa (500px)' }, { value: 'large', label: 'Lớn (700px)' }, { value: 'full', label: 'Full màn hình' }
      ], group: 'style' },
    ]
  },
  {
    type: 'text',
    label: 'Nội dung văn bản',
    icon: '📝',
    description: 'Khối văn bản rich text với định dạng đầy đủ',
    defaultConfig: { max_width: 'prose' },
    fields: [
      { key: 'title', label: 'Tiêu đề (tuỳ chọn)', type: 'text', placeholder: 'Tiêu đề section', group: 'content' },
      { key: 'content', label: 'Nội dung', type: 'richtext', group: 'content' },
      { key: 'max_width', label: 'Độ rộng tối đa', type: 'select', options: [
        { value: 'prose', label: 'Vừa (720px)' }, { value: 'wide', label: 'Rộng (1024px)' }, { value: 'full', label: 'Full width' }
      ], group: 'style' },
    ]
  },
  {
    type: 'image_gallery',
    label: 'Thư viện ảnh',
    icon: '🖼️',
    description: 'Lưới ảnh với nhiều ảnh hiển thị dạng grid',
    defaultConfig: { columns: 3, gap: 16, aspect_ratio: 'auto' },
    fields: [
      { key: 'title', label: 'Tiêu đề (tuỳ chọn)', type: 'text', placeholder: 'Tiêu đề thư viện', group: 'content' },
      { key: 'media_urls', label: 'Danh sách ảnh', type: 'images', group: 'content' },
      { key: 'columns', label: 'Số cột', type: 'select', options: [
        { value: '2', label: '2 cột' }, { value: '3', label: '3 cột' }, { value: '4', label: '4 cột' }
      ], group: 'style' },
      { key: 'aspect_ratio', label: 'Tỉ lệ ảnh', type: 'select', options: [
        { value: 'auto', label: 'Tự động' }, { value: 'square', label: 'Vuông (1:1)' }, { value: 'landscape', label: 'Ngang (16:9)' }, { value: 'portrait', label: 'Dọc (3:4)' }
      ], group: 'style' },
    ]
  },
  {
    type: 'features',
    label: 'Tính năng / Dịch vụ',
    icon: '⭐',
    description: 'Grid các thẻ dịch vụ với icon, tiêu đề và mô tả',
    defaultConfig: { columns: 3, style: 'card' },
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', placeholder: 'Dịch vụ của chúng tôi', group: 'content' },
      { key: 'subtitle', label: 'Mô tả section', type: 'textarea', group: 'content' },
      { key: 'items', label: 'Danh sách dịch vụ', type: 'icon-text-list', group: 'content' },
      { key: 'columns', label: 'Số cột', type: 'select', options: [
        { value: '2', label: '2 cột' }, { value: '3', label: '3 cột' }, { value: '4', label: '4 cột' }
      ], group: 'style' },
      { key: 'style', label: 'Kiểu hiển thị', type: 'select', options: [
        { value: 'card', label: 'Thẻ (Card)' }, { value: 'minimal', label: 'Tối giản' }, { value: 'icon-top', label: 'Icon trên' }
      ], group: 'style' },
    ]
  },
  {
    type: 'stats',
    label: 'Thống kê số liệu',
    icon: '📊',
    description: 'Hiển thị số liệu nổi bật với hiệu ứng count-up',
    defaultConfig: { columns: 4, background: 'primary' },
    fields: [
      { key: 'title', label: 'Tiêu đề (tuỳ chọn)', type: 'text', group: 'content' },
      { key: 'items', label: 'Danh sách số liệu', type: 'icon-text-list', group: 'content' },
      { key: 'background', label: 'Màu nền', type: 'select', options: [
        { value: 'primary', label: 'Xanh (Primary)' }, { value: 'dark', label: 'Tối' }, { value: 'light', label: 'Sáng' }, { value: 'gradient', label: 'Gradient' }
      ], group: 'style' },
    ]
  },
  {
    type: 'cta',
    label: 'Call to Action',
    icon: '📢',
    description: 'Banner kêu gọi hành động với nút bấm',
    defaultConfig: { background: 'primary', alignment: 'center' },
    fields: [
      { key: 'title', label: 'Tiêu đề', type: 'text', placeholder: 'Bạn cần tư vấn?', required: true, group: 'content' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea', group: 'content' },
      { key: 'cta_text', label: 'Nút CTA', type: 'text', placeholder: 'Liên hệ ngay', group: 'content' },
      { key: 'cta_url', label: 'Liên kết', type: 'url', placeholder: '/lien-he', group: 'content' },
      { key: 'background', label: 'Màu nền', type: 'select', options: [
        { value: 'primary', label: 'Xanh (Primary)' }, { value: 'dark', label: 'Tối' }, { value: 'gradient', label: 'Gradient' }
      ], group: 'style' },
    ]
  },
  {
    type: 'testimonial',
    label: 'Đánh giá / Quote',
    icon: '💬',
    description: 'Hiển thị lời nhận xét từ khách hàng hoặc đối tác',
    defaultConfig: { style: 'card' },
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', placeholder: 'Khách hàng nói gì?', group: 'content' },
      { key: 'items', label: 'Danh sách đánh giá', type: 'icon-text-list', group: 'content' },
      { key: 'style', label: 'Kiểu hiển thị', type: 'select', options: [
        { value: 'card', label: 'Thẻ (Card)' }, { value: 'carousel', label: 'Carousel' }
      ], group: 'style' },
    ]
  },
  {
    type: 'faq',
    label: 'Câu hỏi thường gặp',
    icon: '❓',
    description: 'Danh sách FAQ dạng accordion',
    defaultConfig: {},
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', placeholder: 'Câu hỏi thường gặp', group: 'content' },
      { key: 'items', label: 'Danh sách câu hỏi', type: 'icon-text-list', group: 'content' },
    ]
  },
  {
    type: 'video',
    label: 'Video',
    icon: '🎬',
    description: 'Nhúng video từ YouTube hoặc nguồn khác',
    defaultConfig: { aspect_ratio: '16:9' },
    fields: [
      { key: 'title', label: 'Tiêu đề (tuỳ chọn)', type: 'text', group: 'content' },
      { key: 'video_url', label: 'URL video (YouTube)', type: 'url', placeholder: 'https://youtube.com/watch?v=...', required: true, group: 'content' },
      { key: 'subtitle', label: 'Mô tả video', type: 'textarea', group: 'content' },
    ]
  },
  {
    type: 'contact_form',
    label: 'Form liên hệ',
    icon: '📧',
    description: 'Hiển thị form liên hệ',
    defaultConfig: { show_map: false },
    fields: [
      { key: 'title', label: 'Tiêu đề', type: 'text', placeholder: 'Liên hệ với chúng tôi', group: 'content' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea', group: 'content' },
      { key: 'show_map', label: 'Hiện bản đồ', type: 'toggle', group: 'style' },
    ]
  },
  {
    type: 'divider',
    label: 'Phân cách',
    icon: '➖',
    description: 'Đường phân cách giữa các section',
    defaultConfig: { style: 'line', spacing: 'medium' },
    fields: [
      { key: 'style', label: 'Kiểu', type: 'select', options: [
        { value: 'line', label: 'Đường kẻ' }, { value: 'dots', label: 'Chấm tròn' }, { value: 'space', label: 'Khoảng trắng' }
      ], group: 'style' },
      { key: 'spacing', label: 'Khoảng cách', type: 'select', options: [
        { value: 'small', label: 'Nhỏ' }, { value: 'medium', label: 'Vừa' }, { value: 'large', label: 'Lớn' }
      ], group: 'style' },
    ]
  },
  // ===== NEW GUFRAM-INSPIRED SECTION TYPES =====
  {
    type: 'featured_projects',
    label: 'Dự án nổi bật',
    icon: '🏗️',
    description: 'Grid/Slider dự án nổi bật — auto-fetch từ database',
    defaultConfig: { display_mode: 'grid', count: 6, show_category: true },
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', placeholder: 'Dự án tiêu biểu', group: 'content' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea', group: 'content' },
      { key: 'count', label: 'Số dự án hiển thị', type: 'number', group: 'content' },
      { key: 'display_mode', label: 'Kiểu hiển thị', type: 'select', options: [
        { value: 'grid', label: 'Lưới (Grid)' }, { value: 'slider', label: 'Cuộn ngang (Slider)' }
      ], group: 'style' },
      { key: 'show_category', label: 'Hiện danh mục', type: 'toggle', group: 'style' },
    ]
  },
  {
    type: 'partners',
    label: 'Đối tác / Logo',
    icon: '🤝',
    description: 'Grid logo đối tác với hiệu ứng grayscale',
    defaultConfig: { columns: 5, grayscale: true },
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', placeholder: 'Đối tác chiến lược', group: 'content' },
      { key: 'logos', label: 'Danh sách logo', type: 'images', group: 'content' },
      { key: 'columns', label: 'Số cột', type: 'select', options: [
        { value: '3', label: '3 cột' }, { value: '4', label: '4 cột' }, { value: '5', label: '5 cột' }, { value: '6', label: '6 cột' }
      ], group: 'style' },
      { key: 'grayscale', label: 'Hiệu ứng đen trắng', type: 'toggle', group: 'style' },
    ]
  },
  {
    type: 'timeline',
    label: 'Dòng thời gian',
    icon: '📅',
    description: 'Timeline dọc với các mốc thời gian — kiểu Gufram Storia',
    defaultConfig: { layout: 'left' },
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', placeholder: 'Hành trình phát triển', group: 'content' },
      { key: 'items', label: 'Các mốc thời gian', type: 'icon-text-list', group: 'content' },
      { key: 'layout', label: 'Bố cục', type: 'select', options: [
        { value: 'left', label: 'Bên trái' }, { value: 'alternate', label: 'Xen kẽ' }, { value: 'split', label: 'Split-screen (ảnh trái, text phải)' }
      ], group: 'style' },
    ]
  },
  {
    type: 'team',
    label: 'Đội ngũ',
    icon: '👥',
    description: 'Grid thẻ thành viên đội ngũ với ảnh và thông tin',
    defaultConfig: { columns: 3 },
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', placeholder: 'Đội ngũ lãnh đạo', group: 'content' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea', group: 'content' },
      { key: 'items', label: 'Danh sách thành viên', type: 'icon-text-list', group: 'content' },
      { key: 'columns', label: 'Số cột', type: 'select', options: [
        { value: '2', label: '2 cột' }, { value: '3', label: '3 cột' }, { value: '4', label: '4 cột' }
      ], group: 'style' },
    ]
  },
]

export function getSectionType(type: string): SectionTypeConfig | undefined {
  return SECTION_TYPES.find(s => s.type === type)
}
