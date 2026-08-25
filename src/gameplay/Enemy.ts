import { EnemyType, ItemData, ItemRarity, ItemType } from '../types/GameTypes';

export enum AIState {
  IDLE = 'IDLE',
  PATROL = 'PATROL',
  CHASE = 'CHASE',
  ATTACK = 'ATTACK',
  RETURN = 'RETURN'
}

export class Enemy {
  public id: number;
  public type: EnemyType;
  public name: string;
  public x: number;
  public y: number;
  public spawnX: number;
  public spawnY: number;
  public radius: number;
  public hp: number;
  public maxHp: number;
  public attack: number;
  public defense: number;
  public speed: number;
  public detectionRange: number;
  public attackRange: number;
  public attackCooldown: number = 0;
  public maxAttackCooldown: number;
  public xpReward: number;
  public goldReward: number;
  public state: AIState = AIState.PATROL;
  public targetX: number = 0;
  public targetY: number = 0;
  public patrolTimer: number = 0;
  public isBoss: boolean = false;
  public bossPhase: number = 1; // 1: 100-70%, 2: 70-40%, 3: 40-15%, 4: Enraged (<15%)

  constructor(id: number, type: EnemyType, x: number, y: number) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.spawnX = x;
    this.spawnY = y;
    this.name = type;

    // Configure stats based on type
    switch (type) {
      case EnemyType.SLIME:
        this.name = 'Green Slime';
        this.radius = 16;
        this.maxHp = 60;
        this.attack = 12;
        this.defense = 4;
        this.speed = 60;
        this.detectionRange = 180;
        this.attackRange = 25;
        this.maxAttackCooldown = 1.2;
        this.xpReward = 25;
        this.goldReward = 15;
        break;

      case EnemyType.GOBLIN:
        this.name = 'Goblin Warrior';
        this.radius = 18;
        this.maxHp = 100;
        this.attack = 22;
        this.defense = 8;
        this.speed = 95;
        this.detectionRange = 220;
        this.attackRange = 30;
        this.maxAttackCooldown = 1.0;
        this.xpReward = 45;
        this.goldReward = 35;
        break;

      case EnemyType.ARCHER:
        this.name = 'Goblin Archer';
        this.radius = 16;
        this.maxHp = 75;
        this.attack = 20;
        this.defense = 5;
        this.speed = 85;
        this.detectionRange = 280;
        this.attackRange = 220; // Ranged
        this.maxAttackCooldown = 1.8;
        this.xpReward = 50;
        this.goldReward = 40;
        break;

      case EnemyType.MAGE:
        this.name = 'Shadow Cultist Mage';
        this.radius = 17;
        this.maxHp = 110;
        this.attack = 35;
        this.defense = 6;
        this.speed = 70;
        this.detectionRange = 300;
        this.attackRange = 240; // Ranged AOE
        this.maxAttackCooldown = 2.2;
        this.xpReward = 75;
        this.goldReward = 60;
        break;

      case EnemyType.TANK:
        this.name = 'Stone Golem';
        this.radius = 24;
        this.maxHp = 250;
        this.attack = 30;
        this.defense = 25;
        this.speed = 45;
        this.detectionRange = 200;
        this.attackRange = 35;
        this.maxAttackCooldown = 1.6;
        this.xpReward = 110;
        this.goldReward = 90;
        break;

      case EnemyType.ELITE:
        this.name = 'Crystal Sentinel (Elite)';
        this.radius = 22;
        this.maxHp = 400;
        this.attack = 48;
        this.defense = 20;
        this.speed = 105;
        this.detectionRange = 320;
        this.attackRange = 40;
        this.maxAttackCooldown = 1.1;
        this.xpReward = 200;
        this.goldReward = 180;
        break;

      case EnemyType.BOSS:
        this.name = 'Vortex Guardian (Boss)';
        this.isBoss = true;
        this.radius = 36;
        this.maxHp = 1200;
        this.attack = 65;
        this.defense = 30;
        this.speed = 80;
        this.detectionRange = 500;
        this.attackRange = 70;
        this.maxAttackCooldown = 0.9;
        this.xpReward = 600;
        this.goldReward = 500;
        break;
    }

