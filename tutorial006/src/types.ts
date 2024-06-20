export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

export type WebGLDrawMode =
  | WebGLRenderingContextBase["LINE_STRIP"]
  | WebGLRenderingContextBase["POINTS"]
  | WebGLRenderingContextBase["TRIANGLES"]
  | WebGLRenderingContextBase["LINES"]
  | WebGLRenderingContextBase["LINE_LOOP"]
  | WebGLRenderingContextBase["TRIANGLE_STRIP"]
  | WebGLRenderingContextBase["TRIANGLE_FAN"];

// export type MeshBuffer = {
//   buf: WebGLBuffer;
//   componentSize: 1 | 2 | 3 | 4;
//   type:
//     | WebGLRenderingContextBase["BYTE"]
//     | WebGLRenderingContextBase["SHORT"]
//     | WebGLRenderingContextBase["UNSIGNED_BYTE"]
//     | WebGLRenderingContextBase["UNSIGNED_SHORT"]
//     | WebGLRenderingContextBase["FLOAT"]
//     | WebGLRenderingContextBase["INT"]
//     | WebGLRenderingContextBase["UNSIGNED_INT"]
//     | WebGL2RenderingContextBase["HALF_FLOAT"];
//   count: number;
// };

// export type Mesh<BufferNames extends string = string> = {
//   drawMode:
//     | WebGLRenderingContextBase["LINE_STRIP"]
//     | WebGLRenderingContextBase["POINTS"]
//     | WebGLRenderingContextBase["TRIANGLES"]
//     | WebGLRenderingContextBase["LINES"];

//   raw: WebGLVertexArrayObject;
//   buffers: Record<BufferNames, MeshBuffer>;
// };

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];
