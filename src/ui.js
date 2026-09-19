/**
 * Fitventure - UI System
 * Top Floating Coin Pill, Chunky 3D Bottom Dock Buttons (Renovate, Boost x2, Upgrades),
 * and High-Readability Interactive Station Upgrade Modal Card for Mobile.
 */

import { GAME_CONFIG, gameState } from './config.js';

/**
 * Top Floating Coin Pill Container
 * Displays current gold coin balance with format (e.g., 2.5K)
 */
export class TopCoinsPill {
  constructor(scene, x = 360, y = 70) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    this.container = scene.add.container(x, y);
    this.container.setDepth(50);

    this.drawPill();
    this.updateDisplay(gameState.coins);

    // Event listeners
    gameState.on('coinsChanged', (data) => {
      this.updateDisplay(data.coins);
      this.punch();
    });

    scene.events.on('coinPillPunch', () => {
      this.punch();
    });
  }

  drawPill() {
    const w = 210;
    const h = 58;
    const r = h / 2;

    const g = this.scene.add.graphics();
    // Soft drop shadow
    g.fillStyle(0x000000, 0.25);
    g.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, r);

    // 3D bottom bevel
    g.fillStyle(0xdcdde1, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2 + 3, w, h - 3, r);

    // Crisp white pill face
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 4, r);

    // Subtle inner border
    g.lineStyle(2, 0xe2e8f0, 1.0);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h - 4, r);
    this.container.add(g);

    // Shiny Gold Coin Icon (Left)
    this.coinIcon = this.scene.add.container(-w / 2 + 32, -2);
    const cg = this.scene.add.graphics();
    cg.fillStyle(0xf1c40f, 1.0);
    cg.fillCircle(0, 0, 18);
    cg.lineStyle(2, 0xd4ac0d, 1.0);
    cg.strokeCircle(0, 0, 14);
    const star = this.scene.add.text(0, 0, '★', {
      fontSize: '15px',
      color: '#b7950b'
    }).setOrigin(0.5);
    this.coinIcon.add(cg);
    this.coinIcon.add(star);
    this.container.add(this.coinIcon);

    // Coin Amount Text (Large, bold, high contrast for mobile)
    this.amountText = this.scene.add.text(16, -2, '0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#0f172a'
    }).setOrigin(0.5);
    this.container.add(this.amountText);
  }

  updateDisplay(coins) {
    this.amountText.setText(gameState.formatCoins(coins));
  }

  punch() {
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    this.scene.tweens.add({
      targets: this.coinIcon,
      angle: 360,
      duration: 400,
      ease: 'Cubic.easeOut'
    });
  }
}

/**
 * Bottom Dock Buttons
 * Vibrant, chunky 3D buttons (Hammer/Renovate, Boost x2, Upgrades):
 * Thick bottom shadow border, larger crisp icons, larger bold typography.
 */
export class BottomDock {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(48);

