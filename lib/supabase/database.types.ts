export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          role: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image: string | null
          parent_id: string | null
          display_order: number
          is_active: boolean
          show_in_navbar: boolean
          icon: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          show_in_navbar?: boolean
          icon?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          show_in_navbar?: boolean
          icon?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string
          image: string | null
          featured: boolean | null
          stock: number | null
          original_price: number | null
          min_price: number | null
          max_price: number | null
          in_stock: boolean | null
          is_new: boolean | null
          is_subscription: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: string
          image?: string | null
          featured?: boolean | null
          stock?: number | null
          original_price?: number | null
          min_price?: number | null
          max_price?: number | null
          in_stock?: boolean | null
          is_new?: boolean | null
          is_subscription?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          image?: string | null
          featured?: boolean | null
          stock?: number | null
          original_price?: number | null
          min_price?: number | null
          max_price?: number | null
          in_stock?: boolean | null
          is_new?: boolean | null
          is_subscription?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      streaming_plans: {
        Row: {
          id: string
          product_id: string
          name: string
          screens: number
          quality: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          screens: number
          quality: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          screens?: number
          quality?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streaming_plans_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      streaming_durations: {
        Row: {
          id: string
          plan_id: string
          name: string
          months: number
          price: number
          discount: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          plan_id: string
          name: string
          months: number
          price: number
          discount?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          plan_id?: string
          name?: string
          months?: number
          price?: number
          discount?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streaming_durations_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "streaming_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          user_email: string
          user_name: string
          order_number: string
          total_amount: number
          status: string
          payment_method: string
          payment_status: string
          shipping_address: Json | null
          created_at: string
          updated_at: string | null
          notes: string | null
          admin_notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          user_name: string
          order_number: string
          total_amount: number
          status: string
          payment_method: string
          payment_status: string
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string | null
          notes?: string | null
          admin_notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          user_name?: string
          order_number?: string
          total_amount?: number
          status?: string
          payment_method?: string
          payment_status?: string
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string | null
          notes?: string | null
          admin_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_image: string
          quantity: number
          price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_image: string
          quantity: number
          price: number
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_image?: string
          quantity?: number
          price?: number
          subtotal?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_proofs: {
        Row: {
          id: string
          order_id: string
          file_url: string
          uploaded_at: string
          notes: string | null
          verified: boolean
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          id?: string
          order_id: string
          file_url: string
          uploaded_at?: string
          notes?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          file_url?: string
          uploaded_at?: string
          notes?: string | null
          verified?: boolean
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_proofs_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_verified_by_fkey"
            columns: ["verified_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
