/**
 * Fitventure - HTML5/CSS3 DOM UI Controller
 * Perspective: Eatventure Cohesive Minimalist UI
 * Features:
 * 1. Minimalist Unified Bottom Dock: All 3 buttons (Renovate, Boost x2, Upgrades)
 *    share the exact same candy blue (#38bdf8 / #0284c7) theme with bottom bevel (#0369a1).
 * 2. Attached Station Upgrade Tooltip Card: Anchored speech-bubble card with downward-pointing
 *    arrow indicator positioned right above the 3D tailoring table via Vector3.project(camera).
 * 3. Self-clearing store upgrades with 85px vertical spacing and smooth re-stacking.
 * 4. Level 25 Stage 1 Max Cap with clear status.
 * 5. Full-screen flash transition on restaurant renovation.
 */

import { GAME_CONFIG, STORE_UPGRADES, gameState } from './config.js';

export class UIManager {
  constructor(events) {
    this.events = events;
    this.container = document.getElementById('ui-container') || document.body;

    // Target 3D station position for speech-bubble tooltip anchoring
    this.targetStationPos = new THREE.Vector3(-2.3, 2.1, 3.8);

    this.injectStyles();
    this.buildTopCoinPill();
    this.buildBottomDock();
    this.buildStationTooltipCard();
    this.buildUpgradesModal();
    this.buildUnlockModal();
    this.buildRenovationTransition();
    this.buildStage2Modal();
    this.buildNoticeModal();

    // Event listeners
    gameState.on('coinsChanged', (data) => this.updateCoins(data.coins));
    gameState.on('stationUpgraded', () => {
      this.updateRenovateBtn();
      this.refreshStationCard();
    });
    gameState.on('upgradePurchased', () => this.updateRenovateBtn());
    gameState.on('stageRenovated', () => this.updateRenovateBtn());

    this.events.on('openStationUpgrade', (data) => this.openStationCard(data));
    this.events.on('openGlobalUpgrades', () => this.openUpgradesModal());
    this.events.on('openUnlockModal', (data) => this.openUnlockModal(data));
    this.events.on('startRenovationTransition', () => this.startRenovationTransition());
    this.events.on('openNotice', (data) => this.openNotice(data));
  }

  injectStyles() {
    if (document.getElementById('fitventure-ui-styles')) return;

    const style = document.createElement('style');
    style.id = 'fitventure-ui-styles';
    style.textContent = `
      #ui-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
        font-family: 'Fredoka', 'Nunito', 'Segoe UI', Arial, sans-serif;
        user-select: none;
        -webkit-user-select: none;
      }

      /* Top Coin Pill */
      .top-coin-pill {
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ffffff;
        border-radius: 9999px;
        padding: 8px 24px 8px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15), 0 4px 6px rgba(0,0,0,0.05);
        border: 3px solid #f1f5f9;
        pointer-events: auto;
        z-index: 50;
        transition: transform 0.1s ease;
      }
      .coin-icon-gold {
        font-size: 32px;
        filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4));
      }
      .coin-amount-text {
        font-size: 32px;
        font-weight: 700;
        color: #0f172a;
        letter-spacing: -0.5px;
      }

      /* Minimalist Unified Bottom Dock (All 3 buttons share candy blue #38bdf8 / #0284c7) */
      .bottom-dock {
        position: absolute;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 14px;
        width: 92%;
        max-width: 480px;
        pointer-events: auto;
        z-index: 50;
      }

      .chunky-btn {
        flex: 1;
        height: 66px;
        border-radius: 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, #38bdf8 0%, #0284c7 100%);
        box-shadow: 0 7px 0 #0369a1, 0 10px 18px rgba(2, 132, 199, 0.35);
        border: none;
        color: #ffffff;
        cursor: pointer;
        user-select: none;
        transition: transform 0.08s ease, box-shadow 0.08s ease;
        position: relative;
        padding: 4px 6px;
      }
      .chunky-btn:active {
        transform: translateY(4px);
        box-shadow: 0 3px 0 #0369a1, 0 6px 10px rgba(2, 132, 199, 0.3);
      }
      .chunky-btn .btn-icon {
        font-size: 22px;
        line-height: 1;
      }
      .chunky-btn .btn-title {
        font-size: 15px;
        font-weight: 800;
        letter-spacing: 0.5px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.25);
        line-height: 1.2;
        margin-top: 2px;
      }
      .chunky-btn .btn-sub {
        font-size: 11px;
        font-weight: 700;
        opacity: 0.92;
        letter-spacing: 0.3px;
      }

      /* Renovate Button Glow when ready */
      .chunky-btn.renovate-ready {
        box-shadow: 0 0 0 3px #f59e0b, 0 7px 0 #0369a1, 0 10px 22px rgba(245, 158, 11, 0.5);
        animation: pulseGold 1.2s infinite alternate ease-in-out;
      }
      @keyframes pulseGold {
        0% { box-shadow: 0 0 0 2px #f59e0b, 0 7px 0 #0369a1, 0 8px 16px rgba(245, 158, 11, 0.3); }
        100% { box-shadow: 0 0 0 4px #fbbf24, 0 7px 0 #0369a1, 0 14px 28px rgba(245, 158, 11, 0.7); }
      }

      /* Boost Active State */
      .chunky-btn.boost-active {
        background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
        box-shadow: 0 7px 0 #b45309, 0 10px 18px rgba(217, 119, 6, 0.35);
      }

      /* Attached Station Upgrade Tooltip Card (Speech-Bubble Floating in 3D Screen Space) */
      .station-tooltip-card {
        position: absolute;
        width: 270px;
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 14px 35px rgba(0, 0, 0, 0.22), 0 2px 6px rgba(0, 0, 0, 0.08);
        border: 2px solid #e2e8f0;
        padding: 16px;
        pointer-events: auto;
        z-index: 90;
        transform: translate(-50%, -100%) translateY(-16px);
        display: none;
        flex-direction: column;
        gap: 12px;
        transition: opacity 0.12s ease;
      }
      /* Downward-pointing arrow indicator */
      .station-tooltip-card::after {
        content: '';
        position: absolute;
        bottom: -13px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-top: 14px solid #ffffff;
        filter: drop-shadow(0 3px 2px rgba(0,0,0,0.12));
      }

      .st-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .st-card-badge-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .st-card-icon {
        font-size: 26px;
        background: #f1f5f9;
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .st-card-titles {
        display: flex;
        flex-direction: column;
      }
      .st-card-name {
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.2;
      }
      .st-card-sub {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
      }
      .st-card-close {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: #f1f5f9;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
      }
      .st-card-close:hover {
        background: #fee2e2;
        color: #ef4444;
      }

      /* Level Progress Bar */
      .st-level-box {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .st-level-row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        font-weight: 700;
        color: #334155;
      }
      .st-progress-track {
        width: 100%;
        height: 9px;
        background: #e2e8f0;
        border-radius: 6px;
        overflow: hidden;
      }
      .st-progress-fill {
        height: 100%;
        background: #22c55e;
        border-radius: 6px;
        width: 4%;
        transition: width 0.2s ease;
      }

      /* Stats Row */
      .st-stats-row {
        display: flex;
        justify-content: space-between;
        background: #f8fafc;
        border-radius: 12px;
        padding: 8px 12px;
      }
      .st-stat-col {
        display: flex;
        flex-direction: column;
      }
      .st-stat-label {
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
      }
      .st-stat-val {
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
      }

      /* Upgrade Button */
      .btn-upgrade-action {
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
        box-shadow: 0 5px 0 #15803d;
        color: #ffffff;
        font-size: 16px;
        font-weight: 800;
        cursor: pointer;
        user-select: none;
        transition: transform 0.08s ease, box-shadow 0.08s ease;
      }
      .btn-upgrade-action:active {
        transform: translateY(3px);
        box-shadow: 0 2px 0 #15803d;
      }
      .btn-upgrade-action.disabled {
        background: #94a3b8;
        box-shadow: 0 5px 0 #64748b;
        color: #f1f5f9;
        cursor: not-allowed;
      }
      .btn-upgrade-action.maxed {
        background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
        box-shadow: 0 5px 0 #b45309;
        color: #ffffff;
        font-size: 13px;
        cursor: default;
      }

      /* Modals (Upgrades, Unlock, Notice) */
      .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.55);
        backdrop-filter: blur(4px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 100;
        pointer-events: auto;
      }
      .modal-card {
        background: #ffffff;
        border-radius: 28px;
        width: 90%;
        max-width: 440px;
        max-height: 82vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        border: 2px solid #e2e8f0;
        position: relative;
        padding: 24px;
      }
      .modal-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .modal-title-main {
        font-size: 24px;
        font-weight: 800;
        color: #0f172a;
      }
      .red-square-close {
        width: 36px;
        height: 36px;
        background: #ef4444;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-weight: 900;
        font-size: 18px;
        box-shadow: 0 4px 0 #b91c1c;
        cursor: pointer;
      }
      .red-square-close:active {
        transform: translateY(2px);
        box-shadow: 0 2px 0 #b91c1c;
      }

      /* Store Upgrades Vertical List */
      .upgrades-list-container {
        display: flex;
        flex-direction: column;
        gap: 14px;
        overflow-y: auto;
        padding-right: 4px;
        max-height: 60vh;
      }
      .upgrade-card-row {
        background: #ffffff;
        border-radius: 18px;
        border: 2px solid #e2e8f0;
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 4px 10px rgba(0,0,0,0.04);
        transition: transform 0.25s ease, opacity 0.25s ease;
      }
      .upg-left {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }
      .upg-icon-badge {
        font-size: 28px;
        background: #f1f5f9;
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .upg-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .upg-title {
        font-size: 16px;
        font-weight: 800;
        color: #0f172a;
      }
      .upg-desc {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        line-height: 1.3;
      }
      .upg-buy-btn {
        background: linear-gradient(180deg, #22c55e, #16a34a);
        box-shadow: 0 5px 0 #15803d;
        border-radius: 14px;
        padding: 10px 16px;
        color: #ffffff;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        user-select: none;
        flex-shrink: 0;
      }
      .upg-buy-btn:active {
        transform: translateY(2px);
        box-shadow: 0 3px 0 #15803d;
      }
      .upg-buy-btn.disabled {
        background: #94a3b8;
        box-shadow: 0 5px 0 #64748b;
        cursor: not-allowed;
      }

      /* Shopper Speech Bubble */
      .shopper-speech-bubble {
        position: absolute;
        transform: translate(-50%, -100%);
        background: #ffffff;
        border-radius: 10px;
        border: 2px solid #e2e8f0;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        padding: 4px 10px;
        display: flex;
        align-items: center;
        gap: 4px;
        pointer-events: none;
        z-index: 10;
      }
      .bubble-icon { font-size: 20px; }
      .bubble-qty { font-size: 14px; font-weight: 700; color: #0f172a; }

      /* Renovation Screen */
      .renovate-screen {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #ffffff;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 200;
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);
  }

  buildTopCoinPill() {
    this.coinPill = document.createElement('div');
    this.coinPill.className = 'top-coin-pill';
    this.coinPill.innerHTML = `
      <span class="coin-icon-gold">🪙</span>
      <span class="coin-amount-text" id="coin-amount-text">${gameState.formatCoins(gameState.coins)}</span>
    `;
    this.container.appendChild(this.coinPill);
  }

  /**
   * Minimalist Unified Bottom Dock
   * All 3 buttons use candy blue theme (#38bdf8 / #0284c7 with bottom bevel #0369a1)
   */
  buildBottomDock() {
    this.dock = document.createElement('div');
    this.dock.className = 'bottom-dock';
    this.dock.innerHTML = `
      <div class="chunky-btn" id="btn-renovate">
        <span class="btn-icon">🔨</span>
        <span class="btn-title">RENOVATE</span>
        <span class="btn-sub" id="renovate-sub-text">LV. 1/25</span>
      </div>
      <div class="chunky-btn" id="btn-boost">
        <span class="btn-icon">⚡</span>
        <span class="btn-title">2X BOOST</span>
        <span class="btn-sub" id="boost-sub-text">FREE · 30S</span>
      </div>
      <div class="chunky-btn" id="btn-upgrades">
        <span class="btn-icon">⭐</span>
        <span class="btn-title">UPGRADES</span>
        <span class="btn-sub">STORE</span>
      </div>
    `;
    this.container.appendChild(this.dock);

    // Click Handlers
    document.getElementById('btn-renovate').onclick = () => {
      if (gameState.isRenovateUnlocked()) {
        this.events.emit('startRenovationTransition');
      } else {
        const req = gameState.renovateRequiredLevel;
        const cur = gameState.sewingStation.level;
        const allUpgrades = gameState.areStage1UpgradesComplete();
        let msg = `Reach Sewing Table Level ${req} (Currently Lv. ${cur})`;
        if (cur >= req && !allUpgrades) {
          msg = `Purchase all 5 Stage 1 Store Upgrades to Renovate!`;
        }
        this.events.emit('openNotice', {
          title: 'Renovation Locked',
          message: msg
        });
      }
    };

    document.getElementById('btn-boost').onclick = () => {
      gameState.activateBoost(30);
      const btn = document.getElementById('btn-boost');
      const sub = document.getElementById('boost-sub-text');
      if (btn) btn.classList.add('boost-active');
      if (sub) sub.textContent = '30S ACTIVE!';
    };

    gameState.on('boostTick', (data) => {
      const sub = document.getElementById('boost-sub-text');
      if (sub) sub.textContent = `${data.duration}S ACTIVE!`;
    });

    gameState.on('boostChanged', (data) => {
      const btn = document.getElementById('btn-boost');
      const sub = document.getElementById('boost-sub-text');
      if (!data.active) {
        if (btn) btn.classList.remove('boost-active');
        if (sub) sub.textContent = 'FREE · 30S';
      }
    });

    document.getElementById('btn-upgrades').onclick = () => {
      this.openUpgradesModal();
    };

    this.updateRenovateBtn();
  }

  updateRenovateBtn() {
    const btn = document.getElementById('btn-renovate');
    const sub = document.getElementById('renovate-sub-text');
    if (!btn || !sub) return;

    if (gameState.stage === 1) {
      const isReady = gameState.isRenovateUnlocked();
      if (isReady) {
        btn.classList.add('renovate-ready');
        sub.textContent = 'READY!';
      } else {
        btn.classList.remove('renovate-ready');
        sub.textContent = `LV. ${gameState.sewingStation.level}/25`;
      }
    } else {
      btn.classList.remove('renovate-ready');
      sub.textContent = 'STAGE 2';
    }
  }

  /**
   * Attached Station Upgrade Tooltip Card
   * Anchored speech-bubble card pointing downward at active tailoring table
   */
  buildStationTooltipCard() {
    this.stationCard = document.createElement('div');
    this.stationCard.className = 'station-tooltip-card';
    this.stationCard.id = 'station-tooltip-card';
    this.stationCard.innerHTML = `
      <div class="st-card-header">
        <div class="st-card-badge-wrap">
          <div class="st-card-icon" id="st-card-icon">👕</div>
          <div class="st-card-titles">
            <span class="st-card-name" id="st-card-name">Sewing Table</span>
            <span class="st-card-sub" id="st-card-sub">Crafts Graphic T-Shirts</span>
          </div>
        </div>
        <div class="st-card-close" id="close-station-card">✕</div>
      </div>

      <div class="st-level-box">
        <div class="st-level-row">
          <span>Level Progress</span>
          <span id="st-card-level-text">Lv. 1 / 25</span>
        </div>
        <div class="st-progress-track">
          <div class="st-progress-fill" id="st-card-progress-fill"></div>
        </div>
      </div>

      <div class="st-stats-row">
        <div class="st-stat-col">
          <span class="st-stat-label">Profit</span>
          <span class="st-stat-val" id="st-card-profit">🪙 +4</span>
        </div>
        <div class="st-stat-col">
          <span class="st-stat-label">Craft Speed</span>
          <span class="st-stat-val" id="st-card-speed">⏱️ 1.8s</span>
        </div>
      </div>

      <div class="btn-upgrade-action" id="btn-upgrade-action">
        <span id="st-card-btn-label">UPGRADE</span>
        <span id="st-card-btn-cost">· 10 🪙</span>
      </div>
    `;
    this.container.appendChild(this.stationCard);

    document.getElementById('close-station-card').onclick = (e) => {
      e.stopPropagation();
      this.closeStationCard();
    };

    document.getElementById('btn-upgrade-action').onclick = () => {
      if (gameState.canUpgradeSewing()) {
        gameState.upgradeSewing();
        this.refreshStationCard();
      }
    };
  }

  openStationCard(data) {
    if (data && data.position) {
      this.targetStationPos = data.position;
    } else {
      this.targetStationPos = new THREE.Vector3(-2.3, 2.1, 3.8);
    }
    this.refreshStationCard();
    this.stationCard.style.display = 'flex';
  }

  closeStationCard() {
    if (this.stationCard) {
      this.stationCard.style.display = 'none';
    }
  }

  refreshStationCard() {
    const st = gameState.sewingStation;
    const isStage1 = gameState.stage === 1;
    const isMaxed = isStage1 && st.level >= 25;

    const levelText = document.getElementById('st-card-level-text');
    if (levelText) {
      levelText.textContent = isMaxed ? 'Lv. 25 MAX' : `Lv. ${st.level} / ${st.maxLevel}`;
    }

    const fill = document.getElementById('st-card-progress-fill');
    if (fill) {
      const pct = Math.min(100, Math.round((st.level / st.maxLevel) * 100));
      fill.style.width = `${pct}%`;
    }

    const profit = document.getElementById('st-card-profit');
    if (profit) profit.textContent = `🪙 +${gameState.getSewingProfit()}`;

    const speed = document.getElementById('st-card-speed');
    if (speed) {
      const sec = (gameState.getSewingCraftDuration() / 1000).toFixed(1);
      speed.textContent = `⏱️ ${sec}s`;
    }

    const btn = document.getElementById('btn-upgrade-action');
    const label = document.getElementById('st-card-btn-label');
    const cost = document.getElementById('st-card-btn-cost');

    if (btn && label && cost) {
      if (isMaxed) {
        btn.className = 'btn-upgrade-action maxed';
        label.textContent = 'MAX LEVEL';
        cost.textContent = '· READY TO RENOVATE';
      } else {
        const currentCost = gameState.getSewingUpgradeCost();
        const canAfford = gameState.canUpgradeSewing();
        btn.className = `btn-upgrade-action ${canAfford ? '' : 'disabled'}`;
        label.textContent = 'UPGRADE';
        cost.textContent = `· ${currentCost} 🪙`;
      }
    }
  }

  /**
   * Screen-Space Projection: Positions the speech-bubble card right above the 3D table
   */
  updateStationCardPosition(camera, width, height) {
    if (!this.stationCard || this.stationCard.style.display === 'none' || !this.targetStationPos) return;

    const pos = this.targetStationPos.clone();
    pos.project(camera);

    const screenX = ((pos.x + 1) / 2) * width;
    const screenY = ((-pos.y + 1) / 2) * height;

    this.stationCard.style.left = `${screenX}px`;
    this.stationCard.style.top = `${screenY}px`;
  }

  /**
   * Store Upgrades Modal (Clean Vertical Stack, Self-Clearing, Re-Stacking)
   */
  buildUpgradesModal() {
    this.upgradesModal = document.createElement('div');
    this.upgradesModal.className = 'modal-backdrop';
    this.upgradesModal.id = 'upgrades-modal';
    this.upgradesModal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header-row">
          <div class="modal-title-main">Boutique Upgrades</div>
          <div class="red-square-close" id="close-upgrades-modal">✕</div>
        </div>
        <div class="upgrades-list-container" id="upgrades-list"></div>
      </div>
    `;
    this.container.appendChild(this.upgradesModal);

    document.getElementById('close-upgrades-modal').onclick = () => {
      this.upgradesModal.style.display = 'none';
    };
  }

