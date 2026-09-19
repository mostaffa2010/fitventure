/**
 * Fitventure - Crafting Stations & Visual Effects
 * Sewing Table (Crafting Station), Front Counter (Horizontal Dual Slots),
 * Zone 2 Locked Station Placeholder (Jeans & Hats), Radial Progress Gauge,
 * and Floating Coin Bezier Animations.
 */

import { GAME_CONFIG, gameState } from './config.js';

/**
 * Radial Progress Gauge (Eatventure signature circular progress bar)
 * Fills smoothly in bright green above the worker during crafting
 */
export class RadialGauge {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.container = scene.add.container(x, y);
    this.container.setDepth(30);
    this.container.setVisible(false);

    this.graphics = scene.add.graphics();
    this.container.add(this.graphics);

    // Center icon badge
    this.centerText = scene.add.text(0, 0, '✂️', {
      fontSize: '18px'
    }).setOrigin(0.5);
    this.container.add(this.centerText);

    this.radius = 28;
    this.thickness = 8;
    this.progress = 0;
  }

  draw(progress) {
    this.graphics.clear();
    const r = this.radius;

    // Outer soft drop shadow
    this.graphics.fillStyle(0x000000, 0.25);
    this.graphics.fillCircle(0, 3, r + this.thickness / 2);

    // Background track ring
    this.graphics.lineStyle(this.thickness, 0x1e272e, 0.85);
    this.graphics.strokeCircle(0, 0, r);

    // Inner badge disc
    this.graphics.fillStyle(0xffffff, 0.95);
    this.graphics.fillCircle(0, 0, r - this.thickness / 2);

    // Green Active Arc (filling clockwise from top: -PI/2)
    if (progress > 0) {
      this.graphics.lineStyle(this.thickness, 0x2ed573, 1.0);
      this.graphics.beginPath();
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (Math.PI * 2 * Phaser.Math.Clamp(progress, 0, 1));
      this.graphics.arc(0, 0, r, startAngle, endAngle, false);
      this.graphics.strokePath();
    }
  }

  start(duration, onComplete) {
    this.progress = 0;
    this.draw(0);
    this.container.setScale(0);
    this.container.setVisible(true);

    // Scale pop-in
    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 180,
      ease: 'Back.easeOut'
    });

    // Animate progress smoothly
    this.progressTween = this.scene.tweens.add({
      targets: this,
      progress: 1,
      duration: duration,
      ease: 'Linear',
      onUpdate: () => {
        this.draw(this.progress);
      },
      onComplete: () => {
        this.draw(1);
        // Pop-out
        this.scene.tweens.add({
          targets: this.container,
          scale: 0,
          duration: 160,
          ease: 'Back.easeIn',
          onComplete: () => {
            this.container.setVisible(false);
            if (onComplete) onComplete();
          }
        });
      }
    });
  }

  stop() {
    if (this.progressTween) this.progressTween.stop();
    this.container.setVisible(false);
  }
}

/**
 * Sewing Table (Crafting Station)
 * Tailoring / cutting workstation where T-shirts are sewn.
 * Positioned closer to top counter (y: 640) for rapid, satisfying loop cycles.
 */
export class SewingStation {
  constructor(scene) {
    this.scene = scene;
    const { x, y, width, height } = GAME_CONFIG.layout.sewingTable;
    this.x = x;
    this.y = y;

    this.container = scene.add.container(x, y);
    this.container.setDepth(8);

    this.drawTable(width, height);
    this.createLevelBadge();

    // Attach radial progress gauge above worker head position (y: 570)
    this.radialGauge = new RadialGauge(scene, x, y - 110);

    // Setup interactive click to open upgrade card
    this.setupInteraction(width, height);

    // Listen for level upgrades
    gameState.on('stationUpgraded', (data) => {
      if (data.station === 'sewing') {
        this.updateLevelBadge(data.level);
        this.playUpgradeEffect();
      }
    });
  }

