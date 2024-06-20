import { GL } from "../../gl/GL";
import { Mesh } from "../../gl/Mesh";
import { Model } from "../../gl/Model";
import { Shader } from "../../gl/Shader";
import vertexShaderSource from "./vertex.glsl?raw";
import fragmentShaderSource from "./fragment.glsl?raw";

const __attributeNames = ["aPosition", "aColor"] as const;
type AttributeNames = (typeof __attributeNames)[number];
const ATTRIBUTE_NAMES: readonly AttributeNames[] = __attributeNames;

const __uniformNames = ["uPerspectiveMatrix", "uModelMatrix", "uCameraMatrix", "uColor"] as const;
type UniformNames = (typeof __uniformNames)[number];
const UNIFORM_NAMES: readonly UniformNames[] = __uniformNames;

// prettier-ignore
const COLOR_PALETTE = new Float32Array([
  0.5, 0.5, 0.5,
  1.0, 0.0, 0.0,
  0.0, 1.0, 0.0,
  0.0, 0.0, 0.0,
]);

// Width and height of the grid.
const SIZE = 1.8;
const NROWS = 10;
const STEP = SIZE / NROWS;
const HALF_SIZE = SIZE / 2;

export class GridAxisShader extends Shader<AttributeNames, UniformNames> {
  constructor(gl: GL) {
    super(gl, vertexShaderSource, fragmentShaderSource, ATTRIBUTE_NAMES, UNIFORM_NAMES);

    // The color palette never changes, so we can set it up during the initialization.
    this.activate();
    this._gl.uniform3fv(this._uniformLocations.uColor, COLOR_PALETTE);
    this.deactivate();
  }
}

export class GridAxisMesh extends Mesh {
  constructor(gl: GL, shader: GridAxisShader) {
    // We need 4 elements per point, 2 points per line, 8 elements per point.
    // There are NROW + 1 lines + 3 more lines for X Y Z axis
    const vertices = new Float32Array((NROWS + 1) * 16 + 24);
    for (let i = 0; i <= NROWS; i++) {
      const idx = i * 16;
      const p = -HALF_SIZE + i * STEP;

      // Vertical line
      vertices[idx + 0] = p; // x1
      vertices[idx + 1] = HALF_SIZE; // y1
      vertices[idx + 2] = 0; // z1
      vertices[idx + 3] = 0; // c1

      vertices[idx + 4] = p; // x2
      vertices[idx + 5] = -HALF_SIZE; // y2
      vertices[idx + 6] = 0; // z2
      vertices[idx + 7] = 0; // c2

      // Horizontal line
      vertices[idx + 8] = -HALF_SIZE; // x3
      vertices[idx + 9] = p; // y3
      vertices[idx + 10] = 0; // z3
      vertices[idx + 11] = 0; // c3

      vertices[idx + 12] = HALF_SIZE; // x4
      vertices[idx + 13] = p; // y4
      vertices[idx + 14] = 0; // z4
      vertices[idx + 15] = 0; // c4
    }

    // X axis
    const idx = (NROWS + 1) * 16;
    vertices[idx + 0] = -STEP;
    vertices[idx + 1] = 0.0;
    vertices[idx + 2] = 0.0;
    vertices[idx + 3] = 1;

    vertices[idx + 4] = STEP;
    vertices[idx + 5] = 0.0;
    vertices[idx + 6] = 0.0;
    vertices[idx + 7] = 1;

    // Y axis
    vertices[idx + 8] = 0.0;
    vertices[idx + 9] = -STEP;
    vertices[idx + 10] = 0.0;
    vertices[idx + 11] = 2;

    vertices[idx + 12] = 0.0;
    vertices[idx + 13] = STEP;
    vertices[idx + 14] = 0.0;
    vertices[idx + 15] = 2;

    // Z Axis
    vertices[idx + 16] = 0.0;
    vertices[idx + 17] = 0.0;
    vertices[idx + 18] = -STEP;
    vertices[idx + 19] = 3;

    vertices[idx + 20] = 0.0;
    vertices[idx + 21] = 0.0;
    vertices[idx + 22] = STEP;
    vertices[idx + 23] = 3;

    super(gl, {
      drawMode: gl.LINES,
      vertexCount: vertices.length / 4,
      componentLength: 4,
      attributes: [
        {
          index: shader.getAttributeLocation("aPosition"),
          size: 3,
          offset: 0,
        },
        {
          index: shader.getAttributeLocation("aColor"),
          size: 1,
          offset: 3 * Float32Array.BYTES_PER_ELEMENT,
        },
      ],
      vertexData: vertices,
      type: gl.FLOAT,
    });
  }
}

export class GridAxis extends Model {
  constructor(gl: GL) {
    const shader = new GridAxisShader(gl);
    const mesh = new GridAxisMesh(gl, shader);

    super(gl, shader, mesh, new Map());
  }
}
