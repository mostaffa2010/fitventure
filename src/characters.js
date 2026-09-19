/**
 * Fitventure - 3D Characters & AI Manager
 * Tech Stack: Three.js r128
 * Features:
 * 1. 3D Low-poly characters (Sphere head, cylinder body, worker caps).
 * 2. Natural 3D waddle animation (Z-tilt and vertical bounce while moving).
 * 3. Customer queueing, ordering logic, and worker delivery cycle.
 * 4. Multi-product orders: T-Shirts, Jeans, Hats.
 */

import { GAME_CONFIG, gameState } from './config.js';
import { RadialProgressRing } from './stations.js';

/**
 * Creates a low-poly 3D character mesh group
 */
export function create3DCharacterMesh({ isWorker = false, role = 'shopper', colorScheme = null }) {
  const group = new THREE.Group();

  // 1. Soft Ground Contact Shadow Disc
  const shadowGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.02, 16);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.01;
  group.add(shadow);
  group.shadowMesh = shadow;

  // 2. Avatar Visual Container (Handles waddle Z-tilt and vertical bounce)
  const visual = new THREE.Group();
  group.add(visual);
  group.visual = visual;

  // 3. Shoes / Feet
  const shoeGeo = new THREE.BoxGeometry(0.32, 0.22, 0.45);
  const shoeMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.position.set(-0.25, 0.12, 0.05);
  leftShoe.castShadow = true;
  visual.add(leftShoe);

  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
  rightShoe.position.set(0.25, 0.12, 0.05);
  rightShoe.castShadow = true;
  visual.add(rightShoe);

  // 4. Cylindrical Torso / Body
  let shirtColor = 0x3b82f6;
  if (isWorker) {
    if (role === 'tailor') shirtColor = 0x1e293b;
    else if (role === 'raymond') shirtColor = 0x0f766e;
    else if (role === 'lucas') shirtColor = 0x581c87;
    else if (role === 'emma') shirtColor = 0xbe185d;
  } else {
    shirtColor = colorScheme ? colorScheme.shirt : 0x3b82f6;
  }

  const torsoGeo = new THREE.CylinderGeometry(0.48, 0.54, 1.0, 16);
  const torsoMat = new THREE.MeshLambertMaterial({ color: shirtColor });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 0.72;
  torso.castShadow = true;
  torso.receiveShadow = true;
  visual.add(torso);

  if (isWorker) {
    // Tailor Apron
    const apronGeo = new THREE.BoxGeometry(0.65, 0.85, 0.12);
    const apronMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.position.set(0, 0.72, 0.48);
    apron.castShadow = true;
    visual.add(apron);

    // Measuring Tape
    const tapeGeo = new THREE.BoxGeometry(0.5, 0.1, 0.14);
    const tapeMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const tape = new THREE.Mesh(tapeGeo, tapeMat);
    tape.position.set(0, 0.95, 0.5);
    visual.add(tape);
  }

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8);
  const armMat = new THREE.MeshLambertMaterial({ color: shirtColor });
  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(-0.6, 0.7, 0);
  leftArm.rotation.z = Math.PI / 10;
  visual.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(0.6, 0.7, 0);
  rightArm.rotation.z = -Math.PI / 10;
  visual.add(rightArm);

  // 5. Head (Sphere)
  const headGeo = new THREE.SphereGeometry(0.48, 16, 16);
  const headMat = new THREE.MeshLambertMaterial({ color: GAME_CONFIG.colors.avatarSkin });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.6;
  head.castShadow = true;
  visual.add(head);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.16, 1.64, 0.44);
  visual.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.16, 1.64, 0.44);
  visual.add(rightEye);

  // 6. Headwear / Cap
  if (isWorker) {
    let capColor = 0xef4444;
    if (role === 'raymond') capColor = 0x10b981;
    else if (role === 'lucas') capColor = 0x8b5cf6;
    else if (role === 'emma') capColor = 0xf59e0b;

    // Cap Dome
    const capGeo = new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const capMat = new THREE.MeshLambertMaterial({ color: capColor });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 1.62;
    cap.castShadow = true;
    visual.add(cap);

    // Visor Brim
    const visorGeo = new THREE.BoxGeometry(0.65, 0.08, 0.35);
    const visorMat = new THREE.MeshLambertMaterial({ color: capColor });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.7, 0.55);
    visual.add(visor);
  } else {
    // Shopper Hair
    const hairColor = colorScheme ? colorScheme.hair : 0x1e293b;
    const hairGeo = new THREE.SphereGeometry(0.51, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const hairMat = new THREE.MeshLambertMaterial({ color: hairColor });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.64;
    visual.add(hair);
  }

  return group;
}

/**
 * Tailor Worker Class
 * Manages 3D path movement, natural waddle animation, and crafting loop.
 */
export class TailorWorker {
  constructor(scene, parentGroup, stationsMap, counterStation, options = {}) {
    this.scene = scene;
    this.stationsMap = stationsMap;
    this.counterStation = counterStation;

    this.id = options.id || 'tailor';
    this.name = options.name || 'Master Tailor';
    this.role = options.role || 'tailor';
    this.craftSpeedBonus = options.craftSpeedBonus || 1.0;

    this.homeX = options.homeX || -2.3;
    this.homeZ = options.homeZ || 2.3;

    this.mesh = create3DCharacterMesh({ isWorker: true, role: this.role });
    this.mesh.position.set(this.homeX, 0, this.homeZ);
    parentGroup.add(this.mesh);

    // Radial Progress Ring attached to world
    this.radialRing = new RadialProgressRing(scene, parentGroup);

    // Carried 3D garment mesh in hands
    this.createCarriedGarment();

    this.state = 'IDLE';
    this.activeCustomer = null;
    this.currentProduct = 'tshirt';
    this.waddleTime = 0;
    this.isWalking = false;

    // Movement path interpolation
    this.startX = this.homeX;
    this.startZ = this.homeZ;
    this.targetX = this.homeX;
    this.targetZ = this.homeZ;
    this.moveProgress = 1.0;
    this.moveDuration = 0.5;
    this.onMoveComplete = null;
  }

  createCarriedGarment() {
    this.carriedMesh = new THREE.Group();
    this.carriedMesh.position.set(0, 0.75, 0.55);

    const shirtGeo = new THREE.BoxGeometry(0.55, 0.16, 0.42);
    this.shirtMat = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
    const shirt = new THREE.Mesh(shirtGeo, this.shirtMat);
    shirt.castShadow = true;
    this.carriedMesh.add(shirt);

    this.carriedMesh.visible = false;
    this.mesh.visual.add(this.carriedMesh);
  }

  updateCarriedVisual(product) {
    if (product === 'jeans') {
      this.shirtMat.color.setHex(0x1d4ed8);
    } else if (product === 'hat') {
      this.shirtMat.color.setHex(0x9333ea);
    } else {
      this.shirtMat.color.setHex(0x3b82f6);
    }
  }

  moveTo(x, z, duration, onComplete) {
    this.startX = this.mesh.position.x;
    this.startZ = this.mesh.position.z;
    this.targetX = x;
    this.targetZ = z;
    this.moveDuration = Math.max(0.2, duration / gameState.getWorkerSpeedMultiplier());
    this.moveProgress = 0;
    this.isWalking = true;
    this.onMoveComplete = onComplete;

    // Rotate worker towards destination
    const dx = x - this.startX;
    const dz = z - this.startZ;
    this.mesh.rotation.y = Math.atan2(dx, dz);
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

    let stationX = -2.3;
    let stationZ = 2.3;

    if (this.currentProduct === 'jeans' && this.stationsMap.jeans) {
      stationX = 2.3;
      stationZ = 2.3;
    } else if (this.currentProduct === 'hat' && this.stationsMap.hats) {
      stationX = 0;
      stationZ = 5.3;
    }

    const dist = Math.hypot(stationX - this.mesh.position.x, stationZ - this.mesh.position.z);
    const duration = Math.max(0.25, dist * 0.18);

    this.moveTo(stationX, stationZ, duration, () => {
      this.startCrafting(stationX, stationZ);
    });
  }

  startCrafting(x, z) {
    this.state = 'CRAFTING';

    let durationSec = 1.8;
    if (this.currentProduct === 'jeans') {
      durationSec = gameState.getJeansCraftDuration() / 1000;
    } else if (this.currentProduct === 'hat') {
      durationSec = gameState.getHatsCraftDuration() / 1000;
    } else {
      durationSec = gameState.getSewingCraftDuration() / 1000;
    }

    durationSec = Math.max(0.3, durationSec / this.craftSpeedBonus);

    // Float radial progress ring above worker's head
    this.radialRing.start(this.mesh.position.x, 2.6, this.mesh.position.z, durationSec, () => {
      this.finishCrafting();
    });
  }

  finishCrafting() {
    this.updateCarriedVisual(this.currentProduct);
    this.carriedMesh.visible = true;

    this.state = 'WALKING_TO_COUNTER';

    const targetX = (this.activeCustomer && this.activeCustomer.counterSlot)
      ? this.activeCustomer.counterSlot.x
      : 0;
    const targetZ = 1.4;

    const dist = Math.hypot(targetX - this.mesh.position.x, targetZ - this.mesh.position.z);
    const duration = Math.max(0.25, dist * 0.18);

    this.moveTo(targetX, targetZ, duration, () => {
      this.serveCustomer();
    });
  }

  serveCustomer() {
    this.state = 'SERVING';
    this.carriedMesh.visible = false;

    if (this.activeCustomer && this.activeCustomer.active) {
      this.activeCustomer.receiveOrder(this.currentProduct);
    }

    setTimeout(() => {
      this.activeCustomer = null;
      this.state = 'IDLE';
    }, 200);
  }

  update(delta) {
    // Movement & Natural 3D Waddle Animation
    if (this.isWalking) {
      this.moveProgress += delta / this.moveDuration;
      const t = Math.min(1.0, this.moveProgress);

      this.mesh.position.x = this.startX + (this.targetX - this.startX) * t;
      this.mesh.position.z = this.startZ + (this.targetZ - this.startZ) * t;

      // 3D Natural Waddle: Z-tilt and vertical bounce
      this.waddleTime += delta * 14 * gameState.getWorkerSpeedMultiplier();
      this.mesh.visual.rotation.z = Math.sin(this.waddleTime) * 0.13;
      this.mesh.visual.position.y = Math.abs(Math.sin(this.waddleTime)) * 0.2;

      if (t >= 1.0) {
        this.isWalking = false;
        this.mesh.visual.rotation.z = 0;
        this.mesh.visual.position.y = 0;
        if (this.onMoveComplete) this.onMoveComplete();
      }
    } else {
      // Idle Breathing
      this.mesh.visual.rotation.z = 0;
      this.mesh.visual.position.y = 0;
    }

    if (this.radialRing) {
      this.radialRing.update(delta);
    }
  }
}

/**
 * 3D Shopper (Customer) Class
 */
export class Shopper {
  constructor(scene, parentGroup, shopperId, colorScheme) {
    this.scene = scene;
    this.id = shopperId;
    this.active = true;
    this.counterSlot = null;
    this.isBeingServed = false;

    this.orderedProduct = this.pickRandomProduct();

    this.mesh = create3DCharacterMesh({ isWorker: false, colorScheme });
    this.mesh.position.set(0, 0, -14.0);
    parentGroup.add(this.mesh);

    // Floating HTML Speech Bubble
    this.createOrderBubble();

    this.waddleTime = 0;
    this.isWalking = false;
    this.startX = 0;
    this.startZ = -14.0;
    this.targetX = 0;
    this.targetZ = -14.0;
    this.moveProgress = 1.0;
    this.moveDuration = 0.5;
    this.onMoveComplete = null;
  }

  pickRandomProduct() {
    const p = ['tshirt'];
    if (gameState.stage >= 2) {
      if (gameState.jeansStation.unlocked) p.push('jeans');
      if (gameState.hatsStation.unlocked) p.push('hat');
    }
    return p[Math.floor(Math.random() * p.length)];
  }

