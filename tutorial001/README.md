Notes
=====

- Vertex shader: handles each vertex in the vertex array.
- Fragment shader: handles how to interpolate between vertices?
- uniform: Global variables for shader. These are the same for every frame.
- attributes: These are pointers to data, many of which are arrays of floats.
  The GPU will buffer N number of floats at time. For example, we created the
  `a_positions` which is a `vec3`. This means GPU will buffer 3 floats a time.
  Every 3 floats will result in a shader call.
- To get WebGL working, we need to:
  - Create a WebGL context
  - Write vertex and fragment shader programs
  - Compile these shader sources into WebGLShader
  - Link the shader into a program
- In GL, we must select the active program to be able to do things like get the
  attribute and uniform locations. Best to set it to null after getting the
  locations.
  - Same thing with the current buffer.
- GL tries to be resolution independent so all positions are between -1 and 1.

References
==========

- https://www.youtube.com/watch?v=J9NC6Zf2uk4&list=PLMinhigDWz6emRKVkVIEAaePW7vtIkaIF&index=2
