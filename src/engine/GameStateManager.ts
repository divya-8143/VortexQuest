import { GameState, ItemData, ItemRarity, ItemType } from '../types/GameTypes';
import { Player } from '../gameplay/Player';
import { WorldManager, ZoneData, NPCData } from '../world/WorldManager';
import { Enemy, AIState } from '../gameplay/Enemy';
import { QuestLog } from '../gameplay/QuestLog';
import { InputManager } from './InputManager';
import { Camera2D } from './Camera2D';
import { SaveSystem } from '../utils/SaveSystem';

export interface FloatingText {
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  fromEnemy: boolean;
}

export class GameStateManager {
  public currentState: GameState = GameState.MAIN_MENU;
  public player: Player;
  public world: WorldManager;
  public questLog: QuestLog;
  public input: InputManager;
  public camera: Camera2D;
  public floatingTexts: FloatingText[] = [];
  public projectiles: Projectile[] = [];
  public activeNPC: NPCData | null = null;

  constructor() {
    this.player = new Player(400, 400);
    this.world = new WorldManager();
    this.questLog = new QuestLog();
    this.input = new InputManager();
    this.camera = new Camera2D(1024, 576);
  }

  public update(deltaTime: number): void {
    switch (this.currentState) {
      case GameState.MAIN_MENU:
        if (this.input.isKeyJustPressed(' ') || this.input.isKeyJustPressed('enter')) {
          this.startNewGame();
        } else if (this.input.isKeyJustPressed('c') && SaveSystem.hasSave()) {
          this.continueGame();
        }
        break;

      case GameState.PLAYING:
        this.updatePlayingState(deltaTime);
        break;

      case GameState.PAUSED:
        if (this.input.isKeyJustPressed('escape')) {
          this.currentState = GameState.PLAYING;
        }
        break;

      case GameState.INVENTORY:
        if (this.input.isKeyJustPressed('i') || this.input.isKeyJustPressed('escape')) {
          this.currentState = GameState.PLAYING;
        }
        break;

      case GameState.QUESTS:
        if (this.input.isKeyJustPressed('l') || this.input.isKeyJustPressed('escape')) {
          this.currentState = GameState.PLAYING;
        }
        break;

      case GameState.DIALOGUE:
      case GameState.SHOP:
        if (this.input.isKeyJustPressed('e') || this.input.isKeyJustPressed('escape')) {
          this.currentState = GameState.PLAYING;
          this.activeNPC = null;
        }
        break;

      case GameState.GAME_OVER:
      case GameState.VICTORY:
        if (this.input.isKeyJustPressed('r') || this.input.isKeyJustPressed(' ')) {
          this.startNewGame();
        }
        break;
    }
  }

  public startNewGame(): void {
    this.player = new Player(400, 400);
    this.world = new WorldManager();
    this.questLog = new QuestLog();
    this.projectiles = [];
    this.floatingTexts = [];
    this.currentState = GameState.PLAYING;
    console.log('[GameStateManager] New game started!');
  }

  public continueGame(): void {
    const saveData = SaveSystem.loadGame();
    if (saveData) {
      this.player.stats = saveData.player;
      if (saveData.inventory) this.player.inventory = saveData.inventory;
      if (saveData.equipment) this.player.equipment = saveData.equipment;
      if (saveData.skills) this.player.skills = saveData.skills;
      if (saveData.quests) this.questLog.quests = saveData.quests;
      if (saveData.currentZone) this.world.switchZone(saveData.currentZone);

      this.currentState = GameState.PLAYING;
      console.log('[GameStateManager] Continued game from save data!');
    } else {
      this.startNewGame();
    }
  }

  public saveCurrentGame(): void {
    SaveSystem.saveGame({
      version: 1,
      timestamp: Date.now(),
      player: this.player.stats,
      inventory: this.player.inventory,
      equipment: this.player.equipment,
      skills: this.player.skills,
      quests: this.questLog.quests,
      currentZone: this.world.currentZoneId,
      bossDefeated: false
    });
    this.addFloatingText('Game Saved!', this.player.stats.x, this.player.stats.y - 30, '#3fb950');
  }

