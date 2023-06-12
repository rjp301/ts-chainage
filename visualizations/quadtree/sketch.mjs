import { createQuadTree } from "./../../dist/quadtree";

function setup() {
  const width = 600;
  const height = 600;

  createCanvas(600, 600);
  // put setup code here

  let quadTree = createQuadTree([]);
}

function draw() {
  background(220);
  ellipse(50, 50, 80, 80);
  // put drawing code here
}
