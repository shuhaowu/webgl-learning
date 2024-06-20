import { GL, GLError, wrapWebGL2Context } from "./gl/GL";

import { RenderLoop } from "./loopers/RenderLoop";
import { BackgroundLoop } from "./loopers/BackgroundLoop";
import { deg2rad } from "./gl/utils";
import { GridAxis } from "./primitives/GridAxis";
import { Camera, CameraController } from "./gl/Camera";

export class App {
  private _gl: GL;

  private _camera: Camera;
  private _cameraController: CameraController;

  private _renderLoop: RenderLoop;
  private _backgroundLoop: BackgroundLoop;

  private _gridAxis: GridAxis;
  private _resizeEventAttached: boolean = false;

  constructor(private _canvas: HTMLCanvasElement, private _frameTimeEl: HTMLElement) {
    const ctx = this._canvas.getContext("webgl2");
    if (!ctx) {
      throw new GLError("WebGL2 is not available");
    }

    this._gl = wrapWebGL2Context(ctx);
    this._gl.clearColor(1.0, 1.0, 1.0, 1);

    this.fitParentElement();
    this._gl.clearAll();

    this._camera = new Camera(this._canvas.width / this._canvas.height);
    this._cameraController = new CameraController(this._gl, this._canvas, this._camera);

    this._gridAxis = new GridAxis(this._gl);

    this._gridAxis.setScale(0.4, 0.4, 0.4);
    this._gridAxis.setPosition(0.5, 0.5, 0);
    this._gridAxis.setRotation(0, 0, deg2rad(45));

    this._renderLoop = new RenderLoop(this.render.bind(this));
    this._backgroundLoop = new BackgroundLoop(this.background.bind(this), 1000);
  }

  start() {
    this._renderLoop.start();
    this._backgroundLoop.start();
  }

  stop() {
    this._renderLoop.stop();
    this._backgroundLoop.stop();
  }

  private fitParentElement(): void {
    const parentElement = this._canvas.parentElement;
    if (!parentElement) {
      throw new Error("no parent to fit!");
    }

    if (!this._resizeEventAttached) {
      const self = this;
      window.addEventListener("resize", function () {
        self.fitParentElement();
        self._camera.updatePerspectiveMatrix(self._canvas.width / self._canvas.height);
      });
      this._resizeEventAttached = true;
    }

    const w = parentElement.clientWidth;
    const h = parentElement.clientHeight;

    console.debug(`resized canvas to ${w} x ${h}`);

    this.setSize(w, h);
  }

  private setSize(w: number, h: number): void {
    // Set the size of the canvas. Three sets are needed in Chrome to make it
    // work. Otherwise things will be stretched out while drawing.
    this._canvas.style.width = `${w}px`;
    this._canvas.style.height = `${h}px`;
    this._canvas.width = w;
    this._canvas.height = h;

    // When updating the canvas size, the viewport of the canvas must be reset
    // otherwise the resolution WebGL renders at will not change.
    this._gl.viewport(0, 0, w, h);
    this._gl.clearAll();
  }

  private render(dt: number): void {
    this._gl.clearAll(); // Needed otherwise it will render on top.

    this._camera.updateViewMatrix();

    // Do some animations
    const p = this._gridAxis.transform.position;
    const angle = Math.atan2(p[1], p[0]) + deg2rad(30) * dt; // 30 deg per second
    const radius = Math.sqrt(p[0] * p[0] + p[1] * p[1]);
    const scale = Math.max(0.2, Math.abs(Math.sin(angle)) * 1.2);

    this._gridAxis.setScale(scale, scale / 4, 1);
    this._gridAxis.setPosition(radius * Math.cos(angle), radius * Math.sin(angle), 0);
    this._gridAxis.addRotation(deg2rad(30 * dt), deg2rad(60 * dt), deg2rad(15 * dt));

    this._gridAxis.draw(this._camera);
  }

  private background(): void {
    this._frameTimeEl.textContent = String(this._renderLoop.frameDuration().toFixed(1));
  }
}
