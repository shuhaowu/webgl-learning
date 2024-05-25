import { GLInstance, Shader } from "./gl";
import vertexShaderSource from "./shaders/vertex.glsl?raw";
import fragmentShaderSource from "./shaders/fragment.glsl?raw";

import "./style.css";
import { RenderLoop } from "./RenderLoop";
import { BackgroundLoop } from "./BackgroundLoop";
import { Model } from "./model";

class Main {
  // In a real word design I'm not sure if this and GLInstance should be
  // separate. In the video the presenter just extended WebGL2RenderingContext,
  // which I'm also not sure is a good idea.
  private gl: GLInstance;
  private glCtx: WebGL2RenderingContext;

  private perfEl: HTMLElement;

  private pointSize: number = 0;
  private pointSizeStep: number = 3;
  private angle: number = 0;
  private angleStep: number = (Math.PI / 180) * 90;

  private renderLoop: RenderLoop;
  private backgroundLoop: BackgroundLoop;

  private shader: TestShader;
  private model: Model;

  constructor(canvas: HTMLCanvasElement, perfEl: HTMLElement) {
    this.perfEl = perfEl;

    this.gl = new GLInstance(canvas);
    this.glCtx = this.gl.context();

    this.gl.setSize(500, 500);
    this.gl.clear();

    this.shader = new TestShader(this.gl);

    const mesh = this.gl.createMeshVAO({
      name: "dots",
      // prettier-ignore
      vertices: new Float32Array([
        0, 0, 0,
        0.1, 0.1, 0,
        0.1, -0.1, 0,
        -0.1, 0.1, 0,
        -0.1, -0.1, 0,
      ]),
    });
    mesh.drawMode = this.glCtx.POINTS;

    this.model = new Model(mesh);

    this.renderLoop = new RenderLoop(this.render.bind(this));
    this.backgroundLoop = new BackgroundLoop(this.background.bind(this), 1000);
  }

  run(): void {
    this.renderLoop.start();
    this.backgroundLoop.start();
  }

  render(dt: number): void {
    this.pointSize += this.pointSizeStep * dt;
    const actualSize = 10 * Math.sin(this.pointSize) + 30;

    this.angle += this.angleStep * dt;

    this.gl.clear(); // Needed otherwise it will render on top.

    this.shader.activate();
    this.shader.set(actualSize, this.angle);
    this.shader.renderModel(this.model);
  }

  background(): void {
    this.perfEl.textContent = String(this.renderLoop.frameDuration().toFixed(1));
  }
}

class TestShader extends Shader {
  constructor(gl: GLInstance) {
    super(gl, vertexShaderSource, fragmentShaderSource);

    let loc = this.glCtx.getUniformLocation(this.program, "uPointSize");
    if (loc == undefined) {
      throw new Error("cannot get uPointSize");
    }

    this.uniformLoc.uPointSize = loc;
    loc = this.glCtx.getUniformLocation(this.program, "uAngle");
    if (loc == undefined) {
      throw new Error("Cannot get uAngle");
    }

    this.uniformLoc.uAngle = loc;
    this.glCtx.useProgram(null);
  }

  set(size: number, angle: number) {
    this.glCtx.uniform1f(this.uniformLoc.uPointSize, size);
    this.glCtx.uniform1f(this.uniformLoc.uAngle, angle);
  }
}

const canvas = document.getElementById("glcanvas");
if (canvas == undefined) {
  throw new Error("must define #glcanvas");
}

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("#glcanvas must be a <canvas>");
}

const perfSpan = document.getElementById("perf");
if (perfSpan == undefined) {
  throw new Error("must define perf");
}

const main = new Main(canvas, perfSpan);
main.run();
