/**
 * Fitventure - Environment Renderer
 * Perspective: 2.5D Top-Down Orthographic
 * Recreates the Eatventure stage layout adapted for a Boutique:
 * Soft asphalt grey road, subtle concrete sidewalk, warm boutique parquet floor,
 * pastel blue/white striped umbrellas flanking the counter, lush side hedges,
 * and rich 2.5D drop shadows giving grounded depth.
 */

import { GAME_CONFIG } from './config.js';

export function drawEnvironment(scene) {
  const g = scene.add.graphics();
  const { width, height, colors } = GAME_CONFIG;

  // 1. TOP SOFT ASPHALT GREY ROAD (y: 0 to 180)
  g.fillStyle(colors.asphalt, 1.0);
  g.fillRect(0, 0, width, 180);

  // Road markings - subtle road texture / gutter lines
  g.lineStyle(3, colors.asphaltMarking, 0.8);
  g.lineBetween(0, 178, width, 178);

  // Dashed lane divider at top of road
  g.lineStyle(4, 0xf1c40f, 0.55);
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

  // 2. SUBTLE CONCRETE SIDEWALK (y: 180 to 260)
  g.fillStyle(colors.sidewalk, 1.0);
  g.fillRect(0, 180, width, 80);

  // Sidewalk curb highlight & drop shadow
  g.fillStyle(0xffffff, 0.5);
  g.fillRect(0, 180, width, 3); // top curb light
  g.fillStyle(colors.curb, 1.0);
  g.fillRect(0, 183, width, 4); // curb face
  g.fillStyle(colors.curbShadow, 0.6);
  g.fillRect(0, 187, width, 2);

  // Sidewalk concrete expansion joint lines
  g.lineStyle(2, 0xcfd8dc, 0.8);
  for (let x = 60; x < width; x += 100) {
    g.lineBetween(x, 189, x, 260);
  }

  // Sidewalk edge transition to boutique threshold
  g.fillStyle(0x94a3b8, 0.5);
  g.fillRect(0, 257, width, 3);

  // 3. BOUTIQUE INTERIOR PARQUET FLOOR (y: 260 to 1100)
  g.fillStyle(colors.boutiqueFloor, 1.0);
  g.fillRect(0, 260, width, 840);

  // Boutique wood floor planks / parquet grid
  const tileSize = 60;
  g.lineStyle(1, colors.boutiquePlank, 0.65);
  for (let y = 260; y < 1100; y += tileSize) {
    g.lineBetween(0, y, width, y);
  }
  for (let x = 0; x < width; x += tileSize) {
    g.lineBetween(x, 260, x, 1100);
  }

  // Checkered boutique rug runner framing the horizontal customer counter service slots
  g.fillStyle(colors.rugFill, 0.6);
  g.fillRoundedRect(220, 260, 280, 180, 8);
  g.lineStyle(2, colors.rugBorder, 0.8);
  g.strokeRoundedRect(220, 260, 280, 180, 8);

  // Elegant parquet inlay rug under the tightly positioned Sewing Workstation (y: 585)
  g.fillStyle(colors.rugFill, 0.7);
  g.fillRoundedRect(190, 520, 340, 140, 16);
  g.lineStyle(2, colors.rugBorder, 0.9);
  g.strokeRoundedRect(190, 520, 340, 140, 16);

  // 4. DARK RED PAVEMENT BAND AT BOTTOM DOCK (y: 1100 to 1280)
  g.fillStyle(colors.bottomDeckRed, 1.0);
  g.fillRect(0, 1100, width, 180);

  // Bottom curb trim and brick joint styling
  g.fillStyle(colors.bottomDeckBevel, 1.0);
  g.fillRect(0, 1100, width, 5); // highlight bevel
  g.lineStyle(2, 0x4c0519, 0.6);
  g.lineBetween(0, 1105, width, 1105);

  // Paver tile joints on the red band
  for (let y = 1105; y < height; y += 45) {
    g.lineBetween(0, y, width, y);
    const offsetX = (Math.floor((y - 1105) / 45) % 2) * 45;
    for (let x = offsetX; x < width; x += 90) {
      g.lineBetween(x, y, x, y + 45);
    }
  }

  // 5. SIDE GREEN HEDGES & BOUTIQUE WALLS
  // Left hedge column (x: 28)
  drawHedgeColumn(g, 28, 260, 1080, 0x22c55e, 0x15803d);
  // Right hedge column (x: 692)
  drawHedgeColumn(g, 692, 260, 1080, 0x22c55e, 0x15803d);

  // 6. PASTEL BLUE/WHITE STRIPED UMBRELLAS FLANKING THE COUNTER
  // Flanking left (x: 125, y: 405) and right (x: 595, y: 405)
  drawStripedUmbrella(scene, GAME_CONFIG.layout.umbrellas.left.x, GAME_CONFIG.layout.umbrellas.left.y);
  drawStripedUmbrella(scene, GAME_CONFIG.layout.umbrellas.right.x, GAME_CONFIG.layout.umbrellas.right.y);

  // 7. BOUTIQUE THEMATIC FURNITURE & DECORATIONS (With 2.5D Drop Shadows)
  drawBoutiqueDecor(scene);

  // 8. ENTRANCE AWNING CANOPY (y: 220 to 290)
  drawAwningCanopy(scene, 170, 220, 380, 70);

  return g;
}

