/**
 * Fitventure - UI System & Modals
 * 1. Top Floating Coin Pill with 3D depth and punch animation.
 * 2. Chunky 3D Bottom Dock Buttons (Renovate, Boost x2, Upgrades).
 * 3. Self-Clearing Global Upgrades Menu (Purchased upgrades disappear immediately).
 * 4. Station Upgrade Modal (Only opened by clicking Sewing Station in world).
 * 5. Unlock Station Modal (Pops up when clicking dotted outline stations).
 * 6. True Renovation Transition (Clean white screen, animated tools, progress bar, confetti).
 * 7. Stage 2 Celebration Modal ("Fashion Van: OPEN!").
 * 8. Modal close buttons (X) in bold red squares.
 */

import { GAME_CONFIG, STORE_UPGRADES, gameState } from './config.js';

/**
 * Creates a bold red square close button (X)
 */
export function createRedSquareCloseBtn(scene, x, y, onClick) {
  const btn = scene.add.container(x, y);
  const size = 42;
  const bevel = 4;
  const r = 8;

  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.3);
  g.fillRoundedRect(-size / 2, -size / 2 + bevel + 2, size, size, r);

  g.fillStyle(GAME_CONFIG.colors.redBevel, 1.0);
  g.fillRoundedRect(-size / 2, -size / 2 + bevel, size, size - bevel, r);

  g.fillStyle(GAME_CONFIG.colors.redBtn, 1.0);
  g.fillRoundedRect(-size / 2, -size / 2, size, size - bevel - 2, r);

  g.fillStyle(0xffffff, 0.35);
  g.fillRoundedRect(-size / 2 + 4, -size / 2 + 2, size - 8, 4, 2);
  btn.add(g);

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
      duration: 50
    });
  });

  const release = () => {
    scene.tweens.add({
      targets: btn,
      y: y,
      scale: 1.0,
      duration: 80,
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
    const w = 210;
    const h = 56;
    const r = h / 2;

    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.28);
    g.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, r);

    g.fillStyle(0xcfd8dc, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2 + 3, w, h - 3, r);

    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 4, r);

    g.lineStyle(2, 0xe2e8f0, 1.0);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h - 4, r);
    this.container.add(g);

    // Shiny Gold Coin
    this.coinIcon = this.scene.add.container(-w / 2 + 32, -2);
    const cg = this.scene.add.graphics();
    cg.fillStyle(0xf59e0b, 1.0);
    cg.fillCircle(0, 0, 17);
    cg.fillStyle(0xfbbf24, 1.0);
    cg.fillCircle(0, 0, 14);
    cg.lineStyle(2, 0xd97706, 1.0);
    cg.strokeCircle(0, 0, 11);
    const star = this.scene.add.text(0, 0, '★', { fontSize: '14px', color: '#b45309' }).setOrigin(0.5);
    this.coinIcon.add(cg);
    this.coinIcon.add(star);
    this.container.add(this.coinIcon);

    this.amountText = this.scene.add.text(18, -2, '0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '25px',
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
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 90,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    this.scene.tweens.add({
      targets: this.coinIcon,
      angle: 360,
      duration: 380,
      ease: 'Cubic.easeOut'
    });
  }
}

