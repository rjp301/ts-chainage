import GeoLine from "../../geometry/GeoLine.js";
import GeoPoint from "../../geometry/GeoPoint.js";
import GeoPolyline from "../../geometry/GeoPolyline.js";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const { width, height } = canvas;
const buffer = Math.hypot(width, height) * 0.05;

let mousePosition = { x: 0, y: 0 };

function handleMouseMove(event: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  mousePosition = { x: mouseX, y: mouseY };
}

canvas.addEventListener("mousemove", handleMouseMove);

function getRandomNumber(min: number, max: number): number {
  const randomDecimal = Math.random();
  const randomNumber = Math.floor(randomDecimal * (max - min + 1)) + min;
  return randomNumber;
}

function randomPoint(): GeoPoint {
  const x = getRandomNumber(buffer, width - buffer);
  const y = getRandomNumber(buffer, height - buffer);
  return new GeoPoint(x, y);
}

function randomPointNearPolyline(pl: GeoPolyline): GeoPoint {
  let pt = randomPoint();
  let i = 0;
  while (!pl.distNode(pt) && i < 30) {
    pt = randomPoint();
    i += 1;
  }
  return pt;
}

let currentPoint = new GeoPoint(buffer, buffer);
const points: GeoPoint[] = [currentPoint];
const roughNumPoints = 10;

let i = 0;
while (i < 2 * roughNumPoints) {
  const newPoint = new GeoPoint(
    currentPoint.x + getRandomNumber(0, width / roughNumPoints),
    currentPoint.y + getRandomNumber(0, height / roughNumPoints)
  );

  if (newPoint.x > width - buffer) break;
  if (newPoint.y > height - buffer) break;
  currentPoint = newPoint;
  points.push(newPoint);
  i++;
}

const pl = new GeoPolyline(points);

const p1 = randomPointNearPolyline(pl);
const p2 = randomPointNearPolyline(pl);
const spliced = pl.splice(p1, p2);


function drawLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  pl.draw(ctx);
  pl.points.forEach((pt) => pt.draw(ctx, { radius: 2.5 }));

  const mousePoint = new GeoPoint(mousePosition.x, mousePosition.y);
  const movedPoint = pl.moveNode(mousePoint);

  mousePoint.draw(ctx, { color: "purple" });
  movedPoint.draw(ctx, { color: "blue" });

  requestAnimationFrame(drawLoop);
}

drawLoop();
