import { Line, Point, Polyline } from "@/index.js";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const { width, height } = canvas;
const buffer = Math.hypot(width, height) * 0.05;

function getRandomNumber(min: number, max: number): number {
  const randomDecimal = Math.random();
  const randomNumber = Math.floor(randomDecimal * (max - min + 1)) + min;
  return randomNumber;
}

function randomPoint(): Point {
  const x = getRandomNumber(buffer, width - buffer);
  const y = getRandomNumber(buffer, height - buffer);
  return new Point(x, y);
}

function randomPointNearPolyline(pl: Polyline): Point {
  let pt = randomPoint();
  let i = 0;
  while (!pl.distNode(pt) && i < 30) {
    pt = randomPoint();
    i += 1;
  }
  return pt;
}

let currentPoint = new Point(buffer, buffer);
const points: Point[] = [currentPoint];
const roughNumPoints = 10;

let i = 0;
while (i < 2 * roughNumPoints) {
  const newPoint = new Point(
    currentPoint.x + getRandomNumber(0, width / roughNumPoints),
    currentPoint.y + getRandomNumber(0, height / roughNumPoints)
  );

  if (newPoint.x > width - buffer) break;
  if (newPoint.y > height - buffer) break;
  currentPoint = newPoint;
  points.push(newPoint);
  i++;
}

const pl = new Polyline(points);

pl.draw(ctx);
pl.points.forEach((pt) => pt.draw(ctx, { radius: 2.5 }));

const p1 = randomPointNearPolyline(pl);
const p2 = randomPointNearPolyline(pl);

p1.draw(ctx, { color: "blue" });
p2.draw(ctx, { color: "blue" });

const spliced = pl.splice(p1, p2);
spliced?.draw(ctx, { color: "blue" });
