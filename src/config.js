/**
 * Fitventure - Three.js Configuration & Game State
 * Perspective: Low-Poly 3D Isometric Top-Down (Eatventure Fidelity)
 * Tech Stack: Three.js r128 + HTML5/CSS3 UI Overlay
 */

export const GAME_CONFIG = {
  // 3D Orthographic Camera Settings (Eatventure Signature Top-Down Angle)
  camera: {
    position: { x: 0, y: 32, z: 24 },
    lookAt: { x: 0, y: 0, z: 1 },
    frustumSize: 22
  },

  // Balanced Warm Lighting (No Glare, Saturated Pastel Tones)
  lighting: {
    ambientColor: 0xfffaed,
    ambientIntensity: 0.65,
    sunColor: 0xfff8ee,
    sunIntensity: 0.80, // Calibrated down from 0.95 to eliminate harsh glare
    sunPosition: { x: 14, y: 30, z: 18 },
    hemiSky: 0xe0f2fe,
    hemiGround: 0x5fa84b, // Warm green bounce from surrounding grass
    hemiIntensity: 0.40
  },

  // World 3D Layout Coordinates (X: left/right, Y: up/down, Z: depth)
  layout: {
    // Street (Z: -18 to -6)
    streetZ: -10.5,
    streetWidth: 40,
    streetDepth: 11,
    crosswalkX: 0,

    // Sidewalk & Service Area
    sidewalkZ: -3.8,
    sidewalkDepth: 3.4,

    // Front Serving Counter (Z: 0)
    counter: {
      x: 0,
      y: 0.8,
      z: 0,
      width: 7.6,
      height: 1.6,
      depth: 1.8,
      customerSlots: [
        { id: 0, x: -1.8, z: -1.5 },
        { id: 1, x: 1.8, z: -1.5 }
      ],
      workerServiceSpot: { x: 0, z: 1.4 }
    },

    // Inward-Framing Striped Umbrellas
    umbrellas: {
      left: { x: -5.2, z: 0.2 },
      right: { x: 5.2, z: 0.2 }
    },

    // Workstation 1: Sewing Table (T-Shirts)
    station1: {
      id: 'sewing',
      name: 'Sewing Table',
      product: 'tshirt',
      icon: '👕',
      x: -2.3,
      y: 0.8,
      z: 3.8,
      width: 3.6,
      height: 1.6,
      depth: 2.2,
      workerCraftSpot: { x: -2.3, z: 2.3 }
    },

    // Workstation 2: Jeans Table (Stage 2 Unlockable - Cost: 50)
    station2: {
      id: 'jeans',
      name: 'Jeans Station',
      product: 'jeans',
      icon: '👖',
      x: 2.3,
      y: 0.8,
      z: 3.8,
      width: 3.6,
      height: 1.6,
      depth: 2.2,
      unlockCost: 50,
      workerCraftSpot: { x: 2.3, z: 2.3 }
    },

    // Workstation 3: Hats Rack (Stage 2 Unlockable - Cost: 100)
    station3: {
      id: 'hats',
      name: 'Hats Rack',
      product: 'hat',
      icon: '🧢',
      x: 0,
      y: 0.8,
      z: 6.8,
      width: 3.2,
      height: 1.6,
      depth: 2.0,
      unlockCost: 100,
      workerCraftSpot: { x: 0, z: 5.3 }
    },

    // Waiting Queue (Z: -2.8 to -11)
    waitingQueue: [
      { x: 0, z: -2.8 },
      { x: 0, z: -4.5 },
      { x: 0, z: -6.5 },
      { x: 0, z: -8.5 },
      { x: 0, z: -10.5 }
    ]
  },

  // Color Palette (Calibrated Eatventure Aesthetic)
  colors: {
    asphalt: 0x374151,
    asphaltMarking: 0x475569,
    crosswalk: 0xf8fafc,
    sidewalk: 0xd9dfdf, // Soft warm concrete tone
    sidewalkTile: 0xc8d0d0, // Subtle paving grid lines
    curb: 0xbac3c3,
    grassBorder: 0x5fa84b, // Rich green nature borders
    treeTrunk: 0x78350f,
    treeFoliage: 0x48bb78,
    bushGreen: 0x38a169,
    vanBody: 0x0d9488,
    vanRoof: 0x14b8a6,
    vanTrim: 0x0f766e,
    vanFloor: 0xd9dfdf,
    counterWood: 0xb87333, // Warm caramel oak
    counterTop: 0xc68642,
    counterTrim: 0x9a5b23,
    registerSilver: 0x94a3b8,
    tableCaramel: 0xb87333,
    tableHoney: 0xdf8d3c,
    umbrellaBlue: 0x0284c7,
    umbrellaWhite: 0xffffff,
    denimBlue: 0x1e3a8a,
    avatarSkin: 0xfbd09d,
    workerCap: 0xef4444,
    raymondCap: 0x10b981,
    lucasCap: 0x8b5cf6,
    coinGold: 0xf59e0b,
    shopperPalette: [
      { shirt: 0xef4444, hair: 0x1e293b },
      { shirt: 0x3b82f6, hair: 0x78350f },
      { shirt: 0x10b981, hair: 0xd97706 },
      { shirt: 0xf59e0b, hair: 0x475569 },
      { shirt: 0x8b5cf6, hair: 0x1e293b },
      { shirt: 0xec4899, hair: 0xb45309 },
      { shirt: 0x06b6d4, hair: 0x0f172a }
    ]
  }
};

