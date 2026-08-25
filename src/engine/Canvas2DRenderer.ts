import { GameStateManager } from './GameStateManager';
import { GameState, ItemType } from '../types/GameTypes';
import { SaveSystem } from '../utils/SaveSystem';

export class Canvas2DRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animTimer: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  public render(gsm: GameStateManager): void {
    this.animTimer += 0.016;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    switch (gsm.currentState) {
      case GameState.MAIN_MENU:
        this.renderMainMenu(gsm);
        break;

      case GameState.MANUAL:
        this.renderManualScreen(gsm);
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
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title Banner
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 64px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.fillText('VORTEX QUEST', this.canvas.width / 2, 180);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#58a6ff';
    ctx.font = '22px Rajdhani, sans-serif';
    ctx.fillText('Enterprise 2D Action RPG Engine', this.canvas.width / 2, 230);
  }

  private renderManualScreen(gsm: GameStateManager): void {
    // Fill dark background, back text view removed per user request (handled by HTML card modal)
    const ctx = this.ctx;
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderWorldAndGameplay(gsm: GameStateManager): void {
    const ctx = this.ctx;
    const currentZone = gsm.world.getCurrentZone();
    const { offsetX, offsetY } = gsm.camera.getOffset();

    ctx.save();
    ctx.translate(-offsetX, -offsetY);

    ctx.fillStyle = currentZone.color;
    ctx.fillRect(0, 0, currentZone.width, currentZone.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const tileSize = 64;
    for (let x = 0; x < currentZone.width; x += tileSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, currentZone.height); ctx.stroke();
    }
    for (let y = 0; y < currentZone.height; y += tileSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(currentZone.width, y); ctx.stroke();
    }

    currentZone.decorations.forEach(deco => {
      switch (deco.type) {
        case 'PATH':
          ctx.fillStyle = deco.color || '#273342';
          ctx.fillRect(deco.x, deco.y, deco.w || 600, deco.h || 50);
          ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
          for (let px = deco.x; px < deco.x + (deco.w || 600); px += 40) {
            ctx.strokeRect(px, deco.y, 40, deco.h || 50);
          }
          break;

        case 'POND':
          const r = deco.w || 80;
          const ripple = Math.sin(this.animTimer * 2) * 4;
          ctx.fillStyle = '#1b4965';
          ctx.beginPath(); ctx.arc(deco.x, deco.y, r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(deco.x, deco.y, r - 10 + ripple, 0, Math.PI * 2); ctx.stroke();
          break;

        case 'HOUSE':
          ctx.fillStyle = deco.color || '#3d2516';
          ctx.fillRect(deco.x, deco.y, deco.w || 140, deco.h || 120);
          ctx.strokeStyle = '#1d1007'; ctx.lineWidth = 3; ctx.strokeRect(deco.x, deco.y, deco.w || 140, deco.h || 120);
          ctx.fillStyle = '#8b261d';
          ctx.beginPath();
          ctx.moveTo(deco.x - 12, deco.y);
          ctx.lineTo(deco.x + (deco.w || 140) / 2, deco.y - 45);
          ctx.lineTo(deco.x + (deco.w || 140) + 12, deco.y);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = '#e3b341'; ctx.fillRect(deco.x + 20, deco.y + 30, 24, 24);
          ctx.fillRect(deco.x + (deco.w || 140) - 44, deco.y + 30, 24, 24);
          if (deco.label) {
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px Cinzel, serif'; ctx.textAlign = 'center';
            ctx.fillText(deco.label, deco.x + (deco.w || 140) / 2, deco.y + (deco.h || 120) / 2 + 20);
          }
          break;

        case 'TREE':
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.beginPath(); ctx.ellipse(deco.x, deco.y + 10, deco.w || 50, 15, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#4a2e1b'; ctx.fillRect(deco.x - 10, deco.y - 20, 20, 35);
          ctx.fillStyle = deco.color || '#194d22';
          ctx.beginPath(); ctx.arc(deco.x, deco.y - 40, (deco.w || 50), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#236b2f';
          ctx.beginPath(); ctx.arc(deco.x - 10, deco.y - 50, (deco.w || 50) * 0.7, 0, Math.PI * 2); ctx.fill();
          break;

        case 'LANTERN':
          ctx.fillStyle = '#30363d'; ctx.fillRect(deco.x - 4, deco.y - 45, 8, 45);
          const radGlow = ctx.createRadialGradient(deco.x, deco.y - 50, 5, deco.x, deco.y - 50, 60);
          radGlow.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
          radGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
          ctx.fillStyle = radGlow;
          ctx.beginPath(); ctx.arc(deco.x, deco.y - 50, 60, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = deco.color || '#ffd700';
          ctx.beginPath(); ctx.arc(deco.x, deco.y - 50, 9, 0, Math.PI * 2); ctx.fill();
          break;

        case 'FENCE':
          ctx.fillStyle = deco.color || '#4a3321';
          ctx.fillRect(deco.x, deco.y, deco.w || 400, deco.h || 12);
          break;

        case 'CRYSTAL':
          ctx.fillStyle = deco.color || '#a371f7';
          ctx.shadowColor = deco.color || '#a371f7'; ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(deco.x, deco.y - (deco.w || 35));
          ctx.lineTo(deco.x + (deco.w || 35) / 2, deco.y);
          ctx.lineTo(deco.x, deco.y + (deco.w || 35));
          ctx.lineTo(deco.x - (deco.w || 35) / 2, deco.y);
          ctx.closePath(); ctx.fill();
          ctx.shadowBlur = 0;
          break;

        case 'ROCK':
          ctx.fillStyle = deco.color || '#38444f';
          ctx.beginPath(); ctx.arc(deco.x, deco.y, deco.w || 35, 0, Math.PI * 2); ctx.fill();
          break;
      }
    });

    if (currentZone.portal) {
      const p = currentZone.portal;
      const portalGlow = ctx.createRadialGradient(p.x, p.y, 5, p.x, p.y, 45);
      portalGlow.addColorStop(0, 'rgba(88, 166, 255, 0.8)');
      portalGlow.addColorStop(1, 'rgba(88, 166, 255, 0)');
      ctx.fillStyle = portalGlow;
      ctx.beginPath(); ctx.arc(p.x, p.y, 45, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, 35, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px Cinzel, serif'; ctx.textAlign = 'center';
      ctx.fillText(`PORTAL (${p.targetZone})`, p.x, p.y - 50);
    }

    currentZone.npcs.forEach(npc => {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath(); ctx.ellipse(npc.x, npc.y + 12, 18, 8, 0, 0, Math.PI * 2); ctx.fill();

      if (npc.role === 'ELDER') {
        ctx.fillStyle = '#1f6beb'; ctx.beginPath(); ctx.arc(npc.x, npc.y, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(npc.x, npc.y - 12, 10, Math.PI, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = '#e3b341'; ctx.beginPath(); ctx.arc(npc.x, npc.y, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#da3633'; ctx.beginPath(); ctx.arc(npc.x, npc.y - 10, 8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();

      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 14px Cinzel, serif'; ctx.textAlign = 'center';
      ctx.fillText(npc.name, npc.x, npc.y - 28);
      ctx.fillStyle = '#e6edf3'; ctx.font = '12px Rajdhani, sans-serif';
      ctx.fillText('[Press E to Talk]', npc.x, npc.y + 36);
    });

    currentZone.enemies.forEach(enemy => {
      if (enemy.hp > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(enemy.x, enemy.y + enemy.radius * 0.7, enemy.radius, enemy.radius * 0.4, 0, 0, Math.PI * 2); ctx.fill();

        if (enemy.isBoss) {
          const pulse = Math.sin(this.animTimer * 4) * 6;
          const bossGlow = ctx.createRadialGradient(enemy.x, enemy.y, 10, enemy.x, enemy.y, enemy.radius + 20 + pulse);
          bossGlow.addColorStop(0, 'rgba(218, 54, 51, 0.9)');
          bossGlow.addColorStop(0.5, 'rgba(163, 113, 247, 0.6)');
          bossGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = bossGlow;
          ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.radius + 20 + pulse, 0, Math.PI * 2); ctx.fill();

          ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.radius + pulse, 0, Math.PI * 2); ctx.stroke();

          ctx.fillStyle = '#1c080d';
          ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.radius * 0.8, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = enemy.type === 'SLIME' ? '#3fb950' : (enemy.type === 'MAGE' ? '#a371f7' : '#f85149');
          ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#30363d'; ctx.lineWidth = 2; ctx.stroke();
        }

        ctx.fillStyle = enemy.isBoss ? '#ffd700' : '#ffffff';
        ctx.font = enemy.isBoss ? 'bold 16px Cinzel, serif' : '13px Rajdhani, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(enemy.name, enemy.x, enemy.y - enemy.radius - 14);

        const barWidth = enemy.radius * 2.5;
        const barHeight = 6;
        const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillStyle = '#161b22'; ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 8, barWidth, barHeight);
        ctx.fillStyle = '#da3633'; ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 8, barWidth * hpRatio, barHeight);
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1; ctx.strokeRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 8, barWidth, barHeight);
      }
    });

    gsm.projectiles.forEach(p => {
      ctx.fillStyle = p.fromEnemy ? '#f85149' : '#58a6ff';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    });

    const player = gsm.player;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.ellipse(player.stats.x, player.stats.y + 12, 18, 8, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#58a6ff';
    ctx.beginPath(); ctx.arc(player.stats.x, player.stats.y, player.stats.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2.5; ctx.stroke();

    ctx.fillStyle = '#ffd700';
    ctx.fillRect(player.stats.x - 6, player.stats.y - 4, 12, 5);

    ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#58a6ff'; ctx.shadowBlur = 10;
    ctx.fillRect(player.stats.x + 12, player.stats.y - 14, 4, 20);
    ctx.shadowBlur = 0;

    if (gsm.input.isKeyDown(' ')) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(player.stats.x, player.stats.y, 60, 0, Math.PI * 2); ctx.stroke();
    }

    gsm.floatingTexts.forEach(ft => {
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 17px Cinzel, serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }

  private renderHUD(gsm: GameStateManager): void {
    const ctx = this.ctx;
    const player = gsm.player;
    const currentZone = gsm.world.getCurrentZone();

    ctx.fillStyle = 'rgba(15, 20, 30, 0.9)';
    ctx.strokeStyle = '#c9a050'; ctx.lineWidth = 1.5;
    ctx.fillRect(15, 15, 250, 115);
    ctx.strokeRect(15, 15, 250, 115);

    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 16px Cinzel, serif'; ctx.textAlign = 'left';
    ctx.fillText(`Vortex Hero (Lvl ${player.stats.level})`, 28, 38);

    const hpRatio = Math.max(0, player.stats.hp / player.stats.maxHp);
    ctx.fillStyle = '#161e2b'; ctx.fillRect(28, 48, 190, 13);
    ctx.fillStyle = '#f85149'; ctx.fillRect(28, 48, 190 * hpRatio, 13);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1; ctx.strokeRect(28, 48, 190, 13);
    ctx.fillStyle = '#ffffff'; ctx.font = '11px Rajdhani, sans-serif';
    ctx.fillText(`HP: ${Math.ceil(player.stats.hp)} / ${player.stats.maxHp}`, 35, 58);

    const manaRatio = Math.max(0, player.stats.mana / player.stats.maxMana);
    ctx.fillStyle = '#161e2b'; ctx.fillRect(28, 68, 190, 13);
    ctx.fillStyle = '#1f6beb'; ctx.fillRect(28, 68, 190 * manaRatio, 13);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1; ctx.strokeRect(28, 68, 190, 13);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`MP: ${Math.ceil(player.stats.mana)} / ${player.stats.maxMana}`, 35, 78);

    const xpRatio = Math.max(0, player.stats.xp / player.stats.maxXp);
    ctx.fillStyle = '#161e2b'; ctx.fillRect(28, 88, 190, 11);
    ctx.fillStyle = '#3fb950'; ctx.fillRect(28, 88, 190 * xpRatio, 11);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1; ctx.strokeRect(28, 88, 190, 11);
    ctx.fillStyle = '#ffffff'; ctx.font = '10px Rajdhani, sans-serif';
    ctx.fillText(`XP: ${player.stats.xp} / ${player.stats.maxXp}`, 35, 96);

    ctx.fillStyle = 'rgba(15, 20, 30, 0.9)';
    ctx.fillRect(this.canvas.width / 2 - 200, 15, 400, 36);
    ctx.strokeStyle = '#c9a050'; ctx.lineWidth = 1.5; ctx.strokeRect(this.canvas.width / 2 - 200, 15, 400, 36);

    ctx.fillStyle = '#f0e6d2'; ctx.font = 'bold 13px Cinzel, serif'; ctx.textAlign = 'center';
    ctx.fillText('🎒[I] Inv   ⚡[K] Skills   📜[L] Quests   👤[C] Hero   📖[M] Guide', this.canvas.width / 2, 38);

    const goldCardX = this.canvas.width - 280;
    ctx.fillStyle = 'rgba(15, 20, 30, 0.9)';
    ctx.fillRect(goldCardX, 15, 200, 70);
    ctx.strokeStyle = '#c9a050'; ctx.lineWidth = 1.5; ctx.strokeRect(goldCardX, 15, 200, 70);

    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 16px Cinzel, serif'; ctx.textAlign = 'right';
    ctx.fillText(`💰 Gold: ${player.stats.gold}`, goldCardX + 185, 38);
    ctx.fillStyle = '#bc8cff'; ctx.font = '14px Rajdhani, sans-serif';
    ctx.fillText(`📍 ${currentZone.name}`, goldCardX + 185, 62);

    const pauseBtnX = this.canvas.width - 65;
    ctx.fillStyle = 'rgba(15, 20, 30, 0.9)';
    ctx.fillRect(pauseBtnX, 15, 50, 40);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5; ctx.strokeRect(pauseBtnX, 15, 50, 40);

    ctx.fillStyle = '#ffffff'; ctx.font = '22px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('⏸️', pauseBtnX + 25, 43);

    const mapX = this.canvas.width - 75;
    const mapY = this.canvas.height - 110;
    const mapR = 55;
    ctx.save();
    ctx.beginPath(); ctx.arc(mapX, mapY, mapR, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = 'rgba(5, 7, 10, 0.95)'; ctx.fillRect(mapX - mapR, mapY - mapR, mapR * 2, mapR * 2);

    const scaleX = (mapR * 1.6) / currentZone.width;
    const scaleY = (mapR * 1.6) / currentZone.height;

    ctx.fillStyle = '#58a6ff';
    ctx.beginPath(); ctx.arc(mapX - mapR * 0.8 + player.stats.x * scaleX, mapY - mapR * 0.8 + player.stats.y * scaleY, 4, 0, Math.PI * 2); ctx.fill();

    currentZone.enemies.forEach(e => {
      if (e.hp > 0) {
        ctx.fillStyle = e.isBoss ? '#da3633' : '#f85149';
        ctx.beginPath(); ctx.arc(mapX - mapR * 0.8 + e.x * scaleX, mapY - mapR * 0.8 + e.y * scaleY, e.isBoss ? 5 : 3, 0, Math.PI * 2); ctx.fill();
      }
    });

    currentZone.npcs.forEach(n => {
      ctx.fillStyle = '#3fb950';
      ctx.beginPath(); ctx.arc(mapX - mapR * 0.8 + n.x * scaleX, mapY - mapR * 0.8 + n.y * scaleY, 3, 0, Math.PI * 2); ctx.fill();
    });

    ctx.restore();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(mapX, mapY, mapR, 0, Math.PI * 2); ctx.stroke();

    const boss = currentZone.enemies.find(e => e.isBoss && e.hp > 0);
    if (boss) {
      const bossHpRatio = Math.max(0, boss.hp / boss.maxHp);
      ctx.fillStyle = 'rgba(15, 20, 30, 0.95)'; ctx.fillRect(this.canvas.width / 2 - 250, 60, 500, 45);
      ctx.strokeStyle = '#da3633'; ctx.lineWidth = 2; ctx.strokeRect(this.canvas.width / 2 - 250, 60, 500, 45);
      ctx.fillStyle = '#da3633'; ctx.fillRect(this.canvas.width / 2 - 240, 80, 480 * bossHpRatio, 18);

      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 15px Cinzel, serif'; ctx.textAlign = 'center';
      ctx.fillText(`${boss.name} - Phase ${boss.bossPhase}`, this.canvas.width / 2, 75);
    }
  }

  private renderPauseMenu(gsm: GameStateManager): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(5, 7, 10, 0.88)'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 44px Cinzel, serif'; ctx.textAlign = 'center';
    ctx.fillText('PAUSED', this.canvas.width / 2, 170);

    const btnWidth = 300;
    const btnHeight = 45;
    const btnX = this.canvas.width / 2 - btnWidth / 2;

    ctx.fillStyle = '#161e2b'; ctx.fillRect(btnX, 240, btnWidth, btnHeight);
    ctx.strokeStyle = '#c9a050'; ctx.lineWidth = 2; ctx.strokeRect(btnX, 240, btnWidth, btnHeight);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px Cinzel, serif';
    ctx.fillText('▶️ Resume Game (ESC)', this.canvas.width / 2, 268);

    ctx.fillStyle = '#161e2b'; ctx.fillRect(btnX, 300, btnWidth, btnHeight);
    ctx.strokeStyle = '#3fb950'; ctx.strokeRect(btnX, 300, btnWidth, btnHeight);
    ctx.fillStyle = '#3fb950';
    ctx.fillText('💾 Save Game (Press S)', this.canvas.width / 2, 328);

    ctx.fillStyle = '#161e2b'; ctx.fillRect(btnX, 360, btnWidth, btnHeight);
    ctx.strokeStyle = '#e3b341'; ctx.strokeRect(btnX, 360, btnWidth, btnHeight);
    ctx.fillStyle = '#e3b341';
    ctx.fillText('📖 Game Manual / Controls', this.canvas.width / 2, 388);

    ctx.fillStyle = '#161e2b'; ctx.fillRect(btnX, 420, btnWidth, btnHeight);
    ctx.strokeStyle = '#da3633'; ctx.strokeRect(btnX, 420, btnWidth, btnHeight);
    ctx.fillStyle = '#f85149';
    ctx.fillText('🏠 Main Menu', this.canvas.width / 2, 448);
  }

  private renderShopUI(gsm: GameStateManager): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(15, 20, 30, 0.95)'; ctx.fillRect(100, 80, this.canvas.width - 200, this.canvas.height - 160);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.strokeRect(100, 80, this.canvas.width - 200, this.canvas.height - 160);

    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 28px Cinzel, serif'; ctx.textAlign = 'left';
    ctx.fillText('VILLAGE SHOP MERCHANT', 130, 125);
    ctx.fillStyle = '#ffffff'; ctx.font = '16px Rajdhani, sans-serif';
    ctx.fillText(`Your Gold: 💰 ${gsm.player.stats.gold}`, 130, 160);

    ctx.fillStyle = '#58a6ff'; ctx.font = 'bold 16px Cinzel, serif';
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

    ctx.fillStyle = '#8b949e'; ctx.font = '14px Rajdhani, sans-serif';
    ctx.fillText('Press E or ESC to exit Shop', 130, this.canvas.height - 110);
  }

  private renderDialogueUI(gsm: GameStateManager): void {
    const ctx = this.ctx;
    const npc = gsm.activeNPC;
    if (!npc) return;

    ctx.fillStyle = 'rgba(15, 20, 30, 0.95)'; ctx.fillRect(100, this.canvas.height - 180, this.canvas.width - 200, 140);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.strokeRect(100, this.canvas.height - 180, this.canvas.width - 200, 140);

    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 22px Cinzel, serif'; ctx.textAlign = 'left';
    ctx.fillText(npc.name, 130, this.canvas.height - 145);

    ctx.fillStyle = '#e6edf3'; ctx.font = '16px Rajdhani, sans-serif';
    npc.dialogue.forEach((line, idx) => {
      ctx.fillText(line, 130, this.canvas.height - 115 + idx * 24);
    });

    ctx.fillStyle = '#8b949e'; ctx.font = '13px Rajdhani, sans-serif';
    ctx.fillText('Press E to close Dialogue', this.canvas.width - 260, this.canvas.height - 55);
  }

  private renderGameOverScreen(): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(5, 7, 10, 0.88)'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#f85149'; ctx.font = 'bold 54px Cinzel, serif'; ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', this.canvas.width / 2, 250);

    ctx.fillStyle = '#e6edf3'; ctx.font = '20px Rajdhani, sans-serif';
    ctx.fillText('Your hero was defeated in combat...', this.canvas.width / 2, 320);

    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 24px Cinzel, serif';
    ctx.fillText('[ Press SPACE or R to RESPAWN ]', this.canvas.width / 2, 400);
  }

  private renderVictoryScreen(): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(5, 7, 10, 0.88)'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.fillStyle = '#3fb950'; ctx.font = 'bold 54px Cinzel, serif'; ctx.textAlign = 'center';
    ctx.fillText('VICTORY!', this.canvas.width / 2, 230);

    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 24px Cinzel, serif';
    ctx.fillText('You have defeated the Vortex Guardian and saved the Realm!', this.canvas.width / 2, 300);

    ctx.fillStyle = '#58a6ff'; ctx.font = '20px Rajdhani, sans-serif';
    ctx.fillText('[ Press SPACE or R to play again ]', this.canvas.width / 2, 380);
  }
}
