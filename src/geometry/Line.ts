import { LineString as geoLineString } from "geojson";
import Point from "./Point.js";

type GeoLineDrawOptions = {
  color?: string;
  width?: number;
};

export default class Line implements geoLineString {
  type: "LineString";

  p1: Point;
  p2: Point;

  constructor(p1: Point, p2: Point) {
    this.type = "LineString";

    this.p1 = p1;
    this.p2 = p2;
  }

  get coordinates(): number[][] {
    return [this.p1.coordinates, this.p2.coordinates];
  }

  get length() {
    return this.p1.distOther(this.p2);
  }

  toString() {
    const roundValue = (val: number) => Math.round(val * 1000) / 1000;
    return `LINESTRING (${this.coordinates
      .map((coord) => coord.map(roundValue).join(" "))
      .join(", ")})`;
  }

  draw(ctx: CanvasRenderingContext2D, options: GeoLineDrawOptions = {}) {
    const width = options.width || 2;
    const color = options.color || "crimson";

    ctx.beginPath();
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
  }

  private equation_abc() {
    // Ax + By + C = 0
    const A = this.p1.y - this.p2.y;
    const B = this.p2.x - this.p1.x;
    const C = this.p1.x * this.p2.y - this.p2.x * this.p1.y;

    return { A, B, C };
  }

  private equation_mb() {
    // y = mx + b
    const m = (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
    const b = this.p1.y - m * this.p1.x;

    return { m, b };
  }

  whichSide(node: Point): number {
    const d =
      (node.x - this.p1.x) * (this.p2.y - this.p1.y) -
      (node.y - this.p1.y) * (this.p2.x - this.p1.x);

    if (d < 0) return -1;
    if (d > 0) return 1;
    return 0;
  }

  distNode(node: Point, signed = false): number {
    const { A, B, C } = this.equation_abc();
    const num = Math.abs(A * node.x + B * node.y + C);
    const signedNum = signed ? num * this.whichSide(node) : num;
    const den = Math.hypot(A, B);
    return den === 0 ? 0 : signedNum / den;
  }

  touchingNode(node: Point): boolean {
    const cross_product =
      (node.y - this.p1.y) * (this.p2.x - this.p1.x) -
      (node.x - this.p1.x) * (this.p2.y - this.p1.y);
    if (Math.abs(cross_product) > 1e-3) return false;

    const dot_product =
      (node.x - this.p1.x) * (this.p2.x - this.p1.x) +
      (node.y - this.p1.y) * (this.p2.y - this.p1.y);
    if (dot_product < 0) return false;

    const squared_length =
      (this.p2.x - this.p1.x) * (this.p2.x - this.p1.x) +
      (this.p2.y - this.p1.y) * (this.p2.y - this.p1.y);
    if (dot_product > squared_length) return false;

    return true;
  }

  moveNode(node: Point): Point {
    if (this.touchingNode(node)) return node;

    const { A, B, C } = this.equation_abc();
    const x = (B * (B * node.x - A * node.y) - A * C) / (A * A + B * B);
    const y = (A * (-B * node.x + A * node.y) - B * C) / (A * A + B * B);
    return new Point(x, y, node.z);
  }

  intersectionOther(other: Line, constrained = true): Point | undefined {
    const x1 = this.p1.x;
    const x2 = this.p2.x;
    const x3 = other.p1.x;
    const x4 = other.p2.x;

    const y1 = this.p1.y;
    const y2 = this.p2.y;
    const y3 = other.p1.y;
    const y4 = other.p2.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den === 0) return;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / den;

    if ((t > 1 || t < 0) && constrained) return;
    if ((u > 1 || u < 0) && constrained) return;

    const x = this.p1.x + t * (this.p2.x - this.p1.x);
    const y = this.p1.y + t * (this.p2.y - this.p1.y);

    return new Point(x, y);
  }

  interpolate(dist: number): Point {
    if (dist < 0) return this.p1;
    if (dist > 1) return this.p2;

    const x = (1 - dist) * this.p1.x + dist * this.p2.x;
    const y = (1 - dist) * this.p1.y + dist * this.p2.y;
    return new Point(x, y);
  }

  project(node: Point, constrained = true): number {
    const movedNode = this.moveNode(node);

    const dot_product =
      (movedNode.x - this.p1.x) * (this.p2.x - this.p1.x) +
      (movedNode.y - this.p1.y) * (this.p2.y - this.p1.y);
    const sign = dot_product > 0 ? 1 : -1;

    const value = (this.p1.distOther(movedNode) / this.length) * sign;
    if (!constrained) return value;

    return Math.min(Math.max(0, value), 1);
  }
}
