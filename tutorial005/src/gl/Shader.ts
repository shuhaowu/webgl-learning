import { Transform } from "./Transform";
import { VAOWrapper } from "../types";
import { GL } from "./GL";
import { mat4 } from "gl-matrix";

const standardUniformNamesConst = ["uPerspective", "uModelMatrix", "uCameraMatrix", "uMainTex"] as const;

export type StandardUniformNames = (typeof standardUniformNamesConst)[number];
export const standardUniformNames: readonly StandardUniformNames[] = standardUniformNamesConst;

export class Shader<AttributeNames extends string, UniformNames extends string> {
  protected _gl: GL;
  protected _program: WebGLProgram;

  protected _attributeLocations: Record<AttributeNames, number>;
  protected _uniformLocations: Record<UniformNames | StandardUniformNames, WebGLUniformLocation>;

  constructor(
    gl: GL,
    vertexShaderSrc: string,
    fragmentShaderSrc: string,
    attributes: readonly AttributeNames[],
    uniforms: readonly UniformNames[]
  ) {
    this._gl = gl;
    this._program = gl.createShaderProgramFromSource(vertexShaderSrc, fragmentShaderSrc);

    this._attributeLocations = gl.getAttributeLocations(this._program, attributes);

    const combinedUniforms = (Array.from(uniforms) as (UniformNames | StandardUniformNames)[]).concat(
      standardUniformNames
    );
    this._uniformLocations = gl.getUniformLocations(this._program, combinedUniforms);
  }

  activate() {
    this._gl.useProgram(this._program);
  }

  deactivate() {
    this._gl.useProgram(null);
  }

  setPerspective(mat: mat4): void {
    this._gl.uniformMatrix4fv(this._uniformLocations.uPerspective, false, mat);
  }

  setModelMatrix(mat: mat4): void {
    this._gl.uniformMatrix4fv(this._uniformLocations.uModelMatrix, false, mat);
  }

  setCameraMatrix(mat: mat4): void {
    this._gl.uniformMatrix4fv(this._uniformLocations.uCameraMatrix, false, mat);
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
    this.setModelMatrix(model.transform.matView); // Set the transform, so the shader knows where the model exists in 3d space

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
  transform = new Transform();

  constructor(public vao: VAOWrapper<AttributeNames>) {}

  setScale(x: number, y: number, z: number) {
    this.transform.scale[0] = x;
    this.transform.scale[1] = y;
    this.transform.scale[2] = z;
  }

  setPosition(x: number, y: number, z: number) {
    this.transform.position[0] = x;
    this.transform.position[1] = y;
    this.transform.position[2] = z;
  }

  setRotation(x: number, y: number, z: number) {
    this.transform.rotation[0] = x;
    this.transform.rotation[1] = y;
    this.transform.rotation[2] = z;
  }

  addScale(x: number, y: number, z: number) {
    this.transform.scale[0] += x;
    this.transform.scale[1] += y;
    this.transform.scale[2] += z;
  }

  addPosition(x: number, y: number, z: number) {
    this.transform.position[0] += x;
    this.transform.position[1] += y;
    this.transform.position[2] += z;
  }

  addRotation(x: number, y: number, z: number) {
    this.transform.rotation[0] += x;
    this.transform.rotation[1] += y;
    this.transform.rotation[2] += z;
  }

  prerender() {
    this.transform.updateMatrix();
  }
}
