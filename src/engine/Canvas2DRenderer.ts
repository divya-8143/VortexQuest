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

    // 1. Zone Ground Background
    ctx.fillStyle = currentZone.color;
    ctx.fillRect(0, 0, currentZone.width, currentZone.height);

    // Ground Grid Texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const tileSize = 64;
    for (let x = 0; x < currentZone.width; x += tileSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, currentZone.height); ctx.stroke();
    }
    for (let y = 0; y < currentZone.height; y += tileSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(currentZone.width, y); ctx.stroke();
    }

    // 2. Render High-Detail Scenery & World Objects
    currentZone.decorations.forEach(deco => {
      switch (deco.type) {
        case 'PATH':
          // Cobblestone Road
          ctx.fillStyle = deco.color || '#273342';
          ctx.fillRect(deco.x, deco.y, deco.w || 600, deco.h || 50);
          ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
          for (let px = deco.x; px < deco.x + (deco.w || 600); px += 35) {
            ctx.strokeRect(px, deco.y, 35, deco.h || 50);
          }
          break;

        case 'POND':
          // Water Pond with Animated Ripples
          const r = deco.w || 80;
          const ripple = Math.sin(this.animTimer * 2) * 4;
          ctx.fillStyle = '#1b4965';
          ctx.beginPath(); ctx.arc(deco.x, deco.y, r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(deco.x, deco.y, r - 10 + ripple, 0, Math.PI * 2); ctx.stroke();
          break;

        case 'HOUSE':
          // High-Detail RPG Building
          const hw = deco.w || 180;
          const hh = deco.h || 140;

          // Ground Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.fillRect(deco.x - 5, deco.y + hh - 10, hw + 10, 20);

          // Stone Foundation
          ctx.fillStyle = '#2d3748'; ctx.fillRect(deco.x, deco.y + hh - 25, hw, 25);
          ctx.strokeStyle = '#1a202c'; ctx.strokeRect(deco.x, deco.y + hh - 25, hw, 25);

          // Timber-frame Wooden Walls
          ctx.fillStyle = deco.color || '#3d2516'; ctx.fillRect(deco.x, deco.y, hw, hh - 25);
          ctx.strokeStyle = '#1d1007'; ctx.lineWidth = 3; ctx.strokeRect(deco.x, deco.y, hw, hh - 25);

          // Wooden Beams / Trim
          ctx.fillStyle = '#28170c';
          ctx.fillRect(deco.x + 10, deco.y, 10, hh - 25);
          ctx.fillRect(deco.x + hw - 20, deco.y, 10, hh - 25);

          // Roof with Gold Filigree Ridge
          ctx.fillStyle = deco.label === 'Elder Hall' ? '#8b261d' : '#1c3a5e';
          ctx.beginPath();
          ctx.moveTo(deco.x - 14, deco.y);
          ctx.lineTo(deco.x + hw / 2, deco.y - 50);
          ctx.lineTo(deco.x + hw + 14, deco.y);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.stroke();

          // Chimney Smoke Particles
          const smokeX = deco.x + hw - 30;
          const smokeY = deco.y - 45 - Math.sin(this.animTimer * 3) * 10;
          ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
          ctx.beginPath(); ctx.arc(smokeX, smokeY, 8 + Math.sin(this.animTimer * 2) * 3, 0, Math.PI * 2); ctx.fill();

          // Arched Wooden Door
          ctx.fillStyle = '#4a2e1b';
          ctx.beginPath(); ctx.arc(deco.x + hw / 2, deco.y + hh - 35, 16, Math.PI, 0); ctx.fill();
          ctx.fillRect(deco.x + hw / 2 - 16, deco.y + hh - 35, 32, 25);
          ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5; ctx.strokeRect(deco.x + hw / 2 - 16, deco.y + hh - 35, 32, 25);

          // Glowing Windows
          const winGlow1 = ctx.createRadialGradient(deco.x + 30, deco.y + 35, 2, deco.x + 30, deco.y + 35, 20);
          winGlow1.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
          winGlow1.addColorStop(1, 'rgba(255, 215, 0, 0)');
          ctx.fillStyle = winGlow1; ctx.beginPath(); ctx.arc(deco.x + 30, deco.y + 35, 20, 0, Math.PI * 2); ctx.fill();

          ctx.fillStyle = '#ffd700'; ctx.fillRect(deco.x + 22, deco.y + 25, 16, 20);
          ctx.fillRect(deco.x + hw - 38, deco.y + 25, 16, 20);
          ctx.strokeStyle = '#1d1007'; ctx.lineWidth = 1;
          ctx.strokeRect(deco.x + 22, deco.y + 25, 16, 20); ctx.strokeRect(deco.x + hw - 38, deco.y + 25, 16, 20);

          // Hanging Signboard
          if (deco.label) {
            ctx.fillStyle = 'rgba(15, 20, 30, 0.95)';
            ctx.fillRect(deco.x + hw / 2 - 50, deco.y + 60, 100, 24);
            ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1; ctx.strokeRect(deco.x + hw / 2 - 50, deco.y + 60, 100, 24);
            ctx.fillStyle = '#ffd700'; ctx.font = 'bold 12px Cinzel, serif'; ctx.textAlign = 'center';
            ctx.fillText(deco.label, deco.x + hw / 2, deco.y + 76);
          }
          break;

        case 'TREE':
          // Tree Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.4)';
          ctx.beginPath(); ctx.ellipse(deco.x, deco.y + 10, deco.w || 50, 15, 0, 0, Math.PI * 2); ctx.fill();
          // Trunk
          ctx.fillStyle = '#4a2e1b'; ctx.fillRect(deco.x - 10, deco.y - 20, 20, 35);
          // Leafy Crown Layers
          ctx.fillStyle = deco.color || '#194d22';
          ctx.beginPath(); ctx.arc(deco.x, deco.y - 40, (deco.w || 50), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#236b2f';
          ctx.beginPath(); ctx.arc(deco.x - 10, deco.y - 50, (deco.w || 50) * 0.7, 0, Math.PI * 2); ctx.fill();
          break;

        case 'LANTERN':
          ctx.fillStyle = '#30363d'; ctx.fillRect(deco.x - 4, deco.y - 45, 8, 45);
          const radGlow = ctx.createRadialGradient(deco.x, deco.y - 50, 5, deco.x, deco.y - 50, 65);
          radGlow.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
          radGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
          ctx.fillStyle = radGlow;
          ctx.beginPath(); ctx.arc(deco.x, deco.y - 50, 65, 0, Math.PI * 2); ctx.fill();
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

    // 3. Render Zone Portal with Swirling Rings
    if (currentZone.portal) {
      const p = currentZone.portal;
      const pulse = Math.sin(this.animTimer * 4) * 5;
      const portalGlow = ctx.createRadialGradient(p.x, p.y, 5, p.x, p.y, 50 + pulse);
      portalGlow.addColorStop(0, 'rgba(88, 166, 255, 0.9)');
      portalGlow.addColorStop(0.5, 'rgba(163, 113, 247, 0.5)');
      portalGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = portalGlow;
      ctx.beginPath(); ctx.arc(p.x, p.y, 50 + pulse, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, 35 + pulse, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 13px Cinzel, serif'; ctx.textAlign = 'center';
      ctx.fillText(`PORTAL (${p.targetZone})`, p.x, p.y - 55);
    }

    // 4. Render Interactive Detailed NPC Sprites
    currentZone.npcs.forEach(npc => {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.ellipse(npc.x, npc.y + 14, 20, 8, 0, 0, Math.PI * 2); ctx.fill();

      if (npc.role === 'ELDER') {
        // Elder Wizard Robe & Wizard Hat
        ctx.fillStyle = '#1f6beb'; ctx.beginPath(); ctx.arc(npc.x, npc.y, 18, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.stroke();

        // Wizard Hat
        ctx.fillStyle = '#161e2b';
        ctx.beginPath();
        ctx.moveTo(npc.x - 14, npc.y - 10);
        ctx.lineTo(npc.x, npc.y - 32);
        ctx.lineTo(npc.x + 14, npc.y - 10);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5; ctx.stroke();

        // Staff with Arcane Orb
        ctx.fillStyle = '#4a2e1b'; ctx.fillRect(npc.x + 16, npc.y - 25, 4, 38);
        ctx.fillStyle = '#a371f7'; ctx.shadowColor = '#a371f7'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(npc.x + 18, npc.y - 28, 7, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Merchant Hooded Crimson Tunic
        ctx.fillStyle = '#da3633'; ctx.beginPath(); ctx.arc(npc.x, npc.y, 18, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.stroke();

        // Merchant Apron & Gold Bag
        ctx.fillStyle = '#e3b341'; ctx.fillRect(npc.x - 8, npc.y - 4, 16, 16);
        ctx.beginPath(); ctx.arc(npc.x - 14, npc.y + 4, 6, 0, Math.PI * 2); ctx.fill();
      }

      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 14px Cinzel, serif'; ctx.textAlign = 'center';
      ctx.fillText(npc.name, npc.x, npc.y - 34);
      ctx.fillStyle = '#e6edf3'; ctx.font = '12px Rajdhani, sans-serif';
      ctx.fillText('[Press E to Talk]', npc.x, npc.y + 34);
    });

    // 5. Render Detailed Enemy & Boss Sprites
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

    // 6. Projectiles
    gsm.projectiles.forEach(p => {
      ctx.fillStyle = p.fromEnemy ? '#f85149' : '#58a6ff';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    });

    // 7. Hero Knight Sprite
    const player = gsm.player;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.ellipse(player.stats.x, player.stats.y + 14, 20, 8, 0, 0, Math.PI * 2); ctx.fill();

    // Metallic Blue Plate Body
    ctx.fillStyle = '#58a6ff';
    ctx.beginPath(); ctx.arc(player.stats.x, player.stats.y, player.stats.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2.5; ctx.stroke();

    // Helmet Gold Visor Notch
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(player.stats.x - 6, player.stats.y - 4, 12, 5);

    // Glowing Sword Blade
    ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#58a6ff'; ctx.shadowBlur = 10;
    ctx.fillRect(player.stats.x + 14, player.stats.y - 14, 4, 22);
    ctx.shadowBlur = 0;

    if (gsm.input.isKeyDown(' ')) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(player.stats.x, player.stats.y, 60, 0, Math.PI * 2); ctx.stroke();
    }

    // Floating Numbers
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

    // Top-Left Player Stats HUD Card
    ctx.fillStyle = 'rgba(15, 20, 30, 0.92)';
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

    // Gold & Zone Info (Top-Right Dynamic Positioning)
    const goldCardX = this.canvas.width - 280;
    ctx.fillStyle = 'rgba(15, 20, 30, 0.92)';
    ctx.fillRect(goldCardX, 15, 200, 70);
    ctx.strokeStyle = '#c9a050'; ctx.lineWidth = 1.5; ctx.strokeRect(goldCardX, 15, 200, 70);

    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 16px Cinzel, serif'; ctx.textAlign = 'right';
    ctx.fillText(`💰 Gold: ${player.stats.gold}`, goldCardX + 185, 38);
    ctx.fillStyle = '#bc8cff'; ctx.font = '14px Rajdhani, sans-serif';
    ctx.fillText(`📍 ${currentZone.name}`, goldCardX + 185, 62);

    // INTERACTIVE PAUSE BUTTON ⏸️
    const pauseBtnX = this.canvas.width - 65;
    ctx.fillStyle = 'rgba(15, 20, 30, 0.92)';
    ctx.fillRect(pauseBtnX, 15, 50, 40);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5; ctx.strokeRect(pauseBtnX, 15, 50, 40);

    ctx.fillStyle = '#ffffff'; ctx.font = '22px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('⏸️', pauseBtnX + 25, 43);

    // MINIMAP RADAR OVERLAY (Bottom-Right)
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
