import { QuestData, PlayerStats } from '../types/GameTypes';

export class QuestLog {
  public quests: QuestData[] = [];

  constructor() {
    this.initDefaultQuests();
  }

  private initDefaultQuests(): void {
    this.quests = [
      {
        id: 'q1_slimes',
        title: 'Clear the Village Outskirts',
        description: 'Green Slimes are threatening the village crops. Slay 3 Green Slimes.',
        objectives: [
          { id: 'obj1', description: 'Defeat Green Slimes', targetType: 'KILL', targetId: 'SLIME', requiredAmount: 3, currentAmount: 0, completed: false }
        ],
        rewardXp: 100,
        rewardGold: 75,
        status: 'ACTIVE'
      },
      {
        id: 'q2_goblins',
        title: 'Dark Forest Scout',
        description: 'Travel into the Dark Forest and defeat 3 Goblin Warriors.',
        objectives: [
          { id: 'obj2', description: 'Defeat Goblin Warriors', targetType: 'KILL', targetId: 'GOBLIN', requiredAmount: 3, currentAmount: 0, completed: false }
        ],
        rewardXp: 200,
        rewardGold: 150,
        status: 'NOT_STARTED'
      },
      {
        id: 'q3_boss',
        title: 'The Missing Crystal & Guardian',
        description: 'Enter the Final Dungeon and defeat the Vortex Guardian boss.',
        objectives: [
          { id: 'obj3', description: 'Defeat Vortex Guardian', targetType: 'BOSS', targetId: 'BOSS', requiredAmount: 1, currentAmount: 0, completed: false }
        ],
        rewardXp: 800,
        rewardGold: 600,
        status: 'NOT_STARTED'
      }
    ];
  }

  public notifyKill(enemyType: string): void {
    this.quests.forEach(quest => {
      if (quest.status === 'ACTIVE') {
        quest.objectives.forEach(obj => {
          if (obj.targetType === 'KILL' && (obj.targetId === enemyType || obj.targetId === 'ANY')) {
            if (!obj.completed) {
              obj.currentAmount = Math.min(obj.requiredAmount, obj.currentAmount + 1);
              if (obj.currentAmount >= obj.requiredAmount) {
                obj.completed = true;
                console.log(`[QuestLog] Objective completed: ${obj.description}`);
              }
            }
          }
          if (obj.targetType === 'BOSS' && enemyType === 'BOSS') {
            if (!obj.completed) {
              obj.currentAmount = 1;
              obj.completed = true;
              console.log(`[QuestLog] Boss Objective completed: ${obj.description}`);
            }
          }
        });

        // Check if all objectives completed
        const allDone = quest.objectives.every(o => o.completed);
        if (allDone && quest.status === 'ACTIVE') {
          quest.status = 'COMPLETED';
          console.log(`[QuestLog] Quest Completed: ${quest.title}`);
        }
      }
    });
  }

  public claimReward(questId: string, player: { addXp: (amount: number) => void; stats: PlayerStats }): boolean {
    const quest = this.quests.find(q => q.id === questId);
    if (quest && quest.status === 'COMPLETED') {
      quest.status = 'CLAIMED';
      player.addXp(quest.rewardXp);
      player.stats.gold += quest.rewardGold;
      console.log(`[QuestLog] Claimed rewards for ${quest.title}: +${quest.rewardXp} XP, +${quest.rewardGold} Gold.`);

      // Unlock next quest in chain
      if (questId === 'q1_slimes') {
        const q2 = this.quests.find(q => q.id === 'q2_goblins');
        if (q2) q2.status = 'ACTIVE';
      } else if (questId === 'q2_goblins') {
        const q3 = this.quests.find(q => q.id === 'q3_boss');
        if (q3) q3.status = 'ACTIVE';
      }

      return true;
    }
    return false;
  }
}
