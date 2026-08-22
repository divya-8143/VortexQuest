export function testECSLifecycle(): boolean {
  const entities: number[] = [];
  const components = new Map<number, { hp: number; speed: number }>();

  // Create entity 1
  const e1 = 101;
  entities.push(e1);
  components.set(e1, { hp: 100, speed: 5 });

  // Create entity 2
  const e2 = 102;
  entities.push(e2);
  components.set(e2, { hp: 50, speed: 2 });

  if (entities.length !== 2) return false;
  if (components.get(e1)?.hp !== 100) return false;

  // Delete component
  components.delete(e2);
  return !components.has(e2);
}