  openUpgradesModal() {
    this.renderUpgradesList();
    this.upgradesModal.style.display = 'flex';
  }

  renderUpgradesList() {
    const list = document.getElementById('upgrades-list');
    if (!list) return;
    list.innerHTML = '';

    const available = gameState.getAvailableUpgrades();

    if (available.length === 0) {
      list.innerHTML = `
        <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 18px; padding: 24px; text-align: center;">
          <div style="font-size: 36px; margin-bottom: 8px;">🎉 🌟 👔</div>
          <div style="font-size: 18px; font-weight: 800; color: #15803d;">All Available Upgrades Bought!</div>
          <div style="font-size: 13px; color: #475569; margin-top: 6px;">
            ${gameState.stage === 1 ? 'Upgrade Sewing Table to Level 25 to Renovate!' : 'Your Fashion Van is operating at maximum efficiency!'}
          </div>
        </div>
      `;
      return;
    }

    available.forEach(upg => {
      const row = document.createElement('div');
      row.className = 'upgrade-card-row';
      row.id = 'upg-row-' + upg.id;

      const canAfford = gameState.canBuyUpgrade(upg.id);

      row.innerHTML = `
        <div class="upg-left">
          <div class="upg-icon-badge">${upg.icon}</div>
          <div class="upg-info">
            <span class="upg-title">${upg.title}</span>
            <span class="upg-desc">${upg.description}</span>
          </div>
        </div>
        <div class="upg-buy-btn ${canAfford ? '' : 'disabled'}" id="buy-btn-${upg.id}">
          🪙 ${upg.cost}
        </div>
      `;

      const buyBtn = row.querySelector('.upg-buy-btn');
      buyBtn.onclick = () => {
        if (gameState.canBuyUpgrade(upg.id)) {
          if (gameState.buyUpgrade(upg.id)) {
            row.style.transform = 'translateX(40px)';
            row.style.opacity = '0';
            setTimeout(() => {
              this.renderUpgradesList();
            }, 250);
          }
        }
      };

      list.appendChild(row);
    });
  }