    this.hp = this.maxHp;
  }

  public updateAI(playerX: number, playerY: number, deltaTime: number): { attackTriggered: boolean; isRanged: boolean } {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distToPlayer = Math.sqrt(dx * dx + dy * dy);

    // Update Boss Phase transitions
    if (this.isBoss) {
      const hpRatio = this.hp / this.maxHp;
      if (hpRatio <= 0.15) {
        this.bossPhase = 4; // Enraged
        this.speed = 130;
        this.attack = 90;
      } else if (hpRatio <= 0.40) {
        this.bossPhase = 3;
        this.speed = 105;
      } else if (hpRatio <= 0.70) {
        this.bossPhase = 2;
      }
    }

    let attackTriggered = false;

    // AI State Machine Logic
    switch (this.state) {
      case AIState.PATROL:
        this.patrolTimer -= deltaTime;
        if (this.patrolTimer <= 0) {
          this.targetX = this.spawnX + (Math.random() - 0.5) * 160;
          this.targetY = this.spawnY + (Math.random() - 0.5) * 160;
          this.patrolTimer = 3.0 + Math.random() * 2;
        }
        this.moveTowards(this.targetX, this.targetY, this.speed * 0.4, deltaTime);

        if (distToPlayer <= this.detectionRange) {
          this.state = AIState.CHASE;
        }
        break;

      case AIState.CHASE:
        if (distToPlayer > this.detectionRange * 1.4) {
          this.state = AIState.RETURN;
        } else if (distToPlayer <= this.attackRange) {
          this.state = AIState.ATTACK;
        } else {
          // If archer/mage and too close, keep distance
          if ((this.type === EnemyType.ARCHER || this.type === EnemyType.MAGE) && distToPlayer < 100) {
            this.moveTowards(this.x - dx, this.y - dy, this.speed, deltaTime);
          } else {
            this.moveTowards(playerX, playerY, this.speed, deltaTime);
          }
        }
        break;

      case AIState.ATTACK:
        if (distToPlayer > this.attackRange * 1.2) {
          this.state = AIState.CHASE;
        } else if (this.attackCooldown <= 0) {
          this.attackCooldown = this.maxAttackCooldown;
          attackTriggered = true;
        }
        break;

      case AIState.RETURN:
        this.moveTowards(this.spawnX, this.spawnY, this.speed * 0.6, deltaTime);
        const distToSpawn = Math.sqrt((this.spawnX - this.x) ** 2 + (this.spawnY - this.y) ** 2);
        if (distToSpawn < 10) {
          this.state = AIState.PATROL;
        }
        break;
    }

    const isRanged = (this.type === EnemyType.ARCHER || this.type === EnemyType.MAGE);
    return { attackTriggered, isRanged };
  }

  private moveTowards(tx: number, ty: number, speed: number, dt: number): void {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 2) {
      this.x += (dx / dist) * speed * dt;
      this.y += (dy / dist) * speed * dt;
    }
  }

  public takeDamage(damage: number): number {
    const mitigated = Math.max(1, Math.floor(damage * (100 / (100 + this.defense))));
    this.hp = Math.max(0, this.hp - mitigated);
    return mitigated;
  }

  public generateLoot(): ItemData | null {
    const roll = Math.random();
    if (roll > 0.45) return null; // 45% drop rate

    if (this.isBoss) {
      return {
        id: 'vortex_blade_' + Date.now(),
        name: 'Vortex Destroyer (Legendary Blade)',
        description: 'Legendary sword forged in the heart of the galaxy.',
        type: ItemType.WEAPON,
        rarity: ItemRarity.LEGENDARY,
        stackable: false,
        quantity: 1,
        maxStack: 1,
        stats: { attack: 65, critChance: 0.15, speed: 20 },
        value: 500,
        icon: '🗡️'
      };
    }

    if (this.type === EnemyType.ELITE) {
      return {
        id: 'crystal_plate_' + Date.now(),
        name: 'Crystal Guardian Plate',
        description: 'Epic armor providing massive defense.',
        type: ItemType.ARMOR,
        rarity: ItemRarity.EPIC,
        stackable: false,
        quantity: 1,
        maxStack: 1,
        stats: { defense: 35, hp: 100 },
        value: 250,
        icon: '🛡️'
      };
    }

    // Standard enemy drops
    if (roll < 0.20) {
      return {
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
      };
    } else {
      return {
        id: 'iron_sword_' + Date.now(),
        name: 'Iron Longsword',
        description: 'Sturdy iron sword.',
        type: ItemType.WEAPON,
        rarity: ItemRarity.UNCOMMON,
        stackable: false,
        quantity: 1,
        maxStack: 1,
        stats: { attack: 18 },
        value: 60,
        icon: '⚔️'
      };
    }
  }
}
