/**
 * Fitventure - Mobile Idle Tycoon Prototype
 * Engine: Phaser 3
 * Theme: Boutique Clothing Shop (Eatventure Style)
 */

class FitventureScene extends Phaser.Scene {
  constructor() {
    super('FitventureScene');

    // Progression & Economics
    this.coins = 0;
    this.displayedCoins = 0;
    this.stationLevel = 1;
    this.craftTime = 2500; // ms to sew a T-shirt
    this.coinReward = 15;
    this.upgradeCost = 50;

    // Station & Customer States
    // Station: 'IDLE' | 'CRAFTING' | 'COMPLETED'
    this.stationState = 'IDLE';
    this.craftTimer = 0;

    // Customer reference
    this.currentCustomer = null;
    this.isCustomerAtCounter = false;
  }

  create() {
    const { width, height } = this.scale;

    // 1. Boutique Floor & Environment
    this.drawShopEnvironment(width, height);

    // 2. Sewing Station Workstation
    this.createSewingStation(width / 2, 570);

    // 3. Top Header UI (Coins Pill & Branding)
    this.createHeaderUI(width / 2, 80);

    // 4. Bottom Upgrade Button
    this.createUpgradeButton(width / 2, height - 100);

    // 5. Initial Customer Arrival
    this.time.delayedCall(500, () => this.spawnCustomer());
  }

  /* -----------------------------------------------------------
   * 1. SHOP ENVIRONMENT (Isometric Tiles & Awning)
   * ----------------------------------------------------------- */
  drawShopEnvironment(w, h) {
    const bg = this.add.graphics();

    // Warm beige boutique floor base
    bg.fillStyle(0xf8f1e5, 1);
    bg.fillRect(0, 0, w, h);

    // Isometric diamond floor tiles
    const tileW = 90;
    const tileH = 46;
    for (let y = 140; y < h - 160; y += tileH) {
      for (let x = -tileW; x < w + tileW; x += tileW) {
        const xOffset = ((Math.floor(y / tileH) % 2) * (tileW / 2));
        const cx = x + xOffset;
        const cy = y;

        // Alternating warm wood/pastel tones
        const isAlt = (Math.floor(x / tileW) + Math.floor(y / tileH)) % 2 === 0;
        bg.fillStyle(isAlt ? 0xfbf6ee : 0xf2e5d3, 1);
        bg.fillPoints([
          { x: cx, y: cy - tileH / 2 },
          { x: cx + tileW / 2, y: cy },
          { x: cx, y: cy + tileH / 2 },
          { x: cx - tileW / 2, y: cy }
        ], true);

        // Tile bevel line
        bg.lineStyle(1, 0xe4d3bf, 0.75);
        bg.strokePoints([
          { x: cx, y: cy - tileH / 2 },
          { x: cx + tileW / 2, y: cy },
          { x: cx, y: cy + tileH / 2 },
          { x: cx - tileW / 2, y: cy }
        ], true);
      }
    }

    // Top boutique wall
    bg.fillStyle(0x34495e, 1);
    bg.fillRect(0, 0, w, 150);

    // Golden moulding strip
    bg.fillStyle(0xd4af37, 1);
    bg.fillRect(0, 145, w, 6);

    // Awning: Alternating orange and white triangles
    const triangleW = 45;
    for (let x = 0; x < w; x += triangleW) {
      const isWhite = (Math.floor(x / triangleW) % 2) === 0;
      bg.fillStyle(isWhite ? 0xffffff : 0xe67e22, 1);
      bg.fillTriangle(x, 0, x + triangleW, 0, x + triangleW / 2, 48);
    }
  }