  buildUnlockModal() {
    this.unlockModal = document.createElement('div');
    this.unlockModal.className = 'modal-backdrop';
    this.unlockModal.id = 'unlock-modal';
    this.unlockModal.innerHTML = `
      <div class="modal-card" style="text-align: center; align-items: center;">
        <div class="red-square-close" style="align-self: flex-end;" id="close-unlock-modal">✕</div>
        <div style="font-size: 56px; margin-bottom: 8px;" id="unlock-modal-icon">👖</div>
        <div class="modal-title-main" id="unlock-modal-title">Unlock Station</div>
        <div style="font-size: 14px; color: #64748b; margin-top: 6px; margin-bottom: 20px;">
          Expand your boutique catalog to increase sales!
        </div>
        <div class="btn-upgrade-action" style="width: 100%;" id="btn-confirm-unlock">
          <span>UNLOCK</span>
          <span id="unlock-modal-cost">· 50 🪙</span>
        </div>
      </div>
    `;
    this.container.appendChild(this.unlockModal);

    document.getElementById('close-unlock-modal').onclick = () => {
      this.unlockModal.style.display = 'none';
    };
  }

  openUnlockModal(data) {
    this.currentUnlockData = data;
    document.getElementById('unlock-modal-title').textContent = data.title;
    document.getElementById('unlock-modal-icon').textContent = data.icon;
    document.getElementById('unlock-modal-cost').textContent = `· ${data.cost} 🪙`;

    const btn = document.getElementById('btn-confirm-unlock');
    const canAfford = gameState.coins >= data.cost;
    btn.className = `btn-upgrade-action ${canAfford ? '' : 'disabled'}`;

    btn.onclick = () => {
      if (data.stationId === 'jeans') {
        if (gameState.unlockJeansStation()) {
          this.unlockModal.style.display = 'none';
        }
      } else if (data.stationId === 'hats') {
        if (gameState.unlockHatsStation()) {
          this.unlockModal.style.display = 'none';
        }
      }
    };

    this.unlockModal.style.display = 'flex';
  }

