import React, { useState, useEffect, useRef } from 'react';

const ProperIOSPicker = ({ isOpen, onClose, initialDateTime, onSave, title = "Select Date & Time" }) => {
  // Version: NATIVE_IOS_V2 - 4 columns, every minute
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  });
  const [selectedHour, setSelectedHour] = useState(() => {
    const now = new Date();
    let hour = now.getHours();
    return hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  });
  const [selectedMinute, setSelectedMinute] = useState(() => new Date().getMinutes());
  const [selectedPeriod, setSelectedPeriod] = useState(() => new Date().getHours() >= 12 ? 'PM' : 'AM');

  // Initialize with provided date/time
  useEffect(() => {
    if (initialDateTime && isOpen) {
      setSelectedDate(initialDateTime.date);
      setSelectedHour(initialDateTime.time.hour);
      setSelectedMinute(initialDateTime.time.minute);
      setSelectedPeriod(initialDateTime.time.period);
    }
  }, [initialDateTime, isOpen]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i); // Every minute 0-59
  const periods = ['AM', 'PM', 'AM', 'PM', 'AM', 'PM']; // Repeat for better scrolling experience

  // Generate date options like native iOS (Today, specific dates, etc.)
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    // Add recent dates
    for (let i = -2; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label;
      if (i === -2) label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      else if (i === -1) label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      else if (i === 0) label = 'Today';
      else if (i === 1) label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      else label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      dates.push({
        label,
        value: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
      });
    }
    
    return dates;
  };

  const dateOptions = generateDateOptions();
  
  // Debug logging
  console.log('ProperIOSPicker NATIVE_IOS_V3_FIXED loaded:', {
    dateOptions: dateOptions.length,
    minutes: minutes.length,
    hours: hours.length,
    periods: periods.length,
    timestamp: new Date().toISOString()
  });

  const handleSave = () => {
    const time = { hour: selectedHour, minute: selectedMinute, period: selectedPeriod };
    onSave({ date: selectedDate, time });
    onClose();
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end'
    },
    modal: {
      backgroundColor: '#f8f9fa',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      width: '100%',
      paddingBottom: 'env(safe-area-inset-bottom)',
      maxHeight: '70vh'
    },
    header: {
      backgroundColor: '#f8f9fa',
      padding: '1rem 1.5rem',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      borderBottom: '1px solid #e5e5e7',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    cancelButton: {
      color: '#007AFF',
      fontSize: '17px',
      fontWeight: '400',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px 0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    },
    saveButton: {
      color: '#007AFF',
      fontSize: '17px',
      fontWeight: '600',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px 0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    },
    title: {
      fontSize: '17px',
      fontWeight: '600',
      color: '#000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    },
    pickerContainer: {
      height: '260px',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      padding: '0 8px'
    },
    wheelColumn: {
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      marginRight: '4px'
    },
    dateColumn: {
      flex: 2.5, // Wider for date text
    },
    hourColumn: {
      flex: 1,
    },
    minuteColumn: {
      flex: 1,
    },
    periodColumn: {
      flex: 1,
    },
    wheelScroller: {
      height: '100%',
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      paddingTop: '110px',
      paddingBottom: '110px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitOverflowScrolling: 'touch',
      isolation: 'isolate',
      contain: 'layout style', // Strict containment to prevent interference
      transform: 'translateZ(0)', // Force hardware acceleration and isolation
      willChange: 'scroll-position' // Optimize for scrolling
    },
    wheelItem: {
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '23px',
      color: '#8e8e93',
      scrollSnapAlign: 'center',
      cursor: 'pointer',
      userSelect: 'none',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      fontWeight: '400',
      transition: 'all 0.1s ease'
    },
    wheelItemSelected: {
      color: '#000000', // Black text for selected items like native iOS
      fontWeight: '600', // Bolder for selected items
      fontSize: '23px'
    },
    selectionOverlay: {
      position: 'absolute',
      top: '50%',
      left: '8px',
      right: '8px',
      height: '40px',
      marginTop: '-20px',
      borderTop: '1px solid #c6c6c8',
      borderBottom: '1px solid #c6c6c8',
      pointerEvents: 'none',
      zIndex: 1,
      backgroundColor: 'rgba(34, 197, 94, 0.1)', // Light green background for selection area
      borderRadius: '8px'
    }
  };

  const WheelColumn = ({ items, selectedValue, onChange, formatter = (x) => x }) => {
    const scrollerRef = useRef(null);
    const isScrolling = useRef(false);
    const scrollTimeout = useRef(null);
    const isInitialized = useRef(false);
    
    // For arrays with few items (like AM/PM), create repeating items for better scroll experience
    const minItemsForScroll = 12;
    const scrollItems = items.length < minItemsForScroll ? 
      Array.from({ length: minItemsForScroll }, (_, i) => items[i % items.length]) : 
      items;

    useEffect(() => {
      if (scrollerRef.current && !isScrolling.current) {
        // Find the first occurrence of the selected value in scrollItems
        const selectedIndex = scrollItems.findIndex(item => item === selectedValue);
        if (selectedIndex >= 0) {
          const scrollTop = selectedIndex * 40;
          if (isInitialized.current) {
            scrollerRef.current.scrollTo({
              top: scrollTop,
              behavior: 'smooth'
            });
          } else {
            // Initial position without animation
            scrollerRef.current.scrollTop = scrollTop;
            isInitialized.current = true;
          }
        }
      }
    }, [selectedValue, scrollItems]);

    const handleScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      scrollTimeout.current = setTimeout(() => {
        if (scrollerRef.current && !isScrolling.current) {
          const scrollTop = scrollerRef.current.scrollTop;
          const itemHeight = 40;
          const centerIndex = Math.round(scrollTop / itemHeight);
          const clampedIndex = Math.max(0, Math.min(scrollItems.length - 1, centerIndex));
          
          // Snap to center
          const targetScrollTop = clampedIndex * itemHeight;
          scrollerRef.current.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
          
          if (scrollItems[clampedIndex] !== selectedValue) {
            onChange(scrollItems[clampedIndex]);
          }
        }
      }, 100);
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      isScrolling.current = true;
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      setTimeout(() => {
        isScrolling.current = false;
        // Trigger final snap after touch ends
        if (scrollerRef.current) {
          const scrollTop = scrollerRef.current.scrollTop;
          const itemHeight = 40;
          const centerIndex = Math.round(scrollTop / itemHeight);
          const clampedIndex = Math.max(0, Math.min(scrollItems.length - 1, centerIndex));
          const targetScrollTop = clampedIndex * itemHeight;
          
          scrollerRef.current.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
          
          if (scrollItems[clampedIndex] !== selectedValue) {
            onChange(scrollItems[clampedIndex]);
          }
        }
      }, 150);
    };

    // Add visual feedback for wheel items based on their distance from center
    const getItemStyle = (item, index) => {
      const isSelected = item === selectedValue;
      return {
        ...styles.wheelItem,
        ...(isSelected ? styles.wheelItemSelected : {})
      };
    };

    return (
      <div style={{height: '100%', position: 'relative'}}>
        <div style={styles.selectionOverlay}></div>
        <div 
          ref={scrollerRef}
          className="ios-wheel-scroller"
          style={styles.wheelScroller}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
        >
          {scrollItems.map((item, index) => (
            <div 
              key={`${item}-${index}`} 
              style={getItemStyle(item, index)}
              onClick={() => {
                onChange(item);
              }}
            >
              {formatter(item)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .ios-wheel-scroller::-webkit-scrollbar {
          display: none;
        }
        .ios-wheel-scroller {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <button style={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <div style={styles.title}>{title}</div>
            <button style={styles.saveButton} onClick={handleSave}>
              Save
            </button>
          </div>

          <div style={styles.pickerContainer}>
            <div style={{...styles.wheelColumn, ...styles.dateColumn}}>
              <WheelColumn
                items={dateOptions.map(d => d.label)}
                selectedValue={dateOptions.find(d => d.value === selectedDate)?.label || 'Today'}
                onChange={(label) => {
                  const option = dateOptions.find(d => d.label === label);
                  if (option) {
                    setSelectedDate(option.value);
                  }
                }}
              />
            </div>
            <div style={{...styles.wheelColumn, ...styles.hourColumn}}>
              <WheelColumn
                items={hours}
                selectedValue={selectedHour}
                onChange={setSelectedHour}
              />
            </div>
            <div style={{...styles.wheelColumn, ...styles.minuteColumn}}>
              <WheelColumn
                items={minutes}
                selectedValue={selectedMinute}
                onChange={setSelectedMinute}
                formatter={(min) => min.toString().padStart(2, '0')}
              />
            </div>
            <div style={{...styles.wheelColumn, ...styles.periodColumn}}>
              <WheelColumn
                items={periods}
                selectedValue={selectedPeriod}
                onChange={setSelectedPeriod}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProperIOSPicker;