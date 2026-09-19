/**
 * Fitventure - 3D Characters & AI Service Loop
 * Perspective: Low-Poly 3D Isometric Top-Down
 * Tech Stack: Three.js r128
 * Features:
 * 1. Reliable customer spawner: Spawns 1st customer within 1s, subsequent every 3.5s.
 * 2. Shoppers walk down from crosswalk zebra stripes to Slot 1 / Slot 2 at counter.
 * 3. 3D Order speech bubble with T-shirt icon (👕) pops up with juicy bounce.
 * 4. Master Tailor worker pathfinds to sewing table, crafts with 3D radial progress ring, and delivers.
 * 5. Customer celebration hop, 3D floating coin payment, and graceful slot succession.
 * 6. Natural 3D waddle animation (Z-tilt and vertical bounce during locomotion).
 */

import { GAME_CONFIG, gameState } from './config.js';
import { RadialProgressRing } from './stations.js';

/**
 * Helper to draw a rounded rectangle on a 2D canvas
 */
function drawRoundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

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
    shirtColor = (colorScheme && colorScheme.shirt) ? colorScheme.shirt : 0xef4444;
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

    // Measuring Tape over neck
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
    const hairColor = (colorScheme && colorScheme.hair) ? colorScheme.hair : 0x1e293b;
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
  constructor(app, parentGroup, stationsMap, counterStation, options = {}) {
    this.app = app;
    this.scene = app.scene;
    this.events = app.events;
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

    // 3D Radial Progress Ring attached to world
    this.radialRing = new RadialProgressRing(this.scene, parentGroup);

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

    const dx = x - this.startX;
    const dz = z - this.startZ;
    if (Math.hypot(dx, dz) > 0.05) {
      this.mesh.rotation.y = Math.atan2(dx, dz);
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
    }, 180);
  }

  update(delta) {
    // Movement & Natural 3D Waddle Animation
    if (this.isWalking) {
      this.moveProgress += delta / this.moveDuration;
      const t = Math.min(1.0, this.moveProgress);

      this.mesh.position.x = this.startX + (this.targetX - this.startX) * t;
      this.mesh.position.z = this.startZ + (this.targetZ - this.startZ) * t;

      // Natural 3D Waddle: Z-tilt and vertical bounce
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
  constructor(app, parentGroup, shopperId, colorScheme) {
    this.app = app;
    this.scene = app.scene;
    this.events = app.events;
    this.id = shopperId;
    this.active = true;
    this.counterSlot = null;
    this.isBeingServed = false;

    this.orderedProduct = this.pickRandomProduct();

    this.mesh = create3DCharacterMesh({ isWorker: false, colorScheme });
    // Spawn at crosswalk zebra lines (Z = -13.5)
    this.mesh.position.set((Math.random() - 0.5) * 1.0, 0, -13.5);
    parentGroup.add(this.mesh);

    // 3D Order Speech Bubble (Billboard Sprite with juicy pop)
    this.create3DOrderBubble();
    // HTML Speech Bubble fallback
    this.createHTMLOrderBubble();

    this.waddleTime = 0;
    this.isWalking = false;
    this.startX = this.mesh.position.x;
    this.startZ = this.mesh.position.z;
    this.targetX = this.mesh.position.x;
    this.targetZ = this.mesh.position.z;
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

  /**
   * 3D Billboard Speech Bubble with T-shirt icon (👕)
   */
  create3DOrderBubble() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Rounded speech bubble background
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 5;
    drawRoundRect(ctx, 12, 10, 104, 76, 18);
    ctx.fill();
    ctx.stroke();

    // Triangle tail pointing down to customer
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(52, 85);
    ctx.lineTo(64, 106);
    ctx.lineTo(76, 85);
    ctx.closePath();
    ctx.fill();

    // Icon (👕, 👖, 🧢)
    const icon = this.orderedProduct === 'jeans' ? '👖' : (this.orderedProduct === 'hat' ? '🧢' : '👕');
    ctx.font = '52px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 64, 48);

    const tex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
    this.bubbleSprite = new THREE.Sprite(spriteMat);
    this.bubbleSprite.position.set(0, 2.7, 0);
    this.bubbleSprite.scale.set(1.5, 1.5, 1.5);
    this.bubbleSprite.visible = false;
    this.mesh.add(this.bubbleSprite);
  }

  createHTMLOrderBubble() {
    this.bubbleEl = document.createElement('div');
    this.bubbleEl.className = 'shopper-speech-bubble';
    const icon = this.orderedProduct === 'jeans' ? '👖' : (this.orderedProduct === 'hat' ? '🧢' : '👕');
    this.bubbleEl.innerHTML = `<span class="bubble-icon">${icon}</span><span class="bubble-qty">x1</span>`;
    this.bubbleEl.style.display = 'none';

    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) uiContainer.appendChild(this.bubbleEl);
  }

  showOrderBubble() {
    if (this.bubbleSprite) {
      this.bubbleSprite.visible = true;
      // Juicy Pop Animation
      this.bubbleSprite.scale.set(0.2, 0.2, 0.2);
      let t = 0;
      const popAnim = () => {
        t += 0.18;
        if (t < 1.0) {
          const s = 0.2 + (1.5 - 0.2) * Math.sin(t * Math.PI * 0.5) * 1.15;
          this.bubbleSprite.scale.set(s, s, s);
          requestAnimationFrame(popAnim);
        } else {
          this.bubbleSprite.scale.set(1.5, 1.5, 1.5);
        }
      };
      popAnim();
    }
    if (this.bubbleEl) this.bubbleEl.style.display = 'flex';
  }

  hideOrderBubble() {
    if (this.bubbleSprite) this.bubbleSprite.visible = false;
    if (this.bubbleEl) this.bubbleEl.style.display = 'none';
  }

  updateBubblePosition(camera, width, height) {
    if (!this.bubbleEl || this.bubbleEl.style.display === 'none' || !this.mesh) return;

    const pos = new THREE.Vector3(this.mesh.position.x, this.mesh.position.y + 2.5, this.mesh.position.z);
    pos.project(camera);

    const screenX = ((pos.x + 1) / 2) * width;
    const screenY = ((-pos.y + 1) / 2) * height;

    this.bubbleEl.style.left = `${screenX}px`;
    this.bubbleEl.style.top = `${screenY}px`;
  }

  moveTo(x, z, duration, onComplete) {
    this.startX = this.mesh.position.x;
    this.startZ = this.mesh.position.z;
    this.targetX = x;
    this.targetZ = z;
    this.moveDuration = Math.max(0.3, duration);
    this.moveProgress = 0;
    this.isWalking = true;
    this.onMoveComplete = onComplete;

    const dx = x - this.startX;
    const dz = z - this.startZ;
    if (Math.hypot(dx, dz) > 0.05) {
      this.mesh.rotation.y = Math.atan2(dx, dz);
    }
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

    this.events.emit('customerPaid', {
      x: this.mesh.position.x,
      y: this.mesh.position.y,
      z: this.mesh.position.z,
      amount: profit
    });

    this.events.emit('shopperVacatingSlot', {
      shopper: this,
      slot: this.counterSlot
    });
    this.counterSlot = null;

    // Walk off-screen to the right (X: 18)
    this.moveTo(18, this.mesh.position.z, 1.8, () => {
      this.active = false;
      if (this.bubbleEl && this.bubbleEl.parentNode) {
        this.bubbleEl.parentNode.removeChild(this.bubbleEl);
      }
      if (this.mesh.parent) {
        this.mesh.parent.remove(this.mesh);
      }
      this.events.emit('shopperExited', this);
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
  constructor(app, parentGroup, stationsMap, counterStation) {
    this.app = app;
    this.scene = app.scene;
    this.events = app.events;
    this.group = parentGroup;
    this.stationsMap = stationsMap;
    this.counterStation = counterStation;

    // Master Tailor Worker
    this.tailor = new TailorWorker(app, parentGroup, stationsMap, counterStation, {
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

    // Spawner Configuration:
    // First shopper spawns within 1 second of loading, subsequent every 3.5 seconds
    this.spawnInterval = 3.5;
    this.spawnTimer = 2.7; // Reaches 3.5s in ~0.8s on the animate loop!

    // Event listeners
    this.events.on('shopperVacatingSlot', (data) => this.handleSlotVacated(data.shopper, data.slot));
    this.events.on('shopperExited', (shopper) => this.handleSlotVacated(shopper, null));

    gameState.on('upgradePurchased', (data) => {
      if (data.id === 'hire_raymond') this.spawnRaymond();
      else if (data.id === 'master_tailor') this.spawnLucas();
      else if (data.id === 'hire_cashier_emma') this.spawnEmma();
    });

    // Safeguard spawn: guarantee first shopper within 1s even if browser timer delays
    setTimeout(() => {
      if (this.shoppers.length === 0) {
        this.trySpawnShopper();
      }
    }, 800);
  }

  spawnRaymond() {
    if (this.workers.some(w => w.id === 'raymond')) return;
    const raymond = new TailorWorker(this.app, this.group, this.stationsMap, this.counterStation, {
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
    const lucas = new TailorWorker(this.app, this.group, this.stationsMap, this.counterStation, {
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
    const activeCounterCount = this.counterSlots.filter(s => s.customer !== null).length;
    const totalShoppers = activeCounterCount + this.waitingQueue.length;
    if (totalShoppers >= this.counterSlots.length + maxWaiting) return;

    const paletteList = GAME_CONFIG.colors.shopperPalette || [
      { shirt: 0xef4444, hair: 0x1e293b },
      { shirt: 0x3b82f6, hair: 0x78350f },
      { shirt: 0x10b981, hair: 0xd97706 }
    ];
    const palette = paletteList[Math.floor(Math.random() * paletteList.length)];

    const shopper = new Shopper(this.app, this.group, this.nextShopperId++, palette);
    this.shoppers.push(shopper);

    const freeSlot = this.counterSlots.find(s => s.customer === null);
    if (freeSlot) {
      freeSlot.customer = shopper;
      shopper.counterSlot = freeSlot;
      // Walk down from crosswalk to the slot
      shopper.moveTo(freeSlot.x, freeSlot.z, 2.0, () => {
        // Face the boutique counter (facing +Z)
        shopper.mesh.rotation.y = 0;
        shopper.showOrderBubble();
        this.checkCounterService();
      });
    } else if (this.waitingQueue.length < maxWaiting) {
      const waitIdx = this.waitingQueue.length;
      const waitPos = GAME_CONFIG.layout.waitingQueue[waitIdx];
      this.waitingQueue.push(shopper);
      shopper.moveTo(waitPos.x, waitPos.z, 2.0, () => {
        shopper.mesh.rotation.y = 0;
      });
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
        next.moveTo(cs.x, cs.z, 0.8, () => {
          next.mesh.rotation.y = 0;
          next.showOrderBubble();
          this.checkCounterService();
        });
      }
    }

    for (let i = 0; i < this.waitingQueue.length; i++) {
      const queued = this.waitingQueue[i];
      const targetPos = GAME_CONFIG.layout.waitingQueue[i];
      queued.moveTo(targetPos.x, targetPos.z, 0.5, () => {
        queued.mesh.rotation.y = 0;
      });
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
    // Spawner timer tick
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.trySpawnShopper();
    }

    // Workers update
    this.workers.forEach(w => w.update(delta));

    // Shoppers update
    for (let i = this.shoppers.length - 1; i >= 0; i--) {
      const s = this.shoppers[i];
      s.update(delta);
      s.updateBubblePosition(camera, width, height);
      if (!s.active) {
        this.shoppers.splice(i, 1);
      }
    }

    // Immediate counter service check
    if (this.workers.some(w => w.state === 'IDLE')) {
      this.checkCounterService();
    }
  }
}