    const dockY = 1195;
    this.createRenovateButton(135, dockY);
    this.createBoostButton(360, dockY);
    this.createUpgradesButton(585, dockY);
  }

  /**
   * Rebuilds vibrant, chunky 3D buttons with a thick bottom shadow border (8-10px)
   */
  createChunkyButton(x, y, w, h, faceColor, bevelColor, shadowDepth = 8) {
    const btnContainer = this.scene.add.container(x, y);
    const g = this.scene.add.graphics();

    // 1. Soft ambient drop shadow
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-w / 2, -h / 2 + shadowDepth + 4, w, h, 18);

    // 2. Thick 3D bottom bevel (gives chunky, tactile physical depth)
    g.fillStyle(bevelColor, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2 + shadowDepth, w, h - shadowDepth, 18);

    // 3. Vibrant button face
    g.fillStyle(faceColor, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - shadowDepth - 3, 18);

    // 4. Glossy highlight line on top edge
    g.fillStyle(0xffffff, 0.28);
    g.fillRoundedRect(-w / 2 + 10, -h / 2 + 3, w - 20, 6, 3);

    btnContainer.add(g);
    btnContainer.graphics = g;

    // Interactive hit area
    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    btnContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    // Tactile press & bounce animations
    btnContainer.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: btnContainer,
        y: y + shadowDepth - 2,
        scale: 0.95,
        duration: 60,
        ease: 'Quad.easeOut'
      });
    });

    const release = () => {
      this.scene.tweens.add({
        targets: btnContainer,
        y: y,
        scale: 1.0,
        duration: 100,
        ease: 'Back.easeOut'
      });
    };
    btnContainer.on('pointerup', release);
    btnContainer.on('pointerout', release);

    this.container.add(btnContainer);
    return btnContainer;
  }

  createRenovateButton(x, y) {
    // Crisp white button with thick slate bevel
    const btn = this.createChunkyButton(x, y, 185, 88, 0xffffff, 0x94a3b8, 9);

    // Larger crisp icon
    const icon = this.scene.add.text(0, -14, '🔨', { fontSize: '34px' }).setOrigin(0.5);
    // Larger bold typography
    const label = this.scene.add.text(0, 18, 'RENOVATE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#334155'
    }).setOrigin(0.5);

    btn.add(icon);
    btn.add(label);

    btn.on('pointerup', () => {
      this.scene.events.emit('openNotice', {
        title: 'Boutique Renovation',
        text: 'Stage 1: Boutique T-Shirt Studio & Zone 2 Denim Studio are active! Maximize profits to expand your fashion empire.'
      });
    });
  }

  createBoostButton(x, y) {
    // Vibrant electric amber-gold with deep warm bevel
    this.boostBtn = this.createChunkyButton(x, y, 205, 88, 0xf59e0b, 0xb45309, 9);

    // Large crisp icon + bold title
    const icon = this.scene.add.text(0, -15, '⚡ 2X BOOST', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#78350f',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Large bold timer / prompt
    this.boostTimerText = this.scene.add.text(0, 17, 'TAP TO ACTIVATE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fef3c7'
    }).setOrigin(0.5);

    this.boostBtn.add(icon);
    this.boostBtn.add(this.boostTimerText);

    // Boost toggle
    this.boostBtn.on('pointerup', () => {
      if (!gameState.boostActive) {
        gameState.activateBoost(30);
      }
    });

    gameState.on('boostChanged', (data) => {
      if (data.active) {
        this.boostTimerText.setText(`${data.duration}s REMAINING`);
        this.boostBtn.setScale(1.04);
      } else {
        this.boostTimerText.setText('TAP TO ACTIVATE');
        this.boostBtn.setScale(1.0);
      }
    });

    gameState.on('boostTick', (data) => {
      this.boostTimerText.setText(`${data.duration}s REMAINING`);
    });
  }

  createUpgradesButton(x, y) {
    // Vibrant emerald green button with deep forest green bevel
    const btn = this.createChunkyButton(x, y, 185, 88, 0x22c55e, 0x15803d, 9);

    // Larger crisp icon
    const icon = this.scene.add.text(0, -14, '⭐', { fontSize: '34px' }).setOrigin(0.5);
    // Larger bold typography
    const label = this.scene.add.text(0, 18, 'UPGRADES', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#14532d',
      strokeThickness: 2
    }).setOrigin(0.5);

    btn.add(icon);
    btn.add(label);

    btn.on('pointerup', () => {
      this.scene.events.emit('openStationUpgrade', { station: 'sewing' });
    });
  }
}

/**
 * Interactive Station Upgrade Card (Modal)
 * Large, chunky, high-readability design for mobile screens.
 * Shows station level, progress bar, profit per item, craft speed,
 * and a tactile chunky blue upgrade button.
 */
export class StationUpgradeModal {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;

    // Main Modal Container
    this.container = scene.add.container(0, 0);
    this.container.setDepth(100);
    this.container.setVisible(false);

