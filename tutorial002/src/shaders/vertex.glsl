#version 300 es
in vec3 a_position;

uniform float uPointSize;
uniform float uAngle;

void main(void) {
  gl_PointSize = uPointSize;
  gl_Position = vec4(
    cos(uAngle) * 0.8 + a_position.x,  // Remember webGL coordiante is from -1 to 1 which is why we use 0.8*cos
    sin(uAngle) * 0.8 + a_position.y,
    a_position.z,
    1.0
  );
}
