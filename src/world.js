/**
 * Fitventure - 3D Environment & World Renderer
 * Perspective: Low-Poly 3D Isometric Top-Down
 * Tech Stack: Three.js r128
 * Features:
 * 1. Grey asphalt road with white zebra stripes & yellow dividers.
 * 2. Animated low-poly 3D cars driving across with puffing exhaust smoke spheres.
 * 3. Concrete sidewalk with 3D curb bevel.
 * 4. Warm oak boutique counter with rounded ends, vitrine showcase, and dual POS registers.
 * 5. Flanking 3D conical patio umbrellas with blue/white striped wedges and crisp shadows.
 * 6. Stage 2 Fashion Van (Mobile food-truck boutique).
 */

import { GAME_CONFIG, gameState } from './config.js';

/**
 * Traffic Manager: Drives low-poly 3D cars across the road with exhaust puff particles
 */
export class TrafficManager {
  constructor(scene, parentGroup) {
    this.scene = scene;
    this.group = parentGroup;
    this.cars = [];
    this.puffs = [];

    this.carColors = [
      0xef4444, // Sport Red
      0xf59e0b, // Yellow Cab
      0x0ea5e9, // Cyan Hatchback
      0x8b5cf6, // Purple Cruiser
      0x10b981  // Mint Compact
    ];

    this.spawnInterval = 3.6;
    this.timer = 0.5; // Spawn first car soon
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

      // Exhaust puff emission
      car.puffTimer = (car.puffTimer || 0) + delta;
      if (car.puffTimer >= 0.16) {
        car.puffTimer = 0;
        this.emitExhaustPuff(car.group.position.x - 1.8, car.group.position.y + 0.3, car.group.position.z + 0.6);
      }

      // Remove car when off-screen
      if (car.group.position.x > 22) {
        this.group.remove(car.group);
        this.cars.splice(i, 1);
      }
    }

