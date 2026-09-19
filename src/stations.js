/**
 * Fitventure - 3D Workstations & Crafting Tables
 * Perspective: Low-Poly 3D Isometric Top-Down
 * Tech Stack: Three.js r128
 * Features:
 * 1. 3D Sewing Table: Warm caramel wood base (0xb87333), miniature stylized 3D sewing machine,
 *    golden scissors, colorful fabric roll, and neat stack of folded pastel T-shirts.
 * 2. Pulsing Red Upgrade Badge (↑): Crisp circular red disc with clean white border and bold white up-arrow,
 *    anchored at top-right corner of table with continuous vertical bounce and scale pulse (1.0 to 1.15)
 *    active ONLY when player coins >= next upgrade cost.
 * 3. 3D Radial Circular Progress Ring (Torus arc) filling overhead during worker crafting.
 * 4. Station 2 (Jeans Table) & Station 3 (Hats Rack): Dotted unlockable bounding boxes in Stage 2.
 * 5. Floating 3D Gold Coins Spawner with arcing bezier physics.
 */

import { GAME_CONFIG, gameState } from './config.js';

/**
 * 3D Radial Circular Progress Ring (Torus ring filling overhead in bright green)
 */
export class RadialProgressRing {
  constructor(scene, parentGroup) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.visible = false;
    parentGroup.add(this.group);

    // Track Ring (Dark base ring)
    const trackGeo = new THREE.TorusGeometry(0.42, 0.07, 8, 24);
    trackGeo.rotateX(Math.PI / 2);
    const trackMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    this.group.add(trackMesh);

    // Active Filling Ring (Bright green arc)
    this.fillMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    this.fillMesh = null;
    this.duration = 1.0;
    this.elapsed = 0;
    this.active = false;
    this.onComplete = null;
  }

  start(x, y, z, duration, onComplete) {
    this.group.position.set(x, y, z);
    this.duration = duration;
    this.elapsed = 0;
    this.active = true;
    this.onComplete = onComplete;
    this.group.visible = true;
    this.updateRingArc(0.01);
  }

  stop() {
    this.active = false;
    this.group.visible = false;
  }

  update(delta) {
    if (!this.active) return;
    this.elapsed += delta;
    const progress = Math.min(1.0, this.elapsed / this.duration);
    this.updateRingArc(progress);

    if (this.elapsed >= this.duration) {
      this.stop();
      if (this.onComplete) this.onComplete();
    }
  }

  updateRingArc(progress) {
    if (this.fillMesh) {
      this.group.remove(this.fillMesh);
      this.fillMesh.geometry.dispose();
    }

    const arc = Math.max(0.05, Math.PI * 2 * Math.max(0, Math.min(1, progress)));
    const fillGeo = new THREE.TorusGeometry(0.42, 0.08, 8, 24, arc);
    fillGeo.rotateX(Math.PI / 2);
    fillGeo.rotateY(-Math.PI / 2); // Start from top
    this.fillMesh = new THREE.Mesh(fillGeo, this.fillMat);
    this.group.add(this.fillMesh);
  }
}

/**
 * Station 1: 3D Sewing Table (T-Shirts)
 * Warm caramel wood base, stylized white sewing machine, golden scissors,
 * colorful fabric roll, and neat stack of folded pastel T-shirts.
 */
export class SewingStation {
  constructor(scene, parentGroup) {
    this.scene = scene;
    const cfg = GAME_CONFIG.layout.station1;
    this.x = cfg.x;
    this.y = cfg.y;
    this.z = cfg.z;
    this.width = cfg.width;
    this.height = cfg.height;
    this.depth = cfg.depth;

    this.group = new THREE.Group();
    this.group.position.set(this.x, 0, this.z);
    parentGroup.add(this.group);

    this.clickTargets = [];

    this.build3DCaramelTable();
    this.buildRedArrowBadge();

    // Event listeners
    gameState.on('coinsChanged', () => this.updateRedBadgeVisibility());
    gameState.on('stationUpgraded', (data) => {
      if (data.station === 'sewing') {
        this.updateRedBadgeVisibility();
        this.playUpgradePop();
      }
    });
    gameState.on('stageRenovated', () => this.updateRedBadgeVisibility());
  }

