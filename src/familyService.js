import { supabase } from './supabaseClient'

export const familyService = {
  // Get all families and babies for current user
  async getUserFamiliesAndBabies() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('family_members')
        .select(`
          families!inner (
            id,
            name,
            created_by,
            created_at,
            babies (
              id,
              name,
              birth_date,
              created_at,
              archived
            )
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error
      
      // Flatten the structure for easier use
      const result = {
        families: data?.map(fm => fm.families) || [],
        babies: data?.flatMap(fm => 
          fm.families.babies?.map(baby => ({
            ...baby,
            family_id: fm.families.id,
            family_name: fm.families.name
          })) || []
        ) || []
      }
      
      return result
    } catch (error) {
      console.error('Error getting user families and babies:', error)
      throw error
    }
  },

  // Create a new family (first time user or new family)
  async createFamily(familyName) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert([{
          name: familyName,
          created_by: user.id
        }])
        .select()
        .single()

      if (familyError) throw familyError

      // Add user as family member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert([{
          family_id: family.id,
          user_id: user.id
        }])

      if (memberError) throw memberError

      return family
    } catch (error) {
      console.error('Error creating family:', error)
      throw error
    }
  },

  // Add a baby to a family
  async addBaby(familyId, babyName, birthDate) {
    try {
      const { data, error } = await supabase
        .from('babies')
        .insert([{
          family_id: familyId,
          name: babyName,
          birth_date: birthDate,
          archived: false
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding baby:', error)
      throw error
    }
  },

  // Archive/unarchive a baby
  async toggleBabyArchive(babyId, archived) {
    try {
      const { data, error } = await supabase
        .from('babies')
        .update({ archived })
        .eq('id', babyId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error toggling baby archive:', error)
      throw error
    }
  },

  // Invite user to family by email
  async inviteToFamily(familyId, email) {
    try {
      // Note: This would typically send an invitation email
      // For now, we'll just add them directly if they have an account
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single()

      if (userError || !userData) {
        throw new Error('User not found. They need to sign up first.')
      }

      const { data, error } = await supabase
        .from('family_members')
        .insert([{
          family_id: familyId,
          user_id: userData.id
        }])
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error inviting to family:', error)
      throw error
    }
  },

  // Remove user from family
  async removeFromFamily(familyId, userId) {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing from family:', error)
      throw error
    }
  },

  // Leave family (remove self)
  async leaveFamily(familyId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      return this.removeFromFamily(familyId, user.id)
    } catch (error) {
      console.error('Error leaving family:', error)
      throw error
    }
  },

  // Check if archiving all babies would leave family
  async checkArchiveAllBabies(familyId) {
    try {
      const { data, error } = await supabase
        .from('babies')
        .select('id, archived')
        .eq('family_id', familyId)

      if (error) throw error
      
      // Count non-archived babies
      const activeBabies = data?.filter(baby => !baby.archived) || []
      return activeBabies.length <= 1 // Would leave 0 active babies
    } catch (error) {
      console.error('Error checking archive all babies:', error)
      throw error
    }
  }
}