  drawTable(w, h) {
    const g = this.scene.add.graphics();
    this.container.add(g);

    // 1. Soft ground shadow
    g.fillStyle(0x000000, 0.22);
    g.fillRoundedRect(-w / 2 - 8, -h / 2 + 10, w + 16, h + 14, 16);

    // 2. Heavy wooden desk base
    g.fillStyle(0x596275, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);

    // Tabletop highlight bevel
    g.fillStyle(0x718093, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 14, 6);

    // 3. Green Self-Healing Cutting Mat (Central crafting surface)
    const matW = w * 0.72;
    const matH = h * 0.7;
    g.fillStyle(0x10ac84, 1.0);
    g.fillRoundedRect(-matW / 2, -matH / 2 + 6, matW, matH, 8);

    // Cutting mat grid lines
    g.lineStyle(1, 0x1dd1a1, 0.5);
    for (let lx = -matW / 2 + 15; lx < matW / 2; lx += 20) {
      g.lineBetween(lx, -matH / 2 + 8, lx, matH / 2 + 4);
    }
    for (let ly = -matH / 2 + 15; ly < matH / 2; ly += 16) {
      g.lineBetween(-matW / 2 + 4, ly, matW / 2 - 4, ly);
    }

    // 4. Modern Sewing Machine (Right side of table)
    const smX = w / 2 - 58;
    const smY = -6;

    // Sewing machine shadow
    g.fillStyle(0x000000, 0.2);
    g.fillRoundedRect(smX - 22, smY - 10, 44, 30, 4);

    // Sewing machine body (white glossy metal)
    g.fillStyle(0xf5f6fa, 1.0);
    g.fillRoundedRect(smX - 20, smY - 14, 40, 26, 6);

    // Machine arm & needle pillar
    g.fillStyle(0xdcdde1, 1.0);
    g.fillRect(smX - 18, smY - 24, 12, 14);
    g.fillRect(smX - 18, smY - 26, 32, 8);

    // Needle & presser foot
    g.fillStyle(0x2f3542, 1.0);
    g.fillRect(smX + 8, smY - 18, 3, 12);

    // Gold thread spool on top
    g.fillStyle(0xf1c40f, 1.0);
    g.fillRect(smX - 12, smY - 32, 6, 8);
    g.lineStyle(1, 0xd4ac0d, 1);
    g.strokeRect(smX - 12, smY - 32, 6, 8);

    // 5. Fabric Rolls & Tailor Tools (Left side of table)
    // Blue fabric roll
    g.fillStyle(0x3498db, 1.0);
    g.fillRoundedRect(-w / 2 + 18, -20, 16, 34, 4);
    g.fillStyle(0x2980b9, 1.0);
    g.fillCircle(-w / 2 + 26, -20, 6);

    // Yellow measuring tape coil
    g.fillStyle(0xf1c40f, 1.0);
    g.fillCircle(-w / 2 + 50, 12, 9);
    g.fillStyle(0x2f3542, 1.0);
    g.fillCircle(-w / 2 + 50, 12, 3);

    // Tailor shears / scissors
    g.lineStyle(2, 0x747d8c, 1.0);
    g.lineBetween(-10, -10, 8, 12);
    g.lineBetween(-10, 12, 8, -10);
  }

