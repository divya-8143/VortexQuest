import { GameStateManager } from './engine/GameStateManager';
import { Canvas2DRenderer } from './engine/Canvas2DRenderer';

class VortexQuestApp {
  private gsm: GameStateManager;
  private renderer: Canvas2DRenderer;
  private canvas: HTMLCanvasElement;
  private lastTime: number = 0;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error('[VortexQuestApp] Canvas element #game-canvas not found!');
    }

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.gsm = new GameStateManager();
    this.gsm.setCanvas(this.canvas);
    this.gsm.camera.width = this.canvas.width;
    this.gsm.camera.height = this.canvas.height;

    this.renderer = new Canvas2DRenderer(this.canvas);

    this.lastTime = performance.now();
    requestAnimationFrame((now) => this.gameLoop(now));
    console.log('[VortexQuestApp] Engine initialized & full screen game loop started.');
  }

  private resizeCanvas(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.gsm && this.gsm.camera) {
      this.gsm.camera.width = window.innerWidth;
      this.gsm.camera.height = window.innerHeight;
    }
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
