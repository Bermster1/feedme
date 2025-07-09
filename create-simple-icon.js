// Create a simple test icon to debug iOS issue
const fs = require('fs');

// Create a very simple SVG that should definitely work
const createSimpleIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Simple green square with rounded corners -->
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" ry="${Math.round(size * 0.22)}" fill="#00704a"/>
  
  <!-- White circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.3}" fill="white"/>
  
  <!-- Green dot in center -->
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.1}" fill="#00704a"/>
  
  <!-- Text "FM" for Feed Me -->
  <text x="${size/2}" y="${size/2 + size * 0.08}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * 0.25}" font-weight="bold" fill="#00704a">FM</text>
</svg>`;
};

// Create simple 192px icon
fs.writeFileSync('public/icon-192-simple.svg', createSimpleIcon(192));
console.log('Created simple 192px test icon');

// Create simple 180px icon specifically for iOS
fs.writeFileSync('public/apple-touch-icon-simple.svg', createSimpleIcon(180));
console.log('Created simple 180px iOS test icon');

console.log('Simple test icons created - these should work on iOS');
console.log('If these work, we know the issue is with our baby icon design');
console.log('If these don\'t work, the issue is with file format or referencing');