/**
 * Fitventure - UI System & Modals
 * Typography: 'Fredoka', 'Nunito', sans-serif (Commercial Juicy Cartoon Style)
 * 1. Top Floating Coin Pill with 3D depth and +40% large chunky numerals.
 * 2. Chunky 3D Bottom Dock Buttons with dark bottom bevel stripes and squash-and-stretch tween.
 * 3. Self-Clearing Global Upgrades Menu (Purchased perks disappear and smoothly re-stack).
 * 4. Station Upgrade Modal with Stage 1 Level 25 Cap ("Level X / 25" & "MAX LEVEL - READY TO RENOVATE").
 * 5. Unlock Station Modal for Jeans and Hats stations.
 * 6. True Renovation Transition & Stage 2 Grand Opening Modal.
 * 7. Bold Red Square Close Buttons (X).
 */

import { GAME_CONFIG, FONT_FAMILY, STORE_UPGRADES, gameState } from './config.js';

/**
 * Creates a bold red square close button (X) with dark bottom bevel stripe
 */
export function createRedSquareCloseBtn(scene, x, y, onClick) {
  const btn = scene.add.container(x, y);
  const size = 44;
  const bevel = 5;
  const r = 9;

  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.32);
  g.fillRoundedRect(-size / 2, -size / 2 + bevel + 2, size, size, r);

  // Dark bottom bevel stripe
  g.fillStyle(GAME_CONFIG.colors.redBevel, 1.0);
  g.fillRoundedRect(-size / 2, -size / 2 + bevel, size, size - bevel, r);

  // Vibrant red face
  g.fillStyle(GAME_CONFIG.colors.redBtn, 1.0);
  g.fillRoundedRect(-size / 2, -size / 2, size, size - bevel - 2, r);

  // Top gloss highlight
  g.fillStyle(0xffffff, 0.38);
  g.fillRoundedRect(-size / 2 + 5, -size / 2 + 2, size - 10, 4, 2);
  btn.add(g);

  const txt = scene.add.text(0, -bevel / 2 - 1, '✕', {
    fontFamily: FONT_FAMILY,
    fontSize: '24px',
    fontStyle: 'bold',
    color: '#ffffff'
  }).setOrigin(0.5);
  btn.add(txt);

  const hitArea = new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size);
  btn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

  btn.on('pointerdown', () => {
    scene.tweens.add({
      targets: btn,
      scaleX: 1.08,
      scaleY: 0.92,
      y: y + bevel,
      duration: 55,
      ease: 'Quad.easeOut'
    });
  });

  const release = () => {
    scene.tweens.add({
      targets: btn,
      scaleX: 1.0,
      scaleY: 1.0,
      y: y,
      duration: 90,
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
 * Top Floating Coin Pill Container (+40% Big Chunky Numerals)
 */
export class TopCoinsPill {
  constructor(scene, parentContainer, x = 360, y = 70) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.container.setDepth(50);
    parentContainer.add(this.container);

    this.drawPill();
    this.updateDisplay(gameState.coins);

    gameState.on('coinsChanged', (data) => {
      this.updateDisplay(data.coins);
      this.punch();
    });

    scene.events.on('coinPillPunch', () => {
      this.punch();
    });
  }

  drawPill() {
    const w = 230;
    const h = 62;
    const r = h / 2;

    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, r);

    // Dark bottom bevel stripe
    g.fillStyle(0x94a3b8, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h - 4, r);

    // Crisp white face
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 5, r);

    g.lineStyle(2, 0xe2e8f0, 1.0);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h - 5, r);
    this.container.add(g);

    // Shiny Gold Star Coin Icon
    this.coinIcon = this.scene.add.container(-w / 2 + 36, -2);
    const cg = this.scene.add.graphics();
    cg.fillStyle(0xf59e0b, 1.0);
    cg.fillCircle(0, 0, 20);
    cg.fillStyle(0xfbbf24, 1.0);
    cg.fillCircle(0, 0, 16);
    cg.lineStyle(2, 0xd97706, 1.0);
    cg.strokeCircle(0, 0, 13);
    const star = this.scene.add.text(0, 0, '★', {
      fontFamily: FONT_FAMILY,
      fontSize: '17px',
      color: '#b45309'
    }).setOrigin(0.5);
    this.coinIcon.add(cg);
    this.coinIcon.add(star);
    this.container.add(this.coinIcon);

    // Big Chunky Numerals (+40% enlarged: 34px bold Fredoka)
    this.amountText = this.scene.add.text(22, -2, '0', {
      fontFamily: FONT_FAMILY,
      fontSize: '34px',
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
      duration: 85,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    this.scene.tweens.add({
      targets: this.coinIcon,
      angle: 360,
      duration: 360,
      ease: 'Cubic.easeOut'
    });
  }
}

/**
 * Bottom Dock Buttons: Chunky 3D buttons with dark bottom bevel stripes
 * and squash-and-stretch press animations.
 */
export class BottomDock {
  constructor(scene, parentContainer) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(48);
    parentContainer.add(this.container);

    const dockY = 1200;
    this.createRenovateButton(135, dockY);
    this.createBoostButton(360, dockY);
    this.createUpgradesButton(585, dockY);
  }

  createChunkyButton(x, y, w, h, faceColor, bevelColor, shadowDepth = 9) {
    const btn = this.scene.add.container(x, y);
    const g = this.scene.add.graphics();

    // Ambient drop shadow
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-w / 2, -h / 2 + shadowDepth + 4, w, h, 20);

    // Dark bottom bevel stripe (gives tactile depth)
    g.fillStyle(bevelColor, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2 + shadowDepth, w, h - shadowDepth, 20);

    // Vibrant button face
    g.fillStyle(faceColor, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - shadowDepth - 3, 20);

    // Top gloss highlight
    g.fillStyle(0xffffff, 0.32);
    g.fillRoundedRect(-w / 2 + 12, -h / 2 + 3, w - 24, 6, 3);

    btn.add(g);
    btn.graphics = g;

    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    btn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    // Squash-and-stretch tween on pointerdown
    btn.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: btn,
        scaleX: 1.06,
        scaleY: 0.93,
        y: y + shadowDepth - 3,
        duration: 65,
        ease: 'Quad.easeOut'
      });
    });

    const release = () => {
      this.scene.tweens.add({
        targets: btn,
        scaleX: 1.0,
        scaleY: 1.0,
        y: y,
        duration: 110,
        ease: 'Back.easeOut'
      });
    };
    btn.on('pointerup', release);
    btn.on('pointerout', release);

    this.container.add(btn);
    return btn;
  }

  createRenovateButton(x, y) {
    this.renovateBtn = this.scene.add.container(x, y);
    this.container.add(this.renovateBtn);

    // Pulsing Golden Highlight Halo (Visible when ready to renovate)
    this.renovateHalo = this.scene.add.graphics();
    this.renovateBtn.add(this.renovateHalo);

    this.renovateGraphics = this.scene.add.graphics();
    this.renovateBtn.add(this.renovateGraphics);

    this.renovateIcon = this.scene.add.text(0, -16, '🔨', { fontSize: '34px' }).setOrigin(0.5);
    this.renovateBtn.add(this.renovateIcon);

    this.renovateLabel = this.scene.add.text(0, 16, 'RENOVATE', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.renovateBtn.add(this.renovateLabel);

    this.renovateSub = this.scene.add.text(0, 33, 'LV. 25 REQ', {
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#cbd5e1'
    }).setOrigin(0.5);
    this.renovateBtn.add(this.renovateSub);

    const w = 185;
    const h = 88;
    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    this.renovateBtn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.updateRenovateVisual();

    this.renovateBtn.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: this.renovateBtn,
        scaleX: 1.05,
        scaleY: 0.93,
        y: y + 4,
        duration: 60
      });
    });

    this.renovateBtn.on('pointerup', () => {
      this.renovateBtn.setScale(1.0);
      this.renovateBtn.y = y;

      if (gameState.isRenovateUnlocked()) {
        this.scene.events.emit('startRenovationTransition');
      } else {
        this.scene.tweens.add({ targets: this.renovateBtn, x: '+=6', yoyo: true, repeat: 3, duration: 40 });

        const stage1Bought = STORE_UPGRADES.filter(u => u.stage === 1 && gameState.isUpgradePurchased(u.id)).length;
        this.scene.events.emit('openNotice', {
          title: 'Renovation Locked',
          text: `To Renovate and transition to Stage 2 (Fashion Van):\n\n1. Sewing Table Level 25 (Current: Lv. ${gameState.sewingStation.level}/25)\n2. All Stage 1 Store Upgrades (${stage1Bought}/5 bought in UPGRADES menu)`
        });
      }
    });

    gameState.on('stationUpgraded', () => this.updateRenovateVisual());
    gameState.on('upgradePurchased', () => this.updateRenovateVisual());
    gameState.on('stageRenovated', () => this.updateRenovateVisual());
  }

  updateRenovateVisual() {
    const isUnlocked = gameState.isRenovateUnlocked();
    const w = 185;
    const h = 88;
    const shadowDepth = 9;

    this.renovateGraphics.clear();
    this.renovateHalo.clear();

    this.renovateGraphics.fillStyle(0x000000, 0.35);
    this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2 + shadowDepth + 4, w, h, 18);

    if (gameState.stage >= 2) {
      this.renovateGraphics.fillStyle(0x047857, 1.0);
      this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2 + shadowDepth, w, h - shadowDepth, 18);
      this.renovateGraphics.fillStyle(0x10b981, 1.0);
      this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - shadowDepth - 3, 18);

      this.renovateIcon.setText('🚚');
      this.renovateLabel.setText('STAGE 2');
      this.renovateSub.setText('FASHION VAN');
      this.renovateSub.setColor('#fef08a');
      return;
    }

    if (isUnlocked) {
      // Pulsing Golden Highlight on bottom-left RENOVATE button once both conditions met!
      this.renovateHalo.lineStyle(4, 0xfbbf24, 0.9);
      this.renovateHalo.strokeRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 22);

      // Radiant Gold Button Face
      this.renovateGraphics.fillStyle(0xb45309, 1.0); // Dark bevel stripe
      this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2 + shadowDepth, w, h - shadowDepth, 18);
      this.renovateGraphics.fillStyle(0xf59e0b, 1.0); // Gold face
      this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - shadowDepth - 3, 18);
      this.renovateGraphics.fillStyle(0xffffff, 0.38);
      this.renovateGraphics.fillRoundedRect(-w / 2 + 10, -h / 2 + 3, w - 20, 6, 3);

      this.renovateIcon.setText('🔨 ✨');
      this.renovateLabel.setColor('#ffffff');
      this.renovateSub.setText('READY!');
      this.renovateSub.setColor('#fef08a');

      if (!this.pulseTween) {
        this.pulseTween = this.scene.tweens.add({
          targets: this.renovateBtn,
          scale: 1.06,
          duration: 650,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } else {
      // Locked Muted Slate
      this.renovateGraphics.fillStyle(0x334155, 1.0); // Dark bevel
      this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2 + shadowDepth, w, h - shadowDepth, 18);
      this.renovateGraphics.fillStyle(0x475569, 1.0);
      this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - shadowDepth - 3, 18);
      this.renovateGraphics.fillStyle(0xffffff, 0.15);
      this.renovateGraphics.fillRoundedRect(-w / 2 + 10, -h / 2 + 3, w - 20, 6, 3);

      this.renovateIcon.setText('🔒');
      this.renovateLabel.setColor('#cbd5e1');
      this.renovateSub.setText(`LV. ${gameState.sewingStation.level}/25`);
      this.renovateSub.setColor('#94a3b8');

      if (this.pulseTween) {
        this.pulseTween.stop();
        this.pulseTween = null;
        this.renovateBtn.setScale(1.0);
      }
    }
  }

  createBoostButton(x, y) {
    this.boostBtn = this.createChunkyButton(x, y, 205, 88, 0xf59e0b, 0xb45309, 9);

    const icon = this.scene.add.text(0, -16, '⚡ 2X BOOST', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#78350f',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.boostTimerText = this.scene.add.text(0, 18, 'TAP TO ACTIVATE', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
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
    const btn = this.createChunkyButton(x, y, 185, 88, 0x22c55e, 0x15803d, 9);

    const icon = this.scene.add.text(0, -16, '⭐', { fontSize: '34px' }).setOrigin(0.5);
    const label = this.scene.add.text(0, 18, 'UPGRADES', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#14532d',
      strokeThickness: 2
    }).setOrigin(0.5);

    btn.add(icon);
    btn.add(label);

    btn.on('pointerup', () => {
      this.scene.events.emit('openGlobalUpgrades');
    });
  }
}

