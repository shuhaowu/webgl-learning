export class GLError extends Error {}

export type GLInstanceConfig = {
  clearColor?: [number, number, number, number];
};

const DEFAULT_BACKGROUND_COLOR: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];

export type ShaderType = "vertex" | "fragment";

export class GLInstance {
  #canvas: HTMLCanvasElement;
  #gl: WebGL2RenderingContext;

  constructor(canvas: HTMLCanvasElement, config: GLInstanceConfig = {}) {
    this.#canvas = canvas;
    const context = this.#canvas.getContext("webgl2");
    if (!context) {
      throw new GLError("WebGL2 is not available");
    }

    this.#gl = context;

    const clearColor = config.clearColor ?? DEFAULT_BACKGROUND_COLOR;
    this.#gl.clearColor(...clearColor);
  }

  clear(): void {
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);
  }

  setSize(w: number, h: number): void {
    // Set the size of the canvas. Three sets are needed in Chrome to make it
    // work. Otherwise things will be stretched out while drawing.
    this.#canvas.style.width = `${w}px`;
    this.#canvas.style.height = `${h}px`;
    this.#canvas.width = w;
    this.#canvas.height = h;

    // When updating the canvas size, the viewport of the canvas must be reset
    // otherwise the resolution WebGL renders at will not change.
    this.#gl.viewport(0, 0, w, h);
  }

  createShaderProgramFromSource(
    vertexSource: string,
    fragmentSource: string,
    validateForDebug: boolean = true
  ): WebGLShader {
    const vertexShader = this.createShader(vertexSource, this.#gl.VERTEX_SHADER);
    const fragmentShader = this.createShader(fragmentSource, this.#gl.FRAGMENT_SHADER);

    return this.createShaderProgram(vertexShader, fragmentShader, validateForDebug);
  }

  createArrayBuffer(a: Float32Array, isDynamic: boolean = false): WebGLBuffer {
    const buf = this.#gl.createBuffer();
    if (buf == undefined) {
      throw new Error("cannot create WebGLBuffer");
    }

    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, buf);
    this.#gl.bufferData(this.#gl.ARRAY_BUFFER, a, isDynamic ? this.#gl.DYNAMIC_DRAW : this.#gl.STATIC_DRAW);
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, null);

    return buf;
  }

  /**
   * Creates the shader program given the source.
   * This should be called once
   */
  private createShader(src: string, type: number): WebGLShader {
    const shader = this.#gl.createShader(type);
    if (shader == undefined) {
      // Not sure why this check is needed. Typescript seems to think
      // createShader can return null but I don't see that in MDN.
      throw new Error("cannot create WebGLShader");
    }

    this.#gl.shaderSource(shader, src);
    this.#gl.compileShader(shader);

    if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
      const errorMsg = `cannot compile shader: ${this.#gl.getShaderInfoLog(shader)}`;
      this.#gl.deleteShader(shader);
      throw new Error(errorMsg);
    }

    return shader;
  }

  /**
   * Creates a program by linking the shaders.
   *
   * This function deletes the shaders passed in as it is no longer needed.
   *
   * @param validateForDebug Only needed for debugging. If shader is good, this is not needed.
   */
  private createShaderProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
    validateForDebug: boolean = false
  ): WebGLProgram {
    const program = this.#gl.createProgram();
    if (program == undefined) {
      throw new Error("cannot create WebGLProgram");
    }

    // QUESTION: How many shader programs can you attach?
    this.#gl.attachShader(program, vertexShader);
    this.#gl.attachShader(program, fragmentShader);
    this.#gl.linkProgram(program);

    if (!this.#gl.getProgramParameter(program, this.#gl.LINK_STATUS)) {
      const errorMsg = `cannot link shader: ${this.#gl.getProgramInfoLog(program)}`;
      this.#gl.deleteProgram(program);
      throw new Error(errorMsg);
    }

    if (validateForDebug) {
      this.#gl.validateProgram(program);
      if (!this.#gl.getProgramParameter(program, this.#gl.VALIDATE_STATUS)) {
        const errorMsg = `error validating program: ${this.#gl.getProgramInfoLog(program)}`;
        this.#gl.deleteProgram(program);
        throw new Error(errorMsg);
      }
    }

    // Can delete the shader since the program has been linked.
    this.#gl.detachShader(program, vertexShader); // TODO: detaching may cause some issues on some browser. May only need to delete
    this.#gl.detachShader(program, fragmentShader);
    this.#gl.deleteShader(vertexShader);
    this.#gl.deleteShader(fragmentShader);

    return program;
  }

  context(): WebGL2RenderingContext {
    return this.#gl;
  }
}
