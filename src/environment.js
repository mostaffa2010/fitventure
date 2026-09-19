/**
 * Fitventure - Environment & World Renderer
 * Perspective: 2.5D Top-Down Orthographic (Eatventure Proportions)
 * Implements:
 * 1. Wide asphalt street with pedestrian zebra crossing.
 * 2. Animated colorful cars driving across with puffing exhaust smoke particles.
 * 3. Stage 1 Theme: Outdoor Sidewalk Boutique Kiosk with yellow awning & patio umbrellas.
 * 4. Stage 2 Theme: Customized Fashion Van / Mobile Boutique (food-truck vehicle with open window).
 * 5. Grounding 2.5D translucent dark oval drop shadows.
 */

import { GAME_CONFIG, gameState } from './config.js';

/**
 * Traffic Manager: Drives stylized colorful 2.5D cars across the top street
 * with puffing exhaust smoke particles.
 */
export class TrafficManager {
  constructor(scene, parentContainer) {
    this.scene = scene;
    this.container = parentContainer;
    this.cars = [];

    // Car models palette
    this.carModels = [
      { body: 0xef4444, roof: 0xb91c1c, name: 'Red Sportster' },
      { body: 0xf59e0b, roof: 0xd97706, name: 'Yellow Cab' },
      { body: 0x0ea5e9, roof: 0x0284c7, name: 'Cyan Hatchback' },
      { body: 0x8b5cf6, roof: 0x6d28d9, name: 'Purple Cruiser' },
      { body: 0x10b981, roof: 0x047857, name: 'Mint Compact' }
    ];

    // Spawn timer: spawns a car every 3.5 - 5 seconds
    this.spawnTimer = scene.time.addEvent({
      delay: 3800,
      callback: () => this.spawnCar(),
      loop: true
    });

    // Spawn first car immediately
    scene.time.delayedCall(800, () => this.spawnCar());
  }

  spawnCar() {
    const model = Phaser.Utils.Array.GetRandom(this.carModels);
    const laneY = Phaser.Math.Between(0, 1) === 0 ? 68 : 112; // Two street lanes
    const speed = laneY === 68 ? Phaser.Math.Between(150, 190) : Phaser.Math.Between(130, 170);
    const duration = (860 / speed) * 1000;

    const car = this.scene.add.container(-90, laneY);
    car.setDepth(4);
    this.container.add(car);

    const g = this.scene.add.graphics();
    car.add(g);

    const w = 78;
    const h = 38;

    // 1. Drop shadow under car
    g.fillStyle(0x000000, 0.28);
    g.fillEllipse(0, h / 2 + 4, w * 1.05, 18);

    // 2. Wheels
    g.fillStyle(0x0f172a, 1.0);
    g.fillRoundedRect(-w / 2 + 10, -h / 2 - 3, 14, 6, 2);
    g.fillRoundedRect(w / 2 - 24, -h / 2 - 3, 14, 6, 2);
    g.fillRoundedRect(-w / 2 + 10, h / 2 - 3, 14, 6, 2);
    g.fillRoundedRect(w / 2 - 24, h / 2 - 3, 14, 6, 2);

    // 3. Car Body
    g.fillStyle(model.body, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 9);

    // Side shading
    g.fillStyle(0x000000, 0.12);
    g.fillRoundedRect(-w / 2, h / 2 - 6, w, 6, { tl: 0, tr: 0, bl: 9, br: 9 });

    // 4. Cabin & Windshield
    g.fillStyle(model.roof, 1.0);
    g.fillRoundedRect(-w / 2 + 14, -h / 2 + 4, w - 28, h - 8, 6);

    // Front windshield
    g.fillStyle(0x38bdf8, 0.85);
    g.fillRoundedRect(w / 2 - 22, -h / 2 + 6, 6, h - 12, 2);
    // Rear windshield
    g.fillRoundedRect(-w / 2 + 16, -h / 2 + 6, 5, h - 12, 2);

    // 5. Headlights & Taillights
    g.fillStyle(0xfef08a, 1.0);
    g.fillCircle(w / 2 - 2, -h / 2 + 6, 3);
    g.fillCircle(w / 2 - 2, h / 2 - 6, 3);

    g.fillStyle(0xef4444, 1.0);
    g.fillCircle(-w / 2 + 2, -h / 2 + 6, 2.5);
    g.fillCircle(-w / 2 + 2, h / 2 - 6, 2.5);

    // Periodic exhaust puff emitter while driving
    const exhaustTimer = this.scene.time.addEvent({
      delay: 160,
      callback: () => {
        if (!car.active) return;
        this.emitExhaustPuff(car.x - w / 2, car.y + h / 2 - 6);
      },
      loop: true
    });

    // Drive tween across screen
    this.scene.tweens.add({
      targets: car,
      x: 820,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        exhaustTimer.destroy();
        car.destroy();
      }
    });
  }

  emitExhaustPuff(x, y) {
    const puff = this.scene.add.graphics();
    puff.setDepth(3);
    puff.setPosition(x, y);
    this.container.add(puff);

    puff.fillStyle(0xe2e8f0, 0.6);
    puff.fillCircle(0, 0, Phaser.Math.Between(3, 5));

    this.scene.tweens.add({
      targets: puff,
      x: x - Phaser.Math.Between(15, 25),
      y: y + Phaser.Math.Between(-4, 4),
      scale: 2.2,
      alpha: 0,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => puff.destroy()
    });
  }
}

