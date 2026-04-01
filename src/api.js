// ============================================
// API — Supabase Data Layer for Public Website
// Fetches real data from Supabase, falls back to static data
// ============================================
import { supabase } from './supabase.js'
import { products as staticProducts } from './data.js'

// Cache to avoid re-fetching
const cache = {}

/**
 * Fetch published projects from Supabase and map to the existing product format
 */
export async function fetchProjects() {
  if (cache.projects) return cache.projects

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_categories(name)')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })

    if (error || !data?.length) {
      console.warn('Using static data:', error?.message)
      return staticProducts
    }

    // Map Supabase schema → existing product format
    const mapped = data.map((p, i) => {
      const fallback = staticProducts[i % staticProducts.length]
      const imgArray = Array.isArray(p.images) ? p.images : []
      const mainImg = p.featured_image || imgArray[0] || fallback?.image || '/images/steel-warehouse.png'
      const allImages = imgArray.length ? imgArray : (p.featured_image ? [p.featured_image] : fallback?.images || ['/images/steel-warehouse.png'])

      return {
        id: p.id,
        name: p.title,
        subtitle: p.subtitle || '',
        category: p.project_categories?.name || p.category || 'Dự án',
        author: 'Tiến Thịnh JSC',
        year: p.year?.toString() || '',
        image: mainImg,
        images: allImages,
        description: p.description || '',
        specs: p.specs || '',
        variants: [],
        size: fallback?.size || { w: 200, h: 150 },
        spacePos: fallback?.spacePos || { x: 30 + Math.random() * 40, y: 20 + Math.random() * 60 },
        _raw: p,
      }
    })

    cache.projects = mapped
    return mapped
  } catch {
    console.warn('Supabase fetch failed, using static data')
    return staticProducts
  }
}

/**
 * Fetch published blog posts
 */
export async function fetchPosts() {
  if (cache.posts) return cache.posts

  try {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(12)

    cache.posts = data || []
    return cache.posts
  } catch {
    return []
  }
}

/**
 * Fetch published documents
 */
export async function fetchDocuments() {
  if (cache.documents) return cache.documents

  try {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    cache.documents = data || []
    return cache.documents
  } catch {
    return []
  }
}

/**
 * Fetch site settings
 */
export async function fetchSettings() {
  if (cache.settings) return cache.settings

  try {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')

    const map = {}
    ;(data || []).forEach(s => { map[s.key] = s.value })
    cache.settings = map
    return map
  } catch {
    return {}
  }
}

/**
 * Submit contact form to Supabase
 */
export async function submitContact(formData) {
  const { error } = await supabase
    .from('contacts')
    .insert({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      subject: formData.subject || null,
      message: formData.message,
    })

  if (error) throw error
  return true
}

/**
 * Increment document download counter
 */
export async function trackDownload(docId) {
  await supabase.rpc('increment_download', { doc_id: docId }).catch(() => {})
}

// Color mapping for material tags
function getTagColor(tag) {
  const map = {
    'Thép CT3': '#4A90A4',
    'Thép SS400': '#2F4F4F',
    'Thép SN400B': '#8B4513',
    'Thép Q345B': '#708090',
    'Thép SN490B': '#4682B4',
    'Mạ kẽm': '#C0C0C0',
    'Sơn chống gỉ': '#B22222',
    'Thép ống': '#A0A0A0',
  }
  return map[tag] || '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')
}
