import { createQuadTree, Point } from "@";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const { width, height } = canvas;

function getRandomNumber(min: number, max: number): number {
  const randomDecimal = Math.random();
  const randomNumber = Math.floor(randomDecimal * (max - min + 1)) + min;
  return randomNumber;
}

function randomPoint(): Point {
  const buffer = Math.hypot(width, height) * 0.05;
  const x = getRandomNumber(buffer, width - buffer);
  const y = getRandomNumber(buffer, height - buffer);
  return new Point(x, y);
}

const pts = Array.from({ length: 200 }, randomPoint);

const qtree = createQuadTree(pts);
qtree.draw(ctx);
// console.log(qtree.toString());

const queryCenter = new Point(width / 3, height / 3);
const queryRadius = 50;
queryCenter.draw(ctx, { radius: queryRadius, color: "#abd669" });

const queried = qtree.queryRadius(queryCenter, queryRadius);
// const boundary = new Rect(200, 200, 200, 200)
// boundary.draw(ctx)

// const queried = qtree.query(boundary)
console.log("queried", queried);

pts.forEach((pt: Point) => pt.draw(ctx));
queried.forEach((pt) => pt.draw(ctx, { color: "#598713" }));