  build3DCaramelTable() {
    const w = this.width;
    const h = this.height;
    const d = this.depth;
    const { colors } = GAME_CONFIG;

    // 1. Warm Caramel Oak Desk Body (0xb87333)
    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMat = new THREE.MeshLambertMaterial({ color: colors.tableCaramel });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = h / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bodyMesh.userData = { type: 'station', stationId: 'sewing' };
    this.group.add(bodyMesh);
    this.clickTargets.push(bodyMesh);

    // Front Storage Drawer & Brass Pull Knob
    const drawerGeo = new THREE.BoxGeometry(w * 0.7, h * 0.35, 0.1);
    const drawerMat = new THREE.MeshLambertMaterial({ color: 0x965018 });
    const drawer = new THREE.Mesh(drawerGeo, drawerMat);
    drawer.position.set(0, h * 0.45, -d / 2 - 0.05);
    this.group.add(drawer);

    const knobGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const knobMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.position.set(0, h * 0.45, -d / 2 - 0.15);
    this.group.add(knob);

    // 2. Beveled Polished Honey Tabletop Surface (0xdf8d3c)
    const topGeo = new THREE.BoxGeometry(w + 0.2, 0.18, d + 0.2);
    const topMat = new THREE.MeshLambertMaterial({ color: colors.tableHoney });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = h + 0.09;
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    topMesh.userData = { type: 'station', stationId: 'sewing' };
    this.group.add(topMesh);
    this.clickTargets.push(topMesh);

    // 3. Green Cutting Mat on Tabletop
    const matGeo = new THREE.BoxGeometry(w * 0.75, 0.04, d * 0.75);
    const matMat = new THREE.MeshLambertMaterial({ color: 0x10b981 });
    const matMesh = new THREE.Mesh(matGeo, matMat);
    matMesh.position.set(0, h + 0.2, 0);
    this.group.add(matMesh);

    // 4. Miniature Stylized 3D Sewing Machine (Right Side)
    const smGroup = new THREE.Group();
    smGroup.position.set(w * 0.28, h + 0.2, 0);

    const smBodyGeo = new THREE.BoxGeometry(0.9, 0.5, 0.45);
    const smBodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const smBody = new THREE.Mesh(smBodyGeo, smBodyMat);
    smBody.position.y = 0.25;
    smBody.castShadow = true;
    smGroup.add(smBody);

    // Arm & Needle Pillar
    const smArmGeo = new THREE.BoxGeometry(0.3, 0.45, 0.4);
    const smArm = new THREE.Mesh(smArmGeo, smBodyMat);
    smArm.position.set(-0.25, 0.55, 0);
    smGroup.add(smArm);

    const smTopGeo = new THREE.BoxGeometry(0.7, 0.2, 0.35);
    const smTop = new THREE.Mesh(smTopGeo, smBodyMat);
    smTop.position.set(-0.05, 0.7, 0);
    smGroup.add(smTop);

    // Chrome Needle
    const needleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    const needleMat = new THREE.MeshLambertMaterial({ color: 0xcfd8dc });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.set(0.2, 0.45, 0);
    smGroup.add(needle);

    // Silver Handwheel
    const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheel = new THREE.Mesh(wheelGeo, needleMat);
    wheel.position.set(0.48, 0.55, 0);
    wheel.castShadow = true;
    smGroup.add(wheel);

    // Golden Thread Spool Pin
    const spoolGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.22, 10);
    const spoolMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const spool = new THREE.Mesh(spoolGeo, spoolMat);
    spool.position.set(-0.15, 0.9, 0);
    smGroup.add(spool);

    this.group.add(smGroup);

    // 5. Golden Scissors Prop (Angled in Center)
    const scGeo = new THREE.BoxGeometry(0.42, 0.04, 0.16);
    const scMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const scissors = new THREE.Mesh(scGeo, scMat);
    scissors.position.set(-0.2, h + 0.22, 0.2);
    scissors.rotation.y = Math.PI / 4;
    scissors.castShadow = true;
    this.group.add(scissors);

    // 6. Colorful Fabric Roll (Turquoise Cloth Bolt with Inner Core)
    const rollGroup = new THREE.Group();
    rollGroup.position.set(-0.75, h + 0.35, 0.2);
    rollGroup.rotation.z = Math.PI / 2;

