import { Centerline, Marker, Line, Point, formatKP, Polyline } from "@chainage";

import {
  calcBuffer,
  createMarkers,
  createPolyline,
  getRandomNumber,
  randomPointNearPolyline,
} from "utils.js";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

let mousePosition = { x: 0, y: 0 };

function handleMouseMove(event: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  mousePosition = { x: mouseX, y: mouseY };
}

canvas.addEventListener("mousemove", handleMouseMove);

const { width, height } = canvas;

const pl = new Polyline([
  new Point(width / 4, height / 4, 10),
  new Point(width / 2.2, height / 2, 20),
  new Point(width / 1.33, height / 1.33, 15),
]);

function drawLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  pl.draw(ctx);

  const mousePoint = new Point(mousePosition.x, mousePosition.y);
  const movedPoint = pl.moveNode(mousePoint);
  const elevation = pl.elevationAtNode(mousePoint);

  movedPoint?.draw(ctx, { color: "blue" });
  mousePoint.draw(ctx);

  if (elevation !== undefined) {
    ctx.font = "12px Courier";
    ctx.fillStyle = "red";
    ctx.fillText(String(elevation), mousePoint.x + 7, mousePoint.y);
  }

  requestAnimationFrame(drawLoop);
}

drawLoop();
