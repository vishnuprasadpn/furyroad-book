// Simple script to generate PWA icons
// Run with: node generate-icons.js
// Requires: npm install sharp (or use ImageMagick)

const fs = require('fs');
const path = require('path');

// Create simple SVG icons as fallback
const createIconSVG = (size) => {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#111827" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="#f97316" text-anchor="middle" dominant-baseline="middle">FR</text>
</svg>`;
};

// Generate icons
const sizes = [192, 512];

sizes.forEach(size => {
  const svg = createIconSVG(size);
  const filename = `icon-${size}.png`;
  
  // For now, create SVG files (browsers can use SVG)
  // In production, convert to PNG using sharp or ImageMagick
  fs.writeFileSync(
    path.join(__dirname, `icon-${size}.svg`),
    svg
  );
  
  console.log(`Created icon-${size}.svg`);
});

console.log('\nNote: For production, convert SVG to PNG using:');
console.log('  - ImageMagick: convert icon-192.svg -resize 192x192 icon-192.png');
console.log('  - Or use an online tool to convert SVG to PNG');