    const fabricGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.65, 16);
    const fabricMat = new THREE.MeshLambertMaterial({ color: 0x06b6d4 });
    const fabricRoll = new THREE.Mesh(fabricGeo, fabricMat);
    fabricRoll.castShadow = true;
    rollGroup.add(fabricRoll);

    const coreGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.68, 12);
    const coreMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    rollGroup.add(core);

    this.group.add(rollGroup);

    // 7. Neat Stack of Folded Pastel T-Shirts (Far Left)
    const pastelColors = [0xa7f3d0, 0xfecdd3, 0xbae6fd];
    pastelColors.forEach((col, idx) => {
      const shirtGeo = new THREE.BoxGeometry(0.65, 0.12, 0.55);
      const shirtMat = new THREE.MeshLambertMaterial({ color: col });
      const shirt = new THREE.Mesh(shirtGeo, shirtMat);
      shirt.position.set(-w * 0.32, h + 0.26 + idx * 0.12, -0.1);
      shirt.castShadow = true;
      this.group.add(shirt);
    });
  }

  /**
   * Pulsing Red Upgrade Badge (↑)
   * Anchored at the TOP-RIGHT corner of the tailoring table.
   * Features a clean white border and a bold white up-arrow (↑).
   * Active ONLY when player coins >= next upgrade cost.
   */
  buildRedArrowBadge() {
    this.badgeGroup = new THREE.Group();
    // Anchored at top-right corner of table
    this.baseBadgeX = this.width / 2 - 0.1;
    this.baseBadgeY = this.height + 0.9;
    this.baseBadgeZ = -this.depth / 2 + 0.25;

    this.badgeGroup.position.set(this.baseBadgeX, this.baseBadgeY, this.baseBadgeZ);
    this.group.add(this.badgeGroup);

    // 1. Crisp White Outer Border Ring Disc
    const borderGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.1, 28);
    borderGeo.rotateX(Math.PI / 3.4); // Angled to face camera
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.castShadow = true;
    this.badgeGroup.add(borderMesh);

    // 2. Vibrant Red Circular Disc Center
    const discGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.12, 28);
    discGeo.rotateX(Math.PI / 3.4);
    const discMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.castShadow = true;
    this.badgeGroup.add(discMesh);

    // 3. Crisp Bold White Up-Arrow (↑) Canvas Texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 160px "Fredoka", "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↑', 128, 120);

    const arrowTex = new THREE.CanvasTexture(canvas);
    const arrowPlaneGeo = new THREE.PlaneGeometry(0.72, 0.72);
    arrowPlaneGeo.rotateX(-Math.PI / 5.2);
    const arrowPlaneMat = new THREE.MeshBasicMaterial({
      map: arrowTex,
      transparent: true,
      side: THREE.DoubleSide
    });
    const arrowPlane = new THREE.Mesh(arrowPlaneGeo, arrowPlaneMat);
    arrowPlane.position.set(0, 0.05, 0.05);
    this.badgeGroup.add(arrowPlane);

    // Enable raycasting click interaction
    this.badgeGroup.userData = { type: 'station', stationId: 'sewing' };
    borderMesh.userData = { type: 'station', stationId: 'sewing' };
    discMesh.userData = { type: 'station', stationId: 'sewing' };
    arrowPlane.userData = { type: 'station', stationId: 'sewing' };

    this.clickTargets.push(borderMesh);
    this.clickTargets.push(discMesh);
    this.clickTargets.push(arrowPlane);

    this.updateRedBadgeVisibility();
  }

  updateRedBadgeVisibility() {
    const canAfford = gameState.canUpgradeSewing();
    this.badgeGroup.visible = canAfford;
  }

  update(delta, time) {
    if (this.badgeGroup && this.badgeGroup.visible) {
      // Smooth scale pulse (1.0 to 1.15)
      const pulse = 1.075 + Math.sin(time * 6.0) * 0.075;
      this.badgeGroup.scale.set(pulse, pulse, pulse);

      // Continuous smooth vertical bounce
      this.badgeGroup.position.y = this.baseBadgeY + Math.sin(time * 6.0) * 0.14;
    }
  }

  playUpgradePop() {
    const origY = this.group.position.y;
    this.group.position.y = origY + 0.3;
    setTimeout(() => {
      this.group.position.y = origY;
    }, 120);
  }
}