/**
 * FIX: Self-Clearing Global Upgrades Menu (Bug-Free Layer Hierarchy)
 * Cards render on top of the card background with a clean vertical stack (gap of 85px).
 * When purchased, card smoothly animates away and re-stacks remaining cards!
 */
export class GlobalUpgradesModal {
  constructor(scene, parentContainer) {
    this.scene = scene;
    this.isOpen = false;
    this.cardWidth = 550;
    this.cardHeight = 720;
    this.rowSpacing = 85; // Gap of 85px between cards as requested

    this.container = scene.add.container(0, 0);
    this.container.setDepth(100);
    this.container.setVisible(false);
    parentContainer.add(this.container);

    // Dark backdrop
    this.backdrop = scene.add.graphics();
    this.backdrop.fillStyle(0x000000, 0.65);
    this.backdrop.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    this.backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height), Phaser.Geom.Rectangle.Contains);
    this.backdrop.on('pointerup', () => this.close());
    this.container.add(this.backdrop);

    // Main floating card
    this.card = scene.add.container(360, 640);
    this.container.add(this.card);

    // CRITICAL: Build card background FIRST so it is behind all rows!
    this.buildBaseCard();

    // THEN add rowsContainer on top of the card background!
    this.rowsContainer = scene.add.container(0, 0);
    this.card.add(this.rowsContainer);

    scene.events.on('openGlobalUpgrades', () => this.open());
    gameState.on('coinsChanged', () => { if (this.isOpen) this.renderList(); });
  }

  buildBaseCard() {
    const w = this.cardWidth;
    const h = this.cardHeight;

    const g = this.scene.add.graphics();
    // Ambient drop shadow
    g.fillStyle(0x000000, 0.42);
    g.fillRoundedRect(-w / 2, -h / 2 + 12, w, h, 28);

    // Crisp white card body
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 28);

    // Card header banner
    g.fillStyle(0xf8fafc, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 88, { tl: 28, tr: 28, bl: 0, br: 0 });
    g.lineStyle(2, 0xe2e8f0, 1);
    g.lineBetween(-w / 2, -h / 2 + 88, w / 2, -h / 2 + 88);
    this.card.add(g);

    // Title & Subtitle in Fredoka/Nunito (+40% enlarged)
    const title = this.scene.add.text(-w / 2 + 28, -h / 2 + 20, '⭐ STORE UPGRADES', {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    this.card.add(title);

    const subTitle = this.scene.add.text(-w / 2 + 30, -h / 2 + 56, 'Purchased perks disappear to keep shop clean!', {
      fontFamily: FONT_FAMILY,
      fontSize: '15px',
      color: '#64748b'
    });
    this.card.add(subTitle);

    // Red Square Close Button (X)
    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 38, -h / 2 + 44, () => this.close());
    this.card.add(closeBtn);
  }

  renderList() {
    this.rowsContainer.removeAll(true);

    const available = gameState.getAvailableUpgrades();

    if (available.length === 0) {
      // Empty celebratory state
      const empty = this.scene.add.container(0, 0);
      const eg = this.scene.add.graphics();
      eg.fillStyle(0xf0fdf4, 1.0);
      eg.fillRoundedRect(-220, -100, 440, 200, 20);
      eg.lineStyle(2, 0x86efac, 1.0);
      eg.strokeRoundedRect(-220, -100, 440, 200, 20);
      empty.add(eg);

      const check = this.scene.add.text(0, -42, '🎉 🌟 👔', { fontSize: '44px' }).setOrigin(0.5);
      const msg1 = this.scene.add.text(0, 16, 'All Available Upgrades Bought!', {
        fontFamily: FONT_FAMILY,
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#15803d'
      }).setOrigin(0.5);
      const msg2 = this.scene.add.text(0, 50, gameState.stage === 1 ? 'Upgrade Sewing Table to Level 25 to Renovate!' : 'Your Fashion Van is running at peak capacity!', {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        color: '#475569',
        align: 'center',
        wordWrap: { width: 380 }
      }).setOrigin(0.5);

      empty.add(check);
      empty.add(msg1);
      empty.add(msg2);
      this.rowsContainer.add(empty);
      return;
    }

    // Render up to 5 unpurchased perks vertically with 85px spacing
    const maxVisible = Math.min(5, available.length);
    const startY = -this.cardHeight / 2 + 140;

    this.activeRows = [];

    for (let i = 0; i < maxVisible; i++) {
      const upg = available[i];
      const rowY = startY + i * this.rowSpacing;
      const row = this.createUpgradeRow(0, rowY, upg, i);
      this.rowsContainer.add(row);
      this.activeRows.push({ row, upg });
    }
  }

  createUpgradeRow(x, y, upg, index) {
    const row = this.scene.add.container(x, y);
    const rowW = this.cardWidth - 50; // 500px wide
    const rowH = 76; // Card height with proper 85px step

    // White rounded card background with subtle grey border
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.12);
    bg.fillRoundedRect(-rowW / 2, -rowH / 2 + 3, rowW, rowH, 16);

    bg.fillStyle(0xffffff, 1.0);
    bg.fillRoundedRect(-rowW / 2, -rowH / 2, rowW, rowH - 2, 16);
    bg.lineStyle(1.5, 0xe2e8f0, 1.0);
    bg.strokeRoundedRect(-rowW / 2, -rowH / 2, rowW, rowH - 2, 16);
    row.add(bg);

    // Left Icon Badge
    const iconBadge = this.scene.add.container(-rowW / 2 + 38, -1);
    const ibg = this.scene.add.graphics();
    ibg.fillStyle(0xf1f5f9, 1.0);
    ibg.fillRoundedRect(-24, -24, 48, 48, 12);
    ibg.lineStyle(1.5, 0xe2e8f0, 1.0);
    ibg.strokeRoundedRect(-24, -24, 48, 48, 12);
    iconBadge.add(ibg);

    const iconTxt = this.scene.add.text(0, 0, upg.icon, { fontSize: '28px' }).setOrigin(0.5);
    iconBadge.add(iconTxt);
    row.add(iconBadge);

    // Center: Bold Title & Perk Description
    const textX = -rowW / 2 + 75;
    const titleTxt = this.scene.add.text(textX, -18, upg.title, {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    row.add(titleTxt);

    const descTxt = this.scene.add.text(textX, 6, upg.description, {
      fontFamily: FONT_FAMILY,
      fontSize: '13px',
      color: '#475569',
      wordWrap: { width: 240 }
    });
    row.add(descTxt);

    // Right: Bright Green / Blue Price Button (130x48)
    const canAfford = gameState.canBuyUpgrade(upg.id);
    const btn = this.scene.add.container(rowW / 2 - 75, -1);
    row.add(btn);

    const btnW = 125;
    const btnH = 48;
    const bgBtn = this.scene.add.graphics();

    bgBtn.fillStyle(0x000000, 0.25);
    bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2 + 3, btnW, btnH, 14);

    if (canAfford) {
      bgBtn.fillStyle(0x15803d, 1.0); // Dark green bevel
      bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2 + 3, btnW, btnH - 3, 14);
      bgBtn.fillStyle(0x22c55e, 1.0); // Bright green face
      bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH - 5, 14);
      bgBtn.fillStyle(0xffffff, 0.35);
      bgBtn.fillRoundedRect(-btnW / 2 + 8, -btnH / 2 + 2, btnW - 16, 4, 2);
    } else {
      bgBtn.fillStyle(0x334155, 1.0); // Slate bevel
      bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2 + 3, btnW, btnH - 3, 14);
      bgBtn.fillStyle(0x64748b, 1.0);
      bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH - 5, 14);
    }
    btn.add(bgBtn);

    const btnTxt = this.scene.add.text(0, -9, 'BUY', {
      fontFamily: FONT_FAMILY,
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    btn.add(btnTxt);

    const costTxt = this.scene.add.text(0, 10, `🪙 ${upg.cost}`, {
      fontFamily: FONT_FAMILY,
      fontSize: '15px',
      fontStyle: 'bold',
      color: canAfford ? '#fef08a' : '#e2e8f0'
    }).setOrigin(0.5);
    btn.add(costTxt);

    const hitArea = new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH);
    btn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    btn.on('pointerdown', () => {
      if (gameState.canBuyUpgrade(upg.id)) {
        this.scene.tweens.add({ targets: btn, scaleX: 1.05, scaleY: 0.92, y: 2, duration: 55 });
      }
    });

    btn.on('pointerup', () => {
      btn.setScale(1.0);
      btn.y = -1;

      if (gameState.canBuyUpgrade(upg.id)) {
        gameState.buyUpgrade(upg.id);

        // Slide item out & remove
        this.scene.tweens.add({
          targets: row,
          x: 350,
          alpha: 0,
          duration: 160,
          ease: 'Back.easeIn',
          onComplete: () => {
            // Re-render and smoothly re-stack remaining cards!
            this.renderList();
          }
        });
      } else {
        this.scene.tweens.add({ targets: btn, x: '+=6', yoyo: true, repeat: 3, duration: 40 });
      }
    });

    return row;
  }

  open() {
    this.isOpen = true;
    this.renderList();
    this.container.setVisible(true);
    this.card.setScale(0.85);
    this.card.setAlpha(0);

    this.scene.tweens.add({
      targets: this.card,
      scale: 1,
      alpha: 1,
      duration: 220,
      ease: 'Back.easeOut'
    });
  }

  close() {
    this.scene.tweens.add({
      targets: this.card,
      scale: 0.9,
      alpha: 0,
      duration: 160,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.isOpen = false;
        this.container.setVisible(false);
      }
    });
  }
}

