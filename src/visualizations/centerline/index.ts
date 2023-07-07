import Centerline from "../../centerline/Centerline.js";
import GeoPoint from "../../geometry/GeoPoint.js";
import GeoPolyline from "../../geometry/GeoPolyline.js";
import formatKP from "../../utils/formatKP.js";
import {
  calcBuffer,
  createMarkers,
  createPolyline,
  getRandomNumber,
  randomPointNearPolyline,
} from "../utils.js";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

let mousePosition = { x: 0, y: 0 };

const round3 = (num: number): number => Math.round(num * 1000) / 1000;

function handleMouseMove(event: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  mousePosition = { x: mouseX, y: mouseY };
}

canvas.addEventListener("mousemove", handleMouseMove);

const pl = createPolyline(canvas, 10);
const markers = createMarkers(pl);
const CL = new Centerline(pl, markers);

// PLOT every chainage
const nearPoints: GeoPoint[] = Array(1000)
  .fill(null)
  .map(() => randomPointNearPolyline(pl, canvas));
console.log(nearPoints);

const plotChainage = (pt: GeoPoint): GeoPoint | undefined => {
  const chainage = CL.find_KP(pt);
  const projection = CL.line.project(pt);

  if (chainage === undefined || projection === undefined) return;

  const { height, width } = canvas;
  const x = projection * width * 0.9;
  const y = height - chainage * 0.05 - 20;
  return new GeoPoint(x, y);
};

const plotPoints = nearPoints
  .map(plotChainage)
  .filter((i) => i !== undefined) as GeoPoint[];

const plotPl = new GeoPolyline(plotPoints.sort((a, b) => a.x - b.x));

function drawLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  pl.draw(ctx);
  plotPl.draw(ctx);

  CL.draw(ctx);

  const mousePoint = new GeoPoint(mousePosition.x, mousePosition.y);
  const movedPoint = pl.moveNode(mousePoint);

  mousePoint.draw(ctx, { color: "green" });
  movedPoint?.draw(ctx, { color: "blue" });

  const chainage = CL.find_KP(mousePoint);
  const projected = pl.project(mousePoint);

  ctx.font = "12px Courier";
  ctx.fillStyle = "red";

  if (projected !== undefined)
    ctx.fillText(round3(projected).toString(), mousePoint.x + 7, mousePoint.y);
  if (chainage !== undefined)
    ctx.fillText(formatKP(chainage), mousePoint.x + 7, mousePoint.y + 16);

  requestAnimationFrame(drawLoop);
}

drawLoop();
