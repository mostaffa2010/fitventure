/**
 * Fitventure - UI System
 * Top Floating Coin Pill, Chunky 3D Bottom Dock Buttons (Renovate, Boost x2, Upgrades),
 * Dedicated Global Upgrades Menu (General store perks modal),
 * Interactive Station Upgrade Modal (Triggered ONLY by clicking the sewing station in world),
 * Renovate Modal (Activates only at Level 25+), and Bold Red Square Close Buttons.
 */

import { GAME_CONFIG, STORE_PERKS, gameState } from './config.js';

/**
 * Creates a bold red square close button (X) as requested:
 * "Modal close buttons (X) in bold red squares"
 */
export function createRedSquareCloseBtn(scene, x, y, onClick) {
  const btn = scene.add.container(x, y);
  const size = 42;
  const bevel = 4;
  const r = 8;

  const g = scene.add.graphics();
  // Soft ambient drop shadow
  g.fillStyle(0x000000, 0.3);
  g.fillRoundedRect(-size / 2, -size / 2 + bevel + 2, size, size, r);

  // 3D bottom bevel (darker red)
  g.fillStyle(GAME_CONFIG.colors.redBevel, 1.0);
  g.fillRoundedRect(-size / 2, -size / 2 + bevel, size, size - bevel, r);

  // Vibrant red face
  g.fillStyle(GAME_CONFIG.colors.redBtn, 1.0);
  g.fillRoundedRect(-size / 2, -size / 2, size, size - bevel - 2, r);

  // Top gloss highlight
  g.fillStyle(0xffffff, 0.35);
  g.fillRoundedRect(-size / 2 + 4, -size / 2 + 2, size - 8, 4, 2);

  btn.add(g);

  // Crisp bold white '✕'
  const txt = scene.add.text(0, -bevel / 2 - 1, '✕', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '22px',
    fontStyle: 'bold',
    color: '#ffffff'
  }).setOrigin(0.5);
  btn.add(txt);

  const hitArea = new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size);
  btn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

  btn.on('pointerdown', () => {
    scene.tweens.add({
      targets: btn,
      y: y + bevel,
      scale: 0.94,
      duration: 50,
      ease: 'Quad.easeOut'
    });
  });

  const release = () => {
    scene.tweens.add({
      targets: btn,
      y: y,
      scale: 1.0,
      duration: 80,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (onClick) onClick();
      }
    });
  };

  btn.on('pointerup', release);
  btn.on('pointerout', () => {
    btn.y = y;
    btn.setScale(1.0);
  });

  return btn;
}

