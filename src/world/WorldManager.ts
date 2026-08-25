import { Enemy, AIState } from '../gameplay/Enemy';
import { EnemyType } from '../types/GameTypes';

export interface NPCData {
  id: string;
  name: string;
  role: 'ELDER' | 'MERCHANT' | 'SCOUT';
  x: number;
  y: number;
  dialogue: string[];
}

export interface WorldObject {
  type: 'HOUSE' | 'TREE' | 'LANTERN' | 'FENCE' | 'CRYSTAL' | 'PATH' | 'ROCK';
  x: number;
  y: number;
  w?: number;
  h?: number;
  color?: string;
  label?: string;
}

export interface ZoneData {
  id: string;
  name: string;
  width: number;
  height: number;
  color: string;
  enemies: Enemy[];
  npcs: NPCData[];
  decorations: WorldObject[];
  portal: { x: number; y: number; targetZone: string; targetX: number; targetY: number } | null;
}

export class WorldManager {
  public zones: Map<string, ZoneData> = new Map();
  public currentZoneId: string = 'village';

  constructor() {
    this.initZones();
  }

  private initZones(): void {
    // 1. Village
    this.zones.set('village', {
      id: 'village',
      name: 'Peaceful Village',
      width: 1200,
      height: 900,
      color: '#16222f',
      enemies: [],
      npcs: [
        {
          id: 'elder',
          name: 'Village Elder',
          role: 'ELDER',
          x: 400,
          y: 420,
          dialogue: [
            "Greetings, young Hero!",
            "Green Slimes and Goblins have invaded our outer forests.",
            "Please clear the Slimes in Green Forest and defeat the Boss in the Final Dungeon!"
          ]
        },
        {
          id: 'merchant',
          name: 'Shop Merchant',
          role: 'MERCHANT',
          x: 750,
          y: 420,
          dialogue: [
            "Welcome to my Shop!",
            "I sell Health Potions, Iron Longswords, and Crystal Shield Armor."
          ]
        }
      ],
      decorations: [
        // Cobblestone Main Pathway
        { type: 'PATH', x: 200, y: 410, w: 800, h: 60, color: '#2a3644' },
        // Village Elder's Guild Hall
        { type: 'HOUSE', x: 330, y: 240, w: 140, h: 120, color: '#3d271d', label: 'Elder Hall' },
        // Shop Merchant's Market Building
        { type: 'HOUSE', x: 680, y: 240, w: 140, h: 120, color: '#243447', label: 'Merchant Shop' },
        // Village Fences
        { type: 'FENCE', x: 150, y: 200, w: 900, h: 10, color: '#4a3525' },
        { type: 'FENCE', x: 150, y: 650, w: 900, h: 10, color: '#4a3525' },
        // Decorative Village Trees
        { type: 'TREE', x: 120, y: 150, w: 50, color: '#1e4620' },
        { type: 'TREE', x: 100, y: 350, w: 55, color: '#1e4620' },
        { type: 'TREE', x: 120, y: 550, w: 50, color: '#1e4620' },
        { type: 'TREE', x: 950, y: 150, w: 50, color: '#1e4620' },
        { type: 'TREE', x: 1020, y: 350, w: 55, color: '#1e4620' },
        { type: 'TREE', x: 980, y: 550, w: 50, color: '#1e4620' },
        // Glowing Lantern Posts
        { type: 'LANTERN', x: 260, y: 390, color: '#e3b341' },
        { type: 'LANTERN', x: 550, y: 390, color: '#e3b341' },
        { type: 'LANTERN', x: 880, y: 390, color: '#e3b341' }
      ],
      portal: { x: 1100, y: 440, targetZone: 'green_forest', targetX: 100, targetY: 440 }
    });

    // 2. Green Forest
    const greenEnemies: Enemy[] = [
      new Enemy(1, EnemyType.SLIME, 350, 300),
      new Enemy(2, EnemyType.SLIME, 550, 650),
      new Enemy(3, EnemyType.SLIME, 850, 250),
      new Enemy(4, EnemyType.GOBLIN, 950, 550)
    ];
    this.zones.set('green_forest', {
      id: 'green_forest',
      name: 'Green Forest',
      width: 1400,
      height: 1000,
      color: '#0d2216',
      enemies: greenEnemies,
      npcs: [],
      decorations: [
        { type: 'TREE', x: 200, y: 180, w: 60, color: '#143818' },
        { type: 'TREE', x: 450, y: 150, w: 65, color: '#143818' },
        { type: 'TREE', x: 700, y: 190, w: 70, color: '#143818' },
        { type: 'TREE', x: 1100, y: 160, w: 65, color: '#143818' },
        { type: 'TREE', x: 300, y: 800, w: 65, color: '#143818' },
        { type: 'TREE', x: 650, y: 820, w: 70, color: '#143818' },
        { type: 'TREE', x: 1050, y: 800, w: 60, color: '#143818' },
        { type: 'ROCK', x: 500, y: 450, w: 35, color: '#38424b' },
        { type: 'ROCK', x: 800, y: 550, w: 40, color: '#38424b' }
      ],
      portal: { x: 1300, y: 500, targetZone: 'dark_forest', targetX: 100, targetY: 500 }
    });

    // 3. Dark Forest
    const darkEnemies: Enemy[] = [
      new Enemy(5, EnemyType.GOBLIN, 300, 400),
      new Enemy(6, EnemyType.GOBLIN, 700, 300),
      new Enemy(7, EnemyType.ARCHER, 600, 700),
      new Enemy(8, EnemyType.ARCHER, 1000, 450)
    ];
    this.zones.set('dark_forest', {
      id: 'dark_forest',
      name: 'Dark Forest',
      width: 1500,
      height: 1100,
      color: '#10121d',
      enemies: darkEnemies,
      npcs: [],
      decorations: [
        { type: 'TREE', x: 250, y: 200, w: 65, color: '#181b2e' },
        { type: 'TREE', x: 600, y: 160, w: 70, color: '#181b2e' },
        { type: 'TREE', x: 950, y: 220, w: 65, color: '#181b2e' },
        { type: 'TREE', x: 1300, y: 180, w: 70, color: '#181b2e' },
        { type: 'ROCK', x: 450, y: 600, w: 45, color: '#272b3c' },
        { type: 'ROCK', x: 850, y: 400, w: 50, color: '#272b3c' }
      ],
      portal: { x: 1400, y: 550, targetZone: 'crystal_cave', targetX: 100, targetY: 550 }
    });

    // 4. Crystal Cave
    const caveEnemies: Enemy[] = [
      new Enemy(9, EnemyType.MAGE, 400, 350),
      new Enemy(10, EnemyType.TANK, 800, 500),
      new Enemy(11, EnemyType.TANK, 1100, 600)
    ];
    this.zones.set('crystal_cave', {
      id: 'crystal_cave',
      name: 'Crystal Cave',
      width: 1600,
      height: 1200,
      color: '#171526',
      enemies: caveEnemies,
      npcs: [],
      decorations: [
        { type: 'CRYSTAL', x: 300, y: 200, w: 30, color: '#a371f7' },
        { type: 'CRYSTAL', x: 650, y: 180, w: 40, color: '#58a6ff' },
        { type: 'CRYSTAL', x: 1000, y: 250, w: 35, color: '#a371f7' },
        { type: 'CRYSTAL', x: 1350, y: 200, w: 30, color: '#58a6ff' },
        { type: 'CRYSTAL', x: 450, y: 850, w: 35, color: '#58a6ff' },
        { type: 'CRYSTAL', x: 900, y: 900, w: 40, color: '#a371f7' },
        { type: 'ROCK', x: 600, y: 450, w: 55, color: '#2e2a44' }
      ],
      portal: { x: 1500, y: 600, targetZone: 'final_dungeon', targetX: 200, targetY: 450 }
    });

    // 5. Final Dungeon (Boss Arena)
    const bossEnemies: Enemy[] = [
      new Enemy(99, EnemyType.BOSS, 700, 450)
    ];
    this.zones.set('final_dungeon', {
      id: 'final_dungeon',
      name: 'Final Dungeon (Vortex Lair)',
      width: 1400,
      height: 900,
      color: '#220b10',
      enemies: bossEnemies,
      npcs: [],
      decorations: [
        { type: 'LANTERN', x: 300, y: 200, color: '#f85149' },
        { type: 'LANTERN', x: 1100, y: 200, color: '#f85149' },
        { type: 'LANTERN', x: 300, y: 700, color: '#f85149' },
        { type: 'LANTERN', x: 1100, y: 700, color: '#f85149' },
        { type: 'ROCK', x: 400, y: 450, w: 60, color: '#3d161a' },
        { type: 'ROCK', x: 1000, y: 450, w: 60, color: '#3d161a' }
      ],
      portal: null
    });
  }

  public getCurrentZone(): ZoneData {
    return this.zones.get(this.currentZoneId) || this.zones.get('village')!;
  }

  public switchZone(zoneId: string): ZoneData {
    if (this.zones.has(zoneId)) {
      this.currentZoneId = zoneId;
    }
    return this.getCurrentZone();
  }
}
