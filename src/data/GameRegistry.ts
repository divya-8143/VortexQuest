import { ItemData, ItemType, ItemRarity, QuestData, SkillData } from '../types/GameTypes';

export const gameRegistry = {
  items: new Map<string, ItemData>([
    ['hp_potion', {
      id: 'hp_potion',
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
    }],
    ['iron_sword', {
      id: 'iron_sword',
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
    }],
    ['crystal_plate', {
      id: 'crystal_plate',
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
    }],
    ['vortex_blade', {
      id: 'vortex_blade',
      name: 'Vortex Destroyer',
      description: 'Legendary galaxy blade.',
      type: ItemType.WEAPON,
      rarity: ItemRarity.LEGENDARY,
      stackable: false,
      quantity: 1,
      maxStack: 1,
      stats: { attack: 65, critChance: 0.15 },
      value: 500,
      icon: '⚔️'
    }]
  ]),

  quests: new Map<string, QuestData>([
    ['q1_slimes', {
      id: 'q1_slimes',
      title: 'Clear the Village Outskirts',
      description: 'Green Slimes are threatening the village crops. Slay 3 Green Slimes.',
      objectives: [
        { id: 'obj1', description: 'Defeat Green Slimes', targetType: 'KILL', targetId: 'SLIME', requiredAmount: 3, currentAmount: 0, completed: false }
      ],
      rewardXp: 100,
      rewardGold: 75,
      status: 'ACTIVE'
    }],
    ['q2_goblins', {
      id: 'q2_goblins',
      title: 'Dark Forest Scout',
      description: 'Travel into the Dark Forest and defeat 3 Goblin Warriors.',
      objectives: [
        { id: 'obj2', description: 'Defeat Goblin Warriors', targetType: 'KILL', targetId: 'GOBLIN', requiredAmount: 3, currentAmount: 0, completed: false }
      ],
      rewardXp: 200,
      rewardGold: 150,
      status: 'NOT_STARTED'
    }],
    ['q3_boss', {
      id: 'q3_boss',
      title: 'The Missing Crystal & Guardian',
      description: 'Enter the Final Dungeon and defeat the Vortex Guardian boss.',
      objectives: [
        { id: 'obj3', description: 'Defeat Vortex Guardian', targetType: 'BOSS', targetId: 'BOSS', requiredAmount: 1, currentAmount: 0, completed: false }
      ],
      rewardXp: 800,
      rewardGold: 600,
      status: 'NOT_STARTED'
    }]
  ]),

  skills: new Map<string, SkillData>([
    ['1', {
      id: 'fire_slash',
      key: '1',
      name: 'Fire Slash',
      description: 'Flame slash inflicting 200% weapon damage.',
      manaCost: 15,
      cooldown: 3.0,
      currentCooldown: 0,
      damageMultiplier: 2.0,
      range: 90,
      unlocked: true,
      icon: '🔥'
    }],
    ['2', {
      id: 'dash',
      key: '2',
      name: 'Vortex Dash',
      description: 'Instant forward dash.',
      manaCost: 10,
      cooldown: 2.5,
      currentCooldown: 0,
      damageMultiplier: 1.2,
      range: 150,
      unlocked: true,
      icon: '⚡'
    }],
    ['3', {
      id: 'lightning_strike',
      key: '3',
      name: 'Lightning Storm',
      description: 'AOE lightning strike.',
      manaCost: 25,
      cooldown: 6.0,
      currentCooldown: 0,
      damageMultiplier: 2.5,
      range: 200,
      unlocked: true,
      icon: '🌩️'
    }],
    ['4', {
      id: 'heal',
      key: '4',
      name: 'Divine Heal',
      description: 'Restores 40% of max health.',
      manaCost: 20,
      cooldown: 8.0,
      currentCooldown: 0,
      damageMultiplier: 0,
      range: 0,
      unlocked: true,
      icon: '💚'
    }],
    ['q', {
      id: 'ultimate_vortex',
      key: 'q',
      name: 'Vortex Annihilation',
      description: 'Summons a colossal vortex galaxy.',
      manaCost: 40,
      cooldown: 12.0,
      currentCooldown: 0,
      damageMultiplier: 4.0,
      range: 300,
      unlocked: true,
      icon: '🌀'
    }]
  ])
};
