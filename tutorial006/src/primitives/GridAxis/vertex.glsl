#version 300 es
in vec3 aPosition;
in float aColor;

uniform mat4 uPerspectiveMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uCameraMatrix;

// 4 colors of the following:
//
// - 0: The grid line colors
// - 1: red for X axis
// - 2: green for Y axis
// - 3: blue for Z axis
uniform vec3 uColor[4];

out lowp vec4 color;

void main(void) {
  color = vec4(uColor[int(aColor)], 1.0); // Use the 4th float as the color index.

  gl_Position = uPerspectiveMatrix * uCameraMatrix * uModelMatrix * vec4(aPosition, 1.0);
}
