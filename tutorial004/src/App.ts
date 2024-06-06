import { GL, GLError, wrapWebGL2Context } from "./gl/GL";
import { Model, Shader } from "./gl/Shader";

import vertexShaderSource from "./shaders/vertex.glsl?raw";
import fragmentShaderSource from "./shaders/fragment.glsl?raw";
import { RenderLoop } from "./loopers/RenderLoop";
import { BackgroundLoop } from "./loopers/BackgroundLoop";
import { GridAxis } from "./primitives/GridAxis";

const testShaderAttributes = ["a_color", "a_position"] as const;
const testShaderUniforms = ["uColor"] as const;

type TestShaderAttributes = (typeof testShaderAttributes)[number];
type TestShaderUniforms = (typeof testShaderUniforms)[number];

class TestShader extends Shader<TestShaderAttributes, TestShaderUniforms> {
  constructor(gl: GL, colors: Float32Array) {
    super(
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      testShaderAttributes as unknown as TestShaderAttributes[],
      testShaderUniforms as unknown as TestShaderUniforms[]
    );

    if (colors.length % 3 != 0) {
      throw new Error(`colors length must be division by 3, not ${colors.length}`);
    }

    this.activate();
    this._gl.uniform3fv(this._uniformLocations.uColor, colors);
    this.deactivate();
  }
}

export class App {
  private _gl: GL;
  private _shader: TestShader;

  private _renderLoop: RenderLoop;
  private _backgroundLoop: BackgroundLoop;

  private _model: Model<TestShaderAttributes>;

  constructor(private _canvas: HTMLCanvasElement, private _diagnosticsEl: HTMLElement) {
    const ctx = this._canvas.getContext("webgl2");
    if (!ctx) {
      throw new GLError("WebGL2 is not available");
    }

    this._gl = wrapWebGL2Context(ctx);
    this._gl.clearColor(1.0, 1.0, 1.0, 1);

    this.setSize(500, 500);
    this._gl.clearAll();

    this._shader = new TestShader(
      this._gl,
      new Float32Array([0.8, 0.8, 0.8, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0])
    );

    // const vao = this._gl.createVAO<TestShaderAttributes>({
    //   name: "lines",
    //   drawMode: this._gl.LINES,
    //   attributeArrays: {
    //     a_position: {
    //       // prettier-ignore
    //       data: new Float32Array([
    //         0, 1, 0,
    //         0, -1, 0,
    //         -1, 0, 0,
    //         1, 0, 0,
    //       ]),
    //       componentLen: 3,
    //       location: this._shader.getAttributeLocation("a_position"),
    //       size: 3,
    //     },
    //   },
    // });

    this._model = new Model(
      GridAxis.createVAO(this._gl, {
        a_position: this._shader.getAttributeLocation("a_position"),
        a_color: this._shader.getAttributeLocation("a_color"),
      })
    );
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

  private render(_dt: number): void {
    this._gl.clearAll(); // Needed otherwise it will render on top.

    this._shader.activate();
    this._shader.renderModel(this._model, this._model.vao.vertexAttributes.get("a_position")!.count);
  }

  private background(): void {
    this._diagnosticsEl.textContent = String(this._renderLoop.frameDuration().toFixed(1));
  }
}
