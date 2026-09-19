/**
 * Fitventure - Characters & AI Manager
 * Cylindrical flat-design avatars, tailor worker with red cap,
 * shoppers with horizontal queue logic, procedural waddle animations,
 * and floating order speech bubbles.
 */

import { GAME_CONFIG, gameState } from './config.js';

/**
 * Procedural 2.5D Cylindrical Avatar Generator
 * Supports continuous rotation wobble (-6deg to +6deg) and y-axis squash/bounce every 120ms
 */
export function createAvatarContainer(scene, { isWorker = false, colorScheme = null }) {
  const container = scene.add.container(0, 0);

  // 1. Soft Ground Shadow (stays grounded on floor, squashes with jump)
  const shadow = scene.add.graphics();
  shadow.fillStyle(0x000000, 0.25);
  shadow.fillEllipse(0, 24, 40, 16);
  container.add(shadow);
  container.shadow = shadow;

  // 2. Avatar Visual Container (Handles rotational wobble, squash, stretch, bounce)
  const bodyVisual = scene.add.container(0, 0);
  container.add(bodyVisual);
  container.bodyVisual = bodyVisual;

  const g = scene.add.graphics();
  bodyVisual.add(g);

  // 3. Shoes / Feet
  g.fillStyle(0x2c3e50, 1.0);
  g.fillRoundedRect(-14, 18, 10, 8, 3);
  g.fillRoundedRect(4, 18, 10, 8, 3);

  // 4. Cylindrical Body / Torso
  const shirtColor = isWorker 
    ? GAME_CONFIG.colors.workerShirt 
    : (colorScheme ? colorScheme.shirt : 0x3498db);
  
  // Torso base
  g.fillStyle(shirtColor, 1.0);
  g.fillRoundedRect(-16, -6, 32, 28, 6);

  if (isWorker) {
    // Tailor Boutique Apron (crisp cream fabric with leather straps)
    g.fillStyle(0xf5f6fa, 1.0);
    g.fillRoundedRect(-12, -2, 24, 24, 4);
    // Apron tape measure accent
    g.fillStyle(0xf1c40f, 1.0);
    g.fillRect(-10, 4, 20, 3);
    // Apron pocket
    g.fillStyle(0xdcdde1, 1.0);
    g.fillRoundedRect(-8, 10, 16, 9, 2);
    // Mini shears in pocket
    g.fillStyle(0x7f8c8d, 1.0);
    g.fillRect(-2, 7, 4, 5);
  } else {
    // Casual shopper details: button collar / vertical placket
    g.fillStyle(0xffffff, 0.4);
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
  g.fillStyle(0x2c3e50, 1.0);
  g.fillCircle(-5, -17, 2.5); // Left eye
  g.fillCircle(5, -17, 2.5);  // Right eye
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(-6, -18, 1);   // Eye glint
  g.fillCircle(4, -18, 1);

  // Cute smile
  g.lineStyle(2, 0x2c3e50, 0.8);
  g.beginPath();
  g.arc(0, -13, 5, 0.2 * Math.PI, 0.8 * Math.PI, false);
  g.strokePath();

  // 6. Headwear / Hair
  if (isWorker) {
    // Iconic Eatventure-style Red Baseball Cap
    // Cap dome
    g.fillStyle(GAME_CONFIG.colors.workerCap, 1.0);
    g.beginPath();
    g.arc(0, -22, 16, Math.PI, 0, false);
    g.closePath();
    g.fillPath();

    // Cap front visor/brim extending forward
    g.fillStyle(0xc0392b, 1.0); // darker red shade
    g.fillRoundedRect(-14, -23, 28, 7, 3);
    // Button on top of cap
    g.fillStyle(0xffffff, 1.0);
    g.fillCircle(0, -38, 3);
  } else {
    // Shopper Hair
    const hairColor = colorScheme ? colorScheme.hair : 0x2c3e50;
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

    // Continuous rotation wobble: -6deg to +6deg
    const wobbleTween = scene.tweens.add({
      targets: bodyVisual,
      angle: { from: -6, to: 6 },
      duration: 120,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Y-axis squash and bounce every 120ms during movement
    const squashBounceTween = scene.tweens.add({
      targets: bodyVisual,
      scaleY: { from: 0.90, to: 1.08 },
      scaleX: { from: 1.06, to: 0.95 },
      y: { from: 0, to: -6 },
      duration: 120,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeInOut'
    });

    // Ground shadow contraction during bounce
    const shadowTween = scene.tweens.add({
      targets: shadow,
      scaleX: { from: 1.08, to: 0.92 },
      scaleY: { from: 1.05, to: 0.94 },
      duration: 120,
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
 * Moves between Sewing Table and Counter, crafts T-shirts, delivers to customers at horizontal slots
 */
export class TailorWorker {
  constructor(scene, sewingStation, counterStation) {
    this.scene = scene;
    this.sewingStation = sewingStation;
    this.counterStation = counterStation;

    this.container = createAvatarContainer(scene, { isWorker: true });
    this.container.x = GAME_CONFIG.layout.sewingTable.workerStopX;
    this.container.y = GAME_CONFIG.layout.sewingTable.workerStopY;
    this.container.setDepth(15);

    // Folded T-shirt carried in hands (attached to bodyVisual so it bobs along with waddle)
    this.carriedShirt = scene.add.container(0, 10);
    const shirtG = scene.add.graphics();
    // Soft shadow
    shirtG.fillStyle(0x000000, 0.2);
    shirtG.fillRoundedRect(-11, -7, 22, 16, 3);
    // Crisp folded T-shirt
    shirtG.fillStyle(0x3498db, 1.0);
    shirtG.fillRoundedRect(-12, -8, 24, 16, 4);
    // Fold collar detail
    shirtG.fillStyle(0xffffff, 0.9);
    shirtG.fillRoundedRect(-6, -8, 12, 5, 2);
    this.carriedShirt.add(shirtG);
    this.carriedShirt.setVisible(false);
    this.container.bodyVisual.add(this.carriedShirt);

    this.state = 'IDLE'; // IDLE, WALKING_TO_SEWING, CRAFTING, WALKING_TO_COUNTER, SERVING
    this.activeCustomer = null;
  }

  startWalkAnimation() {
    this.container.startWaddle();
  }

  stopWalkAnimation() {
    this.container.stopWaddle();
  }

  assignOrder(customer) {
    if (this.state !== 'IDLE' && this.state !== 'WAITING_FOR_ORDER') return false;
    this.activeCustomer = customer;
    this.processOrder();
    return true;
  }

  processOrder() {
    // 1. Move to sewing station (fast & snappy loop: 450ms)
    this.state = 'WALKING_TO_SEWING';
    this.startWalkAnimation();
    const destX = GAME_CONFIG.layout.sewingTable.workerStopX;
    const destY = GAME_CONFIG.layout.sewingTable.workerStopY;

    this.scene.tweens.add({
      targets: this.container,
      x: destX,
      y: destY,
      duration: 450,
      ease: 'Linear',
      onComplete: () => {
        this.stopWalkAnimation();
        this.startCrafting();
      }
    });
  }

  startCrafting() {
    this.state = 'CRAFTING';
    const duration = gameState.getSewingCraftDuration();

    // Start radial progress bar above worker's head
    this.sewingStation.startProgress(duration, () => {
      this.finishCrafting();
    });

    // Worker sewing movement (gentle rhythmic swaying)
    this.craftTween = this.scene.tweens.add({
      targets: this.container.bodyVisual,
      angle: { from: -3, to: 3 },
      scaleY: { from: 0.96, to: 1.03 },
      duration: 220,
      yoyo: true,
      repeat: Math.floor(duration / 220),
      ease: 'Sine.easeInOut'
    });
  }

  finishCrafting() {
    if (this.craftTween) this.craftTween.stop();
    this.container.bodyVisual.angle = 0;
    this.container.bodyVisual.setScale(1);

    // Pick up folded T-shirt
    this.carriedShirt.setVisible(true);

    // 2. Walk to counter to serve customer at their specific horizontal slot (Slot 1: x:300, Slot 2: x:420)
    this.state = 'WALKING_TO_COUNTER';
    this.startWalkAnimation();

    const targetX = (this.activeCustomer && this.activeCustomer.counterSlot)
      ? this.activeCustomer.counterSlot.x
      : (this.activeCustomer ? this.activeCustomer.container.x : GAME_CONFIG.layout.counter.x);
    const destY = GAME_CONFIG.layout.counter.workerStopY;

    this.scene.tweens.add({
      targets: this.container,
      x: targetX,
      y: destY,
      duration: 500,
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

    // Quick reset to idle so next order can start immediately
    this.scene.time.delayedCall(250, () => {
      this.activeCustomer = null;
      this.state = 'IDLE';
    });
  }
}

/**
 * Shopper (Customer) Class
 * Walks in from crosswalk, fills horizontal slots (Slot 1: 300, Slot 2: 420)
 * or queues neatly behind them, orders T-shirt, pays and exits
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
    // Bubble pointer down
    bg.fillTriangle(0, 24, -9, 16, 9, 16);
    // Subtle inner border
    bg.lineStyle(2, 0xe2e8f0, 0.9);
    bg.strokeRoundedRect(-42, -30, 84, 48, 12);
    this.speechBubble.add(bg);

    // T-shirt Product Icon (Stylized 👕)
    this.tshirtIcon = this.scene.add.text(-14, -7, '👕', {
      fontSize: '26px'
    }).setOrigin(0.5);
    this.speechBubble.add(this.tshirtIcon);

    // Order quantity text (increased size for mobile)
    this.orderText = this.scene.add.text(16, -6, 'x1', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#1e293b'
    }).setOrigin(0.5);
    this.speechBubble.add(this.orderText);

    // Floating bob animation for speech bubble
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
    // Switch speech bubble to celebration
    this.tshirtIcon.setText('💚');
    this.orderText.setText('');

    // Little celebratory bounce
    this.scene.tweens.add({
      targets: this.container.bodyVisual,
      scaleY: 1.15,
      scaleX: 0.92,
      duration: 150,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    // Trigger payment after tiny delight pause
    this.scene.time.delayedCall(350, () => {
      this.payAndLeave();
    });
  }

  payAndLeave() {
    // Emit payment event
    const profit = gameState.getSewingProfit();
    this.scene.events.emit('customerPaid', {
      x: this.container.x,
      y: this.container.y - 40,
      amount: profit
    });

    this.hideOrderBubble();

    // Vacate slot immediately so waiting queue advances without delay
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
 * Coordinates shoppers across horizontal counter slots (Slot 1: 300, Slot 2: 420),
 * orderly waiting queue behind them, and worker assignments
 */
export class CharacterManager {
  constructor(scene, sewingStation, counterStation) {
    this.scene = scene;
    this.sewingStation = sewingStation;
    this.counterStation = counterStation;

    this.worker = new TailorWorker(scene, sewingStation, counterStation);
    
    // Horizontal counter service slots
    this.counterSlots = [
      { id: 0, x: 300, y: GAME_CONFIG.layout.counter.customerStopY, customer: null },
      { id: 1, x: 420, y: GAME_CONFIG.layout.counter.customerStopY, customer: null }
    ];

    // Neat waiting queue slots lined up behind the counter
    this.waitingQueue = [];
    this.maxWaiting = GAME_CONFIG.layout.waitingQueue.length; // 3 waiting shoppers max
    this.nextShopperId = 1;

    // Shopper Spawner Timer (healthy cadence for steady boutique flow)
    this.spawnTimer = scene.time.addEvent({
      delay: 3000,
      callback: () => this.trySpawnShopper(),
      loop: true
    });

    // Listen for customer vacating slot
    scene.events.on('shopperVacatingSlot', (data) => {
      this.handleSlotVacated(data.shopper, data.slot);
    });

    // Listen for customer exit
    scene.events.on('shopperExited', (shopper) => {
      // Safety fallback
      this.handleSlotVacated(shopper, null);
    });

    // Initial spawns to quickly fill slots
    scene.time.delayedCall(400, () => this.trySpawnShopper());
    scene.time.delayedCall(1500, () => this.trySpawnShopper());
  }

  trySpawnShopper() {
    // Maximum 2 at counter + 3 waiting = 5 customers max
    const totalShoppers = this.counterSlots.filter(s => s.customer !== null).length + this.waitingQueue.length;
    if (totalShoppers >= this.counterSlots.length + this.maxWaiting) return;

    const palette = Phaser.Utils.Array.GetRandom(GAME_CONFIG.colors.shopperPalette);
    const shopper = new Shopper(this.scene, this.nextShopperId++, palette);

    // 1. Check if an empty horizontal counter slot is available
    const freeSlot = this.counterSlots.find(s => s.customer === null);
    if (freeSlot) {
      freeSlot.customer = shopper;
      shopper.moveToCounterSlot(freeSlot, () => {
        this.checkCounterService();
      });
    } else if (this.waitingQueue.length < this.maxWaiting) {
      // 2. Queue neatly behind them
      const waitIdx = this.waitingQueue.length;
      const waitPos = GAME_CONFIG.layout.waitingQueue[waitIdx];
      this.waitingQueue.push(shopper);
      shopper.moveToWaitingQueue(waitPos);
    } else {
      // Overflow guard
      shopper.container.destroy();
    }
  }

  handleSlotVacated(shopper, slot) {
    // Clear customer reference from counterSlots
    for (const cs of this.counterSlots) {
      if (cs.customer === shopper || (slot && cs.id === slot.id)) {
        cs.customer = null;
      }
    }

    // Advance waiting queue to fill empty counter slots
    for (const cs of this.counterSlots) {
      if (cs.customer === null && this.waitingQueue.length > 0) {
        const nextShopper = this.waitingQueue.shift();
        cs.customer = nextShopper;
        nextShopper.moveToCounterSlot(cs, () => {
          this.checkCounterService();
        });
      }
    }

    // Move remaining waiting shoppers forward in queue
    for (let i = 0; i < this.waitingQueue.length; i++) {
      const queued = this.waitingQueue[i];
      const targetPos = GAME_CONFIG.layout.waitingQueue[i];
      queued.moveToWaitingQueue(targetPos);
    }

    this.checkCounterService();
  }

  checkCounterService() {
    if (this.worker.state !== 'IDLE') return;

    // Find the first customer waiting at a counter slot with an order
    for (const slot of this.counterSlots) {
      const customer = slot.customer;
      if (customer && customer.active && customer.state === 'AT_COUNTER' && !customer.isBeingServed) {
        customer.isBeingServed = true;
        this.worker.assignOrder(customer);
        break;
      }
    }
  }

  update(time, delta) {
    if (this.worker.state === 'IDLE') {
      this.checkCounterService();
    }
  }
}
