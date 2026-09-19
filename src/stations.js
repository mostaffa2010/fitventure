/**
 * Fitventure - Workstations & Visual Effects
 * 1. Station 1 (Sewing Table / T-Shirts): Warm 3D wooden counter with bevels, fabric, sewing machine.
 * 2. Station 2 (Jeans Table): Pulsing dotted outline in Stage 2 until unlocked (50 coins).
 * 3. Station 3 (Hats Rack): Next dotted outline in Stage 2 once Station 2 is unlocked (100 coins).
 * 4. Front Counter: Warm oak with rounded ends, dual POS registers, vitrine display.
 * 5. Radial Progress Gauge & 3D Floating Coin Bezier particles.
 */

import { GAME_CONFIG, gameState } from './config.js';

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

    this.centerText = scene.add.text(0, 0, '✂️', { fontSize: '16px' }).setOrigin(0.5);
    this.container.add(this.centerText);

    this.radius = 22;
    this.thickness = 6;
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
    this.graphics.fillCircle(0, 2, r + this.thickness / 2);

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
 * Warm 3D wooden counter with bevels, fabric rolls, scissors, and neat stacks of clothes.
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

    this.drawTable();
    this.createLevelBadge();
    this.setupInteraction();

    gameState.on('stationUpgraded', (data) => {
      if (data.station === 'sewing') {
        this.updateLevelBadge(data.level);
        this.playUpgradeEffect();
      }
    });
  }

  drawTable() {
    const w = this.width;
    const h = this.height;
    const g = this.scene.add.graphics();
    this.container.add(g);

    // 1. Soft 2.5D Translucent Dark Oval Drop Shadow directly under table
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(0, h / 2 + 6, w * 1.04, 26);

    // 2. Warm Wooden Table Base with 3D Bevels
    g.fillStyle(0x475569, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.fillStyle(0x64748b, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 12, { tl: 10, tr: 10, bl: 0, br: 0 });

    // 3. Self-Healing Green Cutting Mat
    const matW = w * 0.75;
    const matH = h * 0.68;
    g.fillStyle(0x10b981, 1.0);
    g.fillRoundedRect(-matW / 2, -matH / 2 + 4, matW, matH, 6);

    // Grid lines on cutting mat
    g.lineStyle(1, 0x34d399, 0.5);
    for (let lx = -matW / 2 + 10; lx < matW / 2; lx += 15) {
      g.lineBetween(lx, -matH / 2 + 6, lx, matH / 2 + 2);
    }
    for (let ly = -matH / 2 + 10; ly < matH / 2; ly += 14) {
      g.lineBetween(-matW / 2 + 4, ly, matW / 2 - 4, ly);
    }

    // 4. Modern Sewing Machine (Right)
    const smX = w / 2 - 42;
    const smY = -6;
    g.fillStyle(0xf8fafc, 1.0);
    g.fillRoundedRect(smX - 16, smY - 10, 32, 22, 5);
    g.fillStyle(0xe2e8f0, 1.0);
    g.fillRect(smX - 14, smY - 18, 10, 10);
    g.fillRect(smX - 14, smY - 20, 24, 6);
    // Needle
    g.fillStyle(0x1e293b, 1.0);
    g.fillRect(smX + 6, smY - 14, 2, 9);
    // Thread spool
    g.fillStyle(0xf59e0b, 1.0);
    g.fillRect(smX - 10, smY - 25, 5, 6);

    // 5. Tailor Tools & Fabric Rolls (Left)
    // Blue fabric roll
    g.fillStyle(0x3b82f6, 1.0);
    g.fillRoundedRect(-w / 2 + 14, -14, 12, 26, 3);
    // Shears
    g.lineStyle(2, 0x94a3b8, 1);
    g.lineBetween(-8, -8, 6, 8);
    g.lineBetween(-8, 8, 6, -8);

    // 6. Neat Folded Stacks of Clothes (Center)
    g.fillStyle(0xef4444, 1.0);
    g.fillRoundedRect(-16, 8, 18, 7, 2);
    g.fillStyle(0xf59e0b, 1.0);
    g.fillRoundedRect(-16, 4, 18, 7, 2);
    g.fillStyle(0x0ea5e9, 1.0);
    g.fillRoundedRect(-16, 0, 18, 7, 2);
  }

  createLevelBadge() {
    this.badgeContainer = this.scene.add.container(0, this.height / 2 + 14);
    this.container.add(this.badgeContainer);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.28);
    bg.fillRoundedRect(-36, -11, 72, 24, 8);
    bg.fillStyle(0x22c55e, 1.0);
    bg.fillRoundedRect(-38, -13, 76, 26, 8);
    bg.lineStyle(1.5, 0xffffff, 0.95);
    bg.strokeRoundedRect(-38, -13, 76, 26, 8);
    this.badgeContainer.add(bg);

    this.levelText = this.scene.add.text(0, 0, 'Lv. ' + gameState.sewingStation.level, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.badgeContainer.add(this.levelText);
  }

  updateLevelBadge(level) {
    this.levelText.setText('Lv. ' + level);
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

    // ONLY clicking directly on station in the world opens Station Modal
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
        { fontSize: '18px' }
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
 * Appears as a pulsing dotted outline box on floor until unlocked for 50 coins.
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

    // Listen for stage changes and unlocks
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

    // In Stage 1: hidden completely
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

    // Soft footprint shadow
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x000000, 0.15);
    shadow.fillRoundedRect(-w / 2 - 2, -h / 2 + 4, w + 4, h + 4, 12);
    this.container.add(shadow);

    // Pulsing dotted box
    const box = this.scene.add.graphics();
    box.fillStyle(0x38bdf8, 0.08);
    box.fillRoundedRect(-w / 2, -h / 2, w, h, 10);

    // Dotted dashed line perimeter
    box.lineStyle(2.5, 0x0284c7, 0.85);
    this.strokeDottedRect(box, -w / 2, -h / 2, w, h, 8);
    this.container.add(box);

    // Center Product Icon & Unlock Price Pill
    const icon = this.scene.add.text(0, -14, '👖', { fontSize: '28px' }).setOrigin(0.5);
    this.container.add(icon);

    const badge = this.scene.add.container(0, 18);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0f172a, 0.85);
    bg.fillRoundedRect(-44, -13, 88, 26, 8);
    bg.lineStyle(1.5, 0x38bdf8, 1);
    bg.strokeRoundedRect(-44, -13, 88, 26, 8);
    badge.add(bg);

    const txt = this.scene.add.text(0, 0, '🔒 50 🪙', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setOrigin(0.5);
    badge.add(txt);
    this.container.add(badge);

    // Pulsing breathing animation
    this.pulseTween = this.scene.tweens.add({
      targets: this.container,
      alpha: { from: 0.85, to: 1.0 },
      scale: { from: 0.98, to: 1.02 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Click handler to open unlock card
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

    // 1. Soft 2.5D Drop Shadow directly under table
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(0, h / 2 + 6, w * 1.04, 26);

    // 2. Heavy Dark Indigo Wooden Table Base
    g.fillStyle(0x1e3a8a, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    g.fillStyle(0x2563eb, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 12, { tl: 10, tr: 10, bl: 0, br: 0 });

    // 3. Denim Work Mat
    const matW = w * 0.75;
    const matH = h * 0.68;
    g.fillStyle(0x1d4ed8, 1.0);
    g.fillRoundedRect(-matW / 2, -matH / 2 + 4, matW, matH, 6);

    // Gold denim stitching lines
    g.lineStyle(1.5, 0xf59e0b, 0.8);
    g.strokeRoundedRect(-matW / 2 + 2, -matH / 2 + 6, matW - 4, matH - 4, 4);

    // 4. Heavy Denim Cutting Tools & Brass Rivets
    g.fillStyle(0xfbbf24, 1.0);
    g.fillCircle(w / 2 - 20, -10, 4);
    g.fillCircle(w / 2 - 20, 10, 4);

    // Denim roll (Indigo)
    g.fillStyle(0x172554, 1.0);
    g.fillRoundedRect(-w / 2 + 14, -14, 14, 26, 3);

    // Folded stack of Jeans (Blue with gold stitch)
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
      fontFamily: 'Arial, sans-serif',
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

    // White smoke puff & sparkles
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
 * Station 3: Hats Rack (Dotted Unlockable Station in Stage 2 after Jeans Station)
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

    // Only visible in Stage 2 AND after Jeans station is unlocked!
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

    // Dotted outline
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

    const icon = this.scene.add.text(0, -14, '🧢', { fontSize: '28px' }).setOrigin(0.5);
    this.container.add(icon);

    const badge = this.scene.add.container(0, 18);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0f172a, 0.85);
    bg.fillRoundedRect(-48, -13, 96, 26, 8);
    bg.lineStyle(1.5, 0xa855f7, 1);
    bg.strokeRoundedRect(-48, -13, 96, 26, 8);
    badge.add(bg);

    const txt = this.scene.add.text(0, 0, '🔒 100 🪙', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
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

    // 1. Soft 2.5D Drop Shadow directly under rack
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(0, h / 2 + 4, w * 0.95, 24);

    // 2. Polished Mahogany Wooden Stand Base
    g.fillStyle(0x78350f, 1.0);
    g.fillRoundedRect(-w / 2 + 10, -h / 2, w - 20, h, 10);
    g.fillStyle(0x92400e, 1.0);
    g.fillRoundedRect(-w / 2 + 10, -h / 2, w - 20, 12, { tl: 10, tr: 10, bl: 0, br: 0 });

    // 3. Display Pegs with Hats
    // Fedoras & Caps displayed on brass pegs
    const hats = [
      { x: -w / 2 + 40, icon: '🧢' },
      { x: 0, icon: '🎩' },
      { x: w / 2 - 40, icon: '👒' }
    ];

    hats.forEach(item => {
      g.fillStyle(0xd97706, 1.0);
      g.fillCircle(item.x, 2, 8);
      const hatTxt = this.scene.add.text(item.x, -6, item.icon, { fontSize: '22px' }).setOrigin(0.5);
      this.container.add(hatTxt);
    });

    // Level Pill
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
      fontFamily: 'Arial, sans-serif',
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
 * Materials: Warm Oak with Rounded Ends, 2.5D Drop Shadows, POS Tablets, Vitrine Display
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

    // 1. Soft 2.5D Translucent Dark Oval Drop Shadow directly under counter
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(0, h / 2 + 10, w * 1.04, 28);

    // 2. Warm Oak Counter Body with ROUNDED ENDS (Pill / Capsule profile)
    g.fillStyle(GAME_CONFIG.colors.counterBevel, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h - 2, 24);

    g.fillStyle(GAME_CONFIG.colors.counterWood, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 4, 24);

    // Fluted decorative vertical wood slats
    g.fillStyle(GAME_CONFIG.colors.counterTrim, 0.65);
    for (let lx = -w / 2 + 25; lx < w / 2 - 20; lx += 18) {
      g.fillRect(lx, -h / 2 + 6, 6, h - 16);
    }

    // 3. Polished Honey Oak Top Surface with Rounded Ends
    g.fillStyle(GAME_CONFIG.colors.counterTop, 1.0);
    g.fillRoundedRect(-w / 2 - 3, -h / 2 - 6, w + 6, 22, 11);

    // Top edge gloss highlight
    g.fillStyle(0xffffff, 0.28);
    g.fillRoundedRect(-w / 2 + 10, -h / 2 - 5, w - 20, 3, 2);

    // 4. Center Vitrine Display Case
    const caseW = 76;
    const caseH = 28;
    g.fillStyle(0x0f172a, 0.85);
    g.fillRoundedRect(-caseW / 2, 2, caseW, caseH, 5);
    g.fillStyle(0x38bdf8, 0.25);
    g.fillRoundedRect(-caseW / 2 + 2, 4, caseW - 4, caseH - 4, 3);

    // Samples inside vitrine
    g.fillStyle(0xef4444, 1.0);
    g.fillRoundedRect(-caseW / 2 + 8, 8, 14, 11, 2);
    g.fillStyle(0x3b82f6, 1.0);
    g.fillRoundedRect(-caseW / 2 + 28, 8, 14, 11, 2);
    g.fillStyle(0xf59e0b, 1.0);
    g.fillRoundedRect(-caseW / 2 + 48, 8, 14, 11, 2);

    // 5. Checkout POS Registers at Slot 1 and Slot 2
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

      const star = scene.add.text(0, 0, '★', { fontSize: '10px', color: '#b45309' }).setOrigin(0.5);
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
