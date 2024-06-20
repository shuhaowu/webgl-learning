import { GL } from "./GL";
import { mat4 } from "gl-matrix";

const standardUniformNamesConst = ["uPerspectiveMatrix", "uModelMatrix", "uCameraMatrix", "uMainTex"] as const;

export type StandardUniformNames = (typeof standardUniformNamesConst)[number];
export const standardUniformNames: readonly StandardUniformNames[] = standardUniformNamesConst;

export class Shader<AttributeNames extends string = string, UniformNames extends string = string> {
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

  setPerspectiveMatrix(mat: Readonly<mat4>): void {
    this._gl.uniformMatrix4fv(this._uniformLocations.uPerspectiveMatrix, false, mat);
  }

  setModelMatrix(mat: Readonly<mat4>): void {
    this._gl.uniformMatrix4fv(this._uniformLocations.uModelMatrix, false, mat);
  }

  setCameraMatrix(mat: Readonly<mat4>): void {
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
}
