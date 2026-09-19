/**
 * Fitventure - Configuration & Global State
 * Perspective: 2.5D Top-Down Orthographic Idle Tycoon
 * Resolution: 720 x 1280 (FIT mode for mobile portrait)
 * Standards: Eatventure polished idle loop & visual depth
 */

export const GAME_CONFIG = {
  width: 720,
  height: 1280,
  backgroundColor: '#1e232a',
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
    bottomDeckY: 1100,
    bottomDeckHeight: 180,

    // Front Serving Counter (Warm Oak with rounded ends)
    counter: {
      x: 360,
      y: 410,
      width: 360,
      height: 86,
      customerStopY: 335,
      workerStopY: 470,
      // Horizontal side-by-side customer ordering slots
      customerSlots: [
        { id: 0, x: 295, y: 335 }, // Slot 1 (Left Register)
        { id: 1, x: 425, y: 335 }  // Slot 2 (Right Register)
      ]
    },

    // Flanking striped patio umbrellas
    umbrellas: {
      left: { x: 125, y: 405 },
      right: { x: 595, y: 405 }
    },

    // Sewing Table Workstation (Tightly positioned near top counter for compact gameplay)
    sewingTable: {
      x: 360,
      y: 585,
      width: 280,
      height: 106,
      worker1StopX: 315,
      worker1StopY: 530,
      worker2StopX: 405,
      worker2StopY: 530,
      workerStopX: 360,
      workerStopY: 530
    },

    // Waiting queue slots lining up neatly behind the counter service area
    // Slot 3 is unlocked with "Flyer Distribution" perk!
    waitingQueue: [
      { x: 360, y: 265 }, // Behind counter slots (Boutique threshold)
      { x: 360, y: 200 }, // On concrete sidewalk
      { x: 360, y: 135 }, // On zebra crosswalk
      { x: 360, y: 70 }   // Upper crosswalk (Unlocked with Flyer perk)
    ]
  },

  // Color Palette (Eatventure clean flat shading with depth)
  colors: {
    // Street & Sidewalk
    asphalt: 0x374151,        // Soft asphalt grey road
    asphaltMarking: 0x4b5563,
    crosswalk: 0xf8fafc,
    sidewalk: 0xe2e8f0,       // Subtle concrete sidewalk
    curb: 0xcfd8dc,
    curbShadow: 0x94a3b8,

    // Boutique Interior Flooring
    boutiqueFloor: 0xfbf8f2,  // Warm parquet base
    boutiquePlank: 0xede4d4,  // Parquet wood grain
    rugBorder: 0xd6c7b2,
    rugFill: 0xf5eedf,

    // Counter (Warm Oak with rounded ends)
    counterWood: 0xb87333,    // Warm oak base
    counterTop: 0xdf9b56,     // Polished honey oak counter surface
    counterTrim: 0x8b5020,    // Fluted decorative vertical wood slats
    counterBevel: 0x7c3a0d,

    // Flanking Striped Umbrellas
    umbrellaBlue: 0x74b9ff,   // Pastel blue canopy wedges
    umbrellaWhite: 0xffffff,  // White canopy wedges
    umbrellaPole: 0x64748b,
    umbrellaBase: 0x334155,

    // Sewing Crafting Station
    sewingTableTop: 0x475569,
    sewingTableBevel: 0x334155,
    sewingMat: 0x10b981,      // Bright self-healing cutting mat

    // Bottom Navigation Deck
    bottomDeckRed: 0x881337,  // Deep brick crimson band
    bottomDeckBevel: 0x9f1239,

    // UI Buttons & 3D Bevels
    greenBtn: 0x22c55e,
    greenBevel: 0x15803d,
    blueBtn: 0x3b82f6,
    blueBevel: 0x1d4ed8,
    goldBtn: 0xf59e0b,
    goldBevel: 0xb45309,
    redBtn: 0xef4444,
    redBevel: 0xb91c1c,
    slateBtn: 0x64748b,
    slateBevel: 0x475569,

    // Currencies & VFX
    coinGold: 0xf1c40f,
    coinGoldDark: 0xd4ac0d,
    shadowDark: 0x000000,

    // Avatars & Characters
    avatarSkin: 0xfbd09d,
    workerCap: 0xef4444,      // Head Tailor red baseball cap
    raymondCap: 0x10b981,     // Raymond emerald assistant cap
    workerShirt: 0x1e293b,
    raymondShirt: 0x0f766e,
    shopperPalette: [
      { shirt: 0xe67e22, hair: 0x4a235a },
      { shirt: 0x0ea5e9, hair: 0x1e293b },
      { shirt: 0x8b5cf6, hair: 0x713f12 },
      { shirt: 0xec4899, hair: 0x831843 },
      { shirt: 0x14b8a6, hair: 0x18181b }
    ]
  }
};

