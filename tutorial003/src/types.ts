export type ShaderType = "vertex" | "fragment";

export type StandardMeshVAOOptions = {
  name: string;
  indices?: Uint16Array;
  vertices?: Float32Array;
  normals?: Float32Array;
  uvs?: Float32Array;
};

export type StandardVAOWrapper = {
  drawMode: number;
  vao: WebGLVertexArrayObject;
  vertices?: {
    buf: WebGLBuffer;
    componentLen: number;
    count: number;
  };
  normals?: {
    buf: WebGLBuffer;
  };
  uvs?: {
    buf: WebGLBuffer;
  };
  indices?: {
    buf: WebGLBuffer;
    count: number;
  };
};

export type StandardAttrLocation = {
  position: number;
  normal: number;
  uv: number;
};
