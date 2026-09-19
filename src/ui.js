/**
 * Fitventure - HTML5/CSS3 DOM UI Controller
 * Typography: 'Fredoka', 'Nunito', sans-serif (+40% enlarged)
 * Features:
 * 1. Top Coin Pill with 3D depth and large chunky numerals.
 * 2. Chunky 3D Bottom Dock Buttons with dark bottom bevel stripes and tactile squash/stretch.
 * 3. Self-Clearing Global Upgrades Menu (Purchased cards disappear and smoothly re-stack).
 * 4. Station Upgrade Modal with Stage 1 Level 25 Cap ("Level X / 25" & "MAX LEVEL - READY TO RENOVATE").
 * 5. Unlock Station Modal for Jeans Station & Hats Rack.
 * 6. True Renovation Transition & Stage 2 Grand Opening Modal.
 * 7. Bold Red Square Close Buttons (X).
 */

import { GAME_CONFIG, STORE_UPGRADES, gameState } from './config.js';

export class UIManager {
  constructor(eventsEmitter) {
    this.events = eventsEmitter;
    this.container = document.getElementById('ui-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'ui-container';
      document.body.appendChild(this.container);
    }

    this.injectStyles();
    this.buildTopCoinPill();
    this.buildBottomDock();
    this.buildStationModal();
    this.buildUpgradesModal();
    this.buildUnlockModal();
    this.buildRenovationTransition();
    this.buildStage2Modal();
    this.buildNoticeModal();

    // Event listeners
    gameState.on('coinsChanged', (data) => this.updateCoins(data.coins));
    gameState.on('stationUpgraded', () => {
      this.updateRenovateBtn();
      this.refreshStationModal();
    });
    gameState.on('upgradePurchased', () => this.updateRenovateBtn());
    gameState.on('stageRenovated', () => this.updateRenovateBtn());

    this.events.on('openStationUpgrade', () => this.openStationModal());
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
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        background: #ffffff;
        padding: 6px 24px 6px 14px;
        border-radius: 36px;
        box-shadow: 0 6px 0 #94a3b8, 0 10px 18px rgba(0,0,0,0.3);
        border: 2px solid #e2e8f0;
        pointer-events: auto;
        transition: transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .coin-icon {
        width: 44px;
        height: 44px;
        background: radial-gradient(circle at 35% 35%, #fbbf24, #d97706);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #b45309;
        font-size: 22px;
        font-weight: bold;
        box-shadow: 0 3px 0 #92400e, inset 0 2px 3px rgba(255,255,255,0.6);
        margin-right: 12px;
      }
      .coin-amount {
        font-size: 34px;
        font-weight: 700;
        color: #0f172a;
        letter-spacing: -0.5px;
      }

      /* Bottom Navigation Dock */
      .bottom-dock {
        position: absolute;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 16px;
        width: 92%;
        max-width: 520px;
        justify-content: center;
        pointer-events: auto;
      }
      .chunky-btn {
        flex: 1;
        height: 78px;
        border-radius: 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #ffffff;
        position: relative;
        text-align: center;
        transition: transform 0.08s ease, filter 0.1s ease;
      }
      .chunky-btn:active {
        transform: translateY(5px) scale(0.96);
      }
      .btn-icon {
        font-size: 26px;
        margin-bottom: 2px;
      }
      .btn-title {
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .btn-sub {
        font-size: 11px;
        font-weight: 700;
        opacity: 0.9;
      }

      /* Button Themes with Dark Bottom Bevel Stripes */
      .btn-renovate {
        background: #475569;
        box-shadow: 0 8px 0 #334155, 0 12px 18px rgba(0,0,0,0.3);
      }
      .btn-renovate.ready {
        background: linear-gradient(180deg, #fbbf24, #f59e0b);
        box-shadow: 0 8px 0 #b45309, 0 0 18px #f59e0b, 0 12px 18px rgba(0,0,0,0.35);
        animation: pulseHalo 1.2s infinite alternate ease-in-out;
      }
      .btn-boost {
        background: linear-gradient(180deg, #f59e0b, #d97706);
        box-shadow: 0 8px 0 #92400e, 0 12px 18px rgba(0,0,0,0.3);
      }
      .btn-upgrades {
        background: linear-gradient(180deg, #22c55e, #16a34a);
        box-shadow: 0 8px 0 #15803d, 0 12px 18px rgba(0,0,0,0.3);
      }

      @keyframes pulseHalo {
        from { transform: scale(1.0); filter: brightness(1.0); }
        to { transform: scale(1.05); filter: brightness(1.15); }
      }

      /* Red Square Close Button (X) */
      .red-square-close {
        width: 44px;
        height: 44px;
        background: #ef4444;
        border-radius: 10px;
        box-shadow: 0 4px 0 #b91c1c;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        pointer-events: auto;
        position: absolute;
        top: 20px;
        right: 20px;
        transition: transform 0.08s ease;
      }
      .red-square-close:active {
        transform: translateY(3px) scale(0.95);
      }

      /* Modals Generic */
      .modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.65);
        display: none;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        z-index: 100;
        backdrop-filter: blur(3px);
      }
      .modal-card {
        background: #ffffff;
        border-radius: 28px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 16px 36px rgba(0,0,0,0.45);
        position: relative;
        padding: 24px 20px;
        box-sizing: border-box;
        animation: popModal 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      @keyframes popModal {
        from { transform: scale(0.85); opacity: 0; }
        to { transform: scale(1.0); opacity: 1; }
      }
      .modal-header {
        border-bottom: 2px solid #f1f5f9;
        padding-bottom: 14px;
        margin-bottom: 18px;
      }
      .modal-title {
        font-size: 26px;
        font-weight: 700;
        color: #0f172a;
      }
      .modal-subtitle {
        font-size: 14px;
        color: #64748b;
        margin-top: 4px;
      }

      /* Store Upgrades Cards List (Proper 85px Step & Self-Clearing) */
      .upgrades-list-container {
        max-height: 430px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding-right: 4px;
      }
      .upgrade-card-row {
        height: 74px;
        background: #ffffff;
        border-radius: 16px;
        border: 2px solid #e2e8f0;
        box-shadow: 0 3px 0 #cbd5e1;
        display: flex;
        align-items: center;
        padding: 8px 14px;
        justify-content: space-between;
        transition: transform 0.2s ease, opacity 0.2s ease;
      }
      .upgrade-card-row.purchased-anim {
        transform: translateX(120%);
        opacity: 0;
      }
      .upg-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .upg-icon-badge {
        width: 48px;
        height: 48px;
        background: #f1f5f9;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
      }
      .upg-info {
        display: flex;
        flex-direction: column;
      }
      .upg-title {
        font-size: 17px;
        font-weight: 700;
        color: #0f172a;
      }
      .upg-desc {
        font-size: 12px;
        color: #64748b;
        max-width: 220px;
      }
      .upg-buy-btn {
        width: 110px;
        height: 46px;
        border-radius: 12px;
        background: #22c55e;
        box-shadow: 0 4px 0 #15803d;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.08s ease;
      }
      .upg-buy-btn.disabled {
        background: #64748b;
        box-shadow: 0 4px 0 #334155;
        cursor: not-allowed;
      }
      .upg-buy-btn:active:not(.disabled) {
        transform: translateY(3px);
      }
      .upg-buy-label {
        font-size: 12px;
        font-weight: 700;
      }
      .upg-buy-cost {
        font-size: 14px;
        font-weight: 700;
        color: #fef08a;
      }

      /* Station Modal Card */
      .stat-row {
        background: #f8fafc;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        padding: 12px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .stat-label {
        font-size: 18px;
        font-weight: 700;
        color: #334155;
      }
      .stat-val {
        font-size: 22px;
        font-weight: 700;
        color: #15803d;
      }
      .btn-upgrade-station {
        width: 100%;
        height: 64px;
        border-radius: 16px;
        background: #3b82f6;
        box-shadow: 0 6px 0 #1d4ed8;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        cursor: pointer;
        margin-top: 16px;
      }
      .btn-upgrade-station.maxed {
        background: #f59e0b;
        box-shadow: 0 6px 0 #b45309;
        cursor: default;
      }
      .btn-upgrade-station:active:not(.maxed) {
        transform: translateY(4px);
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

      /* Renovation Full-Screen White Overlay */
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
      .renovate-tool {
        font-size: 78px;
        animation: toolSwing 0.4s infinite alternate ease-in-out;
      }
      @keyframes toolSwing {
        from { transform: rotate(-20deg) scale(1.0); }
        to { transform: rotate(20deg) scale(1.15); }
      }
      .renovate-title {
        font-size: 28px;
        font-weight: 700;
        color: #0f172a;
        margin-top: 20px;
      }
      .renovate-bar-track {
        width: 320px;
        height: 22px;
        background: #e2e8f0;
        border-radius: 12px;
        margin-top: 18px;
        overflow: hidden;
      }
      .renovate-bar-fill {
        width: 0%;
        height: 100%;
        background: #2563eb;
        border-radius: 12px;
        transition: width 0.05s linear;
      }
      .renovate-pct {
        font-size: 18px;
        font-weight: 700;
        color: #64748b;
        margin-top: 10px;
      }
    `;
    document.head.appendChild(style);
  }

  buildTopCoinPill() {
    this.coinPill = document.createElement('div');
    this.coinPill.className = 'top-coin-pill';
    this.coinPill.innerHTML = `
      <div class="coin-icon">★</div>
      <div class="coin-amount" id="coin-amount-text">${gameState.formatCoins(gameState.coins)}</div>
    `;
    this.container.appendChild(this.coinPill);
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

    if (this.stationModal && this.stationModal.style.display !== 'none') {
      this.refreshStationModal();
    }

    if (this.upgradesModal && this.upgradesModal.style.display !== 'none') {
      const available = gameState.getAvailableUpgrades();
      available.forEach(upg => {
        const btn = document.getElementById("buy-btn-" + upg.id);
        if (btn) {
          const canAfford = gameState.canBuyUpgrade(upg.id);
          if (canAfford) btn.classList.remove('disabled');
          else btn.classList.add('disabled');
        }
      });
    }
  }

  buildBottomDock() {
    this.dock = document.createElement('div');
    this.dock.className = 'bottom-dock';
    this.dock.innerHTML = `
      <div class="chunky-btn btn-renovate" id="btn-renovate">
        <span class="btn-icon">🔨</span>
        <span class="btn-title">RENOVATE</span>
        <span class="btn-sub" id="renovate-sub-text">LV. 1/25</span>
      </div>
      <div class="chunky-btn btn-boost" id="btn-boost">
        <span class="btn-icon">⚡</span>
        <span class="btn-title">2X BOOST</span>
        <span class="btn-sub" id="boost-sub-text">TAP TO ACTIVATE</span>
      </div>
      <div class="chunky-btn btn-upgrades" id="btn-upgrades">
        <span class="btn-icon">⭐</span>
        <span class="btn-title">UPGRADES</span>
        <span class="btn-sub">STORE PERKS</span>
      </div>
    `;
    this.container.appendChild(this.dock);

    document.getElementById('btn-renovate').onclick = () => {
      if (gameState.isRenovateUnlocked()) {
        this.startRenovationTransition();
      } else {
        const stage1Bought = STORE_UPGRADES.filter(u => u.stage === 1 && gameState.isUpgradePurchased(u.id)).length;
        this.openNotice({
          title: 'Renovation Locked',
          text: `To Renovate and transition to Stage 2 (Fashion Van):\n\n1. Sewing Table Level 25 (Current: Lv. ${gameState.sewingStation.level}/25)\n2. All Stage 1 Store Upgrades (${stage1Bought}/5 bought in UPGRADES menu)`
        });
      }
    };

    document.getElementById('btn-boost').onclick = () => {
      if (!gameState.boostActive) {
        gameState.activateBoost(30);
      }
    };

    gameState.on('boostChanged', (data) => {
      const sub = document.getElementById('boost-sub-text');
      if (sub) sub.textContent = data.active ? `${data.duration}s REMAINING` : 'TAP TO ACTIVATE';
    });
    gameState.on('boostTick', (data) => {
      const sub = document.getElementById('boost-sub-text');
      if (sub) sub.textContent = `${data.duration}s REMAINING`;
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

    if (gameState.stage >= 2) {
      btn.className = 'chunky-btn btn-renovate';
      btn.style.background = '#0d9488';
      btn.style.boxShadow = '0 8px 0 #0f766e';
      sub.textContent = 'FASHION VAN';
      return;
    }

    if (gameState.isRenovateUnlocked()) {
      btn.className = 'chunky-btn btn-renovate ready';
      sub.textContent = 'READY! TAP HERE';
    } else {
      btn.className = 'chunky-btn btn-renovate';
      sub.textContent = `LV. ${gameState.sewingStation.level}/25`;
    }
  }

  buildStationModal() {
    this.stationModal = document.createElement('div');
    this.stationModal.className = 'modal-backdrop';
    this.stationModal.id = 'station-modal';
    this.stationModal.innerHTML = `
      <div class="modal-card">
        <div class="red-square-close" id="close-station-modal">✕</div>
        <div class="modal-header">
          <div class="modal-title" id="station-modal-title">Sewing Table</div>
          <div class="modal-subtitle" id="station-modal-sub">Crafts crisp graphic T-shirts</div>
        </div>
        <div class="stat-row">
          <span class="stat-label">Level Progress:</span>
          <span class="stat-val" id="st-level-val">1 / 25</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Profit Per T-Shirt:</span>
          <span class="stat-val" id="st-profit-val">🪙 +4</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Crafting Speed:</span>
          <span class="stat-val" id="st-speed-val">1.8s</span>
        </div>
        <div class="btn-upgrade-station" id="btn-upgrade-station">
          <span style="font-size: 20px; font-weight: 700;" id="st-btn-label">UPGRADE</span>
          <span style="font-size: 16px; font-weight: 700; color: #fef08a;" id="st-btn-cost">🪙 10</span>
        </div>
      </div>
    `;
    this.container.appendChild(this.stationModal);

    document.getElementById('close-station-modal').onclick = () => {
      this.stationModal.style.display = 'none';
    };

    document.getElementById('btn-upgrade-station').onclick = () => {
      if (gameState.canUpgradeSewing()) {
        gameState.upgradeSewing();
        this.refreshStationModal();
      }
    };
  }

  openStationModal() {
    this.refreshStationModal();
    this.stationModal.style.display = 'flex';
  }

  refreshStationModal() {
    const { level, maxLevel } = gameState.sewingStation;
    const isStage1Max = gameState.stage === 1 && level >= 25;
    const cost = gameState.getSewingUpgradeCost();

    document.getElementById('station-modal-title').textContent = `Sewing Table - Lv. ${level}`;
    document.getElementById('st-level-val').textContent = isStage1Max ? 'MAX LV. 25' : `${level} / ${maxLevel}`;
    document.getElementById('st-profit-val').textContent = `🪙 +${gameState.formatCoins(gameState.getSewingProfit())}`;
    document.getElementById('st-speed-val').textContent = `${(gameState.getSewingCraftDuration() / 1000).toFixed(1)}s`;

    const btn = document.getElementById('btn-upgrade-station');
    const label = document.getElementById('st-btn-label');
    const costText = document.getElementById('st-btn-cost');

    if (isStage1Max) {
      btn.className = 'btn-upgrade-station maxed';
      label.textContent = 'MAX LEVEL';
      costText.textContent = 'READY TO RENOVATE';
    } else {
      btn.className = 'btn-upgrade-station';
      label.textContent = 'UPGRADE';
      costText.textContent = `🪙 ${gameState.formatCoins(cost)}`;
    }
  }

  /**
   * FIX: Self-Clearing Global Upgrades Menu (Bug-Free DOM List Rendering)
   */
  buildUpgradesModal() {
    this.upgradesModal = document.createElement('div');
    this.upgradesModal.className = 'modal-backdrop';
    this.upgradesModal.id = 'upgrades-modal';
    this.upgradesModal.innerHTML = `
      <div class="modal-card">
        <div class="red-square-close" id="close-upgrades-modal">✕</div>
        <div class="modal-header">
          <div class="modal-title">⭐ STORE UPGRADES</div>
          <div class="modal-subtitle">Purchased perks disappear to keep shop clean!</div>
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
          <div style="font-size: 40px; margin-bottom: 8px;">🎉 🌟 👔</div>
          <div style="font-size: 20px; font-weight: bold; color: #15803d;">All Available Upgrades Bought!</div>
          <div style="font-size: 14px; color: #475569; margin-top: 6px;">
            ${gameState.stage === 1 ? 'Upgrade Sewing Table to Level 25 to Renovate!' : 'Your Fashion Van is running at maximum efficiency!'}
          </div>
        </div>
      `;
      return;
    }

    available.forEach(upg => {
      const row = document.createElement('div');
      row.className = 'upgrade-card-row';
      row.id = `upg-row-${upg.id}`;

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
          <span class="upg-buy-label">BUY</span>
          <span class="upg-buy-cost">🪙 ${upg.cost}</span>
        </div>
      `;

      row.querySelector(`#buy-btn-${upg.id}`).onclick = () => {
        if (gameState.canBuyUpgrade(upg.id)) {
          gameState.buyUpgrade(upg.id);

          // Animate and DISAPPEAR immediately!
          row.classList.add('purchased-anim');
          setTimeout(() => {
            this.renderUpgradesList();
          }, 200);
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
      <div class="modal-card" style="text-align: center;">
        <div class="red-square-close" id="close-unlock-modal">✕</div>
        <div style="font-size: 52px; margin-top: 10px;" id="unlock-icon">👖</div>
        <div class="modal-title" style="margin-top: 10px;" id="unlock-title">Unlock Jeans Station</div>
        <div class="modal-subtitle" style="margin-top: 6px; font-size: 15px;" id="unlock-desc">Craft and sell designer denim jeans for higher profit!</div>
        <div class="btn-upgrade-station" id="btn-confirm-unlock" style="background: #22c55e; box-shadow: 0 6px 0 #15803d; margin-top: 24px;">
          <span style="font-size: 20px; font-weight: 700;" id="unlock-btn-text">UNLOCK (🪙 50)</span>
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
    document.getElementById('unlock-icon').textContent = data.icon;
    document.getElementById('unlock-title').textContent = data.title;
    document.getElementById('unlock-desc').textContent = data.desc;
    document.getElementById('unlock-btn-text').textContent = `UNLOCK (🪙 ${data.cost})`;

    const btn = document.getElementById('btn-confirm-unlock');
    btn.onclick = () => {
      let success = false;
      if (data.stationId === 'jeans') success = gameState.unlockJeansStation();
      else if (data.stationId === 'hats') success = gameState.unlockHatsStation();

      if (success) {
        this.unlockModal.style.display = 'none';
      }
    };

    this.unlockModal.style.display = 'flex';
  }

  buildRenovationTransition() {
    this.renovateScreen = document.createElement('div');
    this.renovateScreen.className = 'renovate-screen';
    this.renovateScreen.id = 'renovate-screen';
    this.renovateScreen.innerHTML = `
      <div class="renovate-tool">🔨</div>
      <div class="renovate-title">Renovating Boutique...</div>
      <div class="renovate-bar-track">
        <div class="renovate-bar-fill" id="renovate-fill"></div>
      </div>
      <div class="renovate-pct" id="renovate-pct">0%</div>
    `;
    this.container.appendChild(this.renovateScreen);
  }

  startRenovationTransition() {
    this.renovateScreen.style.display = 'flex';
    const fill = document.getElementById('renovate-fill');
    const pct = document.getElementById('renovate-pct');

    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      fill.style.width = `${p}%`;
      pct.textContent = `${p}%`;

      if (p >= 100) {
        clearInterval(interval);
        gameState.renovateToStage2();

        setTimeout(() => {
          this.renovateScreen.style.display = 'none';
          this.openStage2Modal();
        }, 300);
      }
    }, 45);
  }

  buildStage2Modal() {
    this.stage2Modal = document.createElement('div');
    this.stage2Modal.className = 'modal-backdrop';
    this.stage2Modal.id = 'stage2-modal';
    this.stage2Modal.innerHTML = `
      <div class="modal-card" style="text-align: center; border: 3px solid #14b8a6;">
        <div class="red-square-close" id="close-stage2-modal">✕</div>
        <div style="font-size: 56px; margin-top: 10px;">🚚 ✨ 👗</div>
        <div class="modal-title" style="color: #0d9488; margin-top: 10px;">🎉 FASHION VAN: OPEN!</div>
        <div style="font-size: 15px; color: #475569; margin-top: 10px; line-height: 1.5;">
          Welcome to Stage 2: Mobile Boutique!<br>
          Serve trendy shoppers from your custom fashion truck.<br>
          Unlock the Jeans Table (50🪙) and Hats Rack (100🪙) to multiply profits!
        </div>
        <div class="btn-upgrade-station" id="btn-stage2-start" style="background: #0d9488; box-shadow: 0 6px 0 #0f766e; margin-top: 24px;">
          <span style="font-size: 20px; font-weight: 700;">LET'S ROLL! 🚀</span>
        </div>
      </div>
    `;
    this.container.appendChild(this.stage2Modal);

    document.getElementById('close-stage2-modal').onclick = () => {
      this.stage2Modal.style.display = 'none';
    };
    document.getElementById('btn-stage2-start').onclick = () => {
      this.stage2Modal.style.display = 'none';
    };
  }

  openStage2Modal() {
    this.stage2Modal.style.display = 'flex';
  }

  buildNoticeModal() {
    this.noticeModal = document.createElement('div');
    this.noticeModal.className = 'modal-backdrop';
    this.noticeModal.id = 'notice-modal';
    this.noticeModal.innerHTML = `
      <div class="modal-card" style="text-align: center;">
        <div class="red-square-close" id="close-notice-modal">✕</div>
        <div class="modal-title" id="notice-title" style="margin-top: 10px;">Notice</div>
        <div id="notice-body" style="font-size: 15px; color: #475569; margin-top: 12px; line-height: 1.6; white-space: pre-line;"></div>
        <div class="btn-upgrade-station" id="btn-notice-ok" style="background: #3b82f6; box-shadow: 0 6px 0 #1d4ed8; margin-top: 20px;">
          <span style="font-size: 18px; font-weight: 700;">GOT IT</span>
        </div>
      </div>
    `;
    this.container.appendChild(this.noticeModal);

    document.getElementById('close-notice-modal').onclick = () => {
      this.noticeModal.style.display = 'none';
    };
    document.getElementById('btn-notice-ok').onclick = () => {
      this.noticeModal.style.display = 'none';
    };
  }

  openNotice(data) {
    document.getElementById('notice-title').textContent = data.title || 'Notice';
    document.getElementById('notice-body').textContent = data.text || '';
    this.noticeModal.style.display = 'flex';
  }
}