  buildRenovationTransition() {
    this.renovateScreen = document.createElement('div');
    this.renovateScreen.className = 'renovate-screen';
    this.renovateScreen.id = 'renovate-screen';
    this.renovateScreen.innerHTML = `
      <div style="font-size: 72px; margin-bottom: 16px; animation: bounce 0.6s infinite alternate ease-in-out;">🚐 ✨</div>
      <div style="font-size: 32px; font-weight: 800; color: #0f172a; text-align: center;">Boutique Renovated!</div>
      <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 8px;">Welcome to the Mobile Fashion Van!</div>
      <div style="font-size: 14px; color: #64748b; margin-top: 6px;">+100 Bonus Coins Granted!</div>
    `;
    this.container.appendChild(this.renovateScreen);
  }

  startRenovationTransition() {
    this.renovateScreen.style.display = 'flex';
    this.renovateScreen.style.opacity = '1';

    setTimeout(() => {
      gameState.renovateToStage2();
      setTimeout(() => {
        this.renovateScreen.style.transition = 'opacity 0.8s ease';
        this.renovateScreen.style.opacity = '0';
        setTimeout(() => {
          this.renovateScreen.style.display = 'none';
          this.openStage2WelcomeModal();
        }, 800);
      }, 900);
    }, 400);
  }

