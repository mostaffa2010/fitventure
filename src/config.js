/**
 * Fitventure - Configuration & Global State
 * Perspective: 2.5D Top-Down Orthographic Idle Tycoon
 * Resolution: 720 x 1280 (Mobile Portrait)
 * Camera Zoom: 1.45x close-up view to eliminate empty space and maximize tactile readability.
 */

export const GAME_CONFIG = {
  width: 720,
  height: 1280,
  cameraZoom: 1.45,
  cameraCenter: { x: 360, y: 490 },
  backgroundColor: '#1a1d24',
  fps: 60,

  // World Layout Coordinates
  layout: {
    // Street (Driving Cars & Zebra Crossing)
    streetY: 0,
    streetHeight: 180,
    crosswalkX: 360,
    crosswalkY: 90,

    // Sidewalk & Queue
    sidewalkY: 180,
    sidewalkHeight: 70,

    // Front Serving Counter
    counter: {
      x: 360,
      y: 365,
      width: 330,
      height: 76,
      customerStopY: 300,
      workerStopY: 418,
      customerSlots: [
        { id: 0, x: 300, y: 300 }, // Slot 1 (Left Register)
        { id: 1, x: 420, y: 300 }  // Slot 2 (Right Register)
      ]
    },

    // Patio Umbrellas (Stage 1 Flanking)
    umbrellas: {
      left: { x: 135, y: 360 },
      right: { x: 585, y: 360 }
    },

    // Workstation Slots
    // Station 1: Sewing Table (T-Shirts) - Active initially
    station1: {
      id: 'sewing',
      name: 'Sewing Table',
      product: 'tshirt',
      icon: '👕',
      x: 275,
      y: 505,
      width: 175,
      height: 92,
      workerStopX: 275,
      workerStopY: 460
    },

    // Station 2: Jeans Table - Dotted outline in Stage 2 (Cost: 50)
    station2: {
      id: 'jeans',
      name: 'Jeans Station',
      product: 'jeans',
      icon: '👖',
      x: 445,
      y: 505,
      width: 175,
      height: 92,
      unlockCost: 50,
      workerStopX: 445,
      workerStopY: 460
    },

    // Station 3: Hats Rack - Dotted outline in Stage 2 after Station 2 (Cost: 100)
    station3: {
      id: 'hats',
      name: 'Hats Rack',
      product: 'hat',
      icon: '🧢',
      x: 360,
      y: 630,
      width: 170,
      height: 86,
      unlockCost: 100,
      workerStopX: 360,
      workerStopY: 585
    },

    // Waiting queue slots (Pedestrians lining up on sidewalk & crosswalk)
    waitingQueue: [
      { x: 360, y: 240 }, // Threshold
      { x: 360, y: 185 }, // Sidewalk
      { x: 360, y: 130 }, // Zebra crosswalk
      { x: 360, y: 80 },  // Mid street
      { x: 360, y: 35 }   // Upper crosswalk (Flyer / Ad unlocked)
    ]
  },

  // Color Palette
  colors: {
    asphalt: 0x333b47,
    asphaltMarking: 0x475569,
    crosswalk: 0xf8fafc,
    sidewalk: 0xe2e8f0,
    curb: 0xcfd8dc,

    // Stage 1 Boutique Kiosk
    boutiqueFloor: 0xfbf8f2,
    boutiquePlank: 0xede4d4,
    awningYellow: 0xf59e0b,
    awningWhite: 0xf8fafc,

    // Stage 2 Fashion Van
    vanBody: 0x0d9488,       // Retro teal / mint food truck
    vanRoof: 0x14b8a6,
    vanTrim: 0x0f766e,
    vanFloor: 0xe5d5be,      // Interior wood parquet
    vanChrome: 0xe2e8f0,

    // Counters & Woodwork
    counterWood: 0xb87333,
    counterTop: 0xdf9b56,
    counterTrim: 0x8b5020,
    counterBevel: 0x7c3a0d,

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
    bottomDeckBg: 0x881337,

    // Currencies & FX
    coinGold: 0xf59e0b,
    coinGoldLight: 0xfbbf24,
    shadowDark: 0x000000,

    // Avatars
    avatarSkin: 0xfbd09d,
    workerCap: 0xef4444,
    raymondCap: 0x10b981,
    lucasCap: 0x8b5cf6,
    emmaHair: 0xf59e0b,
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
 * 12 Sequential Store Upgrades (Eatventure General Store Progression)
 * Upgrades disappear immediately once purchased to keep the UI clean!
 */
export const STORE_UPGRADES = [
  {
    id: 'hire_raymond',
    stage: 1,
    title: 'Hire Tailor Raymond',
    icon: '👔',
    cost: 100,
    description: '+1 Worker: Assistant tailor crafts and delivers garments.',
    effect: 'worker'
  },
  {
    id: 'swift_scissors',
    stage: 1,
    title: 'Swift Scissors',
    icon: '✂️',
    cost: 120,
    description: 'Sewing 20% faster at all crafting tables.',
    effect: 'speed_craft'
  },
  {
    id: 'comfy_sneakers',
    stage: 1,
    title: 'Comfy Sneakers',
    icon: '👟',
    cost: 150,
    description: 'Workers walk 30% faster around the boutique.',
    effect: 'speed_walk'
  },
  {
    id: 'store_flyers',
    stage: 1,
    title: 'Store Flyers',
    icon: '📄',
    cost: 180,
    description: '+1 Customer waiting capacity in the queue.',
    effect: 'queue'
  },
  {
    id: 'organic_cotton',
    stage: 1,
    title: 'Organic Cotton',
    icon: '🌱',
    cost: 220,
    description: 'T-Shirt profit x2 multiplier on every sale.',
    effect: 'profit_tshirt'
  },
  {
    id: 'hire_cashier_emma',
    stage: 2,
    title: 'Hire Cashier Emma',
    icon: '💁‍♀️',
    cost: 300,
    description: '+1 Counter worker: Instantly bags orders and speeds checkout.',
    effect: 'cashier'
  },
  {
    id: 'social_media_ad',
    stage: 2,
    title: 'Social Media Ad',
    icon: '📱',
    cost: 380,
    description: '+2 Customers in queue to boost boutique foot traffic.',
    effect: 'queue_large'
  },
  {
    id: 'electric_sewing',
    stage: 2,
    title: 'Electric Sewing Machine',
    icon: '⚡',
    cost: 480,
    description: 'Sewing 40% faster with modern high-speed motors.',
    effect: 'speed_craft_electric'
  },
  {
    id: 'denim_import',
    stage: 2,
    title: 'Denim Import',
    icon: '👖',
    cost: 600,
    description: 'Jeans profit x2 multiplier on every pair sold.',
    effect: 'profit_jeans'
  },
  {
    id: 'running_shoes',
    stage: 2,
    title: 'Running Shoes',
    icon: '🏃',
    cost: 800,
    description: 'Workers sprint 50% faster between stations.',
    effect: 'speed_sprint'
  },
  {
    id: 'master_tailor',
    stage: 2,
    title: 'Master Tailor Lucas',
    icon: '🎩',
    cost: 1100,
    description: '+1 Fast Worker: Veteran tailor who crafts 25% faster.',
    effect: 'fast_worker'
  },
  {
    id: 'designer_label',
    stage: 2,
    title: 'Designer Label',
    icon: '💎',
    cost: 1500,
    description: 'All profits x3 multiplier across all boutique stations!',
    effect: 'profit_all'
  }
];

/**
 * Global Reactive Game State
 */
class GameState {
  constructor() {
    this.coins = 60; // Initial starter pocket coins
    this.stage = 1;  // Stage 1: Sidewalk Kiosk, Stage 2: Fashion Van
    this.boostActive = false;
    this.boostMultiplier = 2;
    this.boostDuration = 30;
    this.boostTimer = 0;

    // Station 1: Sewing Table (T-Shirts)
    this.sewingStation = {
      level: 1,
      maxLevel: 50,
      baseCost: 10,
      costMultiplier: 1.18,
      baseProfit: 4,
      profitMultiplier: 1.15,
      baseCraftDuration: 1800,
      minCraftDuration: 300,
      speedReductionRate: 0.96
    };

    // Stage 2 Station 2: Jeans Table
    this.jeansStation = {
      unlocked: false,
      level: 1,
      maxLevel: 50,
      baseCost: 25,
      costMultiplier: 1.18,
      baseProfit: 12,
      profitMultiplier: 1.15,
      baseCraftDuration: 2200,
      minCraftDuration: 400,
      speedReductionRate: 0.96
    };

    // Stage 2 Station 3: Hats Rack
    this.hatsStation = {
      unlocked: false,
      level: 1,
      maxLevel: 50,
      baseCost: 50,
      costMultiplier: 1.18,
      baseProfit: 22,
      profitMultiplier: 1.15,
      baseCraftDuration: 2500,
      minCraftDuration: 450,
      speedReductionRate: 0.96
    };

    // Purchased upgrades IDs set
    this.purchasedUpgrades = new Set();

    this.renovateRequiredLevel = 25;
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

  // --- Upgrade Economics ---
  isUpgradePurchased(upgradeId) {
    return this.purchasedUpgrades.has(upgradeId);
  }

  canBuyUpgrade(upgradeId) {
    const upg = STORE_UPGRADES.find(u => u.id === upgradeId);
    if (!upg) return false;
    if (this.isUpgradePurchased(upgradeId)) return false;
    return this.coins >= upg.cost;
  }

  buyUpgrade(upgradeId) {
    const upg = STORE_UPGRADES.find(u => u.id === upgradeId);
    if (!upg) return false;
    if (this.canBuyUpgrade(upgradeId)) {
      if (this.spendCoins(upg.cost)) {
        this.purchasedUpgrades.add(upgradeId);
        this.emit('upgradePurchased', { id: upgradeId, upgrade: upg });
        this.emit('upgradesListChanged');
        return true;
      }
    }
    return false;
  }

  getAvailableUpgrades() {
    // Only return upgrades matching current stage or general, and not yet purchased
    return STORE_UPGRADES.filter(u => {
      if (this.isUpgradePurchased(u.id)) return false;
      // In stage 1, show stage 1 upgrades. In stage 2, show all remaining upgrades.
      if (this.stage === 1) return u.stage === 1;
      return true;
    });
  }

  areStage1UpgradesComplete() {
    const stage1Upgrades = STORE_UPGRADES.filter(u => u.stage === 1);
    return stage1Upgrades.every(u => this.isUpgradePurchased(u.id));
  }

  // --- Renovation Lifecycle Check ---
  isRenovateUnlocked() {
    if (this.stage >= 2) return false;
    return this.sewingStation.level >= this.renovateRequiredLevel && this.areStage1UpgradesComplete();
  }

  renovateToStage2() {
    this.stage = 2;
    // Keep coins or give stage bonus
    this.addCoins(100);
    this.emit('stageRenovated', { stage: 2 });
  }

  // --- Station 1 (Sewing Table / T-Shirts) ---
  getSewingUpgradeCost() {
    const { baseCost, costMultiplier, level } = this.sewingStation;
    return Math.floor(baseCost * Math.pow(costMultiplier, level - 1));
  }

  getSewingProfit() {
    const { baseProfit, profitMultiplier, level } = this.sewingStation;
    let base = Math.floor(baseProfit * Math.pow(profitMultiplier, level - 1));

    if (this.isUpgradePurchased('organic_cotton')) base *= 2;
    if (this.isUpgradePurchased('designer_label')) base *= 3;
    if (this.boostActive) base *= this.boostMultiplier;

    return Math.max(1, Math.round(base));
  }

  getSewingCraftDuration() {
    const { baseCraftDuration, speedReductionRate, minCraftDuration, level } = this.sewingStation;
    let duration = Math.floor(baseCraftDuration * Math.pow(speedReductionRate, level - 1));

    if (this.isUpgradePurchased('swift_scissors')) duration *= 0.80;
    if (this.isUpgradePurchased('electric_sewing')) duration *= 0.60;

    return Math.max(minCraftDuration, Math.round(duration));
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
        nextCost: this.getSewingUpgradeCost(),
        renovateReady: this.isRenovateUnlocked()
      });
      return true;
    }
    return false;
  }

  // --- Station 2 (Jeans Table) ---
  unlockJeansStation() {
    const cost = GAME_CONFIG.layout.station2.unlockCost;
    if (!this.jeansStation.unlocked && this.spendCoins(cost)) {
      this.jeansStation.unlocked = true;
      this.emit('stationUnlocked', { station: 'jeans' });
      return true;
    }
    return false;
  }

  getJeansProfit() {
    const { baseProfit, profitMultiplier, level } = this.jeansStation;
    let base = Math.floor(baseProfit * Math.pow(profitMultiplier, level - 1));

    if (this.isUpgradePurchased('denim_import')) base *= 2;
    if (this.isUpgradePurchased('designer_label')) base *= 3;
    if (this.boostActive) base *= this.boostMultiplier;

    return Math.max(1, Math.round(base));
  }

  getJeansCraftDuration() {
    let duration = this.jeansStation.baseCraftDuration;
    if (this.isUpgradePurchased('swift_scissors')) duration *= 0.80;
    if (this.isUpgradePurchased('electric_sewing')) duration *= 0.60;
    return Math.max(this.jeansStation.minCraftDuration, Math.round(duration));
  }

  // --- Station 3 (Hats Rack) ---
  unlockHatsStation() {
    const cost = GAME_CONFIG.layout.station3.unlockCost;
    if (!this.hatsStation.unlocked && this.spendCoins(cost)) {
      this.hatsStation.unlocked = true;
      this.emit('stationUnlocked', { station: 'hats' });
      return true;
    }
    return false;
  }

  getHatsProfit() {
    const { baseProfit, profitMultiplier, level } = this.hatsStation;
    let base = Math.floor(baseProfit * Math.pow(profitMultiplier, level - 1));

    if (this.isUpgradePurchased('designer_label')) base *= 3;
    if (this.boostActive) base *= this.boostMultiplier;

    return Math.max(1, Math.round(base));
  }

  getHatsCraftDuration() {
    let duration = this.hatsStation.baseCraftDuration;
    if (this.isUpgradePurchased('swift_scissors')) duration *= 0.80;
    return Math.max(this.hatsStation.minCraftDuration, Math.round(duration));
  }

  // --- Worker Speed & Movement ---
  getWorkerSpeedMultiplier() {
    let mult = 1.0;
    if (this.isUpgradePurchased('comfy_sneakers')) mult += 0.30;
    if (this.isUpgradePurchased('running_shoes')) mult += 0.50;
    return mult;
  }

  getMaxQueueCapacity() {
    let cap = 3;
    if (this.isUpgradePurchased('store_flyers')) cap += 1;
    if (this.isUpgradePurchased('social_media_ad')) cap += 2;
    return Math.min(5, cap);
  }

  hasCashierEmma() {
    return this.isUpgradePurchased('hire_cashier_emma');
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