  private updatePlayingState(deltaTime: number): void {
    // Menu toggles
    if (this.input.isKeyJustPressed('escape')) {
      this.currentState = GameState.PAUSED;
      return;
    }
    if (this.input.isKeyJustPressed('i')) {
      this.currentState = GameState.INVENTORY;
      return;
    }
    if (this.input.isKeyJustPressed('l')) {
      this.currentState = GameState.QUESTS;
      return;
    }

    // Player update & movement
    this.player.update(deltaTime);

    let moveX = 0;
    let moveY = 0;
    if (this.input.isKeyDown('w') || this.input.isKeyDown('arrowup')) moveY -= 1;
    if (this.input.isKeyDown('s') || this.input.isKeyDown('arrowdown')) moveY += 1;
    if (this.input.isKeyDown('a') || this.input.isKeyDown('arrowleft')) moveX -= 1;
    if (this.input.isKeyDown('d') || this.input.isKeyDown('arrowright')) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.sqrt(moveX * moveX + moveY * moveY);
      this.player.stats.x += (moveX / len) * this.player.stats.speed * deltaTime;
      this.player.stats.y += (moveY / len) * this.player.stats.speed * deltaTime;
    }

    // Keep player in zone bounds
    const currentZone = this.world.getCurrentZone();
    this.player.stats.x = Math.max(this.player.stats.radius, Math.min(currentZone.width - this.player.stats.radius, this.player.stats.x));
    this.player.stats.y = Math.max(this.player.stats.radius, Math.min(currentZone.height - this.player.stats.radius, this.player.stats.y));

    // Update Camera
    this.camera.follow(this.player.stats.x, this.player.stats.y, currentZone.width, currentZone.height, deltaTime);

    // Player Attack Input (Spacebar)
    if (this.input.isKeyJustPressed(' ') && this.player.attackCooldown <= 0) {
      this.executePlayerAttack(1.0, 60);
      this.player.attackCooldown = 0.4;
    }

    // Skill Hotkeys (1, 2, 3, 4, Q)
    ['1', '2', '3', '4', 'q'].forEach(key => {
      if (this.input.isKeyJustPressed(key)) {
        this.executePlayerSkill(key);
      }
    });

    // NPC Interaction Check (E Key)
    if (this.input.isKeyJustPressed('e')) {
      this.checkNPCInteraction();
    }

    // Portal Zone Transition Check
    if (currentZone.portal) {
      const p = currentZone.portal;
      const dist = Math.sqrt((this.player.stats.x - p.x) ** 2 + (this.player.stats.y - p.y) ** 2);
      if (dist < 40) {
        this.world.switchZone(p.targetZone);
        this.player.stats.x = p.targetX;
        this.player.stats.y = p.targetY;
        this.addFloatingText(`Entered ${this.world.getCurrentZone().name}`, this.player.stats.x, this.player.stats.y - 40, '#58a6ff');
      }
    }

    // Update Projectiles
    this.updateProjectiles(deltaTime);

    // Update Enemies & Enemy AI
    currentZone.enemies.forEach(enemy => {
      if (enemy.hp > 0) {
        const { attackTriggered, isRanged } = enemy.updateAI(this.player.stats.x, this.player.stats.y, deltaTime);
        if (attackTriggered) {
          if (isRanged) {
            // Spawn Ranged Projectile
            const dx = this.player.stats.x - enemy.x;
            const dy = this.player.stats.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            this.projectiles.push({
              x: enemy.x,
              y: enemy.y,
              vx: (dx / dist) * 260,
              vy: (dy / dist) * 260,
              radius: 6,
              damage: enemy.attack,
              fromEnemy: true
            });
          } else {
            // Melee attack player
            const dmgTaken = this.player.takeDamage(enemy.attack);
            this.addFloatingText(`-${dmgTaken}`, this.player.stats.x, this.player.stats.y - 20, '#f85149');
            this.camera.triggerShake(5, 0.2);

            if (this.player.isDead()) {
              this.currentState = GameState.GAME_OVER;
            }
          }
        }
      }
    });

    // Remove dead enemies & award XP/Loot
    for (let i = currentZone.enemies.length - 1; i >= 0; i--) {
      const enemy = currentZone.enemies[i];
      if (enemy.hp <= 0) {
        // Award XP & Gold
        const leveledUp = this.player.addXp(enemy.xpReward);
        this.player.stats.gold += enemy.goldReward;
        this.addFloatingText(`+${enemy.xpReward} XP  +${enemy.goldReward} Gold`, enemy.x, enemy.y, '#e3b341');

        if (leveledUp) {
          this.addFloatingText(`LEVEL UP! (Lvl ${this.player.stats.level})`, this.player.stats.x, this.player.stats.y - 45, '#3fb950');
        }

        // Drop Loot Item into Inventory
        const itemDrop = enemy.generateLoot();
        if (itemDrop) {
          this.addItemToInventory(itemDrop);
          this.addFloatingText(`Looted: ${itemDrop.name}`, enemy.x, enemy.y - 20, '#bc8cff');
        }

        // Notify Quest Log
        this.questLog.notifyKill(enemy.type);

        // If Boss defeated, trigger victory
        if (enemy.isBoss) {
          this.currentState = GameState.VICTORY;
        }

        currentZone.enemies.splice(i, 1);
      }
    }

