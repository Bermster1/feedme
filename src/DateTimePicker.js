import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DateTimePicker = ({ isOpen, onClose, initialDateTime, onSave, title = "Select Date & Time" }) => {
  const [selectedDateTime, setSelectedDateTime] = useState(() => {
    if (initialDateTime) {
      // Convert from our format {date: 'YYYY-MM-DD', time: {hour, minute, period}} to Date object
      const [year, month, day] = initialDateTime.date.split('-').map(Number);
      let hour = initialDateTime.time.hour;
      
      // Convert 12-hour to 24-hour
      if (initialDateTime.time.period === 'AM' && hour === 12) {
        hour = 0;
      } else if (initialDateTime.time.period === 'PM' && hour !== 12) {
        hour += 12;
      }
      
      return new Date(year, month - 1, day, hour, initialDateTime.time.minute);
    }
    return new Date();
  });

  const handleSave = () => {
    // Convert Date object back to our format
    const date = selectedDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
    let hour = selectedDateTime.getHours();
    const minute = selectedDateTime.getMinutes();
    const period = hour >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    
    onSave({
      date,
      time: { hour, minute, period }
    });
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
      padding: '1rem',
      margin: '0',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.1)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '1rem',
      paddingTop: '0.5rem'
    },
    handle: {
      width: '40px',
      height: '4px',
      backgroundColor: '#d1d5db',
      borderRadius: '2px',
      margin: '0 auto 1rem auto'
    },
    title: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      margin: 0
    },
    pickerContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '1.5rem'
    },
    buttonContainer: {
      display: 'flex',
      gap: '0.75rem',
      paddingBottom: '1rem'
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

  // Custom styles for react-datepicker to look iOS-like
  const datePickerStyles = `
    .ios-datepicker .react-datepicker {
      border: none;
      box-shadow: none;
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .ios-datepicker .react-datepicker__header {
      background: transparent;
      border: none;
      padding-top: 0;
    }
    
    .ios-datepicker .react-datepicker__current-month {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }
    
    .ios-datepicker .react-datepicker__day-names {
      margin-bottom: 0.5rem;
    }
    
    .ios-datepicker .react-datepicker__day-name {
      color: #6b7280;
      font-size: 0.875rem;
      font-weight: 500;
      width: 2.5rem;
      line-height: 2.5rem;
    }
    
    .ios-datepicker .react-datepicker__day {
      width: 2.5rem;
      height: 2.5rem;
      line-height: 2.5rem;
      margin: 0.125rem;
      border-radius: 50%;
      color: #1f2937;
      font-size: 1rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .ios-datepicker .react-datepicker__day--selected {
      background-color: #007AFF !important;
      color: white !important;
      font-weight: 600;
    }
    
    .ios-datepicker .react-datepicker__day--today {
      background-color: #f0f9ff;
      color: #007AFF;
      font-weight: 600;
    }
    
    .ios-datepicker .react-datepicker__day--outside-month {
      color: #d1d5db;
    }
    
    .ios-datepicker .react-datepicker__day:hover {
      background-color: #f0f9ff;
      border-radius: 50%;
    }
    
    .ios-datepicker .react-datepicker__time-container {
      border-left: 1px solid #e5e7eb;
      width: 120px;
    }
    
    .ios-datepicker .react-datepicker__time-header {
      font-weight: 600;
      color: #1f2937;
    }
    
    .ios-datepicker .react-datepicker__time-list-item {
      height: 40px;
      padding: 8px 16px;
      font-size: 1rem;
    }
    
    .ios-datepicker .react-datepicker__time-list-item--selected {
      background-color: #007AFF !important;
      color: white !important;
      font-weight: 600;
    }
    
    .ios-datepicker .react-datepicker__time-list-item:hover {
      background-color: #f0f9ff;
    }
    
    .ios-datepicker .react-datepicker__navigation {
      top: 1rem;
    }
    
    .ios-datepicker .react-datepicker__navigation-icon::before {
      border-color: #6b7280;
      border-width: 2px 2px 0 0;
    }
  `;

  if (!isOpen) return null;

  return (
    <>
      <style>{datePickerStyles}</style>
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <div style={styles.handle}></div>
            <h3 style={styles.title}>{title}</h3>
          </div>

          <div style={styles.pickerContainer} className="ios-datepicker">
            <DatePicker
              selected={selectedDateTime}
              onChange={setSelectedDateTime}
              showTimeSelect
              timeFormat="h:mm aa"
              timeIntervals={5}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              inline
              calendarClassName="ios-calendar"
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
    </>
  );
};

export default DateTimePicker;