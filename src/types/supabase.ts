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
      bookings: {
        Row: {
          id: string
          guest_id: string
          check_in_date: string
          check_out_date: string
          price: number
          notes: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          guest_id: string
          check_in_date: string
          check_out_date: string
          price: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          guest_id?: string
          check_in_date?: string
          check_out_date?: string
          price?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      guests: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          notes: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
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