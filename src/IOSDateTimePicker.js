import React, { useState, useEffect, useRef } from 'react';

const IOSDateTimePicker = ({ isOpen, onClose, initialDateTime, onSave, title = "Select Date & Time" }) => {
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('PM');

  // Initialize with provided date/time
  useEffect(() => {
    if (initialDateTime && isOpen) {
      const [year, month, day] = initialDateTime.date.split('-').map(Number);
      setSelectedYear(year);
      setSelectedMonth(month - 1); // Month is 0-indexed
      setSelectedDay(day);
      setSelectedHour(initialDateTime.time.hour);
      setSelectedMinute(initialDateTime.time.minute);
      setSelectedPeriod(initialDateTime.time.period);
    }
  }, [initialDateTime, isOpen]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 5-minute intervals
  const periods = ['AM', 'PM'];

  // Get days in selected month/year
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);

  const handleSave = () => {
    // Convert back to our format
    const date = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
    const time = {
      hour: selectedHour,
      minute: selectedMinute,
      period: selectedPeriod
    };
    
    onSave({ date, time });
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
      alignItems: 'flex-end',
      justifyContent: 'center'
    },
    modal: {
      backgroundColor: 'white',
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',
      padding: '0',
      margin: '0',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.1)'
    },
    header: {
      padding: '1rem',
      borderBottom: '1px solid #f0f0f0',
      textAlign: 'center'
    },
    handle: {
      width: '40px',
      height: '4px',
      backgroundColor: '#d1d5db',
      borderRadius: '2px',
      margin: '0 auto 1rem auto'
    },
    title: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    pickerContainer: {
      display: 'flex',
      height: '200px',
      overflow: 'hidden',
      backgroundColor: '#f8f9fa'
    },
    wheelColumn: {
      flex: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
    wheelScroller: {
      height: '200px',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      paddingTop: '80px',
      paddingBottom: '80px'
    },
    wheelItem: {
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.125rem',
      color: '#6b7280',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    wheelItemSelected: {
      color: '#1f2937',
      fontWeight: '600',
      fontSize: '1.25rem'
    },
    selectionIndicator: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '40px',
      marginTop: '-20px',
      borderTop: '1px solid #e5e7eb',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      pointerEvents: 'none',
      zIndex: 1
    },
    buttonContainer: {
      display: 'flex',
      padding: '1rem',
      gap: '0.75rem',
      borderTop: '1px solid #f0f0f0'
    },
    button: {
      flex: 1,
      padding: '0.875rem',
      borderRadius: '12px',
      border: 'none',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    cancelButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    saveButton: {
      backgroundColor: '#007AFF',
      color: 'white'
    }
  };

  const WheelPicker = ({ items, selectedValue, onChange, formatter = (x) => x }) => {
    const scrollerRef = useRef(null);

    useEffect(() => {
      if (scrollerRef.current && items.length > 0) {
        const selectedIndex = items.findIndex(item => item === selectedValue);
        if (selectedIndex >= 0) {
          const scrollTop = selectedIndex * 40;
          scrollerRef.current.scrollTop = scrollTop;
        }
      }
    }, [selectedValue, items]);

    const handleScroll = () => {
      if (scrollerRef.current) {
        const scrollTop = scrollerRef.current.scrollTop;
        const itemIndex = Math.round(scrollTop / 40);
        const clampedIndex = Math.max(0, Math.min(items.length - 1, itemIndex));
        if (items[clampedIndex] !== selectedValue) {
          onChange(items[clampedIndex]);
        }
      }
    };

    return (
      <div style={styles.wheelColumn}>
        <div style={styles.selectionIndicator}></div>
        <div 
          ref={scrollerRef}
          style={styles.wheelScroller}
          onScroll={handleScroll}
        >
          {items.map((item, index) => (
            <div
              key={item}
              style={{
                ...styles.wheelItem,
                ...(item === selectedValue ? styles.wheelItemSelected : {})
              }}
              onClick={() => {
                onChange(item);
                if (scrollerRef.current) {
                  scrollerRef.current.scrollTop = index * 40;
                }
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
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.handle}></div>
          <h3 style={styles.title}>{title}</h3>
        </div>

        <div style={styles.pickerContainer}>
          <WheelPicker
            items={months}
            selectedValue={months[selectedMonth]}
            onChange={(month) => setSelectedMonth(months.indexOf(month))}
          />
          <WheelPicker
            items={days}
            selectedValue={selectedDay}
            onChange={setSelectedDay}
          />
          <WheelPicker
            items={years}
            selectedValue={selectedYear}
            onChange={setSelectedYear}
          />
          <WheelPicker
            items={hours}
            selectedValue={selectedHour}
            onChange={setSelectedHour}
          />
          <WheelPicker
            items={minutes}
            selectedValue={selectedMinute}
            onChange={setSelectedMinute}
            formatter={(min) => min.toString().padStart(2, '0')}
          />
          <WheelPicker
            items={periods}
            selectedValue={selectedPeriod}
            onChange={setSelectedPeriod}
          />
        </div>

        <div style={styles.buttonContainer}>
          <button
            style={{...styles.button, ...styles.cancelButton}}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{...styles.button, ...styles.saveButton}}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default IOSDateTimePicker;