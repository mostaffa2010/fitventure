/**
 * Fitventure - 3D Environment & World Renderer
 * Perspective: Low-Poly 3D Isometric Top-Down
 * Tech Stack: Three.js r128
 * Features:
 * 1. Tightly framed concrete walkway (0xd9dfdf) with subtle paving lines (No harsh white glare!).
 * 2. Lush minimalist green grass margins (0x5fa84b) on left/right with cute sphere trees & rounded bushes.
 * 3. Warm wooden boutique counter (caramel oak 0xb87333 / 0xc68642) with dual silver cashier registers facing street.
 * 4. Inward-oriented blue/white striped umbrellas gracefully framing the counter.
 * 5. Dynamic street traffic (Yellow taxi, Blue sedan) driving left-to-right with puffing white exhaust particles.
 * 6. Stage 2 Mobile Fashion Van renovation.
 */

import { GAME_CONFIG, gameState } from './config.js';

/**
 * Traffic Manager: Drives low-poly 3D cars smoothly across the road with puffing exhaust particles
 */
export class TrafficManager {
  constructor(scene, parentGroup) {
    this.scene = scene;
    this.group = parentGroup;
    this.cars = [];
    this.puffs = [];

    this.carTypes = ['taxi', 'sedan', 'coupe'];
    this.spawnInterval = 3.2;
    this.timer = 0.4; // Spawn first car almost immediately
  }

  update(delta) {
    this.timer += delta;
    if (this.timer >= this.spawnInterval) {
      this.timer = 0;
      this.spawnCar();
    }

    // Update cars
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i];
      car.group.position.x += car.speed * delta;

      // Exhaust puff emission from tailpipe
      car.puffTimer = (car.puffTimer || 0) + delta;
      if (car.puffTimer >= 0.14) {
        car.puffTimer = 0;
        this.emitExhaustPuff(
          car.group.position.x - 1.9,
          car.group.position.y + 0.25,
          car.group.position.z + 0.55
        );
      }

      // Remove car when off-screen to the right
      if (car.group.position.x > 24) {
        this.group.remove(car.group);
        this.cars.splice(i, 1);
      }
    }

    // Update exhaust puffs
    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i];
      p.life += delta;
      const progress = p.life / p.maxLife;

      p.mesh.position.x -= delta * 1.4;
      p.mesh.position.y += delta * 0.7;
      const scale = 1.0 + progress * 2.4;
      p.mesh.scale.set(scale, scale, scale);

      if (p.mesh.material) {
        p.mesh.material.opacity = Math.max(0, 0.8 * (1.0 - progress));
      }

      if (p.life >= p.maxLife) {
        this.group.remove(p.mesh);
        this.puffs.splice(i, 1);
      }
    }
  }

  spawnCar() {
    const type = this.carTypes[Math.floor(Math.random() * this.carTypes.length)];
    const laneZ = Math.random() > 0.5 ? -9.2 : -11.6;
    const speed = laneZ === -9.2 ? (8.0 + Math.random() * 1.5) : (6.5 + Math.random() * 1.5);

    const carGroup = new THREE.Group();
    carGroup.position.set(-24, 0.4, laneZ);

    let bodyColor = 0x2563eb; // Blue Sedan
    if (type === 'taxi') bodyColor = 0xf59e0b; // Yellow Taxi
    else if (type === 'coupe') bodyColor = 0xef4444; // Red Coupe

    // 1. Car Body
    const bodyGeo = new THREE.BoxGeometry(3.6, 0.9, 1.8);
    const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bodyMesh.position.y = 0.5;
    carGroup.add(bodyMesh);

    // 2. Cabin
    const cabinGeo = new THREE.BoxGeometry(2.0, 0.75, 1.5);
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });
    const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
    cabinMesh.position.set(0.1, 1.15, 0);
    cabinMesh.castShadow = true;
    carGroup.add(cabinMesh);

    // 3. Taxi Roof Light (if taxi)
    if (type === 'taxi') {
      const taxiSignGeo = new THREE.BoxGeometry(0.8, 0.25, 0.4);
      const taxiSignMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const taxiSign = new THREE.Mesh(taxiSignGeo, taxiSignMat);
      taxiSign.position.set(0.1, 1.62, 0);
      taxiSign.castShadow = true;
      carGroup.add(taxiSign);
    }

    // 4. Wheels (4 Cylinders)
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

    const wheelPositions = [
      { x: -1.1, z: 0.95 },
      { x: 1.1, z: 0.95 },
      { x: -1.1, z: -0.95 },
      { x: 1.1, z: -0.95 }
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.set(pos.x, 0.35, pos.z);
      wheel.castShadow = true;
      carGroup.add(wheel);
    });

    // 5. Headlights
    const lightGeo = new THREE.BoxGeometry(0.1, 0.2, 0.3);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const l1 = new THREE.Mesh(lightGeo, lightMat);
    l1.position.set(1.8, 0.5, 0.6);
    const l2 = new THREE.Mesh(lightGeo, lightMat);
    l2.position.set(1.8, 0.5, -0.6);
    carGroup.add(l1);
    carGroup.add(l2);

    this.group.add(carGroup);
    this.cars.push({ group: carGroup, speed, puffTimer: 0 });
  }

  emitExhaustPuff(x, y, z) {
    const geo = new THREE.SphereGeometry(0.16, 8, 8);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xf1f5f9,
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);

    this.group.add(mesh);
    this.puffs.push({ mesh, life: 0, maxLife: 0.55 });
  }
}

