import { mat3, mat4, vec3, vec4 } from "gl-matrix";

export class Transform {
  position: vec3 = new Float32Array([0.0, 0.0, 0.0]); // X, Y, Z position
  scale: vec3 = new Float32Array([1.0, 1.0, 1.0]); // Scale of XYZ
  rotation: vec3 = new Float32Array([0.0, 0.0, 0.0]); // Rotation in rad (RPY?)
  matView: mat4 = mat4.create(); // Cache the results when calling updateMatrix. Affine transformation matrix
  matNormal: mat3 = mat3.create(); // Normals (transformed differently?) This is not a vector???

  forward: vec4 = new Float32Array(4); // Forward vector but the last element is always 1.
  up: vec4 = new Float32Array(4);
  right: vec4 = new Float32Array(4);

  updateMatrix(): mat4 {
    mat4.identity(this.matView);
    mat4.translate(this.matView, this.matView, this.position);
    mat4.rotateX(this.matView, this.matView, this.rotation[0]);
    mat4.rotateZ(this.matView, this.matView, this.rotation[2]);
    mat4.rotateY(this.matView, this.matView, this.rotation[1]);
    mat4.scale(this.matView, this.matView, this.scale);

    mat3.normalFromMat4(this.matNormal, this.matView);

    this.updateDirection();

    return this.matView;
  }

  updateDirection(): void {
    vec4.transformMat4(this.forward, [0, 0, 1, 0], this.matView); // Z
    vec4.transformMat4(this.up, [0, 1, 0, 0], this.matView); // Y
    vec4.transformMat4(this.right, [1, 0, 0, 0], this.matView); // X
  }

  reset() {
    this.position[0] = 0.0;
    this.position[1] = 0.0;
    this.position[2] = 0.0;

    this.scale[0] = 1.0;
    this.scale[1] = 1.0;
    this.scale[2] = 1.0;

    this.rotation[0] = 0.0;
    this.rotation[1] = 0.0;
    this.rotation[2] = 0.0;
  }
}