/**
 * Top Floating Coin Pill Container
 * Displays current gold coin balance with format (e.g., 2.5K) and 3D depth
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
    const w = 220;
    const h = 58;
    const r = h / 2;

    const g = this.scene.add.graphics();
    // Soft drop shadow
    g.fillStyle(0x000000, 0.28);
    g.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, r);

    // 3D bottom bevel
    g.fillStyle(0xcfd8dc, 1.0);
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
    cg.fillStyle(0xf59e0b, 1.0);
    cg.fillCircle(0, 0, 18);
    cg.fillStyle(0xfbbf24, 1.0);
    cg.fillCircle(0, 0, 15);
    cg.lineStyle(2, 0xd97706, 1.0);
    cg.strokeCircle(0, 0, 12);
    const star = this.scene.add.text(0, 0, '★', {
      fontSize: '15px',
      color: '#b45309'
    }).setOrigin(0.5);
    this.coinIcon.add(cg);
    this.coinIcon.add(star);
    this.container.add(this.coinIcon);

    // Coin Amount Text
    this.amountText = this.scene.add.text(18, -2, '0', {
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
      scaleX: 1.14,
      scaleY: 1.14,
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
 * Chunky 3D buttons (Renovate, Boost x2, Upgrades):
 * 3D bottom bevel borders, rich vibrant colors, large bold typography.
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

    // 2. Thick 3D bottom bevel
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

    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    btnContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    // Press animation
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
    this.renovateX = x;
    this.renovateY = y;
    this.renovateBtn = this.scene.add.container(x, y);
    this.container.add(this.renovateBtn);

    this.renovateGraphics = this.scene.add.graphics();
    this.renovateBtn.add(this.renovateGraphics);

    this.renovateIcon = this.scene.add.text(0, -15, '🔨', { fontSize: '32px' }).setOrigin(0.5);
    this.renovateBtn.add(this.renovateIcon);

    this.renovateLabel = this.scene.add.text(0, 16, 'RENOVATE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.renovateBtn.add(this.renovateLabel);

    this.renovateSub = this.scene.add.text(0, 31, 'LV. 25 REQ', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5);
    this.renovateBtn.add(this.renovateSub);

    const w = 185;
    const h = 88;
    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    this.renovateBtn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.updateRenovateButtonVisual();

    this.renovateBtn.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: this.renovateBtn,
        y: y + 5,
        scale: 0.95,
        duration: 60
      });
    });

    const release = () => {
      this.scene.tweens.add({
        targets: this.renovateBtn,
        y: y,
        scale: 1.0,
        duration: 100,
        ease: 'Back.easeOut'
      });
    };
    this.renovateBtn.on('pointerup', release);
    this.renovateBtn.on('pointerout', release);

    // Click handler: checks level 25 requirement
    this.renovateBtn.on('pointerup', () => {
      if (gameState.isRenovateUnlocked()) {
        this.scene.events.emit('openRenovateModal');
      } else {
        // Shake button when locked & show informative notice
        this.scene.tweens.add({
          targets: this.renovateBtn,
          x: '+=6',
          yoyo: true,
          repeat: 3,
          duration: 40
        });

        this.scene.events.emit('openNotice', {
          title: 'Stage 2 Locked',
          text: `Reach Sewing Station Level 25 to Renovate and transition to Stage 2!\n\nCurrent Progress: Level ${gameState.sewingStation.level} / 25`
        });
      }
    });

    // Listen for level upgrades to refresh state
    gameState.on('stationUpgraded', () => {
      this.updateRenovateButtonVisual();
    });
    gameState.on('renovateUnlocked', () => {
      this.updateRenovateButtonVisual();
    });
  }

  updateRenovateButtonVisual() {
    const isUnlocked = gameState.isRenovateUnlocked();
    const w = 185;
    const h = 88;
    const shadowDepth = 9;

    this.renovateGraphics.clear();

    // Ambient drop shadow
    this.renovateGraphics.fillStyle(0x000000, 0.35);
    this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2 + shadowDepth + 4, w, h, 18);

    if (isUnlocked) {
      // ACTIVE: Vibrant Amber-Gold with deep bevel
      this.renovateGraphics.fillStyle(0xb45309, 1.0);
      this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2 + shadowDepth, w, h - shadowDepth, 18);

      this.renovateGraphics.fillStyle(0xf59e0b, 1.0);
      this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - shadowDepth - 3, 18);

      // Top gloss highlight
      this.renovateGraphics.fillStyle(0xffffff, 0.35);
      this.renovateGraphics.fillRoundedRect(-w / 2 + 10, -h / 2 + 3, w - 20, 6, 3);

      this.renovateIcon.setText('🔨 ✨');
      this.renovateLabel.setColor('#ffffff');
      this.renovateSub.setText('READY!');
      this.renovateSub.setColor('#fef08a');

      // Pulse animation when ready to renovate
      if (!this.renovatePulseTween) {
        this.renovatePulseTween = this.scene.tweens.add({
          targets: this.renovateBtn,
          scale: 1.05,
          duration: 700,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } else {
      // LOCKED / INACTIVE: Slate Grey with dark bevel
      this.renovateGraphics.fillStyle(0x334155, 1.0);
      this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2 + shadowDepth, w, h - shadowDepth, 18);

      this.renovateGraphics.fillStyle(0x475569, 1.0);
      this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - shadowDepth - 3, 18);

      // Top gloss
      this.renovateGraphics.fillStyle(0xffffff, 0.15);
      this.renovateGraphics.fillRoundedRect(-w / 2 + 10, -h / 2 + 3, w - 20, 6, 3);

      this.renovateIcon.setText('🔒');
      this.renovateLabel.setColor('#cbd5e1');
      this.renovateSub.setText(`LV. ${gameState.sewingStation.level}/25`);
      this.renovateSub.setColor('#94a3b8');

      if (this.renovatePulseTween) {
        this.renovatePulseTween.stop();
        this.renovatePulseTween = null;
        this.renovateBtn.setScale(1.0);
      }
    }
  }

  createBoostButton(x, y) {
    this.boostBtn = this.createChunkyButton(x, y, 205, 88, 0xf59e0b, 0xb45309, 9);

    const icon = this.scene.add.text(0, -15, '⚡ 2X BOOST', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#78350f',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.boostTimerText = this.scene.add.text(0, 17, 'TAP TO ACTIVATE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#fef3c7'
    }).setOrigin(0.5);

    this.boostBtn.add(icon);
    this.boostBtn.add(this.boostTimerText);

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

    const icon = this.scene.add.text(0, -14, '⭐', { fontSize: '34px' }).setOrigin(0.5);
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

    // CRITICAL REQUIREMENT: Bottom-Right UPGRADES Button opens Global Store Perks Menu!
    btn.on('pointerup', () => {
      this.scene.events.emit('openGlobalUpgrades');
    });
  }
}

/**
 * Interactive Station Upgrade Card (Modal)
 * CRITICAL LOGIC: MUST ONLY open when clicking directly on the Sewing Station in the world!
 * Displays station level, profit, speed, and level-up cost.
 * Close button (X) is in a bold red square.
 */
