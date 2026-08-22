import { Vector2D } from './Vector2D';

export class Matrix3x3 {
  public elements: Float32Array;

  constructor() {
    this.elements = new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]);
  }

  public identity(): Matrix3x3 {
    this.elements.set([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]);
    return this;
  }

  public makeTranslation(x: number, y: number): Matrix3x3 {
    this.elements.set([
      1, 0, 0,
      0, 1, 0,
      x, y, 1
    ]);
    return this;
  }

  public makeRotation(theta: number): Matrix3x3 {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    this.elements.set([
      c, s, 0,
      -s, c, 0,
      0, 0, 1
    ]);
    return this;
  }

  public makeScale(sx: number, sy: number): Matrix3x3 {
    this.elements.set([
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1
    ]);
    return this;
  }

  public multiply(m: Matrix3x3): Matrix3x3 {
    const ae = this.elements;
    const be = m.elements;
    const te = new Float32Array(9);

    const a11 = ae[0], a12 = ae[3], a13 = ae[6];
    const a21 = ae[1], a22 = ae[4], a23 = ae[7];
    const a31 = ae[2], a32 = ae[5], a33 = ae[8];

    const b11 = be[0], b12 = be[3], b13 = be[6];
    const b21 = be[1], b22 = be[4], b23 = be[7];
    const b31 = be[2], b32 = be[5], b33 = be[8];

    te[0] = a11 * b11 + a12 * b21 + a13 * b31;
    te[3] = a11 * b12 + a12 * b22 + a13 * b32;
    te[6] = a11 * b13 + a12 * b23 + a13 * b33;

    te[1] = a21 * b11 + a22 * b21 + a23 * b31;
    te[4] = a21 * b12 + a22 * b22 + a23 * b32;
    te[7] = a21 * b13 + a22 * b23 + a23 * b33;

    te[2] = a31 * b11 + a32 * b21 + a33 * b31;
    te[5] = a31 * b12 + a32 * b22 + a33 * b32;
    te[8] = a31 * b13 + a32 * b23 + a33 * b33;

    this.elements.set(te);
    return this;
  }

  public transformVector2D(v: Vector2D): Vector2D {
    const e = this.elements;
    const x = v.x;
    const y = v.y;
    v.x = e[0] * x + e[3] * y + e[6];
    v.y = e[1] * x + e[4] * y + e[7];
    return v;
  }

  public determinant(): number {
    const e = this.elements;
    const a = e[0], b = e[1], c = e[2];
    const d = e[3], f = e[4], g = e[5];
    const h = e[6], i = e[7], j = e[8];
    return a * (f * j - g * i) - b * (d * j - g * h) + c * (d * i - f * h);
  }
}
