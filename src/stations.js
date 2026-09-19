/**
 * Fitventure - Crafting Stations & Visual Effects
 * Sewing Table (Crafting Station), Front Counter, Radial Progress Gauge,
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
      fontSize: '16px'
    }).setOrigin(0.5);
    this.container.add(this.centerText);

    this.radius = 26;
    this.thickness = 7;
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
      duration: 200,
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
          duration: 180,
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
 * Sewing Table (Crafting Station at Bottom)
 * Tailoring / cutting workstation where T-shirts are sewn.
 * Clicking opens the interactive Station Upgrade Card.
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

    // Attach radial progress gauge above worker head position
    this.radialGauge = new RadialGauge(scene, x, y - 130);

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
    bg.fillStyle(0x000000, 0.25);
    bg.fillRoundedRect(-36, -11, 72, 24, 8);
    // Green Pill
    bg.fillStyle(0x2ecc71, 1.0);
    bg.fillRoundedRect(-38, -13, 76, 26, 8);
    // White inner border
    bg.lineStyle(2, 0xffffff, 0.9);
    bg.strokeRoundedRect(-38, -13, 76, 26, 8);
    this.badgeContainer.add(bg);

    this.levelText = this.scene.add.text(0, 0, `Lv. ${gameState.sewingStation.level}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.badgeContainer.add(this.levelText);
  }

  updateLevelBadge(level) {
    this.levelText.setText(`Lv. ${level}`);
  }

  setupInteraction(w, h) {
    // Make table interactive
    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h + 35);
    this.container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.container.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: this.container,
        scale: 0.96,
        duration: 80,
        yoyo: true,
        ease: 'Quad.easeInOut'
      });
    });

    this.container.on('pointerup', () => {
      this.scene.events.emit('openStationUpgrade', { station: 'sewing' });
    });

    // Subtle breathing pulse so players know it's interactive
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
    // Star burst / bounce animation on upgrade
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    // Particle burst
    for (let i = 0; i < 8; i++) {
      const p = this.scene.add.text(
        this.x + Phaser.Math.Between(-40, 40),
        this.y + Phaser.Math.Between(-30, 10),
        '✨',
        { fontSize: '18px' }
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
 * Where customers order and pick up folded T-shirts.
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

    // 4. Glass Vitrine Display Case in Counter (showing folded shirts)
    const caseW = 140;
    const caseH = 34;
    g.fillStyle(0x1a252f, 0.9);
    g.fillRoundedRect(-caseW / 2, 2, caseW, caseH, 4);
    // Glass sheen
    g.fillStyle(0x81ecec, 0.25);
    g.fillRoundedRect(-caseW / 2 + 2, 4, caseW - 4, caseH - 4, 3);

    // Mini folded shirts in vitrine
    const showcaseColors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f];
    showcaseColors.forEach((color, i) => {
      const sx = -caseW / 2 + 18 + i * 32;
      g.fillStyle(color, 1.0);
      g.fillRoundedRect(sx - 10, 10, 20, 14, 3);
      g.fillStyle(0xffffff, 0.6);
      g.fillRect(sx - 4, 10, 8, 3); // collar
    });

    // 5. Tablet Cash Register / POS (Right side of counter)
    const pos = this.scene.add.graphics();
    this.container.add(pos);
    pos.fillStyle(0x2f3542, 1.0);
    pos.fillRoundedRect(w / 2 - 50, -h / 2 - 18, 32, 22, 4);
    pos.fillStyle(0x74b9ff, 1.0); // Screen glow
    pos.fillRect(w / 2 - 48, -h / 2 - 16, 28, 18);

    // 6. Brass Service Bell (Left side of counter)
    const bell = this.scene.add.graphics();
    this.container.add(bell);
    bell.fillStyle(0xf1c40f, 1.0);
    bell.fillCircle(-w / 2 + 40, -h / 2 - 4, 7);
    bell.fillStyle(0xd4ac0d, 1.0);
    bell.fillRect(-w / 2 + 36, -h / 2 + 1, 8, 4);
  }
}

/**
 * Floating Coin Bezier Animation
 * Spawns dynamic gold coins with +X label that fly to the top coin pill
 */
export function spawnFloatingCoins(scene, startX, startY, amount, targetX = 360, targetY = 70) {
  // 1. Floating text "+X"
  const label = scene.add.text(startX, startY - 10, `+${gameState.formatCoins(amount)}`, {
    fontFamily: 'Arial, sans-serif',
    fontSize: '22px',
    fontStyle: 'bold',
    color: '#f1c40f',
    stroke: '#2c3e50',
    strokeThickness: 4
  }).setOrigin(0.5).setDepth(45);

  scene.tweens.add({
    targets: label,
    y: startY - 65,
    alpha: 0,
    duration: 1000,
    ease: 'Cubic.easeOut',
    onComplete: () => label.destroy()
  });

  // 2. Flying Gold Coin
  const coin = scene.add.container(startX, startY);
  coin.setDepth(46);

  const cg = scene.add.graphics();
  // Gold shadow
  cg.fillStyle(0x000000, 0.3);
  cg.fillCircle(2, 2, 12);
  // Gold disc
  cg.fillStyle(0xf1c40f, 1.0);
  cg.fillCircle(0, 0, 12);
  // Inner rim
  cg.lineStyle(2, 0xd4ac0d, 1.0);
  cg.strokeCircle(0, 0, 9);
  // Star icon
  const star = scene.add.text(0, 0, '★', {
    fontSize: '11px',
    color: '#b7950b'
  }).setOrigin(0.5);
  coin.add(cg);
  coin.add(star);

  // Jump up first, then arc towards top UI coin pill
  scene.tweens.add({
    targets: coin,
    y: startY - 40,
    scale: 1.3,
    duration: 250,
    ease: 'Back.easeOut',
    onComplete: () => {
      // Bezier-like flight to UI pill
      scene.tweens.add({
        targets: coin,
        x: targetX,
        y: targetY,
        scale: 0.8,
        duration: 650,
        ease: 'Cubic.easeInOut',
        onComplete: () => {
          coin.destroy();
          // Deposit coins into state
          gameState.addCoins(amount);
          // Emit UI punch
          scene.events.emit('coinPillPunch');
        }
      });
    }
  });
}
