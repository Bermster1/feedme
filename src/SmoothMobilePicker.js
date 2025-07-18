import React, { useState, useRef, useEffect } from 'react';

const SmoothMobilePicker = ({ 
  items, 
  selectedIndex, 
  onSelectedChange, 
  itemHeight = 44,
  visibleItems = 5,
  label,
  fontSize = '17px'
}) => {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollY, setScrollY] = useState(-selectedIndex * itemHeight);
  const [velocity, setVelocity] = useState(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  // Update scroll position when selectedIndex changes
  useEffect(() => {
    const targetY = -selectedIndex * itemHeight;
    animateToPosition(targetY);
    setCurrentIndex(selectedIndex);
  }, [selectedIndex, itemHeight]);

  const animateToPosition = (targetY, initialVelocity = 0) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startY = scrollY;
    const distance = targetY - startY;
    const absDistance = Math.abs(distance);
    const absVelocity = Math.abs(initialVelocity);
    
    // Calculate duration based on distance and velocity
    const baseDuration = Math.sqrt(absDistance) * 15;
    const velocityDuration = absVelocity * 0.3;
    const duration = Math.max(150, Math.min(400, baseDuration + velocityDuration));
    
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easeOutCubic for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentY = startY + distance * easeProgress;
      
      setScrollY(currentY);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleStart = (clientY) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsDragging(true);
    setStartY(clientY - scrollY);
    setVelocity(0);
    lastY.current = clientY;
    lastTime.current = performance.now();
  };

  const handleMove = (clientY) => {
    if (!isDragging) return;
    
    const deltaY = clientY - startY;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime.current;
    
    if (deltaTime > 0) {
      const instantVelocity = (clientY - lastY.current) / deltaTime * 1000;
      setVelocity(instantVelocity * 0.8 + velocity * 0.2); // Smooth velocity
    }
    
    setScrollY(deltaY);
    lastY.current = clientY;
    lastTime.current = currentTime;
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Find nearest item
    const maxScroll = 0;
    const minScroll = -(items.length - 1) * itemHeight;
    
    // Apply momentum
    let targetY = scrollY + velocity * 0.2;
    targetY = Math.max(minScroll, Math.min(maxScroll, targetY));
    
    // Snap to nearest item
    const targetIndex = Math.round(-targetY / itemHeight);
    const finalIndex = Math.max(0, Math.min(items.length - 1, targetIndex));
    const finalY = -finalIndex * itemHeight;
    
    animateToPosition(finalY, velocity);
    setCurrentIndex(finalIndex);
    
    if (finalIndex !== selectedIndex) {
      onSelectedChange(finalIndex);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    handleEnd();
  };
  
  // Add passive listeners for better performance
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const preventDefaultTouch = (e) => e.preventDefault();
    
    // Add non-passive listeners to prevent scrolling
    container.addEventListener('touchstart', preventDefaultTouch, { passive: false });
    container.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    
    return () => {
      container.removeEventListener('touchstart', preventDefaultTouch);
      container.removeEventListener('touchmove', preventDefaultTouch);
    };
  }, []);

  // Mouse event handlers for desktop testing
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientY);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    handleMove(e.clientY);
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    handleEnd();
  };

  const handleMouseLeave = (e) => {
    if (isDragging) {
      handleEnd();
    }
  };

  // Calculate visible range
  const containerHeight = itemHeight * visibleItems;
  const halfVisible = Math.floor(visibleItems / 2);
  
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {label && (
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          {label}
        </div>
      )}
      
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          height: `${containerHeight}px`,
          width: '100%',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
          WebkitOverflowScrolling: 'touch'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : null}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Selection indicator */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: itemHeight,
            marginTop: -itemHeight / 2,
            backgroundColor: 'rgba(0, 122, 255, 0.08)',
            borderTop: '1px solid rgba(0, 122, 255, 0.3)',
            borderBottom: '1px solid rgba(0, 122, 255, 0.3)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
        
        {/* Items container */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            transform: `translateY(${scrollY - itemHeight / 2}px)`,
            willChange: isDragging ? 'transform' : 'auto'
          }}
        >
          {items.map((item, index) => {
            const distance = Math.abs(index - currentIndex);
            const opacity = Math.max(0.3, 1 - distance * 0.2);
            const scale = Math.max(0.85, 1 - distance * 0.05);
            
            return (
              <div
                key={index}
                style={{
                  height: itemHeight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity,
                  transform: `scale(${scale})`,
                  fontSize: fontSize,
                  fontWeight: index === currentIndex ? '600' : '400',
                  color: index === currentIndex ? '#000' : '#666',
                  pointerEvents: 'none'
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
        
        {/* Gradient overlays */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: 'linear-gradient(to bottom, rgba(248, 249, 250, 1), rgba(248, 249, 250, 0))',
            pointerEvents: 'none',
            zIndex: 20
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '30%',
            background: 'linear-gradient(to top, rgba(248, 249, 250, 1), rgba(248, 249, 250, 0))',
            pointerEvents: 'none',
            zIndex: 20
          }}
        />
      </div>
    </div>
  );
};

export default SmoothMobilePicker;