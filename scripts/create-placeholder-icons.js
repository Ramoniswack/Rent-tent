const fs = require('fs');
const path = require('path');

// Simple placeholder icon generator
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const createSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#059467;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#047a55;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="${size/2}" y="${size * 0.65}" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle">NN</text>
</svg>
`;

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG files for each size
sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Created ${filename}`);
});

console.log('\n✅ Placeholder icons created!');
console.log('📝 Note: These are SVG placeholders. For production, convert to PNG using:');
console.log('   - Online tool: https://www.pwabuilder.com/imageGenerator');
console.log('   - Or open frontend/scripts/generate-icons.html in browser');
