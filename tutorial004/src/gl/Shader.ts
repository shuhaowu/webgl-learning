import { VAOWrapper } from "../types";
import { GL } from "./GL";

export class Shader<AttributeNames extends string, UniformNames extends string> {
  protected _gl: GL;
  protected _program: WebGLProgram;

  protected _attributeLocations: Record<AttributeNames, number>;
  protected _uniformLocations: Record<UniformNames, WebGLUniformLocation>;

  constructor(
    gl: GL,
    vertexShaderSrc: string,
    fragmentShaderSrc: string,
    attributes: AttributeNames[],
    uniforms: UniformNames[]
  ) {
    this._gl = gl;
    this._program = gl.createShaderProgramFromSource(vertexShaderSrc, fragmentShaderSrc);

    this._attributeLocations = gl.getAttributeLocations(this._program, attributes);
    this._uniformLocations = gl.getUniformLocations(this._program, uniforms);
  }

  activate() {
    this._gl.useProgram(this._program);
  }

  deactivate() {
    this._gl.useProgram(null);
  }

  destroy() {
    if (this._gl.getParameter(this._gl.CURRENT_PROGRAM) === this._program) {
      this.deactivate();
    }

    this._gl.deleteProgram(this._program);
  }

  getAttributeLocation(attribute: AttributeNames): number {
    return this._attributeLocations[attribute];
  }

  getUniformLocation(uniform: UniformNames): WebGLUniformLocation {
    return this._uniformLocations[uniform];
  }

  /**
   * When switching to another shader we might need to do things like rebind textures.
   */
  prerender() {}

  // TODO: this also need to change into not attribute names but buffer names.
  renderModel(model: Model<AttributeNames>, count: number) {
    // This will setup all the predefined attributes.
    this._gl.bindVertexArray(model.vao.raw);
    try {
      if (model.vao.indices) {
        this._gl.drawElements(model.vao.drawMode, model.vao.indices.count, this._gl.UNSIGNED_SHORT, 0);
      } else {
        this._gl.drawArrays(model.vao.drawMode, 0, count!);
      }
    } finally {
      this._gl.bindVertexArray(null);
    }
  }
}

export class Model<AttributeNames extends string> {
  constructor(public vao: VAOWrapper<AttributeNames>) {}

  prerender() {}
}
