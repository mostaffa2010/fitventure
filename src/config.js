/**
 * Fitventure - Configuration & Global State
 * Perspective: 2.5D Top-Down Orthographic Idle Tycoon
 * Resolution: 720 x 1280 (FIT mode for mobile portrait)
 */

export const GAME_CONFIG = {
  width: 720,
  height: 1280,
  backgroundColor: '#272b30',
  fps: 60,
  
  // World Layout Coordinates (Eatventure Top-Down Orthographic Proportions)
  layout: {
    streetY: 0,
    streetHeight: 180,
    crosswalkX: 360,
    crosswalkY: 90,
    sidewalkY: 180,
    sidewalkHeight: 80,
    boutiqueY: 260,
    boutiqueHeight: 840,
    awningY: 240,
    bottomDeckY: 1100,
    bottomDeckHeight: 180,

    // Station Coordinates
    counter: {
      x: 360,
      y: 430,
      width: 340,
      height: 86,
      customerStopY: 355,
      workerStopY: 495,
      // Horizontal side-by-side customer slots
      customerSlots: [
        { id: 0, x: 300, y: 355 }, // Slot 1
        { id: 1, x: 420, y: 355 }  // Slot 2
      ]
    },

    // Sewing Table: Moved closer to counter (y: 640 instead of 860) to tighten worker loop
    sewingTable: {
      x: 360,
      y: 640,
      width: 260,
      height: 110,
      workerStopX: 360,
      workerStopY: 570
    },

    // Zone 2 Station Placeholder: Designer Jeans & Hats Station
    zone2: {
      x: 360,
      y: 890,
      width: 280,
      height: 120,
      unlockCost: 100,
      workerStopX: 360,
      workerStopY: 820
    },

    // Waiting queue slots lining up neatly behind the counter service area
    waitingQueue: [
      { x: 360, y: 275 }, // Behind counter slots
      { x: 360, y: 205 }, // On sidewalk
      { x: 360, y: 135 }  // On crosswalk
    ]
  },

  // Color Palette (Eatventure clean flat shading with depth)
  colors: {
    asphalt: 0x33373d,
    crosswalk: 0xf5f6fa,
    sidewalk: 0xdcdde1,
    curb: 0xb2bec3,
    boutiqueFloor: 0xf9f7f1,
    boutiqueFloorWood: 0xdeb887,
    awningYellow: 0xfbc531,
    awningWhite: 0xf5f6fa,
    awningShadow: 0x222f3e,
    hedgeGreen: 0x44bd32,
    hedgeGreenDark: 0x27ae60,
    bottomDeckRed: 0x962d2d,
    counterWood: 0xa0522d,
    counterTop: 0xd27d2d,
    counterTrim: 0x8b4513,
    sewingTableTop: 0x57606f,
    sewingMat: 0x2ed573,
    coinGold: 0xf1c40f,
    coinGoldDark: 0xd4ac0d,
    uiBlue: 0x3498db,
    uiBlueDark: 0x2980b9,
    uiGreen: 0x2ecc71,
    uiGreenDark: 0x27ae60,
    uiCardBg: 0xffffff,
    shadowColor: 0x000000,
    avatarSkin: 0xf6d397,
    workerCap: 0xe74c3c,
    workerShirt: 0x34495e,
    shopperPalette: [
      { shirt: 0xe67e22, hair: 0x4a235a },
      { shirt: 0x1abc9c, hair: 0x2c3e50 },
      { shirt: 0x9b59b6, hair: 0x6e2c00 },
      { shirt: 0x3498db, hair: 0x17202a },
      { shirt: 0xe84393, hair: 0x78281f }
    ]
  }
};

/**
 * Global Reactive Game State
 */
