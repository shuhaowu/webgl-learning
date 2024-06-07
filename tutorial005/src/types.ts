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

// Name is probably wrong.
export type VertexAttributeMetadata = {
  buf: WebGLBuffer;
  componentLen: number;
  count: number;
};

// TODO: this really shouldn't be using AttributeNames. Instead we need to have
// the buffer names as as single buffer can have multiple attributes with
// offsets.
export type VAOWrapper<AttributeNames extends string> = {
  drawMode:
    | WebGLRenderingContextBase["LINE_STRIP"]
    | WebGLRenderingContextBase["POINTS"]
    | WebGLRenderingContextBase["TRIANGLES"]
    | WebGLRenderingContextBase["LINES"];

  raw: WebGLVertexArrayObject;
  vertexAttributes: Map<AttributeNames, VertexAttributeMetadata>;
  indices?: VertexAttributeMetadata;
};

export type VertexAttributeArrayOptions = {
  data: Float32Array;
  componentLen: number;
  location: number;
  size: 1 | 2 | 3 | 4;
};

export type VAOWrapperOptions<AttributeNames extends string> = {
  name: string;
  drawMode: VAOWrapper<AttributeNames>["drawMode"];
  attributeArrays: Record<AttributeNames, VertexAttributeArrayOptions>;
  indices?: Uint16Array;
};

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];
