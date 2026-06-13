#!/usr/bin/env node
/**
 * generate-icons.js
 * Run once to generate all required PWA icons from a base SVG.
 * 
 * Usage:
 *   cd frontend
 *   node generate-icons.js
 *
 * Requires: sharp
 *   npm install sharp --save-dev
 */

const fs   = require('fs')
const path = require('path')

// ── Base SVG icon (the AegisRoad logo as SVG) ────────────────────────────────
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#0f1117"/>
  <path d="M256 80L420 400H92L256 80Z" fill="none" stroke="#4f8ef7" stroke-width="28" stroke-linejoin="round"/>
  <path d="M256 180L360 380H152L256 180Z" fill="#4f8ef7" opacity="0.25"/>
  <circle cx="256" cy="310" r="28" fill="#ef4444"/>
  <rect x="244" y="210" width="24" height="70" rx="12" fill="white"/>
  <text x="256" y="460" font-family="system-ui,sans-serif" font-size="60" font-weight="900"
    fill="#4f8ef7" text-anchor="middle" letter-spacing="-2">AR</text>
</svg>`

const SIZES = [72, 96, 128, 192, 512]
const ICONS_DIR = path.join(__dirname, 'public', 'icons')

async function generate() {
  // Try to use sharp if available
  let sharp
  try {
    sharp = require('sharp')
  } catch {
    console.log('sharp not installed. Run: npm install sharp --save-dev')
    console.log('Generating SVG placeholder icons instead...')
    generateSVGFallbacks()
    return
  }

  fs.mkdirSync(ICONS_DIR, { recursive: true })

  const svgBuf = Buffer.from(SVG)

  for (const size of SIZES) {
    const outPath = path.join(ICONS_DIR, `icon-${size}.png`)
    await sharp(svgBuf).resize(size, size).png().toFile(outPath)
    console.log(`✅ ${outPath}`)
  }

  // Maskable version (add safe zone padding = 10%)
  const maskable = path.join(ICONS_DIR, 'icon-512-maskable.png')
  await sharp(svgBuf)
    .resize(460, 460)                        // 90% of 512
    .extend({ top:26, bottom:26, left:26, right:26, background:{r:15,g:17,b:23,alpha:1} })
    .png()
    .toFile(maskable)
  console.log(`✅ ${maskable}`)

  // Apple touch icon (180x180, no rounded corners — iOS adds them)
  const apple = path.join(__dirname, 'public', 'apple-touch-icon.png')
  await sharp(svgBuf).resize(180, 180).png().toFile(apple)
  console.log(`✅ ${apple}`)

  console.log('\n🎉 All icons generated! Add them to your public/ folder.')
}

function generateSVGFallbacks() {
  // If sharp isn't available, write SVG files as placeholders
  // They won't satisfy Chrome's PNG requirement but work for dev
  fs.mkdirSync(ICONS_DIR, { recursive: true })
  for (const size of [...SIZES, 'maskable-512']) {
    const s = typeof size === 'number' ? size : 512
    const out = path.join(ICONS_DIR, `icon-${size}.svg`)
    const svg = SVG.replace('viewBox="0 0 512 512"', `viewBox="0 0 512 512" width="${s}" height="${s}"`)
    fs.writeFileSync(out, svg)
    console.log(`📄 ${out} (SVG placeholder — install sharp for PNG)`)
  }
}

generate().catch(console.error)
