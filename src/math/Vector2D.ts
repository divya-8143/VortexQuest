/**
 * 2D Vector mathematics implementation for VortexQuest Engine.
 */
export class Vector2D {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  public set(x: number, y: number): Vector2D {
    this.x = x;
    this.y = y;
    return this;
  }

  public copy(v: Vector2D): Vector2D {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  public add(v: Vector2D): Vector2D {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  public addVectors(a: Vector2D, b: Vector2D): Vector2D {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    return this;
  }

  public addScalar(s: number): Vector2D {
    this.x += s;
    this.y += s;
    return this;
  }

  public sub(v: Vector2D): Vector2D {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  public subVectors(a: Vector2D, b: Vector2D): Vector2D {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    return this;
  }

  public multiplyScalar(s: number): Vector2D {
    this.x *= s;
    this.y *= s;
    return this;
  }

  public divideScalar(s: number): Vector2D {
    if (s !== 0) {
      this.x /= s;
      this.y /= s;
    } else {
      this.x = 0;
      this.y = 0;
    }
    return this;
  }

  public dot(v: Vector2D): number {
    return this.x * v.x + this.y * v.y;
  }

  public cross(v: Vector2D): number {
    return this.x * v.y - this.y * v.x;
  }

  public lengthSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  public length(): number {
    return Math.sqrt(this.lengthSq());
  }

  public normalize(): Vector2D {
    return this.divideScalar(this.length() || 1);
  }

  public angle(): number {
    return Math.atan2(this.y, this.x);
  }

  public angleTo(v: Vector2D): number {
    const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());
    if (denominator === 0) return Math.PI / 2;
    const theta = this.dot(v) / denominator;
    return Math.acos(Math.max(-1, Math.min(1, theta)));
  }

  public distanceTo(v: Vector2D): number {
    return Math.sqrt(this.distanceToSquared(v));
  }

  public distanceToSquared(v: Vector2D): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  public lerp(v: Vector2D, alpha: number): Vector2D {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    return this;
  }

  public rotateAround(center: Vector2D, angle: number): Vector2D {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const x = this.x - center.x;
    const y = this.y - center.y;
    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;
    return this;
  }

  public equals(v: Vector2D): boolean {
    return this.x === v.x && this.y === v.y;
  }

  public static zero(): Vector2D {
    return new Vector2D(0, 0);
  }

  public static one(): Vector2D {
    return new Vector2D(1, 1);
  }

  public static up(): Vector2D {
    return new Vector2D(0, -1);
  }

  public static down(): Vector2D {
    return new Vector2D(0, 1);
  }

  public static left(): Vector2D {
    return new Vector2D(-1, 0);
  }

  public static right(): Vector2D {
    return new Vector2D(1, 0);
  }
}