  buildStage2Modal() {
    this.stage2Modal = document.createElement('div');
    this.stage2Modal.className = 'modal-backdrop';
    this.stage2Modal.id = 'stage2-modal';
    this.stage2Modal.innerHTML = `
      <div class="modal-card" style="text-align: center; align-items: center;">
        <div style="font-size: 56px; margin-bottom: 8px;">🚐 💎</div>
        <div class="modal-title-main">Stage 2: Fashion Van!</div>
        <div style="font-size: 14px; color: #64748b; margin-top: 8px; margin-bottom: 20px; line-height: 1.5;">
          You renovated into a high-end mobile boutique! Unlock Jeans & Hats stations, hire Cashier Emma & Master Tailor Lucas, and scale your brand!
        </div>
        <div class="btn-upgrade-action" style="width: 100%;" id="btn-stage2-letsgo">
          LET'S GO! 🚀
        </div>
      </div>
    `;
    this.container.appendChild(this.stage2Modal);

    document.getElementById('btn-stage2-letsgo').onclick = () => {
      this.stage2Modal.style.display = 'none';
    };
  }

  openStage2WelcomeModal() {
    if (this.stage2Modal) this.stage2Modal.style.display = 'flex';
  }

  buildNoticeModal() {
    this.noticeModal = document.createElement('div');
    this.noticeModal.className = 'modal-backdrop';
    this.noticeModal.id = 'notice-modal';
    this.noticeModal.innerHTML = `
      <div class="modal-card" style="text-align: center; align-items: center;">
        <div style="font-size: 48px; margin-bottom: 8px;">ℹ️</div>
        <div class="modal-title-main" id="notice-title">Notice</div>
        <div style="font-size: 14px; color: #475569; margin-top: 10px; margin-bottom: 22px; line-height: 1.5;" id="notice-msg">
          Message text
        </div>
        <div class="btn-upgrade-action" style="width: 100%;" id="btn-notice-ok">
          OKAY
        </div>
      </div>
    `;
    this.container.appendChild(this.noticeModal);

    document.getElementById('btn-notice-ok').onclick = () => {
      this.noticeModal.style.display = 'none';
    };
  }

  openNotice({ title, message }) {
    document.getElementById('notice-title').textContent = title || 'Notice';
    document.getElementById('notice-msg').textContent = message || '';
    this.noticeModal.style.display = 'flex';
  }

  updateCoins(amount) {
    const el = document.getElementById('coin-amount-text');
    if (el) el.textContent = gameState.formatCoins(amount);

    if (this.coinPill) {
      this.coinPill.style.transform = 'translateX(-50%) scale(1.14)';
      setTimeout(() => {
        this.coinPill.style.transform = 'translateX(-50%) scale(1.0)';
      }, 100);
    }

    if (this.stationCard && this.stationCard.style.display !== 'none') {
      this.refreshStationCard();
    }

    if (this.upgradesModal && this.upgradesModal.style.display !== 'none') {
      const available = gameState.getAvailableUpgrades();
      available.forEach(upg => {
        const btn = document.getElementById('buy-btn-' + upg.id);
        if (btn) {
          const canAfford = gameState.canBuyUpgrade(upg.id);
          if (canAfford) btn.classList.remove('disabled');
          else btn.classList.add('disabled');
        }
      });
    }
  }
}