/**
 * Bottom Dock Navigation Buttons
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

  createChunkyButton(x, y, w, h, faceColor, bevelColor, shadowDepth = 8) {
    const btnContainer = this.scene.add.container(x, y);
    const g = this.scene.add.graphics();

    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-w / 2, -h / 2 + shadowDepth + 4, w, h, 18);

    g.fillStyle(bevelColor, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2 + shadowDepth, w, h - shadowDepth, 18);

    g.fillStyle(faceColor, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h - shadowDepth - 3, 18);

    g.fillStyle(0xffffff, 0.28);
    g.fillRoundedRect(-w / 2 + 10, -h / 2 + 3, w - 20, 6, 3);

    btnContainer.add(g);
    btnContainer.graphics = g;

    const hitArea = new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h);
    btnContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    btnContainer.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: btnContainer,
        y: y + shadowDepth - 2,
        scale: 0.95,
        duration: 60
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

    this.updateRenovateVisual();

    this.renovateBtn.on('pointerdown', () => {
      this.scene.tweens.add({ targets: this.renovateBtn, y: y + 4, scale: 0.95, duration: 60 });
    });

    this.renovateBtn.on('pointerup', () => {
      this.renovateBtn.y = y;
      this.renovateBtn.setScale(1.0);

      if (gameState.isRenovateUnlocked()) {
        // Trigger the True Renovation Transition!
        this.scene.events.emit('startRenovationTransition');
      } else {
        // Informative notice explaining requirements
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
    this.renovateGraphics.fillStyle(0x000000, 0.35);
    this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2 + shadowDepth + 4, w, h, 18);

    if (gameState.stage >= 2) {
      // Stage 2 Active: Show Stage 2 Completed badge
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
      // Active Golden Button
      this.renovateGraphics.fillStyle(0xb45309, 1.0);
      this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2 + shadowDepth, w, h - shadowDepth, 18);
      this.renovateGraphics.fillStyle(0xf59e0b, 1.0);
      this.renovateGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - shadowDepth - 3, 18);
      this.renovateGraphics.fillStyle(0xffffff, 0.35);
      this.renovateGraphics.fillRoundedRect(-w / 2 + 10, -h / 2 + 3, w - 20, 6, 3);

      this.renovateIcon.setText('🔨 ✨');
      this.renovateLabel.setColor('#ffffff');
      this.renovateSub.setText('READY!');
      this.renovateSub.setColor('#fef08a');

      if (!this.pulseTween) {
        this.pulseTween = this.scene.tweens.add({
          targets: this.renovateBtn,
          scale: 1.05,
          duration: 700,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } else {
      // Locked Slate
      this.renovateGraphics.fillStyle(0x334155, 1.0);
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

    btn.on('pointerup', () => {
      this.scene.events.emit('openGlobalUpgrades');
    });
  }
}

/**
 * Self-Clearing Global Upgrades Menu
 * CRITICAL LOGIC: When an upgrade is bought, it MUST DISAPPEAR immediately from the list.
 * Never shows inactive/active clutter.
 */
