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
      overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;font-family:system-ui,sans-serif;color:#e6edf3;box-sizing:border-box;';
      gameContainer.appendChild(overlay);
    }

    overlay.innerHTML = `
      <!-- Right Panel: QuestTracker Positioned Safely on Right below Gold Card -->
      <div id="quest-tracker" style="position:absolute;top:95px;right:15px;width:210px;background:rgba(22,27,34,0.85);border:1px solid #30363d;border-radius:6px;padding:8px;font-size:11px;pointer-events:auto;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
        <div style="color:#3fb950;font-weight:bold;margin-bottom:4px;">🎯 Active Quests</div>
        <div id="quest-tracker-content"></div>
      </div>

      <!-- Center Unified GameMenuContainer Modal -->
      <div id="menu-modal" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:680px;height:420px;background:rgba(13,17,23,0.95);border:2px solid #58a6ff;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.8);pointer-events:auto;flex-direction:column;overflow:hidden;z-index:20;">
        <!-- Tab Navigation Bar -->
        <div style="display:flex;background:#161b22;border-bottom:1px solid #30363d;">
          <button class="menu-tab-btn" data-tab="inventory" style="flex:1;padding:10px;background:none;border:none;color:#c9d1d9;font-weight:bold;cursor:pointer;">🎒 Inventory</button>
          <button class="menu-tab-btn" data-tab="skills" style="flex:1;padding:10px;background:none;border:none;color:#c9d1d9;font-weight:bold;cursor:pointer;">⚡ Skills</button>
          <button class="menu-tab-btn" data-tab="quests" style="flex:1;padding:10px;background:none;border:none;color:#c9d1d9;font-weight:bold;cursor:pointer;">📜 Quests</button>
          <button class="menu-tab-btn" data-tab="character" style="flex:1;padding:10px;background:none;border:none;color:#c9d1d9;font-weight:bold;cursor:pointer;">👤 Character</button>
          <button class="menu-tab-btn" data-tab="shop" style="flex:1;padding:10px;background:none;border:none;color:#c9d1d9;font-weight:bold;cursor:pointer;">💰 Shop</button>
          <button class="menu-tab-btn" data-tab="settings" style="flex:1;padding:10px;background:none;border:none;color:#c9d1d9;font-weight:bold;cursor:pointer;">⚙️ Settings</button>
          <button id="close-menu-btn" style="padding:10px 16px;background:#da3633;border:none;color:#fff;font-weight:bold;cursor:pointer;">✕</button>
        </div>

        <!-- View Content Area -->
        <div id="menu-tab-view" style="flex:1;padding:16px;overflow-y:auto;font-size:13px;"></div>
      </div>

      <!-- Bottom Bar: Skills Hotbar Pinned Exactly at Page Bottom (bottom: 20px, left: 50%) -->
      <div id="hotbar" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);display:flex;justify-content:center;gap:10px;pointer-events:auto;z-index:10;"></div>
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
      html += `<div style="margin-bottom:6px;"><strong>${q.title}</strong>`;
      q.objectives.forEach(obj => {
        const checked = obj.completed ? 'checked' : '';
        html += `<div style="margin-top:2px;"><input type="checkbox" ${checked} disabled /> <span style="${obj.completed ? 'text-decoration:line-through;color:#3fb950;' : ''}">${obj.description} (${obj.currentAmount}/${obj.requiredAmount})</span></div>`;
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
      const style = skill.currentCooldown > 0 ? 'background:rgba(33,38,45,0.9);border:2px solid #da3633;color:#8b949e;' : 'background:rgba(22,27,34,0.9);border:2px solid #58a6ff;color:#fff;';
      html += `
        <button class="hotbar-btn" data-key="${skill.key}" style="${style}width:58px;height:52px;border-radius:8px;font-size:20px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.6);transition:transform 0.1s;">
          <span>${skill.icon}</span>
          <span style="font-size:11px;font-weight:bold;margin-top:2px;">${cd}</span>
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
          <div style="font-weight:bold;color:#58a6ff;font-size:16px;margin-bottom:12px;">🎒 Inventory & Backpack</div>
          <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:8px;">
            ${gsm ? gsm.player.inventory.map((item, i) => `
              <div style="background:#161b22;border:1px solid ${item ? '#58a6ff' : '#30363d'};border-radius:6px;height:65px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;" title="${item ? item.description : 'Empty Slot'}">
                <span style="font-size:22px;">${item ? item.icon : ''}</span>
                <span style="font-size:10px;color:#c9d1d9;">${item ? item.name.substring(0, 10) : 'Empty'}</span>
              </div>
            `).join('') : '<div>No Inventory Data</div>'}
          </div>
        `;
        break;

      case 'skills':
        viewEl.innerHTML = `
          <div style="font-weight:bold;color:#bc8cff;font-size:16px;margin-bottom:12px;">⚡ Skill Abilities</div>
          ${Array.from(gameRegistry.skills.values()).map(s => `
            <div style="background:#161b22;border:1px solid #30363d;padding:8px;margin-bottom:8px;border-radius:6px;display:flex;align-items:center;justify-content:space-between;">
              <div><strong>[${s.key.toUpperCase()}] ${s.icon} ${s.name}</strong> - <span style="color:#8b949e;">${s.description}</span></div>
              <div style="color:#58a6ff;font-weight:bold;">Mana: ${s.manaCost} | CD: ${s.cooldown}s</div>
            </div>
          `).join('')}
        `;
        break;

      case 'quests':
        viewEl.innerHTML = `
          <div style="font-weight:bold;color:#3fb950;font-size:16px;margin-bottom:12px;">📜 Quest Log</div>
          ${Array.from(gameRegistry.quests.values()).map(q => `
            <div style="background:#161b22;border:1px solid #30363d;padding:10px;margin-bottom:8px;border-radius:6px;">
              <div style="color:#3fb950;font-weight:bold;">${q.title}</div>
              <div style="color:#c9d1d9;margin-top:4px;">${q.description}</div>
              <div style="color:#e3b341;font-size:11px;margin-top:4px;">Reward: +${q.rewardXp} XP, +${q.rewardGold} Gold</div>
            </div>
          `).join('')}
        `;
        break;

      case 'character':
        const stats = gsm ? gsm.player.stats : null;
        viewEl.innerHTML = `
          <div style="font-weight:bold;color:#e3b341;font-size:16px;margin-bottom:12px;">👤 Hero Attributes</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#161b22;padding:12px;border-radius:6px;">
            <div>Level: <strong>${stats ? stats.level : 1}</strong></div>
            <div>Gold: 💰 <strong>${stats ? stats.gold : 0}</strong></div>
            <div>HP: <strong style="color:#f85149;">${stats ? Math.ceil(stats.hp) : 100} / ${stats ? stats.maxHp : 100}</strong></div>
            <div>Mana: <strong style="color:#58a6ff;">${stats ? Math.ceil(stats.mana) : 50} / ${stats ? stats.maxMana : 50}</strong></div>
            <div>Attack Power: <strong>${stats ? gsm.player.getTotalAttack() : 25}</strong></div>
            <div>Defense Rating: <strong>${stats ? gsm.player.getTotalDefense() : 10}</strong></div>
            <div>Critical Chance: <strong>${stats ? (stats.critChance * 100).toFixed(0) : 15}%</strong></div>
            <div>Movement Speed: <strong>${stats ? stats.speed : 180}</strong></div>
          </div>
        `;
        break;

      case 'shop':
        viewEl.innerHTML = `
          <div style="font-weight:bold;color:#e3b341;font-size:16px;margin-bottom:12px;">💰 Village Shop Catalog</div>
          <div style="background:#161b22;padding:10px;border-radius:6px;margin-bottom:8px;display:flex;justify-content:space-between;">
            <div>🧪 <strong>Health Potion</strong> - Restores 50 HP</div>
            <div>💰 25 Gold</div>
          </div>
          <div style="background:#161b22;padding:10px;border-radius:6px;display:flex;justify-content:space-between;">
            <div>🗡️ <strong>Iron Longsword</strong> - +20 Attack Power</div>
            <div>💰 120 Gold</div>
          </div>
        `;
        break;

      case 'settings':
        viewEl.innerHTML = `
          <div style="font-weight:bold;color:#c9d1d9;font-size:16px;margin-bottom:12px;">⚙️ Game Settings</div>
          <div style="background:#161b22;padding:12px;border-radius:6px;">
            <div style="margin-bottom:10px;">Master Volume: <input type="range" min="0" max="100" value="80" /></div>
            <div style="margin-bottom:10px;">Music Volume: <input type="range" min="0" max="100" value="70" /></div>
            <div>SFX Volume: <input type="range" min="0" max="100" value="90" /></div>
          </div>
        `;
        break;
    }
  }
}