/**
 * 12 Sequential Store Upgrades
 * Self-Clearing: Upgrades disappear immediately upon purchase!
 */
export const STORE_UPGRADES = [
  {
    id: 'hire_raymond',
    stage: 1,
    title: 'Hire Tailor Raymond',
    icon: '👔',
    cost: 100,
    description: '+1 Worker: Assistant tailor crafts & delivers garments.'
  },
  {
    id: 'swift_scissors',
    stage: 1,
    title: 'Swift Scissors',
    icon: '✂️',
    cost: 120,
    description: 'Sewing 20% faster at all crafting tables.'
  },
  {
    id: 'comfy_sneakers',
    stage: 1,
    title: 'Comfy Sneakers',
    icon: '👟',
    cost: 150,
    description: 'Workers walk 30% faster around the boutique.'
  },
  {
    id: 'store_flyers',
    stage: 1,
    title: 'Store Flyers',
    icon: '📄',
    cost: 180,
    description: '+1 Customer waiting capacity in the queue.'
  },
  {
    id: 'organic_cotton',
    stage: 1,
    title: 'Organic Cotton',
    icon: '🌱',
    cost: 220,
    description: 'T-Shirt profit x2 multiplier on every sale.'
  },
  {
    id: 'hire_cashier_emma',
    stage: 2,
    title: 'Hire Cashier Emma',
    icon: '💁‍♀️',
    cost: 300,
    description: '+1 Counter worker: Instantly bags orders and speeds checkout.'
  },
  {
    id: 'social_media_ad',
    stage: 2,
    title: 'Social Media Ad',
    icon: '📱',
    cost: 380,
    description: '+2 Customers in queue to boost boutique foot traffic.'
  },
  {
    id: 'electric_sewing',
    stage: 2,
    title: 'Electric Sewing Machine',
    icon: '⚡',
    cost: 480,
    description: 'Sewing 40% faster with modern high-speed motors.'
  },
  {
    id: 'denim_import',
    stage: 2,
    title: 'Denim Import',
    icon: '👖',
    cost: 600,
    description: 'Jeans profit x2 multiplier on every pair sold.'
  },
  {
    id: 'running_shoes',
    stage: 2,
    title: 'Running Shoes',
    icon: '🏃',
    cost: 800,
    description: 'Workers sprint 50% faster between stations.'
  },
  {
    id: 'master_tailor',
    stage: 2,
    title: 'Master Tailor Lucas',
    icon: '🎩',
    cost: 1100,
    description: '+1 Fast Worker: Veteran tailor who crafts 25% faster.'
  },
  {
    id: 'designer_label',
    stage: 2,
    title: 'Designer Label',
    icon: '💎',
    cost: 1500,
    description: 'All profits x3 multiplier across all boutique stations!'
  }
];

/**
 * Global Reactive Game State
 */
class GameState {
  constructor() {
    this.coins = 60;
    this.stage = 1;
    this.boostActive = false;
    this.boostMultiplier = 2;
    this.boostDuration = 30;
    this.boostTimer = 0;

    // Stage 1 Cap: Exactly Level 25
    this.sewingStation = {
      level: 1,
      maxLevel: 25,
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
    if (this.boostActive) earned *= this.boostMultiplier;
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
    return STORE_UPGRADES.filter(u => {
      if (this.isUpgradePurchased(u.id)) return false;
      if (this.stage === 1) return u.stage === 1;
      return true;
    });
  }

  areStage1UpgradesComplete() {
    const stage1Upgrades = STORE_UPGRADES.filter(u => u.stage === 1);
    return stage1Upgrades.every(u => this.isUpgradePurchased(u.id));
  }

  isRenovateUnlocked() {
    if (this.stage >= 2) return false;
    return this.sewingStation.level >= this.renovateRequiredLevel && this.areStage1UpgradesComplete();
  }

  renovateToStage2() {
    this.stage = 2;
    this.sewingStation.maxLevel = 50;
    this.addCoins(100);
    this.emit('stageRenovated', { stage: 2 });
  }

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
    if (this.stage === 1 && this.sewingStation.level >= 25) return false;
    return this.sewingStation.level < this.sewingStation.maxLevel &&
           this.coins >= this.getSewingUpgradeCost();
  }

  upgradeSewing() {
    if (!this.canUpgradeSewing()) return false;
    const cost = this.getSewingUpgradeCost();
    if (this.spendCoins(cost)) {
      this.sewingStation.level++;
      this.emit('stationUpgraded', {
        station: 'sewing',
        level: this.sewingStation.level,
        maxLevel: this.sewingStation.maxLevel,
        profit: this.getSewingProfit(),
        duration: this.getSewingCraftDuration(),
        nextCost: this.getSewingUpgradeCost(),
        renovateReady: this.isRenovateUnlocked()
      });
      return true;
    }
    return false;
  }

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