  createOrderBubble() {
    this.bubbleEl = document.createElement('div');
    this.bubbleEl.className = 'shopper-speech-bubble';
    const icon = this.orderedProduct === 'jeans' ? '👖' : (this.orderedProduct === 'hat' ? '🧢' : '👕');
    this.bubbleEl.innerHTML = `<span class="bubble-icon">${icon}</span><span class="bubble-qty">x1</span>`;
    this.bubbleEl.style.display = 'none';

    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) uiContainer.appendChild(this.bubbleEl);
  }

  updateBubblePosition(camera, width, height) {
    if (!this.bubbleEl || this.bubbleEl.style.display === 'none' || !this.mesh) return;

    const pos = new THREE.Vector3(this.mesh.position.x, this.mesh.position.y + 2.4, this.mesh.position.z);
    pos.project(camera);

    const screenX = ((pos.x + 1) / 2) * width;
    const screenY = ((-pos.y + 1) / 2) * height;

    this.bubbleEl.style.left = `${screenX}px`;
    this.bubbleEl.style.top = `${screenY}px`;
  }

  showOrderBubble() {
    if (this.bubbleEl) this.bubbleEl.style.display = 'flex';
  }

  hideOrderBubble() {
    if (this.bubbleEl) this.bubbleEl.style.display = 'none';
  }

  moveTo(x, z, duration, onComplete) {
    this.startX = this.mesh.position.x;
    this.startZ = this.mesh.position.z;
    this.targetX = x;
    this.targetZ = z;
    this.moveDuration = duration;
    this.moveProgress = 0;
    this.isWalking = true;
    this.onMoveComplete = onComplete;

    const dx = x - this.startX;
    const dz = z - this.startZ;
    this.mesh.rotation.y = Math.atan2(dx, dz);
  }

  receiveOrder(product) {
    this.hideOrderBubble();

    // Celebration Hop
    this.mesh.visual.position.y = 0.5;
    setTimeout(() => {
      this.mesh.visual.position.y = 0;
      this.payAndLeave(product);
    }, 200);
  }

  payAndLeave(product) {
    let profit = 4;
    if (product === 'jeans') profit = gameState.getJeansProfit();
    else if (product === 'hat') profit = gameState.getHatsProfit();
    else profit = gameState.getSewingProfit();

    this.scene.events.emit('customerPaid', {
      x: this.mesh.position.x,
      y: this.mesh.position.y,
      z: this.mesh.position.z,
      amount: profit
    });

    this.scene.events.emit('shopperVacatingSlot', {
      shopper: this,
      slot: this.counterSlot
    });
    this.counterSlot = null;

    // Walk off-screen right
    this.moveTo(18, this.mesh.position.z, 1.4, () => {
      this.active = false;
      if (this.bubbleEl && this.bubbleEl.parentNode) {
        this.bubbleEl.parentNode.removeChild(this.bubbleEl);
      }
      this.mesh.parent.remove(this.mesh);
      this.scene.events.emit('shopperExited', this);
    });
  }

  update(delta) {
    if (this.isWalking) {
      this.moveProgress += delta / this.moveDuration;
      const t = Math.min(1.0, this.moveProgress);

      this.mesh.position.x = this.startX + (this.targetX - this.startX) * t;
      this.mesh.position.z = this.startZ + (this.targetZ - this.startZ) * t;

      this.waddleTime += delta * 14;
      this.mesh.visual.rotation.z = Math.sin(this.waddleTime) * 0.12;
      this.mesh.visual.position.y = Math.abs(Math.sin(this.waddleTime)) * 0.18;

      if (t >= 1.0) {
        this.isWalking = false;
        this.mesh.visual.rotation.z = 0;
        this.mesh.visual.position.y = 0;
        if (this.onMoveComplete) this.onMoveComplete();
      }
    }
  }
}

/**
 * 3D Character & Queue Manager
 */
export class CharacterManager {
  constructor(scene, parentGroup, stationsMap, counterStation) {
    this.scene = scene;
    this.group = parentGroup;
    this.stationsMap = stationsMap;
    this.counterStation = counterStation;

    // Master Tailor
    this.tailor = new TailorWorker(scene, parentGroup, stationsMap, counterStation, {
      id: 'tailor',
      name: 'Master Tailor',
      role: 'tailor',
      homeX: -2.3,
      homeZ: 2.3
    });
    this.workers = [this.tailor];

    this.counterSlots = [
      { id: 0, x: -1.8, z: -1.5, customer: null },
      { id: 1, x: 1.8, z: -1.5, customer: null }
    ];

    this.shoppers = [];
    this.waitingQueue = [];
    this.nextShopperId = 1;

    this.spawnTimer = 0;
    this.spawnInterval = 2.8;

    // Event listeners
    scene.events.on('shopperVacatingSlot', (data) => this.handleSlotVacated(data.shopper, data.slot));
    scene.events.on('shopperExited', (shopper) => this.handleSlotVacated(shopper, null));

    gameState.on('upgradePurchased', (data) => {
      if (data.id === 'hire_raymond') this.spawnRaymond();
      else if (data.id === 'master_tailor') this.spawnLucas();
      else if (data.id === 'hire_cashier_emma') this.spawnEmma();
    });

    // Initial spawns
    setTimeout(() => this.trySpawnShopper(), 400);
    setTimeout(() => this.trySpawnShopper(), 1200);
  }