  /* -----------------------------------------------------------
   * 2. SEWING WORKSTATION & GAUGE
   * ----------------------------------------------------------- */
  createSewingStation(x, y) {
    this.stationY = y;
    this.stationContainer = this.add.container(x, y);

    const g = this.add.graphics();

    // Table shadow
    g.fillStyle(0x000000, 0.12);
    g.fillRoundedRect(-155, 35, 310, 50, 24);

    // Main Wood Table (Eatventure warm oak styling)
    g.fillStyle(0xba8c63, 1);
    g.fillRoundedRect(-160, -50, 320, 105, 18);

    // Light wooden table top
    g.fillStyle(0xdeb887, 1);
    g.fillRoundedRect(-152, -44, 304, 88, 14);

    // Cutting Mat (Teal craft surface detail)
    g.fillStyle(0x16a085, 1);
    g.fillRoundedRect(-138, -34, 130, 68, 8);
    g.lineStyle(1, 0x1abc9c, 0.8);
    for (let gx = -128; gx <= -18; gx += 15) {
      g.lineBetween(gx, -34, gx, 34);
    }
    for (let gy = -24; gy <= 24; gy += 12) {
      g.lineBetween(-138, gy, -8, gy);
    }

    // Stylized Sewing Machine
    g.fillStyle(0x2c3e50, 1);
    g.fillRoundedRect(-85, -28, 70, 18, 4); // base
    g.fillRoundedRect(-85, -60, 26, 36, 4); // vertical column
    g.fillRoundedRect(-85, -64, 60, 15, 4); // top arm
    g.fillStyle(0xecf0f1, 1);
    g.fillRect(-40, -48, 5, 20); // needle assembly
    g.fillStyle(0xe74c3c, 1);
    g.fillCircle(-72, -68, 6); // thread spool

    // Folded Fabric & Measuring Tape on right
    g.fillStyle(0x3498db, 1);
    g.fillRoundedRect(35, -34, 85, 30, 6);
    g.fillStyle(0x2980b9, 1);
    g.fillRoundedRect(30, -20, 95, 20, 6);
    g.fillStyle(0xf1c40f, 1);
    g.fillRoundedRect(15, 6, 115, 8, 3); // measuring tape

    this.stationContainer.add(g);

    // Station Name & Level Pill
    const tagBg = this.add.graphics();
    tagBg.fillStyle(0x2c3e50, 0.9);
    tagBg.fillRoundedRect(-100, 58, 200, 32, 10);
    this.stationContainer.add(tagBg);

    this.stationTitleText = this.add.text(0, 74, `🧵 Sewing Table (Lv.${this.stationLevel})`, {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#ffffff',
      fontFamily: 'Segoe UI, sans-serif'
    }).setOrigin(0.5);
    this.stationContainer.add(this.stationTitleText);

    // Circular Progress Gauge Graphics
    this.gaugeGraphics = this.add.graphics();
    this.stationContainer.add(this.gaugeGraphics);

    // Completed Checkmark / Shirt Ready Indicator (Centered in gauge)
    this.statusIcon = this.add.text(0, -100, '', {
      fontSize: '28px',
      fontFamily: 'Segoe UI, sans-serif'
    }).setOrigin(0.5);
    this.stationContainer.add(this.statusIcon);

    // Interactive Tap Hitbox for Station
    this.stationHitbox = this.add.rectangle(0, 0, 340, 220, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    this.stationHitbox.on('pointerdown', () => this.handleStationTap());
    this.stationContainer.add(this.stationHitbox);

    this.drawGauge(0);
  }

  drawGauge(progress) {
    this.gaugeGraphics.clear();
    const radius = 28;
    const centerY = -100;

    if (this.stationState === 'IDLE') {
      // Prompt ring if customer is waiting
      if (this.isCustomerAtCounter) {
        this.gaugeGraphics.fillStyle(0xffffff, 0.9);
        this.gaugeGraphics.fillCircle(0, centerY, radius);
        this.gaugeGraphics.lineStyle(4, 0x27ae60, 1);
        this.gaugeGraphics.strokeCircle(0, centerY, radius);
      }
      return;
    }

    // Background hollow ring
    this.gaugeGraphics.lineStyle(9, 0xdfe6e9, 0.9);
    this.gaugeGraphics.strokeCircle(0, centerY, radius);

    // Green progress arc
    if (progress > 0) {
      this.gaugeGraphics.lineStyle(9, 0x2ecc71, 1);
      this.gaugeGraphics.beginPath();
      const startAngle = Phaser.Math.DegToRad(-90);
      const endAngle = Phaser.Math.DegToRad(-90 + progress * 360);
      this.gaugeGraphics.arc(0, centerY, radius, startAngle, endAngle);
      this.gaugeGraphics.strokePath();
    }
  }

  /* -----------------------------------------------------------
   * 3. TOP HEADER UI
   * ----------------------------------------------------------- */
  createHeaderUI(cx, cy) {
    // Boutique Brand Name
    this.add.text(cx, 48, 'FITVENTURE', {
      fontSize: '30px',
      fontWeight: '900',
      color: '#ffffff',
      fontFamily: 'Segoe UI, sans-serif',
      letterSpacing: 4
    }).setOrigin(0.5).setShadow(0, 3, 'rgba(0,0,0,0.3)', 6);

    // Floating Pill Container for Coins
    const pill = this.add.graphics();
    // Drop shadow
    pill.fillStyle(0x000000, 0.16);
    pill.fillRoundedRect(cx - 130, cy + 22, 260, 56, 28);
    // Card background
    pill.fillStyle(0xffffff, 0.96);
    pill.fillRoundedRect(cx - 130, cy + 18, 260, 56, 28);
    pill.lineStyle(3, 0xf1c40f, 1);
    pill.strokeRoundedRect(cx - 130, cy + 18, 260, 56, 28);

    // Gold Coin Symbol
    this.add.text(cx - 85, cy + 46, '🪙', { fontSize: '26px' }).setOrigin(0.5);

    // Smooth Coin Counter Text
    this.coinText = this.add.text(cx - 50, cy + 46, `${this.coins}`, {
      fontSize: '28px',
      fontWeight: '900',
      color: '#2c3e50',
      fontFamily: 'Segoe UI, sans-serif'
    }).setOrigin(0, 0.5);
  }

  /* -----------------------------------------------------------
   * 4. BOTTOM UPGRADE BUTTON
   * ----------------------------------------------------------- */
  createUpgradeButton(cx, cy) {
    this.upgradeBtnContainer = this.add.container(cx, cy);

    this.btnGraphics = this.add.graphics();
    this.upgradeBtnContainer.add(this.btnGraphics);

    this.upgradeTitle = this.add.text(0, -10, '', {
      fontSize: '22px',
      fontWeight: '800',
      color: '#ffffff',
      fontFamily: 'Segoe UI, sans-serif'
    }).setOrigin(0.5);
    this.upgradeBtnContainer.add(this.upgradeTitle);

    this.upgradeSub = this.add.text(0, 16, '', {
      fontSize: '14px',
      fontWeight: '600',
      color: '#e8f8f5',
      fontFamily: 'Segoe UI, sans-serif'
    }).setOrigin(0.5);
    this.upgradeBtnContainer.add(this.upgradeSub);

    // Button interactive hitbox
    const btnHit = this.add.rectangle(0, 0, 420, 80, 0x000000, 0)
      .setInteractive({ useHandCursor: true });
    btnHit.on('pointerdown', () => this.handleUpgrade());
    this.upgradeBtnContainer.add(btnHit);

    this.refreshUpgradeButton();
  }

  refreshUpgradeButton() {
    const canAfford = this.coins >= this.upgradeCost;
    const w = 420;
    const h = 80;
    const r = 24;

    this.btnGraphics.clear();

    // Drop shadow
    this.btnGraphics.fillStyle(0x000000, 0.2);
    this.btnGraphics.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, r);

    // Button Body
    if (canAfford) {
      this.btnGraphics.fillStyle(0x27ae60, 1);
      this.btnGraphics.fillRoundedRect(-w / 2, -h / 2, w, h, r);
      this.btnGraphics.lineStyle(3, 0x2ecc71, 1);
      this.btnGraphics.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
      this.upgradeTitle.setColor('#ffffff');
    } else {
      this.btnGraphics.fillStyle(0x95a5a6, 0.85);
      this.btnGraphics.fillRoundedRect(-w / 2, -h / 2, w, h, r);
      this.upgradeTitle.setColor('#ecf0f1');
    }

    const timeSec = (this.craftTime / 1000).toFixed(1);
    this.upgradeTitle.setText(`⬆️ Upgrade Station (🪙 ${this.upgradeCost})`);
    this.upgradeSub.setText(`Speed: ${timeSec}s | Reward: +${this.coinReward} Coins`);
  }

