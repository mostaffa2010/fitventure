/**
 * Fitventure - Characters & AI Manager
 * Cylindrical flat-design avatars, tailor worker with red cap,
 * shoppers with queue logic, and floating order speech bubbles.
 */

import { GAME_CONFIG, gameState } from './config.js';

/**
 * Procedural 2.5D Cylindrical Avatar Generator
 */
export function createAvatarContainer(scene, { isWorker = false, colorScheme = null }) {
  const container = scene.add.container(0, 0);
  const g = scene.add.graphics();
  container.add(g);

  // 1. Soft ground shadow
  g.fillStyle(0x000000, 0.25);
  g.fillEllipse(0, 24, 40, 16);

  // 2. Shoes / Feet
  g.fillStyle(0x2c3e50, 1.0);
  g.fillRoundedRect(-14, 18, 10, 8, 3);
  g.fillRoundedRect(4, 18, 10, 8, 3);

  // 3. Cylindrical Body / Torso
  const shirtColor = isWorker 
    ? GAME_CONFIG.colors.workerShirt 
    : (colorScheme ? colorScheme.shirt : 0x3498db);
  
  // Body shadow side
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
    // Mini scissors in pocket
    g.fillStyle(0x7f8c8d, 1.0);
    g.fillRect(-2, 7, 4, 5);
  } else {
    // Casual shopper details: button collar / stripes
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

  // 4. Head (Smooth spherical cylinder)
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

  // 5. Headwear / Hair
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
  return container;
}

/**
 * Tailor Worker Class
 * Moves between Sewing Table and Counter, crafts T-shirts, delivers to customers
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

    // Folded T-shirt carried in hands
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
    this.container.add(this.carriedShirt);

    this.state = 'IDLE'; // IDLE, WALKING_TO_SEWING, CRAFTING, WALKING_TO_COUNTER, SERVING
    this.activeCustomer = null;

    // Start idle bobbing
    this.startIdleAnimation();
  }

  startIdleAnimation() {
    if (this.walkTween) this.walkTween.stop();
    this.idleTween = this.scene.tweens.add({
      targets: this.container,
      scaleY: 1.03,
      scaleX: 0.98,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  startWalkAnimation() {
    if (this.idleTween) this.idleTween.stop();
    this.walkTween = this.scene.tweens.add({
      targets: this.container,
      y: '-=4',
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeInOut'
    });
  }

  stopWalkAnimation() {
    if (this.walkTween) this.walkTween.stop();
    this.startIdleAnimation();
  }

  assignOrder(customer) {
    if (this.state !== 'IDLE' && this.state !== 'WAITING_FOR_ORDER') return false;
    this.activeCustomer = customer;
    this.processOrder();
    return true;
  }

  processOrder() {
    // 1. Move to sewing station if not already there
    this.state = 'WALKING_TO_SEWING';
    this.startWalkAnimation();
    const destX = GAME_CONFIG.layout.sewingTable.workerStopX;
    const destY = GAME_CONFIG.layout.sewingTable.workerStopY;

    this.scene.tweens.add({
      targets: this.container,
      x: destX,
      y: destY,
      duration: 900,
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

    // Worker sewing movement (gentle swaying hands/torso)
    this.craftTween = this.scene.tweens.add({
      targets: this.container,
      angle: { from: -2, to: 2 },
      scaleY: { from: 0.97, to: 1.02 },
      duration: 250,
      yoyo: true,
      repeat: Math.floor(duration / 250),
      ease: 'Sine.easeInOut'
    });
  }

  finishCrafting() {
    if (this.craftTween) this.craftTween.stop();
    this.container.angle = 0;
    this.container.setScale(1);

    // Pick up folded T-shirt
    this.carriedShirt.setVisible(true);

    // 2. Walk to counter to serve customer
    this.state = 'WALKING_TO_COUNTER';
    this.startWalkAnimation();

    const destX = GAME_CONFIG.layout.counter.x;
    const destY = GAME_CONFIG.layout.counter.workerStopY;

    this.scene.tweens.add({
      targets: this.container,
      x: destX,
      y: destY,
      duration: 1000,
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

    // Brief delay before returning to idle/next order
    this.scene.time.delayedCall(400, () => {
      this.activeCustomer = null;
      this.state = 'IDLE';
    });
  }
}

/**
 * Shopper (Customer) Class
 * Walks in from crosswalk, joins queue, orders T-shirt, pays and exits
 */