/**
 * Interactive Station Upgrade Card (Modal)
 * Shows Stage 1 Level 25 Cap ("Level X / 25" and "MAX LEVEL - READY TO RENOVATE")
 */
export class StationUpgradeModal {
  constructor(scene, parentContainer) {
    this.scene = scene;
    this.isOpen = false;
    this.cardWidth = 540;
    this.cardHeight = 620;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(100);
    this.container.setVisible(false);
    parentContainer.add(this.container);

    this.backdrop = scene.add.graphics();
    this.backdrop.fillStyle(0x000000, 0.65);
    this.backdrop.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    this.backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height), Phaser.Geom.Rectangle.Contains);
    this.backdrop.on('pointerup', () => this.close());
    this.container.add(this.backdrop);

    this.card = scene.add.container(360, 640);
    this.container.add(this.card);

    this.buildCardUI();

    scene.events.on('openStationUpgrade', (data) => {
      if (data && data.station === 'sewing') {
        this.open();
      }
    });

    gameState.on('coinsChanged', () => { if (this.isOpen) this.refreshValues(); });
    gameState.on('stationUpgraded', () => { if (this.isOpen) this.refreshValues(); });
  }

  buildCardUI() {
    const w = this.cardWidth;
    const h = this.cardHeight;

    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.4);
    g.fillRoundedRect(-w / 2, -h / 2 + 12, w, h, 28);
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 28);

    g.fillStyle(0xf8fafc, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 88, { tl: 28, tr: 28, bl: 0, br: 0 });
    g.lineStyle(2, 0xe2e8f0, 1);
    g.lineBetween(-w / 2, -h / 2 + 88, w / 2, -h / 2 + 88);
    this.card.add(g);

    this.titleText = this.scene.add.text(-w / 2 + 28, -h / 2 + 28, 'Sewing Table', {
      fontFamily: FONT_FAMILY,
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    this.card.add(this.titleText);

    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 38, -h / 2 + 44, () => this.close());
    this.card.add(closeBtn);

    const illustBox = this.scene.add.graphics();
    illustBox.fillStyle(0xf1f5f9, 1.0);
    illustBox.fillRoundedRect(-w / 2 + 30, -h / 2 + 104, w - 60, 108, 18);
    this.card.add(illustBox);

    const stationIcon = this.scene.add.text(0, -h / 2 + 144, '🧵  👕  ✂️', { fontSize: '42px' }).setOrigin(0.5);
    this.card.add(stationIcon);

    this.levelBadgeText = this.scene.add.text(0, -h / 2 + 188, 'Level 1 / 25', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#1d4ed8'
    }).setOrigin(0.5);
    this.card.add(this.levelBadgeText);

    this.progressBarGraphics = this.scene.add.graphics();
    this.card.add(this.progressBarGraphics);

    this.createStatRow(-h / 2 + 276, 'Profit Per T-Shirt:', 'profitText', '🪙 +4');
    this.createStatRow(-h / 2 + 352, 'Crafting Speed:', 'speedText', '1.8s');

    this.buildUpgradeButton(0, h / 2 - 70, w - 70, 78);
  }

  createStatRow(y, label, key, defaultVal) {
    const w = this.cardWidth;
    const bg = this.scene.add.graphics();
    bg.fillStyle(0xf8fafc, 1.0);
    bg.fillRoundedRect(-w / 2 + 30, y - 26, w - 60, 56, 14);
    bg.lineStyle(1.5, 0xe2e8f0, 1);
    bg.strokeRoundedRect(-w / 2 + 30, y - 26, w - 60, 56, 14);
    this.card.add(bg);

    const lbl = this.scene.add.text(-w / 2 + 48, y + 2, label, {
      fontFamily: FONT_FAMILY,
      fontSize: '21px',
      fontStyle: 'bold',
      color: '#334155'
    }).setOrigin(0, 0.5);
    this.card.add(lbl);

    this[key] = this.scene.add.text(w / 2 - 48, y + 2, defaultVal, {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
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
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.upgradeBtn.add(this.upgradeBtnText);

    this.upgradeBtnCostText = this.scene.add.text(0, 16, '🪙 10', {
      fontFamily: FONT_FAMILY,
      fontSize: '21px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setOrigin(0.5);
    this.upgradeBtn.add(this.upgradeBtnCostText);

    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    this.upgradeBtn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.upgradeBtn.on('pointerdown', () => {
      if (gameState.canUpgradeSewing()) {
        this.scene.tweens.add({ targets: this.upgradeBtn, scaleX: 1.05, scaleY: 0.93, duration: 60 });
      }
    });

    this.upgradeBtn.on('pointerup', () => {
      this.upgradeBtn.setScale(1.0);
      if (gameState.canUpgradeSewing()) {
        gameState.upgradeSewing();
        this.refreshValues();
      } else {
        this.scene.tweens.add({ targets: this.upgradeBtn, x: '+=8', yoyo: true, repeat: 3, duration: 40 });
      }
    });
  }

  drawProgressBar(current, max) {
    this.progressBarGraphics.clear();
    const w = this.cardWidth - 60;
    const h = 18;
    const x = -w / 2;
    const y = -this.cardHeight / 2 + 228;

    this.progressBarGraphics.fillStyle(0xe2e8f0, 1.0);
    this.progressBarGraphics.fillRoundedRect(x, y, w, h, 9);

    const pct = Phaser.Math.Clamp(current / max, 0, 1);
    if (pct > 0) {
      this.progressBarGraphics.fillStyle(0x2563eb, 1.0);
      this.progressBarGraphics.fillRoundedRect(x, y, Math.max(18, w * pct), h, 9);
      this.progressBarGraphics.fillStyle(0xffffff, 0.35);
      this.progressBarGraphics.fillRoundedRect(x + 4, y + 2, Math.max(10, w * pct - 8), 5, 2);
    }
  }

  refreshValues() {
    const { level, maxLevel } = gameState.sewingStation;
    const profit = gameState.getSewingProfit();
    const duration = (gameState.getSewingCraftDuration() / 1000).toFixed(1);
    const cost = gameState.getSewingUpgradeCost();
    const isStage1Max = gameState.stage === 1 && level >= 25;
    const canAfford = gameState.canUpgradeSewing();

    this.titleText.setText(`Sewing Table - Lv. ${level}`);
    this.levelBadgeText.setText(isStage1Max ? 'MAX LEVEL 25' : `Level ${level} / ${maxLevel}`);
    this.drawProgressBar(level, maxLevel);

    this.profitText.setText(`🪙 +${gameState.formatCoins(profit)}`);
    this.speedText.setText(`${duration}s`);

    const w = this.cardWidth - 70;
    const h = 78;

    this.upgradeBtnGraphics.clear();
    this.upgradeBtnGraphics.fillStyle(0x000000, 0.3);
    this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, 20);

    if (isStage1Max) {
      // Stage 1 Level 25 Capped State: "MAX LEVEL - READY TO RENOVATE"
      this.upgradeBtnGraphics.fillStyle(0xb45309, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2 + 4, w, h - 4, 20);
      this.upgradeBtnGraphics.fillStyle(0xf59e0b, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - 8, 20);

      this.upgradeBtnText.setText('MAX LEVEL');
      this.upgradeBtnText.setColor('#ffffff');
      this.upgradeBtnCostText.setText('READY TO RENOVATE');
      this.upgradeBtnCostText.setColor('#fef08a');
    } else if (canAfford) {
      this.upgradeBtnGraphics.fillStyle(0x1d4ed8, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2 + 4, w, h - 4, 20);
      this.upgradeBtnGraphics.fillStyle(0x3b82f6, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - 8, 20);
      this.upgradeBtnGraphics.fillStyle(0xffffff, 0.3);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2 + 12, -h / 2 + 4, w - 24, 6, 3);

      this.upgradeBtnText.setText('UPGRADE');
      this.upgradeBtnText.setColor('#ffffff');
      this.upgradeBtnCostText.setText(`🪙 ${gameState.formatCoins(cost)}`);
      this.upgradeBtnCostText.setColor('#fef08a');
    } else {
      this.upgradeBtnGraphics.fillStyle(0x475569, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2 + 4, w, h - 4, 20);
      this.upgradeBtnGraphics.fillStyle(0x94a3b8, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - 8, 20);

      this.upgradeBtnText.setText('UPGRADE');
      this.upgradeBtnText.setColor('#e2e8f0');
      this.upgradeBtnCostText.setText(`🪙 ${gameState.formatCoins(cost)}`);
      this.upgradeBtnCostText.setColor('#f1f5f9');
    }
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
      duration: 240,
      ease: 'Back.easeOut'
    });
  }

  close() {
    this.scene.tweens.add({
      targets: this.card,
      scale: 0.9,
      alpha: 0,
      duration: 160,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.isOpen = false;
        this.container.setVisible(false);
      }
    });
  }
}

