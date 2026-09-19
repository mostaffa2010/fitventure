/**
 * Fitventure - UI System
 * Top Floating Coin Pill, Bottom Dock Buttons (Renovate, Boost x2, Upgrades),
 * and Interactive Station Upgrade Modal Card.
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
    const w = 180;
    const h = 52;
    const r = h / 2;

    const g = this.scene.add.graphics();
    // Soft drop shadow
    g.fillStyle(0x000000, 0.22);
    g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, r);

    // Crisp white pill body
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r);

    // Border
    g.lineStyle(2, 0xe2e8f0, 1.0);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
    this.container.add(g);

    // Shiny Gold Coin Icon (Left)
    this.coinIcon = this.scene.add.container(-w / 2 + 28, 0);
    const cg = this.scene.add.graphics();
    cg.fillStyle(0xf1c40f, 1.0);
    cg.fillCircle(0, 0, 16);
    cg.lineStyle(2, 0xd4ac0d, 1.0);
    cg.strokeCircle(0, 0, 12);
    const star = this.scene.add.text(0, 0, '★', {
      fontSize: '13px',
      color: '#b7950b'
    }).setOrigin(0.5);
    this.coinIcon.add(cg);
    this.coinIcon.add(star);
    this.container.add(this.coinIcon);

    // Coin Amount Text
    this.amountText = this.scene.add.text(12, 0, '0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#2d3748'
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
 * Eatventure-style 3 dock buttons: Renovate (Hammer), Boost x2, Upgrades
 */
export class BottomDock {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(48);

