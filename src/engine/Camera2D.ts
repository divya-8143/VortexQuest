export class Camera2D {
  public x: number = 0;
  public y: number = 0;
  public width: number = 1024;
  public height: number = 576;
  public shakeDuration: number = 0;
  public shakeIntensity: number = 0;

  constructor(width: number = 1024, height: number = 576) {
    this.width = width;
    this.height = height;
  }

  public follow(targetX: number, targetY: number, worldWidth: number, worldHeight: number, deltaTime: number): void {
    const desiredX = targetX - this.width / 2;
    const desiredY = targetY - this.height / 2;

    // Smooth lerp camera tracking
    this.x += (desiredX - this.x) * 5.0 * deltaTime;
    this.y += (desiredY - this.y) * 5.0 * deltaTime;

    // Clamp camera within world boundaries
    this.x = Math.max(0, Math.min(worldWidth - this.width, this.x));
    this.y = Math.max(0, Math.min(worldHeight - this.height, this.y));

    // Update screen shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= deltaTime;
      if (this.shakeDuration <= 0) {
        this.shakeIntensity = 0;
      }
    }
  }

  public triggerShake(intensity: number = 8, duration: number = 0.3): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  public getOffset(): { offsetX: number; offsetY: number } {
    let offsetX = this.x;
    let offsetY = this.y;

    if (this.shakeDuration > 0) {
      offsetX += (Math.random() - 0.5) * this.shakeIntensity * 2;
      offsetY += (Math.random() - 0.5) * this.shakeIntensity * 2;
    }

    return { offsetX, offsetY };
  }
}
