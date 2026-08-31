export class BossPhaseStateMachine {
  public evaluatePhase(hpRatio: number): number {
    return hpRatio < 0.15 ? 4 : (hpRatio < 0.4 ? 3 : (hpRatio < 0.7 ? 2 : 1));
  }
}
