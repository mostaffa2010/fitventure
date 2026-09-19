/**
 * Fitventure - Characters & AI Manager
 * Cylindrical flat-design avatars, 2.5D translucent dark oval drop shadows,
 * Master Tailor and Raymond assistant, shoppers with horizontal counter queue,
 * procedural waddle animations, and floating order speech bubbles.
 */

import { GAME_CONFIG, gameState } from './config.js';
import { RadialGauge } from './stations.js';

/**
 * Procedural 2.5D Cylindrical Avatar Generator
 * Supports 2.5D grounding drop shadow, continuous rotation wobble,
 * and y-axis squash/bounce every 120ms.
 */
export function createAvatarContainer(scene, { isWorker = false, isAssistant = false, colorScheme = null }) {
  const container = scene.add.container(0, 0);

  // 1. Soft Translucent Dark Oval 2.5D Drop Shadow directly under feet
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.25);
  shadow.fillEllipse(0, 24, 42, 16);
  container.add(shadow);
  container.shadow = shadow;

  // 2. Avatar Visual Container (Rotational wobble, squash, stretch, bounce)
  const bodyVisual = scene.add.container(0, 0);
  container.add(bodyVisual);
  container.bodyVisual = bodyVisual;

  const g = scene.add.graphics();
  bodyVisual.add(g);

  // 3. Shoes / Sneakers
  const hasSneakers = isWorker && gameState.upgrades.better_sneakers;
  if (hasSneakers) {
    // Sporty Red/Teal Sneakers with white soles
    g.fillStyle(0xffffff, 1.0); // White sole
    g.fillRoundedRect(-15, 20, 11, 7, 2);
    g.fillRoundedRect(4, 20, 11, 7, 2);
    g.fillStyle(isAssistant ? 0x0ea5e9 : 0xef4444, 1.0); // Sneaker upper
    g.fillRoundedRect(-14, 16, 9, 7, 3);
    g.fillRoundedRect(5, 16, 9, 7, 3);
  } else {
    // Classic dark smart shoes
    g.fillStyle(0x1e293b, 1.0);
    g.fillRoundedRect(-14, 18, 10, 8, 3);
    g.fillRoundedRect(4, 18, 10, 8, 3);
  }

  // 4. Cylindrical Body / Torso
  let shirtColor = GAME_CONFIG.colors.workerShirt;
  if (isWorker) {
    shirtColor = isAssistant ? GAME_CONFIG.colors.raymondShirt : GAME_CONFIG.colors.workerShirt;
  } else {
    shirtColor = colorScheme ? colorScheme.shirt : 0x3b82f6;
  }

  // Torso base
  g.fillStyle(shirtColor, 1.0);
  g.fillRoundedRect(-16, -6, 32, 28, 6);

  if (isWorker) {
    if (!isAssistant) {
      // Master Tailor Apron (crisp cream fabric with leather straps)
      g.fillStyle(0xf8fafc, 1.0);
      g.fillRoundedRect(-12, -2, 24, 24, 4);
      // Yellow tape measure draped around neck
      g.fillStyle(0xf59e0b, 1.0);
      g.fillRect(-10, 3, 20, 3);
      // Leather apron pocket
      g.fillStyle(0xe2e8f0, 1.0);
      g.fillRoundedRect(-8, 9, 16, 10, 2);
      // Mini tailor shears in pocket
      g.fillStyle(0x94a3b8, 1.0);
      g.fillRect(-2, 6, 4, 6);
    } else {
      // Raymond Assistant Apron (fresh mint tint with bowtie)
      g.fillStyle(0xf0fdf4, 1.0);
      g.fillRoundedRect(-12, -2, 24, 24, 4);
      // Assistant stylish dark bowtie
      g.fillStyle(0x0f766e, 1.0);
      g.fillTriangle(-6, -1, 0, 2, -6, 5);
      g.fillTriangle(6, -1, 0, 2, 6, 5);
      g.fillCircle(0, 2, 2.5);
      // Pencil pocket
      g.fillStyle(0xdcfce7, 1.0);
      g.fillRoundedRect(-8, 10, 16, 9, 2);
      g.fillStyle(0xf59e0b, 1.0);
      g.fillRect(-2, 7, 3, 5); // tailor chalk/pencil
    }
  } else {
    // Casual shopper details: button collar / placket
    g.fillStyle(0xffffff, 0.45);
    g.fillRect(-2, -4, 4, 14);
  }

  // Arms / Hands
  g.fillStyle(shirtColor, 1.0);
  g.fillCircle(-16, 6, 6);
  g.fillCircle(16, 6, 6);
  g.fillStyle(GAME_CONFIG.colors.avatarSkin, 1.0);
  g.fillCircle(-16, 12, 4);
  g.fillCircle(16, 12, 4);

  // 5. Head (Smooth spherical cylinder)
  g.fillStyle(GAME_CONFIG.colors.avatarSkin, 1.0);
  g.fillCircle(0, -18, 16);

  // Face: Eyes & Smile
  g.fillStyle(0x0f172a, 1.0);
  g.fillCircle(-5, -17, 2.5); // Left eye
  g.fillCircle(5, -17, 2.5);  // Right eye
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(-6, -18, 1);   // Eye glint
  g.fillCircle(4, -18, 1);

  // Friendly smile
  g.lineStyle(2, 0x0f172a, 0.85);
  g.beginPath();
  g.arc(0, -13, 5, 0.2 * Math.PI, 0.8 * Math.PI, false);
  g.strokePath();

  // 6. Headwear / Hair
  if (isWorker) {
    const capColor = isAssistant ? GAME_CONFIG.colors.raymondCap : GAME_CONFIG.colors.workerCap;
    const brimColor = isAssistant ? 0x047857 : 0xb91c1c;

    // Iconic Eatventure-style Baseball Cap
    g.fillStyle(capColor, 1.0);
    g.beginPath();
    g.arc(0, -22, 16, Math.PI, 0, false);
    g.closePath();
    g.fillPath();

    // Cap front visor/brim
    g.fillStyle(brimColor, 1.0);
    g.fillRoundedRect(-14, -23, 28, 7, 3);
    // Button on top of cap
    g.fillStyle(0xffffff, 1.0);
    g.fillCircle(0, -38, 3);
  } else {
    // Shopper Hair
    const hairColor = colorScheme ? colorScheme.hair : 0x1e293b;
    g.fillStyle(hairColor, 1.0);
    g.beginPath();
    g.arc(0, -22, 17, Math.PI, 0, false);
    g.closePath();
    g.fillPath();
    // Hair tufts
    g.fillCircle(-10, -20, 6);
    g.fillCircle(10, -20, 6);
  }

  container.graphics = g;

  // 7. Dynamic Waddle/Walk Procedural Animation System
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

    const duration = Math.round(120 / (isWorker ? gameState.getWorkerSpeedMultiplier() : 1.0));

    // Continuous rotation wobble: -6deg to +6deg
    const wobbleTween = scene.tweens.add({
      targets: bodyVisual,
      angle: { from: -6, to: 6 },
      duration: duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Y-axis squash and bounce
    const squashBounceTween = scene.tweens.add({
      targets: bodyVisual,
      scaleY: { from: 0.90, to: 1.08 },
      scaleX: { from: 1.06, to: 0.95 },
      y: { from: 0, to: -6 },
      duration: duration,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeInOut'
    });

    // Ground shadow contraction during bounce
    const shadowTween = scene.tweens.add({
      targets: shadow,
      scaleX: { from: 1.08, to: 0.92 },
      scaleY: { from: 1.05, to: 0.94 },
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

    // Reset visual transforms to neutral
    bodyVisual.angle = 0;
    bodyVisual.scaleX = 1;
    bodyVisual.scaleY = 1;
    bodyVisual.y = 0;
    shadow.scaleX = 1;
    shadow.scaleY = 1;

    // Resume idle breathing
    container.startIdle();
  };

  container.startIdle = () => {
    if (container.idleTween) container.idleTween.stop();
    container.idleTween = scene.tweens.add({
      targets: bodyVisual,
      scaleY: 1.03,
      scaleX: 0.98,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  };

  // Start with idle breathing
  container.startIdle();

  return container;
}

/**
 * Tailor Worker Class
 * Supports Head Tailor and Raymond assistant.
 * Crafts at sewing table, carries folded shirt, serves customers at horizontal counter slots.
 */
export class TailorWorker {
  constructor(scene, sewingStation, counterStation, options = {}) {
    this.scene = scene;
    this.sewingStation = sewingStation;
    this.counterStation = counterStation;
    this.id = options.id || 'tailor';
    this.name = options.name || 'Master Tailor';
    this.isAssistant = !!options.isAssistant;

    // Dedicated workstation crafting position
    this.spotX = options.spotX || (this.isAssistant ? 405 : 315);
    this.spotY = options.spotY || 530;

    this.container = createAvatarContainer(scene, {
      isWorker: true,
      isAssistant: this.isAssistant
    });
    this.container.x = this.spotX;
    this.container.y = this.spotY;
    this.container.setDepth(15);

    // Dedicated Radial Progress Gauge above worker's head
    this.radialGauge = new RadialGauge(scene, this.spotX, this.spotY - 60);

    // Folded T-shirt carried in hands
    this.createCarriedShirt(scene);

    this.state = 'IDLE'; // IDLE, WALKING_TO_SEWING, CRAFTING, WALKING_TO_COUNTER, SERVING
    this.activeCustomer = null;
  }

  createCarriedShirt(scene) {
    this.carriedShirt = scene.add.container(0, 10);
    const g = scene.add.graphics();
    // Soft shadow
    g.fillStyle(0x000000, 0.22);
    g.fillRoundedRect(-11, -7, 22, 16, 3);
    // Folded T-shirt
    g.fillStyle(0x3b82f6, 1.0);
    g.fillRoundedRect(-12, -8, 24, 16, 4);
    // Fold collar detail
    g.fillStyle(0xffffff, 0.9);
    g.fillRoundedRect(-6, -8, 12, 5, 2);

    // Premium Fabric Golden Ribbon Accent (if perk active)
    this.premiumRibbon = scene.add.graphics();
    this.premiumRibbon.fillStyle(0xf59e0b, 1.0);
    this.premiumRibbon.fillRect(-12, -1, 24, 3);
    this.premiumRibbon.fillStyle(0xfef08a, 1.0);
    this.premiumRibbon.fillCircle(0, 0, 3);
    this.premiumRibbon.setVisible(gameState.upgrades.premium_fabric);
    this.carriedShirt.add(this.premiumRibbon);

    this.carriedShirt.add(g);
    this.carriedShirt.setVisible(false);
    this.container.bodyVisual.add(this.carriedShirt);
  }

  startWalkAnimation() {
    this.container.startWaddle();
  }

  stopWalkAnimation() {
    this.container.stopWaddle();
  }

  assignOrder(customer) {
    if (this.state !== 'IDLE') return false;
    this.activeCustomer = customer;
    this.processOrder();
    return true;
  }

  processOrder() {
    // 1. Walk to sewing workstation spot
    this.state = 'WALKING_TO_SEWING';
    this.startWalkAnimation();

    const speedMultiplier = gameState.getWorkerSpeedMultiplier();
    const duration = Math.round(380 / speedMultiplier);

    this.scene.tweens.add({
      targets: this.container,
      x: this.spotX,
      y: this.spotY,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        this.stopWalkAnimation();
        this.startCrafting();
      }
    });
  }

  startCrafting() {
    this.state = 'CRAFTING';
    const craftDuration = gameState.getSewingCraftDuration();

    // Position progress gauge directly above worker's head
    this.radialGauge.setPosition(this.spotX, this.spotY - 60);
    this.radialGauge.start(craftDuration, () => {
      this.finishCrafting();
    });

    // Rhythmic crafting wobble
    this.craftTween = this.scene.tweens.add({
      targets: this.container.bodyVisual,
      angle: { from: -3, to: 3 },
      scaleY: { from: 0.96, to: 1.03 },
      duration: 200,
      yoyo: true,
      repeat: Math.floor(craftDuration / 200),
      ease: 'Sine.easeInOut'
    });
  }

  finishCrafting() {
    if (this.craftTween) this.craftTween.stop();
    this.container.bodyVisual.angle = 0;
    this.container.bodyVisual.setScale(1);

    // Update premium ribbon visibility
    this.premiumRibbon.setVisible(gameState.upgrades.premium_fabric);

    // Pick up folded shirt
    this.carriedShirt.setVisible(true);

    // 2. Walk to counter to serve customer at their specific horizontal slot
    this.state = 'WALKING_TO_COUNTER';
    this.startWalkAnimation();

    const targetX = (this.activeCustomer && this.activeCustomer.counterSlot)
      ? this.activeCustomer.counterSlot.x
      : (this.activeCustomer ? this.activeCustomer.container.x : 360);
    const destY = GAME_CONFIG.layout.counter.workerStopY;

    const speedMultiplier = gameState.getWorkerSpeedMultiplier();
    const duration = Math.round(440 / speedMultiplier);

    this.scene.tweens.add({
      targets: this.container,
      x: targetX,
      y: destY,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        this.stopWalkAnimation();
        this.serveCustomer();
      }
    });
  }

  serveCustomer() {
    this.state = 'SERVING';
    this.carriedShirt.setVisible(false);

    if (this.activeCustomer && this.activeCustomer.active) {
      this.activeCustomer.receiveOrder();
    }

    // Snappy reset to idle so worker can take next order immediately
    this.scene.time.delayedCall(220, () => {
      this.activeCustomer = null;
      this.state = 'IDLE';
      this.scene.events.emit('workerBecameIdle', this);
    });
  }
}

/**
 * Shopper (Customer) Class
 * Walks in from crosswalk, fills horizontal counter slots (Slot 1: 295, Slot 2: 425)
 * or neat waiting queue behind them, orders T-shirt, pays and exits.
 */
export class Shopper {
  constructor(scene, shopperId, colorScheme) {
    this.scene = scene;
    this.id = shopperId;
    this.active = true;
    this.counterSlot = null;
    this.isBeingServed = false;

    this.container = createAvatarContainer(scene, { isWorker: false, colorScheme });
    // Spawn at crosswalk street level
    this.container.x = 360;
    this.container.y = 20;
    this.container.setDepth(10);

    // Floating Order Speech Bubble
    this.createOrderBubble();

    this.state = 'SPAWNED';
  }

  createOrderBubble() {
    this.speechBubble = this.scene.add.container(0, -65);
    this.speechBubble.setVisible(false);
    this.container.add(this.speechBubble);

    const bg = this.scene.add.graphics();
    // Drop shadow
    bg.fillStyle(0x000000, 0.22);
    bg.fillRoundedRect(-40, -28, 80, 48, 12);
    bg.fillTriangle(0, 26, -9, 18, 9, 18);

    // Clean white bubble container
    bg.fillStyle(0xffffff, 1.0);
    bg.fillRoundedRect(-42, -30, 84, 48, 12);
    // Pointer
    bg.fillTriangle(0, 24, -9, 16, 9, 16);
    // Subtle border
    bg.lineStyle(2, 0xe2e8f0, 0.9);
    bg.strokeRoundedRect(-42, -30, 84, 48, 12);
    this.speechBubble.add(bg);

    // T-shirt product icon
    this.tshirtIcon = this.scene.add.text(-14, -7, '👕', {
      fontSize: '26px'
    }).setOrigin(0.5);
    this.speechBubble.add(this.tshirtIcon);

    // Order quantity text
    this.orderText = this.scene.add.text(16, -6, 'x1', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#0f172a'
    }).setOrigin(0.5);
    this.speechBubble.add(this.orderText);

    // Floating bob animation
    this.bubbleTween = this.scene.tweens.add({
      targets: this.speechBubble,
      y: '-=6',
      duration: 650,
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
      duration: 250,
      ease: 'Back.easeOut'
    });
  }

  hideOrderBubble() {
    this.speechBubble.setVisible(false);
  }

  moveTo(x, y, duration = 800, onComplete = null) {
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
    const duration = Math.max(350, (dist / 160) * 1000);

    this.moveTo(slot.x, slot.y, duration, () => {
      this.state = 'AT_COUNTER';
      this.showOrderBubble();
      if (onArrived) onArrived();
    });
  }

  moveToWaitingQueue(pos, onArrived = null) {
    this.counterSlot = null;
    const dist = Phaser.Math.Distance.Between(this.container.x, this.container.y, pos.x, pos.y);
    const duration = Math.max(350, (dist / 160) * 1000);

    this.moveTo(pos.x, pos.y, duration, () => {
      this.state = 'IN_QUEUE';
      if (onArrived) onArrived();
    });
  }

  receiveOrder() {
    this.state = 'SERVED';
    this.tshirtIcon.setText('💚');
    this.orderText.setText('');

    // Delight bounce
    this.scene.tweens.add({
      targets: this.container.bodyVisual,
      scaleY: 1.15,
      scaleX: 0.92,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    this.scene.time.delayedCall(300, () => {
      this.payAndLeave();
    });
  }

  payAndLeave() {
    const profit = gameState.getSewingProfit();
    this.scene.events.emit('customerPaid', {
      x: this.container.x,
      y: this.container.y - 40,
      amount: profit
    });

    this.hideOrderBubble();

    // Vacate slot immediately so queue advances
    this.scene.events.emit('shopperVacatingSlot', {
      shopper: this,
      slot: this.counterSlot
    });
    this.counterSlot = null;

    // Walk off-screen to the right sidewalk
    this.moveTo(760, this.container.y, 1300, () => {
      this.active = false;
      this.container.destroy();
      this.scene.events.emit('shopperExited', this);
    });
  }
}

/**
 * Character & Queue Manager
 * Coordinates Tailor workers, shoppers across horizontal counter slots,
 * neat waiting queue, and dynamically spawns Raymond when hired.
 */
export class CharacterManager {
  constructor(scene, sewingStation, counterStation) {
    this.scene = scene;
    this.sewingStation = sewingStation;
    this.counterStation = counterStation;

    // Head Tailor worker
    this.tailor = new TailorWorker(scene, sewingStation, counterStation, {
      id: 'tailor',
      name: 'Master Tailor',
      spotX: 315,
      spotY: 530
    });

    // Workers pool (expands when Raymond is hired)
    this.workers = [this.tailor];

    // Horizontal counter service slots
    this.counterSlots = [
      { id: 0, x: GAME_CONFIG.layout.counter.customerSlots[0].x, y: GAME_CONFIG.layout.counter.customerStopY, customer: null },
      { id: 1, x: GAME_CONFIG.layout.counter.customerSlots[1].x, y: GAME_CONFIG.layout.counter.customerStopY, customer: null }
    ];

    // Neat waiting queue slots lined up behind the counter
    this.waitingQueue = [];
    this.nextShopperId = 1;

    // Spawner timer
    this.spawnTimer = scene.time.addEvent({
      delay: 2800,
      callback: () => this.trySpawnShopper(),
      loop: true
    });

    // Slot vacated handler
    scene.events.on('shopperVacatingSlot', (data) => {
      this.handleSlotVacated(data.shopper, data.slot);
    });

    // Shopper exit fallback
    scene.events.on('shopperExited', (shopper) => {
      this.handleSlotVacated(shopper, null);
    });

    // Worker idle trigger
    scene.events.on('workerBecameIdle', () => {
      this.checkCounterService();
    });

    // Listen for Global Perk purchases
    gameState.on('perkPurchased', (data) => {
      if (data.id === 'hire_raymond') {
        this.spawnRaymond();
      }
    });

    // Initial spawns to quickly engage player
    scene.time.delayedCall(300, () => this.trySpawnShopper());
    scene.time.delayedCall(1200, () => this.trySpawnShopper());
  }

  spawnRaymond() {
    if (this.workers.some(w => w.id === 'raymond')) return;

    // Spawn Raymond at the second workstation spot (x: 405, y: 530)
    const raymond = new TailorWorker(this.scene, this.sewingStation, this.counterStation, {
      id: 'raymond',
      name: 'Raymond',
      isAssistant: true,
      spotX: 405,
      spotY: 530
    });
    this.workers.push(raymond);

    // Celebratory visual pop
    const announce = this.scene.add.container(405, 470).setDepth(40);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0f172a, 0.85);
    bg.fillRoundedRect(-90, -20, 180, 40, 10);
    bg.lineStyle(2, 0x22c55e, 1);
    bg.strokeRoundedRect(-90, -20, 180, 40, 10);
    announce.add(bg);

    const txt = this.scene.add.text(0, 0, '👔 RAYMOND HIRED!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#86efac'
    }).setOrigin(0.5);
    announce.add(txt);

    this.scene.tweens.add({
      targets: announce,
      y: '-=50',
      alpha: 0,
      duration: 1500,
      ease: 'Cubic.easeOut',
      onComplete: () => announce.destroy()
    });

    // Check if waiting customer can be served immediately
    this.checkCounterService();
  }

  trySpawnShopper() {
    const maxWaiting = gameState.getMaxQueueCapacity();
    const totalShoppers = this.counterSlots.filter(s => s.customer !== null).length + this.waitingQueue.length;
    if (totalShoppers >= this.counterSlots.length + maxWaiting) return;

    const palette = Phaser.Utils.Array.GetRandom(GAME_CONFIG.colors.shopperPalette);
    const shopper = new Shopper(this.scene, this.nextShopperId++, palette);

    // Check for free counter slot
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
    // Clear slot
    for (const cs of this.counterSlots) {
      if (cs.customer === shopper || (slot && cs.id === slot.id)) {
        cs.customer = null;
      }
    }

    // Advance queue
    for (const cs of this.counterSlots) {
      if (cs.customer === null && this.waitingQueue.length > 0) {
        const nextShopper = this.waitingQueue.shift();
        cs.customer = nextShopper;
        nextShopper.moveToCounterSlot(cs, () => {
          this.checkCounterService();
        });
      }
    }

    // Realign remaining queue
    for (let i = 0; i < this.waitingQueue.length; i++) {
      const queued = this.waitingQueue[i];
      const targetPos = GAME_CONFIG.layout.waitingQueue[i];
      queued.moveToWaitingQueue(targetPos);
    }

    this.checkCounterService();
  }

  checkCounterService() {
    // Find all idle workers
    const idleWorkers = this.workers.filter(w => w.state === 'IDLE');
    if (idleWorkers.length === 0) return;

    // Match each idle worker with an unserved customer at the counter
    for (const slot of this.counterSlots) {
      const customer = slot.customer;
      if (customer && customer.active && customer.state === 'AT_COUNTER' && !customer.isBeingServed) {
        const availableWorker = idleWorkers.shift();
        if (!availableWorker) break;

        customer.isBeingServed = true;
        availableWorker.assignOrder(customer);
      }
    }
  }

  update(time, delta) {
    if (this.workers.some(w => w.state === 'IDLE')) {
      this.checkCounterService();
    }
  }
}
