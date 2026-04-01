// Database types for Supabase
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'editor' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'editor' | 'viewer'
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'editor' | 'viewer'
        }
        Relationships: []
      }
      project_categories: {
        Row: {
          id: string
          name: string
          slug: string
          sort_order: number
          created_at: string
        }
        Insert: {
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          subtitle: string | null
          category_id: string | null
          category: string | null
          description: string | null
          specs: string | null
          images: string[]
          featured_image: string | null
          status: 'draft' | 'published'
          sort_order: number
          year: string | null
          author_id: string | null
          published_at: string | null
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          slug: string
          subtitle?: string | null
          category_id?: string | null
          category?: string | null
          description?: string | null
          specs?: string | null
          images?: string[]
          featured_image?: string | null
          status?: 'draft' | 'published'
          sort_order?: number
          year?: string | null
          author_id?: string | null
          published_at?: string | null
          meta_title?: string | null
          meta_description?: string | null
        }
        Update: {
          title?: string
          slug?: string
          subtitle?: string | null
          category_id?: string | null
          category?: string | null
          description?: string | null
          specs?: string | null
          images?: string[]
          featured_image?: string | null
          status?: 'draft' | 'published'
          sort_order?: number
          year?: string | null
          published_at?: string | null
          meta_title?: string | null
          meta_description?: string | null
        }
        Relationships: []
      }
      post_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          name: string
          slug: string
          description?: string | null
          sort_order?: number
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          featured_image: string | null
          category: string
          category_id: string | null
          status: 'draft' | 'published'
          author_id: string | null
          published_at: string | null
          meta_title: string | null
          meta_description: string | null
          og_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          slug: string
          excerpt?: string | null
          content?: string | null
          featured_image?: string | null
          category?: string
          category_id?: string | null
          status?: 'draft' | 'published'
          author_id?: string | null
          published_at?: string | null
          meta_title?: string | null
          meta_description?: string | null
          og_image?: string | null
        }
        Update: {
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string | null
          featured_image?: string | null
          category?: string
          category_id?: string | null
          status?: 'draft' | 'published'
          published_at?: string | null
          meta_title?: string | null
          meta_description?: string | null
          og_image?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          id: string
          title: string
          slug: string
          content: string | null
          featured_image: string | null
          meta_title: string | null
          meta_description: string | null
          og_image: string | null
          parent_id: string | null
          status: 'draft' | 'published'
          sort_order: number
          template: string | null
          author_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          slug: string
          content?: string | null
          featured_image?: string | null
          meta_title?: string | null
          meta_description?: string | null
          og_image?: string | null
          parent_id?: string | null
          status?: 'draft' | 'published'
          sort_order?: number
          template?: string | null
          author_id?: string | null
        }
        Update: {
          title?: string
          slug?: string
          content?: string | null
          featured_image?: string | null
          meta_title?: string | null
          meta_description?: string | null
          og_image?: string | null
          parent_id?: string | null
          status?: 'draft' | 'published'
          sort_order?: number
          template?: string | null
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          id: string
          page_id: string
          section_type: string
          title: string | null
          subtitle: string | null
          content: string | null
          config: Record<string, unknown>
          media_urls: string[]
          sort_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          page_id: string
          section_type: string
          title?: string | null
          subtitle?: string | null
          content?: string | null
          config?: Record<string, unknown>
          media_urls?: string[]
          sort_order?: number
          is_visible?: boolean
        }
        Update: {
          section_type?: string
          title?: string | null
          subtitle?: string | null
          content?: string | null
          config?: Record<string, unknown>
          media_urls?: string[]
          sort_order?: number
          is_visible?: boolean
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          id: string
          menu_location: string
          parent_id: string | null
          title: string
          link_type: 'custom' | 'page' | 'category'
          link_value: string | null
          page_id: string | null
          target: string
          icon: string | null
          is_visible: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          menu_location?: string
          parent_id?: string | null
          title: string
          link_type?: 'custom' | 'page' | 'category'
          link_value?: string | null
          page_id?: string | null
          target?: string
          icon?: string | null
          is_visible?: boolean
          sort_order?: number
        }
        Update: {
          menu_location?: string
          parent_id?: string | null
          title?: string
          link_type?: 'custom' | 'page' | 'category'
          link_value?: string | null
          page_id?: string | null
          target?: string
          icon?: string | null
          is_visible?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      contacts: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          subject: string | null
          message: string
          status: 'new' | 'read' | 'replied'
          created_at: string
        }
        Insert: {
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          subject?: string | null
          message: string
          status?: 'new' | 'read' | 'replied'
        }
        Update: {
          status?: 'new' | 'read' | 'replied'
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          title: string
          file_url: string
          file_type: string | null
          file_size: number | null
          download_count: number
          status: 'draft' | 'published'
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          file_url: string
          file_type?: string | null
          file_size?: number | null
          status?: 'draft' | 'published'
        }
        Update: {
          title?: string
          file_url?: string
          file_type?: string | null
          file_size?: number | null
          status?: 'draft' | 'published'
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          value: string | null
          type: 'text' | 'number' | 'json' | 'image' | 'html'
          label: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          key: string
          value?: string | null
          type?: 'text' | 'number' | 'json' | 'image' | 'html'
          label?: string | null
          sort_order?: number
        }
        Update: {
          value?: string | null
          type?: 'text' | 'number' | 'json' | 'image' | 'html'
          label?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          id: string
          file_name: string
          file_url: string
          file_type: string | null
          file_size: number | null
          alt_text: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          file_name: string
          file_url: string
          file_type?: string | null
          file_size?: number | null
          alt_text?: string | null
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          alt_text?: string | null
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          user_email: string | null
          action: string
          entity_type: string
          entity_id: string | null
          entity_title: string | null
          details: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          user_id?: string | null
          user_email?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          entity_title?: string | null
          details?: Record<string, unknown> | null
        }
        Update: {
          action?: string
          entity_type?: string
          entity_id?: string | null
          entity_title?: string | null
          details?: Record<string, unknown> | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_slug: { Args: { title: string }; Returns: string }
      increment_download: { Args: { doc_id: string }; Returns: undefined }
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Page = Database['public']['Tables']['pages']['Row']
export type PageSection = Database['public']['Tables']['page_sections']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type SiteSetting = Database['public']['Tables']['site_settings']['Row']
export type Media = Database['public']['Tables']['media']['Row']
export type ProjectCategory = Database['public']['Tables']['project_categories']['Row']
export type PostCategory = Database['public']['Tables']['post_categories']['Row']
export type NavigationItem = Database['public']['Tables']['navigation_items']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
