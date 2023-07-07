import Centerline from "../../centerline/Centerline.js";
import GeoPoint from "../../geometry/GeoPoint.js";
import formatKP from "../../utils/formatKP.js";
import { createMarkers, createPolyline, getRandomNumber } from "../utils.js";

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

const pl = createPolyline(canvas);
const markers = createMarkers(pl);
const CL = new Centerline(pl, markers);

function drawLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  pl.draw(ctx);
  // pl.points.forEach((pt) => pt.draw(ctx, { radius: 2.5 }));

  CL.draw(ctx);

  const mousePoint = new GeoPoint(mousePosition.x, mousePosition.y);
  const movedPoint = pl.moveNode(mousePoint);

  mousePoint.draw(ctx, { color: "green" });
  movedPoint.draw(ctx, { color: "blue" });

  // const chainage = CL.find_KP(mousePoint);
  const projected = pl.project(mousePoint);

  if (projected !== undefined) {
    ctx.font = "12px Courier";
    ctx.fillStyle = "darkgray";
    ctx.fillText(projected.toString(), 10, 16);
  }

  requestAnimationFrame(drawLoop);
}

drawLoop();