export class Shopper {
  constructor(scene, shopperId, colorScheme) {
    this.scene = scene;
    this.id = shopperId;
    this.active = true;
    this.queueIndex = -1;

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
    this.speechBubble = this.scene.add.container(0, -60);
    this.speechBubble.setVisible(false);
    this.container.add(this.speechBubble);

    const bg = this.scene.add.graphics();
    // Drop shadow
    bg.fillStyle(0x000000, 0.2);
    bg.fillRoundedRect(-38, -26, 76, 44, 10);
    bg.fillTriangle(0, 24, -8, 17, 8, 17);

    // Clean white bubble container
    bg.fillStyle(0xffffff, 1.0);
    bg.fillRoundedRect(-40, -28, 80, 44, 10);
    // Bubble pointer down
    bg.fillTriangle(0, 22, -8, 15, 8, 15);
    // Subtle inner border
    bg.lineStyle(2, 0xe2e8f0, 0.8);
    bg.strokeRoundedRect(-40, -28, 80, 44, 10);
    this.speechBubble.add(bg);

    // T-shirt Product Icon (Stylized 👕)
    this.tshirtIcon = this.scene.add.text(-12, -7, '👕', {
      fontSize: '24px'
    }).setOrigin(0.5);
    this.speechBubble.add(this.tshirtIcon);

    // Order quantity / price text
    this.orderText = this.scene.add.text(16, -6, 'x1', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#2d3748'
    }).setOrigin(0.5);
    this.speechBubble.add(this.orderText);

    // Floating bob animation for speech bubble
    this.bubbleTween = this.scene.tweens.add({
      targets: this.speechBubble,
      y: '-=5',
      duration: 700,
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
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  hideOrderBubble() {
    this.speechBubble.setVisible(false);
  }

  moveTo(x, y, duration = 800, onComplete = null) {
    // Subtle walking wobble
    const walkBob = this.scene.tweens.add({
      targets: this.container,
      scaleY: 0.95,
      yoyo: true,
      repeat: Math.floor(duration / 180),
      duration: 180
    });

    this.scene.tweens.add({
      targets: this.container,
      x: x,
      y: y,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        walkBob.stop();
        this.container.setScale(1);
        if (onComplete) onComplete();
      }
    });
  }

  moveToQueueSlot(slotIndex, onArrived = null) {
    this.queueIndex = slotIndex;
    const targetSlot = GAME_CONFIG.layout.queue[slotIndex];
    const dist = Phaser.Math.Distance.Between(this.container.x, this.container.y, targetSlot.x, targetSlot.y);
    const duration = Math.max(400, (dist / 140) * 1000);

    this.moveTo(targetSlot.x, targetSlot.y, duration, () => {
      if (slotIndex === 0) {
        // Front of counter -> Place order!
        this.state = 'AT_COUNTER';
        this.showOrderBubble();
      } else {
        this.state = 'IN_QUEUE';
      }
      if (onArrived) onArrived();
    });
  }

  receiveOrder() {
    this.state = 'SERVED';
    // Switch speech bubble to celebration
    this.tshirtIcon.setText('💚');
    this.orderText.setText('');

    // Trigger payment after tiny delight pause
    this.scene.time.delayedCall(450, () => {
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

    // Walk off-screen to the right sidewalk
    this.moveTo(760, this.container.y, 1400, () => {
      this.active = false;
      this.container.destroy();
      this.scene.events.emit('shopperExited', this);
    });
  }
}

/**
 * Character & Queue Manager
 * Coordinates shoppers, queue progression, and worker assignments
 */
export class CharacterManager {
  constructor(scene, sewingStation, counterStation) {
    this.scene = scene;
    this.sewingStation = sewingStation;
    this.counterStation = counterStation;

    this.worker = new TailorWorker(scene, sewingStation, counterStation);
    this.shoppers = [];
    this.maxQueue = GAME_CONFIG.layout.queue.length; // 4 shoppers max
    this.nextShopperId = 1;

    // Shopper Spawner Timer
    this.spawnTimer = scene.time.addEvent({
      delay: 3600,
      callback: () => this.trySpawnShopper(),
      loop: true
    });

    // Listen for customer exit
    scene.events.on('shopperExited', (shopper) => {
      const idx = this.shoppers.indexOf(shopper);
      if (idx !== -1) {
        this.shoppers.splice(idx, 1);
      }
      this.advanceQueue();
    });

    // Initial first shopper spawn
    scene.time.delayedCall(800, () => this.trySpawnShopper());
  }

  trySpawnShopper() {
    if (this.shoppers.length >= this.maxQueue) return;

    const palette = Phaser.Utils.Array.GetRandom(GAME_CONFIG.colors.shopperPalette);
    const shopper = new Shopper(this.scene, this.nextShopperId++, palette);
    const targetSlot = this.shoppers.length;
    this.shoppers.push(shopper);

    shopper.moveToQueueSlot(targetSlot, () => {
      this.checkCounterService();
    });
  }

  advanceQueue() {
    for (let i = 0; i < this.shoppers.length; i++) {
      const shopper = this.shoppers[i];
      if (shopper.active && shopper.queueIndex !== i) {
        shopper.moveToQueueSlot(i, () => {
          this.checkCounterService();
        });
      }
    }
    this.checkCounterService();
  }

  checkCounterService() {
    const frontShopper = this.shoppers[0];
    if (frontShopper && frontShopper.state === 'AT_COUNTER' && this.worker.state === 'IDLE') {
      this.worker.assignOrder(frontShopper);
    }
  }

  update(time, delta) {
    if (this.worker.state === 'IDLE') {
      this.checkCounterService();
    }
  }
}
