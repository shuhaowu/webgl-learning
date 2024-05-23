import { GLInstance } from "./gl";
import vertexShaderSource from "./shaders/vertex.glsl?raw";
import fragmentShaderSource from "./shaders/fragment.glsl?raw";

import "./style.css";
import { RenderLoop } from "./RenderLoop";
import { BackgroundLoop } from "./BackgroundLoop";

class Main {
  // In a real word design I'm not sure if this and GLInstance should be
  // separate. In the video the presenter just extended WebGL2RenderingContext,
  // which I'm also not sure is a good idea.
  private gl: GLInstance;
  private glCtx: WebGL2RenderingContext;

  private perfEl: HTMLElement;

  private shaderProgram: WebGLProgram; // Not sure if this needs to be kept, but probably.

  private vertexArray: Float32Array;
  private vertexCount: number;
  private vertexBuffer: WebGLBuffer;

  private uPointSizeLoc: WebGLUniformLocation;
  private uAngleLoc: WebGLUniformLocation;
  private aPositionLoc: number;

  private pointSize: number = 0;
  private pointSizeStep: number = 3;
  private angle: number = 0;
  private angleStep: number = (Math.PI / 180) * 90;

  private renderLoop: RenderLoop;
  private backgroundLoop: BackgroundLoop;

  constructor(canvas: HTMLCanvasElement, perfEl: HTMLElement) {
    this.perfEl = perfEl;

    this.gl = new GLInstance(canvas);
    this.glCtx = this.gl.context();

    this.gl.setSize(500, 500);
    this.gl.clear();

    this.shaderProgram = this.gl.createShaderProgramFromSource(vertexShaderSource, fragmentShaderSource);

    this.glCtx.useProgram(this.shaderProgram);
    const uPointSizeLoc = this.glCtx.getUniformLocation(this.shaderProgram, "uPointSize");
    if (uPointSizeLoc == undefined) {
      throw new Error("could not get uniform uPointSize");
    }
    this.uPointSizeLoc = uPointSizeLoc;

    const uAngleLoc = this.glCtx.getUniformLocation(this.shaderProgram, "uAngle");
    if (uAngleLoc == undefined) {
      throw new Error("could not get uAngle uniform");
    }
    this.uAngleLoc = uAngleLoc;

    const aPositionLoc = this.glCtx.getAttribLocation(this.shaderProgram, "a_position");
    if (aPositionLoc === -1) {
      throw new Error("could not get attribute location");
    }
    this.aPositionLoc = aPositionLoc;

    this.glCtx.useProgram(null);

    this.vertexArray = new Float32Array([0, 0, 0]);
    this.vertexCount = this.vertexArray.length / 3;
    this.vertexBuffer = this.gl.createArrayBuffer(this.vertexArray);

    this.renderLoop = new RenderLoop(this.render.bind(this));
    this.backgroundLoop = new BackgroundLoop(this.background.bind(this), 1000);
  }

  run(): void {
    this.glCtx.useProgram(this.shaderProgram);

    this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, this.vertexBuffer);
    this.glCtx.enableVertexAttribArray(this.aPositionLoc);
    this.glCtx.vertexAttribPointer(this.aPositionLoc, 3, this.glCtx.FLOAT, false, 0, 0);
    this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);

    this.renderLoop.start();
    this.backgroundLoop.start();
  }

  render(dt: number): void {
    this.pointSize += this.pointSizeStep * dt;
    const actualSize = 10 * Math.sin(this.pointSize) + 30;
    this.glCtx.uniform1f(this.uPointSizeLoc, actualSize);

    this.angle += this.angleStep * dt;
    this.glCtx.uniform1f(this.uAngleLoc, this.angle);

    this.gl.clear(); // Needed otherwise it will render on top.
    this.glCtx.drawArrays(this.glCtx.POINTS, 0, this.vertexCount);
  }

  background(): void {
    this.perfEl.textContent = String(this.renderLoop.frameDuration().toFixed(1));
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