/**
 * Unlock Station Modal
 */
export class UnlockStationModal {
  constructor(scene, parentContainer) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(110);
    this.container.setVisible(false);
    parentContainer.add(this.container);

    this.backdrop = scene.add.graphics();
    this.backdrop.fillStyle(0x000000, 0.65);
    this.backdrop.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    this.backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height), Phaser.Geom.Rectangle.Contains);
    this.backdrop.on('pointerup', () => this.close());
    this.container.add(this.backdrop);

    this.cardWidth = 490;
    this.cardHeight = 380;
    this.card = scene.add.container(360, 640);
    this.container.add(this.card);

    this.currentData = null;
    this.buildUI();

    scene.events.on('openUnlockModal', (data) => this.show(data));
  }

  buildUI() {
    const w = this.cardWidth;
    const h = this.cardHeight;

    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-w / 2, -h / 2 + 10, w, h, 26);
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 26);

    g.fillStyle(0xf8fafc, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 80, { tl: 26, tr: 26, bl: 0, br: 0 });
    g.lineStyle(1.5, 0xe2e8f0, 1);
    g.lineBetween(-w / 2, -h / 2 + 80, w / 2, -h / 2 + 80);
    this.card.add(g);

    this.titleText = this.scene.add.text(-w / 2 + 24, -h / 2 + 26, 'Unlock Station', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    this.card.add(this.titleText);

    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 34, -h / 2 + 40, () => this.close());
    this.card.add(closeBtn);

    this.iconText = this.scene.add.text(0, -h / 2 + 135, '👖', { fontSize: '52px' }).setOrigin(0.5);
    this.card.add(this.iconText);

    this.descText = this.scene.add.text(0, -h / 2 + 200, '', {
      fontFamily: FONT_FAMILY,
      fontSize: '17px',
      color: '#475569',
      align: 'center',
      wordWrap: { width: 400 }
    }).setOrigin(0.5);
    this.card.add(this.descText);

    this.unlockBtn = this.scene.add.container(0, h / 2 - 52);
    this.card.add(this.unlockBtn);

    const btnW = 250;
    const btnH = 60;
    this.btnGraphics = this.scene.add.graphics();
    this.unlockBtn.add(this.btnGraphics);

    this.btnLabel = this.scene.add.text(0, 0, 'UNLOCK (🪙 50)', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.unlockBtn.add(this.btnLabel);

    const hitArea = new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH);
    this.unlockBtn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.unlockBtn.on('pointerdown', () => this.unlockBtn.setScale(0.95));
    this.unlockBtn.on('pointerup', () => {
      this.unlockBtn.setScale(1.0);
      this.handleUnlock();
    });
  }

  show(data) {
    this.currentData = data;
    this.titleText.setText(data.title);
    this.iconText.setText(data.icon);
    this.descText.setText(data.desc);
    this.btnLabel.setText(`UNLOCK (🪙 ${data.cost})`);

    const btnW = 250;
    const btnH = 60;
    const canAfford = gameState.coins >= data.cost;
    this.btnGraphics.clear();
    this.btnGraphics.fillStyle(0x000000, 0.25);
    this.btnGraphics.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH, 16);

    if (canAfford) {
      this.btnGraphics.fillStyle(0x15803d, 1.0);
      this.btnGraphics.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH - 4, 16);
      this.btnGraphics.fillStyle(0x22c55e, 1.0);
      this.btnGraphics.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH - 6, 16);
    } else {
      this.btnGraphics.fillStyle(0x334155, 1.0);
      this.btnGraphics.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH - 4, 16);
      this.btnGraphics.fillStyle(0x64748b, 1.0);
      this.btnGraphics.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH - 6, 16);
    }

    this.container.setVisible(true);
    this.card.setScale(0.85);
    this.card.setAlpha(0);
    this.scene.tweens.add({ targets: this.card, scale: 1, alpha: 1, duration: 200, ease: 'Back.easeOut' });
  }

  handleUnlock() {
    if (!this.currentData) return;
    const { stationId } = this.currentData;

    let success = false;
    if (stationId === 'jeans') {
      success = gameState.unlockJeansStation();
    } else if (stationId === 'hats') {
      success = gameState.unlockHatsStation();
    }

    if (success) {
      this.close();
    } else {
      this.scene.tweens.add({ targets: this.unlockBtn, x: '+=6', yoyo: true, repeat: 3, duration: 40 });
    }
  }

  close() {
    this.scene.tweens.add({
      targets: this.card,
      scale: 0.9,
      alpha: 0,
      duration: 150,
      ease: 'Back.easeIn',
      onComplete: () => this.container.setVisible(false)
    });
  }
}