    // Update Floating Texts
    this.updateFloatingTexts(deltaTime);
  }

  public executePlayerAttack(damageMultiplier: number = 1.0, range: number = 60): void {
    const currentZone = this.world.getCurrentZone();
    const totalAttack = this.player.getTotalAttack() * damageMultiplier;

    let hitAny = false;
    currentZone.enemies.forEach(enemy => {
      if (enemy.hp > 0) {
        const dx = enemy.x - this.player.stats.x;
        const dy = enemy.y - this.player.stats.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= range + enemy.radius) {
          hitAny = true;
          // Check Critical Hit
          const isCrit = Math.random() < this.player.stats.critChance;
          const rawDmg = isCrit ? totalAttack * this.player.stats.critDamage : totalAttack;
          const finalDmg = enemy.takeDamage(rawDmg);

          const color = isCrit ? '#e3b341' : '#ffffff';
          const text = isCrit ? `CRIT! -${finalDmg}` : `-${finalDmg}`;
          this.addFloatingText(text, enemy.x, enemy.y - 15, color);

          // Knockback
          if (dist > 0) {
            enemy.x += (dx / dist) * 15;
            enemy.y += (dy / dist) * 15;
          }
        }
      }
    });

    if (hitAny) {
      this.camera.triggerShake(4, 0.15);
    }
  }

  public executePlayerSkill(key: string): void {
    const skill = this.player.skills.find(s => s.key === key.toLowerCase() && s.unlocked);
    if (!skill) return;

    if (skill.currentCooldown > 0) {
      this.addFloatingText('Skill on Cooldown!', this.player.stats.x, this.player.stats.y - 30, '#f85149');
      return;
    }

    if (this.player.stats.mana < skill.manaCost) {
      this.addFloatingText('Not Enough Mana!', this.player.stats.x, this.player.stats.y - 30, '#58a6ff');
      return;
    }

    // Deduct Mana & trigger Cooldown
    this.player.stats.mana -= skill.manaCost;
    skill.currentCooldown = skill.cooldown;

    if (skill.id === 'heal') {
      const healAmount = Math.floor(this.player.stats.maxHp * 0.40);
      this.player.stats.hp = Math.min(this.player.stats.maxHp, this.player.stats.hp + healAmount);
      this.addFloatingText(`+${healAmount} HP Healed!`, this.player.stats.x, this.player.stats.y - 30, '#3fb950');
    } else {
      this.executePlayerAttack(skill.damageMultiplier, skill.range);
      this.addFloatingText(`Cast ${skill.name}!`, this.player.stats.x, this.player.stats.y - 30, '#bc8cff');
    }
  }

  private checkNPCInteraction(): void {
    const currentZone = this.world.getCurrentZone();
    currentZone.npcs.forEach(npc => {
      const dist = Math.sqrt((this.player.stats.x - npc.x) ** 2 + (this.player.stats.y - npc.y) ** 2);
      if (dist < 60) {
        this.activeNPC = npc;
        if (npc.role === 'MERCHANT') {
          this.currentState = GameState.SHOP;
        } else {
          this.currentState = GameState.DIALOGUE;
        }
      }
    });
  }

  private updateProjectiles(dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.fromEnemy) {
        const dist = Math.sqrt((p.x - this.player.stats.x) ** 2 + (p.y - this.player.stats.y) ** 2);
        if (dist <= p.radius + this.player.stats.radius) {
          const dmg = this.player.takeDamage(p.damage);
          this.addFloatingText(`-${dmg}`, this.player.stats.x, this.player.stats.y - 20, '#f85149');
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Out of bounds cleanup
      const currentZone = this.world.getCurrentZone();
      if (p.x < 0 || p.x > currentZone.width || p.y < 0 || p.y > currentZone.height) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  public addItemToInventory(item: ItemData): boolean {
    // Check stackable item
    if (item.stackable) {
      const existing = this.player.inventory.find(i => i && i.id.startsWith(item.id.split('_')[0]));
      if (existing) {
        existing.quantity += item.quantity;
        return true;
      }
    }

    // Find empty slot
    const emptyIndex = this.player.inventory.findIndex(i => i === null);
    if (emptyIndex !== -1) {
      this.player.inventory[emptyIndex] = item;
      return true;
    }
    return false;
  }

  public addFloatingText(text: string, x: number, y: number, color: string): void {
    this.floatingTexts.push({ text, x, y, color, alpha: 1.0, life: 1.2 });
  }

  private updateFloatingTexts(dt: number): void {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 25 * dt;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / 1.2);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }
}