  /* -----------------------------------------------------------
   * 5. CUSTOMER MECHANIC & FLOW
   * ----------------------------------------------------------- */
  spawnCustomer() {
    if (this.currentCustomer) return;

    const { width, height } = this.scale;
    const palette = [0xe74c3c, 0x9b59b6, 0x3498db, 0x1abc9c, 0xf39c12];
    const customerColor = Phaser.Utils.Array.GetRandom(palette);

    this.currentCustomer = this.add.container(width / 2, height + 80);

    const cg = this.add.graphics();
    // Shadow
    cg.fillStyle(0x000000, 0.15);
    cg.fillCircle(0, 26, 24);
    // Body (Sweater)
    cg.fillStyle(customerColor, 1);
    cg.fillRoundedRect(-24, -18, 48, 48, 14);
    // Head & face
    cg.fillStyle(0xffdbac, 1);
    cg.fillCircle(0, -36, 22);
    cg.fillStyle(0x2c3e50, 1); // eyes
    cg.fillCircle(-7, -38, 3.5);
    cg.fillCircle(7, -38, 3.5);
    this.currentCustomer.add(cg);

    // Speech Order Bubble
    this.speechBubble = this.add.container(0, -96);
    this.speechBubble.setScale(0);

    const bubbleG = this.add.graphics();
    bubbleG.fillStyle(0x000000, 0.12);
    bubbleG.fillCircle(2, 3, 30);
    bubbleG.fillStyle(0xffffff, 1);
    bubbleG.fillCircle(0, 0, 30);
    bubbleG.lineStyle(3, 0x2c3e50, 1);
    bubbleG.strokeCircle(0, 0, 30);
    this.speechBubble.add(bubbleG);

    // Bouncing T-Shirt Icon
    this.bubbleEmoji = this.add.text(0, 0, '👕', { fontSize: '26px' }).setOrigin(0.5);
    this.speechBubble.add(this.bubbleEmoji);
    this.currentCustomer.add(this.speechBubble);

    // Customer walks in from bottom to counter
    this.tweens.add({
      targets: this.currentCustomer,
      y: 740,
      duration: 850,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.isCustomerAtCounter = true;

        // Pop up bubble
        this.tweens.add({
          targets: this.speechBubble,
          scale: 1,
          duration: 300,
          ease: 'Back.easeOut'
        });

        // Continuous bounce for T-shirt icon
        this.bubbleBounceTween = this.tweens.add({
          targets: this.bubbleEmoji,
          y: -6,
          duration: 450,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        this.statusIcon.setText('👇');
        this.drawGauge(0);
      }
    });
  }

  /* -----------------------------------------------------------
   * 6. WORKSTATION INTERACTIONS & CRAFTING LOOP
   * ----------------------------------------------------------- */
  handleStationTap() {
    // 1. Customer is waiting and station is idle -> Start Sewing
    if (this.isCustomerAtCounter && this.stationState === 'IDLE') {
      this.stationState = 'CRAFTING';
      this.craftTimer = 0;
      this.statusIcon.setText('');

      // Tactile sewing bounce on the table
      this.tweens.add({
        targets: this.stationContainer,
        scaleX: 0.98,
        scaleY: 0.98,
        yoyo: true,
        duration: 90
      });
      return;
    }

    // 2. Sewing completed -> Collect Reward & Give Shirt to Customer
    if (this.stationState === 'COMPLETED') {
      this.collectCompletedOrder();
    }
  }

  update(time, delta) {
    // Smooth coin animation
    if (Math.abs(this.displayedCoins - this.coins) > 0.1) {
      this.displayedCoins = Phaser.Math.Linear(this.displayedCoins, this.coins, 0.2);
      if (Math.abs(this.displayedCoins - this.coins) < 1) {
        this.displayedCoins = this.coins;
      }
      this.coinText.setText(Math.floor(this.displayedCoins).toLocaleString());
    }

    // Crafting progress logic
    if (this.stationState === 'CRAFTING') {
      this.craftTimer += delta;
      const progress = Math.min(this.craftTimer / this.craftTime, 1);
      this.drawGauge(progress);

      if (progress >= 1) {
        this.stationState = 'COMPLETED';
        this.drawGauge(1);

        // Display checkmark in gauge
        this.statusIcon.setText('✔️');
        this.tweens.add({
          targets: this.statusIcon,
          scale: { from: 0.5, to: 1.25 },
          duration: 350,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  collectCompletedOrder() {
    this.stationState = 'IDLE';
    this.isCustomerAtCounter = false;

    // Reset gauge & status icon
    this.statusIcon.setText('');
    this.tweens.killTweensOf(this.statusIcon);
    this.statusIcon.setScale(1);
    this.drawGauge(0);

    // Add Coins
    this.coins += this.coinReward;
    this.refreshUpgradeButton();

    // Floating "+15 Coins" animation
    const custX = this.currentCustomer.x;
    const custY = this.currentCustomer.y - 70;

    const floatText = this.add.text(custX, custY, `+${this.coinReward} 🪙`, {
      fontSize: '28px',
      fontWeight: '900',
      color: '#f1c40f',
      stroke: '#2c3e50',
      strokeThickness: 5,
      fontFamily: 'Segoe UI, sans-serif'
    }).setOrigin(0.5).setDepth(20);

    this.tweens.add({
      targets: floatText,
      y: custY - 75,
      alpha: 0,
      duration: 850,
      ease: 'Power2',
      onComplete: () => floatText.destroy()
    });

    // Customer receives shirt, shows heart and walks out
    if (this.bubbleBounceTween) this.bubbleBounceTween.stop();
    this.bubbleEmoji.setText('❤️');

    this.tweens.add({
      targets: this.currentCustomer,
      y: this.scale.height + 100,
      delay: 250,
      duration: 800,
      ease: 'Sine.easeIn',
      onComplete: () => {
        if (this.currentCustomer) {
          this.currentCustomer.destroy();
          this.currentCustomer = null;
        }
        // New shopper enters after a short delay
        this.time.delayedCall(500, () => this.spawnCustomer());
      }
    });
  }

  /* -----------------------------------------------------------
   * 7. STATION UPGRADE
   * ----------------------------------------------------------- */
  handleUpgrade() {
    if (this.coins < this.upgradeCost) {
      // Shake animation on failure
      this.tweens.add({
        targets: this.upgradeBtnContainer,
        x: this.upgradeBtnContainer.x + 8,
        duration: 50,
        yoyo: true,
        repeat: 3
      });
      return;
    }

    // Purchase upgrade
    this.coins -= this.upgradeCost;
    this.stationLevel += 1;
    this.coinReward += 10;
    this.craftTime = Math.max(600, this.craftTime - 300);
    this.upgradeCost = Math.floor(this.upgradeCost * 1.75);

    this.stationTitleText.setText(`🧵 Sewing Table (Lv.${this.stationLevel})`);
    this.refreshUpgradeButton();

    // Celebration Bounce on workstation
    this.tweens.add({
      targets: this.stationContainer,
      scaleX: 1.07,
      scaleY: 1.07,
      yoyo: true,
      duration: 150,
      ease: 'Back.easeOut'
    });
  }
}

// Mobile Vertical Responsive Configuration
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#f8f1e5',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280
  },
  scene: [FitventureScene]
};

// Initialize Game
window.addEventListener('load', () => {
  new Phaser.Game(config);
});
