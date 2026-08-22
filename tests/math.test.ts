import { Vector2D } from '../src/math/Vector2D';
import { SpatialHash } from '../src/math/SpatialHash';

export function testVectorMath(): boolean {
  const v1 = new Vector2D(3, 4);
  if (v1.length() !== 5) return false;
  
  const v2 = new Vector2D(1, 2);
  v1.add(v2);
  if (v1.x !== 4 || v1.y !== 6) return false;

  const dot = v1.dot(v2);
  if (dot !== 16) return false;

  return true;
}

export function testSpatialHash(): boolean {
  const spatialHash = new SpatialHash(64);
  const obj1 = { id: 1, position: new Vector2D(10, 10), radius: 5 };
  const obj2 = { id: 2, position: new Vector2D(100, 100), radius: 5 };

  spatialHash.insert(obj1);
  spatialHash.insert(obj2);

  const nearby = spatialHash.query(new Vector2D(12, 12), 10);
  return nearby.length === 1 && nearby[0].id === 1;
}
