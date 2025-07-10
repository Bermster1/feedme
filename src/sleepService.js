import { supabase } from './supabaseClient'

export const sleepService = {
  // Get all sleep sessions for a baby
  async getBabySleepSessions(babyId) {
    try {
      const { data, error } = await supabase
        .from('sleep_sessions')
        .select('*')
        .eq('baby_id', babyId)
        .order('start_time', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching sleep sessions:', error)
      throw error
    }
  },

  // Add a new sleep session
  async addSleepSession(babyId, startTime, endTime, type, notes = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('sleep_sessions')
        .insert([{
          baby_id: babyId,
          user_id: user.id,
          start_time: startTime,
          end_time: endTime,
          type: type, // 'nap' or 'nighttime'
          notes: notes
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding sleep session:', error)
      throw error
    }
  },

  // Update a sleep session
  async updateSleepSession(sessionId, updates) {
    try {
      const { data, error } = await supabase
        .from('sleep_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating sleep session:', error)
      throw error
    }
  },

  // Delete a sleep session
  async deleteSleepSession(sessionId) {
    try {
      const { error } = await supabase
        .from('sleep_sessions')
        .delete()
        .eq('id', sessionId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting sleep session:', error)
      throw error
    }
  },

  // Get ongoing sleep session (no end time)
  async getOngoingSleepSession(babyId) {
    try {
      const { data, error } = await supabase
        .from('sleep_sessions')
        .select('*')
        .eq('baby_id', babyId)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
      
      if (error) throw error
      return data?.[0] || null
    } catch (error) {
      console.error('Error getting ongoing sleep session:', error)
      throw error
    }
  },

  // End an ongoing sleep session
  async endSleepSession(sessionId, endTime) {
    try {
      return this.updateSleepSession(sessionId, { end_time: endTime })
    } catch (error) {
      console.error('Error ending sleep session:', error)
      throw error
    }
  },

  // Calculate sleep duration in minutes
  calculateDuration(startTime, endTime) {
    try {
      const start = new Date(startTime)
      const end = new Date(endTime || new Date())
      const diffMs = end - start
      return Math.floor(diffMs / (1000 * 60)) // Convert to minutes
    } catch (error) {
      console.error('Error calculating sleep duration:', error)
      return 0
    }
  },

  // Format duration for display
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) {
      return `${hours}h`
    }
    return `${hours}h ${mins}m`
  }
}