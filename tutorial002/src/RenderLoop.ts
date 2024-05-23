export type RenderLoopFn = (deltaTime: number) => void;

export class RenderLoop {
  #lastFrameTime: number = 0; // Time in ms of the last frame
  #running: boolean = false; // If the render loop is running or not.

  #callback: RenderLoopFn; // Frame function.
  #msPerFrame: number; // Number of milliseconds per frame.
  #frameDuration: number = 0; // The last frame's frame time

  #boundRun: () => void;

  constructor(callback: RenderLoopFn, fps: number = 0) {
    this.#callback = callback;
    this.#msPerFrame = fps > 0 ? 1000 / fps : 0;
    this.#boundRun = this.run.bind(this);
  }

  private run(): void {
    const now = performance.now();
    const deltaTimeMs = now - this.#lastFrameTime;

    // Technically this comparison takes a bit of time, so if we want to have
    // uncapped frame rate we really want to remove this if statement, but for
    // simplicity we just do this.
    if (deltaTimeMs > this.#msPerFrame) {
      this.#frameDuration = deltaTimeMs;
      this.#lastFrameTime = now;
      this.#callback(deltaTimeMs / 1000.0);
    }

    if (this.#running) {
      window.requestAnimationFrame(this.#boundRun);
    }
  }

  start(): void {
    this.#running = true;
    this.#lastFrameTime = performance.now();
    window.requestAnimationFrame(this.#boundRun);
  }

  stop(): void {
    this.#running = false;
  }

  fps(): number {
    return this.#frameDuration === 0 ? 0 : 1000 / this.#frameDuration;
  }

  frameDuration(): number {
    return this.#frameDuration;
  }
}