/**
 * True Renovation Transition
 */
export class RenovationTransition {
  constructor(scene, parentContainer) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(200);
    this.container.setVisible(false);
    parentContainer.add(this.container);

    this.buildUI();
    scene.events.on('startRenovationTransition', () => this.start());
  }

  buildUI() {
    this.whiteScreen = this.scene.add.graphics();
    this.whiteScreen.fillStyle(0xffffff, 1.0);
    this.whiteScreen.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    this.container.add(this.whiteScreen);

    this.toolIcon = this.scene.add.text(360, 470, '🔨', { fontSize: '78px' }).setOrigin(0.5);
    this.container.add(this.toolIcon);

    this.statusText = this.scene.add.text(360, 575, 'Renovating Boutique...', {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#0f172a'
    }).setOrigin(0.5);
    this.container.add(this.statusText);

    this.barGraphics = this.scene.add.graphics();
    this.container.add(this.barGraphics);

    this.percentText = this.scene.add.text(360, 675, '0%', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#64748b'
    }).setOrigin(0.5);
    this.container.add(this.percentText);
  }

  drawBar(progress) {
    this.barGraphics.clear();
    const w = 340;
    const h = 22;
    const x = 360 - w / 2;
    const y = 625;

    this.barGraphics.fillStyle(0xe2e8f0, 1.0);
    this.barGraphics.fillRoundedRect(x, y, w, h, 11);

    const pct = Phaser.Math.Clamp(progress, 0, 1);
    if (pct > 0) {
      this.barGraphics.fillStyle(0x2563eb, 1.0);
      this.barGraphics.fillRoundedRect(x, y, Math.max(22, w * pct), h, 11);
    }
  }

  start() {
    this.container.setVisible(true);
    this.container.setAlpha(0);

    const swingTween = this.scene.tweens.add({
      targets: this.toolIcon,
      angle: { from: -20, to: 20 },
      scale: { from: 1.0, to: 1.15 },
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 350,
      onComplete: () => {
        const progressObj = { value: 0 };
        this.scene.tweens.add({
          targets: progressObj,
          value: 1,
          duration: 2400,
          ease: 'Linear',
          onUpdate: () => {
            this.drawBar(progressObj.value);
            this.percentText.setText(`${Math.floor(progressObj.value * 100)}%`);
          },
          onComplete: () => {
            swingTween.stop();
            this.finishRenovation();
          }
        });
      }
    });
  }

  finishRenovation() {
    gameState.renovateToStage2();
    this.explodeConfetti();

    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        this.container.setVisible(false);
        this.scene.events.emit('openStage2Modal');
      }
    });
  }

  explodeConfetti() {
    for (let i = 0; i < 45; i++) {
      const conf = this.scene.add.text(
        360 + Phaser.Math.Between(-100, 100),
        600 + Phaser.Math.Between(-50, 50),
        Phaser.Utils.Array.GetRandom(['🎉', '✨', '⭐', '🎊', '👗', '👖', '🧢']),
        { fontSize: `${Phaser.Math.Between(22, 34)}px` }
      ).setOrigin(0.5).setDepth(210);

      this.scene.tweens.add({
        targets: conf,
        x: conf.x + Phaser.Math.Between(-300, 300),
        y: conf.y - Phaser.Math.Between(200, 600),
        angle: Phaser.Math.Between(-200, 200),
        alpha: 0,
        duration: Phaser.Math.Between(1300, 2000),
        ease: 'Cubic.easeOut',
        onComplete: () => conf.destroy()
      });
    }
  }
}

