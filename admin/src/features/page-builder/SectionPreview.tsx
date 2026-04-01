import { getSectionType } from './sectionTypes'

export interface SectionData {
  section_type: string
  title: string | null
  subtitle: string | null
  content: string | null
  config: Record<string, unknown>
  media_urls: string[]
  is_visible: boolean
}

interface SectionPreviewProps {
  section: SectionData
  compact?: boolean
}

export default function SectionPreview({ section, compact = false }: SectionPreviewProps) {
  const sType = getSectionType(section.section_type)
  const config = section.config || {}

  if (compact) {
    return <CompactPreview section={section} />
  }

  switch (section.section_type) {
    case 'hero': return <HeroPreview section={section} config={config} />
    case 'text': return <TextPreview section={section} config={config} />
    case 'image_gallery': return <GalleryPreview section={section} />
    case 'features': return <FeaturesPreview section={section} config={config} />
    case 'stats': return <StatsPreview section={section} config={config} />
    case 'cta': return <CTAPreview section={section} config={config} />
    case 'testimonial': return <TestimonialPreview section={section} config={config} />
    case 'faq': return <FAQPreview section={section} config={config} />
    case 'video': return <VideoPreview section={section} config={config} />
    case 'contact_form': return <ContactFormPreview section={section} />
    case 'divider': return <DividerPreview config={config} />
    default:
      return (
        <div className="p-6 text-center text-gray-400 text-sm">
          <span className="text-2xl">{sType?.icon || '📦'}</span>
          <p className="mt-1">{sType?.label || section.section_type}</p>
        </div>
      )
  }
}

// Compact preview for section list
function CompactPreview({ section }: { section: SectionData }) {
  const config = section.config || {}

  if (section.section_type === 'hero') {
    const bgImage = config.background_image as string
    return (
      <div className="h-16 rounded-md overflow-hidden relative bg-gradient-to-r from-gray-800 to-gray-600">
        {bgImage && <img src={bgImage} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />}
        <div className="relative z-10 flex items-center justify-center h-full text-white text-xs font-medium opacity-80">
          {section.title || 'Hero Banner'}
        </div>
      </div>
    )
  }

  if (section.section_type === 'image_gallery') {
    const urls = section.media_urls || []
    return urls.length > 0 ? (
      <div className="flex gap-1 h-12 overflow-hidden rounded-md">
        {urls.slice(0, 4).map((url, i) => (
          <img key={i} src={url} alt="" className="h-full w-12 object-cover rounded-sm" />
        ))}
        {urls.length > 4 && <span className="flex items-center text-xs text-gray-400 px-1">+{urls.length - 4}</span>}
      </div>
    ) : <div className="h-8 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">Chưa có ảnh</div>
  }

  if (section.section_type === 'divider') {
    const style = config.style as string
    if (style === 'dots') return <div className="py-1 text-center text-gray-300">• • •</div>
    if (style === 'space') return <div className="h-4" />
    return <hr className="border-gray-200 my-1" />
  }

  // Generic: show first line of content
  if (section.content) {
    const text = section.content.replace(/<[^>]+>/g, '').trim()
    return text ? <p className="text-xs text-gray-400 truncate px-1">{text.slice(0, 80)}</p> : null
  }

  const items = config.items as Array<{title: string}> | undefined
  if (items && items.length > 0) {
    return <p className="text-xs text-gray-400 px-1">{items.length} mục: {items.slice(0, 3).map(i => i.title).join(', ')}{items.length > 3 ? '...' : ''}</p>
  }

  return null
}

// Full previews

function HeroPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const bgImage = config.background_image as string
  const alignment = (config.alignment as string) || 'center'
  const overlay = (config.overlay_opacity as number) || 50
  const height = { small: '150px', medium: '250px', large: '350px', full: '500px' }[(config.height as string) || 'large']

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900" style={{ minHeight: height }}>
      {bgImage && <img src={bgImage} className="absolute inset-0 w-full h-full object-cover" alt="" />}
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlay / 100})` }} />
      <div className={`relative z-10 flex flex-col justify-center h-full p-8 text-white ${
        alignment === 'center' ? 'items-center text-center' : alignment === 'right' ? 'items-end text-right' : 'items-start'
      }`} style={{ minHeight: height }}>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{section.title || 'Tiêu đề Hero'}</h2>
        {section.subtitle && <p className="text-sm md:text-base opacity-90 max-w-lg">{section.subtitle}</p>}
        {(config.cta_text as string) && (
          <button className="mt-4 bg-white text-gray-800 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100">
            {String(config.cta_text)}
          </button>
        )}
      </div>
    </div>
  )
}

function TextPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const maxWidth = { prose: '720px', wide: '1024px', full: '100%' }[(config.max_width as string) || 'prose']
  return (
    <div className="py-8 px-6">
      <div className="mx-auto" style={{ maxWidth }}>
        {section.title && <h3 className="text-xl font-bold text-gray-800 mb-4">{section.title}</h3>}
        {section.content ? (
          <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: section.content }} />
        ) : (
          <p className="text-gray-400 text-sm italic">Nội dung sẽ hiển thị ở đây...</p>
        )}
      </div>
    </div>
  )
}

function GalleryPreview({ section }: { section: SectionData }) {
  const urls = section.media_urls || []
  const config = section.config || {}
  const cols = parseInt(config.columns as string) || 3

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{section.title}</h3>}
      {urls.length > 0 ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {urls.map((url, i) => (
            <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <div key={i} className="aspect-[4/3] rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-2xl">🖼️</div>)}
        </div>
      )}
    </div>
  )
}

function FeaturesPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || []
  const cols = parseInt(config.columns as string) || 3
  const style = (config.style as string) || 'card'

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{section.title}</h3>}
      {section.subtitle && <p className="text-gray-500 text-sm text-center mb-6">{section.subtitle}</p>}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(cols, items.length || cols)}, 1fr)` }}>
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} className={style === 'card' ? 'bg-gray-50 rounded-xl p-5 border border-gray-100' : 'p-4 text-center'}>
            <span className="text-2xl block mb-2">{item.icon || '⭐'}</span>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">{item.title}</h4>
            <p className="text-xs text-gray-500">{item.description}</p>
          </div>
        )) : (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100 text-center">
              <span className="text-2xl block mb-2">⭐</span>
              <div className="h-3 bg-gray-200 rounded w-20 mx-auto mb-2" />
              <div className="h-2 bg-gray-100 rounded w-full" />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function StatsPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || []
  const bgClass = { primary: 'bg-primary text-white', dark: 'bg-gray-900 text-white', light: 'bg-gray-50 text-gray-800', gradient: 'bg-gradient-to-r from-primary to-emerald-600 text-white' }[(config.background as string) || 'primary']

  return (
    <div className={`py-8 px-6 ${bgClass}`}>
      {section.title && <h3 className="text-xl font-bold mb-4 text-center">{section.title}</h3>}
      <div className="grid grid-cols-4 gap-4 text-center">
        {items.length > 0 ? items.map((item, i) => (
          <div key={i}>
            <p className="text-3xl font-bold mb-1">{item.icon || item.title}</p>
            <p className="text-xs opacity-80">{item.description}</p>
          </div>
        )) : [1, 2, 3, 4].map(i => (
          <div key={i}><p className="text-3xl font-bold opacity-40">0</p><p className="text-xs opacity-60">Thống kê</p></div>
        ))}
      </div>
    </div>
  )
}

function CTAPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const bgClass = { primary: 'bg-primary', dark: 'bg-gray-900', gradient: 'bg-gradient-to-r from-primary to-emerald-600' }[(config.background as string) || 'primary']
  return (
    <div className={`py-10 px-6 text-white text-center ${bgClass}`}>
      <h3 className="text-2xl font-bold mb-2">{section.title || 'Bạn cần tư vấn?'}</h3>
      {section.subtitle && <p className="text-sm opacity-90 mb-4 max-w-md mx-auto">{section.subtitle}</p>}
      {(config.cta_text as string) && (
        <button className="bg-white text-gray-800 px-6 py-2.5 rounded-lg text-sm font-semibold">{String(config.cta_text)}</button>
      )}
    </div>
  )
}

function TestimonialPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || []
  return (
    <div className="py-8 px-6 bg-gray-50">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">{section.title}</h3>}
      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-600 italic mb-3">"{item.description}"</p>
            <p className="text-xs font-semibold text-gray-700">— {item.title}</p>
          </div>
        )) : (
          <div className="col-span-2 text-center text-gray-400 text-sm py-4">Thêm đánh giá từ khách hàng</div>
        )}
      </div>
    </div>
  )
}

function FAQPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ title: string; description: string }>) || []
  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{section.title}</h3>}
      <div className="max-w-xl mx-auto space-y-2">
        {items.length > 0 ? items.map((item, i) => (
          <details key={i} className="bg-gray-50 rounded-lg border border-gray-100">
            <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer">{item.title}</summary>
            <div className="px-4 pb-3 text-sm text-gray-500">{item.description}</div>
          </details>
        )) : (
          <div className="text-center text-gray-400 text-sm py-4">Thêm câu hỏi FAQ</div>
        )}
      </div>
    </div>
  )
}

function VideoPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const videoUrl = config.video_url as string
  const youtubeId = videoUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)?.[1]

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{section.title}</h3>}
      <div className="max-w-2xl mx-auto aspect-video rounded-xl overflow-hidden bg-gray-900">
        {youtubeId ? (
          <iframe src={`https://www.youtube.com/embed/${youtubeId}`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" allowFullScreen />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <span className="text-4xl">🎬</span>
          </div>
        )}
      </div>
      {section.subtitle && <p className="text-sm text-gray-500 text-center mt-3">{section.subtitle}</p>}
    </div>
  )
}

function ContactFormPreview({ section }: { section: SectionData }) {
  return (
    <div className="py-8 px-6 bg-gray-50">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{section.title}</h3>}
      {section.subtitle && <p className="text-sm text-gray-500 text-center mb-6">{section.subtitle}</p>}
      <div className="max-w-md mx-auto space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-white border border-gray-200 rounded-lg" />
          <div className="h-10 bg-white border border-gray-200 rounded-lg" />
        </div>
        <div className="h-10 bg-white border border-gray-200 rounded-lg" />
        <div className="h-24 bg-white border border-gray-200 rounded-lg" />
        <div className="h-10 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-medium">Gửi liên hệ</div>
      </div>
    </div>
  )
}

function DividerPreview({ config }: { config: Record<string, unknown> }) {
  const style = (config.style as string) || 'line'
  const spacing = { small: 'py-2', medium: 'py-4', large: 'py-8' }[(config.spacing as string) || 'medium']

  return (
    <div className={`px-6 ${spacing}`}>
      {style === 'line' && <hr className="border-gray-200" />}
      {style === 'dots' && <div className="text-center text-gray-300 text-lg tracking-[0.5em]">•••</div>}
      {style === 'space' && <div />}
    </div>
  )
}
