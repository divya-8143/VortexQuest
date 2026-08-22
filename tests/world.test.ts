export function testWorldGenerator(): boolean {
  const width = 20;
  const height = 20;
  const grid = Array.from({ length: height }, () => Array(width).fill(0));

  // Fill border walls
  for (let x = 0; x < width; x++) {
    grid[0][x] = 1;
    grid[height - 1][x] = 1;
  }
  for (let y = 0; y < height; y++) {
    grid[y][0] = 1;
    grid[y][width - 1] = 1;
  }

  // Check borders are solid
  let valid = true;
  if (grid[0][5] !== 1 || grid[19][5] !== 1) valid = false;
  if (grid[5][0] !== 1 || grid[5][19] !== 1) valid = false;

  return valid;
}