/**
 * 3D World & Environment Manager
 */
export class WorldManager {
  constructor(scene) {
    this.scene = scene;
    this.worldGroup = new THREE.Group();
    this.scene.add(this.worldGroup);

    this.vanGroup = null;

    this.buildTerrain();
    this.buildNatureBorders();
    this.buildCounter();
    this.buildPatioUmbrellas();

    // Initialize Dynamic Street Traffic
    this.trafficManager = new TrafficManager(scene, this.worldGroup);

    // Listen for stage renovation
    gameState.on('stageRenovated', () => {
      this.switchToStage2Van();
    });
  }

  update(delta) {
    if (this.trafficManager) {
      this.trafficManager.update(delta);
    }
  }

  /**
   * Terrain: Tightly framed walkway with soft warm concrete (0xd9dfdf) & paving lines
   */
  buildTerrain() {
    const { colors, layout } = GAME_CONFIG;

    // 1. Asphalt Street (Z: -16 to -5)
    const streetGeo = new THREE.BoxGeometry(42, 0.4, 11);
    const streetMat = new THREE.MeshLambertMaterial({ color: colors.asphalt });
    const streetMesh = new THREE.Mesh(streetGeo, streetMat);
    streetMesh.position.set(0, -0.2, -10.5);
    streetMesh.receiveShadow = true;
    this.worldGroup.add(streetMesh);

    // Gutter Line
    const gutterGeo = new THREE.BoxGeometry(42, 0.05, 0.15);
    const gutterMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const gutterMesh = new THREE.Mesh(gutterGeo, gutterMat);
    gutterMesh.position.set(0, 0.02, -5.05);
    this.worldGroup.add(gutterMesh);

    // Yellow Dashed Lane Dividers
    const dashGeo = new THREE.BoxGeometry(1.6, 0.04, 0.2);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f });
    for (let x = -19; x <= 19; x += 3.2) {
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.position.set(x, 0.02, -10.5);
      this.worldGroup.add(dash);
    }

    // White Zebra Crosswalk Stripes (Z: -14.5 to -5.6)
    const stripeGeo = new THREE.BoxGeometry(3.6, 0.04, 0.55);
    const stripeMat = new THREE.MeshBasicMaterial({ color: colors.crosswalk });
    for (let z = -14.5; z <= -5.8; z += 1.05) {
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(0, 0.02, z);
      this.worldGroup.add(stripe);
    }

    // 2. Tightly Framed Soft Warm Sidewalk Concrete (Width: 12.2, Z: -4.8 to 14.2)
    const walkW = layout.walkway.width;
    const walkD = layout.walkway.depth;
    const walkGeo = new THREE.BoxGeometry(walkW, 0.38, walkD);
    const walkMat = new THREE.MeshLambertMaterial({ color: colors.sidewalk });
    const walkMesh = new THREE.Mesh(walkGeo, walkMat);
    walkMesh.position.set(0, -0.19, layout.walkway.z);
    walkMesh.receiveShadow = true;
    this.worldGroup.add(walkMesh);

    // Sidewalk Curb Bevel
    const curbGeo = new THREE.BoxGeometry(walkW, 0.2, 0.25);
    const curbMat = new THREE.MeshLambertMaterial({ color: colors.curb });
    const curbMesh = new THREE.Mesh(curbGeo, curbMat);
    curbMesh.position.set(0, 0.1, -4.9);
    this.worldGroup.add(curbMesh);

    // Subtle Paving Grid Lines (Eatventure Style clean sidewalk slabs)
    const gridLineMat = new THREE.MeshBasicMaterial({ color: colors.sidewalkTile });

    // Horizontal tile lines
    for (let z = -4.0; z <= 13.5; z += 2.0) {
      const lineGeo = new THREE.BoxGeometry(walkW - 0.2, 0.02, 0.05);
      const line = new THREE.Mesh(lineGeo, gridLineMat);
      line.position.set(0, 0.01, z);
      this.worldGroup.add(line);
    }

    // Vertical tile lines
    for (let x = -walkW / 2 + 2.0; x <= walkW / 2 - 2.0; x += 2.0) {
      const lineGeo = new THREE.BoxGeometry(0.05, 0.02, walkD - 0.4);
      const line = new THREE.Mesh(lineGeo, gridLineMat);
      line.position.set(x, 0.01, layout.walkway.z);
      this.worldGroup.add(line);
    }
  }

  /**
   * Surrounded By Nature: Lush minimalist green grass margins with cute sphere trees & rounded bushes
   */
  buildNatureBorders() {
    const { colors, layout } = GAME_CONFIG;
    const walkW = layout.walkway.width;

    // 1. Left Lush Green Grass Margin (X: -walkW/2 to -20)
    const marginW = 14.0;
    const grassGeo = new THREE.BoxGeometry(marginW, 0.42, 20.0);
    const grassMat = new THREE.MeshLambertMaterial({ color: colors.grassBorder });

    const leftGrass = new THREE.Mesh(grassGeo, grassMat);
    leftGrass.position.set(-walkW / 2 - marginW / 2, -0.18, 4.5);
    leftGrass.receiveShadow = true;
    this.worldGroup.add(leftGrass);

    // 2. Right Lush Green Grass Margin (X: walkW/2 to 20)
    const rightGrass = new THREE.Mesh(grassGeo, grassMat);
    rightGrass.position.set(walkW / 2 + marginW / 2, -0.18, 4.5);
    rightGrass.receiveShadow = true;
    this.worldGroup.add(rightGrass);

    // 3. Simple, Cute Low-Poly Sphere Trees along the grass margins
    this.buildCuteSphereTree(-8.2, -1.2, colors.treeFoliage);
    this.buildCuteSphereTree(-9.5, 4.2, colors.treeFoliageAlt);
    this.buildCuteSphereTree(-8.0, 9.8, colors.treeFoliage);

    this.buildCuteSphereTree(8.2, -1.2, colors.treeFoliage);
    this.buildCuteSphereTree(9.5, 4.2, colors.treeFoliageAlt);
    this.buildCuteSphereTree(8.0, 9.8, colors.treeFoliage);

    // 4. Clean Rounded Bushes along the margins
    this.buildRoundedBush(-6.8, -3.5);
    this.buildRoundedBush(-6.8, 1.5);
    this.buildRoundedBush(-6.8, 6.8);
    this.buildRoundedBush(-6.8, 12.0);

    this.buildRoundedBush(6.8, -3.5);
    this.buildRoundedBush(6.8, 1.5);
    this.buildRoundedBush(6.8, 6.8);
    this.buildRoundedBush(6.8, 12.0);
  }

  /**
   * Minimalist Low-Poly Sphere Tree: Clean wooden trunk + pure sphere foliage
   */
  buildCuteSphereTree(x, z, foliageColor) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    // Soft Circular Drop Shadow Disc
    const shadowGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.02, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.y = 0.04;
    treeGroup.add(shadow);

    // Smooth Wooden Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.28, 2.2, 10);
    const trunkMat = new THREE.MeshLambertMaterial({ color: GAME_CONFIG.colors.treeTrunk });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Main Sphere Foliage
    const mainSphereGeo = new THREE.SphereGeometry(1.45, 16, 16);
    const mainSphereMat = new THREE.MeshLambertMaterial({ color: foliageColor });
    const mainSphere = new THREE.Mesh(mainSphereGeo, mainSphereMat);
    mainSphere.position.y = 2.8;
    mainSphere.castShadow = true;
    treeGroup.add(mainSphere);

    // Top Offset Accent Sphere
    const topSphereGeo = new THREE.SphereGeometry(0.9, 14, 14);
    const topSphereMat = new THREE.MeshLambertMaterial({ color: 0x86efac });
    const topSphere = new THREE.Mesh(topSphereGeo, topSphereMat);
    topSphere.position.set(0.15, 3.8, 0.1);
    topSphere.castShadow = true;
    treeGroup.add(topSphere);

    this.worldGroup.add(treeGroup);
  }

  /**
   * Simple, Clean Rounded Bush
   */
  buildRoundedBush(x, z) {
    const cluster = new THREE.Group();
    cluster.position.set(x, 0, z);

    const bushMat1 = new THREE.MeshLambertMaterial({ color: GAME_CONFIG.colors.bushGreen });
    const bushMat2 = new THREE.MeshLambertMaterial({ color: 0x22c55e });

    const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), bushMat1);
    b1.position.set(0, 0.5, 0);
    b1.castShadow = true;
    cluster.add(b1);

    const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 12), bushMat2);
    b2.position.set(0.2, 0.38, 0.4);
    b2.castShadow = true;
    cluster.add(b2);

    this.worldGroup.add(cluster);
  }

  /**
   * Warm Caramel Oak Counter (0xb87333 / 0xc68642) with bevelled edges and dual silver cashier registers
   */
  buildCounter() {
    const { colors, layout } = GAME_CONFIG;
    const cfg = layout.counter;

    this.counterGroup = new THREE.Group();
    this.counterGroup.position.set(cfg.x, 0, cfg.z);
    this.worldGroup.add(this.counterGroup);

    // 1. Warm Caramel Oak Counter Body with Rounded Ends
    const centerW = cfg.width - cfg.depth;
    const bodyGeo = new THREE.BoxGeometry(centerW, cfg.height, cfg.depth);
    const bodyMat = new THREE.MeshLambertMaterial({ color: colors.counterWood });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = cfg.height / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.counterGroup.add(bodyMesh);

    // Rounded Ends (Left & Right Cylinders)
    const endGeo = new THREE.CylinderGeometry(cfg.depth / 2, cfg.depth / 2, cfg.height, 20);
    const leftEnd = new THREE.Mesh(endGeo, bodyMat);
    leftEnd.position.set(-centerW / 2, cfg.height / 2, 0);
    leftEnd.castShadow = true;
    leftEnd.receiveShadow = true;
    this.counterGroup.add(leftEnd);

    const rightEnd = new THREE.Mesh(endGeo, bodyMat);
    rightEnd.position.set(centerW / 2, cfg.height / 2, 0);
    rightEnd.castShadow = true;
    rightEnd.receiveShadow = true;
    this.counterGroup.add(rightEnd);

    // Vertical Fluted Slats on Front Face
    const slatGeo = new THREE.BoxGeometry(0.18, cfg.height * 0.75, 0.12);
    const slatMat = new THREE.MeshLambertMaterial({ color: colors.counterTrim });
    for (let x = -centerW / 2 + 0.4; x <= centerW / 2 - 0.4; x += 0.5) {
      const slat = new THREE.Mesh(slatGeo, slatMat);
      slat.position.set(x, cfg.height / 2, -cfg.depth / 2 - 0.04);
      this.counterGroup.add(slat);
    }

    // 2. Bevelled Polished Caramel Oak Countertop Surface
    const topW = centerW + 0.3;
    const topD = cfg.depth + 0.3;
    const topGeo = new THREE.BoxGeometry(topW, 0.18, topD);
    const topMat = new THREE.MeshLambertMaterial({ color: colors.counterTop });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = cfg.height + 0.09;
    topMesh.castShadow = true;
    this.counterGroup.add(topMesh);

    const topCapGeo = new THREE.CylinderGeometry(topD / 2, topD / 2, 0.18, 20);
    const leftTopCap = new THREE.Mesh(topCapGeo, topMat);
    leftTopCap.position.set(-topW / 2, cfg.height + 0.09, 0);
    leftTopCap.castShadow = true;
    this.counterGroup.add(leftTopCap);

    const rightTopCap = new THREE.Mesh(topCapGeo, topMat);
    rightTopCap.position.set(topW / 2, cfg.height + 0.09, 0);
    rightTopCap.castShadow = true;
    this.counterGroup.add(rightTopCap);

    // 3. Vitrine Display Showcase in Center
    const vitrineGeo = new THREE.BoxGeometry(1.9, 0.7, 0.8);
    const vitrineMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const vitrineMesh = new THREE.Mesh(vitrineGeo, vitrineMat);
    vitrineMesh.position.set(0, cfg.height / 2, -cfg.depth / 2 - 0.1);
    this.counterGroup.add(vitrineMesh);

    // Mini Folded Shirts inside showcase
    const shirtGeo = new THREE.BoxGeometry(0.42, 0.16, 0.35);
    const s1 = new THREE.Mesh(shirtGeo, new THREE.MeshLambertMaterial({ color: 0xef4444 }));
    s1.position.set(-0.55, cfg.height / 2, -cfg.depth / 2 - 0.05);
    const s2 = new THREE.Mesh(shirtGeo, new THREE.MeshLambertMaterial({ color: 0x3b82f6 }));
    s2.position.set(0, cfg.height / 2, -cfg.depth / 2 - 0.05);
    const s3 = new THREE.Mesh(shirtGeo, new THREE.MeshLambertMaterial({ color: 0xf59e0b }));
    s3.position.set(0.55, cfg.height / 2, -cfg.depth / 2 - 0.05);
    this.counterGroup.add(s1);
    this.counterGroup.add(s2);
    this.counterGroup.add(s3);

    // 4. Two Silver Cashier Registers Facing the Street (Slot 0 & Slot 1)
    this.buildSilverCashierRegister(-1.8, cfg.height + 0.18);
    this.buildSilverCashierRegister(1.8, cfg.height + 0.18);
  }

  buildSilverCashierRegister(x, y) {
    const regGroup = new THREE.Group();
    regGroup.position.set(x, y, -0.15);

    // Silver Cash Drawer Base
    const baseGeo = new THREE.BoxGeometry(0.72, 0.18, 0.65);
    const silverMat = new THREE.MeshLambertMaterial({ color: 0xcbd5e1 });
    const base = new THREE.Mesh(baseGeo, silverMat);
    base.position.y = 0.09;
    base.castShadow = true;
    regGroup.add(base);

    // Keypad Plate
    const keyGeo = new THREE.BoxGeometry(0.45, 0.06, 0.3);
    keyGeo.rotateX(-Math.PI / 8);
    const keyMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const keyPlate = new THREE.Mesh(keyGeo, keyMat);
    keyPlate.position.set(0, 0.22, 0.1);
    regGroup.add(keyPlate);

    // Register Stand
    const standGeo = new THREE.BoxGeometry(0.12, 0.32, 0.12);
    const stand = new THREE.Mesh(standGeo, silverMat);
    stand.position.set(0, 0.32, -0.15);
    regGroup.add(stand);

    // Silver Touchscreen Display facing Street (-Z)
    const screenBoxGeo = new THREE.BoxGeometry(0.62, 0.44, 0.08);
    screenBoxGeo.rotateX(Math.PI / 10);
    const screenBox = new THREE.Mesh(screenBoxGeo, silverMat);
    screenBox.position.set(0, 0.52, -0.15);
    screenBox.castShadow = true;
    regGroup.add(screenBox);

    // Glowing Green Cashier Screen Display
    const displayGeo = new THREE.PlaneGeometry(0.54, 0.36);
    displayGeo.rotateX(Math.PI / 10);
    displayGeo.rotateY(Math.PI); // Facing -Z toward customer
    const displayMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
    const display = new THREE.Mesh(displayGeo, displayMat);
    display.position.set(0, 0.52, -0.2);
    regGroup.add(display);

    // Barcode Scanner Wand
    const scanGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.3, 8);
    scanGeo.rotateZ(Math.PI / 4);
    const scanMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const scanner = new THREE.Mesh(scanGeo, scanMat);
    scanner.position.set(0.42, 0.22, 0);
    regGroup.add(scanner);

    this.counterGroup.add(regGroup);
  }

  /**
   * Striped Umbrellas oriented INWARD to frame the counter gracefully
   */
  buildPatioUmbrellas() {
    const { layout } = GAME_CONFIG;

    this.umbrellaLeft = this.create3DUmbrella(layout.umbrellas.left.x, layout.umbrellas.left.z, -0.08);
    this.umbrellaRight = this.create3DUmbrella(layout.umbrellas.right.x, layout.umbrellas.right.z, 0.08);

    this.worldGroup.add(this.umbrellaLeft);
    this.worldGroup.add(this.umbrellaRight);
  }

  create3DUmbrella(x, z, inwardTilt = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Ground Contact Shadow Disc
    const shadowGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.02, 20);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.24 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.y = 0.02;
    group.add(shadow);

    // Cast Iron Heavy Base
    const baseGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.18, 16);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.09;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Steel / Teak Pole
    const poleGeo = new THREE.CylinderGeometry(0.09, 0.09, 4.6, 12);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.y = 2.3;
    poleMesh.castShadow = true;
    group.add(poleMesh);

    // 3D Conical Canopy (10 Curved Blue & White Striped Wedges)
    const canopyRadius = 2.6;
    const canopyHeight = 1.6;
    const segments = 10;
    const colors = [GAME_CONFIG.colors.umbrellaBlue, GAME_CONFIG.colors.umbrellaWhite];

    const canopyGroup = new THREE.Group();
    canopyGroup.position.y = 4.2;
    canopyGroup.rotation.z = inwardTilt;

    for (let i = 0; i < segments; i++) {
      const a1 = (i * 2 * Math.PI) / segments;
      const a2 = ((i + 1) * 2 * Math.PI) / segments;
      const color = colors[i % 2];

      const wedgeGeo = new THREE.BufferGeometry();
      const apex = [0, canopyHeight / 2, 0];
      const p1 = [Math.cos(a1) * canopyRadius, -canopyHeight / 2, Math.sin(a1) * canopyRadius];
      const p2 = [Math.cos(a2) * canopyRadius, -canopyHeight / 2, Math.sin(a2) * canopyRadius];

      const vertices = new Float32Array([
        apex[0], apex[1], apex[2],
        p1[0], p1[1], p1[2],
        p2[0], p2[1], p2[2]
      ]);

      wedgeGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      wedgeGeo.computeVertexNormals();

      const wedgeMat = new THREE.MeshLambertMaterial({
        color,
        side: THREE.DoubleSide
      });
      const wedgeMesh = new THREE.Mesh(wedgeGeo, wedgeMat);
      wedgeMesh.castShadow = true;
      wedgeMesh.receiveShadow = true;
      canopyGroup.add(wedgeMesh);
    }

    // Brass Top Finial
    const finialGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const finialMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const finial = new THREE.Mesh(finialGeo, finialMat);
    finial.position.y = canopyHeight / 2 + 0.15;
    canopyGroup.add(finial);

    group.add(canopyGroup);
    return group;
  }

  switchToStage2Van() {
    if (this.vanGroup) return;

    if (this.umbrellaLeft) this.worldGroup.remove(this.umbrellaLeft);
    if (this.umbrellaRight) this.worldGroup.remove(this.umbrellaRight);

    // Build Stage 2 Mobile Fashion Van
    this.vanGroup = new THREE.Group();
    this.vanGroup.position.set(0, 0, 5.0);

    const { colors } = GAME_CONFIG;

    const vanW = 12.0;
    const vanH = 5.2;
    const vanD = 9.0;
    const vanGeo = new THREE.BoxGeometry(vanW, vanH, vanD);
    const vanMat = new THREE.MeshLambertMaterial({ color: colors.vanBody });
    const vanMesh = new THREE.Mesh(vanGeo, vanMat);
    vanMesh.position.y = vanH / 2;
    vanMesh.castShadow = true;
    vanMesh.receiveShadow = true;
    this.vanGroup.add(vanMesh);

    // Open Service Window Cutout
    const winGeo = new THREE.BoxGeometry(8.6, 3.8, 8.2);
    const winMat = new THREE.MeshLambertMaterial({ color: colors.vanFloor });
    const winMesh = new THREE.Mesh(winGeo, winMat);
    winMesh.position.set(0, 2.4, 0);
    this.vanGroup.add(winMesh);

    // 4 Wheels
    const tireGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.45, 16);
    tireGeo.rotateX(Math.PI / 2);
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });

    const wheelPos = [
      { x: -4.8, z: 4.6 },
      { x: 4.8, z: 4.6 },
      { x: -4.8, z: -4.6 },
      { x: 4.8, z: -4.6 }
    ];

    wheelPos.forEach(p => {
      const w = new THREE.Mesh(tireGeo, tireMat);
      w.position.set(p.x, 0.65, p.z);
      w.castShadow = true;
      this.vanGroup.add(w);
    });

    // Roof Luggage Rack
    const rackGeo = new THREE.BoxGeometry(7.5, 0.15, 6.5);
    const rackMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(0, vanH + 0.1, 0);
    this.vanGroup.add(rack);

    // Suitcases
    const sc1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.2), new THREE.MeshLambertMaterial({ color: 0xb45309 }));
    sc1.position.set(-1.8, vanH + 0.45, 0);
    sc1.castShadow = true;
    this.vanGroup.add(sc1);

    const sc2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 1.1), new THREE.MeshLambertMaterial({ color: 0x1e3a8a }));
    sc2.position.set(1.6, vanH + 0.42, 0.5);
    sc2.castShadow = true;
    this.vanGroup.add(sc2);

    this.worldGroup.add(this.vanGroup);
  }
}
