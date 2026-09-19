/**
 * Fitventure - Environment Renderer
 * Perspective: 2.5D Top-Down Orthographic
 * Recreates the Eatventure stage layout adapted for a Clothing Boutique:
 * Asphalt street, zebra crosswalk, sidewalk, boutique parquet floor,
 * striped awning canopy, lush side hedges, and dark red pavement band.
 */

import { GAME_CONFIG } from './config.js';

export function drawEnvironment(scene) {
  const g = scene.add.graphics();
  const { width, height, colors } = GAME_CONFIG;

  // 1. TOP ASPHALT STREET (y: 0 to 180)
  g.fillStyle(colors.asphalt, 1.0);
  g.fillRect(0, 0, width, 180);

  // Road markings - subtle road texture / gutter lines
  g.lineStyle(3, 0x22262c, 0.8);
  g.lineBetween(0, 178, width, 178);

  // Dashed lane divider at top of road
  g.lineStyle(4, 0xf1c40f, 0.6);
  for (let x = 20; x < width; x += 60) {
    g.lineBetween(x, 25, x + 35, 25);
  }

  // WHITE CROSSWALK STRIPES (Zebra Crossing) centered at x: 360
  // Pedestrians use this crosswalk to walk into the boutique
  const stripeWidth = 140;
  const stripeHeight = 14;
  const stripeStartX = 360 - stripeWidth / 2;
  g.fillStyle(colors.crosswalk, 0.95);
  for (let y = 45; y < 175; y += 22) {
    g.fillRoundedRect(stripeStartX, y, stripeWidth, stripeHeight, 3);
  }

  // 2. CONCRETE SIDEWALK (y: 180 to 260)
  g.fillStyle(colors.sidewalk, 1.0);
  g.fillRect(0, 180, width, 80);

  // Sidewalk curb highlight & drop shadow
  g.fillStyle(0xffffff, 0.4);
  g.fillRect(0, 180, width, 3); // top curb light
  g.fillStyle(colors.curb, 1.0);
  g.fillRect(0, 183, width, 4); // curb face

  // Sidewalk concrete expansion joint lines
  g.lineStyle(2, 0xbdc3c7, 0.7);
  for (let x = 60; x < width; x += 100) {
    g.lineBetween(x, 187, x, 260);
  }

  // Sidewalk edge transition to boutique threshold
  g.fillStyle(0x7f8c8d, 0.5);
  g.fillRect(0, 257, width, 3);

  // 3. BOUTIQUE INTERIOR PARQUET FLOOR (y: 260 to 1100)
  g.fillStyle(colors.boutiqueFloor, 1.0);
  g.fillRect(0, 260, width, 840);

  // Boutique wood floor planks / tiles
  const tileSize = 60;
  g.lineStyle(1, 0xe8e2d5, 0.6);
  for (let y = 260; y < 1100; y += tileSize) {
    g.lineBetween(0, y, width, y);
  }
  for (let x = 0; x < width; x += tileSize) {
    g.lineBetween(x, 260, x, 1100);
  }

  // Checkered boutique rug runner framing the horizontal customer counter slots
  g.fillStyle(0xede8df, 0.55);
  g.fillRect(250, 260, 220, 180);

  // Warm boutique parquet inlay under Sewing Table workstation (y: 640)
  g.fillStyle(0xe2ded4, 0.45);
  g.fillRoundedRect(220, 580, 280, 130, 12);

  // Designated floor pad under Zone 2 Jeans & Hats station (y: 890)
  g.fillStyle(0xe2ded4, 0.45);
  g.fillRoundedRect(210, 820, 300, 140, 16);

  // 4. DARK RED PAVEMENT BAND AT BOTTOM (y: 1100 to 1280)
  g.fillStyle(colors.bottomDeckRed, 1.0);
  g.fillRect(0, 1100, width, 180);

  // Bottom curb trim and brick joint styling
  g.fillStyle(0xb53c3c, 1.0);
  g.fillRect(0, 1100, width, 4); // highlight bevel
  g.lineStyle(2, 0x782020, 0.6);
  g.lineBetween(0, 1104, width, 1104);

  // Paver tile joints on the red band
  for (let y = 1104; y < height; y += 45) {
    g.lineBetween(0, y, width, y);
    const offsetX = (Math.floor((y - 1104) / 45) % 2) * 45;
    for (let x = offsetX; x < width; x += 90) {
      g.lineBetween(x, y, x, y + 45);
    }
  }

  // 5. SIDE GREEN HEDGES & BOUTIQUE WALLS
  // Left hedge wall (x: 0 to 55)
  drawHedgeColumn(g, 25, 260, 1080, colors.hedgeGreen, colors.hedgeGreenDark);
  // Right hedge wall (x: 665 to 720)
  drawHedgeColumn(g, 695, 260, 1080, colors.hedgeGreen, colors.hedgeGreenDark);

  // 6. BOUTIQUE THEMATIC FURNITURE & DECORATIONS
  drawBoutiqueDecor(scene);

  // 7. YELLOW-AND-WHITE STRIPED AWNING CANOPY OVER ENTRANCE & COUNTER
  drawAwningCanopy(scene, 170, 220, 380, 70);

  return g;
}

/**
 * Draws rounded organic hedge shrub columns along the shop perimeter
 */
