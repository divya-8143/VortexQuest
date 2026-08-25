import { GameStateManager } from './engine/GameStateManager';
import { Canvas2DRenderer } from './engine/Canvas2DRenderer';

class VortexQuestApp {
  private gsm: GameStateManager;
  private renderer: Canvas2DRenderer;
  private lastTime: number = 0;

  constructor() {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('[VortexQuestApp] Canvas element #game-canvas not found!');
    }

    this.gsm = new GameStateManager();
    this.renderer = new Canvas2DRenderer(canvas);

    this.lastTime = performance.now();
    requestAnimationFrame((now) => this.gameLoop(now));
    console.log('[VortexQuestApp] Engine initialized & game loop started.');
  }

  private gameLoop(now: number): void {
    const deltaTime = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    // Update Game State
    this.gsm.update(deltaTime);

    // Render Canvas Frame
    this.renderer.render(this.gsm);

    requestAnimationFrame((n) => this.gameLoop(n));
  }
}

// Bootstrap Application
window.addEventListener('DOMContentLoaded', () => {
  new VortexQuestApp();
});