  createLevelBadge() {
    this.badgeContainer = this.scene.add.container(0, GAME_CONFIG.layout.sewingTable.height / 2 + 18);
    this.container.add(this.badgeContainer);

    const bg = this.scene.add.graphics();
    // Drop shadow
    bg.fillStyle(0x000000, 0.28);
    bg.fillRoundedRect(-42, -13, 84, 28, 9);
    // Green Pill
    bg.fillStyle(0x2ecc71, 1.0);
    bg.fillRoundedRect(-44, -15, 88, 30, 9);
    // White inner border
    bg.lineStyle(2, 0xffffff, 0.95);
    bg.strokeRoundedRect(-44, -15, 88, 30, 9);
    this.badgeContainer.add(bg);

    this.levelText = this.scene.add.text(0, 0, `Lv. ${gameState.sewingStation.level}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.badgeContainer.add(this.levelText);
  }

  updateLevelBadge(level) {
    this.levelText.setText(`Lv. ${level}`);
  }

  setupInteraction(w, h) {
    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h + 35);
    this.container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.container.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: this.container,
        scale: 0.96,
        duration: 70,
        yoyo: true,
        ease: 'Quad.easeInOut'
      });
    });

    this.container.on('pointerup', () => {
      this.scene.events.emit('openStationUpgrade', { station: 'sewing' });
    });

    // Subtle breathing pulse
    this.scene.tweens.add({
      targets: this.badgeContainer,
      scale: 1.08,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  startProgress(duration, onComplete) {
    this.radialGauge.start(duration, onComplete);
  }

  playUpgradeEffect() {
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    for (let i = 0; i < 8; i++) {
      const p = this.scene.add.text(
        this.x + Phaser.Math.Between(-40, 40),
        this.y + Phaser.Math.Between(-30, 10),
        '✨',
        { fontSize: '20px' }
      ).setOrigin(0.5).setDepth(25);

      this.scene.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(40, 80),
        x: p.x + Phaser.Math.Between(-30, 30),
        alpha: 0,
        scale: 0.5,
        duration: 700,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }
}

/**
 * Counter Station (Top Boutique Display Desk)
 * Supports horizontal customer spots side-by-side:
 * Slot 1 at x: 300 (left checkout register), Slot 2 at x: 420 (right checkout register).
 */
export class CounterStation {
  constructor(scene) {
    this.scene = scene;
    const { x, y, width, height } = GAME_CONFIG.layout.counter;
    this.x = x;
    this.y = y;

    this.container = scene.add.container(x, y);
    this.container.setDepth(7);

    this.drawCounter(width, height);
  }

  drawCounter(w, h) {
    const g = this.scene.add.graphics();
    this.container.add(g);

    // 1. Soft drop shadow on wooden floor
    g.fillStyle(0x000000, 0.25);
    g.fillRoundedRect(-w / 2 - 6, -h / 2 + 10, w + 12, h + 12, 14);

    // 2. Boutique Counter Wooden Front
    g.fillStyle(GAME_CONFIG.colors.counterWood, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);

    // Decorative vertical wood slats for luxury boutique feel
    g.fillStyle(GAME_CONFIG.colors.counterTrim, 0.7);
    for (let lx = -w / 2 + 16; lx < w / 2 - 10; lx += 22) {
      g.fillRect(lx, -h / 2 + 6, 8, h - 14);
    }

    // 3. Polished Teak Counter Top
    g.fillStyle(GAME_CONFIG.colors.counterTop, 1.0);
    g.fillRoundedRect(-w / 2 - 4, -h / 2 - 8, w + 8, 22, 6);

    // Top glossy highlight
    g.fillStyle(0xffffff, 0.25);
    g.fillRect(-w / 2 - 2, -h / 2 - 8, w + 4, 4);

    // 4. Center Vitrine Display Case (showing folded shirts between the two service slots)
    const caseW = 90;
    const caseH = 32;
    g.fillStyle(0x1a252f, 0.9);
    g.fillRoundedRect(-caseW / 2, 2, caseW, caseH, 4);
    // Glass sheen
    g.fillStyle(0x81ecec, 0.25);
    g.fillRoundedRect(-caseW / 2 + 2, 4, caseW - 4, caseH - 4, 3);

    // Mini folded shirts in vitrine
    const showcaseColors = [0xe74c3c, 0x3498db, 0x2ecc71];
    showcaseColors.forEach((color, i) => {
      const sx = -caseW / 2 + 16 + i * 28;
      g.fillStyle(color, 1.0);
      g.fillRoundedRect(sx - 10, 10, 20, 14, 3);
      g.fillStyle(0xffffff, 0.6);
      g.fillRect(sx - 4, 10, 8, 3);
    });

    // -------------------------------------------------------------
    // Horizontal Service Slot 1 Visuals (x: 300 => local x: -60)
    // -------------------------------------------------------------
    // Service pickup mat
    g.fillStyle(0x2d3748, 0.85);
    g.fillRoundedRect(-85, -h / 2 - 6, 50, 16, 3);
    g.lineStyle(1, 0x4a5568, 1);
    g.strokeRoundedRect(-85, -h / 2 - 6, 50, 16, 3);

    // Slot 1 POS Terminal / Service Bell
    const bell = this.scene.add.graphics();
    this.container.add(bell);
    bell.fillStyle(0xf1c40f, 1.0);
    bell.fillCircle(-110, -h / 2 - 4, 7);
    bell.fillStyle(0xd4ac0d, 1.0);
    bell.fillRect(-114, -h / 2 + 1, 8, 4);

    // Slot 1 subtle indicator text
    const s1Text = this.scene.add.text(-60, -h / 2 + 2, 'SLOT 1', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.container.add(s1Text);

    // -------------------------------------------------------------
    // Horizontal Service Slot 2 Visuals (x: 420 => local x: +60)
    // -------------------------------------------------------------
    // Service pickup mat
    g.fillStyle(0x2d3748, 0.85);
    g.fillRoundedRect(35, -h / 2 - 6, 50, 16, 3);
    g.lineStyle(1, 0x4a5568, 1);
    g.strokeRoundedRect(35, -h / 2 - 6, 50, 16, 3);

    // Slot 2 Modern Tablet Cash Register / POS
    const pos = this.scene.add.graphics();
    this.container.add(pos);
    pos.fillStyle(0x2f3542, 1.0);
    pos.fillRoundedRect(95, -h / 2 - 18, 30, 22, 4);
    pos.fillStyle(0x74b9ff, 1.0); // Screen glow
    pos.fillRect(97, -h / 2 - 16, 26, 18);

    // Slot 2 subtle indicator text
    const s2Text = this.scene.add.text(60, -h / 2 + 2, 'SLOT 2', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.container.add(s2Text);
  }
}

/**
 * Zone 2 Station: Designer Jeans & Hats Station
 * Locked placeholder station with unlockable circular purchase ring
 */
export class Zone2Station {
  constructor(scene) {
    this.scene = scene;
    const { x, y, width, height, unlockCost } = GAME_CONFIG.layout.zone2;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.unlockCost = unlockCost;

    this.container = scene.add.container(x, y);
    this.container.setDepth(8);

    this.renderStation();

    // Listen for state changes
    gameState.on('coinsChanged', () => {
      if (!gameState.zone2Station.unlocked) {
        this.updatePurchaseRingVisual();
      }
    });

    gameState.on('zone2Unlocked', () => {
      this.renderStation();
    });
  }

  renderStation() {
    this.container.removeAll(true);

    if (!gameState.zone2Station.unlocked) {
      this.drawLockedStation();
    } else {
      this.drawUnlockedStation();
    }
  }

  drawLockedStation() {
    const w = this.width;
    const h = this.height;
    const g = this.scene.add.graphics();
    this.container.add(g);

    // 1. Soft station bay footprint shadow on parquet
    g.fillStyle(0x000000, 0.18);
    g.fillRoundedRect(-w / 2 - 6, -h / 2 + 6, w + 12, h + 12, 16);

    // 2. Ghosted blueprint/locked platform outline
    g.fillStyle(0xe2e8f0, 0.5);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);

    // Dashed locked perimeter border
    g.lineStyle(3, 0x94a3b8, 0.8);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    // 3. Station Header Banner
    const titleText = this.scene.add.text(0, -h / 2 + 22, '🔒 ZONE 2: JEANS & HATS', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#475569'
    }).setOrigin(0.5);
    this.container.add(titleText);

    // Ghosted product icons
    const iconsText = this.scene.add.text(0, -h / 2 + 50, '👖  🧢', {
      fontSize: '26px'
    }).setOrigin(0.5);
    this.container.add(iconsText);

    // 4. Unlockable Purchase Ring / Button
    this.buildPurchaseRing(0, h / 2 - 28);
  }

  buildPurchaseRing(x, y) {
    this.purchaseContainer = this.scene.add.container(x, y);
    this.container.add(this.purchaseContainer);

    this.ringGraphics = this.scene.add.graphics();
    this.purchaseContainer.add(this.ringGraphics);

    // Glowing outer circular pulse
    this.glowRing = this.scene.add.graphics();
    this.purchaseContainer.add(this.glowRing);
    this.glowRing.lineStyle(3, 0xf1c40f, 0.7);
    this.glowRing.strokeRoundedRect(-80, -26, 160, 52, 26);

    // Pulsing animation on glow ring
    this.scene.tweens.add({
      targets: this.glowRing,
      alpha: { from: 0.3, to: 0.9 },
      scaleX: { from: 0.98, to: 1.04 },
      scaleY: { from: 0.98, to: 1.04 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Unlock button text (large & bold for mobile)
    this.purchaseText = this.scene.add.text(0, -8, 'UNLOCK STATION', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.purchaseContainer.add(this.purchaseText);

    this.costText = this.scene.add.text(0, 10, `🪙 ${this.unlockCost}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setOrigin(0.5);
    this.purchaseContainer.add(this.costText);

    this.updatePurchaseRingVisual();

    // Hit area & interactivity
    const hitArea = new Phaser.Geom.Rectangle(-80, -25, 160, 50);
    this.purchaseContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.purchaseContainer.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: this.purchaseContainer,
        scale: 0.94,
        y: y + 2,
        duration: 70
      });
    });

    this.purchaseContainer.on('pointerup', () => {
      this.scene.tweens.add({
        targets: this.purchaseContainer,
        scale: 1.0,
        y: y,
        duration: 80
      });
      this.tryUnlock();
    });
  }

  updatePurchaseRingVisual() {
    if (!this.ringGraphics) return;
    this.ringGraphics.clear();
    const canAfford = gameState.coins >= this.unlockCost;
    const w = 156;
    const h = 48;

    // Drop shadow
    this.ringGraphics.fillStyle(0x000000, 0.25);
    this.ringGraphics.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 24);

    if (canAfford) {
      // Vibrant golden unlock ring
      this.ringGraphics.fillStyle(0xd97706, 1.0); // 3D bottom bevel
      this.ringGraphics.fillRoundedRect(-w / 2, -h / 2 + 3, w, h - 3, 24);
      this.ringGraphics.fillStyle(0xf59e0b, 1.0); // Vibrant button face
      this.ringGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - 5, 24);
      // Top gloss shine
      this.ringGraphics.fillStyle(0xffffff, 0.35);
      this.ringGraphics.fillRoundedRect(-w / 2 + 10, -h / 2 + 3, w - 20, 5, 2);
    } else {
      // Inactive grey
      this.ringGraphics.fillStyle(0x64748b, 1.0);
      this.ringGraphics.fillRoundedRect(-w / 2, -h / 2 + 3, w, h - 3, 24);
      this.ringGraphics.fillStyle(0x94a3b8, 1.0);
      this.ringGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - 5, 24);
    }
  }

  tryUnlock() {
    if (gameState.unlockZone2()) {
      // Celebration particle burst
      this.playUnlockCelebration();
    } else {
      // Shake animation
      this.scene.tweens.add({
        targets: this.purchaseContainer,
        x: '+=7',
        yoyo: true,
        repeat: 3,
        duration: 45
      });

      // Floating feedback
      const warn = this.scene.add.text(this.x, this.y, `Need 🪙 ${this.unlockCost}!`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ef4444',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(40);

      this.scene.tweens.add({
        targets: warn,
        y: warn.y - 45,
        alpha: 0,
        duration: 900,
        ease: 'Cubic.easeOut',
        onComplete: () => warn.destroy()
      });
    }
  }

  playUnlockCelebration() {
    // Flash / camera shake
    this.scene.cameras.main.shake(160, 0.005);

    // Confetti particles
    const emojis = ['🎉', '✨', '👖', '🧢', '⭐'];
    for (let i = 0; i < 12; i++) {
      const emoji = Phaser.Utils.Array.GetRandom(emojis);
      const p = this.scene.add.text(
        this.x + Phaser.Math.Between(-30, 30),
        this.y + Phaser.Math.Between(-20, 20),
        emoji,
        { fontSize: '24px' }
      ).setOrigin(0.5).setDepth(45);

      this.scene.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-90, 90),
        y: p.y - Phaser.Math.Between(60, 120),
        scale: { from: 1.3, to: 0.4 },
        alpha: 0,
        duration: 900,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }

    // Scale pop of the container
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 180,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.renderStation();
      }
    });
  }

  drawUnlockedStation() {
    const w = this.width;
    const h = this.height;
    const g = this.scene.add.graphics();
    this.container.add(g);

    // 1. Soft ground shadow
    g.fillStyle(0x000000, 0.24);
    g.fillRoundedRect(-w / 2 - 8, -h / 2 + 10, w + 16, h + 14, 16);

    // 2. Rich Dark Oak Workbench Base
    g.fillStyle(0x3e2723, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);

    // Tabletop highlight bevel
    g.fillStyle(0x5d4037, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 14, 6);

    // 3. Denim Work Mat (Deep Indigo)
    const matW = w * 0.74;
    const matH = h * 0.68;
    g.fillStyle(0x1a237e, 1.0);
    g.fillRoundedRect(-matW / 2, -matH / 2 + 6, matW, matH, 8);
    // Gold contrast jeans stitching on mat
    g.lineStyle(1, 0xfbc531, 0.6);
    g.strokeRoundedRect(-matW / 2 + 4, -matH / 2 + 10, matW - 8, matH - 8, 6);

    // 4. Denim Jeans Rolls & Riveter (Left)
    g.fillStyle(0x283593, 1.0);
    g.fillRoundedRect(-w / 2 + 20, -18, 22, 34, 4);
    g.fillStyle(0x3949ab, 1.0);
    g.fillCircle(-w / 2 + 31, -18, 7);

    // 5. Hat Mannequin Display Stands (Right)
    const hx = w / 2 - 40;
    // Wooden pedestal
    g.fillStyle(0x8d6e63, 1.0);
    g.fillCircle(hx, 10, 10);
    g.fillRect(hx - 2, -15, 4, 25);
    // Chic boutique Fedora / Cap on display
    g.fillStyle(0xd32f2f, 1.0);
    g.fillCircle(hx, -16, 12);
    g.fillRect(hx - 14, -14, 28, 4); // Brim

    // Station Name Badge
    const nameText = this.scene.add.text(0, -h / 2 + 16, 'JEANS & HATS STUDIO', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.container.add(nameText);

    // Active Level Pill
    const levelPill = this.scene.add.container(0, h / 2 + 16);
    this.container.add(levelPill);

    const lbg = this.scene.add.graphics();
    lbg.fillStyle(0x000000, 0.28);
    lbg.fillRoundedRect(-42, -13, 84, 28, 9);
    lbg.fillStyle(0x3b82f6, 1.0);
    lbg.fillRoundedRect(-44, -15, 88, 30, 9);
    lbg.lineStyle(2, 0xffffff, 0.95);
    lbg.strokeRoundedRect(-44, -15, 88, 30, 9);
    levelPill.add(lbg);

    const lText = this.scene.add.text(0, 0, 'Lv. 1', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    levelPill.add(lText);

    // Periodic bonus coin generation from Zone 2
    this.bonusTimer = this.scene.time.addEvent({
      delay: 5000,
      callback: () => {
        const bonus = gameState.getZone2Profit();
        spawnFloatingCoins(this.scene, this.x, this.y - 20, bonus);
      },
      loop: true
    });
  }
}

/**
 * Floating Coin Bezier Animation
 * Spawns dynamic gold coins with +X label that fly to the top coin pill
 */
export function spawnFloatingCoins(scene, startX, startY, amount, targetX = 360, targetY = 70) {
  // 1. Floating text "+X" (larger for mobile)
  const label = scene.add.text(startX, startY - 10, `+${gameState.formatCoins(amount)}`, {
    fontFamily: 'Arial, sans-serif',
    fontSize: '26px',
    fontStyle: 'bold',
    color: '#f1c40f',
    stroke: '#1e293b',
    strokeThickness: 5
  }).setOrigin(0.5).setDepth(45);

  scene.tweens.add({
    targets: label,
    y: startY - 70,
    alpha: 0,
    duration: 950,
    ease: 'Cubic.easeOut',
    onComplete: () => label.destroy()
  });

  // 2. Flying Gold Coin
  const coin = scene.add.container(startX, startY);
  coin.setDepth(46);

  const cg = scene.add.graphics();
  // Gold shadow
  cg.fillStyle(0x000000, 0.3);
  cg.fillCircle(2, 2, 14);
  // Gold disc
  cg.fillStyle(0xf1c40f, 1.0);
  cg.fillCircle(0, 0, 14);
  // Inner rim
  cg.lineStyle(2, 0xd4ac0d, 1.0);
  cg.strokeCircle(0, 0, 10);
  // Star icon
  const star = scene.add.text(0, 0, '★', {
    fontSize: '13px',
    color: '#b7950b'
  }).setOrigin(0.5);
  coin.add(cg);
  coin.add(star);

  // Jump up first, then arc towards top UI coin pill
  scene.tweens.add({
    targets: coin,
    y: startY - 45,
    scale: 1.35,
    duration: 250,
    ease: 'Back.easeOut',
    onComplete: () => {
      scene.tweens.add({
        targets: coin,
        x: targetX,
        y: targetY,
        scale: 0.85,
        duration: 600,
        ease: 'Cubic.easeInOut',
        onComplete: () => {
          coin.destroy();
          gameState.addCoins(amount);
          scene.events.emit('coinPillPunch');
        }
      });
    }
  });
}