    // Update exhaust puffs
    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i];
      p.life += delta;
      const progress = p.life / p.maxLife;

      p.mesh.position.x -= delta * 1.5;
      p.mesh.position.y += delta * 0.8;
      const scale = 1.0 + progress * 2.2;
      p.mesh.scale.set(scale, scale, scale);

      if (p.mesh.material) {
        p.mesh.material.opacity = Math.max(0, 1.0 - progress);
      }

      if (p.life >= p.maxLife) {
        this.group.remove(p.mesh);
        this.puffs.splice(i, 1);
      }
    }
  }

  spawnCar() {
    const color = this.carColors[Math.floor(Math.random() * this.carColors.length)];
    const laneZ = Math.random() > 0.5 ? -9.2 : -11.6;
    const speed = laneZ === -9.2 ? (8.0 + Math.random() * 2.0) : (6.5 + Math.random() * 2.0);

    const carGroup = new THREE.Group();
    carGroup.position.set(-22, 0.4, laneZ);

    // Car Body
    const bodyGeo = new THREE.BoxGeometry(3.6, 0.9, 1.8);
    const bodyMat = new THREE.MeshLambertMaterial({ color });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bodyMesh.position.y = 0.5;
    carGroup.add(bodyMesh);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(2.0, 0.75, 1.5);
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });
    const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
    cabinMesh.position.set(0.1, 1.15, 0);
    cabinMesh.castShadow = true;
    carGroup.add(cabinMesh);

    // Wheels (4 cylinders)
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

    // Headlights (Front Right/Left)
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
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.75
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);

    this.group.add(mesh);
    this.puffs.push({ mesh, life: 0, maxLife: 0.45 });
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
    this.buildCounter();
    this.buildPatioUmbrellas();
    this.buildBoutiqueDecor();

    // Initialize Street Traffic
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

  buildTerrain() {
    const { colors } = GAME_CONFIG;

    // 1. Asphalt Street (Z: -18 to -6)
    const streetGeo = new THREE.BoxGeometry(40, 0.4, 11);
    const streetMat = new THREE.MeshLambertMaterial({ color: colors.asphalt });
    const streetMesh = new THREE.Mesh(streetGeo, streetMat);
    streetMesh.position.set(0, -0.2, -10.5);
    streetMesh.receiveShadow = true;
    this.worldGroup.add(streetMesh);

    // Gutter Line
    const gutterGeo = new THREE.BoxGeometry(40, 0.05, 0.15);
    const gutterMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const gutterMesh = new THREE.Mesh(gutterGeo, gutterMat);
    gutterMesh.position.set(0, 0.02, -5.1);
    this.worldGroup.add(gutterMesh);

    // Yellow Dashed Lane Dividers
    const dashGeo = new THREE.BoxGeometry(1.6, 0.04, 0.2);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f });
    for (let x = -18; x <= 18; x += 3.2) {
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.position.set(x, 0.02, -10.5);
      this.worldGroup.add(dash);
    }

    // White Zebra Crosswalk Stripes (Z: -15 to -5.5)
    const stripeGeo = new THREE.BoxGeometry(3.6, 0.04, 0.55);
    const stripeMat = new THREE.MeshBasicMaterial({ color: colors.crosswalk });
    for (let z = -14.5; z <= -6.0; z += 1.05) {
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(0, 0.02, z);
      this.worldGroup.add(stripe);
    }

    // 2. Concrete Sidewalk (Z: -5 to -2.6)
    const sidewalkGeo = new THREE.BoxGeometry(40, 0.5, 3.4);
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: colors.sidewalk });
    const sidewalkMesh = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalkMesh.position.set(0, -0.05, -3.7);
    sidewalkMesh.receiveShadow = true;
    this.worldGroup.add(sidewalkMesh);

    // Curb Bevel
    const curbGeo = new THREE.BoxGeometry(40, 0.2, 0.2);
    const curbMat = new THREE.MeshLambertMaterial({ color: colors.curb });
    const curbMesh = new THREE.Mesh(curbGeo, curbMat);
    curbMesh.position.set(0, 0.15, -5.35);
    this.worldGroup.add(curbMesh);

    // 3. Boutique Parquet Floor (Z: -2.0 to 14.0)
    const floorGeo = new THREE.BoxGeometry(40, 0.4, 16);
    const floorMat = new THREE.MeshLambertMaterial({ color: colors.boutiqueFloor });
    this.boutiqueFloorMesh = new THREE.Mesh(floorGeo, floorMat);
    this.boutiqueFloorMesh.position.set(0, -0.2, 6.0);
    this.boutiqueFloorMesh.receiveShadow = true;
    this.worldGroup.add(this.boutiqueFloorMesh);

    // Decorative Inlay Parquet Rug Runner under service area
    const rugGeo = new THREE.BoxGeometry(10.5, 0.04, 11);
    const rugMat = new THREE.MeshLambertMaterial({ color: 0xf5eedf });
    const rugMesh = new THREE.Mesh(rugGeo, rugMat);
    rugMesh.position.set(0, 0.02, 4.0);
    rugMesh.receiveShadow = true;
    this.worldGroup.add(rugMesh);
  }

  buildCounter() {
    const { colors, layout } = GAME_CONFIG;
    const cfg = layout.counter;

    this.counterGroup = new THREE.Group();
    this.counterGroup.position.set(cfg.x, 0, cfg.z);
    this.worldGroup.add(this.counterGroup);

    // 1. Warm Oak Counter Body with Rounded Ends
    const centerW = cfg.width - cfg.depth; // length of center box
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

    // Vertical Fluted Slats on front face
    const slatGeo = new THREE.BoxGeometry(0.18, cfg.height * 0.75, 0.12);
    const slatMat = new THREE.MeshLambertMaterial({ color: colors.counterTrim });
    for (let x = -centerW / 2 + 0.4; x <= centerW / 2 - 0.4; x += 0.5) {
      const slat = new THREE.Mesh(slatGeo, slatMat);
      slat.position.set(x, cfg.height / 2, -cfg.depth / 2 - 0.04);
      this.counterGroup.add(slat);
    }

    // 2. Polished Honey Oak Countertop Surface
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
    const vitrineGeo = new THREE.BoxGeometry(2.0, 0.7, 0.8);
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

    // 4. Dual Checkout POS Tablets (at Customer Slots 0 & 1)
    this.buildPOSRegister(-1.8, cfg.height + 0.22);
    this.buildPOSRegister(1.8, cfg.height + 0.22);
  }

  buildPOSRegister(x, y) {
    const posGroup = new THREE.Group();
    posGroup.position.set(x, y, -0.2);

    // Stand
    const standGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.2, 8);
    const standMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = 0.1;
    posGroup.add(stand);

    // Angled Tablet
    const tabGeo = new THREE.BoxGeometry(0.55, 0.4, 0.06);
    tabGeo.rotateX(-Math.PI / 6);
    const tabMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const tab = new THREE.Mesh(tabGeo, tabMat);
    tab.position.y = 0.28;
    posGroup.add(tab);

    // Glowing Screen
    const screenGeo = new THREE.BoxGeometry(0.48, 0.32, 0.02);
    screenGeo.rotateX(-Math.PI / 6);
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.29, -0.03);
    posGroup.add(screen);

    this.counterGroup.add(posGroup);
  }

  buildPatioUmbrellas() {
    const { layout } = GAME_CONFIG;
    this.umbrellaLeft = this.create3DUmbrella(layout.umbrellas.left.x, layout.umbrellas.left.z);
    this.umbrellaRight = this.create3DUmbrella(layout.umbrellas.right.x, layout.umbrellas.right.z);
    this.worldGroup.add(this.umbrellaLeft);
    this.worldGroup.add(this.umbrellaRight);
  }

  /**
   * True 3D Conical Patio Umbrella with Curved Striped Wedges
   */
  create3DUmbrella(x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Cast Iron Heavy Base
    const baseGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.18, 16);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.09;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Teak / Steel Pole
    const poleGeo = new THREE.CylinderGeometry(0.09, 0.09, 4.6, 12);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.y = 2.3;
    poleMesh.castShadow = true;
    group.add(poleMesh);

    // 3D Conical Canopy (10 Curved Blue & White Wedges)
    const canopyRadius = 2.6;
    const canopyHeight = 1.6;
    const segments = 10;
    const colors = [GAME_CONFIG.colors.umbrellaBlue, GAME_CONFIG.colors.umbrellaWhite];

    const canopyGroup = new THREE.Group();
    canopyGroup.position.y = 4.2;

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

  buildBoutiqueDecor() {
    // Left Wall Hedges
    const hedgeMat = new THREE.MeshLambertMaterial({ color: 0x16a34a });
    for (let z = 0; z <= 10; z += 2.2) {
      const hGeo = new THREE.SphereGeometry(0.95, 12, 12);
      const hMesh = new THREE.Mesh(hGeo, hedgeMat);
      hMesh.position.set(-8.8, 0.7, z);
      hMesh.castShadow = true;
      this.worldGroup.add(hMesh);
    }

    // Right Wall Hedges
    for (let z = 0; z <= 10; z += 2.2) {
      const hGeo = new THREE.SphereGeometry(0.95, 12, 12);
      const hMesh = new THREE.Mesh(hGeo, hedgeMat);
      hMesh.position.set(8.8, 0.7, z);
      hMesh.castShadow = true;
      this.worldGroup.add(hMesh);
    }
  }

  switchToStage2Van() {
    if (this.vanGroup) return;

    // Remove stage 1 umbrellas
    if (this.umbrellaLeft) this.worldGroup.remove(this.umbrellaLeft);
    if (this.umbrellaRight) this.worldGroup.remove(this.umbrellaRight);

    // Build Stage 2 Mobile Fashion Van (Custom Food-Truck Vehicle)
    this.vanGroup = new THREE.Group();
    this.vanGroup.position.set(0, 0, 5.0);

    const { colors } = GAME_CONFIG;

    // Van Vehicle Body Frame
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

    // Open Service Window Cutout (Hollow interior floor visible)
    const winGeo = new THREE.BoxGeometry(8.6, 3.8, 8.2);
    const winMat = new THREE.MeshLambertMaterial({ color: colors.vanFloor });
    const winMesh = new THREE.Mesh(winGeo, winMat);
    winMesh.position.set(0, 2.4, 0);
    this.vanGroup.add(winMesh);

    // 4 Heavy-Duty Van Wheels
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

    // Roof Luggage Rack with Travel Suitcases
    const rackGeo = new THREE.BoxGeometry(7.5, 0.15, 6.5);
    const rackMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(0, vanH + 0.1, 0);
    this.vanGroup.add(rack);

    // Suitcases on roof
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
