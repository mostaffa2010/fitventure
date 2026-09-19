/**
 * Fitventure - Main Game Scene & Bootstrap
 * Connects all modular systems into an automated, playable 2.5D idle tycoon game.
 */

import { GAME_CONFIG, gameState, phaserConfig } from './config.js';
import { drawEnvironment } from './environment.js';
import { CharacterManager } from './characters.js';
import { SewingStation, CounterStation, Zone2Station, spawnFloatingCoins } from './stations.js';
import { TopCoinsPill, BottomDock, StationUpgradeModal } from './ui.js';

export class FitventureScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FitventureScene' });
  }

  preload() {
    // Assets are procedurally drawn with Phaser 3 Vector Graphics
    // to ensure crisp 2.5D rendering at any screen density.
  }

  create() {
    // 1. Draw 2.5D Top-Down Orthographic Environment
    this.envGraphics = drawEnvironment(this);

    // 2. Initialize Workstations
    // Top Customer Counter (Horizontal side-by-side service slots)
    this.counterStation = new CounterStation(this);
    // Crafting Station (Sewing & Cutting Table - tightly positioned)
    this.sewingStation = new SewingStation(this);
    // Locked Zone 2 Station Placeholder (Jeans & Hats station with unlockable purchase ring)
    this.zone2Station = new Zone2Station(this);

    // 3. Initialize AI Characters & Queue Manager
    // (Spawns shoppers via crosswalk, procedural waddle animations,
    // horizontal counter slot ordering, waiting queue, worker delivery loop)
    this.characterManager = new CharacterManager(this, this.sewingStation, this.counterStation);

    // 4. Initialize UI Layers
    // Top Floating Gold Coin Pill
    this.topCoinsPill = new TopCoinsPill(this);
    // Bottom Dock (Chunky 3D Buttons: Renovate, Boost x2, Upgrades)
    this.bottomDock = new BottomDock(this);
    // Interactive Station Upgrade Card (Modal with high mobile readability)
    this.stationUpgradeModal = new StationUpgradeModal(this);

    // 5. Connect Game Events & Economy Loop
    this.events.on('customerPaid', (data) => {
      spawnFloatingCoins(this, data.x, data.y, data.amount, 360, 70);
    });

    // Renovation Notice Modal (Enhanced typography for mobile)
    this.setupNoticeModal();

    console.log('✨ Fitventure Initialized: Clothing Boutique Tycoon ready!');
  }

  setupNoticeModal() {
    this.events.on('openNotice', (data) => {
      const modal = this.add.container(360, 640).setDepth(110);
      
      const g = this.add.graphics();
      // Backdrop
      g.fillStyle(0x000000, 0.6);
      g.fillRect(-360, -640, 720, 1280);
      // Card with drop shadow
      g.fillStyle(0x000000, 0.3);
      g.fillRoundedRect(-210, -120, 420, 240, 22);
      g.fillStyle(0xffffff, 1.0);
      g.fillRoundedRect(-210, -125, 420, 240, 22);
      modal.add(g);

      const title = this.add.text(0, -75, data.title, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#0f172a'
      }).setOrigin(0.5);
      modal.add(title);

      const body = this.add.text(0, -10, data.text, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        color: '#475569',
        align: 'center',
        wordWrap: { width: 360 }
      }).setOrigin(0.5);
      modal.add(body);

      // Chunky OK Button
      const okBtn = this.add.container(0, 65);
      const bgBtn = this.add.graphics();
      bgBtn.fillStyle(0x1d4ed8, 1.0);
      bgBtn.fillRoundedRect(-70, -22, 140, 44, 14);
      bgBtn.fillStyle(0x3b82f6, 1.0);
      bgBtn.fillRoundedRect(-70, -26, 140, 44, 14);
      okBtn.add(bgBtn);

      const okText = this.add.text(0, -4, 'GOT IT', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffffff'
      }).setOrigin(0.5);
      okBtn.add(okText);

      okBtn.setInteractive(new Phaser.Geom.Rectangle(-70, -26, 140, 44), Phaser.Geom.Rectangle.Contains);
      okBtn.on('pointerdown', () => okBtn.setScale(0.95));
      okBtn.on('pointerup', () => {
        modal.destroy();
      });

      modal.add(okBtn);
    });
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;

    // Update boost multiplier countdown
    gameState.updateBoost(deltaSeconds);

    // Update character AI checks
    if (this.characterManager) {
      this.characterManager.update(time, delta);
    }
  }
}

// Attach scene to configuration
phaserConfig.scene = FitventureScene;

// Bootstrap Game on browser window load (if in browser)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    window.game = new Phaser.Game(phaserConfig);
  });
}
