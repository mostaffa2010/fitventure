/**
 * Fitventure - Main Game Scene & Bootstrap
 * Orchestrates:
 * 1. World Camera with 1.45x Zoom centered on action (close-up, zero empty floor).
 * 2. Dedicated UI Camera (1.0x overlay for pixel-crisp HUD & modals).
 * 3. Multi-Stage Renovation Lifecycle (Stage 1 Kiosk -> Stage 2 Fashion Van).
 * 4. Dotted Unlockable Workstations (Jeans Station, Hats Rack).
 * 5. Self-Clearing Global Upgrades Menu (12 progressive upgrades).
 */

import { GAME_CONFIG, gameState, phaserConfig, loadGoogleFont } from './config.js';
import { EnvironmentManager } from './environment.js';
import { CharacterManager } from './characters.js';
import { SewingStation, JeansStation, HatsStation, CounterStation, spawnFloatingCoins } from './stations.js';
import {
  TopCoinsPill,
  BottomDock,
  StationUpgradeModal,
  GlobalUpgradesModal,
  UnlockStationModal,
  RenovationTransition,
  Stage2OpenModal,
  NoticeModal
} from './ui.js';

export class FitventureScene extends (typeof Phaser !== 'undefined' ? Phaser.Scene : class {}) {
  constructor() {
    super({ key: 'FitventureScene' });
  }

  create() {
    loadGoogleFont();
    // 1. Root Containers separating World (Zoomed 1.45x) and UI (1.0x screen overlay)
    this.worldContainer = this.add.container(0, 0);
    this.uiContainer = this.add.container(0, 0);

    // 2. Setup Cameras
    // World Camera: 1.45x close-up zoom centered tightly on boutique action
    this.cameras.main.setZoom(GAME_CONFIG.cameraZoom);
    this.cameras.main.centerOn(GAME_CONFIG.cameraCenter.x, GAME_CONFIG.cameraCenter.y);

    // UI Camera: 1:1 screen-space camera for HUD, buttons, and modals
    this.uiCamera = this.cameras.add(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    this.uiCamera.setScroll(0, 0);

    // Tell World Camera to ignore UI container, and UI Camera to ignore World container
    this.cameras.main.ignore(this.uiContainer);
    this.uiCamera.ignore(this.worldContainer);

    // 3. Initialize Environment & Traffic
    this.envManager = new EnvironmentManager(this, this.worldContainer);

    // 4. Initialize Workstations in World Container
    this.counterStation = new CounterStation(this, this.worldContainer);
    this.sewingStation = new SewingStation(this, this.worldContainer);
    this.jeansStation = new JeansStation(this, this.worldContainer);
    this.hatsStation = new HatsStation(this, this.worldContainer);

    this.stationsMap = {
      sewing: this.sewingStation,
      jeans: this.jeansStation,
      hats: this.hatsStation
    };

    // 5. Initialize AI Characters & Queue Manager
    this.characterManager = new CharacterManager(this, this.worldContainer, this.stationsMap, this.counterStation);

    // 6. Initialize UI Layers in UI Container
    this.topCoinsPill = new TopCoinsPill(this, this.uiContainer);
    this.bottomDock = new BottomDock(this, this.uiContainer);
    this.stationUpgradeModal = new StationUpgradeModal(this, this.uiContainer);
    this.globalUpgradesModal = new GlobalUpgradesModal(this, this.uiContainer);
    this.unlockStationModal = new UnlockStationModal(this, this.uiContainer);
    this.renovationTransition = new RenovationTransition(this, this.uiContainer);
    this.stage2OpenModal = new Stage2OpenModal(this, this.uiContainer);
    this.noticeModal = new NoticeModal(this, this.uiContainer);

    // 7. Connect Economy & Currency Effects
    this.events.on('customerPaid', (data) => {
      spawnFloatingCoins(this, data.x, data.y, data.amount, 360, 200);
    });

    console.log('✨ Fitventure: Multi-Stage & Close-Up Viewport Initialized!');
  }

  update(time, delta) {
    const deltaSeconds = delta / 1000;

    gameState.updateBoost(deltaSeconds);

    if (this.characterManager) {
      this.characterManager.update(time, delta);
    }
  }
}

phaserConfig.scene = FitventureScene;

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    window.game = new Phaser.Game(phaserConfig);
  });
}
