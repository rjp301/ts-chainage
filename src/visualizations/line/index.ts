import { Rect, createQuadTree } from "../../quadtree.js";

import GeoPoint from "../../geometry/GeoPoint.js";
import GeoLine from "../../geometry/GeoLine.js";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const { width, height } = canvas;

function getRandomNumber(min: number, max: number): number {
  const randomDecimal = Math.random();
  const randomNumber = Math.floor(randomDecimal * (max - min + 1)) + min;
  return randomNumber;
}

function randomPoint(): GeoPoint {
  const buffer = Math.hypot(width, height) * 0.05;
  const x = getRandomNumber(buffer, width - buffer);
  const y = getRandomNumber(buffer, height - buffer);
  return new GeoPoint(x, y);
}

const ln = new GeoLine(randomPoint(), randomPoint());
ln.draw(ctx);

const pt = randomPoint();
pt.draw(ctx);

const moved = ln.moveNode(pt);
moved.draw(ctx, { color: "green" });
