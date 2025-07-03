import React, { useState, useEffect } from 'react';
import { Plus, Baby, Clock, Droplets, X, Check, Edit3, Trash2, Moon, Settings } from 'lucide-react';
import { feedingService } from './feedingService';

const FeedMeApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedTime, setSelectedTime] = useState({ hour: 9, minute: 48, period: 'PM' });
  const [selectedOunces, setSelectedOunces] = useState(null);
  const [customOunces, setCustomOunces] = useState('');
  const [notes, setNotes] = useState('');

  // State for feedings and loading
  const [allFeedings, setAllFeedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for editing
  const [editingFeeding, setEditingFeeding] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  
  // Settings state
  const [babyBirthDate, setBabyBirthDate] = useState(() => {
    const saved = localStorage.getItem('babyBirthDate');
    return saved || null;
  });
  const [showSettings, setShowSettings] = useState(false);
  
  // Calculate baby's age in weeks from birth date
  const babyAgeWeeks = babyBirthDate ? 
    Math.floor((Date.now() - new Date(babyBirthDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24 * 7)) : null;

  // Load feedings from Supabase on component mount
  useEffect(() => {
    loadFeedings();
  }, []);

  const loadFeedings = async () => {
    try {
      setLoading(true);
      setError(null);
      const feedings = await feedingService.getAllFeedings();
      setAllFeedings(feedings);
    } catch (err) {
      setError('Failed to load feedings');
      console.error('Error loading feedings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = (birthDate) => {
    setBabyBirthDate(birthDate);
    localStorage.setItem('babyBirthDate', birthDate);
    setShowSettings(false);
  };

  // Get feeding day (7am to 7am cycle)
  const getFeedingDay = (date = new Date()) => {
    const feedingDate = new Date(date);
    // If it's before 7am, consider it part of previous day's feeding cycle
    if (feedingDate.getHours() < 7) {
      feedingDate.setDate(feedingDate.getDate() - 1);
    }
    return feedingDate.toISOString().split('T')[0];
  };

  // Get today's date for new feedings
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get today's feedings (7am to 7am cycle)
  const todaysFeedings = allFeedings.filter(f => {
    const feedingDateTime = new Date(`${f.date} ${f.time}`);
    return getFeedingDay(feedingDateTime) === getFeedingDay(new Date());
  });

  // Calculate time since last feeding
  const getTimeSinceLastFeeding = () => {
    try {
      if (todaysFeedings.length === 0) return "No feedings yet";
      
      const lastFeeding = todaysFeedings[0]; // Already sorted by most recent
      const lastFeedingTime = new Date(`${lastFeeding.date}T${lastFeeding.time}`);
      const now = new Date();
      const diffMs = now - lastFeedingTime;
      
      if (diffMs < 0) return "Just added";
      
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      if (hours === 0) {
        return `${minutes}m ago`;
      } else if (minutes === 0) {
        return `${hours}h ago`;
      } else {
        return `${hours}h ${minutes}m ago`;
      }
    } catch (error) {
      console.error('Error calculating time since last feeding:', error);
      return "Recently";
    }
  };
  
  // Group feedings by date for display
  const feedingsByDate = allFeedings.reduce((acc, feeding) => {
    if (!acc[feeding.date]) {
      acc[feeding.date] = [];
    }
    acc[feeding.date].push(feeding);
    return acc;
  }, {});

  // Get unique dates in reverse chronological order
  const dates = Object.keys(feedingsByDate).sort().reverse();

  const totalOunces = todaysFeedings.reduce((sum, feeding) => sum + feeding.ounces, 0);
  const timeSinceLastFeeding = getTimeSinceLastFeeding();

  const presetOunces = [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7];

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return `Today • ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return `Yesterday • ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const calculateGapBetweenFeedings = (currentFeeding, previousFeeding) => {
    if (!previousFeeding) return null;
    
    const currentTime = new Date(`${currentFeeding.date} ${currentFeeding.time}`);
    const previousTime = new Date(`${previousFeeding.date} ${previousFeeding.time}`);
    
    const diffMs = currentTime - previousTime;
    if (diffMs <= 0) return null;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  // Calculate statistics for totals screen
  const calculateStats = () => {
    try {
      if (allFeedings.length === 0) return null;

      const sortedFeedings = [...allFeedings].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB; // Oldest first
      });

      // Calculate average longest overnight stretch by analyzing each night individually
      const nightlyLongestStretches = calculateNightlyLongestStretches(sortedFeedings);
      const longestOvernightMinutes = nightlyLongestStretches.length > 0 
        ? Math.round(nightlyLongestStretches.reduce((sum, stretch) => sum + stretch, 0) / nightlyLongestStretches.length)
        : 0;

      // Calculate weekly overview data
      const weeklyOverview = calculateWeeklyOverview(sortedFeedings);
      
      // Calculate last week daily breakdown
      const lastWeekDaily = calculateLastWeekDaily(sortedFeedings);

      return {
        longestOvernight: formatDuration(longestOvernightMinutes),
        weeklyOverview,
        lastWeekDaily
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return null;
    }
  };

  // Calculate longest stretch for each individual night (7pm to 7am)
  const calculateNightlyLongestStretches = (sortedFeedings) => {
    try {
      const nightlyStretches = [];
      
      // Group feedings by night cycle (7pm to 7am next day)
      const nights = {};
      
      sortedFeedings.forEach(feeding => {
        try {
          const feedingTime = new Date(`${feeding.date}T${feeding.time}`);
          const hour = feedingTime.getHours();
          
          // Determine which night this feeding belongs to
          let nightDate;
          if (hour >= 19) {
            // After 7pm - part of this night
            nightDate = feeding.date;
          } else if (hour <= 7) {
            // Before 7am - part of previous night
            const prevDay = new Date(feeding.date + 'T00:00:00');
            prevDay.setDate(prevDay.getDate() - 1);
            nightDate = prevDay.toISOString().split('T')[0];
          } else {
            // Daytime feeding - skip for nighttime calculation
            return;
          }
          
          if (!nights[nightDate]) {
            nights[nightDate] = [];
          }
          nights[nightDate].push(feeding);
        } catch (err) {
          console.error('Error processing feeding time:', err);
        }
      });
      
      // For each night, calculate the longest gap
      Object.values(nights).forEach(nightFeedings => {
        try {
          if (nightFeedings.length < 2) return;
          
          // Sort by time within this night
          const sortedNightFeedings = nightFeedings.sort((a, b) => {
            const timeA = new Date(`${a.date}T${a.time}`);
            const timeB = new Date(`${b.date}T${b.time}`);
            return timeA - timeB;
          });
          
          let longestGapMinutes = 0;
          
          for (let i = 1; i < sortedNightFeedings.length; i++) {
            try {
              const current = sortedNightFeedings[i];
              const previous = sortedNightFeedings[i - 1];
              
              const currentTime = new Date(`${current.date}T${current.time}`);
              const previousTime = new Date(`${previous.date}T${previous.time}`);
              
              // Handle overnight gaps (previous feeding was yesterday, current is today)
              let diffMs;
              if (currentTime < previousTime) {
                // Gap crosses midnight
                const nextDay = new Date(currentTime);
                nextDay.setDate(nextDay.getDate() + 1);
                diffMs = nextDay - previousTime;
              } else {
                diffMs = currentTime - previousTime;
              }
              
              const gapMinutes = Math.floor(diffMs / (1000 * 60));
              
              // Cap at 12 hours to be realistic
              if (gapMinutes <= 720 && gapMinutes > longestGapMinutes) {
                longestGapMinutes = gapMinutes;
              }
            } catch (err) {
              console.error('Error calculating gap:', err);
            }
          }
          
          if (longestGapMinutes > 0) {
            nightlyStretches.push(longestGapMinutes);
          }
        } catch (err) {
          console.error('Error processing night feedings:', err);
        }
      });
      
      return nightlyStretches;
    } catch (error) {
      console.error('Error calculating nightly stretches:', error);
      return [];
    }
  };


  const formatDuration = (minutes) => {
    if (minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Calculate weekly overview table
  const calculateWeeklyOverview = (sortedFeedings) => {
    if (!babyAgeWeeks) return [];

    const now = new Date();
    const weeks = [];

    // Calculate up to 8 weeks based on baby's age
    const startWeek = Math.max(1, babyAgeWeeks - 7);
    
    for (let week = startWeek; week <= babyAgeWeeks; week++) {
      // Calculate date range for this week of baby's life
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (babyAgeWeeks - week) * 7);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekFeedings = sortedFeedings.filter(feeding => {
        const feedingDate = new Date(`${feeding.date} ${feeding.time}`);
        return feedingDate >= weekStart && feedingDate <= weekEnd;
      });

      if (weekFeedings.length > 0) {
        // Calculate average time between daytime feedings for this week
        const daytimeFeedings = weekFeedings.filter(feeding => {
          const feedingTime = new Date(`${feeding.date} ${feeding.time}`);
          const hour = feedingTime.getHours();
          return hour >= 7 && hour < 19; // 7am to 7pm
        });

        const daytimeGaps = [];
        for (let i = 1; i < daytimeFeedings.length; i++) {
          const current = daytimeFeedings[i];
          const previous = daytimeFeedings[i - 1];
          
          const currentTime = new Date(`${current.date} ${current.time}`);
          const previousTime = new Date(`${previous.date} ${previous.time}`);
          
          const timeDiff = currentTime - previousTime;
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          if (hoursDiff > 0 && hoursDiff <= 4) { // Max 4 hours for average
            daytimeGaps.push(Math.floor(timeDiff / (1000 * 60)));
          }
        }

        const avgDaytimeMinutes = daytimeGaps.length > 0 
          ? Math.round(daytimeGaps.reduce((sum, gap) => sum + gap, 0) / daytimeGaps.length)
          : 0;

        // Calculate average longest overnight stretch for this week
        const weekNightlyStretches = calculateNightlyLongestStretches(weekFeedings);
        const longestOvernightMinutes = weekNightlyStretches.length > 0 
          ? Math.round(weekNightlyStretches.reduce((sum, stretch) => sum + stretch, 0) / weekNightlyStretches.length)
          : 0;

        weeks.push({
          week,
          averageDaytime: formatDuration(avgDaytimeMinutes),
          longestOvernight: formatDuration(longestOvernightMinutes)
        });
      }
    }

    return weeks;
  };

  // Calculate last week daily breakdown
  const calculateLastWeekDaily = (sortedFeedings) => {
    const now = new Date();
    const days = [];

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      const dayFeedings = sortedFeedings.filter(feeding => {
        const feedingDate = new Date(`${feeding.date} ${feeding.time}`);
        return feedingDate >= date && feedingDate < nextDay;
      });

      if (dayFeedings.length > 0) {
        // Calculate average time between daytime feedings for this day
        const daytimeFeedings = dayFeedings.filter(feeding => {
          const feedingTime = new Date(`${feeding.date} ${feeding.time}`);
          const hour = feedingTime.getHours();
          return hour >= 7 && hour < 19; // 7am to 7pm
        });

        const daytimeGaps = [];
        for (let j = 1; j < daytimeFeedings.length; j++) {
          const current = daytimeFeedings[j];
          const previous = daytimeFeedings[j - 1];
          
          const currentTime = new Date(`${current.date} ${current.time}`);
          const previousTime = new Date(`${previous.date} ${previous.time}`);
          
          const timeDiff = currentTime - previousTime;
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          if (hoursDiff > 0 && hoursDiff <= 4) { // Max 4 hours for average
            daytimeGaps.push(Math.floor(timeDiff / (1000 * 60)));
          }
        }

        const avgDaytimeMinutes = daytimeGaps.length > 0 
          ? Math.round(daytimeGaps.reduce((sum, gap) => sum + gap, 0) / daytimeGaps.length)
          : 0;

        // Calculate total ounces for the day
        const totalOunces = dayFeedings.reduce((sum, feeding) => sum + feeding.ounces, 0);

        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const dayNumber = 7 - i;

        days.push({
          dayNumber,
          dayName,
          averageDaytime: formatDuration(avgDaytimeMinutes),
          totalOunces
        });
      }
    }

    return days;
  };


  const handleSaveFeeding = async () => {
    const ounces = selectedOunces || parseFloat(customOunces) || 0;
    if (ounces > 0) {
      try {
        setLoading(true);
        const hour = selectedTime.hour || 12;
        const minute = selectedTime.minute || 0;
        const timeString = `${hour}:${minute.toString().padStart(2, '0')} ${selectedTime.period}`;
        const newFeeding = {
          date: getTodayDate(),
          time: timeString,
          ounces: ounces,
          notes: notes || null
        };
        
        const savedFeeding = await feedingService.addFeeding(newFeeding);
        setAllFeedings([savedFeeding, ...allFeedings]);
        
        setSelectedOunces(null);
        setCustomOunces('');
        setNotes('');
        setCurrentScreen('home');
      } catch (err) {
        setError('Failed to save feeding');
        console.error('Error saving feeding:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancelFeeding = () => {
    setSelectedOunces(null);
    setCustomOunces('');
    setNotes('');
    setCurrentScreen('home');
    setEditingFeeding(null);
  };

  const handleEditFeeding = (feeding) => {
    setEditingFeeding(feeding);
    setSelectedOunces(feeding.ounces);
    setCustomOunces('');
    setNotes(feeding.notes || '');
    
    // Parse time
    const [time, period] = feeding.time.split(' ');
    const [hour, minute] = time.split(':');
    setSelectedTime({
      hour: parseInt(hour),
      minute: parseInt(minute),
      period: period
    });
    
    setCurrentScreen('addFeeding');
  };

  const handleDeleteFeeding = async (feedingId) => {
    if (window.confirm('Are you sure you want to delete this feeding?')) {
      try {
        setLoading(true);
        await feedingService.deleteFeeding(feedingId);
        setAllFeedings(allFeedings.filter(f => f.id !== feedingId));
      } catch (err) {
        setError('Failed to delete feeding');
        console.error('Error deleting feeding:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateFeeding = async () => {
    const ounces = selectedOunces || parseFloat(customOunces) || 0;
    if (ounces > 0 && editingFeeding) {
      try {
        setLoading(true);
        const hour = selectedTime.hour || 12;
        const minute = selectedTime.minute || 0;
        const timeString = `${hour}:${minute.toString().padStart(2, '0')} ${selectedTime.period}`;
        const updates = {
          time: timeString,
          ounces: ounces,
          notes: notes || null
        };
        
        const updatedFeeding = await feedingService.updateFeeding(editingFeeding.id, updates);
        setAllFeedings(allFeedings.map(f => f.id === editingFeeding.id ? updatedFeeding : f));
        
        setSelectedOunces(null);
        setCustomOunces('');
        setNotes('');
        setCurrentScreen('home');
        setEditingFeeding(null);
      } catch (err) {
        setError('Failed to update feeding');
        console.error('Error updating feeding:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Starbucks-style theme
  const styles = {
    app: {
      maxWidth: '28rem',
      margin: '0 auto',
      backgroundColor: '#f7f7f7',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden'
    },
    header: {
      backgroundColor: 'white',
      padding: '1rem 1rem 0 1rem',
      borderBottom: '1px solid #e5e7eb'
    },
    headerTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    headerIcon: {
      backgroundColor: '#00704a',
      padding: '0.5rem',
      borderRadius: '50%',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    tabContainer: {
      display: 'flex',
      borderBottom: '1px solid #e5e7eb'
    },
    tab: {
      flex: 1,
      padding: '1rem',
      textAlign: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s'
    },
    activeTab: {
      borderBottom: '2px solid #d4a574',
      color: '#1f2937'
    },
    inactiveTab: {
      color: '#6b7280'
    },
    balanceCard: {
      backgroundColor: 'white',
      margin: '1rem',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    balanceTitle: {
      color: '#6b7280',
      fontSize: '0.875rem',
      marginBottom: '0.5rem',
      fontWeight: '500'
    },
    balanceAmount: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    balanceUnit: {
      fontSize: '1.25rem',
      color: '#6b7280'
    },
    lastFeedingText: {
      color: '#6b7280',
      fontSize: '0.875rem',
      marginTop: '0.75rem'
    },
    addFeedingContainer: {
      padding: '0 1rem 1rem 1rem'
    },
    addFeedingBtn: {
      width: '100%',
      backgroundColor: '#00704a',
      color: 'white',
      fontWeight: '600',
      padding: '1rem 1.5rem',
      borderRadius: '50px',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      boxShadow: '0 4px 12px rgba(0, 112, 74, 0.3)',
      cursor: 'pointer',
      fontSize: '1.125rem'
    },
    feedingCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '0.75rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    feedingCardContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flex: 1
    },
    feedingCardActions: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      padding: '0.5rem',
      borderRadius: '6px',
      cursor: 'pointer',
      color: '#6b7280',
      transition: 'all 0.2s'
    },
    formContainer: {
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      paddingBottom: '6rem'
    },
    formSection: {
      display: 'flex',
      flexDirection: 'column'
    },
    formLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
      fontSize: '1.125rem',
      fontWeight: '500',
      color: '#1f2937'
    },
    timeButton: {
      backgroundColor: '#eff6ff',
      padding: '1rem',
      borderRadius: '0.75rem',
      border: '2px solid #bfdbfe',
      width: '100%',
      cursor: 'pointer',
      textAlign: 'center'
    },
    timeButtonText: {
      color: '#2563eb',
      fontSize: '0.875rem',
      marginBottom: '0.5rem'
    },
    timeButtonTime: {
      color: '#1d4ed8',
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    presetGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    presetBtn: {
      padding: '0.75rem 0.5rem',
      borderRadius: '0.5rem',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    presetBtnSelected: {
      backgroundColor: '#f43f5e',
      color: 'white'
    },
    presetBtnUnselected: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    input: {
      width: '100%',
      padding: '1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.75rem',
      fontSize: '1.125rem',
      position: 'relative'
    },
    actionButtons: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb',
      padding: '1rem'
    },
    buttonContainer: {
      maxWidth: '28rem',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },
    primaryBtn: {
      width: '100%',
      backgroundColor: '#00704a',
      color: 'white',
      fontWeight: '600',
      padding: '1rem 1.5rem',
      borderRadius: '50px',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      boxShadow: '0 4px 12px rgba(0, 112, 74, 0.3)',
      cursor: 'pointer',
      fontSize: '1.125rem'
    },
    secondaryBtn: {
      width: '100%',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      fontWeight: '500',
      padding: '0.75rem 1.5rem',
      borderRadius: '0.75rem',
      border: 'none',
      cursor: 'pointer'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'flex-end'
    },
    modalContent: {
      backgroundColor: 'white',
      width: '100%',
      borderTopLeftRadius: '1.5rem',
      borderTopRightRadius: '1.5rem',
      padding: '1.5rem',
      maxHeight: '24rem'
    },
    timeControls: {
      display: 'flex',
      justifyContent: 'center',
      gap: '2rem',
      marginBottom: '1.5rem'
    },
    timeControl: {
      textAlign: 'center'
    },
    timeControlBtn: {
      fontSize: '1.5rem',
      color: '#3b82f6',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      marginBottom: '0.5rem'
    },
    timeDisplay: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: '0 1rem'
    },
    timePickerContainer: {
      backgroundColor: '#f0f0f8',
      borderRadius: '16px',
      padding: '1.5rem',
      margin: '1rem 0'
    },
    timePickerTitle: {
      color: '#8b5cf6',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '1rem',
      textAlign: 'center',
      letterSpacing: '0.05em'
    },
    timeInputRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem'
    },
    timeInputBox: {
      backgroundColor: 'white',
      border: '2px solid #8b5cf6',
      borderRadius: '12px',
      padding: '1rem',
      textAlign: 'center',
      minWidth: '80px'
    },
    timeInputLabel: {
      color: '#8b5cf6',
      fontSize: '0.75rem',
      fontWeight: '500',
      marginBottom: '0.5rem'
    },
    timeInputValue: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#5b21b6',
      background: 'none',
      border: 'none',
      textAlign: 'center',
      width: '100%'
    },
    timeColon: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#5b21b6'
    },
    periodButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    periodButton: {
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    activePeriodButton: {
      backgroundColor: '#8b5cf6',
      color: 'white',
      borderColor: '#8b5cf6'
    }
  };

  // Header Component with Starbucks-style tabs
  const Header = () => (
    <div style={styles.header}>
      <div style={styles.headerTop}>
        <div style={styles.headerIcon}>
          <Baby size={24} />
        </div>
        <h1 style={styles.headerTitle}>Feed Me</h1>
        <button 
          onClick={() => setShowSettings(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: '#6b7280'
          }}
        >
          <Settings size={24} />
        </button>
      </div>
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('home')}
          style={{
            ...styles.tab,
            ...(activeTab === 'home' ? styles.activeTab : styles.inactiveTab)
          }}
        >
          My Feedings
        </button>
        <button
          onClick={() => setActiveTab('totals')}
          style={{
            ...styles.tab,
            ...(activeTab === 'totals' ? styles.activeTab : styles.inactiveTab)
          }}
        >
          Summary
        </button>
      </div>
    </div>
  );

  // Add Feeding Screen with FULL functionality
  const AddFeedingScreen = () => (
    <div>
      {/* Header */}
      <div style={{...styles.header, justifyContent: 'space-between'}}>
        <button onClick={handleCancelFeeding} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem'}}>
          <X size={24} color="#6b7280" />
        </button>
        <h1 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1f2937'}}>
          {editingFeeding ? 'Edit Feeding' : 'Add Feeding'}
        </h1>
        <div style={{width: '40px'}}></div>
      </div>

      <div style={styles.formContainer}>
        {/* Time Selection */}
        <div style={styles.formSection}>
          <div style={styles.formLabel}>
            <Clock size={20} color="#8b5cf6" />
            <label>Feeding Time</label>
          </div>
          
          <div style={styles.timePickerContainer}>
            <p style={styles.timePickerTitle}>ENTER TIME</p>
            <div style={styles.timeInputRow}>
              <div style={styles.timeInputBox}>
                <p style={styles.timeInputLabel}>Hour</p>
                <input
                  type="text"
                  value={selectedTime.hour}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value === '') {
                      setSelectedTime(prev => ({...prev, hour: ''}));
                    } else {
                      const hour = parseInt(value);
                      if (hour <= 12) {
                        setSelectedTime(prev => ({...prev, hour: hour}));
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === '' || parseInt(value) < 1) {
                      setSelectedTime(prev => ({...prev, hour: 1}));
                    }
                  }}
                  style={styles.timeInputValue}
                  maxLength="2"
                  placeholder="12"
                />
              </div>
              <div style={styles.timeColon}>:</div>
              <div style={styles.timeInputBox}>
                <p style={styles.timeInputLabel}>Minute</p>
                <input
                  type="text"
                  value={selectedTime.minute === 0 ? '' : selectedTime.minute}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value === '') {
                      setSelectedTime(prev => ({...prev, minute: ''}));
                    } else {
                      const minute = parseInt(value);
                      if (minute <= 59) {
                        setSelectedTime(prev => ({...prev, minute: minute}));
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setSelectedTime(prev => ({...prev, minute: 0}));
                    }
                  }}
                  style={styles.timeInputValue}
                  maxLength="2"
                  placeholder="00"
                />
              </div>
              <div style={styles.periodButtons}>
                <button
                  onClick={() => setSelectedTime(prev => ({...prev, period: 'AM'}))}
                  style={{
                    ...styles.periodButton,
                    ...(selectedTime.period === 'AM' ? styles.activePeriodButton : {})
                  }}
                >
                  AM
                </button>
                <button
                  onClick={() => setSelectedTime(prev => ({...prev, period: 'PM'}))}
                  style={{
                    ...styles.periodButton,
                    ...(selectedTime.period === 'PM' ? styles.activePeriodButton : {})
                  }}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ounces Selection */}
        <div style={styles.formSection}>
          <div style={styles.formLabel}>
            <Droplets size={20} color="#3b82f6" />
            <label>Ounces</label>
            <span style={{fontSize: '0.875rem', color: '#6b7280'}}>(optional)</span>
          </div>

          {/* Preset Buttons */}
          <div style={styles.presetGrid}>
            {presetOunces.map((ounce) => (
              <button
                key={ounce}
                onClick={() => {
                  setSelectedOunces(ounce);
                  setCustomOunces('');
                }}
                style={{
                  ...styles.presetBtn,
                  ...(selectedOunces === ounce ? styles.presetBtnSelected : styles.presetBtnUnselected)
                }}
              >
                {ounce}oz
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div style={{position: 'relative'}}>
            <input
              type="number"
              step="0.1"
              placeholder="Custom amount"
              value={customOunces}
              onChange={(e) => {
                setCustomOunces(e.target.value);
                setSelectedOunces(null);
              }}
              style={styles.input}
            />
            <span style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280'
            }}>oz</span>
          </div>
        </div>

        {/* Notes Section */}
        <div style={styles.formSection}>
          <label style={{fontSize: '1.125rem', fontWeight: '500', color: '#1f2937', marginBottom: '1rem', display: 'block'}}>
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
            style={{
              ...styles.input,
              resize: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>


      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <div style={styles.buttonContainer}>
          <button
            onClick={editingFeeding ? handleUpdateFeeding : handleSaveFeeding}
            disabled={loading}
            style={{
              ...styles.primaryBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <Check size={20} />
            <span>{loading ? (editingFeeding ? 'Updating...' : 'Saving...') : (editingFeeding ? 'Update Feeding' : 'Save Feeding')}</span>
          </button>
          
          <button
            onClick={handleCancelFeeding}
            style={styles.secondaryBtn}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Home Screen with Starbucks-style design
  const HomeScreen = () => (
    <div>
      <Header />
      
      {/* Balance Card */}
      <div style={styles.balanceCard}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <p style={styles.balanceTitle}>Total Today:</p>
            <div style={styles.balanceAmount}>
              {totalOunces}
              <span style={styles.balanceUnit}>oz</span>
              <Droplets size={32} color="#d4a574" />
            </div>
          </div>
          <div style={{textAlign: 'right'}}>
            <p style={styles.balanceTitle}>Last Feeding:</p>
            <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0}}>
              {timeSinceLastFeeding}
            </p>
          </div>
        </div>
      </div>

      {/* Add Feeding Button */}
      <div style={styles.addFeedingContainer}>
        <button 
          onClick={() => setCurrentScreen('addFeeding')}
          style={styles.addFeedingBtn}
        >
          <Plus size={24} />
          <span>Add Feeding</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          margin: '1rem',
          padding: '1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          color: '#dc2626'
        }}>
          {error}
          <button 
            onClick={loadFeedings}
            style={{
              marginLeft: '0.5rem',
              color: '#dc2626',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Feeding List */}
      <div style={{padding: '0 1rem 1rem 1rem'}}>
        {loading ? (
          <div style={{textAlign: 'center', padding: '2rem 0'}}>
            <p style={{color: '#6b7280'}}>Loading feedings...</p>
          </div>
        ) : dates.length === 0 ? (
          <div style={{textAlign: 'center', padding: '2rem 0'}}>
            <Baby size={48} style={{margin: '0 auto 1rem auto', color: '#d1d5db'}} />
            <p style={{color: '#6b7280', marginBottom: '0.5rem'}}>No feedings yet</p>
            <p style={{color: '#9ca3af', fontSize: '0.875rem'}}>Tap "Add Feeding" to get started</p>
          </div>
        ) : (
          <div>
            {dates.map((date) => (
              <div key={date} style={{marginBottom: '1.5rem'}}>
                {/* Date Header */}
                <div style={{
                  padding: '0.5rem 0 0.5rem 0',
                  marginBottom: '0.75rem'
                }}>
                  <h2 style={{fontSize: '1rem', fontWeight: '600', color: '#1f2937'}}>
                    {formatDate(date)}
                  </h2>
                  <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    {feedingsByDate[date].reduce((sum, f) => sum + f.ounces, 0)} oz total
                  </p>
                </div>
                
                {/* Feedings for this date */}
                <div>
                  {feedingsByDate[date].map((feeding, index) => {
                    // Find the previous feeding chronologically across all dates
                    const allFeedingsSorted = [...allFeedings].sort((a, b) => {
                      const dateA = new Date(`${a.date} ${a.time}`);
                      const dateB = new Date(`${b.date} ${b.time}`);
                      return dateB - dateA; // Most recent first
                    });
                    
                    const currentFeedingIndex = allFeedingsSorted.findIndex(f => f.id === feeding.id);
                    
                    // For the most recent feeding (index 0), show time since now
                    // For other feedings, show gap from previous feeding
                    let gap = null;
                    if (currentFeedingIndex === 0) {
                      // This is the most recent feeding - show time since now (same as header)
                      gap = timeSinceLastFeeding !== "No feedings yet" ? timeSinceLastFeeding : null;
                    } else {
                      // This is not the most recent - show gap from previous feeding
                      const previousFeeding = allFeedingsSorted[currentFeedingIndex - 1];
                      gap = calculateGapBetweenFeedings(previousFeeding, feeding);
                    }
                    
                    return (
                      <div key={feeding.id} style={styles.feedingCard}>
                        <div style={styles.feedingCardContent}>
                          <div style={{
                            backgroundColor: '#e8f5e8',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            color: '#00704a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Baby size={20} />
                          </div>
                          <div>
                            <p style={{fontWeight: '500', color: '#1f2937'}}>
                              {feeding.ounces}oz bottle
                            </p>
                            <p style={{fontSize: '0.875rem', color: '#6b7280'}}>{feeding.time}</p>
                            {feeding.notes && (
                              <p style={{fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem'}}>
                                {feeding.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          {gap && (
                            <div style={{
                              backgroundColor: '#fdf2f8',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '9999px',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: '#be185d'
                            }}>
                              {gap}
                            </div>
                          )}
                          
                          <div style={styles.feedingCardActions}>
                            <button
                              onClick={() => handleEditFeeding(feeding)}
                              style={{...styles.actionBtn, ':hover': {backgroundColor: '#f3f4f6'}}}
                              title="Edit feeding"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteFeeding(feeding.id)}
                              style={{...styles.actionBtn, ':hover': {backgroundColor: '#fef2f2', color: '#dc2626'}}}
                              title="Delete feeding"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );


  // Totals Screen with new table layout
  const TotalsScreen = () => {
    const stats = calculateStats();

    if (!stats) {
      return (
        <div>
          <Header />
          <div style={{padding: '2rem', textAlign: 'center'}}>
            <p style={{color: '#6b7280'}}>No feeding data available yet</p>
          </div>
        </div>
      );
    }

    if (!babyAgeWeeks) {
      return (
        <div>
          <Header />
          <div style={{padding: '2rem', textAlign: 'center'}}>
            <p style={{color: '#6b7280', marginBottom: '1rem'}}>Please set your baby's age in settings</p>
            <button 
              onClick={() => setShowSettings(true)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#00704a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Open Settings
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <Header />
        
        <div style={{padding: '1rem'}}>
          {/* Highlight: Longest Nighttime Gap */}
          <div style={{
            ...styles.balanceCard,
            backgroundColor: '#f0f0ff',
            marginBottom: '1.5rem'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem'}}>
              <Moon size={24} color="#6366f1" />
              <span style={{fontSize: '1.25rem', fontWeight: '600', color: '#1f2937'}}>
                Longest Nighttime Stretch
              </span>
            </div>
            <p style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#6366f1', margin: '0 0 0.5rem 0'}}>
              {stats.longestOvernight}
            </p>
            <p style={{fontSize: '0.875rem', color: '#6b7280'}}>7 PM – 7 AM Overall</p>
          </div>

          {/* Table 1: Weekly Overview */}
          <div style={{...styles.balanceCard, marginBottom: '1.5rem'}}>
            <h3 style={{
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '1rem', 
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📊 Weekly Overview
            </h3>
            
            {stats.weeklyOverview.length > 0 ? (
              <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{backgroundColor: '#f8fafc'}}>
                      <th style={{padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem'}}>
                        Week
                      </th>
                      <th style={{padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '0.875rem'}}>
                        Average Time Between Feeds
                      </th>
                      <th style={{padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '0.875rem'}}>
                        Longest Nighttime Stretch
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.weeklyOverview.map((week, index) => (
                      <tr key={week.week} style={{borderBottom: '1px solid #e5e7eb'}}>
                        <td style={{padding: '0.75rem', color: '#1f2937', fontWeight: '500'}}>
                          Week {week.week}
                        </td>
                        <td style={{padding: '0.75rem', textAlign: 'center', color: '#374151'}}>
                          {week.averageDaytime || '—'}
                        </td>
                        <td style={{padding: '0.75rem', textAlign: 'center', color: '#6366f1', fontWeight: '500'}}>
                          {week.longestOvernight || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{color: '#6b7280', textAlign: 'center', padding: '1rem'}}>
                No weekly data available yet
              </p>
            )}
          </div>

          {/* Table 2: Last Week Daily Breakdown */}
          <div style={{...styles.balanceCard}}>
            <h3 style={{
              fontSize: '1.125rem', 
              fontWeight: '600', 
              marginBottom: '1rem', 
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📅 Last Week (Daily Breakdown)
            </h3>
            
            {stats.lastWeekDaily.length > 0 ? (
              <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{backgroundColor: '#f8fafc'}}>
                      <th style={{padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem'}}>
                        Day
                      </th>
                      <th style={{padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '0.875rem'}}>
                        Average Time Between Feeds
                      </th>
                      <th style={{padding: '0.75rem', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '0.875rem'}}>
                        Number of Ounces
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lastWeekDaily.map((day, index) => (
                      <tr key={index} style={{borderBottom: '1px solid #e5e7eb'}}>
                        <td style={{padding: '0.75rem', color: '#1f2937', fontWeight: '500'}}>
                          Day {day.dayNumber} ({day.dayName})
                        </td>
                        <td style={{padding: '0.75rem', textAlign: 'center', color: '#374151'}}>
                          {day.averageDaytime || '—'}
                        </td>
                        <td style={{padding: '0.75rem', textAlign: 'center', color: '#059669', fontWeight: '500'}}>
                          {day.totalOunces} oz
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{color: '#6b7280', textAlign: 'center', padding: '1rem'}}>
                No daily data available for the last week
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Settings Screen
  const SettingsScreen = () => {
    const [tempBirthDate, setTempBirthDate] = useState(babyBirthDate || '');

    return (
      <div style={styles.modal}>
        <div style={{
          ...styles.modalContent,
          maxHeight: 'none',
          height: 'auto',
          margin: '2rem',
          borderRadius: '12px'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: '600', margin: 0}}>Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              style={{background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem'}}
            >
              <X size={24} color="#6b7280" />
            </button>
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'block', fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem', color: '#1f2937'}}>
              When was your baby born?
            </label>
            <input
              type="date"
              value={tempBirthDate}
              onChange={(e) => setTempBirthDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
            <p style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem'}}>
              We'll automatically calculate your baby's age in weeks for feeding progression tracking.
            </p>
          </div>

          <div style={{display: 'flex', gap: '0.75rem'}}>
            <button
              onClick={() => setShowSettings(false)}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => saveSettings(tempBirthDate)}
              disabled={!tempBirthDate}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: tempBirthDate ? '#00704a' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: tempBirthDate ? 'pointer' : 'not-allowed'
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main App Render
  return (
    <div style={styles.app}>
      {showSettings && <SettingsScreen />}
      {currentScreen === 'addFeeding' ? (
        <AddFeedingScreen />
      ) : (
        <>
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'totals' && <TotalsScreen />}
        </>
      )}
    </div>
  );
};

export default FeedMeApp;