/**
 * Station 2: Jeans Table (Dotted Unlockable Bounding Box in Stage 2)
 */
export class JeansStation {
  constructor(scene, parentGroup) {
    this.scene = scene;
    const cfg = GAME_CONFIG.layout.station2;
    this.x = cfg.x;
    this.y = cfg.y;
    this.z = cfg.z;
    this.width = cfg.width;
    this.height = cfg.height;
    this.depth = cfg.depth;

    this.group = new THREE.Group();
    this.group.position.set(this.x, 0, this.z);
    parentGroup.add(this.group);

    this.clickTargets = [];
    this.render();

    gameState.on('stageRenovated', () => this.render());
    gameState.on('stationUnlocked', (data) => {
      if (data.station === 'jeans') this.render();
    });
  }

  render() {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.clickTargets = [];

    if (gameState.stage < 2) {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;

    if (!gameState.jeansStation.unlocked) {
      this.buildDottedOutline();
    } else {
      this.buildActiveTable();
    }
  }

  buildDottedOutline() {
    const w = this.width;
    const h = this.height;
    const d = this.depth;

    const boxGeo = new THREE.BoxGeometry(w, h, d);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      dashSize: 0.4,
      gapSize: 0.25,
      linewidth: 3
    });
    const lineMesh = new THREE.LineSegments(edges, lineMat);
    lineMesh.computeLineDistances();
    lineMesh.position.y = h / 2;
    this.group.add(lineMesh);

    const hitGeo = new THREE.BoxGeometry(w, h, d);
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.05, color: 0x38bdf8 });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = h / 2;
    hitMesh.userData = { type: 'unlock', stationId: 'jeans', title: 'Unlock Jeans Station', icon: '👖', cost: 50 };
    this.group.add(hitMesh);
    this.clickTargets.push(hitMesh);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 70px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👖', 64, 50);
    ctx.font = 'bold 24px Fredoka, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('50 🪙', 64, 100);

    const tex = new THREE.CanvasTexture(canvas);
    const planeGeo = new THREE.PlaneGeometry(1.6, 1.6);
    planeGeo.rotateX(-Math.PI / 4);
    const planeMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const iconPlane = new THREE.Mesh(planeGeo, planeMat);
    iconPlane.position.set(0, h + 0.6, 0);
    iconPlane.userData = hitMesh.userData;
    this.group.add(iconPlane);
    this.clickTargets.push(iconPlane);
  }

  buildActiveTable() {
    const w = this.width;
    const h = this.height;
    const d = this.depth;

    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData = { type: 'station', stationId: 'jeans' };
    this.group.add(body);
    this.clickTargets.push(body);

    const topGeo = new THREE.BoxGeometry(w + 0.2, 0.18, d + 0.2);
    const topMat = new THREE.MeshLambertMaterial({ color: 0x2563eb });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = h + 0.09;
    top.castShadow = true;
    this.group.add(top);

    const jeanGeo = new THREE.BoxGeometry(0.8, 0.15, 0.6);
    const jeanMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });
    const j1 = new THREE.Mesh(jeanGeo, jeanMat);
    j1.position.set(-0.5, h + 0.25, 0);
    const j2 = new THREE.Mesh(jeanGeo, jeanMat);
    j2.position.set(-0.5, h + 0.38, 0);
    this.group.add(j1);
    this.group.add(j2);
  }
}

/**
 * Station 3: Hats Rack (Dotted Unlockable Station in Stage 2)
 */
export class HatsStation {
  constructor(scene, parentGroup) {
    this.scene = scene;
    const cfg = GAME_CONFIG.layout.station3;
    this.x = cfg.x;
    this.y = cfg.y;
    this.z = cfg.z;
    this.width = cfg.width;
    this.height = cfg.height;
    this.depth = cfg.depth;

    this.group = new THREE.Group();
    this.group.position.set(this.x, 0, this.z);
    parentGroup.add(this.group);

    this.clickTargets = [];
    this.render();

    gameState.on('stageRenovated', () => this.render());
    gameState.on('stationUnlocked', () => this.render());
  }

