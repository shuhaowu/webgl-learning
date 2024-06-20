import { WebGLDrawMode } from "../types";
import { GL, GLError } from "./GL";

/**
 * This is basically the arguments to vertexAttribPointer, except with default
 * arguments:
 *
 * - `normalized` defaults to `false`
 * - `type` is unnecessary and determined from `MeshOptions.type`
 * - `stride` is unncessary and determined from `MeshOptions.componentLength`.
 *
 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer)
 */
export type AttributeOptions = {
  index: number;
  size: 1 | 2 | 3 | 4;
  offset: number;
  normalized?: true;
};

export type MeshOptions = {
  drawMode: WebGLDrawMode;
  vertexCount: number;
  componentLength: number;
  attributes: AttributeOptions[];
  indices?: Uint16Array;
} & (
  | {
      vertexData: Float32Array;
      type: WebGLRenderingContextBase["FLOAT"];
    }
  | {
      vertexData: Uint16Array;
      type: WebGLRenderingContextBase["UNSIGNED_SHORT"];
    }
  | {
      vertexData: Uint8Array;
      type: WebGLRenderingContextBase["UNSIGNED_BYTE"];
    }
  | {
      vertexData: Uint32Array;
      type: WebGLRenderingContextBase["UNSIGNED_INT"];
    }
  | {
      vertexData: Int16Array;
      type: WebGLRenderingContextBase["SHORT"];
    }
  | {
      vertexData: Int8Array;
      type: WebGLRenderingContextBase["BYTE"];
    }
  | {
      vertexData: Int32Array;
      type: WebGLRenderingContextBase["INT"];
    }
  | {
      vertexData: Float32Array;
      type: WebGL2RenderingContextBase["HALF_FLOAT"];
    }
);

export class Mesh {
  drawMode: WebGLDrawMode;
  vertexCount: number;
  componentLength: number;

  vao: WebGLVertexArrayObject;
  vertexBuf: WebGLBuffer;
  indexBuf?: WebGLBuffer;

  constructor(public gl: GL, opts: MeshOptions) {
    this.drawMode = opts.drawMode;
    this.vertexCount = opts.vertexCount;
    this.componentLength = opts.componentLength;

    const vao = gl.createVertexArray();
    if (vao == undefined) {
      throw new GLError("cannot create VAO");
    }
    this.vao = vao;

    const vertexBuf = gl.createBuffer();
    if (vertexBuf == undefined) {
      throw new GLError("cannot create buffer");
    }
    this.vertexBuf = vertexBuf;

    if (opts.indices) {
      const indexBuf = gl.createBuffer();
      if (indexBuf == undefined) {
        throw new GLError("cannot create buffer");
      }

      this.indexBuf = indexBuf;
    }

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);

    for (const { index, size, offset, normalized = false } of opts.attributes) {
      gl.enableVertexAttribArray(index);
      gl.vertexAttribPointer(
        index,
        size,
        opts.type,
        normalized,
        opts.vertexData.BYTES_PER_ELEMENT * this.componentLength,
        offset
      );
    }

    gl.bufferData(gl.ARRAY_BUFFER, opts.vertexData, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    if (this.indexBuf) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuf);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, opts.indices!, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    gl.bindVertexArray(null);
  }
}
