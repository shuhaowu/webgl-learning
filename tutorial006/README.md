Notes
=====

- Camera in OpenGL actually transforms the entire world and the camera is fixed.
- When culling is enabled, triangles with vertices in the counter-clockwise
  order are taken as front facing. Clockwise vertices are taken as back facing
  and thus will not be drawn when culling is enabled.
- Using fragment shader, quads, and uv indices, it will be easy to draw in a
  rectangle despite that the quad is rendered via triangles.
- UV indices are basically custom indices that we can put on the vertices which
  allows for easier drawing with textures (?)
  - By emitting the UV to the fragment shader, the UV values gets automatically
    interpolated.
  - It kind of allow you to tie multiple triangles into a single geometry.
  - Does the fragment shader fire twice for some pixels because they are on
    both triangles of a quad?
  - Texture coordinates start at 0, 0 in UV coordinate on the bottom left
- Do not want to draw one quad per draw call. Need to draw multiple.
  - Instead, create a single mesh with hundreds or thousands of quads in it.
    However, this means the math for the vertices has to be done in the CPU.
- Textures should be in a power of 2.
- Can pass UV indices from 0.6 -> 0.8 for a small section of the texture.

Things to do next:

- Tutorial 6: Camera
  - Implement camera controls with pan/zoom/orbit etc.
  - Need to make the canvas "full screen".
  - Start to create multiple shaders: one for the grid shader for example
- Tutorial 7: Quads
  - Specify the vertices in vertex arrays and then draw with indices so
    vertices do not get repeated in memory.
  - The triangle vertices should be drawn in counter clockwise order. This way
    when culling is enabled, triangles that are front facing will not be culled
  - Setup culling and depth test.
  - Mesh wrapper needs to have attributes for doCulling and doBlending
    - Based on these attributes, we can set GL modes when drawing them
    - However, this is not performant. Objects that should be culled should be
      drawn together in one giant batch.
  - Mesh wrapper should be reused for multiple models.
  - Setup UV attributes to be sent to the GPU.
- Tutorial 8: Textures
  - General way to load and cache textures so it can be passed to specific
    shader.
  - Shader needs to be updated to setup the texture in the shader.prerender.
    The texture needs to be passed to the shader as an uniform (via an id).
    - The video is not 100% clear here. It says `uniform1i(mainTexture, 0)` but
      what is 0?
    - The fragment shader itself needs to take in a sampler2D uniform
- Tutorial 9: Cube
  - A cube is just 6 quads, one for each face.
  - We now pass the normal vector for each vertex.
  - We pass UV the same as we do for quads in each face.
  - Time can be passed into the vertex shader and based on the value we can do
    some animations by transforming the gl coordinate positions

Question:

- Is it better to send multiple buffers or better to use stride and offset to
  pass multiple attributes?
  - https://stackoverflow.com/questions/35756541/multiple-buffers-vs-single-buffer
  - If data is all static or all volatile, then interleave is better.
  - If one attribute needs to be periodically re-uploaded to the GPU, then
    it would be better.
- Need to look up UV texture coordinates standard in WebGL and OpenGL
- What is a mipmap and when do I need it?
- What is an active shader per texture?

Need a bit more refactoring for modeling:

1. A shader is a program and it has associated attributes, buffers, and uniforms.
2. A shader needs the buffers (the mesh) and textures to render.
3. When a mesh/VAO is created, the attribute location from the shader is needed.
4. Multiple instances of the same thing can occur --> Model
5. Camera is global because there's only a single camera (or a limited number of them).

References
==========


- https://www.youtube.com/playlist?list=PLAwxTw4SYaPlaHwnoGxJE7NFhEWRCIyet