/**
 * Environment Manager: Handles rendering and live switching between Stage 1 & Stage 2
 */
export class EnvironmentManager {
  constructor(scene, parentContainer) {
    this.scene = scene;
    this.container = parentContainer;

    this.bgGraphics = scene.add.graphics();
    this.bgGraphics.setDepth(1);
    this.container.add(this.bgGraphics);

    this.propsGraphics = scene.add.graphics();
    this.propsGraphics.setDepth(6);
    this.container.add(this.propsGraphics);

    this.umbrellas = [];

    // Initialize Traffic on the street
    this.trafficManager = new TrafficManager(scene, parentContainer);

    // Initial draw based on current stage
    this.drawWorld(gameState.stage);

    // Listen for stage renovation
    gameState.on('stageRenovated', (data) => {
      this.drawWorld(data.stage);
    });
  }

  drawWorld(stage) {
    this.bgGraphics.clear();
    this.propsGraphics.clear();
    this.clearUmbrellas();

    const { width, colors } = GAME_CONFIG;

    // 1. TOP WIDE ASPHALT STREET (y: 0 to 180)
    this.bgGraphics.fillStyle(colors.asphalt, 1.0);
    this.bgGraphics.fillRect(0, 0, width, 180);

    // Road gutter line
    this.bgGraphics.lineStyle(3, colors.asphaltMarking, 0.8);
    this.bgGraphics.lineBetween(0, 178, width, 178);

    // Center lane divider dashes
    this.bgGraphics.lineStyle(4, 0xf1c40f, 0.5);
    for (let x = 15; x < width; x += 55) {
      this.bgGraphics.lineBetween(x, 90, x + 30, 90);
    }

    // WHITE ZEBRA CROSSWALK STRIPES (centered at x: 360)
    const stripeW = 120;
    const stripeH = 14;
    const stripeStartX = 360 - stripeW / 2;
    this.bgGraphics.fillStyle(colors.crosswalk, 0.95);
    for (let y = 30; y < 175; y += 22) {
      this.bgGraphics.fillRoundedRect(stripeStartX, y, stripeW, stripeH, 3);
    }

    // 2. CONCRETE SIDEWALK (y: 180 to 250)
    this.bgGraphics.fillStyle(colors.sidewalk, 1.0);
    this.bgGraphics.fillRect(0, 180, width, 70);

    // Curb highlight & face
    this.bgGraphics.fillStyle(0xffffff, 0.45);
    this.bgGraphics.fillRect(0, 180, width, 3);
    this.bgGraphics.fillStyle(colors.curb, 1.0);
    this.bgGraphics.fillRect(0, 183, width, 4);

    // Expansion joint lines
    this.bgGraphics.lineStyle(2, 0xcfd8dc, 0.8);
    for (let x = 60; x < width; x += 90) {
      this.bgGraphics.lineBetween(x, 187, x, 250);
    }

    if (stage === 1) {
      this.drawStage1Boutique();
    } else {
      this.drawStage2FashionVan();
    }
  }

