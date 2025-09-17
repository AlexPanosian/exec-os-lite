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
      trips: {
        Row: {
          id: string
          user_id: string
          created_at: string
          destination: string
          country: string
          city: string
          accommodation: string | null
          start_date: string
          end_date: string
          flight_number: string | null
          departure_airport: string | null
          arrival_airport: string | null
          departure_time: string | null
          arrival_time: string | null
          notes: string | null
          status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          destination: string
          country: string
          city: string
          accommodation?: string | null
          start_date: string
          end_date: string
          flight_number?: string | null
          departure_airport?: string | null
          arrival_airport?: string | null
          departure_time?: string | null
          arrival_time?: string | null
          notes?: string | null
          status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          destination?: string
          country?: string
          city?: string
          accommodation?: string | null
          start_date?: string
          end_date?: string
          flight_number?: string | null
          departure_airport?: string | null
          arrival_airport?: string | null
          departure_time?: string | null
          arrival_time?: string | null
          notes?: string | null
          status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
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