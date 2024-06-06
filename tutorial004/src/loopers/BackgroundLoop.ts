export class BackgroundLoop {
  #running: boolean = false;
  #callback: () => void;
  #period: number;
  #timeoutHandle?: ReturnType<typeof setTimeout>;

  #boundRun: () => void;

  constructor(callback: () => void, period: number) {
    this.#callback = callback;
    this.#period = period;
    this.#boundRun = this.run.bind(this);
  }

  start() {
    if (this.#running) {
      return;
    }

    this.#running = true;
    this.run();
  }

  stop() {
    this.#running = false;
    if (this.#timeoutHandle != undefined) {
      clearTimeout(this.#timeoutHandle);
      this.#timeoutHandle = undefined;
    }
  }

  private run() {
    this.#callback();
    if (this.#running) {
      this.#timeoutHandle = setTimeout(this.#boundRun, this.#period);
    }
  }
}
