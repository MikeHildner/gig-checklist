/*
 * Generates the GigChecklist branding raster assets from SVG.
 * Run: node scripts/generate-branding-assets.js
 *
 * The mark is the "Note + check": a checkmark whose long upstroke is an
 * eighth-note stem, with an amber note head at the base and a flag at the top.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const AMBER = '#F4A62A';
const BLACK = '#17120B';
const ASSETS = path.join(__dirname, '..', 'assets');
fs.mkdirSync(ASSETS, { recursive: true });

// Mark drawn in a 1024 box; bbox roughly x:360..732 y:372..668 (center ~546,520).
// We translate that center to the canvas center (512,512) and scale about it.
function mark(color, scale) {
  // Checkmark whose long upstroke rises into an eighth-note head + flag.
  const inner =
    `<path d="M248,600 L400,728 L672,416" fill="none" stroke="${color}" stroke-width="88" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M770,360 q92,14 62,118 q-6,-74 -70,-86 z" fill="${color}"/>` +
    `<ellipse cx="688" cy="400" rx="94" ry="66" transform="rotate(-18 688 400)" fill="${color}"/>`;
  // bbox center is ~(518,554); map it to the canvas center and scale about it.
  return `<g transform="translate(512,512) scale(${scale}) translate(-518,-554)">${inner}</g>`;
}

function icon({ bg, scale }) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">` +
    (bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : '') +
    mark(AMBER, scale) +
    `</svg>`
  );
}

async function render(svg, size, out) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(ASSETS, out));
  console.log('wrote', out, `(${size}px)`);
}

(async () => {
  await render(icon({ bg: BLACK, scale: 0.9 }), 1024, 'icon.png'); // iOS + general
  await render(icon({ bg: null, scale: 0.82 }), 1024, 'adaptive-icon.png'); // Android foreground (transparent, kept in safe zone)
  await render(icon({ bg: null, scale: 0.95 }), 1024, 'splash-icon.png'); // splash (shown on black backgroundColor)
  await render(icon({ bg: BLACK, scale: 0.9 }), 196, 'favicon.png'); // web
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