    const dockY = 1200;
    this.createRenovateButton(150, dockY);
    this.createBoostButton(360, dockY);
    this.createUpgradesButton(570, dockY);
  }

  createButtonBase(x, y, w, h, bgColor, bevelColor) {
    const btnContainer = this.scene.add.container(x, y);
    const g = this.scene.add.graphics();
    // Drop shadow
    g.fillStyle(0x000000, 0.28);
    g.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, 14);
    // 3D bottom bevel
    g.fillStyle(bevelColor, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h - 4, 14);
    // Button face
    g.fillStyle(bgColor, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 6, 14);
    btnContainer.add(g);
    btnContainer.graphics = g;

    // Interactive hit area
    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    btnContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    btnContainer.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: btnContainer,
        y: y + 3,
        scale: 0.96,
        duration: 70
      });
    });

    const release = () => {
      this.scene.tweens.add({
        targets: btnContainer,
        y: y,
        scale: 1.0,
        duration: 80
      });
    };
    btnContainer.on('pointerup', release);
    btnContainer.on('pointerout', release);

    this.container.add(btnContainer);
    return btnContainer;
  }

  createRenovateButton(x, y) {
    const btn = this.createButtonBase(x, y, 140, 78, 0xffffff, 0xdcdde1);

    const icon = this.scene.add.text(0, -12, '🔨', { fontSize: '26px' }).setOrigin(0.5);
    const label = this.scene.add.text(0, 16, 'RENOVATE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#718093'
    }).setOrigin(0.5);

    btn.add(icon);
    btn.add(label);

    btn.on('pointerup', () => {
      this.scene.events.emit('openNotice', {
        title: 'Boutique Renovation',
        text: 'Stage 1: Boutique T-Shirt Studio is active! Maximize profits to expand.'
      });
    });
  }

  createBoostButton(x, y) {
    this.boostBtn = this.createButtonBase(x, y, 160, 78, 0xf39c12, 0xd68910);

    const icon = this.scene.add.text(0, -14, '⚡ 2X BOOST', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.boostTimerText = this.scene.add.text(0, 14, 'TAP TO ACTIVATE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#fef9e7'
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
        this.boostBtn.setScale(1.05);
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
    const btn = this.createButtonBase(x, y, 140, 78, 0x2ecc71, 0x27ae60);

    const icon = this.scene.add.text(0, -12, '⭐', { fontSize: '26px' }).setOrigin(0.5);
    const label = this.scene.add.text(0, 16, 'UPGRADES', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff'
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
 * Pops up when clicking the sewing table or upgrade dock button.
 * Shows station level, progress bar, profit per item, craft speed,
 * and a tactile blue upgrade button.
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
    this.backdrop.fillStyle(0x000000, 0.6);
    this.backdrop.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    this.backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height), Phaser.Geom.Rectangle.Contains);
    this.backdrop.on('pointerup', () => this.close());
    this.container.add(this.backdrop);

    // Floating Card Panel
    this.card = scene.add.container(360, 640);
    this.container.add(this.card);

    this.cardWidth = 460;
    this.cardHeight = 520;

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
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-w / 2, -h / 2 + 10, w, h, 24);

    // Clean white floating card body
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 24);

    // Top Header Banner
    g.fillStyle(0xf8fafc, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 76, { tl: 24, tr: 24, bl: 0, br: 0 });
    g.lineStyle(2, 0xe2e8f0, 1);
    g.lineBetween(-w / 2, -h / 2 + 76, w / 2, -h / 2 + 76);
    this.card.add(g);

    // Title: Sewing Station
    this.titleText = this.scene.add.text(-w / 2 + 26, -h / 2 + 24, 'Sewing Table', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#1e293b'
    });
    this.card.add(this.titleText);

    // Close Button (✕)
    const closeBtn = this.scene.add.container(w / 2 - 38, -h / 2 + 38);
    const closeBg = this.scene.add.graphics();
    closeBg.fillStyle(0xe2e8f0, 1.0);
    closeBg.fillCircle(0, 0, 18);
    const closeText = this.scene.add.text(0, 0, '✕', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#64748b'
    }).setOrigin(0.5);
    closeBtn.add(closeBg);
    closeBtn.add(closeText);
    closeBtn.setInteractive(new Phaser.Geom.Circle(0, 0, 18), Phaser.Geom.Circle.Contains);
    closeBtn.on('pointerup', () => this.close());
    this.card.add(closeBtn);

    // Station Illustration Box
    const illustBox = this.scene.add.graphics();
    illustBox.fillStyle(0xf1f5f9, 1.0);
    illustBox.fillRoundedRect(-w / 2 + 30, -h / 2 + 96, w - 60, 100, 16);
    this.card.add(illustBox);

    const stationIcon = this.scene.add.text(0, -h / 2 + 134, '🧵 👕 ✂️', {
      fontSize: '36px'
    }).setOrigin(0.5);
    this.card.add(stationIcon);

    this.levelBadgeText = this.scene.add.text(0, -h / 2 + 172, 'Level 1 / 50', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#2563eb'
    }).setOrigin(0.5);
    this.card.add(this.levelBadgeText);

    // Milestone Progress Bar Container
    this.progressBarGraphics = this.scene.add.graphics();
    this.card.add(this.progressBarGraphics);

    // Stat Row 1: Profit per T-shirt
    this.createStatRow(-h / 2 + 250, 'Profit Per T-Shirt:', 'profitText', '🪙 +4');

    // Stat Row 2: Crafting Speed
    this.createStatRow(-h / 2 + 310, 'Crafting Speed:', 'speedText', '2.8s');

    // Blue Upgrade Button at Bottom
    this.buildUpgradeButton(0, h / 2 - 65, w - 70, 68);
  }

  createStatRow(y, label, key, defaultVal) {
    const w = this.cardWidth;
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xf8fafc, 1.0);
    bg.fillRoundedRect(-w / 2 + 30, y - 20, w - 60, 44, 10);
    bg.lineStyle(1, 0xe2e8f0, 1);
    bg.strokeRoundedRect(-w / 2 + 30, y - 20, w - 60, 44, 10);
    this.card.add(bg);

    const lbl = this.scene.add.text(-w / 2 + 46, y + 2, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#475569'
    }).setOrigin(0, 0.5);
    this.card.add(lbl);

    this[key] = this.scene.add.text(w / 2 - 46, y + 2, defaultVal, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#16a34a'
    }).setOrigin(1, 0.5);
    this.card.add(this[key]);
  }

  buildUpgradeButton(x, y, w, h) {
    this.upgradeBtn = this.scene.add.container(x, y);
    this.card.add(this.upgradeBtn);

    this.upgradeBtnGraphics = this.scene.add.graphics();
    this.upgradeBtn.add(this.upgradeBtnGraphics);

    this.upgradeBtnText = this.scene.add.text(0, -10, 'UPGRADE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.upgradeBtn.add(this.upgradeBtnText);

    this.upgradeBtnCostText = this.scene.add.text(0, 14, '🪙 10', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
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
          duration: 70
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
          x: '+=6',
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
    const h = 12;
    const x = -w / 2;
    const y = -this.cardHeight / 2 + 208;

    // Track
    this.progressBarGraphics.fillStyle(0xe2e8f0, 1.0);
    this.progressBarGraphics.fillRoundedRect(x, y, w, h, 6);

    // Fill
    const pct = Phaser.Math.Clamp(current / max, 0, 1);
    if (pct > 0) {
      this.progressBarGraphics.fillStyle(0x3b82f6, 1.0);
      this.progressBarGraphics.fillRoundedRect(x, y, Math.max(12, w * pct), h, 6);
    }
  }

  drawUpgradeButtonVisual(canAfford, w = this.cardWidth - 70, h = 68) {
    this.upgradeBtnGraphics.clear();
    // Drop shadow
    this.upgradeBtnGraphics.fillStyle(0x000000, 0.25);
    this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 16);

    if (canAfford) {
      // Vibrant blue 3D bevel & face
      this.upgradeBtnGraphics.fillStyle(0x1d4ed8, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2 + 3, w, h - 3, 16);
      this.upgradeBtnGraphics.fillStyle(0x2563eb, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - 5, 16);
      this.upgradeBtnText.setColor('#ffffff');
      this.upgradeBtnCostText.setColor('#fef08a');
    } else {
      // Disabled slate gray
      this.upgradeBtnGraphics.fillStyle(0x64748b, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2 + 3, w, h - 3, 16);
      this.upgradeBtnGraphics.fillStyle(0x94a3b8, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - 5, 16);
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
