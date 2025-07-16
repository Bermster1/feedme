import React, { useState, useEffect, useRef } from 'react';

const MobileWheelPicker = ({ items, selectedIndex, onSelectedChange, width = 80, itemHeight = 44 }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const animationRef = useRef(null);
  
  const centerOffset = itemHeight * 2;

  useEffect(() => {
    const newTranslateY = -selectedIndex * itemHeight;
    setTranslateY(newTranslateY);
  }, [selectedIndex, itemHeight]);

  const snapToNearestItem = (currentTranslateY, velocityY = 0) => {
    const maxTranslateY = 0;
    const minTranslateY = -(items.length - 1) * itemHeight;
    
    // Apply momentum with better scaling - velocity is now in px/second
    let targetY = currentTranslateY + velocityY * 0.3; // 300ms worth of momentum
    
    // Clamp to bounds
    targetY = Math.max(minTranslateY, Math.min(maxTranslateY, targetY));
    
    // Snap to nearest item
    const nearestIndex = Math.round(-targetY / itemHeight);
    const finalIndex = Math.max(0, Math.min(nearestIndex, items.length - 1));
    const finalY = -finalIndex * itemHeight;
    
    // Animate to final position with velocity-based duration
    const startY = currentTranslateY;
    const distance = Math.abs(finalY - startY);
    const baseDuration = 300;
    const velocityFactor = Math.min(Math.abs(velocityY) / 1000, 1); // Normalize velocity
    const duration = baseDuration + velocityFactor * 200; // 300-500ms based on velocity
    
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out animation with velocity decay
      const easeProgress = 1 - Math.pow(1 - progress, 2.5);
      const currentTranslateY = startY + (finalY - startY) * easeProgress;
      
      setTranslateY(currentTranslateY);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onSelectedChange(finalIndex);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setVelocity(0);
    setLastMoveTime(performance.now());
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const currentTime = performance.now();
    const deltaY = e.touches[0].clientY - startY;
    const deltaTime = currentTime - lastMoveTime;
    
    if (deltaTime > 0) {
      // Fix: Convert velocity to pixels per second
      const currentVelocity = (e.touches[0].clientY - currentY) / (deltaTime / 1000);
      setVelocity(currentVelocity);
    }
    
    setCurrentY(e.touches[0].clientY);
    setLastMoveTime(currentTime);
    
    const newTranslateY = -selectedIndex * itemHeight + deltaY;
    setTranslateY(newTranslateY);
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    setIsDragging(false);
    // Use velocity directly since it's now in px/second
    snapToNearestItem(translateY, velocity);
  };

  // Mouse events for desktop testing
  const handleMouseDown = (e) => {
    e.preventDefault();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsDragging(true);
    setStartY(e.clientY);
    setCurrentY(e.clientY);
    setVelocity(0);
    setLastMoveTime(performance.now());
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const currentTime = performance.now();
    const deltaY = e.clientY - startY;
    const deltaTime = currentTime - lastMoveTime;
    
    if (deltaTime > 0) {
      // Fix: Convert velocity to pixels per second
      const currentVelocity = (e.clientY - currentY) / (deltaTime / 1000);
      setVelocity(currentVelocity);
    }
    
    setCurrentY(e.clientY);
    setLastMoveTime(currentTime);
    
    const newTranslateY = -selectedIndex * itemHeight + deltaY;
    setTranslateY(newTranslateY);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Use velocity directly since it's now in px/second
    snapToNearestItem(translateY, velocity);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, translateY, velocity, selectedIndex]);

  return (
    <div 
      className="relative overflow-hidden bg-white rounded-lg select-none"
      style={{ width, height: itemHeight * 5 }}
    >
      {/* Selection highlight with current item */}
      <div 
        className="absolute left-0 right-0 bg-blue-50 border-t border-b border-blue-200 pointer-events-none z-10 flex items-center justify-center"
        style={{ 
          top: centerOffset,
          height: itemHeight
        }}
      >
        <div className="text-blue-600 font-medium text-lg">
          {items[selectedIndex]}
        </div>
      </div>
      
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white via-white to-transparent pointer-events-none z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-20" />
      
      <div
        className="relative"
        style={{
          transform: `translateY(${translateY + centerOffset}px)`,
          // Fix: Remove transition during dragging to prevent conflicts
          transition: isDragging ? 'none' : 'transform 0.15s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {items.map((item, index) => {
          const distance = Math.abs(index - selectedIndex);
          const opacity = Math.max(0.3, 1 - distance * 0.3);
          const scale = Math.max(0.8, 1 - distance * 0.1);
          
          return (
            <div
              key={index}
              className={`flex items-center justify-center text-lg font-medium transition-opacity duration-200 ${
                index === selectedIndex 
                  ? 'text-transparent'
                  : 'text-gray-600'
              }`}
              style={{ 
                height: itemHeight,
                opacity: index === selectedIndex ? 0 : opacity,
                transform: `scale(${scale})`,
                transformOrigin: 'center'
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MobileWheelClock = ({ 
  initialDate = new Date(), 
  onDateTimeChange,
  className = ""
}) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date(initialDate);
    return {
      dateIndex: 0,
      hour: date.getHours() % 12 || 12,
      minute: date.getMinutes(),
      ampm: date.getHours() >= 12 ? 1 : 0
    };
  });

  // Generate month-day combinations for current year
  const generateMonthDayOptions = () => {
    const currentYear = new Date().getFullYear();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const options = [];
    const today = new Date();
    let initialIndex = 0;
    
    months.forEach((month, monthIndex) => {
      const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${month} ${day}`;
        options.push({ dateString, month: monthIndex, day });
        
        // Find initial index for today's date
        if (monthIndex === today.getMonth() && day === today.getDate()) {
          initialIndex = options.length - 1;
        }
      }
    });
    
    return { options, initialIndex };
  };

  const { options: monthDayOptions, initialIndex } = generateMonthDayOptions();
  
  // Set initial date index
  useEffect(() => {
    setSelectedDate(prev => ({ ...prev, dateIndex: initialIndex }));
  }, [initialIndex]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const ampmOptions = ['AM', 'PM'];

  // Update callback when any value changes
  useEffect(() => {
    const selectedMonthDay = monthDayOptions[selectedDate.dateIndex];
    if (!selectedMonthDay) return;

    const finalHour = selectedDate.ampm === 1 ? 
      (selectedDate.hour === 12 ? 12 : selectedDate.hour + 12) : 
      (selectedDate.hour === 12 ? 0 : selectedDate.hour);
    
    const newDate = new Date(
      new Date().getFullYear(),
      selectedMonthDay.month,
      selectedMonthDay.day,
      finalHour,
      selectedDate.minute
    );
    
    if (onDateTimeChange) {
      onDateTimeChange(newDate);
    }
  }, [selectedDate, onDateTimeChange, monthDayOptions]);

  const handleDateChange = (field, value) => {
    setSelectedDate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-center space-x-2">
        {/* Date (Month + Day) */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-2 font-medium">Date</div>
          <MobileWheelPicker
            items={monthDayOptions.map(option => option.dateString)}
            selectedIndex={selectedDate.dateIndex}
            onSelectedChange={(index) => handleDateChange('dateIndex', index)}
            width={100}
          />
        </div>
        
        {/* Hour */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-2 font-medium">Hour</div>
          <MobileWheelPicker
            items={hours}
            selectedIndex={selectedDate.hour - 1}
            onSelectedChange={(index) => handleDateChange('hour', index + 1)}
            width={70}
          />
        </div>
        
        {/* Minute */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-2 font-medium">Min</div>
          <MobileWheelPicker
            items={minutes}
            selectedIndex={selectedDate.minute}
            onSelectedChange={(index) => handleDateChange('minute', index)}
            width={70}
          />
        </div>
        
        {/* AM/PM */}
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-2 font-medium">AM/PM</div>
          <MobileWheelPicker
            items={ampmOptions}
            selectedIndex={selectedDate.ampm}
            onSelectedChange={(index) => handleDateChange('ampm', index)}
            width={80}
          />
        </div>
      </div>
    </div>
  );
};

// Demo component
const App = () => {
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Mobile Wheel Clock
        </h1>
        
        <div className="flex flex-col items-center space-y-4">
          <MobileWheelClock 
            initialDate={selectedDateTime}
            onDateTimeChange={setSelectedDateTime}
            className="w-full"
          />
          
          <div className="text-center p-3 bg-blue-50 rounded-lg w-full">
            <div className="text-sm text-gray-600 mb-1">Selected:</div>
            <div className="text-lg font-semibold text-blue-600">
              {selectedDateTime.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;