export class StationUpgradeModal {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;

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

    // Floating Card Panel
    this.cardWidth = 520;
    this.cardHeight = 600;
    this.card = scene.add.container(360, 640);
    this.container.add(this.card);

    this.buildCardUI();

    // Listen for external open trigger ONLY from sewing station
    scene.events.on('openStationUpgrade', (data) => {
      if (data && data.station === 'sewing') {
        this.open();
      }
    });

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

    // Title: Sewing Table
    this.titleText = this.scene.add.text(-w / 2 + 28, -h / 2 + 28, 'Sewing Table', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    this.card.add(this.titleText);

    // Close Button (X) in BOLD RED SQUARE
    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 38, -h / 2 + 42, () => this.close());
    this.card.add(closeBtn);

    // Station Illustration Box
    const illustBox = this.scene.add.graphics();
    illustBox.fillStyle(0xf1f5f9, 1.0);
    illustBox.fillRoundedRect(-w / 2 + 30, -h / 2 + 104, w - 60, 108, 18);
    this.card.add(illustBox);

    const stationIcon = this.scene.add.text(0, -h / 2 + 144, '🧵  👕  ✂️', {
      fontSize: '40px'
    }).setOrigin(0.5);
    this.card.add(stationIcon);

    this.levelBadgeText = this.scene.add.text(0, -h / 2 + 186, 'Level 1 / 50', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#1d4ed8'
    }).setOrigin(0.5);
    this.card.add(this.levelBadgeText);

    // Milestone Progress Bar Graphics
    this.progressBarGraphics = this.scene.add.graphics();
    this.card.add(this.progressBarGraphics);

    // Stat Row 1: Profit per T-shirt
    this.createStatRow(-h / 2 + 272, 'Profit Per T-Shirt:', 'profitText', '🪙 +4');

    // Stat Row 2: Crafting Speed
    this.createStatRow(-h / 2 + 344, 'Crafting Speed:', 'speedText', '2.0s');

    // Chunky Blue Upgrade Button at Bottom
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

    const lbl = this.scene.add.text(-w / 2 + 48, y + 2, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#334155'
    }).setOrigin(0, 0.5);
    this.card.add(lbl);

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

    this.upgradeBtnText = this.scene.add.text(0, -13, 'UPGRADE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.upgradeBtn.add(this.upgradeBtnText);

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
      // Top gloss
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

/**
 * Dedicated Global Upgrades Menu (General Store Perks Modal)
 * CRITICAL LOGIC: Opens via the Bottom-Right UPGRADES Button (EXACTLY like Eatventure).
 * Contains general store perks:
 * - "Hire Raymond": +1 Tailor assistant (Cost: 100) -> Spawns 2nd worker
 * - "Better Sneakers": Workers walk 30% faster (Cost: 150)
 * - "Flyer Distribution": +1 Customer capacity in queue (Cost: 75)
 * - "Premium Fabric": T-Shirt profit x2 multiplier (Cost: 200)
 * Each perk has an icon, title, description, and an active/purchased state.
 * Modal close button (X) is in a bold red square.
 */
export class GlobalUpgradesModal {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;

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

    // Floating Card Panel
    this.cardWidth = 540;
    this.cardHeight = 690;
    this.card = scene.add.container(360, 640);
    this.container.add(this.card);

    this.perkRows = [];

    this.buildCardUI();

    // Listen for open trigger from Bottom-Right UPGRADES button
    scene.events.on('openGlobalUpgrades', () => this.open());

    // Listen for state changes to refresh buttons
    gameState.on('coinsChanged', () => {
      if (this.isOpen) this.refreshPerkRows();
    });
    gameState.on('perkPurchased', () => {
      if (this.isOpen) this.refreshPerkRows();
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
    g.fillRoundedRect(-w / 2, -h / 2, w, 86, { tl: 26, tr: 26, bl: 0, br: 0 });
    g.lineStyle(2, 0xe2e8f0, 1);
    g.lineBetween(-w / 2, -h / 2 + 86, w / 2, -h / 2 + 86);
    this.card.add(g);

    // Header Title: STORE UPGRADES
    const title = this.scene.add.text(-w / 2 + 28, -h / 2 + 20, '⭐ STORE UPGRADES', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    this.card.add(title);

    const subTitle = this.scene.add.text(-w / 2 + 30, -h / 2 + 54, 'Permanent store perks to scale your boutique', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#64748b'
    });
    this.card.add(subTitle);

    // Close Button (X) in BOLD RED SQUARE
    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 38, -h / 2 + 42, () => this.close());
    this.card.add(closeBtn);

    // Build the 4 Perk Cards Stack
    const startY = -h / 2 + 155;
    const rowSpacing = 120;

    STORE_PERKS.forEach((perk, index) => {
      const rowY = startY + index * rowSpacing;
      const row = this.createPerkRow(0, rowY, perk);
      this.card.add(row);
      this.perkRows.push({ perk, row });
    });
  }

  createPerkRow(x, y, perk) {
    const rowContainer = this.scene.add.container(x, y);
    const rowW = this.cardWidth - 50;
    const rowH = 104;

    const bg = this.scene.add.graphics();
    rowContainer.add(bg);
    rowContainer.bg = bg;

    // Left: Icon Badge
    const iconBadge = this.scene.add.container(-rowW / 2 + 45, 0);
    const ibg = this.scene.add.graphics();
    ibg.fillStyle(0xf1f5f9, 1.0);
    ibg.fillRoundedRect(-30, -30, 60, 60, 14);
    ibg.lineStyle(1.5, 0xe2e8f0, 1.0);
    ibg.strokeRoundedRect(-30, -30, 60, 60, 14);
    iconBadge.add(ibg);

    const iconText = this.scene.add.text(0, 0, perk.icon, {
      fontSize: '32px'
    }).setOrigin(0.5);
    iconBadge.add(iconText);
    rowContainer.add(iconBadge);

    // Center: Title & Description
    const textStartX = -rowW / 2 + 90;
    const titleText = this.scene.add.text(textStartX, -22, perk.title, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    rowContainer.add(titleText);

    const descText = this.scene.add.text(textStartX, 4, perk.description, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#475569',
      wordWrap: { width: 220 }
    });
    rowContainer.add(descText);

    // Right: Action Buy Button (140x52)
    const btnContainer = this.scene.add.container(rowW / 2 - 82, 0);
    rowContainer.add(btnContainer);
    rowContainer.btnContainer = btnContainer;

    const btnGraphics = this.scene.add.graphics();
    btnContainer.add(btnGraphics);
    btnContainer.graphics = btnGraphics;

    const btnText = this.scene.add.text(0, -9, 'BUY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    btnContainer.add(btnText);
    btnContainer.btnText = btnText;

    const btnCostText = this.scene.add.text(0, 12, `🪙 ${perk.cost}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setOrigin(0.5);
    btnContainer.add(btnCostText);
    btnContainer.btnCostText = btnCostText;

    const btnW = 140;
    const btnH = 54;
    const hitArea = new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH);
    btnContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    btnContainer.on('pointerdown', () => {
      if (gameState.canBuyPerk(perk.id)) {
        this.scene.tweens.add({
          targets: btnContainer,
          scale: 0.95,
          duration: 50
        });
      }
    });

    btnContainer.on('pointerup', () => {
      btnContainer.setScale(1.0);
      if (gameState.canBuyPerk(perk.id)) {
        gameState.buyPerk(perk.id);

        // Success juice
        this.scene.tweens.add({
          targets: rowContainer,
          scaleX: 1.04,
          scaleY: 1.04,
          duration: 90,
          yoyo: true,
          ease: 'Quad.easeOut'
        });

        this.refreshPerkRows();
      } else if (!gameState.isPerkPurchased(perk.id)) {
        // Shake button if cannot afford
        this.scene.tweens.add({
          targets: btnContainer,
          x: '+=6',
          yoyo: true,
          repeat: 3,
          duration: 40
        });
      }
    });

    return rowContainer;
  }

  refreshPerkRows() {
    const rowW = this.cardWidth - 50;
    const rowH = 104;
    const btnW = 140;
    const btnH = 54;

    this.perkRows.forEach(({ perk, row }) => {
      const isPurchased = gameState.isPerkPurchased(perk.id);
      const canAfford = gameState.canBuyPerk(perk.id);

      // Row background
      row.bg.clear();
      row.bg.fillStyle(isPurchased ? 0xf0fdf4 : 0xf8fafc, 1.0);
      row.bg.fillRoundedRect(-rowW / 2, -rowH / 2, rowW, rowH, 16);
      row.bg.lineStyle(1.5, isPurchased ? 0x86efac : 0xe2e8f0, 1.0);
      row.bg.strokeRoundedRect(-rowW / 2, -rowH / 2, rowW, rowH, 16);

      // Button Visual
      const bg = row.btnContainer.graphics;
      bg.clear();

      if (isPurchased) {
        // PURCHASED / ACTIVE Badge
        bg.fillStyle(0x000000, 0.15);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2 + 3, btnW, btnH, 14);

        bg.fillStyle(0x059669, 1.0); // Active Green Bevel
        bg.fillRoundedRect(-btnW / 2, -btnH / 2 + 3, btnW, btnH - 3, 14);

        bg.fillStyle(0x10b981, 1.0); // Active Green Face
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH - 4, 14);

        row.btnContainer.btnText.setText('ACTIVE ✔️');
        row.btnContainer.btnText.setPosition(0, 0);
        row.btnContainer.btnText.setColor('#ffffff');
        row.btnContainer.btnCostText.setVisible(false);
      } else {
        row.btnContainer.btnText.setText('BUY');
        row.btnContainer.btnText.setPosition(0, -9);
        row.btnContainer.btnCostText.setVisible(true);
        row.btnContainer.btnCostText.setText(`🪙 ${perk.cost}`);

        // Shadow
        bg.fillStyle(0x000000, 0.25);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH, 14);

        if (canAfford) {
          // Vibrant Chunky Green 3D Button
          bg.fillStyle(0x15803d, 1.0); // Bevel
          bg.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH - 4, 14);
          bg.fillStyle(0x22c55e, 1.0); // Face
          bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH - 6, 14);
          // Highlight shine
          bg.fillStyle(0xffffff, 0.3);
          bg.fillRoundedRect(-btnW / 2 + 8, -btnH / 2 + 3, btnW - 16, 4, 2);

          row.btnContainer.btnText.setColor('#ffffff');
          row.btnContainer.btnCostText.setColor('#fef08a');
        } else {
          // Disabled Slate 3D Button
          bg.fillStyle(0x334155, 1.0); // Bevel
          bg.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH - 4, 14);
          bg.fillStyle(0x64748b, 1.0); // Face
          bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH - 6, 14);

          row.btnContainer.btnText.setColor('#cbd5e1');
          row.btnContainer.btnCostText.setColor('#e2e8f0');
        }
      }
    });
  }

  open() {
    this.isOpen = true;
    this.refreshPerkRows();
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

/**
 * Stage 2 Renovation Modal
 * Unlocks ONLY when Sewing Station reaches Level 25.
 * Prompts transition to Stage 2 with celebration and bold red square close button.
 */
export class RenovateModal {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(110);
    this.container.setVisible(false);

    // Backdrop
    this.backdrop = scene.add.graphics();
    this.backdrop.fillStyle(0x000000, 0.7);
    this.backdrop.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    this.backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height), Phaser.Geom.Rectangle.Contains);
    this.backdrop.on('pointerup', () => this.close());
    this.container.add(this.backdrop);

    this.cardWidth = 520;
    this.cardHeight = 470;
    this.card = scene.add.container(360, 640);
    this.container.add(this.card);

    this.buildUI();

    scene.events.on('openRenovateModal', () => this.open());
  }

  buildUI() {
    const w = this.cardWidth;
    const h = this.cardHeight;

    const g = this.scene.add.graphics();
    // Drop shadow
    g.fillStyle(0x000000, 0.45);
    g.fillRoundedRect(-w / 2, -h / 2 + 10, w, h, 26);

    // Card face
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 26);

    // Header banner
    g.fillStyle(0xfef3c7, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 86, { tl: 26, tr: 26, bl: 0, br: 0 });
    g.lineStyle(2, 0xfde68a, 1);
    g.lineBetween(-w / 2, -h / 2 + 86, w / 2, -h / 2 + 86);
    this.card.add(g);

    // Title
    const title = this.scene.add.text(-w / 2 + 28, -h / 2 + 28, '🏆 STAGE 2 RENOVATION', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '25px',
      fontStyle: 'bold',
      color: '#92400e'
    });
    this.card.add(title);

    // Bold Red Square Close Button
    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 38, -h / 2 + 42, () => this.close());
    this.card.add(closeBtn);

    // Stage 2 Illustration
    const illustG = this.scene.add.graphics();
    illustG.fillStyle(0xf8fafc, 1.0);
    illustG.fillRoundedRect(-w / 2 + 30, -h / 2 + 110, w - 60, 96, 16);
    this.card.add(illustG);

    const illustText = this.scene.add.text(0, -h / 2 + 158, '🏬  ✨  🎉', {
      fontSize: '44px'
    }).setOrigin(0.5);
    this.card.add(illustText);

    // Celebration message
    const msg1 = this.scene.add.text(0, -h / 2 + 235, 'Congratulations, Fashion Tycoon!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '21px',
      fontStyle: 'bold',
      color: '#0f172a'
    }).setOrigin(0.5);
    this.card.add(msg1);

    const msg2 = this.scene.add.text(0, -h / 2 + 295, 'Your boutique has reached Sewing Level 25! Renovate to transition into Stage 2: Grand Fashion Mall with designer collections and higher profits.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#475569',
      align: 'center',
      wordWrap: { width: 440 }
    }).setOrigin(0.5);
    this.card.add(msg2);

    // Chunky Golden Renovate Action Button
    this.buildRenovateActionBtn(0, h / 2 - 62, w - 80, 68);
  }

  buildRenovateActionBtn(x, y, w, h) {
    const btn = this.scene.add.container(x, y);
    this.card.add(btn);

    const g = this.scene.add.graphics();
    // Drop shadow
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, 18);
    // 3D bevel
    g.fillStyle(0xb45309, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2 + 5, w, h - 5, 18);
    // Vibrant gold face
    g.fillStyle(0xf59e0b, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 7, 18);
    // Top highlight
    g.fillStyle(0xffffff, 0.35);
    g.fillRoundedRect(-w / 2 + 12, -h / 2 + 3, w - 24, 5, 2);
    btn.add(g);

    const txt = this.scene.add.text(0, -3, 'RENOVATE NOW! 🚀', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#78350f',
      strokeThickness: 2
    }).setOrigin(0.5);
    btn.add(txt);

    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    btn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    btn.on('pointerdown', () => btn.setScale(0.96));
    btn.on('pointerup', () => {
      btn.setScale(1.0);
      this.playRenovateCelebration();
    });
  }

  playRenovateCelebration() {
    this.close();

    // Confetti & Fireworks burst across screen
    const colors = [0xf59e0b, 0xef4444, 0x3b82f6, 0x10b981, 0xec4899];
    for (let i = 0; i < 40; i++) {
      const conf = this.scene.add.text(
        360 + Phaser.Math.Between(-150, 150),
        600 + Phaser.Math.Between(-50, 50),
        Phaser.Utils.Array.GetRandom(['🎉', '✨', '⭐', '🎊', '👗', '👕']),
        { fontSize: `${Phaser.Math.Between(18, 28)}px` }
      ).setOrigin(0.5).setDepth(120);

      this.scene.tweens.add({
        targets: conf,
        x: conf.x + Phaser.Math.Between(-250, 250),
        y: conf.y - Phaser.Math.Between(200, 500),
        angle: Phaser.Math.Between(-180, 180),
        alpha: 0,
        duration: Phaser.Math.Between(1200, 1800),
        ease: 'Cubic.easeOut',
        onComplete: () => conf.destroy()
      });
    }

    this.scene.events.emit('openNotice', {
      title: '🎉 Stage 2 Unlocked!',
      text: 'Boutique successfully renovated! Stage 2: Grand Fashion Mall is ready for business!'
    });
  }

  open() {
    this.isOpen = true;
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

/**
 * Notice Toast / Modal with Bold Red Square Close Button
 */
export class NoticeModal {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(115);
    this.container.setVisible(false);

    // Backdrop
    this.backdrop = scene.add.graphics();
    this.backdrop.fillStyle(0x000000, 0.6);
    this.backdrop.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    this.backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height), Phaser.Geom.Rectangle.Contains);
    this.backdrop.on('pointerup', () => this.close());
    this.container.add(this.backdrop);

    this.card = scene.add.container(360, 640);
    this.container.add(this.card);

    this.buildUI();

    scene.events.on('openNotice', (data) => this.show(data));
  }

  buildUI() {
    const w = 460;
    const h = 260;

    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-w / 2, -h / 2 + 8, w, h, 20);
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 20);

    // Header banner
    g.fillStyle(0xf8fafc, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 64, { tl: 20, tr: 20, bl: 0, br: 0 });
    g.lineStyle(1.5, 0xe2e8f0, 1.0);
    g.lineBetween(-w / 2, -h / 2 + 64, w / 2, -h / 2 + 64);
    this.card.add(g);

    this.titleText = this.scene.add.text(-w / 2 + 24, -h / 2 + 18, 'Notice', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    this.card.add(this.titleText);

    // Bold Red Square Close Button
    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 32, -h / 2 + 32, () => this.close());
    this.card.add(closeBtn);

    this.bodyText = this.scene.add.text(0, -h / 2 + 115, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#475569',
      align: 'center',
      wordWrap: { width: 390 }
    }).setOrigin(0.5);
    this.card.add(this.bodyText);

    // Chunky OK Button
    const okBtn = this.scene.add.container(0, h / 2 - 42);
    const bgBtn = this.scene.add.graphics();
    bgBtn.fillStyle(0x1d4ed8, 1.0);
    bgBtn.fillRoundedRect(-70, -20, 140, 42, 12);
    bgBtn.fillStyle(0x3b82f6, 1.0);
    bgBtn.fillRoundedRect(-70, -23, 140, 42, 12);
    okBtn.add(bgBtn);

    const okTxt = this.scene.add.text(0, -2, 'GOT IT', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    okBtn.add(okTxt);

    okBtn.setInteractive(new Phaser.Geom.Rectangle(-70, -23, 140, 42), Phaser.Geom.Rectangle.Contains);
    okBtn.on('pointerdown', () => okBtn.setScale(0.95));
    okBtn.on('pointerup', () => {
      okBtn.setScale(1.0);
      this.close();
    });
    this.card.add(okBtn);
  }

  show(data) {
    this.titleText.setText(data.title || 'Notice');
    this.bodyText.setText(data.text || '');
    this.container.setVisible(true);
    this.card.setScale(0.85);
    this.card.setAlpha(0);

    this.scene.tweens.add({
      targets: this.card,
      scale: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  close() {
    this.scene.tweens.add({
      targets: this.card,
      scale: 0.9,
      alpha: 0,
      duration: 150,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.container.setVisible(false);
      }
    });
  }
}
