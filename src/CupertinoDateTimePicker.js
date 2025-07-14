import React, { useState, useEffect } from 'react';

const CupertinoDateTimePicker = ({ isOpen, onClose, initialDateTime, onSave, title = "Select Date & Time" }) => {
  const [selectedMonth, setSelectedMonth] = useState(6); // July (0-indexed)
  const [selectedDay, setSelectedDay] = useState(14);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedHour, setSelectedHour] = useState(4);
  const [selectedMinute, setSelectedMinute] = useState(10);
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
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
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
      cursor: 'pointer'
    },
    saveButton: {
      color: '#007AFF',
      fontSize: '1rem',
      fontWeight: '600',
      background: 'none',
      border: 'none',
      cursor: 'pointer'
    },
    title: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#000'
    },
    pickerContainer: {
      height: '216px',
      backgroundColor: '#f0f0f0',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden'
    },
    wheelColumn: {
      flex: 1,
      height: '100%',
      position: 'relative'
    },
    wheelList: {
      height: '100%',
      overflow: 'auto',
      scrollSnapType: 'y mandatory',
      paddingTop: '88px',
      paddingBottom: '88px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    },
    wheelItem: {
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
      color: '#333',
      scrollSnapAlign: 'center',
      cursor: 'pointer'
    },
    selectedIndicator: {
      position: 'absolute',
      top: '50%',
      left: '8px',
      right: '8px',
      height: '40px',
      marginTop: '-20px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '8px',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      pointerEvents: 'none',
      zIndex: 1
    }
  };

  const CupertinoWheel = ({ items, selectedValue, onChange, formatter = (x) => x }) => {
    const handleChange = (e) => {
      const scrollTop = e.target.scrollTop;
      const itemHeight = 40;
      const selectedIndex = Math.round(scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, selectedIndex));
      onChange(items[clampedIndex]);
    };

    return (
      <div style={styles.wheelColumn}>
        <div style={styles.selectedIndicator}></div>
        <div 
          style={styles.wheelList}
          onScroll={handleChange}
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
          <CupertinoWheel
            items={months}
            selectedValue={months[selectedMonth]}
            onChange={(month) => setSelectedMonth(months.indexOf(month))}
          />
          <CupertinoWheel
            items={days}
            selectedValue={selectedDay}
            onChange={setSelectedDay}
          />
          <CupertinoWheel
            items={years}
            selectedValue={selectedYear}
            onChange={setSelectedYear}
          />
          <CupertinoWheel
            items={hours}
            selectedValue={selectedHour}
            onChange={setSelectedHour}
          />
          <CupertinoWheel
            items={minutes}
            selectedValue={selectedMinute}
            onChange={setSelectedMinute}
            formatter={(min) => min.toString().padStart(2, '0')}
          />
          <CupertinoWheel
            items={periods}
            selectedValue={selectedPeriod}
            onChange={setSelectedPeriod}
          />
        </div>
      </div>
    </div>
  );
};

export default CupertinoDateTimePicker;