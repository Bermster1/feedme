import React, { useState, useEffect, useRef } from 'react';

const ProperIOSPicker = ({ isOpen, onClose, initialDateTime, onSave, title = "Select Date & Time" }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedHour, setSelectedHour] = useState(new Date().getHours() > 12 ? new Date().getHours() - 12 : new Date().getHours() || 12);
  const [selectedMinute, setSelectedMinute] = useState(Math.round(new Date().getMinutes() / 5) * 5);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().getHours() >= 12 ? 'PM' : 'AM');

  // Initialize with provided date/time
  useEffect(() => {
    if (initialDateTime && isOpen) {
      const [year, month, day] = initialDateTime.date.split('-').map(Number);
      setSelectedMonth(month - 1);
      setSelectedDay(day);
      setSelectedHour(initialDateTime.time.hour);
      setSelectedMinute(initialDateTime.time.minute);
      setSelectedPeriod(initialDateTime.time.period);
    }
  }, [initialDateTime, isOpen]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const periods = ['AM', 'PM'];

  // Get days in selected month (current year)
  const getDaysInMonth = (month) => {
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, month + 1, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedMonth) }, (_, i) => i + 1);

  const handleSave = () => {
    const currentYear = new Date().getFullYear();
    const date = `${currentYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
    const time = { hour: selectedHour, minute: selectedMinute, period: selectedPeriod };
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
      alignItems: 'flex-end'
    },
    modal: {
      backgroundColor: '#f0f0f0',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      width: '100%',
      paddingBottom: 'env(safe-area-inset-bottom)'
    },
    header: {
      backgroundColor: 'white',
      padding: '1rem',
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    cancelButton: {
      color: '#007AFF',
      fontSize: '1rem',
      fontWeight: '400',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.5rem'
    },
    saveButton: {
      color: '#007AFF',
      fontSize: '1rem',
      fontWeight: '600',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.5rem'
    },
    title: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#000'
    },
    pickerContainer: {
      height: '200px',
      backgroundColor: '#f0f0f0',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden'
    },
    wheelColumn: {
      flex: 1,
      height: '100%',
      position: 'relative',
      overflow: 'hidden'
    },
    wheelScroller: {
      height: '100%',
      overflowY: 'auto',
      scrollSnapType: 'y mandatory',
      paddingTop: '80px',
      paddingBottom: '80px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitScrollbar: { display: 'none' }
    },
    wheelItem: {
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
      color: '#333',
      scrollSnapAlign: 'center',
      cursor: 'pointer',
      userSelect: 'none'
    },
    selectedIndicator: {
      position: 'absolute',
      top: '50%',
      left: '4px',
      right: '4px',
      height: '40px',
      marginTop: '-20px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '8px',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      pointerEvents: 'none',
      zIndex: 1
    }
  };

  const WheelColumn = ({ items, selectedValue, onChange, formatter = (x) => x }) => {
    const scrollerRef = useRef(null);
    const isScrolling = useRef(false);

    useEffect(() => {
      if (scrollerRef.current && !isScrolling.current) {
        const selectedIndex = items.findIndex(item => item === selectedValue);
        if (selectedIndex >= 0) {
          scrollerRef.current.scrollTop = selectedIndex * 40;
        }
      }
    }, [selectedValue, items]);

    const handleScroll = () => {
      if (!isScrolling.current) return;
      
      const scrollTop = scrollerRef.current.scrollTop;
      const itemHeight = 40;
      const selectedIndex = Math.round(scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, selectedIndex));
      
      if (items[clampedIndex] !== selectedValue) {
        onChange(items[clampedIndex]);
      }
    };

    const handleTouchStart = () => {
      isScrolling.current = true;
    };

    const handleTouchEnd = () => {
      setTimeout(() => {
        isScrolling.current = false;
        handleScroll();
      }, 100);
    };

    return (
      <div style={styles.wheelColumn}>
        <div style={styles.selectedIndicator}></div>
        <div 
          ref={scrollerRef}
          style={styles.wheelScroller}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
        >
          {items.map((item) => (
            <div key={item} style={styles.wheelItem}>
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
          <button style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <div style={styles.title}>{title}</div>
          <button style={styles.saveButton} onClick={handleSave}>
            Save
          </button>
        </div>

        <div style={styles.pickerContainer}>
          <WheelColumn
            items={months}
            selectedValue={months[selectedMonth]}
            onChange={(month) => {
              const newMonthIndex = months.indexOf(month);
              setSelectedMonth(newMonthIndex);
              // Adjust day if it doesn't exist in new month
              const maxDays = getDaysInMonth(newMonthIndex);
              if (selectedDay > maxDays) {
                setSelectedDay(maxDays);
              }
            }}
          />
          <WheelColumn
            items={days}
            selectedValue={selectedDay}
            onChange={setSelectedDay}
          />
          <WheelColumn
            items={hours}
            selectedValue={selectedHour}
            onChange={setSelectedHour}
          />
          <WheelColumn
            items={minutes}
            selectedValue={selectedMinute}
            onChange={setSelectedMinute}
            formatter={(min) => min.toString().padStart(2, '0')}
          />
          <WheelColumn
            items={periods}
            selectedValue={selectedPeriod}
            onChange={setSelectedPeriod}
          />
        </div>
      </div>
    </div>
  );
};

export default ProperIOSPicker;