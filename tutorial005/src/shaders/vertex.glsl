#version 300 es
in vec3 a_position;
in float a_color;

uniform mat4 uPerspective;
uniform mat4 uModelMatrix;
uniform mat4 uCameraMatrix;
uniform mat4 uMainTex;

uniform vec3 uColor[4];

out lowp vec4 color;

void main(void) {
  color = vec4(uColor[int(a_color)], 1.0); // Use the 4th float as the color index.
  gl_Position = uModelMatrix * vec4(a_position, 1.0);
}
