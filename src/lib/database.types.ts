export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          phone: string | null
          profile_type: 'project_manager' | 'field_professional' | 'client' | 'admin'
          specialization: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          phone?: string | null
          profile_type: 'project_manager' | 'field_professional' | 'client' | 'admin'
          specialization?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          profile_type?: 'project_manager' | 'field_professional' | 'client' | 'admin'
          specialization?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          client_id: string | null
          project_manager_id: string
          status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          start_date: string | null
          end_date: string | null
          total_budget: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          client_id?: string | null
          project_manager_id: string
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          total_budget?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          client_id?: string | null
          project_manager_id?: string
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          total_budget?: number
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'manager' | 'member' | 'viewer' | 'approver'
          permissions: Json
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: 'manager' | 'member' | 'viewer' | 'approver'
          permissions?: Json
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'manager' | 'member' | 'viewer' | 'approver'
          permissions?: Json
          joined_at?: string
        }
      }
      budget_categories: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          budgeted_amount: number
          spent_amount: number
          alert_threshold: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          budgeted_amount?: number
          spent_amount?: number
          alert_threshold?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          budgeted_amount?: number
          spent_amount?: number
          alert_threshold?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          project_id: string
          category_id: string
          description: string
          supplier: string | null
          amount: number
          purchase_date: string
          receipt_url: string | null
          receipt_metadata: Json
          status: 'pending' | 'approved' | 'rejected' | 'paid'
          requested_by: string
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          notes: string | null
          tags: string[]
          priority: 'low' | 'normal' | 'high' | 'urgent'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          category_id: string
          description: string
          supplier?: string | null
          amount: number
          purchase_date?: string
          receipt_url?: string | null
          receipt_metadata?: Json
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          requested_by: string
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          notes?: string | null
          tags?: string[]
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          category_id?: string
          description?: string
          supplier?: string | null
          amount?: number
          purchase_date?: string
          receipt_url?: string | null
          receipt_metadata?: Json
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          requested_by?: string
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          notes?: string | null
          tags?: string[]
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          created_at?: string
          updated_at?: string
        }
      }
      approval_rules: {
        Row: {
          id: string
          project_id: string
          category_id: string | null
          min_amount: number
          max_amount: number | null
          approver_ids: string[]
          requires_sequential: boolean
          auto_approve_below: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          category_id?: string | null
          min_amount?: number
          max_amount?: number | null
          approver_ids: string[]
          requires_sequential?: boolean
          auto_approve_below?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          category_id?: string | null
          min_amount?: number
          max_amount?: number | null
          approver_ids?: string[]
          requires_sequential?: boolean
          auto_approve_below?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      purchase_approvals: {
        Row: {
          id: string
          purchase_id: string
          approver_id: string
          action: 'approved' | 'rejected'
          comments: string | null
          created_at: string
        }
        Insert: {
          id?: string
          purchase_id: string
          approver_id: string
          action: 'approved' | 'rejected'
          comments?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          purchase_id?: string
          approver_id?: string
          action?: 'approved' | 'rejected'
          comments?: string | null
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

