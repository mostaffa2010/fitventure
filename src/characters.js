/**
 * Fitventure - Characters & AI Manager
 * Avatars with 2.5D translucent dark oval drop shadows,
 * Master Tailor, Raymond assistant, Cashier Emma, Lucas fast worker,
 * Shoppers ordering T-shirts, Jeans, and Hats, procedural waddle animations.
 */

import { GAME_CONFIG, FONT_FAMILY, gameState } from './config.js';
import { RadialGauge } from './stations.js';

/**
 * Procedural 2.5D Cylindrical Avatar Generator with 2.5D Drop Shadows
 */
export function createAvatarContainer(scene, { isWorker = false, role = 'shopper', colorScheme = null }) {
  const container = scene.add.container(0, 0);

  // 1. Soft Translucent Dark Oval 2.5D Drop Shadow directly under feet
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.25);
  shadow.fillEllipse(0, 22, 38, 14);
  container.add(shadow);
  container.shadow = shadow;

  // 2. Avatar Visual Container (Wobble, squash, stretch, bounce)
  const bodyVisual = scene.add.container(0, 0);
  container.add(bodyVisual);
  container.bodyVisual = bodyVisual;

  const g = scene.add.graphics();
  bodyVisual.add(g);

  // 3. Shoes / Sneakers
  const hasSneakers = isWorker && (gameState.isUpgradePurchased('comfy_sneakers') || gameState.isUpgradePurchased('running_shoes'));
  if (hasSneakers) {
    g.fillStyle(0xffffff, 1.0);
    g.fillRoundedRect(-13, 18, 10, 6, 2);
    g.fillRoundedRect(3, 18, 10, 6, 2);
    g.fillStyle(0xef4444, 1.0);
    g.fillRoundedRect(-12, 15, 8, 6, 2);
    g.fillRoundedRect(4, 15, 8, 6, 2);
  } else {
    g.fillStyle(0x1e293b, 1.0);
    g.fillRoundedRect(-12, 16, 9, 7, 2);
    g.fillRoundedRect(3, 16, 9, 7, 2);
  }

  // 4. Cylindrical Body / Torso
  let shirtColor = 0x3b82f6;
  if (isWorker) {
    if (role === 'tailor') shirtColor = 0x1e293b;
    else if (role === 'raymond') shirtColor = 0x0f766e;
    else if (role === 'lucas') shirtColor = 0x581c87;
    else if (role === 'emma') shirtColor = 0xbe185d;
  } else {
    shirtColor = colorScheme ? colorScheme.shirt : 0x3b82f6;
  }

  // Torso base
  g.fillStyle(shirtColor, 1.0);
  g.fillRoundedRect(-14, -5, 28, 25, 5);

  if (isWorker) {
    // Tailor Apron
    g.fillStyle(0xf8fafc, 1.0);
    g.fillRoundedRect(-10, -1, 20, 21, 3);

    if (role === 'tailor' || role === 'lucas') {
      // Measuring tape
      g.fillStyle(0xf59e0b, 1.0);
      g.fillRect(-8, 3, 16, 3);
      // Apron shears
      g.fillStyle(0x94a3b8, 1.0);
      g.fillRect(-2, 8, 4, 5);
    } else if (role === 'raymond') {
      // Bowtie
      g.fillStyle(0x0f766e, 1.0);
      g.fillCircle(0, 2, 2.5);
    } else if (role === 'emma') {
      // Cashier badge
      g.fillStyle(0xf59e0b, 1.0);
      g.fillCircle(-4, 4, 2.5);
    }
  } else {
    // Shopper collar
    g.fillStyle(0xffffff, 0.45);
    g.fillRect(-2, -3, 4, 12);
  }

  // Arms
  g.fillStyle(shirtColor, 1.0);
  g.fillCircle(-14, 5, 5);
  g.fillCircle(14, 5, 5);
  g.fillStyle(GAME_CONFIG.colors.avatarSkin, 1.0);
  g.fillCircle(-14, 10, 3.5);
  g.fillCircle(14, 10, 3.5);

  // 5. Head
  g.fillStyle(GAME_CONFIG.colors.avatarSkin, 1.0);
  g.fillCircle(0, -16, 14);

  // Eyes & Smile
  g.fillStyle(0x0f172a, 1.0);
  g.fillCircle(-4, -15, 2);
  g.fillCircle(4, -15, 2);
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(-5, -16, 1);
  g.fillCircle(3, -16, 1);

  g.lineStyle(2, 0x0f172a, 0.85);
  g.beginPath();
  g.arc(0, -12, 4.5, 0.2 * Math.PI, 0.8 * Math.PI, false);
  g.strokePath();

  // 6. Headwear / Hair
  if (isWorker) {
    if (role === 'tailor') {
      // Red baseball cap
      g.fillStyle(GAME_CONFIG.colors.workerCap, 1.0);
      g.beginPath();
      g.arc(0, -19, 14, Math.PI, 0, false);
      g.closePath();
      g.fillPath();
      g.fillStyle(0xb91c1c, 1.0);
      g.fillRoundedRect(-12, -20, 24, 6, 2);
      g.fillStyle(0xffffff, 1.0);
      g.fillCircle(0, -33, 2.5);
    } else if (role === 'raymond') {
      // Emerald baseball cap
      g.fillStyle(GAME_CONFIG.colors.raymondCap, 1.0);
      g.beginPath();
      g.arc(0, -19, 14, Math.PI, 0, false);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x047857, 1.0);
      g.fillRoundedRect(-12, -20, 24, 6, 2);
      g.fillStyle(0xffffff, 1.0);
      g.fillCircle(0, -33, 2.5);
    } else if (role === 'lucas') {
      // Purple master tailor cap
      g.fillStyle(GAME_CONFIG.colors.lucasCap, 1.0);
      g.beginPath();
      g.arc(0, -19, 14, Math.PI, 0, false);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x6d28d9, 1.0);
      g.fillRoundedRect(-12, -20, 24, 6, 2);
      g.fillStyle(0xfef08a, 1.0);
      g.fillCircle(0, -33, 2.5);
    } else if (role === 'emma') {
      // Emma stylish blonde hair buns
      g.fillStyle(0xf59e0b, 1.0);
      g.fillCircle(-10, -18, 6);
      g.fillCircle(10, -18, 6);
      g.beginPath();
      g.arc(0, -19, 14, Math.PI, 0, false);
      g.closePath();
      g.fillPath();
    }
  } else {
    // Shopper Hair
    const hairColor = colorScheme ? colorScheme.hair : 0x1e293b;
    g.fillStyle(hairColor, 1.0);
    g.beginPath();
    g.arc(0, -19, 15, Math.PI, 0, false);
    g.closePath();
    g.fillPath();
    g.fillCircle(-8, -17, 5);
    g.fillCircle(8, -17, 5);
  }

  container.graphics = g;

  // Waddle animation functions
  container.waddleTweens = [];
  container.isWaddling = false;
  container.idleTween = null;

  container.startWaddle = () => {
    if (container.isWaddling) return;
    container.isWaddling = true;

    if (container.idleTween) {
      container.idleTween.stop();
      container.idleTween = null;
    }

    const duration = Math.round(115 / (isWorker ? gameState.getWorkerSpeedMultiplier() : 1.0));

    const wobbleTween = scene.tweens.add({
      targets: bodyVisual,
      angle: { from: -5, to: 5 },
      duration: duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const squashBounceTween = scene.tweens.add({
      targets: bodyVisual,
      scaleY: { from: 0.92, to: 1.06 },
      scaleX: { from: 1.05, to: 0.96 },
      y: { from: 0, to: -5 },
      duration: duration,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeInOut'
    });

    const shadowTween = scene.tweens.add({
      targets: shadow,
      scaleX: { from: 1.06, to: 0.94 },
      scaleY: { from: 1.04, to: 0.95 },
      duration: duration,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeInOut'
    });

    container.waddleTweens = [wobbleTween, squashBounceTween, shadowTween];
  };

  container.stopWaddle = () => {
    container.isWaddling = false;
    if (container.waddleTweens && container.waddleTweens.length > 0) {
      container.waddleTweens.forEach(t => t.stop());
      container.waddleTweens = [];
    }

    bodyVisual.angle = 0;
    bodyVisual.scaleX = 1;
    bodyVisual.scaleY = 1;
    bodyVisual.y = 0;
    shadow.scaleX = 1;
    shadow.scaleY = 1;

    container.startIdle();
  };

  container.startIdle = () => {
    if (container.idleTween) container.idleTween.stop();
    container.idleTween = scene.tweens.add({
      targets: bodyVisual,
      scaleY: 1.03,
      scaleX: 0.98,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  };

  container.startIdle();
  return container;
}

/**
 * Tailor Worker Class
 * Supports: Master Tailor, Raymond, Lucas, Cashier Emma
 */
export class TailorWorker {
  constructor(scene, parentContainer, stationsMap, counterStation, options = {}) {
    this.scene = scene;
    this.containerParent = parentContainer;
    this.stationsMap = stationsMap;
    this.counterStation = counterStation;

    this.id = options.id || 'tailor';
    this.name = options.name || 'Master Tailor';
    this.role = options.role || 'tailor';
    this.craftSpeedBonus = options.craftSpeedBonus || 1.0;

    this.homeX = options.homeX || 275;
    this.homeY = options.homeY || 460;

    this.container = createAvatarContainer(scene, {
      isWorker: true,
      role: this.role
    });
    this.container.setPosition(this.homeX, this.homeY);
    this.container.setDepth(15);
    parentContainer.add(this.container);

    this.radialGauge = new RadialGauge(scene, parentContainer, this.homeX, this.homeY - 48);

    // Carried garment item
    this.createCarriedItem(scene);

    this.state = 'IDLE';
    this.activeCustomer = null;
    this.currentProduct = 'tshirt';
  }

  createCarriedItem(scene) {
    this.carriedItem = scene.add.container(0, 8);
    const g = scene.add.graphics();
    this.carriedItemGraphics = g;
    this.carriedItem.add(g);
    this.carriedItem.setVisible(false);
    this.container.bodyVisual.add(this.carriedItem);
  }

  updateCarriedVisual(product) {
    const g = this.carriedItemGraphics;
    g.clear();

    if (product === 'jeans') {
      // Folded Denim Jeans
      g.fillStyle(0x000000, 0.2);
      g.fillRoundedRect(-10, -6, 20, 14, 2);
      g.fillStyle(0x1d4ed8, 1.0);
      g.fillRoundedRect(-10, -7, 20, 14, 3);
      g.fillStyle(0xf59e0b, 1.0);
      g.fillRect(-8, -1, 16, 2); // gold stitch
    } else if (product === 'hat') {
      // Stylish Hat
      g.fillStyle(0x000000, 0.2);
      g.fillCircle(0, 2, 9);
      g.fillStyle(0x9333ea, 1.0);
      g.fillCircle(0, 0, 8);
      g.fillStyle(0xfef08a, 1.0);
      g.fillRect(-6, -2, 12, 3);
    } else {
      // Folded T-Shirt
      g.fillStyle(0x000000, 0.2);
      g.fillRoundedRect(-10, -6, 20, 14, 2);
      g.fillStyle(0x3b82f6, 1.0);
      g.fillRoundedRect(-10, -7, 20, 14, 3);
      g.fillStyle(0xffffff, 0.9);
      g.fillRoundedRect(-5, -7, 10, 4, 1);
    }
  }

  assignOrder(customer) {
    if (this.state !== 'IDLE') return false;
    this.activeCustomer = customer;
    this.currentProduct = customer.orderedProduct || 'tshirt';
    this.processOrder();
    return true;
  }

  processOrder() {
    this.state = 'WALKING_TO_STATION';
    this.container.startWaddle();

    // Find destination station spot based on product
    let targetX = 275;
    let targetY = 460;

    if (this.currentProduct === 'jeans' && this.stationsMap.jeans) {
      targetX = this.stationsMap.jeans.x;
      targetY = this.stationsMap.jeans.y - 45;
    } else if (this.currentProduct === 'hat' && this.stationsMap.hats) {
      targetX = this.stationsMap.hats.x;
      targetY = this.stationsMap.hats.y - 45;
    } else if (this.stationsMap.sewing) {
      targetX = this.stationsMap.sewing.x;
      targetY = this.stationsMap.sewing.y - 45;
    }

    const speedMultiplier = gameState.getWorkerSpeedMultiplier();
    const dist = Phaser.Math.Distance.Between(this.container.x, this.container.y, targetX, targetY);
    const duration = Math.max(180, Math.round((dist / 160) * 400 / speedMultiplier));

    this.scene.tweens.add({
      targets: this.container,
      x: targetX,
      y: targetY,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        this.container.stopWaddle();
        this.startCrafting(targetX, targetY);
      }
    });
  }

  startCrafting(stationX, stationY) {
    this.state = 'CRAFTING';

    let craftDuration = 1500;
    if (this.currentProduct === 'jeans') {
      craftDuration = gameState.getJeansCraftDuration();
    } else if (this.currentProduct === 'hat') {
      craftDuration = gameState.getHatsCraftDuration();
    } else {
      craftDuration = gameState.getSewingCraftDuration();
    }

    craftDuration = Math.round(craftDuration / this.craftSpeedBonus);

    // Position radial progress bar right above worker
    this.radialGauge.setPosition(this.container.x, this.container.y - 48);
    const gaugeIcon = this.currentProduct === 'jeans' ? '👖' : (this.currentProduct === 'hat' ? '🧢' : '✂️');
    this.radialGauge.setIcon(gaugeIcon);

    this.radialGauge.start(craftDuration, () => {
      this.finishCrafting();
    });

    this.craftTween = this.scene.tweens.add({
      targets: this.container.bodyVisual,
      angle: { from: -3, to: 3 },
      scaleY: { from: 0.95, to: 1.04 },
      duration: 180,
      yoyo: true,
      repeat: Math.floor(craftDuration / 180),
      ease: 'Sine.easeInOut'
    });
  }

  finishCrafting() {
    if (this.craftTween) this.craftTween.stop();
    this.container.bodyVisual.angle = 0;
    this.container.bodyVisual.setScale(1);

    this.updateCarriedVisual(this.currentProduct);
    this.carriedItem.setVisible(true);

    this.state = 'WALKING_TO_COUNTER';
    this.container.startWaddle();

    const targetX = (this.activeCustomer && this.activeCustomer.counterSlot)
      ? this.activeCustomer.counterSlot.x
      : 360;
    const destY = GAME_CONFIG.layout.counter.workerStopY;

    const speedMultiplier = gameState.getWorkerSpeedMultiplier();
    const dist = Phaser.Math.Distance.Between(this.container.x, this.container.y, targetX, destY);
    const duration = Math.max(200, Math.round((dist / 160) * 450 / speedMultiplier));

    this.scene.tweens.add({
      targets: this.container,
      x: targetX,
      y: destY,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        this.container.stopWaddle();
        this.serveCustomer();
      }
    });
  }

  serveCustomer() {
    this.state = 'SERVING';
    this.carriedItem.setVisible(false);

    if (this.activeCustomer && this.activeCustomer.active) {
      this.activeCustomer.receiveOrder(this.currentProduct);
    }

    this.scene.time.delayedCall(180, () => {
      this.activeCustomer = null;
      this.state = 'IDLE';
      this.scene.events.emit('workerBecameIdle', this);
    });
  }
}

/**
 * Shopper (Customer) Class
 * Generates orders for T-shirts, Jeans (Stage 2 unlocked), or Hats (Stage 2 unlocked)
 */
export class Shopper {
  constructor(scene, parentContainer, shopperId, colorScheme) {
    this.scene = scene;
    this.id = shopperId;
    this.active = true;
    this.counterSlot = null;
    this.isBeingServed = false;

    // Pick ordered product based on currently unlocked stations
    this.orderedProduct = this.pickRandomProduct();

    this.container = createAvatarContainer(scene, { isWorker: false, colorScheme });
    this.container.setPosition(360, 25);
    this.container.setDepth(10);
    parentContainer.add(this.container);

    this.createOrderBubble();
    this.state = 'SPAWNED';
  }

  pickRandomProduct() {
    const products = ['tshirt'];
    if (gameState.stage >= 2) {
      if (gameState.jeansStation.unlocked) products.push('jeans');
      if (gameState.hatsStation.unlocked) products.push('hat');
    }
    return Phaser.Utils.Array.GetRandom(products);
  }

  createOrderBubble() {
    this.speechBubble = this.scene.add.container(0, -58);
    this.speechBubble.setVisible(false);
    this.container.add(this.speechBubble);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.22);
    bg.fillRoundedRect(-36, -25, 72, 42, 10);
    bg.fillTriangle(0, 22, -8, 15, 8, 15);

    bg.fillStyle(0xffffff, 1.0);
    bg.fillRoundedRect(-38, -27, 76, 42, 10);
    bg.fillTriangle(0, 20, -8, 13, 8, 13);
    bg.lineStyle(1.5, 0xe2e8f0, 0.9);
    bg.strokeRoundedRect(-38, -27, 76, 42, 10);
    this.speechBubble.add(bg);

    // Product icon
    const icon = this.orderedProduct === 'jeans' ? '👖' : (this.orderedProduct === 'hat' ? '🧢' : '👕');
    this.productIcon = this.scene.add.text(-12, -6, icon, { fontSize: '22px' }).setOrigin(0.5);
    this.speechBubble.add(this.productIcon);

    this.orderText = this.scene.add.text(14, -5, 'x1', {
      fontFamily: FONT_FAMILY,
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#0f172a'
    }).setOrigin(0.5);
    this.speechBubble.add(this.orderText);

    this.scene.tweens.add({
      targets: this.speechBubble,
      y: '-=5',
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  showOrderBubble() {
    this.speechBubble.setScale(0);
    this.speechBubble.setVisible(true);
    this.scene.tweens.add({
      targets: this.speechBubble,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  hideOrderBubble() {
    this.speechBubble.setVisible(false);
  }

  moveTo(x, y, duration = 600, onComplete = null) {
    this.container.startWaddle();
    this.scene.tweens.add({
      targets: this.container,
      x: x,
      y: y,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        this.container.stopWaddle();
        if (onComplete) onComplete();
      }
    });
  }

  moveToCounterSlot(slot, onArrived = null) {
    this.counterSlot = slot;
    const dist = Phaser.Math.Distance.Between(this.container.x, this.container.y, slot.x, slot.y);
    const duration = Math.max(300, (dist / 160) * 750);

    this.moveTo(slot.x, slot.y, duration, () => {
      this.state = 'AT_COUNTER';
      this.showOrderBubble();
      if (onArrived) onArrived();
    });
  }

  moveToWaitingQueue(pos, onArrived = null) {
    this.counterSlot = null;
    const dist = Phaser.Math.Distance.Between(this.container.x, this.container.y, pos.x, pos.y);
    const duration = Math.max(250, (dist / 160) * 750);

    this.moveTo(pos.x, pos.y, duration, () => {
      this.state = 'IN_QUEUE';
      if (onArrived) onArrived();
    });
  }

  receiveOrder(product) {
    this.state = 'SERVED';
    this.productIcon.setText('💚');
    this.orderText.setText('');

    this.scene.tweens.add({
      targets: this.container.bodyVisual,
      scaleY: 1.15,
      scaleX: 0.92,
      duration: 140,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    this.scene.time.delayedCall(250, () => {
      this.payAndLeave(product);
    });
  }

  payAndLeave(product) {
    let profit = 4;
    if (product === 'jeans') {
      profit = gameState.getJeansProfit();
    } else if (product === 'hat') {
      profit = gameState.getHatsProfit();
    } else {
      profit = gameState.getSewingProfit();
    }

    this.scene.events.emit('customerPaid', {
      x: this.container.x,
      y: this.container.y - 30,
      amount: profit
    });

    this.hideOrderBubble();

    this.scene.events.emit('shopperVacatingSlot', {
      shopper: this,
      slot: this.counterSlot
    });
    this.counterSlot = null;

    // Walk off-screen right
    this.moveTo(760, this.container.y, 1100, () => {
      this.active = false;
      this.container.destroy();
      this.scene.events.emit('shopperExited', this);
    });
  }
}

/**
 * Character & Queue Manager
 * Coordinates Workers, Cashier Emma, Shoppers, and Station Routing
 */
export class CharacterManager {
  constructor(scene, parentContainer, stationsMap, counterStation) {
    this.scene = scene;
    this.container = parentContainer;
    this.stationsMap = stationsMap;
    this.counterStation = counterStation;

    // Tailor Worker pool
    this.tailor = new TailorWorker(scene, parentContainer, stationsMap, counterStation, {
      id: 'tailor',
      name: 'Master Tailor',
      role: 'tailor',
      homeX: 275,
      homeY: 460
    });
    this.workers = [this.tailor];

    // Horizontal counter service slots
    this.counterSlots = [
      { id: 0, x: GAME_CONFIG.layout.counter.customerSlots[0].x, y: GAME_CONFIG.layout.counter.customerStopY, customer: null },
      { id: 1, x: GAME_CONFIG.layout.counter.customerSlots[1].x, y: GAME_CONFIG.layout.counter.customerStopY, customer: null }
    ];

    this.waitingQueue = [];
    this.nextShopperId = 1;

    // Spawner
    this.spawnTimer = scene.time.addEvent({
      delay: 2600,
      callback: () => this.trySpawnShopper(),
      loop: true
    });

    // Listeners
    scene.events.on('shopperVacatingSlot', (data) => {
      this.handleSlotVacated(data.shopper, data.slot);
    });

    scene.events.on('shopperExited', (shopper) => {
      this.handleSlotVacated(shopper, null);
    });

    scene.events.on('workerBecameIdle', () => {
      this.checkCounterService();
    });

    // Upgrades triggers
    gameState.on('upgradePurchased', (data) => {
      if (data.id === 'hire_raymond') {
        this.spawnRaymond();
      } else if (data.id === 'master_tailor') {
        this.spawnLucas();
      } else if (data.id === 'hire_cashier_emma') {
        this.spawnEmma();
      }
    });

    // Initial spawns
    scene.time.delayedCall(300, () => this.trySpawnShopper());
    scene.time.delayedCall(1100, () => this.trySpawnShopper());
  }

  spawnRaymond() {
    if (this.workers.some(w => w.id === 'raymond')) return;

    const raymond = new TailorWorker(this.scene, this.container, this.stationsMap, this.counterStation, {
      id: 'raymond',
      name: 'Raymond',
      role: 'raymond',
      homeX: 360,
      homeY: 460
    });
    this.workers.push(raymond);
    this.showWorkerAnnouncement('👔 RAYMOND HIRED!');
    this.checkCounterService();
  }

  spawnLucas() {
    if (this.workers.some(w => w.id === 'lucas')) return;

    const lucas = new TailorWorker(this.scene, this.container, this.stationsMap, this.counterStation, {
      id: 'lucas',
      name: 'Master Lucas',
      role: 'lucas',
      craftSpeedBonus: 1.25,
      homeX: 445,
      homeY: 460
    });
    this.workers.push(lucas);
    this.showWorkerAnnouncement('🎩 MASTER LUCAS JOINED!');
    this.checkCounterService();
  }

  spawnEmma() {
    if (this.emma) return;

    // Emma stands directly at the front counter!
    this.emma = createAvatarContainer(this.scene, {
      isWorker: true,
      role: 'emma'
    });
    this.emma.setPosition(360, GAME_CONFIG.layout.counter.workerStopY);
    this.emma.setDepth(14);
    this.container.add(this.emma);

    this.showWorkerAnnouncement('💁‍♀️ CASHIER EMMA ACTIVE!');
  }

  showWorkerAnnouncement(text) {
    const pop = this.scene.add.container(360, 420).setDepth(40);
    this.container.add(pop);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0f172a, 0.9);
    bg.fillRoundedRect(-100, -18, 200, 36, 10);
    bg.lineStyle(1.5, 0x22c55e, 1);
    bg.strokeRoundedRect(-100, -18, 200, 36, 10);
    pop.add(bg);

    const txt = this.scene.add.text(0, 0, text, {
      fontFamily: FONT_FAMILY,
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#86efac'
    }).setOrigin(0.5);
    pop.add(txt);

    this.scene.tweens.add({
      targets: pop,
      y: '-=40',
      alpha: 0,
      duration: 1400,
      ease: 'Cubic.easeOut',
      onComplete: () => pop.destroy()
    });
  }

  trySpawnShopper() {
    const maxWaiting = gameState.getMaxQueueCapacity();
    const totalShoppers = this.counterSlots.filter(s => s.customer !== null).length + this.waitingQueue.length;
    if (totalShoppers >= this.counterSlots.length + maxWaiting) return;

    const palette = Phaser.Utils.Array.GetRandom(GAME_CONFIG.colors.shopperPalette);
    const shopper = new Shopper(this.scene, this.container, this.nextShopperId++, palette);

    const freeSlot = this.counterSlots.find(s => s.customer === null);
    if (freeSlot) {
      freeSlot.customer = shopper;
      shopper.moveToCounterSlot(freeSlot, () => {
        this.checkCounterService();
      });
    } else if (this.waitingQueue.length < maxWaiting) {
      const waitIdx = this.waitingQueue.length;
      const waitPos = GAME_CONFIG.layout.waitingQueue[waitIdx];
      this.waitingQueue.push(shopper);
      shopper.moveToWaitingQueue(waitPos);
    } else {
      shopper.container.destroy();
    }
  }

  handleSlotVacated(shopper, slot) {
    for (const cs of this.counterSlots) {
      if (cs.customer === shopper || (slot && cs.id === slot.id)) {
        cs.customer = null;
      }
    }

    for (const cs of this.counterSlots) {
      if (cs.customer === null && this.waitingQueue.length > 0) {
        const nextShopper = this.waitingQueue.shift();
        cs.customer = nextShopper;
        nextShopper.moveToCounterSlot(cs, () => {
          this.checkCounterService();
        });
      }
    }

    for (let i = 0; i < this.waitingQueue.length; i++) {
      const queued = this.waitingQueue[i];
      const targetPos = GAME_CONFIG.layout.waitingQueue[i];
      queued.moveToWaitingQueue(targetPos);
    }

    this.checkCounterService();
  }

  checkCounterService() {
    const idleWorkers = this.workers.filter(w => w.state === 'IDLE');
    if (idleWorkers.length === 0) return;

    for (const slot of this.counterSlots) {
      const customer = slot.customer;
      if (customer && customer.active && customer.state === 'AT_COUNTER' && !customer.isBeingServed) {
        const worker = idleWorkers.shift();
        if (!worker) break;

        customer.isBeingServed = true;
        worker.assignOrder(customer);
      }
    }
  }

  update(time, delta) {
    if (this.workers.some(w => w.state === 'IDLE')) {
      this.checkCounterService();
    }
  }
}
