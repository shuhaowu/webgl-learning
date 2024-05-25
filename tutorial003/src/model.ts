import { StandardVAOWrapper } from "./types";

export class Model {
  mesh: StandardVAOWrapper;
  constructor(mesh: StandardVAOWrapper) {
    this.mesh = mesh;
  }

  // Things to do before its time to render.
  preRender() {}
}