/**
 * Stage 2 Grand Opening Modal ("Fashion Van: OPEN!")
 */
export class Stage2OpenModal {
  constructor(scene, parentContainer) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(115);
    this.container.setVisible(false);
    parentContainer.add(this.container);

    this.backdrop = scene.add.graphics();
    this.backdrop.fillStyle(0x000000, 0.7);
    this.backdrop.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    this.backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height), Phaser.Geom.Rectangle.Contains);
    this.backdrop.on('pointerup', () => this.close());
    this.container.add(this.backdrop);

    this.cardWidth = 530;
    this.cardHeight = 490;
    this.card = scene.add.container(360, 640);
    this.container.add(this.card);

    this.buildUI();
    scene.events.on('openStage2Modal', () => this.open());
  }

  buildUI() {
    const w = this.cardWidth;
    const h = this.cardHeight;

    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.45);
    g.fillRoundedRect(-w / 2, -h / 2 + 10, w, h, 28);
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 28);

    g.fillStyle(0xccfbf1, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 88, { tl: 28, tr: 28, bl: 0, br: 0 });
    g.lineStyle(2, 0x99f6e4, 1);
    g.lineBetween(-w / 2, -h / 2 + 88, w / 2, -h / 2 + 88);
    this.card.add(g);

    const title = this.scene.add.text(-w / 2 + 28, -h / 2 + 28, '🎉 FASHION VAN: OPEN!', {
      fontFamily: FONT_FAMILY,
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#0f766e'
    });
    this.card.add(title);

    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 38, -h / 2 + 44, () => this.close());
    this.card.add(closeBtn);

    const illustText = this.scene.add.text(0, -h / 2 + 160, '🚚  ✨  👗', { fontSize: '52px' }).setOrigin(0.5);
    this.card.add(illustText);

    const msg1 = this.scene.add.text(0, -h / 2 + 245, 'Welcome to Stage 2: Mobile Boutique!', {
      fontFamily: FONT_FAMILY,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#0f172a'
    }).setOrigin(0.5);
    this.card.add(msg1);

    const msg2 = this.scene.add.text(0, -h / 2 + 310, 'Serve trendy shoppers from your custom fashion truck! Unlock new stations like the Jeans Table (50🪙) and Hats Rack (100🪙) to multiply your profits!', {
      fontFamily: FONT_FAMILY,
      fontSize: '16px',
      color: '#475569',
      align: 'center',
      wordWrap: { width: 450 }
    }).setOrigin(0.5);
    this.card.add(msg2);

    const btn = this.scene.add.container(0, h / 2 - 62);
    this.card.add(btn);

    const btnW = 250;
    const btnH = 58;
    const bgBtn = this.scene.add.graphics();
    bgBtn.fillStyle(0x000000, 0.25);
    bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH, 18);
    bgBtn.fillStyle(0x0f766e, 1.0);
    bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH - 4, 18);
    bgBtn.fillStyle(0x14b8a6, 1.0);
    bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH - 6, 18);
    btn.add(bgBtn);

    const txt = this.scene.add.text(0, -2, 'LET\'S ROLL! 🚀', {
      fontFamily: FONT_FAMILY,
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    btn.add(txt);

    btn.setInteractive(new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH), Phaser.Geom.Rectangle.Contains);
    btn.on('pointerdown', () => btn.setScale(0.96));
    btn.on('pointerup', () => {
      btn.setScale(1.0);
      this.close();
    });
  }

  open() {
    this.container.setVisible(true);
    this.card.setScale(0.85);
    this.card.setAlpha(0);
    this.scene.tweens.add({ targets: this.card, scale: 1, alpha: 1, duration: 250, ease: 'Back.easeOut' });
  }

  close() {
    this.scene.tweens.add({
      targets: this.card,
      scale: 0.9,
      alpha: 0,
      duration: 160,
      ease: 'Back.easeIn',
      onComplete: () => this.container.setVisible(false)
    });
  }
}

