import React, { useState, useEffect } from 'react';

const TimePickerModal = ({ isOpen, onClose, initialTime, onSave, title = "Select Time" }) => {
  console.log('TimePickerModal rendered with isOpen:', isOpen);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('PM');

  // Initialize with provided time
  useEffect(() => {
    if (initialTime && isOpen) {
      setSelectedHour(initialTime.hour);
      setSelectedMinute(initialTime.minute);
      setSelectedPeriod(initialTime.period);
    }
  }, [initialTime, isOpen]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  const handleSave = () => {
    onSave({
      hour: selectedHour,
      minute: selectedMinute,
      period: selectedPeriod
    });
    onClose();
  };

  const formatMinute = (minute) => minute.toString().padStart(2, '0');

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
      alignItems: 'center',
      justifyContent: 'center'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      margin: '1rem',
      maxWidth: '340px',
      width: '100%',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '1.5rem'
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
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '2rem',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      padding: '1rem'
    },
    wheelContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: '60px'
    },
    wheelLabel: {
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#6b7280',
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    wheel: {
      height: '120px',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      border: 'none',
      outline: 'none',
      textAlign: 'center'
    },
    wheelItem: {
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.125rem',
      fontWeight: '500',
      color: '#6b7280',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    wheelItemSelected: {
      color: '#1f2937',
      fontWeight: '600',
      fontSize: '1.25rem',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderRadius: '8px',
      margin: '0 4px'
    },
    separator: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#374151',
      margin: '0 0.5rem',
      alignSelf: 'center',
      marginTop: '1.5rem'
    },
    buttonContainer: {
      display: 'flex',
      gap: '0.75rem'
    },
    button: {
      flex: 1,
      padding: '0.875rem',
      borderRadius: '8px',
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
      backgroundColor: '#3b82f6',
      color: 'white'
    }
  };

  const WheelPicker = ({ items, selectedValue, onChange, formatter = (x) => x }) => (
    <div style={styles.wheelContainer}>
      <div style={styles.wheel}>
        {items.map((item) => (
          <div
            key={item}
            style={{
              ...styles.wheelItem,
              ...(item === selectedValue ? styles.wheelItemSelected : {})
            }}
            onClick={() => onChange(item)}
          >
            {formatter(item)}
          </div>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
        </div>

        <div style={styles.pickerContainer}>
          <div style={styles.wheelContainer}>
            <div style={styles.wheelLabel}>Hour</div>
            <WheelPicker
              items={hours}
              selectedValue={selectedHour}
              onChange={setSelectedHour}
            />
          </div>

          <div style={styles.separator}>:</div>

          <div style={styles.wheelContainer}>
            <div style={styles.wheelLabel}>Min</div>
            <WheelPicker
              items={minutes}
              selectedValue={selectedMinute}
              onChange={setSelectedMinute}
              formatter={formatMinute}
            />
          </div>

          <div style={styles.wheelContainer}>
            <div style={styles.wheelLabel}>Period</div>
            <WheelPicker
              items={periods}
              selectedValue={selectedPeriod}
              onChange={setSelectedPeriod}
            />
          </div>
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

export default TimePickerModal;