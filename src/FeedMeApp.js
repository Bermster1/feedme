import React, { useState, useEffect } from 'react';
import { Plus, Baby, Clock, Droplets, X, Check, Edit3, Trash2, Moon, Settings, Bed, ChevronDown } from 'lucide-react';
import { feedingService } from './feedingService';
import { sleepService } from './sleepService';
import { diaperService } from './diaperService';
import { useFamilies } from './useFamilies';
import { useAuth } from './AuthContext';
import SettingsScreen from './SettingsScreen';
import ProperIOSPicker from './ProperIOSPicker';

// Helper function to get user's local date in YYYY-MM-DD format (not UTC)
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// AddFeedingScreen component extracted outside to prevent recreation
const AddFeedingScreen = React.memo(({ 
  selectedDate, 
  setSelectedDate,
  selectedTime, 
  setSelectedTime,
  selectedOunces, 
  setSelectedOunces,
  customOunces, 
  setCustomOunces,
  notes, 
  setNotes,
  editingFeeding,
  handleCancelFeeding,
  handleSaveFeeding,
  handleUpdateFeeding,
  loading,
  styles,
  presetOunces,
  getLocalDateString,
  setShowDateTimePicker
}) => (
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
      {/* Date and Time Selection */}
      <div style={styles.formSection}>
        <div style={styles.formLabel}>
          <Clock size={20} color="#007AFF" />
          <label>Date & Time</label>
        </div>
        

        {/* Time Selection */}
        <div>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#6b7280',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🕐 <span>Time</span>
          </div>
          <button
            onClick={() => {
              console.log('Time picker button clicked!');
              setShowDateTimePicker(true);
            }}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              fontSize: '1rem',
              minHeight: '48px'
            }}
          >
            <span style={{color: '#007AFF', fontSize: '1.1rem'}}>
              {selectedTime.hour}:{selectedTime.minute.toString().padStart(2, '0')} {selectedTime.period}
            </span>
            <span style={{color: '#007AFF', fontSize: '1rem'}}>›</span>
          </button>
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
          onChange={(e) => {
            console.log('Notes onChange:', e.target.value);
            setNotes(e.target.value);
          }}
          onFocus={() => console.log('Notes field focused')}
          onBlur={() => console.log('Notes field lost focus')}
          placeholder="Any additional notes..."
          rows={3}
          style={{
            width: '100%',
            padding: '1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem',
            resize: 'none',
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            outline: 'none',
            boxSizing: 'border-box'
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
));