    // Dark semi-transparent backdrop
    this.backdrop = scene.add.graphics();
    this.backdrop.fillStyle(0x000000, 0.65);
    this.backdrop.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    this.backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height), Phaser.Geom.Rectangle.Contains);
    this.backdrop.on('pointerup', () => this.close());
    this.container.add(this.backdrop);

    // Floating Card Panel (increased dimensions: 520x590 for mobile readability)
    this.card = scene.add.container(360, 640);
    this.container.add(this.card);

    this.cardWidth = 520;
    this.cardHeight = 590;

    this.buildCardUI();

    // Listen for external open triggers
    scene.events.on('openStationUpgrade', () => this.open());
    gameState.on('coinsChanged', () => {
      if (this.isOpen) this.refreshValues();
    });
    gameState.on('stationUpgraded', () => {
      if (this.isOpen) this.refreshValues();
    });
  }

  buildCardUI() {
    const w = this.cardWidth;
    const h = this.cardHeight;

    const g = this.scene.add.graphics();
    // Card soft drop shadow
    g.fillStyle(0x000000, 0.4);
    g.fillRoundedRect(-w / 2, -h / 2 + 12, w, h, 26);

    // Clean white floating card body
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 26);

    // Top Header Banner
    g.fillStyle(0xf8fafc, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 84, { tl: 26, tr: 26, bl: 0, br: 0 });
    g.lineStyle(2, 0xe2e8f0, 1);
    g.lineBetween(-w / 2, -h / 2 + 84, w / 2, -h / 2 + 84);
    this.card.add(g);

    // Title: Sewing Station (Increased to 28px bold)
    this.titleText = this.scene.add.text(-w / 2 + 28, -h / 2 + 26, 'Sewing Table', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    this.card.add(this.titleText);

    // Close Button (✕) with larger touch target
    const closeBtn = this.scene.add.container(w / 2 - 42, -h / 2 + 42);
    const closeBg = this.scene.add.graphics();
    closeBg.fillStyle(0xe2e8f0, 1.0);
    closeBg.fillCircle(0, 0, 22);
    const closeText = this.scene.add.text(0, 0, '✕', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#475569'
    }).setOrigin(0.5);
    closeBtn.add(closeBg);
    closeBtn.add(closeText);
    closeBtn.setInteractive(new Phaser.Geom.Circle(0, 0, 22), Phaser.Geom.Circle.Contains);
    closeBtn.on('pointerup', () => this.close());
    this.card.add(closeBtn);

    // Station Illustration Box
    const illustBox = this.scene.add.graphics();
    illustBox.fillStyle(0xf1f5f9, 1.0);
    illustBox.fillRoundedRect(-w / 2 + 30, -h / 2 + 104, w - 60, 108, 18);
    this.card.add(illustBox);

    // Larger station icons
    const stationIcon = this.scene.add.text(0, -h / 2 + 144, '🧵  👕  ✂️', {
      fontSize: '40px'
    }).setOrigin(0.5);
    this.card.add(stationIcon);

    // Larger Level Badge Text (18px bold)
    this.levelBadgeText = this.scene.add.text(0, -h / 2 + 186, 'Level 1 / 50', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#1d4ed8'
    }).setOrigin(0.5);
    this.card.add(this.levelBadgeText);

    // Milestone Progress Bar Container (thick 16px bar)
    this.progressBarGraphics = this.scene.add.graphics();
    this.card.add(this.progressBarGraphics);

    // Stat Row 1: Profit per T-shirt (increased text size)
    this.createStatRow(-h / 2 + 270, 'Profit Per T-Shirt:', 'profitText', '🪙 +4');

    // Stat Row 2: Crafting Speed (increased text size)
    this.createStatRow(-h / 2 + 340, 'Crafting Speed:', 'speedText', '2.2s');

    // Chunky Blue Upgrade Button at Bottom (height: 78px)
    this.buildUpgradeButton(0, h / 2 - 70, w - 70, 78);
  }

  createStatRow(y, label, key, defaultVal) {
    const w = this.cardWidth;
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xf8fafc, 1.0);
    bg.fillRoundedRect(-w / 2 + 30, y - 24, w - 60, 52, 12);
    bg.lineStyle(1, 0xe2e8f0, 1);
    bg.strokeRoundedRect(-w / 2 + 30, y - 24, w - 60, 52, 12);
    this.card.add(bg);

    // Larger bold label
    const lbl = this.scene.add.text(-w / 2 + 48, y + 2, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#334155'
    }).setOrigin(0, 0.5);
    this.card.add(lbl);

    // Larger bold value
    this[key] = this.scene.add.text(w / 2 - 48, y + 2, defaultVal, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#15803d'
    }).setOrigin(1, 0.5);
    this.card.add(this[key]);
  }

  buildUpgradeButton(x, y, w, h) {
    this.upgradeBtn = this.scene.add.container(x, y);
    this.card.add(this.upgradeBtn);

    this.upgradeBtnGraphics = this.scene.add.graphics();
    this.upgradeBtn.add(this.upgradeBtnGraphics);

    // Larger bold upgrade label
    this.upgradeBtnText = this.scene.add.text(0, -13, 'UPGRADE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.upgradeBtn.add(this.upgradeBtnText);

    // Larger bold cost text
    this.upgradeBtnCostText = this.scene.add.text(0, 15, '🪙 10', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setOrigin(0.5);
    this.upgradeBtn.add(this.upgradeBtnCostText);

    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    this.upgradeBtn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.upgradeBtn.on('pointerdown', () => {
      if (gameState.canUpgradeSewing()) {
        this.scene.tweens.add({
          targets: this.upgradeBtn,
          scale: 0.95,
          duration: 60
        });
      }
    });

    this.upgradeBtn.on('pointerup', () => {
      this.upgradeBtn.setScale(1.0);
      if (gameState.canUpgradeSewing()) {
        gameState.upgradeSewing();
        this.playUpgradeSuccessAnimation();
        this.refreshValues();
      } else {
        // Shake button if can't afford
        this.scene.tweens.add({
          targets: this.upgradeBtn,
          x: '+=8',
          yoyo: true,
          repeat: 3,
          duration: 40
        });
      }
    });
  }

  drawProgressBar(current, max) {
    this.progressBarGraphics.clear();
    const w = this.cardWidth - 60;
    const h = 16;
    const x = -w / 2;
    const y = -this.cardHeight / 2 + 226;

    // Track
    this.progressBarGraphics.fillStyle(0xe2e8f0, 1.0);
    this.progressBarGraphics.fillRoundedRect(x, y, w, h, 8);

    // Fill
    const pct = Phaser.Math.Clamp(current / max, 0, 1);
    if (pct > 0) {
      this.progressBarGraphics.fillStyle(0x2563eb, 1.0);
      this.progressBarGraphics.fillRoundedRect(x, y, Math.max(16, w * pct), h, 8);
      // Shine highlight
      this.progressBarGraphics.fillStyle(0xffffff, 0.3);
      this.progressBarGraphics.fillRoundedRect(x + 4, y + 2, Math.max(10, w * pct - 8), 4, 2);
    }
  }

  drawUpgradeButtonVisual(canAfford, w = this.cardWidth - 70, h = 78) {
    this.upgradeBtnGraphics.clear();
    // Drop shadow
    this.upgradeBtnGraphics.fillStyle(0x000000, 0.3);
    this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, 18);

    if (canAfford) {
      // Chunky vibrant blue 3D bevel & face
      this.upgradeBtnGraphics.fillStyle(0x1d4ed8, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2 + 4, w, h - 4, 18);
      this.upgradeBtnGraphics.fillStyle(0x3b82f6, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - 8, 18);
      // Top gloss shine
      this.upgradeBtnGraphics.fillStyle(0xffffff, 0.3);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2 + 12, -h / 2 + 4, w - 24, 6, 3);

      this.upgradeBtnText.setColor('#ffffff');
      this.upgradeBtnCostText.setColor('#fef08a');
    } else {
      // Disabled slate gray
      this.upgradeBtnGraphics.fillStyle(0x475569, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2 + 4, w, h - 4, 18);
      this.upgradeBtnGraphics.fillStyle(0x94a3b8, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - 8, 18);

      this.upgradeBtnText.setColor('#e2e8f0');
      this.upgradeBtnCostText.setColor('#f1f5f9');
    }
  }

  refreshValues() {
    const { level, maxLevel } = gameState.sewingStation;
    const profit = gameState.getSewingProfit();
    const duration = (gameState.getSewingCraftDuration() / 1000).toFixed(1);
    const cost = gameState.getSewingUpgradeCost();
    const canAfford = gameState.canUpgradeSewing();

    this.titleText.setText(`Sewing Table - Lv. ${level}`);
    this.levelBadgeText.setText(`Level ${level} / ${maxLevel}`);
    this.drawProgressBar(level, maxLevel);

    this.profitText.setText(`🪙 +${gameState.formatCoins(profit)}`);
    this.speedText.setText(`${duration}s`);

    this.upgradeBtnCostText.setText(`🪙 ${gameState.formatCoins(cost)}`);
    this.drawUpgradeButtonVisual(canAfford);
  }

  playUpgradeSuccessAnimation() {
    this.scene.tweens.add({
      targets: this.card,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  open() {
    this.isOpen = true;
    this.refreshValues();
    this.container.setVisible(true);
    this.card.setScale(0.85);
    this.card.setAlpha(0);

    this.scene.tweens.add({
      targets: this.card,
      scale: 1,
      alpha: 1,
      duration: 250,
      ease: 'Back.easeOut'
    });
  }

  close() {
    this.scene.tweens.add({
      targets: this.card,
      scale: 0.9,
      alpha: 0,
      duration: 180,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.isOpen = false;
        this.container.setVisible(false);
      }
    });
  }
}
