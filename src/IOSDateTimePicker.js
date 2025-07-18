import React, { useState, useEffect } from 'react';
import SmoothMobilePicker from './SmoothMobilePicker';

const IOSDateTimePicker = ({ isOpen, onClose, initialDateTime, onSave, title = "Select Date & Time" }) => {
  // Generate date options
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = -2; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label;
      if (i === 0) {
        label = 'Today';
      } else {
        label = date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        });
      }
      
      dates.push({
        label,
        value: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
      });
    }
    
    return dates;
  };

  const dateOptions = generateDateOptions();
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  // Initialize picker values
  const [pickerValue, setPickerValue] = useState(() => {
    // Always initialize with provided values or current time
    const now = new Date();
    let hour = now.getHours();
    const minute = now.getMinutes();
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    
    if (initialDateTime && initialDateTime.time) {
      const dateOption = dateOptions.find(d => d.value === initialDateTime.date);
      return {
        date: dateOption ? dateOption.label : 'Today',
        hour: initialDateTime.time.hour || hour,
        minute: initialDateTime.time.minute !== undefined ? initialDateTime.time.minute : minute,
        period: initialDateTime.time.period || period
      };
    }
    
    return {
      date: 'Today',
      hour,
      minute,
      period
    };
  });

  // Update picker when modal opens with new initial values
  useEffect(() => {
    if (isOpen && initialDateTime) {
      const dateOption = dateOptions.find(d => d.value === initialDateTime.date);
      const newPickerValue = {
        date: dateOption ? dateOption.label : 'Today',
        hour: initialDateTime.time.hour,
        minute: initialDateTime.time.minute,
        period: initialDateTime.time.period
      };
      console.log('Setting picker value on open:', newPickerValue);
      setPickerValue(newPickerValue);
    }
  }, [isOpen]); // Only depend on isOpen to avoid loops

  const handleSave = () => {
    // Convert back to the format expected by the parent
    const selectedDate = dateOptions.find(d => d.label === pickerValue.date);
    const dateValue = selectedDate ? selectedDate.value : dateOptions.find(d => d.label === 'Today').value;
    
    console.log('IOSDateTimePicker handleSave:');
    console.log('- pickerValue:', pickerValue);
    console.log('- dateValue:', dateValue);
    
    onSave({
      date: dateValue,
      time: {
        hour: pickerValue.hour,
        minute: pickerValue.minute,
        period: pickerValue.period
      }
    });
    // Don't close here - let parent handle it after state update
  };

  const selections = {
    date: dateOptions.map(d => d.label),
    hour: hours,
    minute: minutes,
    period: periods
  };

  console.log('IOSDateTimePicker selections:', {
    date: selections.date.length,
    hour: selections.hour.length, 
    minute: selections.minute.length,
    period: selections.period.length
  });

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .ios-picker-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.4);
          z-index: 1000;
          display: flex;
          align-items: flex-end;
        }
        
        .ios-picker-modal {
          background-color: #f8f9fa;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
          width: 100%;
          padding-bottom: env(safe-area-inset-bottom);
          max-height: 70vh;
        }
        
        .ios-picker-header {
          background-color: #f8f9fa;
          padding: 1rem 1.5rem;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
          border-bottom: 1px solid #e5e5e7;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .ios-picker-button {
          color: #007AFF;
          font-size: 17px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
        }
        
        .ios-picker-button.save {
          font-weight: 600;
        }
        
        .ios-picker-title {
          font-size: 17px;
          font-weight: 600;
          color: #000;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
        }
        
        .ios-picker-container {
          min-height: 220px;
          background-color: #f8f9fa;
          padding: 10px 0;
        }
      `}</style>
      
      <div className="ios-picker-overlay" onClick={onClose}>
        <div className="ios-picker-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ios-picker-header">
            <button className="ios-picker-button" onClick={onClose}>
              Cancel
            </button>
            <div className="ios-picker-title">{title}</div>
            <button className="ios-picker-button save" onClick={handleSave}>
              Save
            </button>
          </div>

          <div className="ios-picker-container" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr', // Date gets more space
            padding: '0 10px',
            gap: '5px'
          }}>
            <SmoothMobilePicker
              items={selections.date}
              selectedIndex={selections.date.findIndex(d => d === pickerValue.date)}
              onSelectedChange={(index) => {
                const newValue = { ...pickerValue, date: selections.date[index] };
                console.log('Date picker changed:', newValue);
                setPickerValue(newValue);
              }}
              label="Date"
              itemHeight={36}
              fontSize="14px"
            />
            
            <SmoothMobilePicker
              items={hours}
              selectedIndex={hours.findIndex(h => h === pickerValue.hour)}
              onSelectedChange={(index) => {
                const newValue = { ...pickerValue, hour: hours[index] };
                console.log('Hour picker changed:', newValue);
                setPickerValue(newValue);
              }}
              label="Hour"
              itemHeight={36}
            />
            
            <SmoothMobilePicker
              items={minutes.map(m => String(m).padStart(2, '0'))}
              selectedIndex={minutes.findIndex(m => m === pickerValue.minute)}
              onSelectedChange={(index) => {
                const newValue = { ...pickerValue, minute: minutes[index] };
                console.log('Minute picker changed:', newValue);
                setPickerValue(newValue);
              }}
              label="Min"
              itemHeight={36}
            />
            
            <SmoothMobilePicker
              items={periods}
              selectedIndex={periods.findIndex(p => p === pickerValue.period)}
              onSelectedChange={(index) => {
                const newValue = { ...pickerValue, period: periods[index] };
                console.log('Period picker changed:', newValue);
                setPickerValue(newValue);
              }}
              label="AM/PM"
              itemHeight={36}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default IOSDateTimePicker;