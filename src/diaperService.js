import { supabase } from './supabaseClient'

export const diaperService = {
  // Get all diaper changes for a baby
  async getBabyDiaperChanges(babyId) {
    try {
      const { data, error } = await supabase
        .from('diaper_changes')
        .select('*')
        .eq('baby_id', babyId)
        .order('datetime', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching diaper changes:', error)
      throw error
    }
  },

  // Add a new diaper change
  async addDiaperChange(babyId, datetime, type, notes = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('diaper_changes')
        .insert([{
          baby_id: babyId,
          user_id: user.id,
          datetime: datetime,
          type: type, // 'pee', 'poo', or 'both'
          notes: notes
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding diaper change:', error)
      throw error
    }
  },

  // Update a diaper change
  async updateDiaperChange(changeId, updates) {
    try {
      const { data, error } = await supabase
        .from('diaper_changes')
        .update(updates)
        .eq('id', changeId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating diaper change:', error)
      throw error
    }
  },

  // Delete a diaper change
  async deleteDiaperChange(changeId) {
    try {
      const { error } = await supabase
        .from('diaper_changes')
        .delete()
        .eq('id', changeId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting diaper change:', error)
      throw error
    }
  },

  // Get diaper changes for a specific date
  async getDiaperChangesByDate(babyId, date) {
    try {
      const { data, error } = await supabase
        .from('diaper_changes')
        .select('*')
        .eq('baby_id', babyId)
        .gte('datetime', `${date}T00:00:00`)
        .lt('datetime', `${date}T23:59:59`)
        .order('datetime', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching diaper changes by date:', error)
      throw error
    }
  },

  // Get diaper change statistics for a date range
  async getDiaperStats(babyId, startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('diaper_changes')
        .select('type, datetime')
        .eq('baby_id', babyId)
        .gte('datetime', `${startDate}T00:00:00`)
        .lte('datetime', `${endDate}T23:59:59`)
      
      if (error) throw error
      
      const stats = {
        total: data?.length || 0,
        pee: data?.filter(d => d.type === 'pee' || d.type === 'both').length || 0,
        poo: data?.filter(d => d.type === 'poo' || d.type === 'both').length || 0,
        both: data?.filter(d => d.type === 'both').length || 0
      }
      
      return stats
    } catch (error) {
      console.error('Error calculating diaper stats:', error)
      throw error
    }
  },

  // Format diaper type for display
  formatType(type) {
    switch (type) {
      case 'pee': return '💧 Pee'
      case 'poo': return '💩 Poo'
      case 'both': return '💧💩 Both'
      default: return type
    }
  },

  // Get icon for diaper type
  getTypeIcon(type) {
    switch (type) {
      case 'pee': return '💧'
      case 'poo': return '💩'
      case 'both': return '💧💩'
      default: return '🍼'
    }
  }
}