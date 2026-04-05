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
    case 'featured_projects': return <FeaturedProjectsPreview section={section} config={config} />
    case 'partners': return <PartnersPreview section={section} config={config} />
    case 'timeline': return <TimelinePreview section={section} config={config} />
    case 'team': return <TeamPreview section={section} config={config} />
    // New premium sections
    case 'pricing': return <PricingPreview section={section} config={config} />
    case 'process_steps': return <ProcessStepsPreview section={section} config={config} />
    case 'download_box': return <DownloadBoxPreview section={section} config={config} />
    case 'before_after': return <BeforeAfterPreview section={section} config={config} />
    case 'animated_counter': return <AnimatedCounterPreview section={section} config={config} />
    case 'masonry_gallery': return <MasonryGalleryPreview section={section} />
    case 'map_section': return <MapSectionPreview section={section} config={config} />
    case 'tabs': return <TabsPreview section={section} config={config} />
    case 'latest_posts': return <LatestPostsPreview section={section} config={config} />
    case 'rich_accordion': return <RichAccordionPreview section={section} config={config} />
    case 'certifications': return <CertificationsPreview section={section} config={config} />
    case 'video_gallery': return <VideoGalleryPreview section={section} config={config} />
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

function FeaturedProjectsPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const count = (config.count as number) || 6
  const displayMode = (config.display_mode as string) || 'grid'
  const showCat = config.show_category !== false

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{section.title}</h3>}
      {section.subtitle && <p className="text-gray-500 text-sm text-center mb-6">{section.subtitle}</p>}
      <div className={displayMode === 'slider' ? 'flex gap-4 overflow-x-auto pb-2' : 'grid grid-cols-3 gap-4'}>
        {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
          <div key={i} className={`rounded-xl overflow-hidden border border-gray-100 bg-gray-50 ${displayMode === 'slider' ? 'min-w-[220px] shrink-0' : ''}`}>
            <div className="aspect-[16/10] bg-gradient-to-br from-gray-200 to-gray-300 relative flex items-center justify-center">
              <span className="text-3xl opacity-40">🏗️</span>
              {showCat && (
                <span className="absolute top-2 left-2 bg-white/90 text-[10px] font-medium px-2 py-0.5 rounded-full text-gray-600">
                  Dự án {i + 1}
                </span>
              )}
            </div>
            <div className="p-3">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5" />
              <div className="h-2 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] text-gray-400 mt-3 italic">Dự án sẽ tự động tải từ cơ sở dữ liệu</p>
    </div>
  )
}

function PartnersPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const cols = parseInt(config.columns as string) || 5
  const grayscale = config.grayscale !== false
  const logos = (section.media_urls?.length || 0) > 0 ? section.media_urls : null

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">{section.title}</h3>}
      <div className="grid gap-6 items-center justify-items-center" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {logos ? logos.map((url, i) => (
          <div key={i} className="h-12 flex items-center justify-center">
            <img src={url} alt="" className={`max-h-full max-w-full object-contain ${grayscale ? 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300' : ''}`} />
          </div>
        )) : Array.from({ length: cols }).map((_, i) => (
          <div key={i} className={`w-20 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center ${grayscale ? 'grayscale' : ''}`}>
            <span className="text-xs text-gray-300 font-bold">LOGO</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimelinePreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || []
  const layout = (config.layout as string) || 'left'

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">{section.title}</h3>}
      <div className={`relative max-w-xl mx-auto ${layout === 'alternate' ? 'max-w-2xl' : ''}`}>
        {/* Vertical line */}
        <div className={`absolute ${layout === 'alternate' ? 'left-1/2' : 'left-4'} top-0 bottom-0 w-0.5 bg-gray-200`} />

        {items.length > 0 ? items.map((item, i) => (
          <div key={i} className={`relative pl-10 pb-6 last:pb-0 ${layout === 'alternate' && i % 2 === 1 ? 'ml-[50%] pl-10' : layout === 'alternate' ? 'mr-[50%] pr-10 pl-10' : ''}`}>
            {/* Dot */}
            <div className={`absolute ${layout === 'alternate' ? (i % 2 === 0 ? 'left-[calc(100%+8px)]' : 'left-[-8px]') : 'left-2.5'} top-1 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm`} />
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{item.icon || '📌'}</span>
                <p className="text-sm font-semibold text-gray-700">{item.title}</p>
              </div>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
          </div>
        )) : (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="relative pl-10 pb-6 last:pb-0">
                <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm" />
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-2 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function TeamPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || []
  const cols = parseInt(config.columns as string) || 3

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{section.title}</h3>}
      {section.subtitle && <p className="text-gray-500 text-sm text-center mb-6">{section.subtitle}</p>}
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(cols, items.length || cols)}, 1fr)` }}>
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mx-auto mb-3 flex items-center justify-center text-2xl">
              {item.icon || '👤'}
            </div>
            <p className="text-sm font-semibold text-gray-700">{item.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
          </div>
        )) : (
          [1, 2, 3].map(i => (
            <div key={i} className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 mx-auto mb-3 flex items-center justify-center text-2xl">👤</div>
              <div className="h-3 bg-gray-200 rounded w-20 mx-auto mb-1.5" />
              <div className="h-2 bg-gray-100 rounded w-16 mx-auto" />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ===== NEW PREMIUM SECTION PREVIEWS =====

function PricingPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ title: string; description: string; icon?: string }>) || []
  const cols = parseInt(config.columns as string) || 3
  const highlightIdx = (config.highlight_index as number) ?? 1

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{section.title}</h3>}
      {section.subtitle && <p className="text-gray-500 text-sm text-center mb-6">{section.subtitle}</p>}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(cols, items.length || cols)}, 1fr)` }}>
        {items.length > 0 ? items.map((item, i) => (
          <div key={i} className={`rounded-xl p-5 border text-center transition-all ${
            i === highlightIdx
              ? 'bg-primary/5 border-primary shadow-lg shadow-primary/10 scale-[1.03] ring-2 ring-primary/20'
              : 'bg-white border-gray-200 hover:shadow-md'
          }`}>
            <span className="text-2xl block mb-1">{item.icon || '📦'}</span>
            <h4 className="text-sm font-bold text-gray-700 mb-1">{item.title}</h4>
            <p className="text-xs text-gray-500 mb-3">{item.description}</p>
            <button className={`w-full py-2 rounded-lg text-xs font-semibold ${
              i === highlightIdx ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
            }`}>Chọn gói</button>
          </div>
        )) : (
          [1, 2, 3].map(i => (
            <div key={i} className={`rounded-xl p-5 border text-center ${i === 2 ? 'bg-primary/5 border-primary scale-[1.03] shadow-lg shadow-primary/10' : 'bg-white border-gray-200'}`}>
              <div className="h-6 w-6 bg-gray-200 rounded-full mx-auto mb-2" />
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto mb-1" />
              <div className="h-6 bg-gray-100 rounded w-24 mx-auto mb-3" />
              <div className="h-8 bg-gray-200 rounded w-full" />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function ProcessStepsPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || []
  const isVertical = (config.style as string) === 'vertical'
  const stepItems = items.length > 0 ? items : [
    { icon: '📋', title: 'Tiếp nhận', description: 'Tiếp nhận yêu cầu' },
    { icon: '📐', title: 'Thiết kế', description: 'Thiết kế & báo giá' },
    { icon: '🏗️', title: 'Thi công', description: 'Triển khai thi công' },
    { icon: '✅', title: 'Nghiệm thu', description: 'Bàn giao & nghiệm thu' }
  ]

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{section.title}</h3>}
      {section.subtitle && <p className="text-gray-500 text-sm text-center mb-6">{section.subtitle}</p>}
      {isVertical ? (
        <div className="max-w-md mx-auto space-y-3">
          {stepItems.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-md shrink-0">{i + 1}</div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs font-semibold text-gray-700">{item.icon} {item.title}</p>
                <p className="text-[10px] text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-start">
          {stepItems.map((item, i) => (
            <div key={i} className="flex-1 text-center relative">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shadow-md mx-auto mb-2">{i + 1}</div>
              {i < stepItems.length - 1 && (
                <div className="absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5 bg-gray-200" />
              )}
              <p className="text-xs font-semibold text-gray-700">{item.icon} {item.title}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DownloadBoxPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || []
  const cols = parseInt(config.columns as string) || 2
  const dlItems = items.length > 0 ? items : [
    { title: 'Hồ sơ năng lực.pdf', description: '2.5 MB', icon: '📕' },
    { title: 'Catalogue 2024.pdf', description: '5.1 MB', icon: '📕' },
    { title: 'Bảng báo giá.xls', description: '340 KB', icon: '📗' },
    { title: 'Tiêu chuẩn kỹ thuật.doc', description: '1.2 MB', icon: '📘' }
  ]

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{section.title}</h3>}
      {section.subtitle && <p className="text-gray-500 text-sm text-center mb-6">{section.subtitle}</p>}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {dlItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group">
            <span className="text-2xl shrink-0">{item.icon || '📄'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{item.title}</p>
              <p className="text-xs text-gray-400">{item.description}</p>
            </div>
            <span className="text-gray-300 group-hover:text-primary transition-colors shrink-0">⬇️</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BeforeAfterPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const beforeImg = config.before_image as string
  const afterImg = config.after_image as string
  const beforeLabel = (config.before_label as string) || 'Trước'
  const afterLabel = (config.after_label as string) || 'Sau'
  const pos = (config.initial_position as number) || 50

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{section.title}</h3>}
      <div className="max-w-2xl mx-auto relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/10' }}>
        <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-green-400">
          {afterImg && <img src={afterImg} alt="After" className="w-full h-full object-cover" />}
          {!afterImg && <div className="w-full h-full flex items-center justify-center text-green-600 text-lg font-semibold">{'🏢'} {afterLabel}</div>}
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-orange-400" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {beforeImg && <img src={beforeImg} alt="Before" className="w-full h-full object-cover" />}
          {!beforeImg && <div className="w-full h-full flex items-center justify-center text-orange-600 text-lg font-semibold">{'🏚️'} {beforeLabel}</div>}
        </div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-xs font-bold text-gray-500">⟷</div>
        </div>
        <span className="absolute top-3 left-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">{beforeLabel}</span>
        <span className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">{afterLabel}</span>
      </div>
      {section.subtitle && <p className="text-sm text-gray-500 text-center mt-3">{section.subtitle}</p>}
    </div>
  )
}

function AnimatedCounterPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || []
  const cols = parseInt(config.columns as string) || 4
  const bgMap: Record<string, string> = {
    dark: 'bg-gray-900 text-white',
    primary: 'bg-primary text-white',
    gradient: 'bg-gradient-to-r from-gray-900 via-primary/80 to-gray-900 text-white',
    light: 'bg-gray-50 text-gray-800'
  }
  const counterItems = items.length > 0 ? items : [
    { icon: '🏗️', title: '500+', description: 'Dự án hoàn thành' },
    { icon: '📐', title: '3,000,000', description: 'm² đã thi công' },
    { icon: '👷', title: '350+', description: 'Kỹ sư & Công nhân' },
    { icon: '🌍', title: '8', description: 'Quốc gia' }
  ]

  return (
    <div className={`py-10 px-6 ${bgMap[(config.background as string) || 'dark']}`}>
      {section.title && <h3 className="text-xl font-bold mb-2 text-center">{section.title}</h3>}
      {section.subtitle && <p className="text-sm opacity-70 text-center mb-6">{section.subtitle}</p>}
      <div className="grid gap-6 text-center" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {counterItems.map((item, i) => (
          <div key={i} className="space-y-1">
            <span className="text-2xl block">{item.icon || '📊'}</span>
            <p className="text-3xl font-extrabold tracking-tight">{item.title}</p>
            <p className="text-xs opacity-70">{item.description}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] opacity-40 mt-4 italic">Số liệu sẽ có hiệu ứng đếm khi hiện trên website</p>
    </div>
  )
}

function MasonryGalleryPreview({ section }: { section: SectionData }) {
  const urls = section.media_urls || []
  const config = section.config || {}
  const cols = parseInt(config.columns as string) || 3
  const heights = ['150px', '200px', '120px', '180px', '160px', '220px']

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{section.title}</h3>}
      <div className="gap-2" style={{ columns: cols, columnGap: '8px' }}>
        {(urls.length > 0 ? urls : Array.from({ length: 6 }, () => '')).map((url, i) => (
          <div key={i} className="rounded-lg overflow-hidden bg-gray-100 mb-2 break-inside-avoid group cursor-pointer relative" style={{ height: heights[i % heights.length] }}>
            {url ? (
              <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300"><span className="text-2xl">🖼️</span></div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-lg">🔍</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MapSectionPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || []
  const mapEmbed = config.map_embed as string
  const layout = (config.layout as string) || 'map-right'
  const mapH = (config.map_height as number) || 400

  const mapPlaceholder = (
    <div className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-300">
      <div className="text-center"><span className="text-4xl block mb-2">🗺️</span><p className="text-xs text-gray-400">Nhập Google Maps Embed URL</p></div>
    </div>
  )
  const mapContent = mapEmbed
    ? <iframe src={mapEmbed} className="w-full h-full rounded-xl border-0" allowFullScreen loading="lazy" />
    : mapPlaceholder

  const locItems = items.length > 0 ? items : [
    { icon: '📍', title: 'Trụ sở Hà Nội', description: 'KCN Đông Anh, Hà Nội' },
    { icon: '📍', title: 'VP Hồ Chí Minh', description: 'Q. Bình Thạnh, TP.HCM' },
    { icon: '📍', title: 'Nhà máy Bắc Ninh', description: 'KCN Quế Võ, Bắc Ninh' }
  ]

  if (layout === 'map-full') {
    return (
      <div className="py-8 px-6">
        {section.title && <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{section.title}</h3>}
        <div style={{ height: mapH }}>{mapContent}</div>
      </div>
    )
  }

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{section.title}</h3>}
      {section.subtitle && <p className="text-gray-500 text-sm text-center mb-6">{section.subtitle}</p>}
      <div className="grid grid-cols-2 gap-6">
        <div className={layout === 'map-left' ? 'order-1' : 'order-2'} style={{ height: Math.min(mapH, 350) }}>{mapContent}</div>
        <div className={`space-y-2 ${layout === 'map-left' ? 'order-2' : 'order-1'}`}>
          {locItems.map((item, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-base shrink-0">{item.icon || '📍'}</span>
              <div><p className="text-sm font-semibold text-gray-700">{item.title}</p><p className="text-xs text-gray-500">{item.description}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabsPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || []
  const tabStyle = (config.style as string) || 'underline'
  const align = (config.alignment as string) || 'center'
  const tabItems = items.length > 0 ? items : [
    { icon: '🏗️', title: 'Nhà xưởng', description: 'Thi công kết cấu thép nhà xưởng công nghiệp với khẩu độ từ 20m đến 80m.' },
    { icon: '🌉', title: 'Cầu thép', description: 'Sản xuất và lắp đặt cầu thép, cầu dầm...' },
    { icon: '⚡', title: 'PEB', description: 'Hệ thống Pre-Engineered Building tiêu chuẩn quốc tế.' }
  ]
  const activeClass: Record<string, string> = {
    underline: 'border-b-2 border-primary text-primary',
    pill: 'bg-primary text-white rounded-full',
    boxed: 'bg-primary text-white rounded-t-lg',
  }

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{section.title}</h3>}
      <div className={`flex gap-1 mb-4 ${align === 'center' ? 'justify-center' : align === 'stretch' ? '' : 'justify-start'}`}>
        {tabItems.map((tab, i) => (
          <button key={i} className={`px-4 py-2 text-xs font-medium transition-all ${i === 0 ? activeClass[tabStyle] : 'text-gray-400 hover:text-gray-600'} ${align === 'stretch' ? 'flex-1' : ''}`}>
            {tab.icon && <span className="mr-1">{tab.icon}</span>}{tab.title}
          </button>
        ))}
      </div>
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <p className="text-sm text-gray-600">{tabItems[0]?.description || 'Nội dung tab sẽ hiện ở đây...'}</p>
      </div>
    </div>
  )
}

function LatestPostsPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const count = (config.count as number) || 4
  const cols = parseInt(config.columns as string) || 2
  const showDate = config.show_date !== false
  const showExcerpt = config.show_excerpt !== false

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{section.title}</h3>}
      {section.subtitle && <p className="text-gray-500 text-sm text-center mb-6">{section.subtitle}</p>}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
            <div className="aspect-[16/9] bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
              <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-30 group-hover:scale-110 transition-transform">📰</span>
              <span className="absolute top-2 left-2 bg-primary text-white text-[9px] px-2 py-0.5 rounded-full font-medium">Tin tức</span>
            </div>
            <div className="p-4">
              {showDate && <p className="text-[10px] text-gray-400 mb-1">01/04/2024</p>}
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
              {showExcerpt && <div className="h-2 bg-gray-100 rounded w-full" />}
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] text-gray-400 mt-3 italic">Bài viết sẽ tự động tải từ cơ sở dữ liệu</p>
    </div>
  )
}

function RichAccordionPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || []
  const style = (config.style as string) || 'bordered'
  const iconPos = (config.icon_position as string) || 'left'
  const wrapClass: Record<string, string> = {
    bordered: 'border border-gray-200 divide-y divide-gray-200 rounded-xl overflow-hidden',
    separated: 'space-y-2',
    minimal: 'divide-y divide-gray-100',
  }
  const itemClass: Record<string, string> = {
    bordered: '', separated: 'border border-gray-200 rounded-xl overflow-hidden', minimal: '',
  }
  const accItems = items.length > 0 ? items : [
    { icon: '🏗️', title: 'Năng lực sản xuất', description: 'Công suất 50,000 tấn/năm, dây chuyền tự động hóa.' },
    { icon: '🔧', title: 'Quy trình sản xuất', description: 'Từ thiết kế → gia công → kiểm tra → lắp đặt.' },
    { icon: '📋', title: 'Chứng nhận chất lượng', description: 'ISO 9001, ISO 14001, OHSAS 18001...' },
  ]

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{section.title}</h3>}
      {section.subtitle && <p className="text-gray-500 text-sm text-center mb-6">{section.subtitle}</p>}
      <div className={`max-w-xl mx-auto ${wrapClass[style]}`}>
        {accItems.map((item, i) => (
          <details key={i} className={itemClass[style]} open={i === 0}>
            <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50 select-none">
              {iconPos === 'left' && item.icon && <span className="text-base">{item.icon}</span>}
              <span className="flex-1">{item.title}</span>
              {iconPos === 'right' && item.icon && <span className="text-base">{item.icon}</span>}
              <span className="text-gray-400 text-xs">▼</span>
            </summary>
            <div className="px-4 pb-3 text-sm text-gray-500">{item.description}</div>
          </details>
        ))}
      </div>
    </div>
  )
}

function CertificationsPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || []
  const cols = parseInt(config.columns as string) || 4
  const style = (config.style as string) || 'card'
  const certItems = items.length > 0 ? items : [
    { icon: '🏅', title: 'ISO 9001:2015', description: 'Quản lý chất lượng' },
    { icon: '🌿', title: 'ISO 14001', description: 'Quản lý môi trường' },
    { icon: '⚡', title: 'OHSAS 18001', description: 'An toàn lao động' },
    { icon: '🏆', title: 'Top 10 Thép Việt', description: 'Giải thưởng 2023' },
  ]

  return (
    <div className="py-8 px-6 bg-gradient-to-b from-amber-50/50 to-white">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{section.title}</h3>}
      {section.subtitle && <p className="text-gray-500 text-sm text-center mb-6">{section.subtitle}</p>}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {certItems.map((item, i) => (
          <div key={i} className={`text-center group cursor-pointer transition-all ${
            style === 'card' ? 'bg-white rounded-xl p-4 border border-amber-100 hover:shadow-lg hover:shadow-amber-100/50 hover:border-amber-200'
              : style === 'badge' ? 'p-4' : 'p-3'
          }`}>
            <div className={`text-3xl mb-2 ${style === 'badge' ? 'w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto' : ''}`}>
              {item.icon || '🏅'}
            </div>
            <h4 className="text-xs font-bold text-gray-700">{item.title}</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function VideoGalleryPreview({ section, config }: { section: SectionData; config: Record<string, unknown> }) {
  const items = (config.items as Array<{ icon?: string; title: string; description: string }>) || []
  const cols = parseInt(config.columns as string) || 3
  const getYtId = (url: string) => url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)?.[1]
  const vids = items.length > 0 ? items : [
    { title: 'Thi công nhà xưởng Samsung', description: 'https://youtube.com/watch?v=dQw4w9WgXcQ' },
    { title: 'Lắp dựng cầu thép Thanh Hóa', description: '' },
    { title: 'Giới thiệu Tiến Thịnh JSC', description: '' },
  ]

  return (
    <div className="py-8 px-6">
      {section.title && <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{section.title}</h3>}
      {section.subtitle && <p className="text-gray-500 text-sm text-center mb-6">{section.subtitle}</p>}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {vids.map((vid, i) => {
          const ytId = getYtId(vid.description || '')
          return (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-100 cursor-pointer group hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-900 relative overflow-hidden">
                {ytId ? (
                  <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center"><span className="text-3xl opacity-40">🎬</span></div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                    <span className="text-lg ml-0.5">▶</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white"><p className="text-xs font-semibold text-gray-700 truncate">{vid.title}</p></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
