/**
 * Fitventure - Main Game Scene & Bootstrap
 * Connects all modular systems into an automated, playable 2.5D idle tycoon game.
 */

import { GAME_CONFIG, gameState, phaserConfig } from './config.js';
import { drawEnvironment } from './environment.js';
import { CharacterManager } from './characters.js';
import { SewingStation, CounterStation, spawnFloatingCoins } from './stations.js';
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
    // (Asphalt street, zebra crosswalk, sidewalk, boutique parquet floor,
    // striped awning canopy, lush side hedges, and dark red pavement band)
    this.envGraphics = drawEnvironment(this);

    // 2. Initialize Workstations
    // Top Customer Counter
    this.counterStation = new CounterStation(this);
    // Bottom Crafting Station (Sewing & Cutting Table)
    this.sewingStation = new SewingStation(this);

    // 3. Initialize AI Characters & Queue Manager
    // (Spawns shoppers via crosswalk, queue lines, speech bubbles with 👕,
    // worker tailor with red cap moving between sewing table and counter)
    this.characterManager = new CharacterManager(this, this.sewingStation, this.counterStation);

    // 4. Initialize UI Layers
    // Top Floating Gold Coin Pill
    this.topCoinsPill = new TopCoinsPill(this);
    // Bottom Dock (Renovate, Boost x2, Upgrades)
    this.bottomDock = new BottomDock(this);
    // Interactive Station Upgrade Card (Modal)
    this.stationUpgradeModal = new StationUpgradeModal(this);

    // 5. Connect Game Events & Economy Loop
    this.events.on('customerPaid', (data) => {
      spawnFloatingCoins(this, data.x, data.y, data.amount, 360, 70);
    });

    // Renovation Notice Modal
    this.setupNoticeModal();

    // Welcome Log
    console.log('✨ Fitventure Initialized: Clothing Boutique Tycoon ready!');
  }

  setupNoticeModal() {
    this.events.on('openNotice', (data) => {
      const modal = this.add.container(360, 640).setDepth(110);
      
      const g = this.add.graphics();
      // Backdrop
      g.fillStyle(0x000000, 0.5);
      g.fillRect(-360, -640, 720, 1280);
      // Card
      g.fillStyle(0xffffff, 1.0);
      g.fillRoundedRect(-180, -90, 360, 180, 18);
      modal.add(g);

      const title = this.add.text(0, -50, data.title, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#1e293b'
      }).setOrigin(0.5);
      modal.add(title);

      const body = this.add.text(0, -5, data.text, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#64748b',
        align: 'center',
        wordWrap: { width: 310 }
      }).setOrigin(0.5);
      modal.add(body);

      const okBtn = this.add.text(0, 50, 'GOT IT', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#3b82f6'
      }).setOrigin(0.5).setInteractive();
      modal.add(okBtn);

      okBtn.on('pointerup', () => {
        modal.destroy();
      });
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
