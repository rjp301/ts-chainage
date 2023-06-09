import { LineString } from "geojson";
import GeoPoint from "./GeoPoint";

export default class GeoLine implements LineString {
  type: "LineString";

  p1: GeoPoint;
  p2: GeoPoint;

  constructor(p1: GeoPoint, p2: GeoPoint) {
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

  whichSide(node: GeoPoint): number {
    const d =
      (node.x - this.p1.x) * (this.p2.y - this.p1.y) -
      (node.y - this.p1.y) * (this.p2.x - this.p1.x);

    if (d < 0) return -1;
    if (d > 0) return 1;
    return 0;
  }

  distNode(node: GeoPoint, signed = false): number {
    const { A, B, C } = this.equation_abc();
    const num = Math.abs(A * node.x + B * node.y + C);
    const signedNum = signed ? num * this.whichSide(node) : num;
    const den = Math.hypot(A, B);
    return den === 0 ? 0 : signedNum / den;
  }

  touchingNode(node: GeoPoint): boolean {
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

  moveNode(node: GeoPoint): GeoPoint {
    if (this.touchingNode(node)) return node;

    const { A, B, C } = this.equation_abc();
    const x = (B * (B * node.x - A * node.y) - A * C) / (A * A + B * B);
    const y = (A * (-B * node.x + A * node.y) - B * C) / (A * A + B * B);
    return new GeoPoint(x, y, node.z);
  }

  intersectionOther(other: GeoLine, constrained = true): GeoPoint | undefined {
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

    return new GeoPoint(x, y);
  }
}