  drawStage1Boutique() {
    const { width, colors } = GAME_CONFIG;

    // Boutique Interior Parquet Floor (y: 250 to 900)
    this.bgGraphics.fillStyle(colors.boutiqueFloor, 1.0);
    this.bgGraphics.fillRect(0, 250, width, 650);

    // Parquet plank lines
    const tileSize = 55;
    this.bgGraphics.lineStyle(1, colors.boutiquePlank, 0.6);
    for (let y = 250; y < 900; y += tileSize) {
      this.bgGraphics.lineBetween(0, y, width, y);
    }
    for (let x = 0; x < width; x += tileSize) {
      this.bgGraphics.lineBetween(x, 250, x, 900);
    }

    // Inlay woven runner rug framing counter and sewing station
    this.bgGraphics.fillStyle(0xf5eedf, 0.7);
    this.bgGraphics.fillRoundedRect(180, 250, 360, 480, 16);
    this.bgGraphics.lineStyle(2, 0xd6c7b2, 0.9);
    this.bgGraphics.strokeRoundedRect(180, 250, 360, 480, 16);

    // Side Hedge Columns
    this.drawHedgeColumn(this.bgGraphics, 28, 250, 900);
    this.drawHedgeColumn(this.bgGraphics, 692, 250, 900);

    // Flanking Patio Umbrellas (Left & Right of counter)
    this.umbrellas.push(drawStripedUmbrella(this.scene, this.container, GAME_CONFIG.layout.umbrellas.left.x, GAME_CONFIG.layout.umbrellas.left.y));
    this.umbrellas.push(drawStripedUmbrella(this.scene, this.container, GAME_CONFIG.layout.umbrellas.right.x, GAME_CONFIG.layout.umbrellas.right.y));

    // Boutique Decor Props
    this.drawStage1Props();

    // Entrance Awning Canopy
    this.drawAwningCanopy(180, 215, 360, 65);
  }

  drawStage2FashionVan() {
    const { width, colors } = GAME_CONFIG;

    // Outdoor Paver Lot Floor
    this.bgGraphics.fillStyle(0xe2e8f0, 1.0);
    this.bgGraphics.fillRect(0, 250, width, 650);

    // Stone paver grid
    this.bgGraphics.lineStyle(1, 0xcfd8dc, 0.7);
    for (let y = 250; y < 900; y += 45) {
      this.bgGraphics.lineBetween(0, y, width, y);
    }
    for (let x = 0; x < width; x += 45) {
      this.bgGraphics.lineBetween(x, 250, x, 900);
    }

    // --- THE CUSTOMIZED FASHION VAN / MOBILE BOUTIQUE VEHICLE ---
    // Ground Drop Shadow under the entire Van
    this.bgGraphics.fillStyle(0x000000, 0.28);
    this.bgGraphics.fillEllipse(360, 715, 460, 48);

    // 4 Van Wheels
    this.drawVanWheel(180, 710);
    this.drawVanWheel(540, 710);

    // Van Vehicle Body (Retro Food-Truck Chassis)
    const vanX = 360;
    const vanY = 515;
    const vanW = 440;
    const vanH = 370;

    // Retro Teal Van Body
    this.bgGraphics.fillStyle(colors.vanBody, 1.0);
    this.bgGraphics.fillRoundedRect(vanX - vanW / 2, vanY - vanH / 2, vanW, vanH, 24);

    // Van Roof Trim & Bevel
    this.bgGraphics.fillStyle(colors.vanRoof, 1.0);
    this.bgGraphics.fillRoundedRect(vanX - vanW / 2, vanY - vanH / 2, vanW, 28, { tl: 24, tr: 24, bl: 0, br: 0 });

    // Chrome Bumper
    this.bgGraphics.fillStyle(colors.vanChrome, 1.0);
    this.bgGraphics.fillRoundedRect(vanX - vanW / 2 - 8, vanY + vanH / 2 - 16, vanW + 16, 18, 8);

    // Open Service Window Hatch (Where customers order and counter sits!)
    const hatchW = 360;
    const hatchH = 290;
    this.bgGraphics.fillStyle(0x0f172a, 0.95);
    this.bgGraphics.fillRoundedRect(vanX - hatchW / 2, vanY - hatchH / 2 + 10, hatchW, hatchH, 12);

    // Warm Parquet Floor INSIDE the Mobile Van
    this.bgGraphics.fillStyle(colors.vanFloor, 1.0);
    this.bgGraphics.fillRoundedRect(vanX - hatchW / 2 + 8, vanY - hatchH / 2 + 18, hatchW - 16, hatchH - 24, 10);

    // Parquet lines inside van
    this.bgGraphics.lineStyle(1, 0xd4c0a5, 0.6);
    for (let py = vanY - hatchH / 2 + 20; py < vanY + hatchH / 2 - 10; py += 35) {
      this.bgGraphics.lineBetween(vanX - hatchW / 2 + 10, py, vanX + hatchW / 2 - 10, py);
    }

    // Flip-Up Window Awning Canopy
    this.drawVanAwning(vanX, vanY - hatchH / 2 + 10, hatchW + 20, 48);

    // Roof Luggage Rack with Designer Suitcases & Fabric
    this.drawRoofRack(vanX, vanY - vanH / 2);

    // Neon Boutique Sign on Roof
    this.drawNeonSign(vanX, vanY - vanH / 2 - 28);
  }

