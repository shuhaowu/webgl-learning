import { mat4, vec3 } from "gl-matrix";
import { GL } from "./GL";

const FOV = (60 * Math.PI) / 180;
const NEAR = 0.1;
const FAR = 100;

export class Camera {
  #position: vec3 = new Float32Array([0, 0, 1]);

  // This is looking down from Z towards X and Y with Y being up?
  #forward: vec3 = new Float32Array([0, 0, -1]);
  #up: vec3 = new Float32Array([0, 1, 0]);
  #right: vec3 = new Float32Array(3);

  #viewMat: mat4 = new Float32Array(16); // This is the matrix that transforms all world coordinate into view coordinates.
  #perspectiveMat: mat4 = new Float32Array(16);

  constructor(aspect: number) {
    vec3.cross(this.#right, this.#forward, this.#up);
    this.updatePerspectiveMatrix(aspect);
  }

  moveForward(delta: number): void {
    this.#position[0] += delta * this.#forward[0];
    this.#position[1] += delta * this.#forward[1];
    this.#position[2] += delta * this.#forward[2];
  }

  moveUp(delta: number): void {
    this.#position[0] += delta * this.#up[0];
    this.#position[1] += delta * this.#up[1];
    this.#position[2] += delta * this.#up[2];
  }

  moveRight(delta: number): void {
    this.#position[0] += delta * this.#right[0];
    this.#position[1] += delta * this.#right[1];
    this.#position[2] += delta * this.#right[2];
  }

  updateViewMatrix(): Readonly<mat4> {
    // A bit of inefficiency here as look at just needs to calculate the
    // forward, up, and right vector anyway, but quaternions is probably a
    // better idea anyway.
    //
    // TODO: eliminate this allocation and simply calculate with matrix math with existing vectors.
    const target: vec3 = new Float32Array(3);
    vec3.add(target, this.#position, this.#forward);

    // lookAt creates a matrix that transforms all world coordinates into the view space coordinates.
    mat4.lookAt(this.#viewMat, this.#position, target, this.#up);
    return this.#viewMat;
  }

  updatePerspectiveMatrix(aspect: number): void {
    mat4.perspective(this.#perspectiveMat, FOV, aspect, NEAR, FAR);
  }

  viewMatrix(): Readonly<mat4> {
    return this.#viewMat;
  }

  perspectiveMatrix(): Readonly<mat4> {
    return this.#perspectiveMat;
  }

  position(): Readonly<vec3> {
    return this.#position;
  }
}

type ControlMode = "pan" | "arcball";

export class CameraController {
  #canvas: HTMLCanvasElement;
  #camera: Camera;

  #mode: ControlMode = "pan";

  // These are the 2D offset X and Y coordinates from the canvas.
  #prevX: number = 0;
  #prevY: number = 0;

  #panRate: number = 0.001;

  #boundOnMouseDown: (ev: MouseEvent) => void;
  #boundOnMouseMove: (ev: MouseEvent) => void;
  #boundOnMouseUp: (ev: MouseEvent) => void;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.#canvas = canvas;
    this.#camera = camera;

    this.#boundOnMouseDown = this.#onMouseDown.bind(this);
    this.#boundOnMouseMove = this.#onMouseMove.bind(this);
    this.#boundOnMouseUp = this.#onMouseUp.bind(this);

    this.#canvas.addEventListener("mousedown", this.#boundOnMouseDown);
  }

  #onMouseDown(ev: MouseEvent): void {
    this.#prevX = ev.offsetX;
    this.#prevY = ev.offsetY;

    this.#canvas.addEventListener("mouseup", this.#boundOnMouseUp, true);
    this.#canvas.addEventListener("mousemove", this.#boundOnMouseMove, true);
  }

  #onMouseMove(ev: MouseEvent): void {
    // offsetX is offset from the top left corner of the element. +x is to the right, +y is down.
    const x = ev.offsetX;
    const y = ev.offsetY;

    const dx = x - this.#prevX;
    const dy = y - this.#prevY;

    switch (this.#mode) {
      case "pan":
        this.#pan(dx, dy);
        break;
      case "arcball":
        break;
      default: {
        const notAllowedMode: never = this.#mode;
        throw new Error(`programming error: ${notAllowedMode} not allowed`);
      }
    }

    this.#prevX = x;
    this.#prevY = y;
  }

  #onMouseUp(_ev: MouseEvent): void {
    this.#canvas.removeEventListener("mouseup", this.#boundOnMouseDown, true);
    this.#canvas.removeEventListener("mousemove", this.#boundOnMouseMove, true);
  }

  #pan(dx: number, dy: number): void {
    this.#camera.moveUp(dy * this.#panRate);
    this.#camera.moveRight(-dx * this.#panRate);
  }
}
