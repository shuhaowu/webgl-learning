import { App } from "./App";
import "./style.css";

const canvas = document.getElementById("glcanvas");
if (canvas == undefined) {
  throw new Error("must define #glcanvas");
}

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("#glcanvas must be a <canvas>");
}

const perfSpan = document.getElementById("perf");
if (perfSpan == undefined) {
  throw new Error("must define perf");
}

const app = new App(canvas, perfSpan);
app.start();
