/**
 * Database types for Supabase
 * These types can be generated automatically using Supabase CLI:
 * npx supabase gen types typescript --local > src/types/database.ts
 *
 * For now, we're manually defining them based on our schema
 */

export interface Database {
  public: {
    Tables: {
      meals: {
        Row: {
          id: string
          user_id: string
          created_at: string
          raw_text: string
          calories: number | null
          protein: number | null
          carbs: number | null
          fat: number | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          raw_text: string
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          raw_text?: string
          calories?: number | null
          protein?: number | null
          carbs?: number | null
          fat?: number | null
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          created_at: string
          type: 'push' | 'pull' | 'cardio'
          completed: boolean
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          type: 'push' | 'pull' | 'cardio'
          completed?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          type?: 'push' | 'pull' | 'cardio'
          completed?: boolean
        }
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
  }
}