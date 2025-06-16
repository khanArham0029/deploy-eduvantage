import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables exist and are not placeholder values
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

if (supabaseUrl.includes('your_supabase_url_here') || supabaseAnonKey.includes('your_supabase_anon_key_here')) {
  throw new Error('Please replace the placeholder values in your .env file with your actual Supabase credentials. Copy .env.example to .env and update the values.')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Please check your VITE_SUPABASE_URL in the .env file.`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          country_of_interest: string
          field_of_study: string
          degree_level: string
          gpa: number
          budget: number
          ielts_score: number
          toefl_score: number | null
          additional_preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          country_of_interest: string
          field_of_study: string
          degree_level: string
          gpa: number
          budget: number
          ielts_score: number
          toefl_score?: number | null
          additional_preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          country_of_interest?: string
          field_of_study?: string
          degree_level?: string
          gpa?: number
          budget?: number
          ielts_score?: number
          toefl_score?: number | null
          additional_preferences?: any
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
          message_count: number
        }
        Insert: {
          user_id: string
          title?: string
        }
        Update: {
          title?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          content: string
          role: 'user' | 'assistant'
          sources: string[]
          metadata: any
          created_at: string
        }
        Insert: {
          session_id: string
          user_id: string
          content: string
          role: 'user' | 'assistant'
          sources?: string[]
          metadata?: any
        }
        Update: {
          content?: string
          sources?: string[]
          metadata?: any
        }
      }
      application_deadlines: {
        Row: {
          id: string
          user_id: string
          university_name: string
          program_name: string
          application_deadline: string
          status: 'pending' | 'submitted' | 'accepted' | 'rejected'
          priority: 'high' | 'medium' | 'low'
          notes: string
          reminder_sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          university_name: string
          program_name: string
          application_deadline: string
          status?: 'pending' | 'submitted' | 'accepted' | 'rejected'
          priority?: 'high' | 'medium' | 'low'
          notes?: string
          reminder_sent?: boolean
        }
        Update: {
          university_name?: string
          program_name?: string
          application_deadline?: string
          status?: 'pending' | 'submitted' | 'accepted' | 'rejected'
          priority?: 'high' | 'medium' | 'low'
          notes?: string
          reminder_sent?: boolean
        }
      }
      deadline_reminders: {
        Row: {
          id: string
          application_id: string
          reminder_type: '30_days' | '14_days' | '7_days' | '3_days' | '1_day'
          scheduled_date: string
          sent_at: string | null
          email_sent: boolean
          created_at: string
        }
      }
      universities: {
        Row: {
          id: string
          name: string
          country: string
          city: string
          area_description: string | null
          website_url: string | null
          contact_email: string | null
          global_ranking: number | null
          research_ranking: number | null
          student_population: number | null
          acceptance_rate: number | null
          average_tuition_fee: number | null
          extracurriculars: string | null
          created_at: string
          updated_at: string
        }
      }
      courses: {
        Row: {
          id: string
          university_id: string
          course_name: string
          department: string
          degree_type: string
          course_duration: string | null
          credit_hours: number | null
          tuition_fee: number | null
          application_deadline: string | null
          requires_ielts: boolean
          ielts_min_score: number | null
          requires_toefl: boolean
          toefl_min_score: number | null
          prerequisites: string | null
          program_url: string | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}