/**
 * Draws rounded organic hedge shrub columns along the boutique perimeter
 */
function drawHedgeColumn(g, centerX, startY, endY, colorLight, colorDark) {
  const radius = 26;
  for (let y = startY + radius; y <= endY - radius; y += 38) {
    // 2.5D Drop Shadow
    g.fillStyle(0x000000, 0.22);
    g.fillEllipse(centerX + 2, y + 6, radius * 2, radius * 1.2);

    // Dark foliage base
    g.fillStyle(colorDark, 1.0);
    g.fillCircle(centerX, y, radius);

    // Light foliage highlight for 2.5D roundness
    g.fillStyle(colorLight, 1.0);
    g.fillCircle(centerX - 3, y - 4, radius * 0.75);

    // Bright leaf accents
    g.fillStyle(0x86efac, 0.45);
    g.fillCircle(centerX - 5, y - 6, 5);
  }
}

/**
 * Draws Pastel Blue & White Striped Patio Umbrella with Grounding Drop Shadow
 */
export function drawStripedUmbrella(scene, x, y) {
  const container = scene.add.container(x, y);
  container.setDepth(9); // Render alongside workstation furniture

  const g = scene.add.graphics();
  container.add(g);

  // 1. Soft Translucent Dark Oval Drop Shadow directly under umbrella base
  g.fillStyle(0x000000, 0.25);
  g.fillEllipse(0, 65, 56, 22);

  // 2. Weighted Cast Iron Base
  g.fillStyle(0x334155, 1.0);
  g.fillCircle(0, 60, 16);
  g.fillStyle(0x1e293b, 1.0);
  g.fillCircle(0, 60, 10);

  // 3. Polished Teak Wood / Steel Pole
  g.fillStyle(0x64748b, 1.0);
  g.fillRect(-3, -15, 6, 75);
  g.fillStyle(0x94a3b8, 1.0);
  g.fillRect(-1, -15, 2, 75);

  // 4. Parasol Canopy Shadow on top of pole
  g.fillStyle(0x000000, 0.18);
  g.fillEllipse(0, 10, 88, 36);

  // 5. Pastel Blue and White Striped Canopy (8 Radial Segments)
  const radius = 54;
  const segments = 8;
  const colors = [GAME_CONFIG.colors.umbrellaBlue, GAME_CONFIG.colors.umbrellaWhite];

  for (let i = 0; i < segments; i++) {
    const startAngle = (i * 2 * Math.PI) / segments;
    const endAngle = ((i + 1) * 2 * Math.PI) / segments;
    const color = colors[i % 2];

    g.fillStyle(color, 1.0);
    g.beginPath();
    g.moveTo(0, -10); // Canopy Apex
    // 2.5D perspective ellipse for canopy perimeter
    const x1 = Math.cos(startAngle) * radius;
    const y1 = Math.sin(startAngle) * (radius * 0.58);
    const x2 = Math.cos(endAngle) * radius;
    const y2 = Math.sin(endAngle) * (radius * 0.58);
    g.lineTo(x1, y1);
    g.lineTo(x2, y2);
    g.closePath();
    g.fillPath();

    // Subtle edge scalloped valance
    g.fillStyle(color, 1.0);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    g.fillCircle(midX, midY + 3, 5);

    // Shading on lower half
    if (midY > 0) {
      g.fillStyle(0x000000, 0.08);
      g.fillCircle(midX, midY + 3, 5);
    }
  }

  // Outer rim outline for crisp Eatventure styling
  g.lineStyle(2, 0x60a5fa, 0.6);
  g.strokeEllipse(0, 0, radius * 2, radius * 1.16);

  // 6. Polished Brass Finial on Top
  g.fillStyle(0xf1c40f, 1.0);
  g.fillCircle(0, -12, 6);
  g.fillStyle(0xfef08a, 1.0);
  g.fillCircle(-1, -14, 2);

  return container;
}

