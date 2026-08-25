import { GameStateManager } from '../engine/GameStateManager';
import { gameRegistry } from '../data/GameRegistry';

export class GameMenuContainer {
  public activeTab: string = 'hidden'; // 'hidden' | 'inventory' | 'skills' | 'quests' | 'character' | 'shop' | 'settings'
  private containerEl: HTMLElement | null = null;
  private questTrackerEl: HTMLElement | null = null;
  private hotbarEl: HTMLElement | null = null;

  constructor() {
    this.injectUIOverlay();
  }

  private injectUIOverlay(): void {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;

    let overlay = document.getElementById('unified-ui-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'unified-ui-overlay';
      overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;font-family:Rajdhani,system-ui,sans-serif;color:#e6edf3;box-sizing:border-box;';
      gameContainer.appendChild(overlay);
    }

    overlay.innerHTML = `
      <!-- Right Panel: QuestTracker Positioned Safely on Right (top: 95px, right: 15px) below Gold Card -->
      <div id="quest-tracker" class="rpg-card" style="position:absolute;top:95px;right:15px;width:220px;padding:10px;font-size:12px;pointer-events:auto;">
        <div class="rpg-header" style="color:#ffd700;font-weight:bold;margin-bottom:6px;font-size:14px;">🎯 ACTIVE QUESTS</div>
        <div id="quest-tracker-content"></div>
      </div>

      <!-- Center Unified GameMenuContainer Modal -->
      <div id="menu-modal" class="rpg-card" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:720px;height:440px;pointer-events:auto;flex-direction:column;overflow:hidden;z-index:20;">
        <!-- Tab Navigation Bar -->
        <div style="display:flex;background:#0f141e;border-bottom:2px solid #c9a050;">
          <button class="menu-tab-btn rpg-btn" data-tab="inventory" style="flex:1;padding:12px;font-weight:bold;cursor:pointer;">🎒 INVENTORY</button>
          <button class="menu-tab-btn rpg-btn" data-tab="skills" style="flex:1;padding:12px;font-weight:bold;cursor:pointer;">⚡ SKILLS</button>
          <button class="menu-tab-btn rpg-btn" data-tab="quests" style="flex:1;padding:12px;font-weight:bold;cursor:pointer;">📜 QUESTS</button>
          <button class="menu-tab-btn rpg-btn" data-tab="character" style="flex:1;padding:12px;font-weight:bold;cursor:pointer;">👤 HERO</button>
          <button class="menu-tab-btn rpg-btn" data-tab="shop" style="flex:1;padding:12px;font-weight:bold;cursor:pointer;">💰 SHOP</button>
          <button class="menu-tab-btn rpg-btn" data-tab="settings" style="flex:1;padding:12px;font-weight:bold;cursor:pointer;">⚙️ SETTINGS</button>
          <button id="close-menu-btn" class="rpg-btn" style="padding:12px 18px;background:#da3633;border-color:#ff4d4d;color:#fff;font-weight:bold;cursor:pointer;">✕</button>
        </div>

        <!-- View Content Area -->
        <div id="menu-tab-view" style="flex:1;padding:18px;overflow-y:auto;font-size:14px;"></div>
      </div>

      <!-- Bottom Bar: Skills Hotbar Pinned Exactly at Page Bottom (bottom: 20px, left: 50%) -->
      <div id="hotbar" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;justify-content:center;gap:12px;pointer-events:auto;z-index:10;"></div>
    `;

    this.containerEl = document.getElementById('menu-modal');
    this.questTrackerEl = document.getElementById('quest-tracker-content');
    this.hotbarEl = document.getElementById('hotbar');

    document.querySelectorAll('.menu-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        this.activeTab = target.dataset.tab || 'inventory';
        this.renderActiveTab(null);
      });
    });

    document.getElementById('close-menu-btn')?.addEventListener('click', () => {
      this.activeTab = 'hidden';
      if (this.containerEl) this.containerEl.style.display = 'none';
    });
  }

  public addLog(msg: string): void {
    // System Log box removed per user request
  }

  public updateChatLog(): void {
    // System Log box removed per user request
  }

  public updateQuestTracker(gsm: GameStateManager): void {
    if (!this.questTrackerEl) return;
    const activeQuests = gsm.questLog.quests.filter(q => q.status === 'ACTIVE' || q.status === 'COMPLETED');

    if (activeQuests.length === 0) {
      this.questTrackerEl.innerHTML = '<div style="color:#8b949e;">No active quests</div>';
      return;
    }

    let html = '';
    activeQuests.forEach(q => {
      html += `<div style="margin-bottom:8px;"><strong style="color:#ffd700;font-family:Cinzel,serif;">${q.title}</strong>`;
      q.objectives.forEach(obj => {
        const checked = obj.completed ? 'checked' : '';
        html += `<div style="margin-top:4px;"><input type="checkbox" ${checked} disabled /> <span style="${obj.completed ? 'text-decoration:line-through;color:#3fb950;' : 'color:#e6edf3;'}">${obj.description} (${obj.currentAmount}/${obj.requiredAmount})</span></div>`;
      });
      html += `</div>`;
    });
    this.questTrackerEl.innerHTML = html;
  }

  public updateHotbar(gsm: GameStateManager): void {
    if (!this.hotbarEl) return;
    let html = '';
    gsm.player.skills.forEach(skill => {
      const cd = skill.currentCooldown > 0 ? `${skill.currentCooldown.toFixed(1)}s` : skill.key.toUpperCase();
      const style = skill.currentCooldown > 0 ? 'background:rgba(20,25,35,0.9);border:2px solid #da3633;color:#8b949e;' : 'background:linear-gradient(180deg, #2a3547 0%, #161e2b 100%);border:2px solid #c9a050;color:#fff;';
      html += `
        <button class="hotbar-btn" data-key="${skill.key}" style="${style}width:60px;height:54px;border-radius:8px;font-size:22px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(0,0,0,0.8);">
          <span>${skill.icon}</span>
          <span style="font-size:11px;font-family:Cinzel,serif;font-weight:bold;margin-top:2px;color:#ffd700;">${cd}</span>
        </button>
      `;
    });
    this.hotbarEl.innerHTML = html;

    document.querySelectorAll('.hotbar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const key = (e.currentTarget as HTMLElement).dataset.key;
        if (key) gsm.executePlayerSkill(key);
      });
    });
  }

  public toggleTab(tab: string, gsm: GameStateManager): void {
    if (this.activeTab === tab) {
      this.activeTab = 'hidden';
      if (this.containerEl) this.containerEl.style.display = 'none';
    } else {
      this.activeTab = tab;
      if (this.containerEl) this.containerEl.style.display = 'flex';
      this.renderActiveTab(gsm);
    }
  }

  public renderActiveTab(gsm: GameStateManager | null): void {
    const viewEl = document.getElementById('menu-tab-view');
    if (!viewEl) return;

    if (this.activeTab === 'hidden') {
      if (this.containerEl) this.containerEl.style.display = 'none';
      return;
    }

    if (this.containerEl) this.containerEl.style.display = 'flex';

    switch (this.activeTab) {
      case 'inventory':
        viewEl.innerHTML = `
          <div class="rpg-header" style="font-weight:bold;color:#ffd700;font-size:18px;margin-bottom:14px;">🎒 HERO INVENTORY & BACKPACK</div>
          <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:10px;">
            ${gsm ? gsm.player.inventory.map((item, i) => `
              <div style="background:#161e2b;border:1.5px solid ${item ? '#c9a050' : '#30363d'};border-radius:6px;height:70px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;" title="${item ? item.description : 'Empty Slot'}">
                <span style="font-size:24px;">${item ? item.icon : ''}</span>
                <span style="font-size:11px;color:#c9d1d9;">${item ? item.name.substring(0, 10) : 'Empty'}</span>
              </div>
            `).join('') : '<div>No Inventory Data</div>'}
          </div>
        `;
        break;

      case 'skills':
        viewEl.innerHTML = `
          <div class="rpg-header" style="font-weight:bold;color:#bc8cff;font-size:18px;margin-bottom:14px;">⚡ HERO SKILL ABILITIES</div>
          ${Array.from(gameRegistry.skills.values()).map(s => `
            <div style="background:#161e2b;border:1.5px solid #c9a050;padding:10px;margin-bottom:10px;border-radius:6px;display:flex;align-items:center;justify-content:space-between;">
              <div><strong style="color:#ffd700;font-family:Cinzel,serif;">[${s.key.toUpperCase()}] ${s.icon} ${s.name}</strong> - <span style="color:#c9d1d9;">${s.description}</span></div>
              <div style="color:#58a6ff;font-weight:bold;">Mana: ${s.manaCost} | Cooldown: ${s.cooldown}s</div>
            </div>
          `).join('')}
        `;
        break;

      case 'quests':
        viewEl.innerHTML = `
          <div class="rpg-header" style="font-weight:bold;color:#3fb950;font-size:18px;margin-bottom:14px;">📜 ACTIVE QUEST LOG</div>
          ${Array.from(gameRegistry.quests.values()).map(q => `
            <div style="background:#161e2b;border:1.5px solid #c9a050;padding:12px;margin-bottom:10px;border-radius:6px;">
              <div style="color:#ffd700;font-weight:bold;font-family:Cinzel,serif;">${q.title}</div>
              <div style="color:#c9d1d9;margin-top:4px;">${q.description}</div>
              <div style="color:#e3b341;font-size:12px;margin-top:6px;">Reward: +${q.rewardXp} XP, +${q.rewardGold} Gold</div>
            </div>
          `).join('')}
        `;
        break;

      case 'character':
        const stats = gsm ? gsm.player.stats : null;
        viewEl.innerHTML = `
          <div class="rpg-header" style="font-weight:bold;color:#ffd700;font-size:18px;margin-bottom:14px;">👤 HERO ATTRIBUTES & STATS</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;background:#161e2b;padding:16px;border-radius:6px;border:1.5px solid #c9a050;">
            <div>Level: <strong style="color:#ffd700;">${stats ? stats.level : 1}</strong></div>
            <div>Gold: 💰 <strong style="color:#ffd700;">${stats ? stats.gold : 0}</strong></div>
            <div>HP: <strong style="color:#f85149;">${stats ? Math.ceil(stats.hp) : 100} / ${stats ? stats.maxHp : 100}</strong></div>
            <div>Mana: <strong style="color:#58a6ff;">${stats ? Math.ceil(stats.mana) : 50} / ${stats ? stats.maxMana : 50}</strong></div>
            <div>Attack Power: <strong style="color:#ffd700;">${stats ? gsm.player.getTotalAttack() : 25}</strong></div>
            <div>Defense Rating: <strong style="color:#3fb950;">${stats ? gsm.player.getTotalDefense() : 10}</strong></div>
            <div>Critical Chance: <strong style="color:#bc8cff;">${stats ? (stats.critChance * 100).toFixed(0) : 15}%</strong></div>
            <div>Movement Speed: <strong>${stats ? stats.speed : 180}</strong></div>
          </div>
        `;
        break;

      case 'shop':
        viewEl.innerHTML = `
          <div class="rpg-header" style="font-weight:bold;color:#ffd700;font-size:18px;margin-bottom:14px;">💰 VILLAGE MERCHANT CATALOG</div>
          <div style="background:#161e2b;padding:12px;border-radius:6px;margin-bottom:10px;display:flex;justify-content:space-between;border:1.5px solid #c9a050;">
            <div>🧪 <strong>Health Potion</strong> - Restores 50 HP</div>
            <div style="color:#ffd700;font-weight:bold;">💰 25 Gold</div>
          </div>
          <div style="background:#161e2b;padding:12px;border-radius:6px;display:flex;justify-content:space-between;border:1.5px solid #c9a050;">
            <div>🗡️ <strong>Iron Longsword</strong> - +20 Attack Power</div>
            <div style="color:#ffd700;font-weight:bold;">💰 120 Gold</div>
          </div>
        `;
        break;

      case 'settings':
        viewEl.innerHTML = `
          <div class="rpg-header" style="font-weight:bold;color:#c9d1d9;font-size:18px;margin-bottom:14px;">⚙️ GAME SETTINGS</div>
          <div style="background:#161e2b;padding:16px;border-radius:6px;border:1.5px solid #c9a050;">
            <div style="margin-bottom:12px;">Master Volume: <input type="range" min="0" max="100" value="80" /></div>
            <div style="margin-bottom:12px;">Music Volume: <input type="range" min="0" max="100" value="70" /></div>
            <div>SFX Volume: <input type="range" min="0" max="100" value="90" /></div>
          </div>
        `;
        break;
    }
  }
}