/**
 * Notice & Requirement Dialog Modal
 */
export class NoticeModal {
  constructor(scene, parentContainer) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(115);
    this.container.setVisible(false);
    parentContainer.add(this.container);

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
    const w = 480;
    const h = 280;

    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-w / 2, -h / 2 + 8, w, h, 22);
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 22);

    g.fillStyle(0xf8fafc, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 68, { tl: 22, tr: 22, bl: 0, br: 0 });
    g.lineStyle(1.5, 0xe2e8f0, 1.0);
    g.lineBetween(-w / 2, -h / 2 + 68, w / 2, -h / 2 + 68);
    this.card.add(g);

    this.titleText = this.scene.add.text(-w / 2 + 24, -h / 2 + 20, 'Notice', {
      fontFamily: FONT_FAMILY,
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    this.card.add(this.titleText);

    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 32, -h / 2 + 34, () => this.close());
    this.card.add(closeBtn);

    this.bodyText = this.scene.add.text(0, -h / 2 + 125, '', {
      fontFamily: FONT_FAMILY,
      fontSize: '17px',
      color: '#475569',
      align: 'center',
      wordWrap: { width: 410 }
    }).setOrigin(0.5);
    this.card.add(this.bodyText);

    const okBtn = this.scene.add.container(0, h / 2 - 42);
    const bgBtn = this.scene.add.graphics();
    bgBtn.fillStyle(0x1d4ed8, 1.0);
    bgBtn.fillRoundedRect(-70, -20, 140, 42, 12);
    bgBtn.fillStyle(0x3b82f6, 1.0);
    bgBtn.fillRoundedRect(-70, -23, 140, 42, 12);
    okBtn.add(bgBtn);

    const okTxt = this.scene.add.text(0, -2, 'GOT IT', {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
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
    this.scene.tweens.add({ targets: this.card, scale: 1, alpha: 1, duration: 200, ease: 'Back.easeOut' });
  }

  close() {
    this.scene.tweens.add({
      targets: this.card,
      scale: 0.9,
      alpha: 0,
      duration: 150,
      ease: 'Back.easeIn',
      onComplete: () => this.container.setVisible(false)
    });
  }
}