  spawnRaymond() {
    if (this.workers.some(w => w.id === 'raymond')) return;
    const raymond = new TailorWorker(this.scene, this.group, this.stationsMap, this.counterStation, {
      id: 'raymond',
      name: 'Raymond',
      role: 'raymond',
      homeX: 0,
      homeZ: 2.3
    });
    this.workers.push(raymond);
  }

  spawnLucas() {
    if (this.workers.some(w => w.id === 'lucas')) return;
    const lucas = new TailorWorker(this.scene, this.group, this.stationsMap, this.counterStation, {
      id: 'lucas',
      name: 'Master Lucas',
      role: 'lucas',
      craftSpeedBonus: 1.25,
      homeX: 2.3,
      homeZ: 2.3
    });
    this.workers.push(lucas);
  }

  spawnEmma() {
    if (this.emmaMesh) return;
    this.emmaMesh = create3DCharacterMesh({ isWorker: true, role: 'emma' });
    this.emmaMesh.position.set(0, 0, 1.4);
    this.group.add(this.emmaMesh);
  }

  trySpawnShopper() {
    const maxWaiting = gameState.getMaxQueueCapacity();
    const totalShoppers = this.counterSlots.filter(s => s.customer !== null).length + this.waitingQueue.length;
    if (totalShoppers >= this.counterSlots.length + maxWaiting) return;

    const palette = GAME_CONFIG.colors.shopperPalette[Math.floor(Math.random() * GAME_CONFIG.colors.shopperPalette.length)];
    const shopper = new Shopper(this.scene, this.group, this.nextShopperId++, palette);
    this.shoppers.push(shopper);

    const freeSlot = this.counterSlots.find(s => s.customer === null);
    if (freeSlot) {
      freeSlot.customer = shopper;
      shopper.counterSlot = freeSlot;
      shopper.moveTo(freeSlot.x, freeSlot.z, 1.1, () => {
        shopper.showOrderBubble();
        this.checkCounterService();
      });
    } else if (this.waitingQueue.length < maxWaiting) {
      const waitIdx = this.waitingQueue.length;
      const waitPos = GAME_CONFIG.layout.waitingQueue[waitIdx];
      this.waitingQueue.push(shopper);
      shopper.moveTo(waitPos.x, waitPos.z, 1.1);
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
        const next = this.waitingQueue.shift();
        cs.customer = next;
        next.counterSlot = cs;
        next.moveTo(cs.x, cs.z, 0.65, () => {
          next.showOrderBubble();
          this.checkCounterService();
        });
      }
    }

    for (let i = 0; i < this.waitingQueue.length; i++) {
      const queued = this.waitingQueue[i];
      const targetPos = GAME_CONFIG.layout.waitingQueue[i];
      queued.moveTo(targetPos.x, targetPos.z, 0.45);
    }

    this.checkCounterService();
  }

  checkCounterService() {
    const idleWorkers = this.workers.filter(w => w.state === 'IDLE');
    if (idleWorkers.length === 0) return;

    for (const slot of this.counterSlots) {
      const customer = slot.customer;
      if (customer && customer.active && !customer.isBeingServed && !customer.isWalking) {
        const worker = idleWorkers.shift();
        if (!worker) break;

        customer.isBeingServed = true;
        worker.assignOrder(customer);
      }
    }
  }

  update(delta, camera, width, height) {
    // Spawner
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.trySpawnShopper();
    }

    // Workers
    this.workers.forEach(w => w.update(delta));

    // Shoppers
    for (let i = this.shoppers.length - 1; i >= 0; i--) {
      const s = this.shoppers[i];
      s.update(delta);
      s.updateBubblePosition(camera, width, height);
      if (!s.active) {
        this.shoppers.splice(i, 1);
      }
    }

    // Check service
    if (this.workers.some(w => w.state === 'IDLE')) {
      this.checkCounterService();
    }
  }
}
