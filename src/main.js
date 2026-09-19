/**
 * Fitventure - Main 3D Game Bootstrap & Render Loop
 * Tech Stack: Three.js r128 + HTML/CSS UI Overlay
 * Orchestrates:
 * 1. OrthographicCamera with crisp isometric top-down projection.
 * 2. Directional sunlight with soft shadow maps and pastel ambient fill (No Glare).
 * 3. Raycaster clicking on 3D workstations and affordable red arrow badge.
 * 4. 60fps game loop driving character waddle, customer spawner, street traffic, and coin physics.
 */

import { GAME_CONFIG, gameState } from './config.js';
import { WorldManager } from './world.js';
import { SewingStation, JeansStation, HatsStation, FloatingCoinSpawner } from './stations.js';
import { CharacterManager } from './characters.js';
import { UIManager } from './ui.js';

// Simple Event Emitter for decoupled communication
class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  on(event, cb) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event).push(cb);
  }
  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(cb => cb(data));
    }
  }
}

export class FitventureApp {
  constructor() {
    this.events = new EventEmitter();
    this.initThree();
    this.initGame();
    this.initEvents();
    this.animate();
  }

  initThree() {
    const container = document.getElementById('game-container') || document.body;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(GAME_CONFIG.colors.asphalt);

    // 2. WebGL Renderer with Soft Shadow Maps
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 3. Orthographic Camera (Eatventure Signature Isometric Top-Down)
    const aspect = width / height;
    const frustum = GAME_CONFIG.camera.frustumSize;
    this.camera = new THREE.OrthographicCamera(
      (-frustum * aspect) / 2,
      (frustum * aspect) / 2,
      frustum / 2,
      -frustum / 2,
      0.1,
      120
    );

    const camCfg = GAME_CONFIG.camera;
    this.camera.position.set(camCfg.position.x, camCfg.position.y, camCfg.position.z);
    this.camera.lookAt(camCfg.lookAt.x, camCfg.lookAt.y, camCfg.lookAt.z);

    // 4. Lighting Setup (Balanced Warm Sunlight & Soft Ambient Occlusion Tone)
    const lightCfg = GAME_CONFIG.lighting;

    const ambientLight = new THREE.AmbientLight(lightCfg.ambientColor, lightCfg.ambientIntensity);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(lightCfg.hemiSky, lightCfg.hemiGround, lightCfg.hemiIntensity);
    this.scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(lightCfg.sunColor, lightCfg.sunIntensity);
    sun.position.set(lightCfg.sunPosition.x, lightCfg.sunPosition.y, lightCfg.sunPosition.z);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -22;
    sun.shadow.camera.right = 22;
    sun.shadow.camera.top = 22;
    sun.shadow.camera.bottom = -22;
    sun.shadow.camera.near = 1.0;
    sun.shadow.camera.far = 75;
    sun.shadow.bias = -0.0004;
    this.scene.add(sun);

    // 5. Raycaster for 3D clicks
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.clock = new THREE.Clock();
  }

  initGame() {
    // 3D Environment (Terrain, street traffic, umbrellas, counter)
    this.worldManager = new WorldManager(this.scene);

    // 3D Workstations
    this.sewingStation = new SewingStation(this, this.worldManager.worldGroup);
    this.jeansStation = new JeansStation(this, this.worldManager.worldGroup);
    this.hatsStation = new HatsStation(this, this.worldManager.worldGroup);

    this.stationsMap = {
      sewing: this.sewingStation,
      jeans: this.jeansStation,
      hats: this.hatsStation
    };

    // 3D Floating Coin Spawner
    this.coinSpawner = new FloatingCoinSpawner(this.scene, this.worldManager.worldGroup);

    // 3D Characters Manager
    this.characterManager = new CharacterManager(this, this.worldManager.worldGroup, this.stationsMap, this.worldManager.counterGroup);

    // HTML5/CSS3 DOM UI Controller
    this.uiManager = new UIManager(this.events);
  }

  initEvents() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Raycasting click detection on 3D objects
    window.addEventListener('pointerdown', (e) => {
      if (e.target.tagName !== 'CANVAS') return;

      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);

      const interactiveTargets = [
        ...this.sewingStation.clickTargets,
        ...this.jeansStation.clickTargets,
        ...this.hatsStation.clickTargets
      ];

      const intersects = this.raycaster.intersectObjects(interactiveTargets, true);

      if (intersects.length > 0) {
        let hit = intersects[0].object;
        while (hit && !hit.userData.type && hit.parent) {
          hit = hit.parent;
        }

        if (hit && hit.userData) {
          if (hit.userData.type === 'station') {
            this.events.emit('openStationUpgrade', { station: hit.userData.stationId });
          } else if (hit.userData.type === 'unlock') {
            this.events.emit('openUnlockModal', hit.userData);
          }
        }
      }
    });

    // Customer Payment Coins Effect
    this.events.on('customerPaid', (data) => {
      this.coinSpawner.spawn(data.x, data.y, data.z, data.amount);
    });
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    const frustum = GAME_CONFIG.camera.frustumSize;

    this.camera.left = (-frustum * aspect) / 2;
    this.camera.right = (frustum * aspect) / 2;
    this.camera.top = frustum / 2;
    this.camera.bottom = -frustum / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(0.1, this.clock.getDelta());
    const time = this.clock.getElapsedTime();

    // Game Economy Updates
    gameState.updateBoost(delta);

    // 3D Simulation Updates
    if (this.worldManager) this.worldManager.update(delta);
    if (this.sewingStation) this.sewingStation.update(delta, time);
    if (this.characterManager) this.characterManager.update(delta, this.camera, window.innerWidth, window.innerHeight);
    if (this.coinSpawner) this.coinSpawner.update(delta);

    this.renderer.render(this.scene, this.camera);
  }
}

// Reliable App Launcher
function startApp() {
  if (!window.fitventureApp) {
    window.fitventureApp = new FitventureApp();
    console.log('✨ Fitventure: Three.js 3D Engine Initialized Successfully!');
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', startApp);
    window.addEventListener('load', startApp);
  } else {
    startApp();
  }
}
