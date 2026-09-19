/**
 * Fitventure - Crafting Stations & Visual Effects
 * Sewing Table (Crafting Station), Front Counter (Warm Oak with rounded ends),
 * Radial Progress Gauge, and Floating Coin Bezier Animations.
 * Note: Zone 2 Jeans & Hats station has been cleanly removed for Stage 1 boutique.
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
    this.container.setDepth(35);
    this.container.setVisible(false);

    this.graphics = scene.add.graphics();
    this.container.add(this.graphics);

    // Center icon badge (scissors / shears)
    this.centerText = scene.add.text(0, 0, '✂️', {
      fontSize: '18px'
    }).setOrigin(0.5);
    this.container.add(this.centerText);

    this.radius = 26;
    this.thickness = 7;
    this.progress = 0;
    this.progressTween = null;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.container.setPosition(x, y);
  }

  draw(progress) {
    this.graphics.clear();
    const r = this.radius;

    // Outer soft drop shadow
    this.graphics.fillStyle(0x000000, 0.28);
    this.graphics.fillCircle(0, 3, r + this.thickness / 2);

    // Background track ring
    this.graphics.lineStyle(this.thickness, 0x1e293b, 0.9);
    this.graphics.strokeCircle(0, 0, r);

    // Inner badge disc
    this.graphics.fillStyle(0xffffff, 0.96);
    this.graphics.fillCircle(0, 0, r - this.thickness / 2);

    // Green Active Arc (filling clockwise from top: -PI/2)
    if (progress > 0) {
      this.graphics.lineStyle(this.thickness, 0x22c55e, 1.0);
      this.graphics.beginPath();
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (Math.PI * 2 * Phaser.Math.Clamp(progress, 0, 1));
      this.graphics.arc(0, 0, r, startAngle, endAngle, false);
      this.graphics.strokePath();
    }
  }

  start(duration, onComplete) {
    this.stop();
    this.progress = 0;
    this.draw(0);
    this.container.setScale(0);
    this.container.setVisible(true);

    // Pop-in animation
    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 150,
      ease: 'Back.easeOut'
    });

    // Fill arc over duration
    this.progressTween = this.scene.tweens.add({
      targets: this,
      progress: 1,
      duration: duration,
      ease: 'Linear',
      onUpdate: () => {
        this.draw(this.progress);
      },
      onComplete: () => {
        // Little completion pop
        this.scene.tweens.add({
          targets: this.container,
          scale: 1.18,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            this.container.setVisible(false);
            if (onComplete) onComplete();
          }
        });
      }
    });
  }

  stop() {
    if (this.progressTween) {
      this.progressTween.stop();
      this.progressTween = null;
    }
    this.container.setVisible(false);
  }
}

/**
 * Sewing Station (Crafting Table)
 * Brought much closer to the top Counter for a tight, satisfying gameplay loop.
 * Features 2.5D dark oval drop shadow, rich tools, interactive upgrade trigger.
 */
