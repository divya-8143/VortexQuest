import { Vector2D } from './Vector2D';

export interface SpatialObject {
  id: number;
  position: Vector2D;
  radius: number;
}

export class SpatialHash {
  private cellSize: number;
  private grid: Map<string, SpatialObject[]>;

  constructor(cellSize: number = 64) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  private getKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX}:${cellY}`;
  }

  public clear(): void {
    this.grid.clear();
  }

  public insert(obj: SpatialObject): void {
    const minX = Math.floor((obj.position.x - obj.radius) / this.cellSize);
    const maxX = Math.floor((obj.position.x + obj.radius) / this.cellSize);
    const minY = Math.floor((obj.position.y - obj.radius) / this.cellSize);
    const maxY = Math.floor((obj.position.y + obj.radius) / this.cellSize);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const key = `${x}:${y}`;
        if (!this.grid.has(key)) {
          this.grid.set(key, []);
        }
        this.grid.get(key)!.push(obj);
      }
    }
  }

  public query(position: Vector2D, radius: number): SpatialObject[] {
    const results = new Set<SpatialObject>();
    const minX = Math.floor((position.x - radius) / this.cellSize);
    const maxX = Math.floor((position.x + radius) / this.cellSize);
    const minY = Math.floor((position.y - radius) / this.cellSize);
    const maxY = Math.floor((position.y + radius) / this.cellSize);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const key = `${x}:${y}`;
        const cellObjects = this.grid.get(key);
        if (cellObjects) {
          for (const obj of cellObjects) {
            if (position.distanceToSquared(obj.position) <= (radius + obj.radius) ** 2) {
              results.add(obj);
            }
          }
        }
      }
    }
    return Array.from(results);
  }
}
