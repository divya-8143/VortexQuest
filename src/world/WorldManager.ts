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

export interface ZoneData {
  id: string;
  name: string;
  width: number;
  height: number;
  color: string;
  enemies: Enemy[];
  npcs: NPCData[];
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
      color: '#1a2332',
      enemies: [],
      npcs: [
        {
          id: 'elder',
          name: 'Village Elder',
          role: 'ELDER',
          x: 400,
          y: 350,
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
          x: 600,
          y: 350,
          dialogue: [
            "Welcome to my Shop!",
            "I sell Health Potions, Iron Longswords, and Crystal Shield Armor."
          ]
        }
      ],
      portal: { x: 1100, y: 450, targetZone: 'green_forest', targetX: 100, targetY: 450 }
    });

    // 2. Green Forest
    const greenEnemies: Enemy[] = [
      new Enemy(1, EnemyType.SLIME, 300, 300),
      new Enemy(2, EnemyType.SLIME, 500, 600),
      new Enemy(3, EnemyType.SLIME, 800, 250),
      new Enemy(4, EnemyType.GOBLIN, 900, 550)
    ];
    this.zones.set('green_forest', {
      id: 'green_forest',
      name: 'Green Forest',
      width: 1400,
      height: 1000,
      color: '#0e2417',
      enemies: greenEnemies,
      npcs: [],
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
      color: '#121422',
      enemies: darkEnemies,
      npcs: [],
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
      color: '#1a1728',
      enemies: caveEnemies,
      npcs: [],
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
      color: '#240e14',
      enemies: bossEnemies,
      npcs: [],
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