export class GlobalUpgradesModal {
  constructor(scene, parentContainer) {
    this.scene = scene;
    this.isOpen = false;
    this.currentPage = 0;
    this.pageSize = 4;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(100);
    this.container.setVisible(false);
    parentContainer.add(this.container);

    // Backdrop
    this.backdrop = scene.add.graphics();
    this.backdrop.fillStyle(0x000000, 0.65);
    this.backdrop.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    this.backdrop.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_CONFIG.width, GAME_CONFIG.height), Phaser.Geom.Rectangle.Contains);
    this.backdrop.on('pointerup', () => this.close());
    this.container.add(this.backdrop);

    this.cardWidth = 540;
    this.cardHeight = 690;
    this.card = scene.add.container(360, 640);
    this.container.add(this.card);

    this.rowsContainer = scene.add.container(0, 0);
    this.card.add(this.rowsContainer);

    this.buildBaseCard();

    scene.events.on('openGlobalUpgrades', () => this.open());
    gameState.on('coinsChanged', () => { if (this.isOpen) this.renderList(); });
    gameState.on('upgradesListChanged', () => { if (this.isOpen) this.renderList(); });
  }

  buildBaseCard() {
    const w = this.cardWidth;
    const h = this.cardHeight;

    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.4);
    g.fillRoundedRect(-w / 2, -h / 2 + 12, w, h, 26);
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 26);

    // Header
    g.fillStyle(0xf8fafc, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 86, { tl: 26, tr: 26, bl: 0, br: 0 });
    g.lineStyle(2, 0xe2e8f0, 1);
    g.lineBetween(-w / 2, -h / 2 + 86, w / 2, -h / 2 + 86);
    this.card.add(g);

    const title = this.scene.add.text(-w / 2 + 28, -h / 2 + 20, '⭐ STORE UPGRADES', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '25px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    this.card.add(title);

    this.subTitle = this.scene.add.text(-w / 2 + 30, -h / 2 + 54, 'Purchased perks disappear to keep shop clean!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#64748b'
    });
    this.card.add(this.subTitle);

    // Red Square Close Button
    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 38, -h / 2 + 42, () => this.close());
    this.card.add(closeBtn);

    // Pagination Footer Controls
    this.pageControls = this.scene.add.container(0, h / 2 - 35);
    this.card.add(this.pageControls);

    this.pageText = this.scene.add.text(0, 0, 'Page 1/1', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#64748b'
    }).setOrigin(0.5);
    this.pageControls.add(this.pageText);

    // Prev Page Button
    this.prevBtn = this.scene.add.text(-80, 0, '◀ PREV', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#3b82f6'
    }).setOrigin(0.5);
    this.prevBtn.setInteractive();
    this.prevBtn.on('pointerup', () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.renderList();
      }
    });
    this.pageControls.add(this.prevBtn);

    // Next Page Button
    this.nextBtn = this.scene.add.text(80, 0, 'NEXT ▶', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#3b82f6'
    }).setOrigin(0.5);
    this.nextBtn.setInteractive();
    this.nextBtn.on('pointerup', () => {
      const available = gameState.getAvailableUpgrades();
      const maxPage = Math.max(0, Math.ceil(available.length / this.pageSize) - 1);
      if (this.currentPage < maxPage) {
        this.currentPage++;
        this.renderList();
      }
    });
    this.pageControls.add(this.nextBtn);
  }

  renderList() {
    this.rowsContainer.removeAll(true);

    // ONLY fetch unpurchased upgrades!
    const available = gameState.getAvailableUpgrades();
    const maxPage = Math.max(0, Math.ceil(available.length / this.pageSize) - 1);
    if (this.currentPage > maxPage) this.currentPage = maxPage;

    this.pageText.setText(`Upgrades Left: ${available.length}`);
    this.prevBtn.setVisible(this.currentPage > 0);
    this.nextBtn.setVisible(this.currentPage < maxPage);

    if (available.length === 0) {
      // All upgrades purchased celebration card!
      const emptyContainer = this.scene.add.container(0, 0);
      const eg = this.scene.add.graphics();
      eg.fillStyle(0xf0fdf4, 1.0);
      eg.fillRoundedRect(-220, -100, 440, 200, 18);
      eg.lineStyle(2, 0x86efac, 1.0);
      eg.strokeRoundedRect(-220, -100, 440, 200, 18);
      emptyContainer.add(eg);

      const check = this.scene.add.text(0, -40, '🎉 🌟 👔', { fontSize: '40px' }).setOrigin(0.5);
      const msg1 = this.scene.add.text(0, 15, 'All Available Upgrades Bought!', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#15803d'
      }).setOrigin(0.5);
      const msg2 = this.scene.add.text(0, 48, gameState.stage === 1 ? 'Upgrade Sewing Table to Level 25 to Renovate!' : 'Your Fashion Van is running at peak capacity!', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#475569',
        align: 'center',
        wordWrap: { width: 380 }
      }).setOrigin(0.5);

      emptyContainer.add(check);
      emptyContainer.add(msg1);
      emptyContainer.add(msg2);
      this.rowsContainer.add(emptyContainer);
      return;
    }

    const startIdx = this.currentPage * this.pageSize;
    const pageItems = available.slice(startIdx, startIdx + this.pageSize);

    const startY = -this.cardHeight / 2 + 155;
    const spacing = 118;

    pageItems.forEach((upg, index) => {
      const rowY = startY + index * spacing;
      const row = this.createUpgradeRow(0, rowY, upg);
      this.rowsContainer.add(row);
    });
  }

  createUpgradeRow(x, y, upg) {
    const row = this.scene.add.container(x, y);
    const rowW = this.cardWidth - 50;
    const rowH = 104;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xf8fafc, 1.0);
    bg.fillRoundedRect(-rowW / 2, -rowH / 2, rowW, rowH, 16);
    bg.lineStyle(1.5, 0xe2e8f0, 1.0);
    bg.strokeRoundedRect(-rowW / 2, -rowH / 2, rowW, rowH, 16);
    row.add(bg);

    // Left Icon Badge
    const iconBadge = this.scene.add.container(-rowW / 2 + 45, 0);
    const ibg = this.scene.add.graphics();
    ibg.fillStyle(0xf1f5f9, 1.0);
    ibg.fillRoundedRect(-28, -28, 56, 56, 12);
    ibg.lineStyle(1.5, 0xe2e8f0, 1.0);
    ibg.strokeRoundedRect(-28, -28, 56, 56, 12);
    iconBadge.add(ibg);
    const iconTxt = this.scene.add.text(0, 0, upg.icon, { fontSize: '28px' }).setOrigin(0.5);
    iconBadge.add(iconTxt);
    row.add(iconBadge);

    // Title & Description
    const textX = -rowW / 2 + 85;
    const titleTxt = this.scene.add.text(textX, -22, upg.title, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    row.add(titleTxt);

    const descTxt = this.scene.add.text(textX, 4, upg.description, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12.5px',
      color: '#475569',
      wordWrap: { width: 225 }
    });
    row.add(descTxt);

    // Right Buy Button (135x52)
    const canAfford = gameState.canBuyUpgrade(upg.id);
    const btn = this.scene.add.container(rowW / 2 - 80, 0);
    row.add(btn);

    const btnW = 135;
    const btnH = 52;
    const bgBtn = this.scene.add.graphics();
    bgBtn.fillStyle(0x000000, 0.25);
    bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH, 14);

    if (canAfford) {
      bgBtn.fillStyle(0x15803d, 1.0);
      bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH - 4, 14);
      bgBtn.fillStyle(0x22c55e, 1.0);
      bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH - 6, 14);
      bgBtn.fillStyle(0xffffff, 0.3);
      bgBtn.fillRoundedRect(-btnW / 2 + 8, -btnH / 2 + 3, btnW - 16, 4, 2);
    } else {
      bgBtn.fillStyle(0x334155, 1.0);
      bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH - 4, 14);
      bgBtn.fillStyle(0x64748b, 1.0);
      bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH - 6, 14);
    }
    btn.add(bgBtn);

    const btnTxt = this.scene.add.text(0, -9, 'BUY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    btn.add(btnTxt);

    const costTxt = this.scene.add.text(0, 11, `🪙 ${upg.cost}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: canAfford ? '#fef08a' : '#e2e8f0'
    }).setOrigin(0.5);
    btn.add(costTxt);

    const hitArea = new Phaser.Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH);
    btn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    btn.on('pointerdown', () => {
      if (gameState.canBuyUpgrade(upg.id)) btn.setScale(0.95);
    });

    btn.on('pointerup', () => {
      btn.setScale(1.0);
      if (gameState.canBuyUpgrade(upg.id)) {
        // Purchase upgrade!
        gameState.buyUpgrade(upg.id);

        // Slide-out and DISAPPEAR animation!
        this.scene.tweens.add({
          targets: row,
          x: 400,
          alpha: 0,
          duration: 180,
          ease: 'Back.easeIn',
          onComplete: () => {
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
 * Unlock Station Modal Card
 * Triggered by tapping dotted outline boxes for Jeans Station (50) or Hats Rack (100)
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

    this.cardWidth = 480;
    this.cardHeight = 360;
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
    g.fillRoundedRect(-w / 2, -h / 2 + 10, w, h, 24);
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 24);

    g.fillStyle(0xf8fafc, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 76, { tl: 24, tr: 24, bl: 0, br: 0 });
    g.lineStyle(1.5, 0xe2e8f0, 1);
    g.lineBetween(-w / 2, -h / 2 + 76, w / 2, -h / 2 + 76);
    this.card.add(g);

    this.titleText = this.scene.add.text(-w / 2 + 24, -h / 2 + 24, 'Unlock Station', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    this.card.add(this.titleText);

    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 34, -h / 2 + 38, () => this.close());
    this.card.add(closeBtn);

    this.iconText = this.scene.add.text(0, -h / 2 + 125, '👖', { fontSize: '48px' }).setOrigin(0.5);
    this.card.add(this.iconText);

    this.descText = this.scene.add.text(0, -h / 2 + 185, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#475569',
      align: 'center',
      wordWrap: { width: 380 }
    }).setOrigin(0.5);
    this.card.add(this.descText);

    // Chunky Unlock Button
    this.unlockBtn = this.scene.add.container(0, h / 2 - 50);
    this.card.add(this.unlockBtn);

    const btnW = 240;
    const btnH = 58;
    this.btnGraphics = this.scene.add.graphics();
    this.unlockBtn.add(this.btnGraphics);

    this.btnLabel = this.scene.add.text(0, 0, 'UNLOCK (🪙 50)', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
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

    const btnW = 240;
    const btnH = 58;
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
    const { stationId, cost } = this.currentData;

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
 * Clean white screen, animated hammer & wrench icons, progress bar saying "Renovating..."
 * Confetti particle explosion and triggers Stage 2!
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
    // 1. Clean White Overlay
    this.whiteScreen = this.scene.add.graphics();
    this.whiteScreen.fillStyle(0xffffff, 1.0);
    this.whiteScreen.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    this.container.add(this.whiteScreen);

    // 2. Animated Hammer & Wrench Icon
    this.toolIcon = this.scene.add.text(360, 480, '🔨', { fontSize: '72px' }).setOrigin(0.5);
    this.container.add(this.toolIcon);

    // 3. Title Text
    this.statusText = this.scene.add.text(360, 580, 'Renovating Boutique...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#0f172a'
    }).setOrigin(0.5);
    this.container.add(this.statusText);

    // 4. Progress Bar (Track & Fill)
    this.barGraphics = this.scene.add.graphics();
    this.container.add(this.barGraphics);

    this.percentText = this.scene.add.text(360, 675, '0%', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#64748b'
    }).setOrigin(0.5);
    this.container.add(this.percentText);
  }

  drawBar(progress) {
    this.barGraphics.clear();
    const w = 340;
    const h = 20;
    const x = 360 - w / 2;
    const y = 625;

    // Track
    this.barGraphics.fillStyle(0xe2e8f0, 1.0);
    this.barGraphics.fillRoundedRect(x, y, w, h, 10);

    // Fill
    const pct = Phaser.Math.Clamp(progress, 0, 1);
    if (pct > 0) {
      this.barGraphics.fillStyle(0x2563eb, 1.0);
      this.barGraphics.fillRoundedRect(x, y, Math.max(20, w * pct), h, 10);
    }
  }

  start() {
    this.container.setVisible(true);
    this.container.setAlpha(0);

    // Tool animation swinging back and forth
    const swingTween = this.scene.tweens.add({
      targets: this.toolIcon,
      angle: { from: -20, to: 20 },
      scale: { from: 1.0, to: 1.15 },
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Fade-in white screen
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 350,
      onComplete: () => {
        // Progress bar fills over 2.4 seconds
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
    // 1. Trigger State Stage 2 Renovation
    gameState.renovateToStage2();

    // 2. Confetti Explosion
    this.explodeConfetti();

    // 3. Fade out white screen
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        this.container.setVisible(false);
        // 4. Open Fashion Van: OPEN! Modal
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
        { fontSize: `${Phaser.Math.Between(20, 32)}px` }
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

    this.cardWidth = 520;
    this.cardHeight = 470;
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
    g.fillRoundedRect(-w / 2, -h / 2 + 10, w, h, 26);
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 26);

    g.fillStyle(0xccfbf1, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 86, { tl: 26, tr: 26, bl: 0, br: 0 });
    g.lineStyle(2, 0x99f6e4, 1);
    g.lineBetween(-w / 2, -h / 2 + 86, w / 2, -h / 2 + 86);
    this.card.add(g);

    const title = this.scene.add.text(-w / 2 + 28, -h / 2 + 28, '🎉 FASHION VAN: OPEN!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#0f766e'
    });
    this.card.add(title);

    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 38, -h / 2 + 42, () => this.close());
    this.card.add(closeBtn);

    const illustText = this.scene.add.text(0, -h / 2 + 155, '🚚  ✨  👗', { fontSize: '48px' }).setOrigin(0.5);
    this.card.add(illustText);

    const msg1 = this.scene.add.text(0, -h / 2 + 235, 'Welcome to Stage 2: Mobile Boutique!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#0f172a'
    }).setOrigin(0.5);
    this.card.add(msg1);

    const msg2 = this.scene.add.text(0, -h / 2 + 295, 'Serve trendy shoppers from your custom fashion truck! Unlock new stations like the Jeans Table (50🪙) and Hats Rack (100🪙) to multiply your profits!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#475569',
      align: 'center',
      wordWrap: { width: 440 }
    }).setOrigin(0.5);
    this.card.add(msg2);

    // Chunky Action Button
    const btn = this.scene.add.container(0, h / 2 - 60);
    this.card.add(btn);

    const btnW = 240;
    const btnH = 56;
    const bgBtn = this.scene.add.graphics();
    bgBtn.fillStyle(0x000000, 0.25);
    bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH, 16);
    bgBtn.fillStyle(0x0f766e, 1.0);
    bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2 + 4, btnW, btnH - 4, 16);
    bgBtn.fillStyle(0x14b8a6, 1.0);
    bgBtn.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH - 6, 16);
    btn.add(bgBtn);

    const txt = this.scene.add.text(0, -2, 'LET\'S ROLL! 🚀', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
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
 * Interactive Station Upgrade Card (Modal)
 * ONLY opened when clicking directly on the Sewing Station in the world!
 */
export class StationUpgradeModal {
  constructor(scene, parentContainer) {
    this.scene = scene;
    this.isOpen = false;

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

    this.cardWidth = 520;
    this.cardHeight = 600;
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
    g.fillRoundedRect(-w / 2, -h / 2 + 12, w, h, 26);
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 26);

    g.fillStyle(0xf8fafc, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, 84, { tl: 26, tr: 26, bl: 0, br: 0 });
    g.lineStyle(2, 0xe2e8f0, 1);
    g.lineBetween(-w / 2, -h / 2 + 84, w / 2, -h / 2 + 84);
    this.card.add(g);

    this.titleText = this.scene.add.text(-w / 2 + 28, -h / 2 + 28, 'Sewing Table', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#0f172a'
    });
    this.card.add(this.titleText);

    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 38, -h / 2 + 42, () => this.close());
    this.card.add(closeBtn);

    const illustBox = this.scene.add.graphics();
    illustBox.fillStyle(0xf1f5f9, 1.0);
    illustBox.fillRoundedRect(-w / 2 + 30, -h / 2 + 104, w - 60, 108, 18);
    this.card.add(illustBox);

    const stationIcon = this.scene.add.text(0, -h / 2 + 144, '🧵  👕  ✂️', { fontSize: '40px' }).setOrigin(0.5);
    this.card.add(stationIcon);

    this.levelBadgeText = this.scene.add.text(0, -h / 2 + 186, 'Level 1 / 50', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#1d4ed8'
    }).setOrigin(0.5);
    this.card.add(this.levelBadgeText);

    this.progressBarGraphics = this.scene.add.graphics();
    this.card.add(this.progressBarGraphics);

    this.createStatRow(-h / 2 + 272, 'Profit Per T-Shirt:', 'profitText', '🪙 +4');
    this.createStatRow(-h / 2 + 344, 'Crafting Speed:', 'speedText', '1.8s');

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
        this.scene.tweens.add({ targets: this.upgradeBtn, scale: 0.95, duration: 60 });
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
    const h = 16;
    const x = -w / 2;
    const y = -this.cardHeight / 2 + 226;

    this.progressBarGraphics.fillStyle(0xe2e8f0, 1.0);
    this.progressBarGraphics.fillRoundedRect(x, y, w, h, 8);

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
    this.upgradeBtnGraphics.fillStyle(0x000000, 0.3);
    this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, 18);

    if (canAfford) {
      this.upgradeBtnGraphics.fillStyle(0x1d4ed8, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2 + 4, w, h - 4, 18);
      this.upgradeBtnGraphics.fillStyle(0x3b82f6, 1.0);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2, -h / 2, w, h - 8, 18);
      this.upgradeBtnGraphics.fillStyle(0xffffff, 0.3);
      this.upgradeBtnGraphics.fillRoundedRect(-w / 2 + 12, -h / 2 + 4, w - 24, 6, 3);
      this.upgradeBtnText.setColor('#ffffff');
      this.upgradeBtnCostText.setColor('#fef08a');
    } else {
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
 * Notice & Toast Modal
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
    const w = 460;
    const h = 260;

    const g = this.scene.add.graphics();
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(-w / 2, -h / 2 + 8, w, h, 20);
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 20);

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

    const closeBtn = createRedSquareCloseBtn(this.scene, w / 2 - 32, -h / 2 + 32, () => this.close());
    this.card.add(closeBtn);

    this.bodyText = this.scene.add.text(0, -h / 2 + 115, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#475569',
      align: 'center',
      wordWrap: { width: 390 }
    }).setOrigin(0.5);
    this.card.add(this.bodyText);

    const okBtn = this.scene.add.container(0, h / 2 - 40);
    const bgBtn = this.scene.add.graphics();
    bgBtn.fillStyle(0x1d4ed8, 1.0);
    bgBtn.fillRoundedRect(-65, -18, 130, 38, 10);
    bgBtn.fillStyle(0x3b82f6, 1.0);
    bgBtn.fillRoundedRect(-65, -21, 130, 38, 10);
    okBtn.add(bgBtn);

    const okTxt = this.scene.add.text(0, -2, 'GOT IT', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    okBtn.add(okTxt);

    okBtn.setInteractive(new Phaser.Geom.Rectangle(-65, -21, 130, 38), Phaser.Geom.Rectangle.Contains);
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