  drawVanWheel(x, y) {
    // Tire shadow
    this.bgGraphics.fillStyle(0x000000, 0.35);
    this.bgGraphics.fillEllipse(x, y + 6, 48, 16);
    // Tire rubber
    this.bgGraphics.fillStyle(0x0f172a, 1.0);
    this.bgGraphics.fillRoundedRect(x - 20, y - 18, 40, 36, 10);
    // Chrome Hubcap
    this.bgGraphics.fillStyle(0xe2e8f0, 1.0);
    this.bgGraphics.fillCircle(x, y, 11);
    this.bgGraphics.fillStyle(0x94a3b8, 1.0);
    this.bgGraphics.fillCircle(x, y, 6);
  }

  drawVanAwning(x, y, w, depth) {
    const stripeCount = 8;
    const sw = w / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      const isTeal = i % 2 === 0;
      const sx = x - w / 2 + i * sw;

      this.bgGraphics.fillStyle(isTeal ? 0x0d9488 : 0xf8fafc, 1.0);
      this.bgGraphics.beginPath();
      this.bgGraphics.moveTo(sx, y);
      this.bgGraphics.lineTo(sx + sw, y);
      this.bgGraphics.lineTo(sx + sw, y + depth);
      this.bgGraphics.lineTo(sx, y + depth);
      this.bgGraphics.closePath();
      this.bgGraphics.fillPath();

      // Scalloped bottom
      this.bgGraphics.fillCircle(sx + sw / 2, y + depth + 3, sw / 2);
    }
  }

  drawRoofRack(x, y) {
    // Metal rack
    this.bgGraphics.fillStyle(0x334155, 1.0);
    this.bgGraphics.fillRect(x - 160, y - 8, 320, 6);
    this.bgGraphics.fillRect(x - 150, y - 14, 6, 8);
    this.bgGraphics.fillRect(x + 144, y - 14, 6, 8);

    // Suitcase 1 (Cognac leather)
    this.bgGraphics.fillStyle(0xb45309, 1.0);
    this.bgGraphics.fillRoundedRect(x - 130, y - 30, 52, 24, 4);
    // Suitcase 2 (Navy)
    this.bgGraphics.fillStyle(0x1e3a8a, 1.0);
    this.bgGraphics.fillRoundedRect(x - 65, y - 28, 48, 22, 4);
    // Rolled Fabric Bundle
    this.bgGraphics.fillStyle(0xec4899, 1.0);
    this.bgGraphics.fillRoundedRect(x + 10, y - 26, 60, 20, 6);
    this.bgGraphics.fillStyle(0x3b82f6, 1.0);
    this.bgGraphics.fillRoundedRect(x + 80, y - 26, 50, 20, 6);
  }

  drawNeonSign(x, y) {
    const signG = this.scene.add.graphics();
    signG.setDepth(12);
    this.container.add(signG);

    signG.fillStyle(0x0f172a, 0.95);
    signG.fillRoundedRect(x - 140, y - 20, 280, 40, 10);
    signG.lineStyle(2, 0x14b8a6, 1.0);
    signG.strokeRoundedRect(x - 140, y - 20, 280, 40, 10);

    const txt = this.scene.add.text(x, y, '✨ FASHION VAN 🚚', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#5eead4'
    }).setOrigin(0.5).setDepth(13);
    this.container.add(txt);
  }

  drawHedgeColumn(g, centerX, startY, endY) {
    const radius = 24;
    for (let y = startY + radius; y <= endY - radius; y += 36) {
      g.fillStyle(0x000000, 0.22);
      g.fillEllipse(centerX + 2, y + 6, radius * 2, radius * 1.2);
      g.fillStyle(0x15803d, 1.0);
      g.fillCircle(centerX, y, radius);
      g.fillStyle(0x22c55e, 1.0);
      g.fillCircle(centerX - 3, y - 4, radius * 0.75);
    }
  }

  drawStage1Props() {
    const g = this.propsGraphics;

    // Left boutique rack with hanging clothes
    g.fillStyle(0x000000, 0.22);
    g.fillEllipse(90, 520, 44, 18);
    g.fillStyle(0x1e293b, 1.0);
    g.fillRoundedRect(72, 435, 32, 85, 4);
    g.fillStyle(0x475569, 1.0);
    g.fillRect(86, 442, 4, 70);

    const shirtColors = [0xef4444, 0x3b82f6, 0xf59e0b, 0x10b981];
    shirtColors.forEach((color, i) => {
      const sy = 450 + i * 16;
      g.fillStyle(color, 1.0);
      g.fillRoundedRect(78, sy, 20, 12, 3);
    });

    // Right boutique mirror with glass shine
    g.fillStyle(0x000000, 0.22);
    g.fillEllipse(632, 520, 44, 18);
    g.fillStyle(0xd97706, 1.0);
    g.fillRoundedRect(614, 435, 34, 85, 6);
    g.fillStyle(0xe0f2fe, 0.88);
    g.fillRoundedRect(618, 440, 26, 75, 3);
  }

  drawAwningCanopy(x, y, width, depth) {
    const g = this.scene.add.graphics();
    g.setDepth(18);
    this.container.add(g);

    const stripeCount = 10;
    const stripeWidth = width / stripeCount;

    for (let i = 0; i < stripeCount; i++) {
      const isYellow = i % 2 === 0;
      const sx = x + i * stripeWidth;

      g.fillStyle(isYellow ? 0xf59e0b : 0xf8fafc, 1.0);
      g.beginPath();
      g.moveTo(sx, y);
      g.lineTo(sx + stripeWidth, y);
      g.lineTo(sx + stripeWidth, y + depth);
      g.lineTo(sx, y + depth);
      g.closePath();
      g.fillPath();

      g.fillCircle(sx + stripeWidth / 2, y + depth + 4, stripeWidth / 2);
    }
  }

  clearUmbrellas() {
    this.umbrellas.forEach(u => {
      if (u && u.destroy) u.destroy();
    });
    this.umbrellas = [];
  }
}

