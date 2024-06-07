Notes
=====

- In shader we can pick the attribute location.
- Stride: how many data to be buffered into a single attribute from the buffer.
  - This is measured in bytes, not in the number of elements. So float32 is 4 bytes. If 4 element in a stride, the stride would be 4 bytes * 4 elements = 16 bytes.
- Line graph:
  - A, B, B, C, C, D, D, E...

So the general idea with VAO is as follows:

1. Create and link the shader program.
2. Get the attribute locations.
3. Create the VAO
4. Create and bind the buffer from the array (which transfers the data to the GPU?).
5. Then enableVertexAttribArray and vertexAttribPointer to point the buffer to the specific attribute.
6. Set the VAO aside.
7. In rendering, use the program
8. Update the uniforms
9. Call draw elements
10. Unbind the program.

Questions:

- So all the buffer/array sizes should be the same in terms of the count (not necessarily component length), otherwise there could be some undefined behavior if we draw the count to be greater than the available in some of the buffers?


References
==========

- https://www.youtube.com/watch?v=RM-M25UB6Ec&list=PLMinhigDWz6emRKVkVIEAaePW7vtIkaIF&index=6
- https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
