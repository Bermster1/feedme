import { supabase } from './supabaseClient'

export const feedingService = {
  // Get all feedings for a specific baby
  async getBabyFeedings(babyId) {
    try {
      const { data, error } = await supabase
        .from('feedings')
        .select('*')
        .eq('baby_id', babyId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching baby feedings:', error)
      throw error
    }
  },

  // Get all feedings (legacy method for migration)
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('feedings')
        .insert([{
          baby_id: feeding.babyId,
          user_id: user.id,
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

  // Get feedings for a specific date and baby
  async getFeedingsByDate(babyId, date) {
    try {
      const { data, error } = await supabase
        .from('feedings')
        .select('*')
        .eq('baby_id', babyId)
        .eq('date', date)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching feedings by date:', error)
      throw error
    }
  },

  // Migration helper: Move existing feedings to a default baby
  async migrateExistingFeedings(babyId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No user found for migration - skipping')
        return []
      }

      // First check if there are any feedings to migrate
      const { data: existingFeedings, error: checkError } = await supabase
        .from('feedings')
        .select('id')
        .is('baby_id', null)
        .limit(1)

      if (checkError) {
        console.log('Error checking for existing feedings:', checkError)
        // Don't throw error - just skip migration
        return []
      }

      if (!existingFeedings || existingFeedings.length === 0) {
        console.log('No existing feedings to migrate')
        return []
      }

      // Update all feedings without baby_id to use the new baby
      const { data, error } = await supabase
        .from('feedings')
        .update({ 
          baby_id: babyId,
          user_id: user.id
        })
        .is('baby_id', null)
        .select()

      if (error) {
        console.log('Migration error (non-fatal):', error)
        // Don't throw error - migration is optional
        return []
      }
      
      console.log('Successfully migrated feedings:', data?.length || 0)
      return data || []
    } catch (error) {
      console.error('Error migrating existing feedings (non-fatal):', error)
      // Don't throw error - migration failure shouldn't prevent setup
      return []
    }
  },

  // Legacy method for backward compatibility - returns empty object
  async getUserSettings() {
    console.warn('getUserSettings is deprecated - use baby-specific data instead')
    return { baby_birth_date: null }
  },

  // Legacy saveUserSettings for compatibility
  async saveUserSettings(settings) {
    console.warn('saveUserSettings is deprecated - use family/baby management instead')
    return true
  }
}