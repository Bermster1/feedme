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
  },

  // Save user settings (like birth date)
  async saveUserSettings(settings) {
    try {
      console.log('Saving settings to database:', settings);
      
      // First check if a record exists
      const { data: existingData, error: selectError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing settings:', selectError);
        throw selectError;
      }
      
      let result;
      if (existingData) {
        // Update existing record
        console.log('Updating existing settings record');
        const { data, error } = await supabase
          .from('user_settings')
          .update({
            baby_birth_date: settings.babyBirthDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', 1)
          .select()
          .single()
        
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        result = data;
      } else {
        // Insert new record
        console.log('Inserting new settings record');
        const { data, error } = await supabase
          .from('user_settings')
          .insert([{
            id: 1,
            baby_birth_date: settings.babyBirthDate,
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()
        
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        result = data;
      }
      
      console.log('Successfully saved settings:', result);
      return result
    } catch (error) {
      console.error('Error saving user settings:', error)
      throw error
    }
  },

  // Load user settings
  async getUserSettings() {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
      return data || null
    } catch (error) {
      console.error('Error loading user settings:', error)
      throw error
    }
  }
}