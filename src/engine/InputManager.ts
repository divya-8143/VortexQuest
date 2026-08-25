export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private justPressed: Map<string, boolean> = new Map();
  public mouseX: number = 0;
  public mouseY: number = 0;
  public mouseDown: boolean = false;
  public mouseJustClicked: boolean = false;

  constructor() {
    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (!this.keys.get(k)) {
        this.justPressed.set(k, true);
      }
      this.keys.set(k, true);
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      this.keys.set(k, false);
      this.justPressed.set(k, false);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    window.addEventListener('mousedown', (e) => {
      this.mouseDown = true;
      this.mouseJustClicked = true;
    });

    window.addEventListener('mouseup', () => {
      this.mouseDown = false;
    });
  }

  public isKeyDown(key: string): boolean {
    return !!this.keys.get(key.toLowerCase());
  }

  public isKeyJustPressed(key: string): boolean {
    const k = key.toLowerCase();
    if (this.justPressed.get(k)) {
      this.justPressed.set(k, false); // Consume single press
      return true;
    }
    return false;
  }

  public isMouseJustClicked(): boolean {
    if (this.mouseJustClicked) {
      this.mouseJustClicked = false;
      return true;
    }
    return false;
  }

  public getCanvasMousePos(canvas: HTMLCanvasElement): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (this.mouseX - rect.left) * scaleX,
      y: (this.mouseY - rect.top) * scaleY
    };
  }

  public clearFrameInputs(): void {
    this.justPressed.clear();
    this.mouseJustClicked = false;
  }
}
