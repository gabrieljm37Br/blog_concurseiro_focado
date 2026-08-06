const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Base SVG function for App Icon
function generateIconSvg(size, isMaskable = false) {
  const padding = isMaskable ? Math.round(size * 0.2) : Math.round(size * 0.1);
  const contentSize = size - padding * 2;

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#0B0F19" />
      </linearGradient>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#10B981" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#3B82F6" stop-opacity="0.1" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="${size}" height="${size}" rx="${isMaskable ? 0 : Math.round(size * 0.22)}" fill="url(#bgGrad)" />
    
    <!-- Inner Glow Border -->
    <rect x="${Math.round(size * 0.04)}" y="${Math.round(size * 0.04)}" 
          width="${size - Math.round(size * 0.08)}" height="${size - Math.round(size * 0.08)}" 
          rx="${isMaskable ? 0 : Math.round(size * 0.18)}" 
          fill="none" stroke="url(#glowGrad)" stroke-width="${Math.max(2, Math.round(size * 0.015))}" />

    <!-- Scaled Brand Logo Icon centered -->
    <g transform="translate(${padding}, ${padding}) scale(${contentSize / 100})">
      <!-- Outer Target Ring -->
      <circle cx="42" cy="52" r="34" stroke-width="10" stroke="#FFFFFF" />

      <!-- Inner Emerald Green Ring -->
      <circle cx="42" cy="52" r="21" stroke="#10B981" stroke-width="8" fill="none" />

      <!-- Center Bullseye Dot -->
      <circle cx="42" cy="52" r="6" fill="#FFFFFF" />

      <!-- Target Cutout Gap for Pencil -->
      <path d="M 42 52 L 72 22" stroke-width="8" stroke-linecap="round" stroke="#0B0F19" />

      <!-- Pencil Body -->
      <path d="M 52 42 L 80 14 C 82 12 85 12 87 14 L 90 17 C 92 19 92 22 90 24 L 62 52 Z" fill="#F8FAFC" />

      <!-- Pencil Silver Ring -->
      <path d="M 76 18 L 84 26" stroke-width="3" stroke="#CBD5E1" />

      <!-- Pencil Gold Tip -->
      <polygon points="44,50 56,40 50,56" fill="#F59E0B" />
      <polygon points="44,50 48,46 46,48" fill="#0F172A" />
    </g>
  </svg>
  `;
}

async function buildIcons() {
  console.log('Gerando ícones PWA...');

  // 192x192 Standard
  const svg192 = Buffer.from(generateIconSvg(192, false));
  await sharp(svg192).png().toFile(path.join(iconsDir, 'icon-192.png'));
  console.log('✓ Icon 192x192 criado');

  // 512x512 Standard
  const svg512 = Buffer.from(generateIconSvg(512, false));
  await sharp(svg512).png().toFile(path.join(iconsDir, 'icon-512.png'));
  console.log('✓ Icon 512x512 criado');

  // 512x512 Maskable
  const svgMaskable = Buffer.from(generateIconSvg(512, true));
  await sharp(svgMaskable).png().toFile(path.join(iconsDir, 'maskable-icon-512.png'));
  console.log('✓ Maskable Icon 512x512 criado');

  // 180x180 Apple Touch Icon
  const svgApple = Buffer.from(generateIconSvg(180, false));
  await sharp(svgApple).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('✓ Apple Touch Icon 180x180 criado');

  console.log('Todos os ícones PWA foram gerados com sucesso!');
}

buildIcons().catch(err => {
  console.error('Erro ao gerar ícones:', err);
  process.exit(1);
});
