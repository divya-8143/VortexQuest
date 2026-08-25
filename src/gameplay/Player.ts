import { PlayerStats, ItemData, SkillData } from '../types/GameTypes';

export class Player {
  public stats: PlayerStats;
  public inventory: (ItemData | null)[] = new Array(20).fill(null);
  public equipment: {
    weapon: ItemData | null;
    armor: ItemData | null;
    accessory: ItemData | null;
  } = { weapon: null, armor: null, accessory: null };
  public skills: SkillData[] = [];
  public isAttacking: boolean = false;
  public attackCooldown: number = 0;
  public attackAngle: number = 0;

  constructor(x: number = 400, y: number = 400) {
    this.stats = {
      x,
      y,
      radius: 16,
      speed: 180,
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      level: 1,
      xp: 0,
      maxXp: 100,
      baseAttack: 25,
      baseDefense: 10,
      critChance: 0.15,
      critDamage: 2.0,
      gold: 150,
      skillPoints: 0
    };

    this.initSkills();
  }

  private initSkills(): void {
    this.skills = [
      {
        id: 'fire_slash',
        key: '1',
        name: 'Fire Slash',
        description: 'Flame slash inflicting 200% weapon damage in front of hero.',
        manaCost: 15,
        cooldown: 3.0,
        currentCooldown: 0,
        damageMultiplier: 2.0,
        range: 90,
        unlocked: true,
        icon: '🔥'
      },
      {
        id: 'dash',
        key: '2',
        name: 'Vortex Dash',
        description: 'Instant forward dash granting invulnerability frame.',
        manaCost: 10,
        cooldown: 2.5,
        currentCooldown: 0,
        damageMultiplier: 1.2,
        range: 150,
        unlocked: true,
        icon: '⚡'
      },
      {
        id: 'lightning_strike',
        key: '3',
        name: 'Lightning Storm',
        description: 'Call lightning strikes hitting all nearby enemies.',
        manaCost: 25,
        cooldown: 6.0,
        currentCooldown: 0,
        damageMultiplier: 2.5,
        range: 200,
        unlocked: true,
        icon: '🌩️'
      },
      {
        id: 'heal',
        key: '4',
        name: 'Divine Heal',
        description: 'Restores 40% of max health instantly.',
        manaCost: 20,
        cooldown: 8.0,
        currentCooldown: 0,
        damageMultiplier: 0,
        range: 0,
        unlocked: true,
        icon: '💚'
      },
      {
        id: 'ultimate_vortex',
        key: 'q',
        name: 'Vortex Annihilation',
        description: 'Summons a colossal vortex galaxy obliterating everything.',
        manaCost: 40,
        cooldown: 12.0,
        currentCooldown: 0,
        damageMultiplier: 4.0,
        range: 300,
        unlocked: true,
        icon: '🌀'
      }
    ];
  }

  public update(deltaTime: number): void {
    // Regenerate Mana slowly
    if (this.stats.mana < this.stats.maxMana) {
      this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + 4.0 * deltaTime);
    }

    // Cooldown management
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }

    this.skills.forEach(s => {
      if (s.currentCooldown > 0) {
        s.currentCooldown = Math.max(0, s.currentCooldown - deltaTime);
      }
    });
  }

  public addXp(amount: number): boolean {
    this.stats.xp += amount;
    let leveledUp = false;

    while (this.stats.xp >= this.stats.maxXp) {
      this.stats.xp -= this.stats.maxXp;
      this.stats.level++;
      this.stats.maxXp = Math.floor(this.stats.maxXp * 1.4);
      this.stats.maxHp += 25;
      this.stats.hp = this.stats.maxHp;
      this.stats.maxMana += 15;
      this.stats.mana = this.stats.maxMana;
      this.stats.baseAttack += 5;
      this.stats.baseDefense += 3;
      this.stats.skillPoints += 1;
      leveledUp = true;
    }

    return leveledUp;
  }

  public getTotalAttack(): number {
    let bonus = 0;
    if (this.equipment.weapon?.stats?.attack) bonus += this.equipment.weapon.stats.attack;
    if (this.equipment.accessory?.stats?.attack) bonus += this.equipment.accessory.stats.attack;
    return this.stats.baseAttack + bonus;
  }

  public getTotalDefense(): number {
    let bonus = 0;
    if (this.equipment.armor?.stats?.defense) bonus += this.equipment.armor.stats.defense;
    if (this.equipment.accessory?.stats?.defense) bonus += this.equipment.accessory.stats.defense;
    return this.stats.baseDefense + bonus;
  }

  public takeDamage(damage: number): number {
    const defense = this.getTotalDefense();
    const mitigated = Math.max(1, Math.floor(damage * (100 / (100 + defense))));
    this.stats.hp = Math.max(0, this.stats.hp - mitigated);
    return mitigated;
  }

  public isDead(): boolean {
    return this.stats.hp <= 0;
  }

  public respawn(spawnX: number, spawnY: number): void {
    this.stats.x = spawnX;
    this.stats.y = spawnY;
    this.stats.hp = this.stats.maxHp;
    this.stats.mana = this.stats.maxMana;
  }
}
