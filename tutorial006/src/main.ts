import { App } from "./App";
import "./style.css";

const canvas = document.getElementById("glcanvas");
if (canvas == undefined) {
  throw new Error("must define #glcanvas");
}

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("#glcanvas must be a <canvas>");
}

const frameTimeDisplay = document.getElementById("frame-time");
if (frameTimeDisplay == undefined) {
  throw new Error("must define frame-time");
}

const app = new App(canvas, frameTimeDisplay);
app.start();
