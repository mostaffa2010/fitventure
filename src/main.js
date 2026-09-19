/**
 * Fitventure - Main Game Scene & Bootstrap
 * Connects all modular systems into an automated, playable 2.5D idle tycoon game.
 * Adheres to Eatventure standards with crisp mechanics, clear modal separation,
 * and high juice.
 */

import { GAME_CONFIG, gameState, phaserConfig } from './config.js';
import { drawEnvironment } from './environment.js';
import { CharacterManager } from './characters.js';
import { SewingStation, CounterStation, spawnFloatingCoins } from './stations.js';
import { TopCoinsPill, BottomDock, StationUpgradeModal, GlobalUpgradesModal, RenovateModal, NoticeModal } from './ui.js';

export class FitventureScene extends (typeof Phaser !== 'undefined' ? Phaser.Scene : class {}) {
  constructor() {
    super({ key: 'FitventureScene' });
  }

  preload() {
    // Assets are procedurally drawn with Phaser 3 Vector Graphics
    // to ensure crisp 2.5D rendering at any screen density.
  }

  create() {
    // 1. Draw 2.5D Top-Down Orthographic Environment
    // (Soft asphalt road, subtle concrete sidewalk, warm parquet floor, flanking striped umbrellas)
    this.envGraphics = drawEnvironment(this);

    // 2. Initialize Workstations
    // Warm Oak Front Counter with rounded ends and horizontal dual customer slots
    this.counterStation = new CounterStation(this);

    // Crafting Station (Sewing & Cutting Table - tightly positioned for compact layout)
    this.sewingStation = new SewingStation(this);

    // 3. Initialize AI Characters & Queue Manager
    // (Spawns shoppers via crosswalk, procedural waddle animations,
    // horizontal counter slot ordering, waiting queue, tailor and Raymond assistant)
    this.characterManager = new CharacterManager(this, this.sewingStation, this.counterStation);

    // 4. Initialize UI Layers
    // Top Floating Gold Coin Pill (3D depth, count-up punch)
    this.topCoinsPill = new TopCoinsPill(this);

    // Bottom Dock (Chunky 3D Buttons: Renovate, Boost x2, Upgrades)
    this.bottomDock = new BottomDock(this);

    // Station Upgrade Modal: Opens ONLY when clicking directly on the Sewing Station in the world
    this.stationUpgradeModal = new StationUpgradeModal(this);

    // Dedicated Global Upgrades Menu: Opens via Bottom-Right UPGRADES Button
    this.globalUpgradesModal = new GlobalUpgradesModal(this);

    // Stage 2 Renovation Modal: Activates at Sewing Station Level 25+
    this.renovateModal = new RenovateModal(this);

    // Notice & Toast Modal
    this.noticeModal = new NoticeModal(this);

    // 5. Connect Game Events & Economy Loop
    this.events.on('customerPaid', (data) => {
      spawnFloatingCoins(this, data.x, data.y, data.amount, 360, 70);
    });

    console.log('✨ Fitventure: Refactored & Polished to Eatventure Standards!');
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
