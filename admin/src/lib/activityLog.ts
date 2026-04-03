import { supabase } from './supabase'
import type { Database } from '@/types/database'

type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert']

export type ActivityAction = 'create' | 'update' | 'delete'
export type EntityType = 'project' | 'post' | 'page' | 'contact' | 'document' | 'media' | 'navigation' | 'category' | 'settings' | 'user'

export interface ActivityLog {
  id: string
  user_id: string | null
  user_email: string | null
  action: ActivityAction
  entity_type: EntityType
  entity_id: string | null
  entity_title: string | null
  details: Record<string, unknown> | null
  created_at: string
}

/**
 * Log an activity to the activity_logs table.
 * This is fire-and-forget — errors are silently logged to console.
 */
export async function logActivity(
  action: ActivityAction,
  entityType: EntityType,
  entityTitle?: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    const row: ActivityLogInsert = {
      user_id: user?.id || null,
      user_email: user?.email || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      entity_title: entityTitle || null,
      details: (details as Database['public']['Tables']['activity_logs']['Insert']['details']) || null,
    }
    await (supabase.from('activity_logs') as any).insert(row)
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}

/**
 * Fetch recent activity logs
 */
export async function fetchActivityLogs(limit = 50, offset = 0, filters?: {
  entityType?: EntityType
  action?: ActivityAction
}) {
  let query = (supabase.from('activity_logs') as any)
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (filters?.entityType) {
    query = query.eq('entity_type', filters.entityType)
  }
  if (filters?.action) {
    query = query.eq('action', filters.action)
  }

  return query
}

/**
 * Get action label in Vietnamese
 */
export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    create: 'đã tạo',
    update: 'đã cập nhật',
    delete: 'đã xóa',
  }
  return labels[action] || action
}

/**
 * Get entity type label in Vietnamese
 */
export function getEntityLabel(type: string): string {
  const labels: Record<string, string> = {
    project: 'dự án',
    post: 'bài viết',
    page: 'trang',
    contact: 'liên hệ',
    document: 'tài liệu',
    media: 'media',
    navigation: 'menu',
    category: 'danh mục',
    settings: 'cài đặt',
    user: 'người dùng',
  }
  return labels[type] || type
}
