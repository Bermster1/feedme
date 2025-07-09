// Fix iOS icon issues by creating proper formats
const fs = require('fs');

// Create a better 180x180 SVG specifically for iOS
const createiOSIcon = () => {
  return `<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <!-- iOS rounded square background -->
  <rect width="180" height="180" rx="40" ry="40" fill="#00704a"/>
  
  <!-- White circle for contrast -->
  <circle cx="90" cy="90" r="63" fill="white"/>
  
  <!-- Light green background -->
  <circle cx="90" cy="90" r="58" fill="#e8f5e8"/>
  
  <!-- Baby icon (using emoji-style) -->
  <circle cx="90" cy="90" r="45" fill="#00704a"/>
  <circle cx="90" cy="90" r="42" fill="white"/>
  <circle cx="90" cy="90" r="40" fill="#e8f5e8"/>
  
  <!-- Simple baby face -->
  <circle cx="82" cy="82" r="3" fill="#00704a"/>
  <circle cx="98" cy="82" r="3" fill="#00704a"/>
  <path d="M82 100 Q90 108 98 100" fill="none" stroke="#00704a" stroke-width="2" stroke-linecap="round"/>
  
  <!-- Hair -->
  <path d="M75 70 Q90 65 105 70" fill="none" stroke="#00704a" stroke-width="3" stroke-linecap="round"/>
  <circle cx="78" cy="72" r="2" fill="#00704a"/>
  <circle cx="102" cy="72" r="2" fill="#00704a"/>
</svg>`;
};

// Create better favicon SVG
const createFavicon = () => {
  return `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="7" ry="7" fill="#00704a"/>
  <circle cx="16" cy="16" r="11" fill="white"/>
  <circle cx="16" cy="16" r="10" fill="#e8f5e8"/>
  <circle cx="13" cy="13" r="1" fill="#00704a"/>
  <circle cx="19" cy="13" r="1" fill="#00704a"/>
  <path d="M13 19 Q16 21 19 19" fill="none" stroke="#00704a" stroke-width="1"/>
</svg>`;
};

// Write the improved iOS icon
fs.writeFileSync('public/apple-touch-icon-180x180.svg', createiOSIcon());
console.log('Created apple-touch-icon-180x180.svg');

// Write favicon
fs.writeFileSync('public/favicon.svg', createFavicon());
console.log('Created favicon.svg');

console.log('Improved icons created!');
console.log('Next steps:');
console.log('1. Convert apple-touch-icon-180x180.svg to apple-touch-icon.png (180x180)');
console.log('2. Convert favicon.svg to favicon.ico');
console.log('3. Test on iOS again');