import { useState, useEffect } from 'react'
import { supabase, Database } from '../lib/supabase'
import { useAuth } from './useAuth'

type UserProfile = Database['public']['Tables']['users']['Row']

export function useUserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        throw error
      }

      setProfile(data || null)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') }

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  }
}