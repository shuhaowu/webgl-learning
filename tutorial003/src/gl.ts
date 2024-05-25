import { Model } from "./model";
import { StandardAttrLocation, StandardMeshVAOOptions, StandardVAOWrapper as MeshVAO } from "./types";

export class GLError extends Error {}

export type GLInstanceConfig = {
  clearColor?: [number, number, number, number];
};

const DEFAULT_BACKGROUND_COLOR: [number, number, number, number] = [1.0, 1.0, 1.0, 1.0];

const ATTR_POSIITON_NAME = "a_position";
const ATTR_POSITION_LOC = 0;
const ATTR_NORMAL_NAME = "a_norm";
const ATTR_NORMAL_LOC = 1;
const ATTR_UV_NAME = "a_uv";
const ATTR_UV_LOC = 2;

export class GLInstance {
  #canvas: HTMLCanvasElement;
  #gl: WebGL2RenderingContext;

  #meshCache: Map<string, MeshVAO> = new Map();

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

    let fragmentShader: WebGLShader;
    try {
      fragmentShader = this.createShader(fragmentSource, this.#gl.FRAGMENT_SHADER);
    } catch (e) {
      this.#gl.deleteShader(vertexShader);
      throw e;
    }

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

  createMeshVAO({ name, indices, vertices, normals, uvs }: StandardMeshVAOOptions): MeshVAO {
    const vao = this.#gl.createVertexArray();
    if (vao == undefined) {
      throw new Error("cannot create vertex array");
    }

    const rtn: MeshVAO = {
      drawMode: this.#gl.TRIANGLES,
      vao,
    };

    // Set the currently active VAO.
    // All calls to enableVertexAttribArray and vertexAttribPoint are saved to the VAO.
    this.#gl.bindVertexArray(rtn.vao);

    if (vertices != undefined) {
      const buf = this.#gl.createBuffer();
      if (buf == undefined) {
        throw new Error("cannot create buffer");
      }
      rtn.vertices = {
        buf,
        componentLen: 3,
        count: vertices.length / 3,
      };

      this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, rtn.vertices.buf);
      this.#gl.bufferData(this.#gl.ARRAY_BUFFER, vertices, this.#gl.STATIC_DRAW);
      this.#gl.enableVertexAttribArray(ATTR_POSITION_LOC);
      this.#gl.vertexAttribPointer(ATTR_POSITION_LOC, 3, this.#gl.FLOAT, false, 0, 0);
      this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, null);
    }

    if (normals != undefined) {
      const buf = this.#gl.createBuffer();
      if (buf == undefined) {
        throw new Error("cannot create buffer");
      }

      rtn.normals = {
        buf,
      };
      this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, rtn.normals.buf);
      this.#gl.bufferData(this.#gl.ARRAY_BUFFER, normals, this.#gl.STATIC_DRAW);
      this.#gl.enableVertexAttribArray(ATTR_NORMAL_LOC);
      this.#gl.vertexAttribPointer(ATTR_NORMAL_LOC, 3, this.#gl.FLOAT, false, 0, 0);
      this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, null);
    }

    if (uvs != undefined) {
      const buf = this.#gl.createBuffer();
      if (buf == undefined) {
        throw new Error("cannot create buffer");
      }

      rtn.uvs = {
        buf,
      };

      this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, rtn.uvs.buf);
      this.#gl.bufferData(this.#gl.ARRAY_BUFFER, uvs, this.#gl.STATIC_DRAW);
      this.#gl.enableVertexAttribArray(ATTR_UV_LOC);
      this.#gl.vertexAttribPointer(ATTR_UV_LOC, 2, this.#gl.FLOAT, false, 0, 0); // Note that UVs are only two floats!
      this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, null);
    }

    if (indices != undefined) {
      const buf = this.#gl.createBuffer();
      if (buf == undefined) {
        throw new Error("cannot create buffer");
      }

      rtn.indices = {
        buf,
        count: indices.length,
      };

      this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, rtn.indices.buf);
      this.#gl.bufferData(this.#gl.ELEMENT_ARRAY_BUFFER, indices, this.#gl.STATIC_DRAW);
      this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, null);
    }

    this.#gl.bindVertexArray(null); // Unbind the VAO (very important)

    this.#meshCache.set(name, rtn);
    return rtn;
  }

  getStandardAttributeLocation(program: WebGLProgram): StandardAttrLocation {
    return {
      position: this.#gl.getAttribLocation(program, ATTR_POSIITON_NAME),
      normal: this.#gl.getAttribLocation(program, ATTR_NORMAL_NAME),
      uv: this.#gl.getAttribLocation(program, ATTR_UV_NAME),
    };
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

    // Force predefined locations for specific attributes.
    // If the attribute isn't used in the shader, its location
    // will default to -1.
    // Must do this before we link the program.
    this.#gl.bindAttribLocation(program, ATTR_POSITION_LOC, ATTR_POSIITON_NAME);
    this.#gl.bindAttribLocation(program, ATTR_NORMAL_LOC, ATTR_NORMAL_NAME);
    this.#gl.bindAttribLocation(program, ATTR_UV_LOC, ATTR_UV_NAME);

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

export class Shader {
  program: WebGLProgram;
  protected gl: GLInstance;
  protected glCtx: WebGL2RenderingContext;

  protected attrLoc: StandardAttrLocation;
  protected uniformLoc: Record<string, WebGLUniformLocation>;

  constructor(gl: GLInstance, vertexShaderSrc: string, fragmentShaderSrc: string) {
    this.program = gl.createShaderProgramFromSource(vertexShaderSrc, fragmentShaderSrc);
    this.gl = gl;
    this.glCtx = gl.context();

    // We don't undo the useProgram because we assume that subcalsses will use it?
    // Not the best design tbh.
    this.glCtx.useProgram(this.program); // Possibly this needs to be moved to getStandardAttributeLocation?

    this.attrLoc = this.gl.getStandardAttributeLocation(this.program);
    this.uniformLoc = {}; // Replace in later lesson with get standardUniformLocation
  }

  // Note: extending shader should deactive shader when calling super and setting custom parts in constructor

  activate() {
    this.glCtx.useProgram(this.program);
  }

  deactivate() {
    this.glCtx.useProgram(null);
  }

  // Heper when cleanup the shader when not needed.
  dispose() {
    if (this.glCtx.getParameter(this.glCtx.CURRENT_PROGRAM) === this.program) {
      this.deactivate();
    }

    this.glCtx.deleteProgram(this.program);
  }

  // Render related methods below

  // Abstract base method
  // When switching for another shader we may need to do things like rebind
  // textures with OpenGL before we render.
  prerender() {}

  renderModel(model: Model) {
    this.glCtx.bindVertexArray(model.mesh.vao); // This will set all the predefined attributes for the shader

    if (model.mesh.indices) {
      this.glCtx.drawElements(model.mesh.drawMode, model.mesh.indices.count, this.glCtx.UNSIGNED_SHORT, 0);
    } else if (model.mesh.vertices) {
      this.glCtx.drawArrays(model.mesh.drawMode, 0, model.mesh.vertices.count);
    } else {
      throw new Error(`improper mesh: ${JSON.stringify(model.mesh)}`);
    }

    this.glCtx.bindVertexArray(null);
  }
}
