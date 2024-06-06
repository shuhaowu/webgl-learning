import { GL, GLError } from "../gl/GL";
import { VAOWrapper } from "../types";

export class GridAxis {
  static createVAO(gl: GL, locations: { a_position: number; a_color: number }): VAOWrapper<"a_position"> {
    const vao = gl.createVertexArray();
    if (vao == undefined) {
      throw new GLError("cannot create vertex array");
    }

    const vaoWrapper: VAOWrapper<"a_position"> = {
      drawMode: gl.LINES,
      raw: vao,
      vertexAttributes: new Map(),
    };

    const size = 1.8; // width and height of the box. WebGL coordinate is 2 units in width and height.
    const div = 10; // Number of columns/rows (lines is div + 1);
    const step = size / div;
    const half = size / 2;

    const vertices = new Float32Array((div + 1) * 16 + 16); // div + 1 lines (2 points each) + 2 additiona lines
    for (let i = 0; i <= div; i++) {
      const idx = i * 16;
      const p = -half + i * step;

      // Vertical line
      vertices[idx + 0] = p; // x1
      vertices[idx + 1] = half; // y1
      vertices[idx + 2] = 0; // z1
      vertices[idx + 3] = 0; // c1

      vertices[idx + 4] = p; // x2
      vertices[idx + 5] = -half; // y2
      vertices[idx + 6] = 0; // z2
      vertices[idx + 7] = 1; // c2

      // Horizontal line
      vertices[idx + 8] = -half; // x3
      vertices[idx + 9] = p; // y3
      vertices[idx + 10] = 0; // z3
      vertices[idx + 11] = 0; // c3

      vertices[idx + 12] = half; // x4
      vertices[idx + 13] = p; // y4
      vertices[idx + 14] = 0; // z4
      vertices[idx + 15] = 1; // c4
    }

    const idx = (div + 1) * 16;
    vertices[idx + 0] = -half;
    vertices[idx + 1] = -half;
    vertices[idx + 2] = 0.0;
    vertices[idx + 3] = 2;

    vertices[idx + 4] = half;
    vertices[idx + 5] = half;
    vertices[idx + 6] = 0.0;
    vertices[idx + 7] = 2;

    vertices[idx + 8] = -half;
    vertices[idx + 9] = half;
    vertices[idx + 10] = 0.0;
    vertices[idx + 11] = 3;

    vertices[idx + 12] = half;
    vertices[idx + 13] = -half;
    vertices[idx + 14] = 0.0;
    vertices[idx + 15] = 3;

    const buf = gl.createBuffer();
    if (buf == undefined) {
      throw new GLError("cannot create buffer");
    }

    vaoWrapper.vertexAttributes.set("a_position", {
      buf,
      componentLen: 4, // Technically this is 3, 4th is the color index..
      count: vertices.length / 4,
    });

    const strideLen = Float32Array.BYTES_PER_ELEMENT * 4;
    const positionOffset = 0;
    const colorOffset = Float32Array.BYTES_PER_ELEMENT * 3;

    gl.bindVertexArray(vaoWrapper.raw);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);

    gl.enableVertexAttribArray(locations.a_position);
    gl.vertexAttribPointer(locations.a_position, 3, gl.FLOAT, false, strideLen, positionOffset);

    gl.enableVertexAttribArray(locations.a_color);
    gl.vertexAttribPointer(locations.a_color, 1, gl.FLOAT, false, strideLen, colorOffset);

    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    return vaoWrapper;
  }
}
