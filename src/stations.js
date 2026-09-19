/**
 * Fitventure - Workstations & 3D Crafting Tables
 * 1. Station 1 (Sewing Table / T-Shirts): 3D caramel wood table, stylized white sewing machine
 *    with silver handwheel, golden scissors, colorful thread spool, and pastel folded T-shirts.
 * 2. Affordable Upgrade Red Arrow Badge (↑): Pulsing red circular badge anchored at top-left,
 *    visible ONLY when player can afford the next upgrade.
 * 3. Stage 1 Level 25 Cap: Shows "Level X / 25" and "MAX LEVEL" when capped.
 * 4. Station 2 (Jeans Table) & Station 3 (Hats Rack): Dotted unlockable workstations.
 * 5. Counter Station with rounded ends and Fredoka cartoon typography.
 */

import { GAME_CONFIG, FONT_FAMILY, gameState } from './config.js';

/**
 * Radial Progress Gauge above worker during crafting
 */
export class RadialGauge {
  constructor(scene, parentContainer, x, y) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.container.setDepth(35);
    this.container.setVisible(false);
    parentContainer.add(this.container);

    this.graphics = scene.add.graphics();
    this.container.add(this.graphics);

    this.centerText = scene.add.text(0, 0, '✂️', { fontSize: '18px' }).setOrigin(0.5);
    this.container.add(this.centerText);