/**
 * Draws High-End Boutique Props (Racks, Fitting Booth, Plants, Lounge Seating)
 * All props have soft translucent dark oval drop shadows to give grounding depth.
 */
function drawBoutiqueDecor(scene) {
  const g = scene.add.graphics();
  g.setDepth(6);

  // --- LEFT WALL (Upper): Boutique T-Shirt Display Rack ---
  // 2.5D Drop Shadow
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(90, 580, 48, 20);

  // Black iron metal rack frame
  g.fillStyle(0x1e293b, 1.0);
  g.fillRoundedRect(72, 475, 32, 100, 4);
  g.fillStyle(0x475569, 1.0);
  g.fillRect(86, 482, 4, 85); // hanging bar

  // Mini colorful tees on display rack
  const shirtColors = [0xef4444, 0x3b82f6, 0xf59e0b, 0x8b5cf6, 0x10b981];
  shirtColors.forEach((color, i) => {
    const sy = 490 + i * 16;
    g.lineStyle(2, 0x94a3b8, 1);
    g.strokeCircle(88, sy - 2, 4);
    g.fillStyle(color, 1.0);
    g.fillRoundedRect(78, sy + 2, 20, 13, 3);
  });

  // --- LEFT WALL (Lower): Luxury Fitting Booth with Velvet Curtain ---
  // 2.5D Drop Shadow
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(92, 810, 56, 22);

  // Booth frame
  g.fillStyle(0x334155, 1.0);
  g.fillRoundedRect(68, 700, 46, 105, 6);
  // Interior mirror glimpse
  g.fillStyle(0xe0f2fe, 0.8);
  g.fillRect(72, 705, 38, 95);
  // Rich Royal Purple Velvet Drape / Curtain
  g.fillStyle(0x7e22ce, 1.0);
  g.fillRoundedRect(68, 700, 32, 105, 4);
  // Curtain pleat folds
  g.fillStyle(0x581c87, 0.7);
  g.fillRect(76, 700, 5, 105);
  g.fillRect(88, 700, 4, 105);
  // Brass curtain rings
  g.fillStyle(0xf1c40f, 1.0);
  g.fillCircle(78, 698, 3);
  g.fillCircle(90, 698, 3);

  // --- RIGHT WALL (Upper): Boutique Fitting Mirror ---
  // 2.5D Drop Shadow
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(632, 580, 50, 20);

  // Gold gilded ornate frame
  g.fillStyle(0xd97706, 1.0);
  g.fillRoundedRect(614, 475, 34, 100, 6);
  g.fillStyle(0xfbbf24, 1.0);
  g.fillRoundedRect(616, 477, 30, 96, 4);

  // Mirror glass pane
  g.fillStyle(0xe0f2fe, 0.88);
  g.fillRoundedRect(618, 480, 26, 90, 3);

  // Glass diagonal sheen/reflection
  g.fillStyle(0xffffff, 0.55);
  g.beginPath();
  g.moveTo(620, 490);
  g.lineTo(638, 484);
  g.lineTo(632, 520);
  g.lineTo(620, 530);
  g.closePath();
  g.fillPath();

  // --- RIGHT WALL (Lower): Fashion Display Mannequin with Designer Dress ---
  // 2.5D Drop Shadow
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(628, 805, 46, 18);

  // Wooden tripod stand
  g.fillStyle(0x78350f, 1.0);
  g.fillRect(626, 745, 4, 55);
  g.fillCircle(628, 800, 10);

  // Mannequin torso & fashionable coral dress
  g.fillStyle(0xf43f5e, 1.0);
  g.fillRoundedRect(616, 705, 24, 42, 6);
  // Gold belt cinch
  g.fillStyle(0xf1c40f, 1.0);
  g.fillRect(616, 725, 24, 4);
  // Chic neck form
  g.fillStyle(0xd97706, 1.0);
  g.fillCircle(628, 700, 6);

  // --- BOTTOM LOUNGE AREA: Chic Boutique Waiting Sofa (x: 360, y: 940) ---
  // Gives cozy grounding to the lower boutique area without empty space!
  // 2.5D Drop Shadow under sofa
  g.fillStyle(0x000000, 0.22);
  g.fillEllipse(360, 975, 250, 42);

  // Warm Scandinavian sofa body (warm beige fabric)
  g.fillStyle(0xd6c7b2, 1.0);
  g.fillRoundedRect(245, 915, 230, 55, 14);

  // Sofa seat cushions
  g.fillStyle(0xe8ddcc, 1.0);
  g.fillRoundedRect(252, 920, 105, 42, 8);
  g.fillRoundedRect(363, 920, 105, 42, 8);

  // Colorful boutique accent throw pillows
  g.fillStyle(0x3b82f6, 1.0);
  g.fillRoundedRect(256, 924, 24, 24, 5);
  g.fillStyle(0xf59e0b, 1.0);
  g.fillRoundedRect(440, 924, 24, 24, 5);

  // Sofa wooden tapered legs
  g.fillStyle(0x78350f, 1.0);
  g.fillRect(255, 965, 8, 12);
  g.fillRect(457, 965, 8, 12);

  // --- POTTED FICUS TREES (Flanking Sofa) ---
  // Left Tree (x: 170, y: 945)
  g.fillStyle(0x000000, 0.24);
  g.fillEllipse(170, 965, 46, 18);
  g.fillStyle(0xb45309, 1.0); // terracotta pot
  g.fillRoundedRect(156, 935, 28, 26, 4);
  g.fillStyle(0x15803d, 1.0); // foliage
  g.fillCircle(170, 925, 22);
  g.fillStyle(0x22c55e, 1.0);
  g.fillCircle(168, 920, 16);

  // Right Tree (x: 550, y: 945)
  g.fillStyle(0x000000, 0.24);
  g.fillEllipse(550, 965, 46, 18);
  g.fillStyle(0xb45309, 1.0);
  g.fillRoundedRect(536, 935, 28, 26, 4);
  g.fillStyle(0x15803d, 1.0);
  g.fillCircle(550, 925, 22);
  g.fillStyle(0x22c55e, 1.0);
  g.fillCircle(548, 920, 16);
}