function drawHedgeColumn(g, centerX, startY, endY, colorLight, colorDark) {
  const radius = 26;
  for (let y = startY + radius; y <= endY - radius; y += 38) {
    // Soft shadow
    g.fillStyle(0x000000, 0.2);
    g.fillCircle(centerX + 3, y + 4, radius);
    // Dark foliage base
    g.fillStyle(colorDark, 1.0);
    g.fillCircle(centerX, y, radius);
    // Light foliage highlight for 2.5D roundness
    g.fillStyle(colorLight, 1.0);
    g.fillCircle(centerX - 3, y - 4, radius * 0.75);
    // Tiny bright leaf accents
    g.fillStyle(0x55e6c1, 0.4);
    g.fillCircle(centerX - 5, y - 6, 5);
  }
}

/**
 * Draws high-end clothing boutique props (T-shirt racks, mirror, plant, accessories shelf)
 */
function drawBoutiqueDecor(scene) {
  const g = scene.add.graphics();

  // LEFT WALL: T-Shirt Display Rack
  // Shadow
  g.fillStyle(0x000000, 0.15);
  g.fillRoundedRect(75, 480, 34, 160, 6);
  // Metal frame
  g.fillStyle(0x2c3e50, 1.0);
  g.fillRoundedRect(72, 475, 30, 155, 4);
  // Hanging clothes bar
  g.fillStyle(0xbdc3c7, 1.0);
  g.fillRect(85, 485, 4, 135);

  // Mini colorful hanging tees on rack
  const shirtColors = [0xe74c3c, 0x3498db, 0xf1c40f, 0x9b59b6, 0x1abc9c];
  shirtColors.forEach((color, i) => {
    const sy = 495 + i * 26;
    // Hanger hook
    g.lineStyle(2, 0x7f8c8d, 1);
    g.strokeCircle(87, sy - 2, 4);
    // Shirt body
    g.fillStyle(color, 1.0);
    g.fillRoundedRect(77, sy + 3, 20, 18, 3);
  });

  // RIGHT WALL: Boutique Full-Length Fitting Mirror
  // Shadow
  g.fillStyle(0x000000, 0.15);
  g.fillRoundedRect(615, 480, 36, 150, 6);
  // Gold gilded frame
  g.fillStyle(0xd4af37, 1.0);
  g.fillRoundedRect(612, 475, 32, 145, 6);
  // Mirror glass pane
  g.fillStyle(0xe0f7fa, 0.85);
  g.fillRoundedRect(616, 480, 24, 135, 4);
  // Diagonal glass glare shine
  g.fillStyle(0xffffff, 0.5);
  g.beginPath();
  g.moveTo(618, 490);
  g.lineTo(636, 482);
  g.lineTo(628, 530);
  g.lineTo(618, 540);
  g.closePath();
  g.fillPath();

  // BOTTOM LEFT: Decorative Potted Ficus Tree
  g.fillStyle(0x000000, 0.2);
  g.fillCircle(115, 1025, 24);
  g.fillStyle(0xc0392b, 1.0); // terracotta pot
  g.fillCircle(112, 1020, 20);
  g.fillStyle(0x27ae60, 1.0); // foliage
  g.fillCircle(112, 1012, 17);
  g.fillStyle(0x2ecc71, 1.0);
  g.fillCircle(110, 1008, 12);

  // BOTTOM RIGHT: Accessories & Hat Display Shelf
  g.fillStyle(0x000000, 0.15);
  g.fillRoundedRect(605, 995, 38, 55, 6);
  g.fillStyle(0x8d6e63, 1.0);
  g.fillRoundedRect(602, 990, 34, 50, 6);
  // Mini hat on shelf
  g.fillStyle(0xf39c12, 1.0);
  g.fillCircle(619, 1005, 8);
  g.fillRect(611, 1007, 16, 3);
}

/**
 * Draws the iconic Eatventure-style striped awning canopy with 2.5D perspective
 */
function drawAwningCanopy(scene, x, y, width, depth) {
  const g = scene.add.graphics();
  const stripeCount = 10;
  const stripeWidth = width / stripeCount;

  // Awning soft drop shadow on ground
  g.fillStyle(0x000000, 0.28);
  g.fillRoundedRect(x - 6, y + depth + 4, width + 12, 28, 12);

  // Awning sloped fabric panels
  for (let i = 0; i < stripeCount; i++) {
    const isYellow = i % 2 === 0;
    const sx = x + i * stripeWidth;
    
    // Top sloped body of awning
    g.fillStyle(isYellow ? GAME_CONFIG.colors.awningYellow : GAME_CONFIG.colors.awningWhite, 1.0);
    g.beginPath();
    g.moveTo(sx, y);
    g.lineTo(sx + stripeWidth, y);
    g.lineTo(sx + stripeWidth, y + depth);
    g.lineTo(sx, y + depth);
    g.closePath();
    g.fillPath();

    // Side shading for depth
    g.fillStyle(0x000000, 0.08);
    g.fillRect(sx + stripeWidth - 2, y, 2, depth);

    // Front scalloped valance (rounded wavy bottom edge)
    g.fillStyle(isYellow ? GAME_CONFIG.colors.awningYellow : GAME_CONFIG.colors.awningWhite, 1.0);
    g.fillCircle(sx + stripeWidth / 2, y + depth + 4, stripeWidth / 2);
    g.fillStyle(0x000000, 0.06);
    g.fillCircle(sx + stripeWidth / 2, y + depth + 5, stripeWidth / 2 - 2);
  }

  // Top metallic mounting rod
  g.fillStyle(0x2c3e50, 0.9);
  g.fillRect(x - 8, y - 4, width + 16, 6);
  g.fillCircle(x - 8, y - 1, 5);
  g.fillCircle(x + width + 8, y - 1, 5);
}
