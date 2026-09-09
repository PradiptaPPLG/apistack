export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          updated_at?: string
        }
      }
      apis: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          description: string | null
          long_description: string | null
          category: string
          tags: string[]
          base_url: string
          auth_type: 'none' | 'api_key' | 'bearer' | 'oauth2'
          auth_header: string | null
          is_public: boolean
          is_featured: boolean
          endpoint_count: number
          version: string
          documentation_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          description?: string | null
          long_description?: string | null
          category: string
          tags?: string[]
          base_url: string
          auth_type?: 'none' | 'api_key' | 'bearer' | 'oauth2'
          auth_header?: string | null
          is_public?: boolean
          is_featured?: boolean
          endpoint_count?: number
          version?: string
          documentation_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          long_description?: string | null
          category?: string
          tags?: string[]
          base_url?: string
          auth_type?: 'none' | 'api_key' | 'bearer' | 'oauth2'
          auth_header?: string | null
          is_public?: boolean
          is_featured?: boolean
          endpoint_count?: number
          version?: string
          documentation_url?: string | null
          updated_at?: string
        }
      }
      api_endpoints: {
        Row: {
          id: string
          api_id: string
          method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
          path: string
          summary: string | null
          description: string | null
          request_body: Json | null
          response_example: Json | null
          parameters: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          api_id: string
          method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
          path: string
          summary?: string | null
          description?: string | null
          request_body?: Json | null
          response_example?: Json | null
          parameters?: Json | null
          created_at?: string
        }
        Update: {
          method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
          path?: string
          summary?: string | null
          description?: string | null
          request_body?: Json | null
          response_example?: Json | null
          parameters?: Json | null
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          api_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          api_id: string
          created_at?: string
        }
        Update: never
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Api = Database['public']['Tables']['apis']['Row']
export type ApiEndpoint = Database['public']['Tables']['api_endpoints']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']

export type ApiWithOwner = Api & {
  profiles: Pick<Profile, 'display_name' | 'avatar_url' | 'email'>
}

export type ApiWithFavorite = ApiWithOwner & {
  is_favorited?: boolean
  favorites_count?: number
}