/**
 * Global Store Perks (EXACTLY like Eatventure General Store Upgrades)
 */
export const STORE_PERKS = [
  {
    id: 'hire_raymond',
    title: 'Hire Raymond',
    icon: '👔',
    cost: 100,
    description: '+1 Tailor assistant to craft & deliver orders.'
  },
  {
    id: 'better_sneakers',
    title: 'Better Sneakers',
    icon: '👟',
    cost: 150,
    description: 'Workers walk 30% faster around the boutique.'
  },
  {
    id: 'flyer_distribution',
    title: 'Flyer Distribution',
    icon: '📄',
    cost: 75,
    description: '+1 Customer capacity in queue outside.'
  },
  {
    id: 'premium_fabric',
    title: 'Premium Fabric',
    icon: '✨',
    cost: 200,
    description: 'T-Shirt profit x2 multiplier on every sale.'
  }
];

/**
 * Global Reactive Game State
 */
class GameState {
  constructor() {
    this.coins = 50; // Starter coins for immediate engagement
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
      baseCraftDuration: 2000,
      minCraftDuration: 400,
      speedReductionRate: 0.96
    };

    // Global Store Upgrades
    this.upgrades = {
      hire_raymond: false,
      better_sneakers: false,
      flyer_distribution: false,
      premium_fabric: false
    };

    // Stage 2 Renovation milestone threshold
    this.renovateRequiredLevel = 25;
    this.stage = 1;

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
    let earned = amount;
    if (this.boostActive) {
      earned *= this.boostMultiplier;
    }
    earned = Math.round(earned);
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

  // --- Sewing Station Economics ---
  getSewingUpgradeCost() {
    const { baseCost, costMultiplier, level } = this.sewingStation;
    return Math.floor(baseCost * Math.pow(costMultiplier, level - 1));
  }

  getSewingProfit() {
    const { baseProfit, profitMultiplier, level } = this.sewingStation;
    let base = Math.floor(baseProfit * Math.pow(profitMultiplier, level - 1));

    // Global Perk: Premium Fabric doubles T-shirt profit
    if (this.upgrades.premium_fabric) {
      base *= 2;
    }

    // Temporary 2X Boost
    if (this.boostActive) {
      base *= this.boostMultiplier;
    }

    return Math.max(1, Math.round(base));
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
      const isRenovateReady = this.isRenovateUnlocked();

      this.emit('stationUpgraded', {
        station: 'sewing',
        level: this.sewingStation.level,
        profit: this.getSewingProfit(),
        duration: this.getSewingCraftDuration(),
        nextCost: this.getSewingUpgradeCost(),
        renovateReady: isRenovateReady
      });

      if (this.sewingStation.level === this.renovateRequiredLevel) {
        this.emit('renovateUnlocked', { level: this.sewingStation.level });
      }

      return true;
    }
    return false;
  }

  // --- Renovate Mechanics ---
  isRenovateUnlocked() {
    return this.sewingStation.level >= this.renovateRequiredLevel;
  }

  // --- Global Perks Mechanics ---
  isPerkPurchased(perkId) {
    return !!this.upgrades[perkId];
  }

  canBuyPerk(perkId) {
    const perk = STORE_PERKS.find(p => p.id === perkId);
    if (!perk) return false;
    return !this.upgrades[perkId] && this.coins >= perk.cost;
  }

  buyPerk(perkId) {
    const perk = STORE_PERKS.find(p => p.id === perkId);
    if (!perk) return false;
    if (this.canBuyPerk(perkId)) {
      if (this.spendCoins(perk.cost)) {
        this.upgrades[perkId] = true;
        this.emit('perkPurchased', { id: perkId, perk });
        return true;
      }
    }
    return false;
  }

  getWorkerSpeedMultiplier() {
    return this.upgrades.better_sneakers ? 1.3 : 1.0;
  }

  getMaxQueueCapacity() {
    return this.upgrades.flyer_distribution ? 4 : 3;
  }

  // --- 2X Boost Multiplier ---
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
  type: typeof Phaser !== 'undefined' ? Phaser.AUTO : 'AUTO',
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: 'game-container',
  backgroundColor: GAME_CONFIG.backgroundColor,
  scale: {
    mode: typeof Phaser !== 'undefined' ? Phaser.Scale.FIT : 3,
    autoCenter: typeof Phaser !== 'undefined' ? Phaser.Scale.CENTER_BOTH : 1
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};
