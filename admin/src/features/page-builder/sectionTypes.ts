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
  // ===== NEW PREMIUM SECTION TYPES (12) =====

  // --- GROUP 1: CONVERSION ---
  {
    type: 'pricing',
    label: 'Bảng giá dịch vụ',
    icon: '💰',
    description: 'Grid 2–4 gói dịch vụ với highlight gói nổi bật, toggle tháng/năm',
    defaultConfig: { columns: 3, highlight_index: 1, currency: 'VNĐ', style: 'card' },
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', placeholder: 'Bảng giá dịch vụ', group: 'content' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea', group: 'content' },
      { key: 'items', label: 'Danh sách gói', type: 'items-list', group: 'content' },
      { key: 'columns', label: 'Số cột', type: 'select', options: [
        { value: '2', label: '2 gói' }, { value: '3', label: '3 gói' }, { value: '4', label: '4 gói' }
      ], group: 'style' },
      { key: 'highlight_index', label: 'Gói nổi bật (0,1,2...)', type: 'number', group: 'style' },
      { key: 'currency', label: 'Đơn vị tiền', type: 'text', placeholder: 'VNĐ', group: 'style' },
    ]
  },
  {
    type: 'process_steps',
    label: 'Bước quy trình',
    icon: '🔢',
    description: 'Timeline ngang 3–6 bước với số thứ tự, icon và mô tả',
    defaultConfig: { style: 'horizontal', connector: 'line' },
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', placeholder: 'Quy trình làm việc', group: 'content' },
      { key: 'subtitle', label: 'Mô tả section', type: 'textarea', group: 'content' },
      { key: 'items', label: 'Danh sách bước', type: 'icon-text-list', group: 'content' },
      { key: 'style', label: 'Kiểu hiển thị', type: 'select', options: [
        { value: 'horizontal', label: 'Ngang' }, { value: 'vertical', label: 'Dọc' }, { value: 'zigzag', label: 'Zigzag' }
      ], group: 'style' },
      { key: 'connector', label: 'Kiểu nối', type: 'select', options: [
        { value: 'line', label: 'Đường thẳng' }, { value: 'dashed', label: 'Nét đứt' }, { value: 'arrow', label: 'Mũi tên' }
      ], group: 'style' },
    ]
  },
  {
    type: 'download_box',
    label: 'Tải tài liệu',
    icon: '📥',
    description: 'Thẻ download tài liệu với icon file, badge loại file',
    defaultConfig: { columns: 2, style: 'card' },
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', placeholder: 'Tài liệu tham khảo', group: 'content' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea', group: 'content' },
      { key: 'items', label: 'Danh sách tài liệu', type: 'icon-text-list', group: 'content' },
      { key: 'columns', label: 'Số cột', type: 'select', options: [
        { value: '1', label: '1 cột' }, { value: '2', label: '2 cột' }, { value: '3', label: '3 cột' }
      ], group: 'style' },
    ]
  },

  // --- GROUP 2: VISUAL & INTERACTIVE ---
  {
    type: 'before_after',
    label: 'So sánh Trước/Sau',
    icon: '🔄',
    description: 'Slider kéo so sánh 2 ảnh trước và sau — rất hiệu quả cho dự án xây dựng',
    defaultConfig: { orientation: 'horizontal', initial_position: 50 },
    fields: [
      { key: 'title', label: 'Tiêu đề (tuỳ chọn)', type: 'text', placeholder: 'Trước & Sau thi công', group: 'content' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea', group: 'content' },
      { key: 'before_image', label: 'Ảnh TRƯỚC', type: 'image', group: 'content' },
      { key: 'after_image', label: 'Ảnh SAU', type: 'image', group: 'content' },
      { key: 'before_label', label: 'Nhãn Trước', type: 'text', placeholder: 'Trước', group: 'content' },
      { key: 'after_label', label: 'Nhãn Sau', type: 'text', placeholder: 'Sau', group: 'content' },
      { key: 'orientation', label: 'Hướng kéo', type: 'select', options: [
        { value: 'horizontal', label: 'Ngang' }, { value: 'vertical', label: 'Dọc' }
      ], group: 'style' },
      { key: 'initial_position', label: 'Vị trí ban đầu (%)', type: 'number', group: 'style' },
    ]
  },
  {
    type: 'animated_counter',
    label: 'Đếm số động',
    icon: '🔥',
    description: 'Số nhảy count-up khi scroll vào view, với suffix/prefix tuỳ chỉnh',
    defaultConfig: { columns: 4, duration: 2000, background: 'dark' },
    fields: [
      { key: 'title', label: 'Tiêu đề (tuỳ chọn)', type: 'text', group: 'content' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea', group: 'content' },
      { key: 'items', label: 'Danh sách số liệu', type: 'icon-text-list', group: 'content' },
      { key: 'columns', label: 'Số cột', type: 'select', options: [
        { value: '2', label: '2 cột' }, { value: '3', label: '3 cột' }, { value: '4', label: '4 cột' }
      ], group: 'style' },
      { key: 'background', label: 'Màu nền', type: 'select', options: [
        { value: 'dark', label: 'Tối' }, { value: 'primary', label: 'Xanh (Primary)' }, { value: 'gradient', label: 'Gradient' }, { value: 'light', label: 'Sáng' }
      ], group: 'style' },
      { key: 'duration', label: 'Thời gian đếm (ms)', type: 'number', group: 'advanced' },
    ]
  },
  {
    type: 'masonry_gallery',
    label: 'Gallery kiểu Pinterest',
    icon: '🧱',
    description: 'Lưới ảnh không đều (masonry) với hover zoom + lightbox xem full',
    defaultConfig: { columns: 3, gap: 12, show_overlay: true },
    fields: [
      { key: 'title', label: 'Tiêu đề (tuỳ chọn)', type: 'text', group: 'content' },
      { key: 'media_urls', label: 'Danh sách ảnh', type: 'images', group: 'content' },
      { key: 'columns', label: 'Số cột', type: 'select', options: [
        { value: '2', label: '2 cột' }, { value: '3', label: '3 cột' }, { value: '4', label: '4 cột' }
      ], group: 'style' },
      { key: 'show_overlay', label: 'Hiện overlay khi hover', type: 'toggle', group: 'style' },
    ]
  },
  {
    type: 'map_section',
    label: 'Bản đồ',
    icon: '🗺️',
    description: 'Google Maps nhúng với danh sách địa điểm bên cạnh',
    defaultConfig: { map_height: 400, layout: 'map-right' },
    fields: [
      { key: 'title', label: 'Tiêu đề', type: 'text', placeholder: 'Mạng lưới dự án', group: 'content' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea', group: 'content' },
      { key: 'map_embed', label: 'Google Maps Embed URL', type: 'url', placeholder: 'https://www.google.com/maps/embed?pb=...', group: 'content' },
      { key: 'items', label: 'Danh sách địa điểm', type: 'icon-text-list', group: 'content' },
      { key: 'map_height', label: 'Chiều cao bản đồ (px)', type: 'number', group: 'style' },
      { key: 'layout', label: 'Bố cục', type: 'select', options: [
        { value: 'map-right', label: 'Bản đồ bên phải' }, { value: 'map-left', label: 'Bản đồ bên trái' }, { value: 'map-full', label: 'Bản đồ full width' }
      ], group: 'style' },
    ]
  },

  // --- GROUP 3: ADVANCED CONTENT ---
  {
    type: 'tabs',
    label: 'Nội dung dạng Tab',
    icon: '📑',
    description: '2–5 tab ngang, click chuyển nội dung với animation mượt',
    defaultConfig: { style: 'underline', alignment: 'center' },
    fields: [
      { key: 'title', label: 'Tiêu đề section (tuỳ chọn)', type: 'text', group: 'content' },
      { key: 'items', label: 'Danh sách tab', type: 'icon-text-list', group: 'content' },
      { key: 'style', label: 'Kiểu tab', type: 'select', options: [
        { value: 'underline', label: 'Gạch dưới' }, { value: 'pill', label: 'Viên thuốc' }, { value: 'boxed', label: 'Hộp' }
      ], group: 'style' },
      { key: 'alignment', label: 'Căn chỉnh tab', type: 'select', options: [
        { value: 'left', label: 'Trái' }, { value: 'center', label: 'Giữa' }, { value: 'stretch', label: 'Dàn đều' }
      ], group: 'style' },
    ]
  },
  {
    type: 'latest_posts',
    label: 'Bài viết mới nhất',
    icon: '📰',
    description: 'Grid bài viết mới nhất — auto-fetch từ database',
    defaultConfig: { count: 4, columns: 2, show_date: true, show_excerpt: true },
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', placeholder: 'Tin tức mới nhất', group: 'content' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea', group: 'content' },
      { key: 'count', label: 'Số bài hiển thị', type: 'number', group: 'content' },
      { key: 'columns', label: 'Số cột', type: 'select', options: [
        { value: '2', label: '2 cột' }, { value: '3', label: '3 cột' }, { value: '4', label: '4 cột' }
      ], group: 'style' },
      { key: 'show_date', label: 'Hiện ngày đăng', type: 'toggle', group: 'style' },
      { key: 'show_excerpt', label: 'Hiện tóm tắt', type: 'toggle', group: 'style' },
    ]
  },
  {
    type: 'rich_accordion',
    label: 'Accordion nâng cao',
    icon: '📜',
    description: 'Accordion hỗ trợ ảnh, icon, rich text bên trong mỗi mục',
    defaultConfig: { style: 'bordered', allow_multiple: false, icon_position: 'left' },
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', group: 'content' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea', group: 'content' },
      { key: 'items', label: 'Danh sách mục', type: 'icon-text-list', group: 'content' },
      { key: 'style', label: 'Kiểu viền', type: 'select', options: [
        { value: 'bordered', label: 'Có viền' }, { value: 'separated', label: 'Tách biệt' }, { value: 'minimal', label: 'Tối giản' }
      ], group: 'style' },
      { key: 'allow_multiple', label: 'Cho phép mở nhiều mục', type: 'toggle', group: 'style' },
      { key: 'icon_position', label: 'Vị trí icon', type: 'select', options: [
        { value: 'left', label: 'Bên trái' }, { value: 'right', label: 'Bên phải' }
      ], group: 'style' },
    ]
  },

  // --- GROUP 4: BRAND TRUST ---
  {
    type: 'certifications',
    label: 'Chứng nhận & Giải thưởng',
    icon: '🏆',
    description: 'Grid chứng nhận ISO, giải thưởng với hover flip hiện mô tả',
    defaultConfig: { columns: 4, style: 'card' },
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', placeholder: 'Chứng nhận & Giải thưởng', group: 'content' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea', group: 'content' },
      { key: 'items', label: 'Danh sách chứng nhận', type: 'icon-text-list', group: 'content' },
      { key: 'columns', label: 'Số cột', type: 'select', options: [
        { value: '3', label: '3 cột' }, { value: '4', label: '4 cột' }, { value: '5', label: '5 cột' }
      ], group: 'style' },
      { key: 'style', label: 'Kiểu hiển thị', type: 'select', options: [
        { value: 'card', label: 'Thẻ (Card)' }, { value: 'badge', label: 'Huy hiệu' }, { value: 'minimal', label: 'Tối giản' }
      ], group: 'style' },
    ]
  },
  {
    type: 'video_gallery',
    label: 'Thư viện Video',
    icon: '🎥',
    description: 'Grid video thumbnails với play overlay, click mở lightbox player',
    defaultConfig: { columns: 3, autoplay: false },
    fields: [
      { key: 'title', label: 'Tiêu đề section', type: 'text', placeholder: 'Video công trình', group: 'content' },
      { key: 'subtitle', label: 'Mô tả', type: 'textarea', group: 'content' },
      { key: 'items', label: 'Danh sách video (YouTube URL)', type: 'icon-text-list', group: 'content' },
      { key: 'columns', label: 'Số cột', type: 'select', options: [
        { value: '2', label: '2 cột' }, { value: '3', label: '3 cột' }, { value: '4', label: '4 cột' }
      ], group: 'style' },
    ]
  },
]

export function getSectionType(type: string): SectionTypeConfig | undefined {
  return SECTION_TYPES.find(s => s.type === type)
}