export class SewingStation {
  constructor(scene) {
    this.scene = scene;
    const { x, y, width, height } = GAME_CONFIG.layout.sewingTable;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.container = scene.add.container(x, y);
    this.container.setDepth(8);

    this.drawTable(width, height);
    this.createLevelBadge();

    // Setup interactive click to open station upgrade card ONLY
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

    // 1. Soft Translucent Dark Oval 2.5D Drop Shadow directly under table
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(0, h / 2 + 10, w * 1.05, 34);

    // 2. Heavy wooden desk base
    g.fillStyle(0x475569, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);

    // Tabletop highlight bevel
    g.fillStyle(0x64748b, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 14, 6);

    // 3. Green Self-Healing Cutting Mat (Central crafting surface)
    const matW = w * 0.72;
    const matH = h * 0.7;
    g.fillStyle(0x10b981, 1.0);
    g.fillRoundedRect(-matW / 2, -matH / 2 + 6, matW, matH, 8);

    // Cutting mat grid lines
    g.lineStyle(1, 0x34d399, 0.55);
    for (let lx = -matW / 2 + 15; lx < matW / 2; lx += 20) {
      g.lineBetween(lx, -matH / 2 + 8, lx, matH / 2 + 4);
    }
    for (let ly = -matH / 2 + 15; ly < matH / 2; ly += 16) {
      g.lineBetween(-matW / 2 + 4, ly, matW / 2 - 4, ly);
    }

    // 4. Modern Sewing Machine (Right side of table)
    const smX = w / 2 - 60;
    const smY = -6;

    // Sewing machine shadow
    g.fillStyle(0x000000, 0.2);
    g.fillRoundedRect(smX - 22, smY - 10, 44, 30, 4);

    // Sewing machine body (white glossy metal)
    g.fillStyle(0xf8fafc, 1.0);
    g.fillRoundedRect(smX - 20, smY - 14, 40, 26, 6);

    // Machine arm & needle pillar
    g.fillStyle(0xe2e8f0, 1.0);
    g.fillRect(smX - 18, smY - 24, 12, 14);
    g.fillRect(smX - 18, smY - 26, 32, 8);

    // Needle & presser foot
    g.fillStyle(0x1e293b, 1.0);
    g.fillRect(smX + 8, smY - 18, 3, 12);

    // Gold thread spool on top
    g.fillStyle(0xf59e0b, 1.0);
    g.fillRect(smX - 12, smY - 32, 6, 8);
    g.lineStyle(1, 0xd97706, 1);
    g.strokeRect(smX - 12, smY - 32, 6, 8);

    // 5. Fabric Rolls & Tailor Tools (Left side of table)
    // Blue fabric roll
    g.fillStyle(0x3b82f6, 1.0);
    g.fillRoundedRect(-w / 2 + 18, -20, 16, 34, 4);
    g.fillStyle(0x1d4ed8, 1.0);
    g.fillCircle(-w / 2 + 26, -20, 6);

    // Yellow measuring tape coil
    g.fillStyle(0xf59e0b, 1.0);
    g.fillCircle(-w / 2 + 50, 12, 9);
    g.fillStyle(0x1e293b, 1.0);
    g.fillCircle(-w / 2 + 50, 12, 3);

    // Tailor shears / scissors
    g.lineStyle(2, 0x94a3b8, 1.0);
    g.lineBetween(-10, -10, 8, 12);
    g.lineBetween(-10, 12, 8, -10);
  }