/**
 * Draws a Striped Umbrella with Ground Drop Shadow
 */
export function drawStripedUmbrella(scene, parentContainer, x, y) {
  const container = scene.add.container(x, y);
  container.setDepth(9);
  parentContainer.add(container);

  const g = scene.add.graphics();
  container.add(g);

  // Ground drop shadow
  g.fillStyle(0x000000, 0.25);
  g.fillEllipse(0, 60, 52, 20);

  // Cast iron base
  g.fillStyle(0x334155, 1.0);
  g.fillCircle(0, 56, 15);

  // Pole
  g.fillStyle(0x64748b, 1.0);
  g.fillRect(-3, -15, 6, 70);

  // Canopy
  const radius = 50;
  const segments = 8;
  const colors = [GAME_CONFIG.colors.blueBtn, 0xffffff];

  for (let i = 0; i < segments; i++) {
    const a1 = (i * 2 * Math.PI) / segments;
    const a2 = ((i + 1) * 2 * Math.PI) / segments;
    g.fillStyle(colors[i % 2], 1.0);
    g.beginPath();
    g.moveTo(0, -10);
    g.lineTo(Math.cos(a1) * radius, Math.sin(a1) * (radius * 0.58));
    g.lineTo(Math.cos(a2) * radius, Math.sin(a2) * (radius * 0.58));
    g.closePath();
    g.fillPath();
  }

  // Brass finial
  g.fillStyle(0xf1c40f, 1.0);
  g.fillCircle(0, -12, 5);

  return container;
}

export function drawEnvironment(scene, parentContainer) {
  return new EnvironmentManager(scene, parentContainer);
}