  render() {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.clickTargets = [];

    if (gameState.stage < 2 || !gameState.jeansStation.unlocked) {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;

    if (!gameState.hatsStation.unlocked) {
      this.buildDottedOutline();
    } else {
      this.buildActiveRack();
    }
  }

  buildDottedOutline() {
    const w = this.width;
    const h = this.height;
    const d = this.depth;

    const boxGeo = new THREE.BoxGeometry(w, h, d);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0xa855f7,
      dashSize: 0.4,
      gapSize: 0.25,
      linewidth: 3
    });
    const lineMesh = new THREE.LineSegments(edges, lineMat);
    lineMesh.computeLineDistances();
    lineMesh.position.y = h / 2;
    this.group.add(lineMesh);

    const hitGeo = new THREE.BoxGeometry(w, h, d);
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.05, color: 0xa855f7 });
    const hitMesh = new THREE.Mesh(hitGeo, hitMat);
    hitMesh.position.y = h / 2;
    hitMesh.userData = { type: 'unlock', stationId: 'hats', title: 'Unlock Hats Rack', icon: '🧢', cost: 100 };
    this.group.add(hitMesh);
    this.clickTargets.push(hitMesh);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 70px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧢', 64, 50);
    ctx.font = 'bold 24px Fredoka, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('100 🪙', 64, 100);

    const tex = new THREE.CanvasTexture(canvas);
    const planeGeo = new THREE.PlaneGeometry(1.6, 1.6);
    planeGeo.rotateX(-Math.PI / 4);
    const planeMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const iconPlane = new THREE.Mesh(planeGeo, planeMat);
    iconPlane.position.set(0, h + 0.6, 0);
    iconPlane.userData = hitMesh.userData;
    this.group.add(iconPlane);
    this.clickTargets.push(iconPlane);
  }

  buildActiveRack() {
    const w = this.width;
    const h = this.height;

    const standGeo = new THREE.CylinderGeometry(0.18, 0.22, h, 12);
    const standMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = h / 2;
    stand.castShadow = true;
    this.group.add(stand);

    const hatColors = [0xef4444, 0x3b82f6, 0x10b981];
    hatColors.forEach((col, i) => {
      const hatGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const hatMat = new THREE.MeshLambertMaterial({ color: col });
      const hat = new THREE.Mesh(hatGeo, hatMat);
      hat.position.set((i - 1) * 0.7, h + 0.2, 0);
      hat.castShadow = true;
      this.group.add(hat);
    });
  }
}

/**
 * 3D Floating Gold Coin Spawner
 */
export class FloatingCoinSpawner {
  constructor(scene, parentGroup) {
    this.scene = scene;
    this.group = parentGroup;
    this.coins = [];
  }

  spawn(startX, startY, startZ, amount) {
    const coinCount = Math.min(6, Math.max(3, Math.ceil(amount / 2)));
    const coinGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16);
    coinGeo.rotateX(Math.PI / 4);
    const coinMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });

    for (let i = 0; i < coinCount; i++) {
      setTimeout(() => {
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.position.set(
          startX + (Math.random() - 0.5) * 0.6,
          startY + 0.8,
          startZ + (Math.random() - 0.5) * 0.6
        );
        this.group.add(coin);

        const targetX = 0;
        const targetY = 16;
        const targetZ = 12;

        this.coins.push({
          mesh: coin,
          startX: coin.position.x,
          startY: coin.position.y,
          startZ: coin.position.z,
          targetX,
          targetY,
          targetZ,
          life: 0,
          maxLife: 0.65,
          isLast: i === coinCount - 1,
          amount
        });
      }, i * 70);
    }
  }

  update(delta) {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      c.life += delta;
      const progress = Math.min(1.0, c.life / c.maxLife);

      const currentX = c.startX + (c.targetX - c.startX) * progress;
      const currentZ = c.startZ + (c.targetZ - c.startZ) * progress;
      const arcHeight = Math.sin(progress * Math.PI) * 4.0;
      const currentY = c.startY + (c.targetY - c.startY) * progress + arcHeight;

      c.mesh.position.set(currentX, currentY, currentZ);
      c.mesh.rotation.y += delta * 12;

      if (c.life >= c.maxLife) {
        this.group.remove(c.mesh);
        this.coins.splice(i, 1);

        if (c.isLast) {
          gameState.addCoins(c.amount);
        }
      }
    }
  }
}
