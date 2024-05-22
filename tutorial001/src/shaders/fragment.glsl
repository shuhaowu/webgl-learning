#version 300 es
precision mediump float;

uniform float uPointColor[4];
out vec4 finalColor;

void main(void) {
  finalColor = vec4(uPointColor[0], uPointColor[1], uPointColor[2], uPointColor[3]);
}
