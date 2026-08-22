import { SpatialObject } from '../src/math/SpatialHash';

export function testAABBCollision(): boolean {
  const boxA = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
  const boxB = { minX: 5, minY: 5, maxX: 15, maxY: 15 };
  const boxC = { minX: 20, minY: 20, maxX: 30, maxY: 30 };

  const intersectsAB = (boxA.minX <= boxB.maxX && boxA.maxX >= boxB.minX && boxA.minY <= boxB.maxY && boxA.maxY >= boxB.minY);
  const intersectsAC = (boxA.minX <= boxC.maxX && boxA.maxX >= boxC.minX && boxA.minY <= boxC.maxY && boxA.maxY >= boxC.minY);

  return intersectsAB === true && intersectsAC === false;
}
