import { GameStateManager } from './GameStateManager';
import { GameState, ItemType } from '../types/GameTypes';
import { SaveSystem } from '../utils/SaveSystem';

export class Canvas2DRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  public render(gsm: GameStateManager): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    switch (gsm.currentState) {
      case GameState.MAIN_MENU:
        this.renderMainMenu(gsm);
        break;

      case GameState.PLAYING:
      case GameState.PAUSED:
      case GameState.INVENTORY:
      case GameState.QUESTS:
      case GameState.SHOP:
      case GameState.DIALOGUE:
        this.renderWorldAndGameplay(gsm);
        this.renderHUD(gsm);

        if (gsm.currentState === GameState.PAUSED) this.renderPauseMenu(gsm);
        if (gsm.currentState === GameState.INVENTORY) this.renderInventoryUI(gsm);
        if (gsm.currentState === GameState.QUESTS) this.renderQuestsUI(gsm);
        if (gsm.currentState === GameState.SHOP) this.renderShopUI(gsm);
        if (gsm.currentState === GameState.DIALOGUE) this.renderDialogueUI(gsm);
        break;

      case GameState.GAME_OVER:
        this.renderWorldAndGameplay(gsm);
        this.renderGameOverScreen();
        break;

      case GameState.VICTORY:
        this.renderWorldAndGameplay(gsm);
        this.renderVictoryScreen();
        break;
    }
  }

  private renderMainMenu(gsm: GameStateManager): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#0b0e14';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title
    ctx.fillStyle = '#58a6ff';
    ctx.font = 'bold 54px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VORTEX QUEST', this.canvas.width / 2, 200);

    ctx.fillStyle = '#e6edf3';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText('Enterprise 2D Action RPG Engine', this.canvas.width / 2, 250);

    // Options
    ctx.fillStyle = '#3fb950';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText('[ Press SPACE or ENTER for NEW GAME ]', this.canvas.width / 2, 360);

    if (SaveSystem.hasSave()) {
      ctx.fillStyle = '#bc8cff';
      ctx.fillText('[ Press C to CONTINUE GAME ]', this.canvas.width / 2, 420);
    }

    ctx.fillStyle = '#8b949e';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText('Controls: WASD / Arrows = Move  |  Space = Attack  |  1-4, Q = Skills  |  E = Interact  |  I = Inventory  |  L = Quests', this.canvas.width / 2, 510);
  }

  private renderWorldAndGameplay(gsm: GameStateManager): void {
    const ctx = this.ctx;
    const currentZone = gsm.world.getCurrentZone();
    const { offsetX, offsetY } = gsm.camera.getOffset();

    ctx.save();
    ctx.translate(-offsetX, -offsetY);

    // Render Zone Background
    ctx.fillStyle = currentZone.color;
    ctx.fillRect(0, 0, currentZone.width, currentZone.height);

    // Render Tile Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const tileSize = 64;
    for (let x = 0; x < currentZone.width; x += tileSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, currentZone.height); ctx.stroke();
    }
    for (let y = 0; y < currentZone.height; y += tileSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(currentZone.width, y); ctx.stroke();
    }

    // Render Zone Portal
    if (currentZone.portal) {
      const p = currentZone.portal;
      ctx.fillStyle = 'rgba(88, 166, 255, 0.4)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 35, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(`PORTAL (${p.targetZone})`, p.x, p.y - 45);
    }

    // Render NPCs
    currentZone.npcs.forEach(npc => {
      ctx.fillStyle = npc.role === 'MERCHANT' ? '#e3b341' : '#3fb950';
      ctx.beginPath(); ctx.arc(npc.x, npc.y, 18, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();

      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(npc.name, npc.x, npc.y - 25);
      ctx.fillStyle = '#8b949e'; ctx.font = '12px system-ui';
      ctx.fillText('[Press E to Talk]', npc.x, npc.y + 35);
    });

    // Render Enemies
    currentZone.enemies.forEach(enemy => {
      if (enemy.hp > 0) {
        // Enemy Body
        ctx.fillStyle = enemy.isBoss ? '#da3633' : '#f85149';
        ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#30363d'; ctx.lineWidth = 2; ctx.stroke();

        // Enemy Name
        ctx.fillStyle = '#ffffff'; ctx.font = enemy.isBoss ? 'bold 16px system-ui' : '12px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(enemy.name, enemy.x, enemy.y - enemy.radius - 12);

        // Enemy Health Bar
        const barWidth = enemy.radius * 2.4;
        const barHeight = 5;
        const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillStyle = '#21262d'; ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 8, barWidth, barHeight);
        ctx.fillStyle = '#da3633'; ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 8, barWidth * hpRatio, barHeight);
      }
    });

    // Render Projectiles
    gsm.projectiles.forEach(p => {
      ctx.fillStyle = p.fromEnemy ? '#f85149' : '#58a6ff';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    });

    // Render Player
    const player = gsm.player;
    ctx.fillStyle = '#58a6ff';
    ctx.beginPath(); ctx.arc(player.stats.x, player.stats.y, player.stats.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#1f6beb'; ctx.lineWidth = 3; ctx.stroke();

    // Attack Range Highlight on Space
    if (gsm.input.isKeyDown(' ')) {
      ctx.strokeStyle = 'rgba(88, 166, 255, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(player.stats.x, player.stats.y, 60, 0, Math.PI * 2); ctx.stroke();
    }

    // Render Floating Text Numbers
    gsm.floatingTexts.forEach(ft => {
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }

  private renderHUD(gsm: GameStateManager): void {
    const ctx = this.ctx;
    const player = gsm.player;

    // Top-Left Player Stats HUD Card
    ctx.fillStyle = 'rgba(22, 27, 34, 0.85)';
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.fillRect(15, 15, 240, 110);
    ctx.strokeRect(15, 15, 240, 110);

    ctx.fillStyle = '#58a6ff'; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'left';
    ctx.fillText(`Vortex Hero (Lvl ${player.stats.level})`, 25, 36);

    // HP Bar
    const hpRatio = Math.max(0, player.stats.hp / player.stats.maxHp);
    ctx.fillStyle = '#21262d'; ctx.fillRect(25, 45, 180, 12);
    ctx.fillStyle = '#f85149'; ctx.fillRect(25, 45, 180 * hpRatio, 12);
    ctx.fillStyle = '#ffffff'; ctx.font = '11px system-ui';
    ctx.fillText(`HP: ${Math.ceil(player.stats.hp)} / ${player.stats.maxHp}`, 30, 55);

    // Mana Bar
    const manaRatio = Math.max(0, player.stats.mana / player.stats.maxMana);
    ctx.fillStyle = '#21262d'; ctx.fillRect(25, 63, 180, 12);
    ctx.fillStyle = '#1f6beb'; ctx.fillRect(25, 63, 180 * manaRatio, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`MP: ${Math.ceil(player.stats.mana)} / ${player.stats.maxMana}`, 30, 73);

    // XP Bar
    const xpRatio = Math.max(0, player.stats.xp / player.stats.maxXp);
    ctx.fillStyle = '#21262d'; ctx.fillRect(25, 81, 180, 10);
    ctx.fillStyle = '#3fb950'; ctx.fillRect(25, 81, 180 * xpRatio, 10);
    ctx.fillStyle = '#ffffff'; ctx.font = '10px system-ui';
    ctx.fillText(`XP: ${player.stats.xp} / ${player.stats.maxXp}`, 30, 89);

    // Gold & Zone Info (Top-Right)
    ctx.fillStyle = 'rgba(22, 27, 34, 0.85)';
    ctx.fillRect(this.canvas.width - 230, 15, 215, 70);
    ctx.strokeRect(this.canvas.width - 230, 15, 215, 70);

    ctx.fillStyle = '#e3b341'; ctx.font = 'bold 15px system-ui'; ctx.textAlign = 'right';
    ctx.fillText(`💰 Gold: ${player.stats.gold}`, this.canvas.width - 25, 38);
    ctx.fillStyle = '#bc8cff'; ctx.font = '13px system-ui';
    ctx.fillText(`📍 ${gsm.world.getCurrentZone().name}`, this.canvas.width - 25, 62);

    // Boss Health Bar Overlay (if Boss in zone)
    const boss = gsm.world.getCurrentZone().enemies.find(e => e.isBoss && e.hp > 0);
    if (boss) {
      const bossHpRatio = Math.max(0, boss.hp / boss.maxHp);
      ctx.fillStyle = 'rgba(22, 27, 34, 0.9)'; ctx.fillRect(this.canvas.width / 2 - 250, 15, 500, 45);
      ctx.strokeStyle = '#da3633'; ctx.lineWidth = 2; ctx.strokeRect(this.canvas.width / 2 - 250, 15, 500, 45);
      ctx.fillStyle = '#da3633'; ctx.fillRect(this.canvas.width / 2 - 240, 35, 480 * bossHpRatio, 18);

      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(`${boss.name} - Phase ${boss.bossPhase}`, this.canvas.width / 2, 30);
    }

    // Bottom Skill Hotbar
    const hotbarX = this.canvas.width / 2 - 175;
    const hotbarY = this.canvas.height - 60;
    player.skills.forEach((skill, idx) => {
      const x = hotbarX + idx * 70;
      ctx.fillStyle = 'rgba(22, 27, 34, 0.85)'; ctx.fillRect(x, hotbarY, 60, 50);
      ctx.strokeStyle = skill.currentCooldown > 0 ? '#da3633' : '#30363d'; ctx.strokeRect(x, hotbarY, 60, 50);

      ctx.fillStyle = '#ffffff'; ctx.font = '20px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(skill.icon, x + 30, hotbarY + 28);
      ctx.fillStyle = '#58a6ff'; ctx.font = 'bold 11px system-ui';
      ctx.fillText(skill.key.toUpperCase(), x + 10, hotbarY + 14);

      if (skill.currentCooldown > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(x, hotbarY, 60, 50);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px system-ui';
        ctx.fillText(skill.currentCooldown.toFixed(1) + 's', x + 30, hotbarY + 32);
      }
    });
  }

  private renderPauseMenu(gsm: GameStateManager): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(11, 14, 20, 0.8)'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#58a6ff'; ctx.font = 'bold 36px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('PAUSED', this.canvas.width / 2, 200);

    ctx.fillStyle = '#e6edf3'; ctx.font = '20px system-ui';
    ctx.fillText('[ Press ESC to Resume ]', this.canvas.width / 2, 280);
    ctx.fillText('[ Press I for Inventory | L for Quests ]', this.canvas.width / 2, 330);

    ctx.fillStyle = '#3fb950'; ctx.font = 'bold 20px system-ui';
    ctx.fillText('[ Press S to Save Game Progress ]', this.canvas.width / 2, 400);

    if (gsm.input.isKeyJustPressed('s')) {
      gsm.saveCurrentGame();
    }
  }

  private renderInventoryUI(gsm: GameStateManager): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(11, 14, 20, 0.9)'; ctx.fillRect(50, 50, this.canvas.width - 100, this.canvas.height - 100);
    ctx.strokeStyle = '#30363d'; ctx.lineWidth = 2; ctx.strokeRect(50, 50, this.canvas.width - 100, this.canvas.height - 100);

    ctx.fillStyle = '#58a6ff'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('INVENTORY & EQUIPMENT', 80, 95);

    // Equipment Slots
    ctx.fillStyle = '#e6edf3'; ctx.font = 'bold 18px system-ui';
    ctx.fillText('Equipment:', 80, 145);

    const eq = gsm.player.equipment;
    ctx.font = '14px system-ui';
    ctx.fillText(`Weapon: ${eq.weapon ? eq.weapon.name : 'None'}`, 80, 175);
    ctx.fillText(`Armor: ${eq.armor ? eq.armor.name : 'None'}`, 80, 205);
    ctx.fillText(`Accessory: ${eq.accessory ? eq.accessory.name : 'None'}`, 80, 235);

    // Inventory 20-Slot Grid
    ctx.fillText('Backpack Items:', 400, 145);
    const startX = 400; const startY = 165;
    gsm.player.inventory.forEach((item, idx) => {
      const row = Math.floor(idx / 5);
      const col = idx % 5;
      const x = startX + col * 90;
      const y = startY + row * 80;

      ctx.fillStyle = 'rgba(22, 27, 34, 0.9)'; ctx.fillRect(x, y, 80, 70);
      ctx.strokeStyle = item ? '#58a6ff' : '#30363d'; ctx.strokeRect(x, y, 80, 70);

      if (item) {
        ctx.fillStyle = '#ffffff'; ctx.font = '22px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(item.icon, x + 40, y + 35);
        ctx.font = '11px system-ui';
        ctx.fillText(item.name.substring(0, 10), x + 40, y + 55);
      }
    });

    ctx.fillStyle = '#8b949e'; ctx.font = '14px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('Press I or ESC to close Inventory', 80, this.canvas.height - 80);
  }

  private renderQuestsUI(gsm: GameStateManager): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(11, 14, 20, 0.9)'; ctx.fillRect(80, 60, this.canvas.width - 160, this.canvas.height - 120);
    ctx.strokeStyle = '#30363d'; ctx.lineWidth = 2; ctx.strokeRect(80, 60, this.canvas.width - 160, this.canvas.height - 120);

    ctx.fillStyle = '#3fb950'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('QUEST LOG', 110, 105);

    gsm.questLog.quests.forEach((q, idx) => {
      const y = 150 + idx * 110;
      ctx.fillStyle = q.status === 'COMPLETED' ? '#3fb950' : (q.status === 'ACTIVE' ? '#58a6ff' : '#8b949e');
      ctx.font = 'bold 18px system-ui';
      ctx.fillText(`[${q.status}] ${q.title}`, 110, y);

      ctx.fillStyle = '#e6edf3'; ctx.font = '14px system-ui';
      ctx.fillText(q.description, 110, y + 25);

      q.objectives.forEach(obj => {
        ctx.fillStyle = obj.completed ? '#3fb950' : '#e3b341';
        ctx.fillText(`  • ${obj.description}: ${obj.currentAmount}/${obj.requiredAmount}`, 110, y + 48);
      });

      if (q.status === 'COMPLETED') {
        ctx.fillStyle = '#3fb950'; ctx.font = 'bold 14px system-ui';
        ctx.fillText(`Press [ 1 ] to Claim Reward (+${q.rewardXp} XP, +${q.rewardGold} Gold)`, 110, y + 70);
        if (gsm.input.isKeyJustPressed('1')) {
          gsm.questLog.claimReward(q.id, gsm.player);
        }
      }
    });

    ctx.fillStyle = '#8b949e'; ctx.font = '14px system-ui';
    ctx.fillText('Press L or ESC to close Quest Log', 110, this.canvas.height - 90);
  }

  private renderShopUI(gsm: GameStateManager): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(11, 14, 20, 0.9)'; ctx.fillRect(100, 80, this.canvas.width - 200, this.canvas.height - 160);
    ctx.strokeStyle = '#e3b341'; ctx.lineWidth = 2; ctx.strokeRect(100, 80, this.canvas.width - 200, this.canvas.height - 160);

    ctx.fillStyle = '#e3b341'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'left';
    ctx.fillText('VILLAGE SHOP MERCHANT', 130, 125);
    ctx.fillStyle = '#ffffff'; ctx.font = '16px system-ui';
    ctx.fillText(`Your Gold: 💰 ${gsm.player.stats.gold}`, 130, 160);

    // Item 1: Health Potion (25 Gold)
    ctx.fillStyle = '#58a6ff'; ctx.font = 'bold 16px system-ui';
    ctx.fillText('1. Health Potion - 💰 25 Gold (Restores 50 HP) [Press 1 to Buy]', 130, 210);
    if (gsm.input.isKeyJustPressed('1') && gsm.player.stats.gold >= 25) {
      gsm.player.stats.gold -= 25;
      gsm.addItemToInventory({
        id: 'hp_potion_' + Date.now(),
        name: 'Health Potion',
        description: 'Restores 50 HP on use.',
        type: ItemType.POTION,
        rarity: ItemRarity.COMMON,
        stackable: true,
        quantity: 1,
        maxStack: 10,
        stats: { hp: 50 },
        value: 25,
        icon: '🧪'
      });
      gsm.addFloatingText('Bought Health Potion!', gsm.player.stats.x, gsm.player.stats.y - 20, '#3fb950');
    }

    // Item 2: Iron Longsword (120 Gold)
    ctx.fillText('2. Iron Longsword - 💰 120 Gold (+20 Attack) [Press 2 to Buy]', 130, 260);
    if (gsm.input.isKeyJustPressed('2') && gsm.player.stats.gold >= 120) {
      gsm.player.stats.gold -= 120;
      gsm.addItemToInventory({
        id: 'iron_sword_' + Date.now(),
        name: 'Iron Longsword',
        description: 'Sturdy iron blade.',
        type: ItemType.WEAPON,
        rarity: ItemRarity.UNCOMMON,
        stackable: false,
        quantity: 1,
        maxStack: 1,
        stats: { attack: 20 },
        value: 120,
        icon: '🗡️'
      });
      gsm.addFloatingText('Bought Iron Longsword!', gsm.player.stats.x, gsm.player.stats.y - 20, '#3fb950');
    }

    ctx.fillStyle = '#8b949e'; ctx.font = '14px system-ui';
    ctx.fillText('Press E or ESC to exit Shop', 130, this.canvas.height - 110);
  }

  private renderDialogueUI(gsm: GameStateManager): void {
    const ctx = this.ctx;
    const npc = gsm.activeNPC;
    if (!npc) return;

    ctx.fillStyle = 'rgba(22, 27, 34, 0.95)'; ctx.fillRect(100, this.canvas.height - 180, this.canvas.width - 200, 140);
    ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 2; ctx.strokeRect(100, this.canvas.height - 180, this.canvas.width - 200, 140);

    ctx.fillStyle = '#58a6ff'; ctx.font = 'bold 20px system-ui'; ctx.textAlign = 'left';
    ctx.fillText(npc.name, 130, this.canvas.height - 145);

    ctx.fillStyle = '#e6edf3'; ctx.font = '16px system-ui';
    npc.dialogue.forEach((line, idx) => {
      ctx.fillText(line, 130, this.canvas.height - 115 + idx * 24);
    });

    ctx.fillStyle = '#8b949e'; ctx.font = '12px system-ui';
    ctx.fillText('Press E to close Dialogue', this.canvas.width - 260, this.canvas.height - 55);
  }

  private renderGameOverScreen(): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(11, 14, 20, 0.85)'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#f85149'; ctx.font = 'bold 54px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', this.canvas.width / 2, 250);

    ctx.fillStyle = '#e6edf3'; ctx.font = '20px system-ui';
    ctx.fillText('Your hero was defeated in combat...', this.canvas.width / 2, 320);

    ctx.fillStyle = '#58a6ff'; ctx.font = 'bold 24px system-ui';
    ctx.fillText('[ Press SPACE or R to RESPAWN ]', this.canvas.width / 2, 400);
  }

  private renderVictoryScreen(): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(11, 14, 20, 0.85)'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#3fb950'; ctx.font = 'bold 54px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('VICTORY!', this.canvas.width / 2, 230);

    ctx.fillStyle = '#e3b341'; ctx.font = 'bold 24px system-ui';
    ctx.fillText('You have defeated the Vortex Guardian and saved the Realm!', this.canvas.width / 2, 300);

    ctx.fillStyle = '#58a6ff'; ctx.font = '20px system-ui';
    ctx.fillText('[ Press SPACE or R to play again ]', this.canvas.width / 2, 380);
  }
}
