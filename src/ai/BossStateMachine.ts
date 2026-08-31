export class BossStateMachine { public getPhase(hp: number): number { return hp < 20 ? 4 : 1; } }
