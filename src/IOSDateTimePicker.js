import React, { useState, useEffect } from 'react';
import { WheelPicker } from '@ncdai/react-wheel-picker';

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

  const dateOptions = generateDateOptions().map(d => ({ label: d.label, value: d.value }));
  const hours = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }));
  const minutes = Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: i }));
  const periods = [{ label: 'AM', value: 'AM' }, { label: 'PM', value: 'PM' }];

  // Initialize picker values
  const [pickerValue, setPickerValue] = useState(() => {
    if (initialDateTime) {
      const dateOption = dateOptions.find(d => d.value === initialDateTime.date);
      return {
        date: dateOption ? dateOption.label : 'Today',
        hour: initialDateTime.time.hour,
        minute: initialDateTime.time.minute,
        period: initialDateTime.time.period
      };
    } else {
      // Default to current time
      const now = new Date();
      let hour = now.getHours();
      const minute = now.getMinutes();
      const period = hour >= 12 ? 'PM' : 'AM';
      hour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      
      return {
        date: 'Today',
        hour,
        minute,
        period
      };
    }
  });

  // Update picker when initialDateTime changes
  useEffect(() => {
    if (initialDateTime && isOpen) {
      const dateOption = dateOptions.find(d => d.value === initialDateTime.date);
      setPickerValue({
        date: dateOption ? dateOption.label : 'Today',
        hour: initialDateTime.time.hour,
        minute: initialDateTime.time.minute,
        period: initialDateTime.time.period
      });
    }
  }, [initialDateTime, isOpen, dateOptions]);

  const handleSave = () => {
    // Convert back to the format expected by the parent
    const selectedDate = dateOptions.find(d => d.label === pickerValue.date);
    const dateValue = selectedDate ? selectedDate.value : dateOptions.find(d => d.label === 'Today').value;
    
    onSave({
      date: dateValue,
      time: {
        hour: pickerValue.hour,
        minute: pickerValue.minute,
        period: pickerValue.period
      }
    });
    onClose();
  };

  // Individual handlers for each picker
  const handleDateChange = (value) => {
    setPickerValue(prev => ({ ...prev, date: value }));
  };
  
  const handleHourChange = (value) => {
    setPickerValue(prev => ({ ...prev, hour: value }));
  };
  
  const handleMinuteChange = (value) => {
    setPickerValue(prev => ({ ...prev, minute: value }));
  };
  
  const handlePeriodChange = (value) => {
    setPickerValue(prev => ({ ...prev, period: value }));
  };

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
          height: 192px;
          background-color: #f8f9fa;
          position: relative;
        }
        
        .ios-picker-item {
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          color: #8e8e93;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
          transition: all 0.15s cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        
        /* Smooth scrolling for picker containers */
        .ios-picker-container * {
          scroll-behavior: smooth;
        }
        
        /* Better momentum scrolling on iOS */
        .ios-picker-container {
          -webkit-overflow-scrolling: touch;
        }
        
        .ios-picker-item.selected {
          color: #000;
          font-weight: 600;
        }
        
        .ios-picker-selection-indicator {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 32px;
          margin-top: -16px;
          border-top: 1px solid #c6c6c8;
          border-bottom: 1px solid #c6c6c8;
          background-color: rgba(34, 197, 94, 0.08);
          pointer-events: none;
          z-index: 1;
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

          <div className="ios-picker-container">
            <div className="ios-picker-selection-indicator"></div>
            <div style={{ display: 'flex', height: '192px' }}>
              <div style={{ flex: 2 }}>
                <WheelPicker
                  options={dateOptions}
                  value={pickerValue.date}
                  onValueChange={handleDateChange}
                  visibleCount={6}
                />
              </div>
              <div style={{ flex: 1 }}>
                <WheelPicker
                  options={hours}
                  value={pickerValue.hour}
                  onValueChange={handleHourChange}
                  visibleCount={6}
                />
              </div>
              <div style={{ flex: 1 }}>
                <WheelPicker
                  options={minutes}
                  value={pickerValue.minute}
                  onValueChange={handleMinuteChange}
                  visibleCount={6}
                />
              </div>
              <div style={{ flex: 1 }}>
                <WheelPicker
                  options={periods}
                  value={pickerValue.period}
                  onValueChange={handlePeriodChange}
                  visibleCount={6}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IOSDateTimePicker;