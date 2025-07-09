// Create a custom Feed Me icon
// This script creates an SVG that can be converted to PNG
const fs = require('fs');

const createIcon = (size) => {
  const cornerRadius = Math.round(size * 0.22); // iOS rounded corner ratio
  const centerX = size / 2;
  const centerY = size / 2;
  const circleRadius = size * 0.35;
  const innerCircleRadius = size * 0.32;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- iOS rounded square background -->
  <rect width="${size}" height="${size}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#00704a"/>
  
  <!-- White circle for contrast -->
  <circle cx="${centerX}" cy="${centerY}" r="${circleRadius}" fill="white"/>
  
  <!-- Light green background -->
  <circle cx="${centerX}" cy="${centerY}" r="${innerCircleRadius}" fill="#e8f5e8"/>
  
  <!-- Baby icon (simplified) -->
  <g transform="translate(${centerX}, ${centerY}) scale(${size/80}, ${size/80}) translate(-12, -12)">
    <!-- Baby face circle -->
    <circle cx="12" cy="12" r="8" fill="none" stroke="#00704a" stroke-width="1.5"/>
    <!-- Eyes -->
    <circle cx="9.5" cy="9.5" r="0.8" fill="#00704a"/>
    <circle cx="14.5" cy="9.5" r="0.8" fill="#00704a"/>
    <!-- Mouth -->
    <path d="M9.5 14c0 1.2 1.2 2.5 2.5 2.5s2.5-1.3 2.5-2.5" fill="none" stroke="#00704a" stroke-width="1.2"/>
    <!-- Hair curls -->
    <path d="M8 6.5c0-0.8 0.8-1.5 1.5-1.5" fill="none" stroke="#00704a" stroke-width="1.2"/>
    <path d="M16 6.5c0-0.8-0.8-1.5-1.5-1.5" fill="none" stroke="#00704a" stroke-width="1.2"/>
    <path d="M12 5c0-0.8 0-1.5 0-1.5" fill="none" stroke="#00704a" stroke-width="1.2"/>
  </g>
</svg>`;
};

// Create 192px icon
fs.writeFileSync('public/icon-192.svg', createIcon(192));
console.log('Created icon-192.svg');

// Create 512px icon  
fs.writeFileSync('public/icon-512.svg', createIcon(512));
console.log('Created icon-512.svg');

console.log('SVG icons created! You can convert them to PNG using an online converter or design tool.');
console.log('For now, the app will use the existing placeholder PNG files.');