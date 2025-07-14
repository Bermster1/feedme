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

  // Generate invitation token for family
  async generateInvitationLink(familyId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Generate a unique invitation token
      const inviteToken = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Store invitation in localStorage for now (in production, this would be in database)
      const inviteData = {
        token: inviteToken,
        family_id: familyId,
        invited_by: user.id,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }
      
      // Store in localStorage (temporary solution)
      const existingInvites = JSON.parse(localStorage.getItem('family_invitations') || '[]')
      existingInvites.push(inviteData)
      localStorage.setItem('family_invitations', JSON.stringify(existingInvites))
      
      // Generate the invitation URL
      const inviteUrl = `${window.location.origin}?invite=${inviteToken}`
      
      return {
        success: true,
        inviteUrl,
        inviteToken,
        message: 'Invitation link generated successfully'
      }
    } catch (error) {
      console.error('Error generating invitation link:', error)
      throw error
    }
  },

  // Validate and get invitation data from token
  async getInvitationData(inviteToken) {
    try {
      // Get invitations from localStorage (in production, this would be from database)
      const existingInvites = JSON.parse(localStorage.getItem('family_invitations') || '[]')
      const invitation = existingInvites.find(inv => inv.token === inviteToken)
      
      if (!invitation) {
        throw new Error('Invalid invitation token')
      }
      
      // Check if invitation has expired
      if (new Date() > new Date(invitation.expires_at)) {
        throw new Error('Invitation has expired')
      }
      
      return invitation
    } catch (error) {
      console.error('Error validating invitation:', error)
      throw error
    }
  },

  // Join family using invitation token
  async joinFamilyWithInvitation(inviteToken) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get invitation data
      const invitation = await this.getInvitationData(inviteToken)
      
      // Add user as family member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert([{
          family_id: invitation.family_id,
          user_id: user.id,
          joined_via_invitation: true
        }])

      if (memberError) throw memberError

      // Mark invitation as used (remove from localStorage)
      const existingInvites = JSON.parse(localStorage.getItem('family_invitations') || '[]')
      const updatedInvites = existingInvites.filter(inv => inv.token !== inviteToken)
      localStorage.setItem('family_invitations', JSON.stringify(updatedInvites))

      return {
        success: true,
        family_id: invitation.family_id,
        message: 'Successfully joined family!'
      }
    } catch (error) {
      console.error('Error joining family with invitation:', error)
      throw error
    }
  },

  // Get family members for a family
  async getFamilyMembers(familyId) {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          user_id,
          joined_at,
          role
        `)
        .eq('family_id', familyId)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting family members:', error)
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