  createLevelBadge() {
    this.badgeContainer = this.scene.add.container(0, this.height / 2 + 18);
    this.container.add(this.badgeContainer);

    const bg = this.scene.add.graphics();
    // Drop shadow
    bg.fillStyle(0x000000, 0.28);
    bg.fillRoundedRect(-42, -13, 84, 28, 9);
    // Green Pill
    bg.fillStyle(0x22c55e, 1.0);
    bg.fillRoundedRect(-44, -15, 88, 30, 9);
    // White inner border
    bg.lineStyle(2, 0xffffff, 0.95);
    bg.strokeRoundedRect(-44, -15, 88, 30, 9);
    this.badgeContainer.add(bg);

    this.levelText = this.scene.add.text(0, 0, 'Lv. ' + gameState.sewingStation.level, {
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

    // CRITICAL: Clicking directly on the station in the world opens the Station Modal
    this.container.on('pointerup', () => {
      this.scene.events.emit('openStationUpgrade', { station: 'sewing' });
    });

    // Subtle breathing pulse on level badge to invite interaction
    this.scene.tweens.add({
      targets: this.badgeContainer,
      scale: 1.08,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
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

    // Golden / emerald sparkles burst
    for (let i = 0; i < 8; i++) {
      const p = this.scene.add.text(
        this.x + Phaser.Math.Between(-50, 50),
        this.y + Phaser.Math.Between(-30, 20),
        '✨',
        { fontSize: '22px' }
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
 * Counter Station (Top Boutique Checkout & Service Desk)
 * Materials: Warm Oak with Rounded Ends, 2.5D Drop Shadows, Vitrine Display Case
 */
export class CounterStation {
  constructor(scene) {
    this.scene = scene;
    const { x, y, width, height } = GAME_CONFIG.layout.counter;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.container = scene.add.container(x, y);
    this.container.setDepth(7);

    this.drawCounter(width, height);
  }

  drawCounter(w, h) {
    const g = this.scene.add.graphics();
    this.container.add(g);

    // 1. Soft Translucent Dark Oval 2.5D Drop Shadow directly under counter
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(0, h / 2 + 12, w * 1.04, 32);

    // 2. Warm Oak Counter Body with ROUNDED ENDS (Pill / Capsule profile)
    // Darker underside bevel
    g.fillStyle(GAME_CONFIG.colors.counterBevel, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h - 2, 28);

    // Warm Oak Front Face
    g.fillStyle(GAME_CONFIG.colors.counterWood, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 4, 28);

    // Fluted decorative vertical wood slats
    g.fillStyle(GAME_CONFIG.colors.counterTrim, 0.7);
    for (let lx = -w / 2 + 30; lx < w / 2 - 25; lx += 22) {
      g.fillRect(lx, -h / 2 + 8, 8, h - 18);
    }

    // 3. Polished Honey Oak Counter Top Surface with ROUNDED ENDS
    g.fillStyle(GAME_CONFIG.colors.counterTop, 1.0);
    g.fillRoundedRect(-w / 2 - 4, -h / 2 - 8, w + 8, 26, 13);

    // Top edge glossy specular highlight
    g.fillStyle(0xffffff, 0.28);
    g.fillRoundedRect(-w / 2 + 12, -h / 2 - 7, w - 24, 4, 2);

    // 4. Center Vitrine Display Case (showing folded shirts between customer slots)
    const caseW = 90;
    const caseH = 34;
    g.fillStyle(0x0f172a, 0.85);
    g.fillRoundedRect(-caseW / 2, 2, caseW, caseH, 6);
    // Glass sheen
    g.fillStyle(0x38bdf8, 0.25);
    g.fillRoundedRect(-caseW / 2 + 2, 4, caseW - 4, caseH - 4, 4);

    // Display folded sample tees inside vitrine
    g.fillStyle(0xef4444, 1.0);
    g.fillRoundedRect(-caseW / 2 + 10, 10, 18, 14, 2);
    g.fillStyle(0x3b82f6, 1.0);
    g.fillRoundedRect(-caseW / 2 + 36, 10, 18, 14, 2);
    g.fillStyle(0xf59e0b, 1.0);
    g.fillRoundedRect(-caseW / 2 + 62, 10, 18, 14, 2);

    // 5. Checkout Registers / POS Tablets at Customer Service Slots
    // Slot 1 POS (x: -65)
    this.drawPOSRegister(g, -65, -h / 2 - 4);
    // Slot 2 POS (x: +65)
    this.drawPOSRegister(g, 65, -h / 2 - 4);
  }

  drawPOSRegister(g, x, y) {
    // POS stand
    g.fillStyle(0x334155, 1.0);
    g.fillRect(x - 4, y, 8, 8);
    // Tablet screen angled back
    g.fillStyle(0x0f172a, 1.0);
    g.fillRoundedRect(x - 12, y - 16, 24, 16, 3);
    // Screen glowing display
    g.fillStyle(0x10b981, 1.0);
    g.fillRoundedRect(x - 10, y - 14, 20, 12, 2);
    // Scan bar
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(x - 8, y - 9, 16, 2);
  }
}

/**
 * Spawns dynamic 3D gold coins that arch up to the top coin pill
 */
export function spawnFloatingCoins(scene, startX, startY, amount, targetX = 360, targetY = 70) {
  const coinCount = Math.min(8, Math.max(3, Math.ceil(amount / 2)));

  for (let i = 0; i < coinCount; i++) {
    const delay = i * 70;

    scene.time.delayedCall(delay, () => {
      const coin = scene.add.container(
        startX + Phaser.Math.Between(-16, 16),
        startY + Phaser.Math.Between(-10, 10)
      );
      coin.setDepth(60);

      const cg = scene.add.graphics();
      // Drop shadow
      cg.fillStyle(0x000000, 0.25);
      cg.fillCircle(1, 2, 13);
      // Gold face
      cg.fillStyle(0xf59e0b, 1.0);
      cg.fillCircle(0, 0, 12);
      cg.fillStyle(0xfbbf24, 1.0);
      cg.fillCircle(0, 0, 10);
      cg.lineStyle(1.5, 0xd97706, 1);
      cg.strokeCircle(0, 0, 8);

      const star = scene.add.text(0, 0, '★', {
        fontSize: '11px',
        color: '#b45309'
      }).setOrigin(0.5);

      coin.add(cg);
      coin.add(star);

      // Arc motion trajectory
      const midX = (startX + targetX) / 2 + Phaser.Math.Between(-40, 40);
      const midY = Math.min(startY, targetY) - Phaser.Math.Between(60, 120);

      // Pop-up burst
      scene.tweens.add({
        targets: coin,
        scale: { from: 0.4, to: 1.2 },
        duration: 120,
        ease: 'Back.easeOut'
      });

      // Bezier-like two-stage movement
      scene.tweens.add({
        targets: coin,
        x: midX,
        y: midY,
        duration: 260,
        ease: 'Quad.easeOut',
        onComplete: () => {
          scene.tweens.add({
            targets: coin,
            x: targetX,
            y: targetY,
            scale: 0.6,
            duration: 280,
            ease: 'Quad.easeIn',
            onComplete: () => {
              coin.destroy();
              if (i === coinCount - 1) {
                gameState.addCoins(amount);
                scene.events.emit('coinPillPunch');
              }
            }
          });
        }
      });
    });
  }
}
