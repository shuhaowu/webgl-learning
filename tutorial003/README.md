Notes
=====

- **Attributes**: all the arrays uploaded to the GPU shows up here.
  - In WebGL 2 it is an `in`.
  - These are the buffers we are creating so far and is called Vector Buffer Objects (VBO).
  - All attributes are just VBOs.
  - Most of these buffers should be static.
    - Unless you have some advanced stuff like procedurally generated meshes or something like that.
    - Or maybe you have UI and therefore the data is going to change for every frame.
    - Or maybe there are data you're visualizing that can be changing.
- **Uniforms**: They are basically global variables you can set per frame, or whenever you want to change it for the shaders.
  - These can change whenever. They are supposed to change.
- **Varying**: variables set up in the vertex shader that will be passed to the fragment shader.
  - In WebGL 2 it is declared as `out`.
  - Any value you set will be interpolated between each vertex.
    - If one vertex is 1 and another vertex is 10. The fragment shader will interpolate between 1 to 10 between two vertex.
      - Question: How does it interpolate? XYZ, along the vertex edge?
  - You have to declare an identical variable as an `in` variable in the fragment shader.
- Vertex shader:
  - Always need to set `gl_Position`. This is like the output variable for the shader.
    - In 3D we need to do matrix
  - There are also different variables that can be set that have different purposes.
- Fragment shader:
  - Where all the pixels are colored.
  - Between vertex and fragment shader there are other steps that rasterizes the
    positions. The fragment shader is then used to choose the color for the pixel
    automatically generated between groups of vertices.
  - You can potentially doing lighting, textures, color blending, etc, here.
  - Global variable `gl_FragColor` is removed in WebGL2.
    - Instead you need to declare a `out` variable because in OpenGL3 it can set a group color.
    - If you set a single output vec4 variable with whatever variable name, then that is the color.
      - Alpha doesn't matter unless blending mode is active.
  - We need to set the default precision floating in fragment shader.
    - In vertex shader it is default to high precision float.
      - High precision is better for position data, especially since you're stuck between -1 and 1.
      - Medium precision is better for textures.
      - Low precision is fine for colors.
- If uniform/varying are not used, they are optimized out and getting the location from WebGL will result in -1 or undefined.
- Vec4 can be accessed via either `.x`. `.y`, `.z`, `.w` OR `.r`, `.g`, `.b`, `.a`.
- All 3D models exists on the origin. The vertex shader's responsibility is to
  move it to the right place in the 3D world.
- VAO: Vectory Array Objects
  - Allow you to preset all the attributes and buffers in one time to avoid a bunch of getting attribute location, activating, the sending buffers, etc.
  - On different hardware, you can only have a limited number of attributes. However, usually you need only three which is good enough for most stuff.
    - Position buffer: the vertex position
    - Normal: the direction vertex is pointing
    - UV: Position in the texture the vertex is at (like the ij on the texture?)
    - Index buffer (elementArrayBuffer): synchronizes all the buffers together ??
  - Previously, we got the location from the variable name. Now we predefine a location, and bind the variable to that location
    - If a variable is not used, it will not be bound and the location we get from OpenGL will be -1. So maybe worth while to do a double check.
- Mesh data: shared across the modals.
  - Modals manages the transform information.
  - We might have 1 tree mesh, but 1000 tree models which translates, scale, and rotate the mesh.

References
==========

- https://www.youtube.com/watch?v=4moYLTZkYgA&list=PLMinhigDWz6emRKVkVIEAaePW7vtIkaIF
- https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
