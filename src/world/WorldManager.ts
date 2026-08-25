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
  type: 'HOUSE' | 'TREE' | 'LANTERN' | 'FENCE' | 'CRYSTAL' | 'PATH' | 'ROCK' | 'POND';
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
    // 1. Peaceful Village
    this.zones.set('village', {
      id: 'village',
      name: 'Peaceful Village',
      width: 1400,
      height: 1000,
      color: '#121a24',
      enemies: [],
      npcs: [
        {
          id: 'elder',
          name: 'Elder Arcane',
          role: 'ELDER',
          x: 420,
          y: 450,
          dialogue: [
            "Greetings, Hero of Vortex!",
            "Dark forces have corrupted the outer forests and cave depths.",
            "Clear the Slimes in Green Forest and defeat the Vortex Guardian in the Final Dungeon!"
          ]
        },
        {
          id: 'merchant',
          name: 'Merchant Roderick',
          role: 'MERCHANT',
          x: 820,
          y: 450,
          dialogue: [
            "Welcome to Roderick's Emporium!",
            "I sell Health Potions, Iron Swords, and Shield Armor for Gold."
          ]
        }
      ],
      decorations: [
        // Main Cobblestone Road
        { type: 'PATH', x: 150, y: 440, w: 1050, h: 70, color: '#273342' },
        // Village Guild Hall & Market Buildings
        { type: 'HOUSE', x: 330, y: 250, w: 180, h: 140, color: '#3d2516', label: 'Elder Hall' },
        { type: 'HOUSE', x: 730, y: 250, w: 180, h: 140, color: '#1a2e40', label: 'Merchant Emporium' },
        // Village Pond
        { type: 'POND', x: 580, y: 650, w: 90, color: '#1b4965' },
        // Fences
        { type: 'FENCE', x: 100, y: 200, w: 1150, h: 12, color: '#4a3321' },
        { type: 'FENCE', x: 100, y: 780, w: 1150, h: 12, color: '#4a3321' },
        // Village Trees
        { type: 'TREE', x: 120, y: 150, w: 55, color: '#194d22' },
        { type: 'TREE', x: 100, y: 350, w: 60, color: '#194d22' },
        { type: 'TREE', x: 120, y: 600, w: 55, color: '#194d22' },
        { type: 'TREE', x: 1180, y: 150, w: 55, color: '#194d22' },
        { type: 'TREE', x: 1250, y: 350, w: 60, color: '#194d22' },
        { type: 'TREE', x: 1200, y: 600, w: 55, color: '#194d22' },
        // Glowing Lanterns
        { type: 'LANTERN', x: 260, y: 420, color: '#ffd700' },
        { type: 'LANTERN', x: 600, y: 420, color: '#ffd700' },
        { type: 'LANTERN', x: 960, y: 420, color: '#ffd700' }
      ],
      portal: { x: 1280, y: 475, targetZone: 'green_forest', targetX: 120, targetY: 475 }
    });

    // 2. Green Forest
    const greenEnemies: Enemy[] = [
      new Enemy(1, EnemyType.SLIME, 380, 320),
      new Enemy(2, EnemyType.SLIME, 580, 680),
      new Enemy(3, EnemyType.SLIME, 880, 280),
      new Enemy(4, EnemyType.GOBLIN, 980, 580)
    ];
    this.zones.set('green_forest', {
      id: 'green_forest',
      name: 'Green Forest',
      width: 1500,
      height: 1100,
      color: '#0a1d12',
      enemies: greenEnemies,
      npcs: [],
      decorations: [
        { type: 'TREE', x: 200, y: 180, w: 65, color: '#123d18' },
        { type: 'TREE', x: 450, y: 150, w: 70, color: '#123d18' },
        { type: 'TREE', x: 750, y: 190, w: 75, color: '#123d18' },
        { type: 'TREE', x: 1150, y: 160, w: 70, color: '#123d18' },
        { type: 'TREE', x: 300, y: 850, w: 70, color: '#123d18' },
        { type: 'TREE', x: 700, y: 880, w: 75, color: '#123d18' },
        { type: 'ROCK', x: 500, y: 480, w: 40, color: '#38444f' },
        { type: 'ROCK', x: 850, y: 580, w: 45, color: '#38444f' }
      ],
      portal: { x: 1380, y: 550, targetZone: 'dark_forest', targetX: 120, targetY: 550 }
    });

    // 3. Dark Forest
    const darkEnemies: Enemy[] = [
      new Enemy(5, EnemyType.GOBLIN, 320, 420),
      new Enemy(6, EnemyType.GOBLIN, 720, 320),
      new Enemy(7, EnemyType.ARCHER, 620, 720),
      new Enemy(8, EnemyType.ARCHER, 1020, 470)
    ];
    this.zones.set('dark_forest', {
      id: 'dark_forest',
      name: 'Dark Forest',
      width: 1600,
      height: 1200,
      color: '#0d101a',
      enemies: darkEnemies,
      npcs: [],
      decorations: [
        { type: 'TREE', x: 250, y: 200, w: 70, color: '#14182b' },
        { type: 'TREE', x: 650, y: 160, w: 75, color: '#14182b' },
        { type: 'TREE', x: 1000, y: 220, w: 70, color: '#14182b' },
        { type: 'ROCK', x: 450, y: 620, w: 50, color: '#24293c' }
      ],
      portal: { x: 1480, y: 600, targetZone: 'crystal_cave', targetX: 120, targetY: 600 }
    });

    // 4. Crystal Cave
    const caveEnemies: Enemy[] = [
      new Enemy(9, EnemyType.MAGE, 420, 370),
      new Enemy(10, EnemyType.TANK, 820, 520),
      new Enemy(11, EnemyType.TANK, 1120, 620)
    ];
    this.zones.set('crystal_cave', {
      id: 'crystal_cave',
      name: 'Crystal Cave',
      width: 1600,
      height: 1200,
      color: '#141224',
      enemies: caveEnemies,
      npcs: [],
      decorations: [
        { type: 'CRYSTAL', x: 300, y: 200, w: 35, color: '#a371f7' },
        { type: 'CRYSTAL', x: 700, y: 180, w: 45, color: '#58a6ff' },
        { type: 'CRYSTAL', x: 1100, y: 250, w: 40, color: '#a371f7' }
      ],
      portal: { x: 1500, y: 600, targetZone: 'final_dungeon', targetX: 200, targetY: 450 }
    });

    // 5. Final Dungeon (Boss Arena)
    const bossEnemies: Enemy[] = [
      new Enemy(99, EnemyType.BOSS, 750, 450)
    ];
    this.zones.set('final_dungeon', {
      id: 'final_dungeon',
      name: 'Final Dungeon (Vortex Lair)',
      width: 1500,
      height: 950,
      color: '#1c080d',
      enemies: bossEnemies,
      npcs: [],
      decorations: [
        { type: 'LANTERN', x: 300, y: 200, color: '#ff4d4d' },
        { type: 'LANTERN', x: 1200, y: 200, color: '#ff4d4d' }
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
