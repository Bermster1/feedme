import { useState, useEffect } from 'react'
import { familyService } from './familyService'
import { feedingService } from './feedingService'
import { useAuth } from './AuthContext'

export const useFamilies = () => {
  const { isAuthenticated } = useAuth()
  const [families, setFamilies] = useState([])
  const [babies, setBabies] = useState([])
  const [selectedBaby, setSelectedBaby] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load families and babies
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await familyService.getUserFamiliesAndBabies()
      setFamilies(data.families)
      setBabies(data.babies)
      
      // Auto-select baby from localStorage or first active baby
      const savedBabyId = localStorage.getItem('selectedBabyId')
      const savedBaby = data.babies.find(b => b.id === savedBabyId && !b.archived)
      const firstActiveBaby = data.babies.find(b => !b.archived)
      
      setSelectedBaby(savedBaby || firstActiveBaby || null)
    } catch (err) {
      setError('Failed to load families and babies')
      console.error('Error loading families:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    } else {
      // If not authenticated, set loading to false to prevent infinite loading
      setLoading(false)
    }
  }, [isAuthenticated])

  // Save selected baby to localStorage
  useEffect(() => {
    if (selectedBaby) {
      localStorage.setItem('selectedBabyId', selectedBaby.id)
    }
  }, [selectedBaby])

  // Create first family and baby for new users
  const createFirstFamilyAndBaby = async (babyName, birthDate) => {
    try {
      setLoading(true)
      
      // Create family with a default name
      const family = await familyService.createFamily(`${babyName}'s Family`)
      
      // Add the baby
      const baby = await familyService.addBaby(family.id, babyName, birthDate)
      
      // Migrate existing feeding data
      await feedingService.migrateExistingFeedings(baby.id)
      
      // Reload data
      await loadData()
      
      return baby
    } catch (error) {
      console.error('Error creating first family and baby:', error)
      throw error
    }
  }

  // Add a new baby
  const addBaby = async (familyId, babyName, birthDate) => {
    try {
      const baby = await familyService.addBaby(familyId, babyName, birthDate)
      await loadData() // Refresh data
      setSelectedBaby(baby) // Auto-select new baby
      return baby
    } catch (error) {
      console.error('Error adding baby:', error)
      throw error
    }
  }

  // Archive/unarchive baby
  const toggleBabyArchive = async (babyId, archived) => {
    try {
      await familyService.toggleBabyArchive(babyId, archived)
      await loadData() // Refresh data
      
      // If we archived the selected baby, select another one
      if (archived && selectedBaby?.id === babyId) {
        const activeBabies = babies.filter(b => !b.archived && b.id !== babyId)
        setSelectedBaby(activeBabies[0] || null)
      }
    } catch (error) {
      console.error('Error toggling baby archive:', error)
      throw error
    }
  }

  // Remove user from family
  const leaveFamily = async (familyId) => {
    try {
      await familyService.leaveFamily(familyId)
      await loadData() // Refresh data
    } catch (error) {
      console.error('Error leaving family:', error)
      throw error
    }
  }

  // Check if user needs to set up first baby
  const needsSetup = families.length === 0 && babies.length === 0

  // Get active (non-archived) babies
  const activeBabies = babies.filter(baby => !baby.archived)
  
  // Get archived babies
  const archivedBabies = babies.filter(baby => baby.archived)

  return {
    families,
    babies,
    activeBabies,
    archivedBabies,
    selectedBaby,
    setSelectedBaby,
    loading,
    error,
    needsSetup,
    loadData,
    createFirstFamilyAndBaby,
    addBaby,
    toggleBabyArchive,
    leaveFamily
  }
}