const FeedMeApp = () => {
  const { signOut } = useAuth();
  const { selectedBaby, activeBabies, setSelectedBaby } = useFamilies();
  
  // Production ready version - authentication integrated
  console.log('FeedMeApp loaded with multi-baby authentication - VERSION 2024-12-14-16:30 - PROPER IOS PICKER V2');

  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedTime, setSelectedTime] = useState(() => {
    const now = new Date();
    let hour = now.getHours();
    const minute = now.getMinutes();
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return { hour, minute, period };
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    return getLocalDateString(); // Use local date instead of UTC
  });
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
  const [showSettings, setShowSettings] = useState(false);
  const [showBabySelector, setShowBabySelector] = useState(false);
  
  // DateTime picker state
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  
  // Calculate baby's age in weeks from birth date
  const babyAgeWeeks = selectedBaby?.birth_date ? 
    Math.floor((Date.now() - new Date(selectedBaby.birth_date + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24 * 7)) : null;

  // Load feedings from Supabase when selected baby changes - FIXED VERSION
  useEffect(() => {
    console.log('useEffect triggered for baby:', selectedBaby?.name);
    if (selectedBaby) {
      loadFeedingsForBaby();
    } else {
      setAllFeedings([]);
      setLoading(false);
    }
  }, [selectedBaby]);

  // Force cache break - remove old legacy code references
  console.log('FeedMeApp loaded with baby:', selectedBaby?.name || 'none');

  const loadFeedingsForBaby = async () => {
    if (!selectedBaby) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const feedings = await feedingService.getBabyFeedings(selectedBaby.id);
      setAllFeedings(feedings);
    } catch (err) {
      setError('Failed to load feedings');
      console.error('Error loading feedings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFeedings = async () => {
    if (!selectedBaby) return;
    
    try {
      setLoading(true);
      setError(null);
      const feedings = await feedingService.getBabyFeedings(selectedBaby.id);
      setAllFeedings(feedings);
    } catch (err) {
      setError('Failed to load feedings');
      console.error('Error loading feedings:', err);
    } finally {
      setLoading(false);
    }
  };



  // Get current calendar date for new feedings
  const getTodayDate = () => {
    return getLocalDateString();
  };

  // Helper function to parse feeding date/time without timezone issues
  const parseFeedingDateTime = (feeding) => {
    try {
      // Parse date components manually to avoid timezone issues
      const [year, month, day] = feeding.date.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Handle time formatting
      let timeStr = feeding.time;
      if (timeStr.includes(' ')) {
        // Convert "5:10 PM" format to 24-hour
        const [time, period] = timeStr.split(' ');
        const [hour, minute] = time.split(':');
        let hour24 = parseInt(hour);
        if (period === 'PM' && hour24 !== 12) hour24 += 12;
        if (period === 'AM' && hour24 === 12) hour24 = 0;
        date.setHours(hour24, parseInt(minute), 0, 0);
      } else {
        // Already in 24-hour format
        const [hour, minute] = timeStr.split(':');
        date.setHours(parseInt(hour), parseInt(minute), 0, 0);
      }
      
      return date;
    } catch (e) {
      console.error('Error parsing feeding datetime:', e);
      return null;
    }
  };


  // Get current feeding day's feedings (7am to 7am cycle) for calculating totals
  const getCurrentFeedingDayFeedings = () => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Determine the start of the current feeding day (7am)
      const feedingDayStart = new Date(now);
      if (currentHour < 7) {
        // Before 7am - feeding day started yesterday at 7am
        feedingDayStart.setDate(now.getDate() - 1);
      }
      feedingDayStart.setHours(7, 0, 0, 0);
      
      // End of feeding day is 7am next day
      const feedingDayEnd = new Date(feedingDayStart);
      feedingDayEnd.setDate(feedingDayStart.getDate() + 1);
      
      return allFeedings.filter(f => {
        try {
          const feedingDateTime = parseFeedingDateTime(f);
          if (!feedingDateTime) return false;
          
          return feedingDateTime >= feedingDayStart && feedingDateTime < feedingDayEnd;
        } catch (error) {
          console.error('Error filtering feeding day feedings:', error);
          return false;
        }
      }).sort((a, b) => {
        // Sort by time descending (most recent first)
        try {
          const timeA = parseFeedingDateTime(a);
          const timeB = parseFeedingDateTime(b);
          return timeB - timeA; // Most recent first
        } catch (error) {
          console.error('Error sorting feeding times:', error);
          return 0;
        }
      });
    } catch (error) {
      console.error('Error getting current feeding day feedings:', error);
      return [];
    }
  };
  
  const todaysFeedings = getCurrentFeedingDayFeedings();

  // Calculate time since last feeding - find most recent feed from any day
  const getTimeSinceLastFeeding = () => {
    try {
      if (allFeedings.length === 0) return "No feedings yet";
      
      // Get the most recent feeding from all feedings (sorted by date desc, then time desc)
      const mostRecentFeeding = allFeedings[0];
      console.log('Most recent feeding:', mostRecentFeeding);
      
      // Parse the most recent feeding's date and time
      const feedingDateTime = parseFeedingDateTime(mostRecentFeeding);
      console.log('Parsed feeding date/time:', feedingDateTime);
      
      if (!feedingDateTime) {
        console.log('Failed to parse feeding date/time');
        return "Recently";
      }
      
      const now = new Date();
      console.log('Current time:', now);
      const diffMs = now - feedingDateTime;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      console.log('Diff in minutes:', diffMinutes);
      
      if (diffMinutes < 0) {
        console.log('Negative time difference - feeding in future');
        return "Recently"; // Future time, shouldn't happen but handle gracefully
      }
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      if (hours === 0) {
        return `${minutes}m`;
      } else if (minutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${minutes}m`;
      }
      
    } catch (error) {
      console.error('Error calculating time since last feeding:', error);
      return "Recently";
    }
  };
  
  // Group feedings by custom 7AM-7AM day cycle for home page display
  const feedingsByCustomDay = allFeedings.reduce((acc, feeding) => {
    try {
      const feedingDateTime = parseFeedingDateTime(feeding);
      if (!feedingDateTime) return acc;
      
      // Determine which "custom day" this feeding belongs to (7AM to 7AM cycle)
      const feedingHour = feedingDateTime.getHours();
      let customDayDate;
      
      if (feedingHour < 7) {
        // Before 7AM - belongs to previous day's 7am-7am cycle
        const prevDay = new Date(feedingDateTime);
        prevDay.setDate(feedingDateTime.getDate() - 1);
        customDayDate = prevDay.toISOString().split('T')[0];
      } else {
        // 7AM or later - belongs to current day's 7am-7am cycle
        // Use the calendar date as the cycle identifier
        customDayDate = feeding.date; // Use the stored calendar date, not parsed date
      }
      
      if (!acc[customDayDate]) {
        acc[customDayDate] = [];
      }
      acc[customDayDate].push(feeding);
      return acc;
    } catch (error) {
      console.error('Error grouping feeding by custom day:', error);
      return acc;
    }
  }, {});
  
  const feedingsByDate = feedingsByCustomDay;

  // Get unique dates in reverse chronological order
  const dates = Object.keys(feedingsByDate).sort().reverse();

  const totalOunces = todaysFeedings.reduce((sum, feeding) => {
    return sum + feeding.ounces;
  }, 0);
  const timeSinceLastFeeding = getTimeSinceLastFeeding();

  const presetOunces = [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7];

  // Helper function to format date for display using custom 7AM-7AM day cycle
  const formatDate = (customDayDate) => {
    console.log('formatDate called with customDayDate:', customDayDate);
    
    // Fix timezone issue by parsing date components manually
    const [year, month, day] = customDayDate.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    console.log('Parsed date object:', date);
    
    // Determine current custom day (7AM-7AM cycle)
    const now = new Date();
    const currentHour = now.getHours();
    console.log('Current time:', now, 'Current hour:', currentHour);
    
    let currentCustomDay;
    
    if (currentHour < 7) {
      // Before 7AM - current custom day started yesterday
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      currentCustomDay = getLocalDateString(yesterday);
      console.log('Before 7AM - currentCustomDay set to yesterday:', currentCustomDay);
    } else {
      // 7AM or later - current custom day is today
      currentCustomDay = getLocalDateString(now);
      console.log('7AM or later - currentCustomDay set to today:', currentCustomDay);
    }
    
    
    // Calculate previous custom day
    const prevCustomDayDate = new Date(currentCustomDay + 'T00:00:00');
    prevCustomDayDate.setDate(prevCustomDayDate.getDate() - 1);
    const previousCustomDay = getLocalDateString(prevCustomDayDate);
    console.log('Previous custom day:', previousCustomDay);
    
    if (customDayDate === currentCustomDay) {
      console.log('Showing as Today');
      return `Today • ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
    } else if (customDayDate === previousCustomDay) {
      console.log('Showing as Yesterday');
      return `Yesterday • ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;
    } else {
      console.log('Showing as regular date');
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const calculateGapBetweenFeedings = (currentFeeding, previousFeeding) => {
    try {
      if (!previousFeeding || !currentFeeding) return null;
      
      // More robust time parsing
      const currentTime = parseFeedingDateTime(currentFeeding);
      const previousTime = parseFeedingDateTime(previousFeeding);
      
      if (!currentTime || !previousTime || isNaN(currentTime) || isNaN(previousTime)) {
        return null;
      }
      
      const diffMs = currentTime - previousTime;
      if (diffMs <= 0) return null;
      
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      if (isNaN(hours) || isNaN(minutes)) return null;
      
      if (hours === 0) {
        return `${minutes}m`;
      } else if (minutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    } catch (error) {
      console.error('Error calculating gap between feedings:', error);
      return null;
    }
  };

  // Calculate statistics for totals screen
  const calculateStats = () => {
    try {
      if (allFeedings.length === 0) return null;

      const sortedFeedings = [...allFeedings].sort((a, b) => {
        const dateA = parseFeedingDateTime(a);
        const dateB = parseFeedingDateTime(b);
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
          const feedingTime = parseFeedingDateTime(feeding);
          const hour = feedingTime.getHours();
          
          // Determine which night this feeding belongs to
          let nightDate;
          if (hour >= 19) {
            // After 7pm - part of this night
            nightDate = feeding.date;
          } else if (hour <= 7) {
            // Before 7am - part of previous night
            const [year, month, day] = feeding.date.split('-');
            const prevDay = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
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
          if (nightFeedings.length === 0) return;
          
          // Sort by time within this night
          const sortedNightFeedings = nightFeedings.sort((a, b) => {
            const timeA = parseFeedingDateTime(a);
            const timeB = parseFeedingDateTime(b);
            return timeA - timeB;
          });
          
          let longestGapMinutes = 0;
          
          // Calculate gaps between consecutive feedings
          for (let i = 1; i < sortedNightFeedings.length; i++) {
            try {
              const current = sortedNightFeedings[i];
              const previous = sortedNightFeedings[i - 1];
              
              const currentTime = parseFeedingDateTime(current);
              const previousTime = parseFeedingDateTime(previous);
              
              if (!currentTime || !previousTime) continue;
              
              const diffMs = currentTime - previousTime;
              const gapMinutes = Math.floor(diffMs / (1000 * 60));
              
              // Cap at 12 hours to be realistic
              if (gapMinutes <= 720 && gapMinutes > 0 && gapMinutes > longestGapMinutes) {
                longestGapMinutes = gapMinutes;
              }
            } catch (err) {
              console.error('Error calculating gap between feedings:', err);
            }
          }
          
          // Also check gap from last night feeding to 7am (end of night period)
          if (sortedNightFeedings.length > 0) {
            try {
              const lastNightFeeding = sortedNightFeedings[sortedNightFeedings.length - 1];
              const lastFeedingTime = parseFeedingDateTime(lastNightFeeding);
              
              if (lastFeedingTime) {
                // Calculate 7am of the next day
                const nextDaySevenAm = new Date(lastFeedingTime);
                nextDaySevenAm.setDate(nextDaySevenAm.getDate() + 1);
                nextDaySevenAm.setHours(7, 0, 0, 0);
                
                // If the last feeding was before 7am, it's already part of the night
                // If it was after 7pm, calculate gap to next day 7am
                const lastFeedingHour = lastFeedingTime.getHours();
                if (lastFeedingHour >= 19) {
                  // Last feeding was after 7pm, calculate gap to 7am next day
                  const gapToSevenAm = Math.floor((nextDaySevenAm - lastFeedingTime) / (1000 * 60));
                  if (gapToSevenAm > 0 && gapToSevenAm <= 720 && gapToSevenAm > longestGapMinutes) {
                    longestGapMinutes = gapToSevenAm;
                  }
                } else if (lastFeedingHour < 7) {
                  // Last feeding was before 7am same day, calculate gap to 7am same day
                  const sameDay7Am = new Date(lastFeedingTime);
                  sameDay7Am.setHours(7, 0, 0, 0);
                  const gapToSevenAm = Math.floor((sameDay7Am - lastFeedingTime) / (1000 * 60));
                  if (gapToSevenAm > 0 && gapToSevenAm <= 720 && gapToSevenAm > longestGapMinutes) {
                    longestGapMinutes = gapToSevenAm;
                  }
                }
              }
            } catch (err) {
              console.error('Error calculating gap to 7am:', err);
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
        try {
          const feedingDate = parseFeedingDateTime(feeding);
          return feedingDate >= weekStart && feedingDate <= weekEnd;
        } catch (error) {
          console.error('Error filtering week feedings:', error);
          return false;
        }
      });

      if (weekFeedings.length > 0) {
        // Calculate average time between daytime feedings for this week
        const daytimeFeedings = weekFeedings.filter(feeding => {
          try {
            const feedingTime = parseFeedingDateTime(feeding);
            const hour = feedingTime.getHours();
            return hour >= 7 && hour < 19; // 7am to 7pm
          } catch (error) {
            console.error('Error filtering daytime feedings:', error);
            return false;
          }
        });

        const daytimeGaps = [];
        for (let i = 1; i < daytimeFeedings.length; i++) {
          try {
            const current = daytimeFeedings[i];
            const previous = daytimeFeedings[i - 1];
            
            const currentTime = parseFeedingDateTime(current);
            const previousTime = parseFeedingDateTime(previous);
            
            const timeDiff = currentTime - previousTime;
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            if (hoursDiff > 0 && hoursDiff <= 4) { // Max 4 hours for average
              daytimeGaps.push(Math.floor(timeDiff / (1000 * 60)));
            }
          } catch (error) {
            console.error('Error calculating daytime gaps:', error);
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
        try {
          const feedingDate = parseFeedingDateTime(feeding);
          return feedingDate >= date && feedingDate < nextDay;
        } catch (error) {
          console.error('Error filtering day feedings:', error);
          return false;
        }
      });

      if (dayFeedings.length > 0) {
        // Calculate average time between daytime feedings for this day
        const daytimeFeedings = dayFeedings.filter(feeding => {
          try {
            const feedingTime = parseFeedingDateTime(feeding);
            const hour = feedingTime.getHours();
            return hour >= 7 && hour < 19; // 7am to 7pm
          } catch (error) {
            console.error('Error filtering daily daytime feedings:', error);
            return false;
          }
        });

        const daytimeGaps = [];
        for (let j = 1; j < daytimeFeedings.length; j++) {
          try {
            const current = daytimeFeedings[j];
            const previous = daytimeFeedings[j - 1];
            
            const currentTime = parseFeedingDateTime(current);
            const previousTime = parseFeedingDateTime(previous);
            
            const timeDiff = currentTime - previousTime;
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            
            if (hoursDiff > 0 && hoursDiff <= 4) { // Max 4 hours for average
              daytimeGaps.push(Math.floor(timeDiff / (1000 * 60)));
            }
          } catch (error) {
            console.error('Error calculating daily daytime gaps:', error);
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
    if (!selectedBaby) return;
    
    const ounces = selectedOunces || parseFloat(customOunces) || 0;
    if (ounces > 0) {
      try {
        setLoading(true);
        const hour = selectedTime.hour || 12;
        const minute = selectedTime.minute || 0;
        const timeString = `${hour}:${minute.toString().padStart(2, '0')} ${selectedTime.period}`;
        
        // Calculate gap from previous feeding
        let gap = null;
        if (allFeedings.length > 0) {
          const lastFeeding = allFeedings[0]; // Most recent feeding
          gap = calculateGapBetweenFeedings(
            { date: getTodayDate(), time: timeString },
            lastFeeding
          );
        }
        
        const savedFeeding = await feedingService.addFeeding({
          babyId: selectedBaby.id,
          date: selectedDate,
          time: timeString,
          ounces: ounces,
          notes: notes || null,
          gap: gap
        });
        
        // Insert feeding in chronological order by actual feeding time
        const newFeedingsList = [...allFeedings, savedFeeding].sort((a, b) => {
          const timeA = parseFeedingDateTime(a);
          const timeB = parseFeedingDateTime(b);
          return timeB - timeA; // Most recent first (descending chronological order)
        });
        
        setAllFeedings(newFeedingsList);
        
        // Reset time and date to current values for next feeding
        const now = new Date();
        let currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const period = currentHour >= 12 ? 'PM' : 'AM';
        currentHour = currentHour % 12 || 12;
        setSelectedTime({ hour: currentHour, minute: currentMinute, period });
        
        // Reset date to current calendar date
        setSelectedDate(getLocalDateString(now));
        
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
    // Reset time to current time
    const now = new Date();
    let hour = now.getHours();
    const minute = now.getMinutes();
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    setSelectedTime({ hour, minute, period });
    
    // Reset date to current calendar date
    setSelectedDate(getLocalDateString());
    
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
    
    // Set the date from the feeding
    setSelectedDate(feeding.date);
    
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
        
        // Update feeding and resort chronologically by actual feeding time
        const updatedFeedingsList = allFeedings
          .map(f => f.id === editingFeeding.id ? updatedFeeding : f)
          .sort((a, b) => {
            const timeA = parseFeedingDateTime(a);
            const timeB = parseFeedingDateTime(b);
            return timeB - timeA; // Most recent first (descending chronological order)
          });
        
        setAllFeedings(updatedFeedingsList);
        
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

  // Header Component with baby selector
  const Header = () => (
    <div style={styles.header}>
      <div style={styles.headerTop}>
        <div style={styles.headerIcon}>
          <Baby size={24} />
        </div>
        
        {/* Baby Selector */}
        <div style={{flex: 1, textAlign: 'center'}}>
          {selectedBaby ? (
            <button
              onClick={() => setShowBabySelector(!showBabySelector)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 auto'
              }}
            >
              {selectedBaby.name}
              <ChevronDown size={20} />
            </button>
          ) : (
            <h1 style={styles.headerTitle}>Feed Me</h1>
          )}
          
          {/* Baby Selector Dropdown */}
          {showBabySelector && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '1rem',
              right: '1rem',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 10,
              marginTop: '0.5rem'
            }}>
              {activeBabies.map(baby => (
                <button
                  key={baby.id}
                  onClick={() => {
                    setSelectedBaby(baby);
                    setShowBabySelector(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    border: 'none',
                    backgroundColor: selectedBaby?.id === baby.id ? '#f3f4f6' : 'white',
                    cursor: 'pointer',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                >
                  {baby.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button 
          onClick={() => {
            console.log('Settings button clicked!'); // Debug log
            setShowSettings(true);
          }}
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
      
      {/* Action Buttons */}
      {selectedBaby && (
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          padding: '0 0 1rem 0'
        }}>
          <button 
            onClick={() => setCurrentScreen('addFeeding')}
            style={{
              flex: 1,
              backgroundColor: '#00704a',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <Plus size={18} />
            Add Feeding
          </button>
          <button 
            onClick={() => setCurrentScreen('addSleep')}
            style={{
              flex: 1,
              backgroundColor: '#6366f1',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            <Bed size={18} />
            Add Sleep
          </button>
        </div>
      )}
      
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('home')}
          style={{
            ...styles.tab,
            ...(activeTab === 'home' ? styles.activeTab : styles.inactiveTab)
          }}
        >
          Timeline
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


  // Home Screen with timeline design
  const HomeScreen = () => {
    if (!selectedBaby) {
      return (
        <div>
          <Header />
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <Baby size={48} style={{margin: '0 auto 1rem auto', color: '#d1d5db'}} />
            <p style={{color: '#6b7280', marginBottom: '0.5rem'}}>No baby selected</p>
            <p style={{color: '#9ca3af', fontSize: '0.875rem'}}>Please select a baby from the header</p>
          </div>
        </div>
      );
    }

    return (
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
                    // Calculate gap from the previous feeding to this feeding
                    let gap = null;
                    
                    // Get all feedings sorted chronologically (oldest first)
                    const allFeedingsSorted = [...allFeedings].sort((a, b) => {
                      try {
                        const dateA = parseFeedingDateTime(a);
                        const dateB = parseFeedingDateTime(b);
                        return dateA - dateB; // Oldest first
                      } catch (error) {
                        return 0;
                      }
                    });
                    
                    const currentFeedingIndex = allFeedingsSorted.findIndex(f => f.id === feeding.id);
                    
                    // If there's a previous feeding, calculate gap from previous to this
                    if (currentFeedingIndex > 0) {
                      const previousFeeding = allFeedingsSorted[currentFeedingIndex - 1];
                      gap = calculateGapBetweenFeedings(feeding, previousFeeding);
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
  };


  // Totals Screen with new table layout
  const TotalsScreen = () => {
    if (!selectedBaby) {
      return (
        <div>
          <Header />
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <Baby size={48} style={{margin: '0 auto 1rem auto', color: '#d1d5db'}} />
            <p style={{color: '#6b7280', marginBottom: '0.5rem'}}>No baby selected</p>
            <p style={{color: '#9ca3af', fontSize: '0.875rem'}}>Please select a baby from the header</p>
          </div>
        </div>
      );
    }

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
            <p style={{color: '#6b7280', marginBottom: '1rem'}}>Baby age calculation unavailable</p>
            <p style={{color: '#9ca3af', fontSize: '0.875rem'}}>Birth date: {selectedBaby.birth_date}</p>
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

  // Main App Render
  return (
    <div 
      style={styles.app}
      onClick={(e) => {
        // Close baby selector when clicking outside
        if (showBabySelector) {
          setShowBabySelector(false);
        }
      }}
    >
      {showSettings && <SettingsScreen onClose={() => setShowSettings(false)} />}
      {currentScreen === 'addFeeding' ? (
        <AddFeedingScreen 
          key="add-feeding-screen"
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          selectedOunces={selectedOunces}
          setSelectedOunces={setSelectedOunces}
          customOunces={customOunces}
          setCustomOunces={setCustomOunces}
          notes={notes}
          setNotes={setNotes}
          editingFeeding={editingFeeding}
          handleCancelFeeding={handleCancelFeeding}
          handleSaveFeeding={handleSaveFeeding}
          handleUpdateFeeding={handleUpdateFeeding}
          loading={loading}
          styles={styles}
          presetOunces={presetOunces}
          getLocalDateString={getLocalDateString}
          setShowDateTimePicker={setShowDateTimePicker}
        />
      ) : currentScreen === 'addSleep' ? (
        <div style={{padding: '2rem', textAlign: 'center'}}>
          <h2>Sleep Tracking</h2>
          <p style={{color: '#6b7280', marginBottom: '1rem'}}>Sleep tracking coming soon!</p>
          <button 
            onClick={() => setCurrentScreen('home')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Back to Timeline
          </button>
        </div>
      ) : (
        <>
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'totals' && <TotalsScreen />}
        </>
      )}
      
      {/* Proper iOS DateTime Picker Modal */}
      <ProperIOSPicker
        isOpen={showDateTimePicker}
        onClose={() => setShowDateTimePicker(false)}
        initialDateTime={{ date: selectedDate, time: selectedTime }}
        onSave={(result) => {
          setSelectedDate(result.date);
          setSelectedTime(result.time);
        }}
        title="Select Date & Time"
      />
      
      {/* Settings Screen */}
      {showSettings && (
        <SettingsScreen onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default FeedMeApp;
