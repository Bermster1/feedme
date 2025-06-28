import React, { useState, useEffect } from 'react';
import { Plus, Baby, Clock, Droplets, X, Check, Moon } from 'lucide-react';
import { feedingService } from './feedingService';

const FeedMeApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedTime, setSelectedTime] = useState({ hour: 9, minute: 48, period: 'PM' });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedOunces, setSelectedOunces] = useState(null);
  const [customOunces, setCustomOunces] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Day');

  // State for feedings and loading
  const [allFeedings, setAllFeedings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Get today's date for new feedings
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get today's feedings
  const todaysFeedings = allFeedings.filter(f => f.date === getTodayDate());
  
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
  const timeSinceLastFeeding = todaysFeedings.length > 0 ? "Just added" : "No feedings yet";

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

  const calculateGap = (currentIndex) => {
    if (currentIndex >= todaysFeedings.length - 1) return null;
    return "2h 30m";
  };

  const totalsData = {
    Day: {
      totalOunces: totalOunces,
      averageGap: todaysFeedings.length > 1 ? '2h 30m' : '—',
      longestOvernightGap: '—'
    },
    'Week 7': {
      totalOunces: 0,
      dailyAverage: 0,
      averageGap: '—',
      longestOvernightGap: '—'
    },
    Overall: {
      totalOunces: allFeedings.reduce((sum, f) => sum + f.ounces, 0),
      dailyAverage: 0,
      averageGap: '—',
      longestOvernightGap: '—',
      weeklyBreakdown: []
    }
  };

  const handleSaveFeeding = async () => {
    const ounces = selectedOunces || parseFloat(customOunces) || 0;
    if (ounces > 0) {
      try {
        setLoading(true);
        const timeString = `${selectedTime.hour}:${selectedTime.minute.toString().padStart(2, '0')} ${selectedTime.period}`;
        const newFeeding = {
          date: getTodayDate(),
          time: timeString,
          ounces: ounces,
          notes: notes || null,
          gap: todaysFeedings.length > 0 ? calculateGap(0) : null
        };
        
        const savedFeeding = await feedingService.addFeeding(newFeeding);
        setAllFeedings([savedFeeding, ...allFeedings]);
        
        setSelectedOunces(null);
        setCustomOunces('');
        setNotes('');
        setShowTimePicker(false);
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
    setShowTimePicker(false);
    setCurrentScreen('home');
  };

  // Styles
  const styles = {
    app: {
      maxWidth: '28rem',
      margin: '0 auto',
      backgroundColor: 'white',
      minHeight: '100vh'
    },
    header: {
      backgroundColor: 'white',
      padding: '1rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem'
    },
    headerIcon: {
      backgroundColor: '#f43f5e',
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
    dailySummary: {
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      color: 'white',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    summarySection: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    summaryText: {
      color: '#dbeafe',
      fontSize: '0.875rem'
    },
    summaryNumber: {
      fontSize: '1.5rem',
      fontWeight: 'bold'
    },
    addFeedingContainer: {
      padding: '1rem'
    },
    addFeedingBtn: {
      width: '100%',
      backgroundColor: '#f43f5e',
      color: 'white',
      fontWeight: '600',
      padding: '1rem 1.5rem',
      borderRadius: '0.75rem',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      fontSize: '1.125rem'
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
      backgroundColor: '#f43f5e',
      color: 'white',
      fontWeight: '600',
      padding: '1rem 1.5rem',
      borderRadius: '0.75rem',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
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
    }
  };

  // Header Component
  const Header = () => (
    <div style={styles.header}>
      <div style={styles.headerIcon}>
        <Baby size={24} />
      </div>
      <h1 style={styles.headerTitle}>Feed Me</h1>
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
        <h1 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1f2937'}}>Add Feeding</h1>
        <div style={{width: '40px'}}></div>
      </div>

      <div style={styles.formContainer}>
        {/* Time Selection */}
        <div style={styles.formSection}>
          <div style={styles.formLabel}>
            <Clock size={20} color="#3b82f6" />
            <label>Time</label>
          </div>
          
          <button
            onClick={() => setShowTimePicker(true)}
            style={styles.timeButton}
          >
            <p style={styles.timeButtonText}>Start Time:</p>
            <p style={styles.timeButtonTime}>
              Today, {selectedTime.hour}:{selectedTime.minute.toString().padStart(2, '0')} {selectedTime.period}
            </p>
          </button>
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

      {/* Time Picker Modal */}
      {showTimePicker && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={{fontSize: '1.25rem', fontWeight: '600', textAlign: 'center', marginBottom: '1.5rem'}}>
              Start Time
            </h3>
            
            {/* Time Controls */}
            <div style={styles.timeControls}>
              {/* Hour */}
              <div style={styles.timeControl}>
                <button 
                  onClick={() => setSelectedTime(prev => ({...prev, hour: prev.hour === 12 ? 1 : prev.hour + 1}))}
                  style={styles.timeControlBtn}
                >
                  +
                </button>
                <div style={styles.timeDisplay}>{selectedTime.hour}</div>
                <button 
                  onClick={() => setSelectedTime(prev => ({...prev, hour: prev.hour === 1 ? 12 : prev.hour - 1}))}
                  style={styles.timeControlBtn}
                >
                  -
                </button>
              </div>

              <div style={{fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', alignSelf: 'center'}}>:</div>

              {/* Minute */}
              <div style={styles.timeControl}>
                <button 
                  onClick={() => setSelectedTime(prev => ({...prev, minute: prev.minute === 59 ? 0 : prev.minute + 1}))}
                  style={styles.timeControlBtn}
                >
                  +
                </button>
                <div style={styles.timeDisplay}>{selectedTime.minute.toString().padStart(2, '0')}</div>
                <button 
                  onClick={() => setSelectedTime(prev => ({...prev, minute: prev.minute === 0 ? 59 : prev.minute - 1}))}
                  style={styles.timeControlBtn}
                >
                  -
                </button>
              </div>

              {/* AM/PM */}
              <div style={styles.timeControl}>
                <button 
                  onClick={() => setSelectedTime(prev => ({...prev, period: prev.period === 'AM' ? 'PM' : 'AM'}))}
                  style={styles.timeControlBtn}
                >
                  +
                </button>
                <div style={styles.timeDisplay}>{selectedTime.period}</div>
                <button 
                  onClick={() => setSelectedTime(prev => ({...prev, period: prev.period === 'AM' ? 'PM' : 'AM'}))}
                  style={styles.timeControlBtn}
                >
                  -
                </button>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div style={{display: 'flex', gap: '1rem'}}>
              <button
                onClick={() => setShowTimePicker(false)}
                style={{flex: 1, padding: '0.75rem', color: '#6b7280', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer'}}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowTimePicker(false)}
                style={{flex: 1, padding: '0.75rem', color: '#3b82f6', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer'}}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <div style={styles.buttonContainer}>
          <button
            onClick={handleSaveFeeding}
            disabled={loading}
            style={{
              ...styles.primaryBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <Check size={20} />
            <span>{loading ? 'Saving...' : 'Save Feeding'}</span>
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

  // Home Screen (same as before)
  const HomeScreen = () => (
    <div style={{paddingBottom: '4rem'}}>
      <Header />
      
      {/* Daily Summary */}
      <div style={styles.dailySummary}>
        <div style={styles.summarySection}>
          <Droplets size={24} />
          <div>
            <p style={styles.summaryText}>Total Today</p>
            <p style={styles.summaryNumber}>{totalOunces} oz</p>
          </div>
        </div>
        <div style={{...styles.summarySection, textAlign: 'right'}}>
          <Clock size={20} />
          <div>
            <p style={styles.summaryText}>Last Feeding</p>
            <p style={{fontSize: '1.125rem', fontWeight: '600'}}>{timeSinceLastFeeding}</p>
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
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'white',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #e5e7eb',
                  marginBottom: '0.75rem'
                }}>
                  <h2 style={{fontSize: '1.125rem', fontWeight: '600', color: '#1f2937'}}>
                    {formatDate(date)}
                  </h2>
                  <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    {feedingsByDate[date].reduce((sum, f) => sum + f.ounces, 0)} oz total
                  </p>
                </div>
                
                {/* Feedings for this date */}
                <div>
                  {feedingsByDate[date].map((feeding) => (
                    <div key={feeding.id} style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                        <div style={{
                          backgroundColor: '#ffe4e6',
                          padding: '0.5rem',
                          borderRadius: '50%',
                          color: '#dc2626',
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
                        </div>
                      </div>
                      
                      {feeding.gap && (
                        <div style={{
                          backgroundColor: '#fdf2f8',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#be185d'
                        }}>
                          {feeding.gap}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Bottom Navigation
  const BottomNav = () => (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb'
    }}>
      <div style={{maxWidth: '28rem', margin: '0 auto', display: 'flex'}}>
        <button 
          onClick={() => setCurrentScreen('home')}
          style={{
            flex: 1,
            padding: '0.75rem',
            textAlign: 'center',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: currentScreen === 'home' ? '#f43f5e' : 'transparent',
            color: currentScreen === 'home' ? 'white' : '#6b7280'
          }}
        >
          Home
        </button>
        <button 
          onClick={() => setCurrentScreen('totals')}
          style={{
            flex: 1,
            padding: '0.75rem',
            textAlign: 'center',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: currentScreen === 'totals' ? '#f43f5e' : 'transparent',
            color: currentScreen === 'totals' ? 'white' : '#6b7280'
          }}
        >
          Totals
        </button>
      </div>
    </div>
  );

  // Totals Screen
  const TotalsScreen = () => (
    <div style={{paddingBottom: '4rem'}}>
      <Header />
      <div style={{padding: '2rem', textAlign: 'center'}}>
        <h2>Totals</h2>
        <p>Total feedings: {allFeedings.length}</p>
        <p>Total ounces: {allFeedings.reduce((sum, f) => sum + f.ounces, 0)} oz</p>
      </div>
    </div>
  );

  // Main App Render
  return (
    <div style={styles.app}>
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'addFeeding' && <AddFeedingScreen />}
      {currentScreen === 'totals' && <TotalsScreen />}
      
      {currentScreen !== 'addFeeding' && <BottomNav />}
    </div>
  );
};

export default FeedMeApp;
