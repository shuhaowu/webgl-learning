import { Camera } from "./Camera";
import { GL } from "./GL";
import { Mesh } from "./Mesh";
import { Shader } from "./Shader";
import { Texture } from "./Texture";
import { Transform } from "./Transform";

export class Model {
  transform: Transform = new Transform();

  gl: GL;
  shader: Shader;
  mesh: Mesh;
  textures: Map<string, Texture>;

  constructor(gl: GL, shader: Shader, mesh: Mesh, textures: Map<string, Texture>) {
    this.gl = gl;
    this.shader = shader;
    this.mesh = mesh;
    this.textures = textures;
  }

  setScale(x: number, y: number, z: number): void {
    this.transform.scale[0] = x;
    this.transform.scale[1] = y;
    this.transform.scale[2] = z;
  }

  setPosition(x: number, y: number, z: number): void {
    this.transform.position[0] = x;
    this.transform.position[1] = y;
    this.transform.position[2] = z;
  }

  setRotation(x: number, y: number, z: number): void {
    this.transform.rotation[0] = x;
    this.transform.rotation[1] = y;
    this.transform.rotation[2] = z;
  }

  addScale(x: number, y: number, z: number): void {
    this.transform.scale[0] += x;
    this.transform.scale[1] += y;
    this.transform.scale[2] += z;
  }

  addPosition(x: number, y: number, z: number): void {
    this.transform.position[0] += x;
    this.transform.position[1] += y;
    this.transform.position[2] += z;
  }

  addRotation(x: number, y: number, z: number): void {
    this.transform.rotation[0] += x;
    this.transform.rotation[1] += y;
    this.transform.rotation[2] += z;
  }

  prerender(): void {}

  draw(camera: Camera): void {
    // Finally compute all the matrix when everything has been done.
    this.transform.updateMatrix();

    // TODO: Rebind textures to the shader.

    this.shader.activate();
    this.shader.setModelMatrix(this.transform.matView);
    this.shader.setCameraMatrix(camera.viewMatrix());
    this.shader.setPerspectiveMatrix(camera.perspectiveMatrix());

    this.gl.bindVertexArray(this.mesh.vao);
    if (this.mesh.indexBuf) {
      this.gl.drawElements(this.mesh.drawMode, this.mesh.vertexCount, this.gl.UNSIGNED_SHORT, 0);
    } else {
      this.gl.drawArrays(this.mesh.drawMode, 0, this.mesh.vertexCount);
    }
    this.gl.bindVertexArray(null);

    this.shader.deactivate();
  }
}