    this.radius = 24;
    this.thickness = 7;
    this.progress = 0;
    this.progressTween = null;
  }

  setIcon(icon) {
    this.centerText.setText(icon);
  }

  setPosition(x, y) {
    this.container.setPosition(x, y);
  }

  draw(progress) {
    this.graphics.clear();
    const r = this.radius;

    // Soft drop shadow
    this.graphics.fillStyle(0x000000, 0.28);
    this.graphics.fillCircle(0, 3, r + this.thickness / 2);

    // Track ring
    this.graphics.lineStyle(this.thickness, 0x1e293b, 0.9);
    this.graphics.strokeCircle(0, 0, r);

    // Inner disc
    this.graphics.fillStyle(0xffffff, 0.96);
    this.graphics.fillCircle(0, 0, r - this.thickness / 2);

    // Green Active Arc
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

    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 120,
      ease: 'Back.easeOut'
    });

    this.progressTween = this.scene.tweens.add({
      targets: this,
      progress: 1,
      duration: duration,
      ease: 'Linear',
      onUpdate: () => {
        this.draw(this.progress);
      },
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.container,
          scale: 1.15,
          duration: 90,
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
 * Station 1: Sewing Table (T-Shirts)
 * 3D Isometric Caramel Wood Tailoring Station + Affordable Upgrade Red Arrow Badge
 */
export class SewingStation {
  constructor(scene, parentContainer) {
    this.scene = scene;
    const cfg = GAME_CONFIG.layout.station1;
    this.x = cfg.x;
    this.y = cfg.y;
    this.width = cfg.width;
    this.height = cfg.height;

    this.container = scene.add.container(this.x, this.y);
    this.container.setDepth(8);
    parentContainer.add(this.container);

    this.draw3DCaramelTable();
    this.createLevelBadge();
    this.createRedArrowBadge();
    this.setupInteraction();

    // Event listeners
    gameState.on('coinsChanged', () => this.updateRedBadgeVisibility());
    gameState.on('stationUpgraded', (data) => {
      if (data.station === 'sewing') {
        this.updateLevelBadge(data.level);
        this.updateRedBadgeVisibility();
        this.playUpgradeEffect();
      }
    });
    gameState.on('stageRenovated', () => {
      this.updateLevelBadge(gameState.sewingStation.level);
      this.updateRedBadgeVisibility();
    });
  }

  /**
   * Artistic Overhaul: 3D Isometric Polished Caramel Wood Tailoring Station
   * Tabletop: Stylized white sewing machine with silver handwheel, golden scissors,
   * colorful thread spool, and stack of folded pastel T-shirts.
   */
  draw3DCaramelTable() {
    const w = this.width;
    const h = this.height;
    const g = this.scene.add.graphics();
    this.container.add(g);

    // 1. Soft 2.5D Translucent Dark Oval Ambient Drop Shadow
    g.fillStyle(0x000000, 0.28);
    g.fillEllipse(0, h / 2 + 8, w * 1.06, 26);

    // 2. 3D Caramel Wooden Table Body (Front depth & beveled bottom)
    g.fillStyle(0x965018, 1.0); // Darker caramel underside bevel
    g.fillRoundedRect(-w / 2, -h / 2 + 8, w, h - 2, 14);

    g.fillStyle(0xc07028, 1.0); // Polished caramel wood front face
    g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h - 6, 14);

    // Front wood grain & drawer detail
    g.fillStyle(0xa85d1d, 1.0);
    g.fillRoundedRect(-w / 2 + 20, 4, w - 40, h / 2 - 10, 6);
    g.lineStyle(1.5, 0x824412, 0.8);
    g.strokeRoundedRect(-w / 2 + 20, 4, w - 40, h / 2 - 10, 6);

    // Brass drawer pull knob
    g.fillStyle(0xf59e0b, 1.0);
    g.fillCircle(0, h / 4 + 1, 4.5);
    g.fillStyle(0xfef08a, 1.0);
    g.fillCircle(-1, h / 4, 1.5);

    // 3. Polished Honey Amber Tabletop Surface with Rounded Edges
    g.fillStyle(0xdf8d3c, 1.0);
    g.fillRoundedRect(-w / 2 - 2, -h / 2 - 4, w + 4, h * 0.56, 12);

    // Top edge glossy highlight shine
    g.fillStyle(0xffffff, 0.35);
    g.fillRoundedRect(-w / 2 + 10, -h / 2 - 3, w - 20, 4, 2);

    // 4. Stylized White Sewing Machine with Needle & Silver Handwheel (Right Side)
    const smX = w / 2 - 40;
    const smY = -14;

    // Machine shadow
    g.fillStyle(0x000000, 0.2);
    g.fillRoundedRect(smX - 18, smY - 6, 36, 26, 4);

    // White glossy body
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(smX - 16, smY - 8, 32, 22, 5);

    // Upper arm
    g.fillStyle(0xf1f5f9, 1.0);
    g.fillRect(smX - 14, smY - 18, 10, 12);
    g.fillRect(smX - 14, smY - 20, 26, 7);

    // Chrome Needle bar & Presser foot
    g.fillStyle(0x94a3b8, 1.0);
    g.fillRect(smX + 8, smY - 14, 2.5, 10);
    g.fillStyle(0x64748b, 1.0);
    g.fillRect(smX + 6, smY - 4, 6, 2);

    // Silver Handwheel on the right side
    g.fillStyle(0xcfd8dc, 1.0);
    g.fillCircle(smX + 16, smY - 14, 6);
    g.fillStyle(0x94a3b8, 1.0);
    g.fillCircle(smX + 16, smY - 14, 3);

    // Gold spool pin & thread on top
    g.fillStyle(0xf59e0b, 1.0);
    g.fillRect(smX - 10, smY - 26, 5, 7);
    g.fillStyle(0xd97706, 1.0);
    g.strokeRect(smX - 10, smY - 26, 5, 7);

    // 5. Golden Scissors Accessory (Center Left)
    const scX = -8;
    const scY = -12;
    g.lineStyle(2.5, 0xf59e0b, 1.0); // Golden blades
    g.lineBetween(scX - 8, scY - 6, scX + 8, scY + 6);
    g.lineBetween(scX - 8, scY + 6, scX + 8, scY - 6);
    // Gold finger rings
    g.strokeCircle(scX - 10, scY - 7, 3.5);
    g.strokeCircle(scX - 10, scY + 7, 3.5);

    // 6. Colorful Spool of Thread (Left of scissors)
    const spX = -w / 2 + 48;
    const spY = -12;
    g.fillStyle(0xf59e0b, 1.0); // Golden rims
    g.fillCircle(spX, spY - 6, 5);
    g.fillCircle(spX, spY + 6, 5);
    // Vibrant Turquoise thread
    g.fillStyle(0x06b6d4, 1.0);
    g.fillRoundedRect(spX - 4, spY - 6, 8, 12, 2);

    // 7. Stack of Folded Pastel T-Shirts (Far Left)
    const stX = -w / 2 + 18;
    const stY = -12;

    // Pastel Mint T-Shirt (Bottom)
    g.fillStyle(0xa7f3d0, 1.0);
    g.fillRoundedRect(stX - 10, stY + 4, 20, 8, 2);
    g.fillStyle(0x6ee7b7, 0.7);
    g.fillRect(stX - 4, stY + 4, 8, 2);

    // Pastel Peach T-Shirt (Middle)
    g.fillStyle(0xfecdd3, 1.0);
    g.fillRoundedRect(stX - 10, stY - 1, 20, 8, 2);
    g.fillStyle(0xfda4af, 0.7);
    g.fillRect(stX - 4, stY - 1, 8, 2);

    // Pastel Sky Blue T-Shirt (Top)
    g.fillStyle(0xbae6fd, 1.0);
    g.fillRoundedRect(stX - 10, stY - 6, 20, 8, 2);
    g.fillStyle(0x7dd3fc, 0.7);
    g.fillRect(stX - 4, stY - 6, 8, 2);
  }

  /**
   * Affordable Upgrade Red Arrow Badge (↑)
   * Iconic bouncing red circle (radius 18px) with bold white up-arrow anchored at top-left.
   * Visible ONLY when playerCoins >= sewingStation.nextCost.
   */
  createRedArrowBadge() {
    const badgeX = -this.width / 2 + 4;
    const badgeY = -this.height / 2 - 4;

    this.redArrowBadge = this.scene.add.container(badgeX, badgeY);
    this.redArrowBadge.setDepth(20);
    this.container.add(this.redArrowBadge);

    const g = this.scene.add.graphics();
    // Ambient drop shadow
    g.fillStyle(0x000000, 0.32);
    g.fillCircle(1, 3, 19);

    // 3D Bottom Bevel
    g.fillStyle(0xb91c1c, 1.0);
    g.fillCircle(0, 2, 18);

    // Vibrant Red Face
    g.fillStyle(0xef4444, 1.0);
    g.fillCircle(0, 0, 18);

    // Top Gloss
    g.fillStyle(0xffffff, 0.35);
    g.fillCircle(0, -7, 7);
    this.redArrowBadge.add(g);

    // Bold White Up-Arrow
    const arrow = this.scene.add.text(0, -1, '↑', {
      fontFamily: FONT_FAMILY,
      fontSize: '25px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.redArrowBadge.add(arrow);

    // Pulsing Scale Animation (scale tween 1.0 to 1.16)
    this.badgePulseTween = this.scene.tweens.add({
      targets: this.redArrowBadge,
      scale: 1.16,
      duration: 450,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Interactive hit area: clicking badge opens Station Upgrade Card
    const hitArea = new Phaser.Geom.Circle(0, 0, 20);
    this.redArrowBadge.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
    this.redArrowBadge.on('pointerup', (pointer, localX, localY, event) => {
      if (event) event.stopPropagation();
      this.scene.events.emit('openStationUpgrade', { station: 'sewing' });
    });

    this.updateRedBadgeVisibility();
  }

  updateRedBadgeVisibility() {
    const canAfford = gameState.canUpgradeSewing();
    this.redArrowBadge.setVisible(canAfford);
  }

  createLevelBadge() {
    this.badgeContainer = this.scene.add.container(0, this.height / 2 + 16);
    this.container.add(this.badgeContainer);

    this.badgeBg = this.scene.add.graphics();
    this.badgeContainer.add(this.badgeBg);

    this.levelText = this.scene.add.text(0, 0, '', {
      fontFamily: FONT_FAMILY,
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.badgeContainer.add(this.levelText);

    this.updateLevelBadge(gameState.sewingStation.level);
  }

  updateLevelBadge(level) {
    const isStage1 = gameState.stage === 1;
    const isMax = isStage1 && level >= 25;

    this.badgeBg.clear();
    const w = isMax ? 110 : 96;
    const h = 28;

    this.badgeBg.fillStyle(0x000000, 0.28);
    this.badgeBg.fillRoundedRect(-w / 2, -h / 2 + 2, w, h, 9);

    if (isMax) {
      // Gold MAX LEVEL pill
      this.badgeBg.fillStyle(0xf59e0b, 1.0);
      this.badgeBg.fillRoundedRect(-w / 2, -h / 2, w, h - 2, 9);
      this.badgeBg.lineStyle(1.5, 0xfef08a, 1.0);
      this.badgeBg.strokeRoundedRect(-w / 2, -h / 2, w, h - 2, 9);
      this.levelText.setText('MAX LV. 25');
    } else {
      // Green Level Pill
      this.badgeBg.fillStyle(0x22c55e, 1.0);
      this.badgeBg.fillRoundedRect(-w / 2, -h / 2, w, h - 2, 9);
      this.badgeBg.lineStyle(1.5, 0xffffff, 0.95);
      this.badgeBg.strokeRoundedRect(-w / 2, -h / 2, w, h - 2, 9);

      if (isStage1) {
        this.levelText.setText(`Lv. ${level} / 25`);
      } else {
        this.levelText.setText(`Lv. ${level}`);
      }
    }
  }

  setupInteraction() {
    const hitArea = new Phaser.Geom.Rectangle(-this.width / 2, -this.height / 2, this.width, this.height + 26);
    this.container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.container.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: this.container,
        scale: 0.96,
        duration: 60,
        yoyo: true
      });
    });

    this.container.on('pointerup', () => {
      this.scene.events.emit('openStationUpgrade', { station: 'sewing' });
    });
  }

  playUpgradeEffect() {
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 120,
      yoyo: true
    });

    for (let i = 0; i < 6; i++) {
      const p = this.scene.add.text(
        this.x + Phaser.Math.Between(-35, 35),
        this.y + Phaser.Math.Between(-20, 10),
        '✨',
        { fontSize: '20px' }
      ).setOrigin(0.5).setDepth(25);

      this.scene.tweens.add({
        targets: p,
        y: p.y - Phaser.Math.Between(30, 60),
        alpha: 0,
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }
}

/**
 * Station 2: Jeans Table (Dotted Unlockable Station in Stage 2)
 */
export class JeansStation {
  constructor(scene, parentContainer) {
    this.scene = scene;
    const cfg = GAME_CONFIG.layout.station2;
    this.x = cfg.x;
    this.y = cfg.y;
    this.width = cfg.width;
    this.height = cfg.height;

    this.container = scene.add.container(this.x, this.y);
    this.container.setDepth(8);
    parentContainer.add(this.container);

    this.render();

    gameState.on('stageRenovated', () => this.render());
    gameState.on('stationUnlocked', (data) => {
      if (data.station === 'jeans') {
        this.playBuildCelebration();
        this.render();
      }
    });
  }

  render() {
    this.container.removeAll(true);

    if (gameState.stage < 2) {
      this.container.setVisible(false);
      return;
    }

    this.container.setVisible(true);

    if (!gameState.jeansStation.unlocked) {
      this.drawDottedOutline();
    } else {
      this.drawActiveTable();
    }
  }

  drawDottedOutline() {
    const w = this.width;
    const h = this.height;

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.15);
    shadow.fillRoundedRect(-w / 2 - 2, -h / 2 + 4, w + 4, h + 4, 12);
    this.container.add(shadow);

    const box = this.scene.add.graphics();
    box.fillStyle(0x38bdf8, 0.08);
    box.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    box.lineStyle(2.5, 0x0284c7, 0.85);
    this.strokeDottedRect(box, -w / 2, -h / 2, w, h, 8);
    this.container.add(box);

    const icon = this.scene.add.text(0, -14, '👖', { fontSize: '32px' }).setOrigin(0.5);
    this.container.add(icon);

    const badge = this.scene.add.container(0, 18);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0f172a, 0.85);
    bg.fillRoundedRect(-46, -13, 92, 26, 8);
    bg.lineStyle(1.5, 0x38bdf8, 1);
    bg.strokeRoundedRect(-46, -13, 92, 26, 8);
    badge.add(bg);

    const txt = this.scene.add.text(0, 0, '🔒 50 🪙', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setOrigin(0.5);
    badge.add(txt);
    this.container.add(badge);

    this.pulseTween = this.scene.tweens.add({
      targets: this.container,
      alpha: { from: 0.85, to: 1.0 },
      scale: { from: 0.98, to: 1.02 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    this.container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    this.container.on('pointerup', () => {
      this.scene.events.emit('openUnlockModal', {
        stationId: 'jeans',
        title: 'Unlock Jeans Station',
        icon: '👖',
        cost: GAME_CONFIG.layout.station2.unlockCost,
        desc: 'Craft and sell designer denim jeans for higher profit!'
      });
    });
  }

  drawActiveTable() {
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
      this.container.setScale(1.0);
      this.container.setAlpha(1.0);
    }

    const w = this.width;
    const h = this.height;
    const g = this.scene.add.graphics();
    this.container.add(g);

    // 1. Soft 2.5D Drop Shadow
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(0, h / 2 + 6, w * 1.04, 26);

    // 2. Heavy Dark Indigo Table Base
    g.fillStyle(0x1e3a8a, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.fillStyle(0x2563eb, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 12, { tl: 10, tr: 10, bl: 0, br: 0 });

    // 3. Denim Work Mat with gold stitching
    const matW = w * 0.75;
    const matH = h * 0.68;
    g.fillStyle(0x1d4ed8, 1.0);
    g.fillRoundedRect(-matW / 2, -matH / 2 + 4, matW, matH, 6);
    g.lineStyle(1.5, 0xf59e0b, 0.8);
    g.strokeRoundedRect(-matW / 2 + 2, -matH / 2 + 6, matW - 4, matH - 4, 4);

    // Denim roll & folded jeans stack
    g.fillStyle(0x172554, 1.0);
    g.fillRoundedRect(-w / 2 + 14, -14, 14, 26, 3);
    g.fillStyle(0x2563eb, 1.0);
    g.fillRoundedRect(-14, 4, 22, 10, 2);
    g.fillStyle(0x1d4ed8, 1.0);
    g.fillRoundedRect(-14, -2, 22, 10, 2);
    g.fillStyle(0xf59e0b, 1.0);
    g.fillRect(-12, 1, 18, 2);

    // Active Level Pill
    const badge = this.scene.add.container(0, h / 2 + 14);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.28);
    bg.fillRoundedRect(-36, -11, 72, 24, 8);
    bg.fillStyle(0x2563eb, 1.0);
    bg.fillRoundedRect(-38, -13, 76, 26, 8);
    bg.lineStyle(1.5, 0xffffff, 0.95);
    bg.strokeRoundedRect(-38, -13, 76, 26, 8);
    badge.add(bg);

    const txt = this.scene.add.text(0, 0, 'Lv. 1', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    badge.add(txt);
    this.container.add(badge);

    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h + 24);
    this.container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
  }

  playBuildCelebration() {
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    for (let i = 0; i < 10; i++) {
      const puff = this.scene.add.graphics();
      puff.setDepth(25);
      puff.setPosition(this.x + Phaser.Math.Between(-30, 30), this.y + Phaser.Math.Between(-20, 20));
      puff.fillStyle(0xf1f5f9, 0.8);
      puff.fillCircle(0, 0, Phaser.Math.Between(8, 14));

      this.scene.tweens.add({
        targets: puff,
        y: puff.y - Phaser.Math.Between(20, 50),
        alpha: 0,
        scale: 1.8,
        duration: 500,
        ease: 'Quad.easeOut',
        onComplete: () => puff.destroy()
      });
    }
  }

  strokeDottedRect(g, x, y, w, h, dash = 6) {
    const drawDashLine = (x1, y1, x2, y2) => {
      const dist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
      const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      let cur = 0;
      while (cur < dist) {
        const len = Math.min(dash, dist - cur);
        g.lineBetween(x1 + cos * cur, y1 + sin * cur, x1 + cos * (cur + len), y1 + sin * (cur + len));
        cur += dash * 2;
      }
    };
    drawDashLine(x, y, x + w, y);
    drawDashLine(x + w, y, x + w, y + h);
    drawDashLine(x + w, y + h, x, y + h);
    drawDashLine(x, y + h, x, y);
  }
}

/**
 * Station 3: Hats Rack (Dotted Unlockable Station in Stage 2)
 */
export class HatsStation {
  constructor(scene, parentContainer) {
    this.scene = scene;
    const cfg = GAME_CONFIG.layout.station3;
    this.x = cfg.x;
    this.y = cfg.y;
    this.width = cfg.width;
    this.height = cfg.height;

    this.container = scene.add.container(this.x, this.y);
    this.container.setDepth(8);
    parentContainer.add(this.container);

    this.render();

    gameState.on('stageRenovated', () => this.render());
    gameState.on('stationUnlocked', () => this.render());
  }

  render() {
    this.container.removeAll(true);

    if (gameState.stage < 2 || !gameState.jeansStation.unlocked) {
      this.container.setVisible(false);
      return;
    }

    this.container.setVisible(true);

    if (!gameState.hatsStation.unlocked) {
      this.drawDottedOutline();
    } else {
      this.drawActiveRack();
    }
  }

  drawDottedOutline() {
    const w = this.width;
    const h = this.height;

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.15);
    shadow.fillRoundedRect(-w / 2 - 2, -h / 2 + 4, w + 4, h + 4, 12);
    this.container.add(shadow);

    const box = this.scene.add.graphics();
    box.fillStyle(0xa855f7, 0.08);
    box.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    box.lineStyle(2.5, 0x9333ea, 0.85);

    const dash = 6;
    const drawDashLine = (x1, y1, x2, y2) => {
      const dist = Phaser.Math.Distance.Between(x1, y1, x2, y2);
      const angle = Phaser.Math.Angle.Between(x1, y1, x2, y2);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      let cur = 0;
      while (cur < dist) {
        const len = Math.min(dash, dist - cur);
        box.lineBetween(x1 + cos * cur, y1 + sin * cur, x1 + cos * (cur + len), y1 + sin * (cur + len));
        cur += dash * 2;
      }
    };
    drawDashLine(-w / 2, -h / 2, w / 2, -h / 2);
    drawDashLine(w / 2, -h / 2, w / 2, h / 2);
    drawDashLine(w / 2, h / 2, -w / 2, h / 2);
    drawDashLine(-w / 2, h / 2, -w / 2, -h / 2);
    this.container.add(box);

    const icon = this.scene.add.text(0, -14, '🧢', { fontSize: '32px' }).setOrigin(0.5);
    this.container.add(icon);

    const badge = this.scene.add.container(0, 18);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0f172a, 0.85);
    bg.fillRoundedRect(-50, -13, 100, 26, 8);
    bg.lineStyle(1.5, 0xa855f7, 1);
    bg.strokeRoundedRect(-50, -13, 100, 26, 8);
    badge.add(bg);

    const txt = this.scene.add.text(0, 0, '🔒 100 🪙', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setOrigin(0.5);
    badge.add(txt);
    this.container.add(badge);

    this.pulseTween = this.scene.tweens.add({
      targets: this.container,
      alpha: { from: 0.85, to: 1.0 },
      scale: { from: 0.98, to: 1.02 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    this.container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    this.container.on('pointerup', () => {
      this.scene.events.emit('openUnlockModal', {
        stationId: 'hats',
        title: 'Unlock Hats Rack',
        icon: '🧢',
        cost: GAME_CONFIG.layout.station3.unlockCost,
        desc: 'Craft trendy designer hats for premium boutique profits!'
      });
    });
  }

  drawActiveRack() {
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
      this.container.setScale(1.0);
      this.container.setAlpha(1.0);
    }

    const w = this.width;
    const h = this.height;
    const g = this.scene.add.graphics();
    this.container.add(g);

    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(0, h / 2 + 4, w * 0.95, 24);

    g.fillStyle(0x78350f, 1.0);
    g.fillRoundedRect(-w / 2 + 10, -h / 2, w - 20, h, 10);
    g.fillStyle(0x92400e, 1.0);
    g.fillRoundedRect(-w / 2 + 10, -h / 2, w - 20, 12, { tl: 10, tr: 10, bl: 0, br: 0 });

    const hats = [
      { x: -w / 2 + 40, icon: '🧢' },
      { x: 0, icon: '🎩' },
      { x: w / 2 - 40, icon: '👒' }
    ];

    hats.forEach(item => {
      g.fillStyle(0xd97706, 1.0);
      g.fillCircle(item.x, 2, 8);
      const hatTxt = this.scene.add.text(item.x, -6, item.icon, { fontSize: '24px' }).setOrigin(0.5);
      this.container.add(hatTxt);
    });

    const badge = this.scene.add.container(0, h / 2 + 14);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.28);
    bg.fillRoundedRect(-36, -11, 72, 24, 8);
    bg.fillStyle(0x9333ea, 1.0);
    bg.fillRoundedRect(-38, -13, 76, 26, 8);
    bg.lineStyle(1.5, 0xffffff, 0.95);
    bg.strokeRoundedRect(-38, -13, 76, 26, 8);
    badge.add(bg);

    const txt = this.scene.add.text(0, 0, 'Lv. 1', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    badge.add(txt);
    this.container.add(badge);

    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h + 24);
    this.container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
  }
}

/**
 * Counter Station (Top Checkout & Service Desk)
 */
export class CounterStation {
  constructor(scene, parentContainer) {
    this.scene = scene;
    const cfg = GAME_CONFIG.layout.counter;
    this.x = cfg.x;
    this.y = cfg.y;
    this.width = cfg.width;
    this.height = cfg.height;

    this.container = scene.add.container(this.x, this.y);
    this.container.setDepth(7);
    parentContainer.add(this.container);

    this.drawCounter();
  }

  drawCounter() {
    const w = this.width;
    const h = this.height;
    const g = this.scene.add.graphics();
    this.container.add(g);

    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(0, h / 2 + 10, w * 1.04, 28);

    g.fillStyle(GAME_CONFIG.colors.counterBevel, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h - 2, 24);

    g.fillStyle(GAME_CONFIG.colors.counterWood, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 4, 24);

    g.fillStyle(GAME_CONFIG.colors.counterTrim, 0.65);
    for (let lx = -w / 2 + 25; lx < w / 2 - 20; lx += 18) {
      g.fillRect(lx, -h / 2 + 6, 6, h - 16);
    }

    g.fillStyle(GAME_CONFIG.colors.counterTop, 1.0);
    g.fillRoundedRect(-w / 2 - 3, -h / 2 - 6, w + 6, 22, 11);

    g.fillStyle(0xffffff, 0.28);
    g.fillRoundedRect(-w / 2 + 10, -h / 2 - 5, w - 20, 3, 2);

    const caseW = 76;
    const caseH = 28;
    g.fillStyle(0x0f172a, 0.85);
    g.fillRoundedRect(-caseW / 2, 2, caseW, caseH, 5);
    g.fillStyle(0x38bdf8, 0.25);
    g.fillRoundedRect(-caseW / 2 + 2, 4, caseW - 4, caseH - 4, 3);

    g.fillStyle(0xef4444, 1.0);
    g.fillRoundedRect(-caseW / 2 + 8, 8, 14, 11, 2);
    g.fillStyle(0x3b82f6, 1.0);
    g.fillRoundedRect(-caseW / 2 + 28, 8, 14, 11, 2);
    g.fillStyle(0xf59e0b, 1.0);
    g.fillRoundedRect(-caseW / 2 + 48, 8, 14, 11, 2);

    this.drawPOSRegister(g, -60, -h / 2 - 2);
    this.drawPOSRegister(g, 60, -h / 2 - 2);
  }

  drawPOSRegister(g, x, y) {
    g.fillStyle(0x334155, 1.0);
    g.fillRect(x - 3, y, 6, 6);
    g.fillStyle(0x0f172a, 1.0);
    g.fillRoundedRect(x - 10, y - 14, 20, 14, 3);
    g.fillStyle(0x10b981, 1.0);
    g.fillRoundedRect(x - 8, y - 12, 16, 10, 2);
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(x - 6, y - 8, 12, 2);
  }
}

/**
 * Spawns 3D gold coin particles that arch up to the top coin pill
 */
export function spawnFloatingCoins(scene, startX, startY, amount, targetX = 360, targetY = 70) {
  const coinCount = Math.min(8, Math.max(3, Math.ceil(amount / 2)));

  for (let i = 0; i < coinCount; i++) {
    const delay = i * 65;

    scene.time.delayedCall(delay, () => {
      const coin = scene.add.container(
        startX + Phaser.Math.Between(-14, 14),
        startY + Phaser.Math.Between(-10, 10)
      );
      coin.setDepth(60);

      const cg = scene.add.graphics();
      cg.fillStyle(0x000000, 0.25);
      cg.fillCircle(1, 2, 12);
      cg.fillStyle(0xf59e0b, 1.0);
      cg.fillCircle(0, 0, 11);
      cg.fillStyle(0xfbbf24, 1.0);
      cg.fillCircle(0, 0, 9);
      cg.lineStyle(1.5, 0xd97706, 1);
      cg.strokeCircle(0, 0, 7);

      const star = scene.add.text(0, 0, '★', {
        fontFamily: FONT_FAMILY,
        fontSize: '11px',
        color: '#b45309'
      }).setOrigin(0.5);
      coin.add(cg);
      coin.add(star);

      const midX = (startX + targetX) / 2 + Phaser.Math.Between(-30, 30);
      const midY = Math.min(startY, targetY) - Phaser.Math.Between(50, 100);

      scene.tweens.add({
        targets: coin,
        scale: { from: 0.4, to: 1.2 },
        duration: 100,
        ease: 'Back.easeOut'
      });

      scene.tweens.add({
        targets: coin,
        x: midX,
        y: midY,
        duration: 240,
        ease: 'Quad.easeOut',
        onComplete: () => {
          scene.tweens.add({
            targets: coin,
            x: targetX,
            y: targetY,
            scale: 0.6,
            duration: 260,
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
