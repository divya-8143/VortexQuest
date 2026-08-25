export enum GameState {
  BOOT = 'BOOT',
  MAIN_MENU = 'MAIN_MENU',
  MANUAL = 'MANUAL',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  INVENTORY = 'INVENTORY',
  SKILLS = 'SKILLS',
  QUESTS = 'QUESTS',
  SHOP = 'SHOP',
  DIALOGUE = 'DIALOGUE',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum EnemyType {
  SLIME = 'SLIME',
  GOBLIN = 'GOBLIN',
  ARCHER = 'ARCHER',
  MAGE = 'MAGE',
  TANK = 'TANK',
  ELITE = 'ELITE',
  BOSS = 'BOSS'
}

export enum ItemRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  ACCESSORY = 'ACCESSORY',
  POTION = 'POTION',
  MATERIAL = 'MATERIAL',
  QUEST = 'QUEST'
}

export interface ItemData {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  stackable: boolean;
  quantity: number;
  maxStack: number;
  stats?: {
    attack?: number;
    defense?: number;
    speed?: number;
    hp?: number;
    mana?: number;
    critChance?: number;
  };
  value: number; // Gold value
  icon: string;
}

export interface PlayerStats {
  x: number;
  y: number;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  level: number;
  xp: number;
  maxXp: number;
  baseAttack: number;
  baseDefense: number;
  critChance: number;
  critDamage: number;
  gold: number;
  skillPoints: number;
}

export interface SkillData {
  id: string;
  key: string; // '1', '2', '3', '4', 'Q'
  name: string;
  description: string;
  manaCost: number;
  cooldown: number; // seconds
  currentCooldown: number;
  damageMultiplier: number;
  range: number;
  unlocked: boolean;
  icon: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  targetType: string; // 'KILL', 'COLLECT', 'EXPLORE', 'BOSS'
  targetId: string;
  requiredAmount: number;
  currentAmount: number;
  completed: boolean;
}

export interface QuestData {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  rewardXp: number;
  rewardGold: number;
  rewardItem?: ItemData;
  status: 'NOT_STARTED' | 'ACTIVE' | 'COMPLETED' | 'CLAIMED';
}

export interface SaveData {
  version: number;
  timestamp: number;
  player: PlayerStats;
  inventory: (ItemData | null)[];
  equipment: {
    weapon: ItemData | null;
    armor: ItemData | null;
    accessory: ItemData | null;
  };
  skills: SkillData[];
  quests: QuestData[];
  currentZone: string;
  bossDefeated: boolean;
}
