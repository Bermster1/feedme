import { supabase } from './supabaseClient'

export const feedingService = {
  // Get all feedings, ordered by date and created_at descending
  async getAllFeedings() {
    try {
      const { data, error } = await supabase
        .from('feedings')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching feedings:', error)
      throw error
    }
  },

  // Add a new feeding
  async addFeeding(feeding) {
    try {
      const { data, error } = await supabase
        .from('feedings')
        .insert([{
          date: feeding.date,
          time: feeding.time,
          ounces: feeding.ounces,
          notes: feeding.notes || null,
          gap: feeding.gap || null
        }])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding feeding:', error)
      throw error
    }
  },

  // Update a feeding
  async updateFeeding(id, updates) {
    try {
      const { data, error } = await supabase
        .from('feedings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating feeding:', error)
      throw error
    }
  },

  // Delete a feeding
  async deleteFeeding(id) {
    try {
      const { error } = await supabase
        .from('feedings')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting feeding:', error)
      throw error
    }
  },

  // Get feedings for a specific date
  async getFeedingsByDate(date) {
    try {
      const { data, error } = await supabase
        .from('feedings')
        .select('*')
        .eq('date', date)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching feedings by date:', error)
      throw error
    }
  }
}