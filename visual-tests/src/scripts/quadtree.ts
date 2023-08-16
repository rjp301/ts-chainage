import { createQuadTree, Point } from "@chainage";
import { randomPoint } from "utils";

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

const pts = Array.from({ length: 200 }, () => randomPoint(canvas));
const qtree = createQuadTree(pts);

function drawLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  qtree.draw(ctx);

  const mousePoint = new Point(mousePosition.x, mousePosition.y);

  const queryRadius = 50;
  mousePoint.draw(ctx, { radius: queryRadius, color: "#abd669" });

  const queried = qtree.queryRadius(mousePoint, queryRadius);

  pts.forEach((pt: Point) => pt.draw(ctx));
  queried.forEach((pt) => pt.draw(ctx, { color: "#598713" }));

  requestAnimationFrame(drawLoop);
}

drawLoop();
