import { GLInstance } from "./gl";
import vertexShaderSource from "./shaders/vertex.glsl?raw"
import fragmentShaderSource from "./shaders/fragment.glsl?raw"

import "./style.css";

function main() {
  const canvas = document.getElementById("glcanvas");
  if (canvas == undefined) {
    throw new Error("must define #glcanvas element");
  }

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("#glcanvas must a <canvas>");
  }

  // Create the GL instance
  const gl = new GLInstance(canvas);
  gl.setSize(500, 500);
  gl.clear();

  // Shader steps:
  // 1. Get vertex and fragment shader source

  // 2. Compile the source and validate
  const vertexShader = gl.createShader(vertexShaderSource, "vertex");
  const fragmentShader = gl.createShader(fragmentShaderSource, "fragment");

  // 3. Link the shaders together as a program
  const shaderProgram = gl.createProgram(vertexShader, fragmentShader);

  // 4. Get the location of uniform and attributes. Later on we will use VAO to
  // predefine the location of the attributes and uniforms.
  const glCtx = gl.context();

  // We need to select the program. In GL we can only do one thing at a time so we need to set it
  glCtx.useProgram(shaderProgram);
  const aPositionLoc = glCtx.getAttribLocation(shaderProgram, "a_position");
  const uPointSizeLoc = glCtx.getUniformLocation(shaderProgram, "uPointSize");
  const uPointColorLoc = glCtx.getUniformLocation(shaderProgram, "uPointColor");
  glCtx.useProgram(null); // Reset the current active selected program.

  // 5. Setup the data buffer
  // All positions values are between -1 and +1
  const aryVerts = new Float32Array([0, 0, 0, 0.5, 0.5, 0]);

  // This creates a buffer on the GPU (?) and returns an ID.
  const bufVerts = glCtx.createBuffer();

  // We select the buffer we just created with GL.
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, bufVerts);

  // We tell the pass aryVerts to the GPU. STATIC_DRAW means the
  // data will not change.
  glCtx.bufferData(glCtx.ARRAY_BUFFER, aryVerts, glCtx.STATIC_DRAW);

  // We unbind the current selected array buffer.
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, null);

  // 6. Setup for drawing

  // Activate the shader program.
  glCtx.useProgram(shaderProgram);

  // Set the data uPointSize based on its location
  glCtx.uniform1f(uPointSizeLoc, 50.0);
  glCtx.uniform1fv(uPointColorLoc, new Float32Array([1.0, 1.0, 0.0, 1.0]));

  // The below is how it is done without VAO (maybe covered in the future)
  // Select the bufVerts again.
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, bufVerts);

  // Enable the poisition attribute in the shader (??)
  glCtx.enableVertexAttribArray(aPositionLoc);

  // Tells GL to pull data from the (active?) buffer for the a_positions attribute
  // Tells GL to pull 3 floats a time according to the stride and offset.
  // Binds the currently selected buffer to the shader attribute.
  glCtx.vertexAttribPointer(aPositionLoc, 3, glCtx.FLOAT, false, 0, 0);

  // Cleanup the current buffer
  glCtx.bindBuffer(glCtx.ARRAY_BUFFER, null);

  // Draw the array as points.
  glCtx.drawArrays(glCtx.POINTS, 0, aryVerts.length / 3);
}

main();
