import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for API routes
export const createServerClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          department: string | null
          phone: string | null
          avatar_url: string | null
          availability: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: string
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          availability?: string
        }
        Update: {
          name?: string
          email?: string
          role?: string
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          availability?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          progress: number
          status: "planning" | "in-progress" | "completed"
          due_date: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          progress?: number
          status?: "planning" | "in-progress" | "completed"
          due_date?: string | null
          owner_id: string
        }
        Update: {
          name?: string
          description?: string | null
          progress?: number
          status?: "planning" | "in-progress" | "completed"
          due_date?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: "todo" | "in-progress" | "review" | "done"
          priority: "low" | "medium" | "high"
          assignee_id: string | null
          project_id: string
          due_date: string | null
          tags: string[]
          completed_percentage: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description?: string | null
          status?: "todo" | "in-progress" | "review" | "done"
          priority?: "low" | "medium" | "high"
          assignee_id?: string | null
          project_id: string
          due_date?: string | null
          tags?: string[]
          completed_percentage?: number
          created_by: string
        }
        Update: {
          title?: string
          description?: string | null
          status?: "todo" | "in-progress" | "review" | "done"
          priority?: "low" | "medium" | "high"
          assignee_id?: string | null
          due_date?: string | null
          tags?: string[]
          completed_percentage?: number
        }
      }
    }
  }
}
