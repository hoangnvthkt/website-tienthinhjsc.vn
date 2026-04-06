export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_title: string | null
          entity_type: string
          id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_title?: string | null
          entity_type: string
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_title?: string | null
          entity_type?: string
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      history_milestones: {
        Row: {
          id: string
          year: number
          title: string
          description: string | null
          stat_value: string | null
          stat_label: string | null
          image_url: string | null
          link_url: string | null
          color: string
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year: number
          title: string
          description?: string | null
          stat_value?: string | null
          stat_label?: string | null
          image_url?: string | null
          link_url?: string | null
          color?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          year?: number
          title?: string
          description?: string | null
          stat_value?: string | null
          stat_label?: string | null
          image_url?: string | null
          link_url?: string | null
          color?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          lang: string | null
          session_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lang?: string | null
          session_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lang?: string | null
          session_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chatbot_documents: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          embedding: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string | null
          status: string
          subject: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          description: string | null
          download_count: number
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_count?: number
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          download_count?: number
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_items: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          is_visible: boolean | null
          link_type: string
          link_value: string | null
          menu_location: string
          page_id: string | null
          parent_id: string | null
          sort_order: number | null
          target: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          link_type?: string
          link_value?: string | null
          menu_location?: string
          page_id?: string | null
          parent_id?: string | null
          sort_order?: number | null
          target?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          link_type?: string
          link_value?: string | null
          menu_location?: string
          page_id?: string | null
          parent_id?: string | null
          sort_order?: number | null
          target?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sections: {
        Row: {
          col_span: number | null
          config: Json | null
          content: string | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          media_urls: Json | null
          page_id: string
          section_type: string
          sort_order: number | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          col_span?: number | null
          config?: Json | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          media_urls?: Json | null
          page_id: string
          section_type: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          col_span?: number | null
          config?: Json | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          media_urls?: Json | null
          page_id?: string
          section_type?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          parent_id: string | null
          slug: string
          sort_order: number
          status: string
          template: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number
          status?: string
          template?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number
          status?: string
          template?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      post_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_id: string | null
          category: string
          category_id: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          published_at: string | null
          slug: string
          sort_order: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string
          category_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          slug: string
          sort_order?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string
          category_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          slug?: string
          sort_order?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "post_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          author_id: string | null
          category: string | null
          category_id: string | null
          country: string | null
          created_at: string
          description: string | null
          display_pages: string[]
          featured_image: string | null
          id: string
          images: Json | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          sort_order: number
          specs: string | null
          status: string
          subtitle: string | null
          title: string
          updated_at: string
          year: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          category_id?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          display_pages?: string[]
          featured_image?: string | null
          id?: string
          images?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          sort_order?: number
          specs?: string | null
          status?: string
          subtitle?: string | null
          title: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          category_id?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          display_pages?: string[]
          featured_image?: string | null
          id?: string
          images?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          sort_order?: number
          specs?: string | null
          status?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "project_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      section_templates: {
        Row: {
          config: Json | null
          content: string | null
          created_at: string | null
          id: string
          media_urls: Json | null
          name: string
          section_type: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          content?: string | null
          created_at?: string | null
          id?: string
          media_urls?: Json | null
          name: string
          section_type: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          content?: string | null
          created_at?: string | null
          id?: string
          media_urls?: Json | null
          name?: string
          section_type?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          label: string | null
          sort_order: number
          type: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          label?: string | null
          sort_order?: number
          type?: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          label?: string | null
          sort_order?: number
          type?: string
          updated_at?: string
          value?: string | null
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
      is_admin: { Args: never; Returns: boolean }
      match_chatbot_docs: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          category: string
          content: string
          id: string
          similarity: number
          title: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const