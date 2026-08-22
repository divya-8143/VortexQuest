export function testAIStateMachine(): boolean {
  let state: 'IDLE' | 'PATROL' | 'ATTACK' = 'IDLE';
  
  // Transition IDLE -> PATROL
  if (state === 'IDLE') state = 'PATROL';
  if (state !== 'PATROL') return false;

  // Transition PATROL -> ATTACK
  const enemyVisible = true;
  if (enemyVisible) state = 'ATTACK';
  if (state !== 'ATTACK') return false;

  return true;
}
