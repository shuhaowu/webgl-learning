import { Entries, VAOWrapper, VAOWrapperOptions } from "../types";

export interface GL extends WebGL2RenderingContext {
  clearAll(): void;

  createShaderProgramFromSource(vertexSource: string, fragmentSource: string, validate?: boolean): WebGLShader;

  createVAO<AttributeNames extends string>(opts: VAOWrapperOptions<AttributeNames>): VAOWrapper<AttributeNames>;

  getAttributeLocations<AttributeNames extends string>(
    program: WebGLProgram,
    attributes: readonly AttributeNames[]
  ): Record<AttributeNames, number>;

  getUniformLocations<UniformNames extends string>(
    program: WebGLProgram,
    uniforms: readonly UniformNames[]
  ): Record<UniformNames, WebGLUniformLocation>;
}

export class GLError extends Error {}

export function wrapWebGL2Context(ctx: WebGL2RenderingContext): GL {
  const gl: any = ctx;

  gl.clearAll = function clearAll(): void {
    ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
  };

  function createShader(src: string, type: number): WebGLShader | null {
    const shader = ctx.createShader(type);
    if (shader == undefined) {
      console.error("cannot create shader");
      return null;
    }

    ctx.shaderSource(shader, src);
    ctx.compileShader(shader);

    if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
      console.log(`cannot compile shader: ${ctx.getShaderInfoLog(shader)}`);
      return null;
    }

    return shader;
  }

  function linkShaderProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
    validate: boolean = false
  ): WebGLProgram {
    const program = ctx.createProgram();
    if (program == undefined) {
      throw new GLError("cannot create WebGLProgram");
    }

    ctx.attachShader(program, vertexShader);
    ctx.attachShader(program, fragmentShader);

    ctx.linkProgram(program);
    if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {
      const errorMsg = `cannot link program: ${ctx.getProgramInfoLog(program)}`;
      ctx.deleteProgram(program);
      throw new GLError(errorMsg);
    }

    if (validate) {
      ctx.validateProgram(program);
      if (!ctx.getProgramParameter(program, ctx.VALIDATE_STATUS)) {
        const errorMsg = `error validating program: ${ctx.getProgramInfoLog(program)}`;
        ctx.deleteProgram(program);
        throw new GLError(errorMsg);
      }
    }

    ctx.detachShader(program, vertexShader);
    ctx.detachShader(program, fragmentShader);
    ctx.deleteShader(vertexShader);
    ctx.deleteShader(fragmentShader);

    return program;
  }

  gl.createShaderProgramFromSource = function createShaderProgramFromSource(
    vertexSource: string,
    fragmentSource: string,
    validate: boolean = false
  ): WebGLShader {
    const vertexShader = createShader(vertexSource, ctx.VERTEX_SHADER);
    const fragmentShader = createShader(fragmentSource, ctx.FRAGMENT_SHADER);

    if (vertexShader == undefined || fragmentShader == undefined) {
      ctx.deleteShader(vertexShader);
      ctx.deleteShader(fragmentShader);
      throw new GLError("cannot create shader");
    }

    return linkShaderProgram(vertexShader, fragmentShader, validate);
  };

  // TODO: this is really not flexible enough, because it cannot deal with things like a single array with multiple attributes using stride/offset.
  gl.createVAO = function createVAO<AttributeNames extends string>(
    opts: VAOWrapperOptions<AttributeNames>
  ): VAOWrapper<AttributeNames> {
    const vao = ctx.createVertexArray();
    if (vao == undefined) {
      throw new GLError("cannot create vertex array");
    }

    const vaoWrapper: VAOWrapper<AttributeNames> = {
      drawMode: opts.drawMode,
      raw: vao,
      vertexAttributes: new Map(),
    };

    ctx.bindVertexArray(vao);
    for (const [attributeName, attributeArrayOptions] of Object.entries(opts.attributeArrays) as Entries<
      VAOWrapperOptions<AttributeNames>["attributeArrays"]
    >) {
      const buf = ctx.createBuffer();
      if (buf == undefined) {
        throw new GLError("cannot create buffer");
      }

      vaoWrapper.vertexAttributes.set(attributeName, {
        buf,
        componentLen: attributeArrayOptions.componentLen,
        count: attributeArrayOptions.data.length / attributeArrayOptions.componentLen,
      });

      ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);

      ctx.enableVertexAttribArray(attributeArrayOptions.location);
      ctx.vertexAttribPointer(attributeArrayOptions.location, attributeArrayOptions.size, ctx.FLOAT, false, 0, 0);

      ctx.bufferData(ctx.ARRAY_BUFFER, attributeArrayOptions.data, ctx.STATIC_DRAW);

      ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
    }

    if (opts.indices) {
      const buf = ctx.createBuffer();
      if (buf == undefined) {
        throw new GLError("cannot create buffer");
      }

      vaoWrapper.indices = {
        buf,
        count: opts.indices.length,
        componentLen: 1,
      };

      ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, buf);
      ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, opts.indices, ctx.STATIC_DRAW);
      ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
    }

    ctx.bindVertexArray(null);

    return vaoWrapper;
  };

  gl.getAttributeLocations = function getAttributeLocations<AttributeNames extends string>(
    program: WebGLProgram,
    attributes: readonly AttributeNames[]
  ): Record<AttributeNames, number> {
    const locations: Record<string, number> = {};

    ctx.useProgram(program);
    try {
      for (const attribute of attributes) {
        const loc = ctx.getAttribLocation(program, attribute);
        locations[attribute] = loc;
        if (loc === -1) {
          throw new GLError(`cannot find shader attribute location for '${attribute}'`);
        }
      }
    } finally {
      ctx.useProgram(null);
    }

    return locations;
  };

  gl.getUniformLocations = function getUniformLocations<UniformNames extends string>(
    program: WebGLProgram,
    uniforms: readonly UniformNames[]
  ): Record<UniformNames, WebGLUniformLocation> {
    const locations: Record<string, WebGLUniformLocation> = {};

    ctx.useProgram(program);
    try {
      for (const uniform of uniforms) {
        const loc = ctx.getUniformLocation(program, uniform);
        if (loc == null) {
          console.warn(`cannot find uniform ${uniform}`);
        }

        locations[uniform] = loc ?? -1;
      }
    } finally {
      ctx.useProgram(null);
    }

    return locations;
  };

  return gl as GL;
}
