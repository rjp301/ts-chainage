import GeoPoint from "../../geometry/GeoPoint.js";
import GeoPolyline from "../../geometry/GeoPolyline.js";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const { width, height } = canvas;
const buffer = Math.hypot(width, height) * 0.05;

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
pl.draw(ctx);

const pt = randomPoint();
pt.draw(ctx);

const moved = pl.moveNode(pt);
moved.draw(ctx, { color: "blue" });

const touching = pl.nearestSegment(pt);
touching?.draw(ctx, { color: "blue" });