/**
 * Draws the iconic Eatventure-style striped awning canopy with 2.5D perspective
 */
function drawAwningCanopy(scene, x, y, width, depth) {
  const g = scene.add.graphics();
  g.setDepth(18); // Floats above walking customers

  const stripeCount = 10;
  const stripeWidth = width / stripeCount;

  // Awning soft drop shadow on ground
  g.fillStyle(0x000000, 0.25);
  g.fillRoundedRect(x - 6, y + depth + 4, width + 12, 24, 10);

  // Awning sloped fabric panels
  for (let i = 0; i < stripeCount; i++) {
    const isYellow = i % 2 === 0;
    const sx = x + i * stripeWidth;

    // Top sloped body of awning
    g.fillStyle(isYellow ? 0xf59e0b : 0xf8fafc, 1.0);
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

    // Front scalloped valance
    g.fillStyle(isYellow ? 0xf59e0b : 0xf8fafc, 1.0);
    g.fillCircle(sx + stripeWidth / 2, y + depth + 4, stripeWidth / 2);
    g.fillStyle(0x000000, 0.06);
    g.fillCircle(sx + stripeWidth / 2, y + depth + 5, stripeWidth / 2 - 2);
  }

  // Top metallic mounting rod
  g.fillStyle(0x1e293b, 0.9);
  g.fillRect(x - 8, y - 4, width + 16, 6);
  g.fillCircle(x - 8, y - 1, 5);
  g.fillCircle(x + width + 8, y - 1, 5);
}