class GameState {
  constructor() {
    this.coins = 25; // Initial starter pocket coins
    this.boostActive = false;
    this.boostMultiplier = 2;
    this.boostDuration = 30; // seconds
    this.boostTimer = 0;
    
    // Sewing Station progression
    this.sewingStation = {
      level: 1,
      maxLevel: 50,
      baseCost: 10,
      costMultiplier: 1.18,
      baseProfit: 4,
      profitMultiplier: 1.15,
      baseCraftDuration: 2200, // snappier loop
      minCraftDuration: 500,
      speedReductionRate: 0.96
    };

    // Zone 2 (Jeans & Hats Station) progression
    this.zone2Station = {
      unlocked: false,
      cost: GAME_CONFIG.layout.zone2.unlockCost,
      level: 1,
      maxLevel: 50,
      baseCost: 80,
      costMultiplier: 1.20,
      baseProfit: 16,
      profitMultiplier: 1.16,
      baseCraftDuration: 3000,
      minCraftDuration: 700,
      speedReductionRate: 0.95
    };

    // Event listeners
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }

  addCoins(amount) {
    const earned = Math.round(amount * (this.boostActive ? this.boostMultiplier : 1));
    this.coins += earned;
    this.emit('coinsChanged', { coins: this.coins, added: earned });
    return earned;
  }

  spendCoins(amount) {
    if (this.coins >= amount) {
      this.coins -= amount;
      this.emit('coinsChanged', { coins: this.coins, spent: amount });
      return true;
    }
    return false;
  }

  getSewingUpgradeCost() {
    const { baseCost, costMultiplier, level } = this.sewingStation;
    return Math.floor(baseCost * Math.pow(costMultiplier, level - 1));
  }

  getSewingProfit() {
    const { baseProfit, profitMultiplier, level } = this.sewingStation;
    const base = Math.floor(baseProfit * Math.pow(profitMultiplier, level - 1));
    return this.boostActive ? base * this.boostMultiplier : base;
  }

  getSewingCraftDuration() {
    const { baseCraftDuration, speedReductionRate, minCraftDuration, level } = this.sewingStation;
    const duration = Math.floor(baseCraftDuration * Math.pow(speedReductionRate, level - 1));
    return Math.max(minCraftDuration, duration);
  }

  canUpgradeSewing() {
    return this.sewingStation.level < this.sewingStation.maxLevel && 
           this.coins >= this.getSewingUpgradeCost();
  }

  upgradeSewing() {
    const cost = this.getSewingUpgradeCost();
    if (this.spendCoins(cost)) {
      this.sewingStation.level++;
      this.emit('stationUpgraded', {
        station: 'sewing',
        level: this.sewingStation.level,
        profit: this.getSewingProfit(),
        duration: this.getSewingCraftDuration(),
        nextCost: this.getSewingUpgradeCost()
      });
      return true;
    }
    return false;
  }

  // Zone 2 Methods
  canUnlockZone2() {
    return !this.zone2Station.unlocked && this.coins >= this.zone2Station.cost;
  }

  unlockZone2() {
    if (this.canUnlockZone2()) {
      if (this.spendCoins(this.zone2Station.cost)) {
        this.zone2Station.unlocked = true;
        this.emit('zone2Unlocked', {
          station: 'zone2',
          level: this.zone2Station.level,
          profit: this.getZone2Profit()
        });
        return true;
      }
    }
    return false;
  }

  getZone2Profit() {
    const { baseProfit, profitMultiplier, level } = this.zone2Station;
    const base = Math.floor(baseProfit * Math.pow(profitMultiplier, level - 1));
    return this.boostActive ? base * this.boostMultiplier : base;
  }

  activateBoost(duration = 30) {
    this.boostActive = true;
    this.boostTimer = duration;
    this.emit('boostChanged', { active: true, duration: this.boostTimer });
  }

  updateBoost(deltaSeconds) {
    if (this.boostActive) {
      this.boostTimer -= deltaSeconds;
      if (this.boostTimer <= 0) {
        this.boostActive = false;
        this.boostTimer = 0;
        this.emit('boostChanged', { active: false, duration: 0 });
      } else {
        this.emit('boostTick', { duration: Math.ceil(this.boostTimer) });
      }
    }
  }

  formatCoins(num) {
    if (num < 1000) return `${Math.floor(num)}`;
    if (num < 1000000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    return `${(num / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
  }
}

export const gameState = new GameState();

export const phaserConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.backgroundColor,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};
