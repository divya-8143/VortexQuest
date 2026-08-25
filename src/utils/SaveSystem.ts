import { SaveData, PlayerStats, ItemData, QuestData, SkillData } from '../types/GameTypes';

const SAVE_KEY = 'VORTEX_QUEST_SAVE_DATA_V1';

export class SaveSystem {
  public static saveGame(data: SaveData): boolean {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(SAVE_KEY, json);
      console.log('[SaveSystem] Game saved successfully!');
      return true;
    } catch (err) {
      console.error('[SaveSystem] Failed to save game:', err);
      return false;
    }
  }

  public static loadGame(): SaveData | null {
    try {
      const json = localStorage.getItem(SAVE_KEY);
      if (!json) return null;
      const data: SaveData = JSON.parse(json);
      if (!data || !data.player || typeof data.player.hp !== 'number') {
        console.warn('[SaveSystem] Corrupted save data detected, resetting.');
        return null;
      }
      console.log('[SaveSystem] Game loaded successfully!');
      return data;
    } catch (err) {
      console.error('[SaveSystem] Error parsing save data:', err);
      return null;
    }
  }

  public static hasSave(): boolean {
    return !!localStorage.getItem(SAVE_KEY);
  }

  public static clearSave(): void {
    localStorage.removeItem(SAVE_KEY);
    console.log('[SaveSystem] Save data cleared.');
  }
}
