import { LineString } from "geojson";
import GeoPoint from "./GeoPoint.js";
import { QuadTree, createQuadTree } from "../quadtree.js";
import GeoLine from "./GeoLine.js";

type GeoPolylineDrawOptions = {
  color?: string;
  width?: number;
};

export default class GeoPolyline implements LineString {
  type: "LineString";

  points: GeoPoint[];
  segments: GeoLine[];
  qTree: QuadTree;
  qRadius: number;

  constructor(points: GeoPoint[]) {
    this.type = "LineString";
    this.points = points;
    this.qTree = createQuadTree(points);

    const segments: GeoLine[] = [];
    let maxSegmentLength = 0;
    for (let i = 1; i < points.length; i++) {
      const segment = new GeoLine(points[i - 1], points[i]);
      maxSegmentLength = Math.max(maxSegmentLength, segment.length);
      segments.push(segment);
    }
    this.segments = segments;
    this.qRadius = maxSegmentLength * 1.01;
  }

  get coordinates(): number[][] {
    return this.points.map((pt) => pt.coordinates);
  }

  get length(): number {
    return this.segments.reduce((acc, val) => acc + val.length, 0);
  }

  toString() {
    const roundValue = (val: number) => Math.round(val * 1000) / 1000;
    return `LINESTRING (${this.coordinates
      .map((coord) => coord.map(roundValue).join(" "))
      .join(", ")})`;
  }

  draw(ctx: CanvasRenderingContext2D, options: GeoPolylineDrawOptions = {}) {
    const width = options.width || 2;
    const color = options.color || "crimson";

    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;

    for (let i = 1; i < this.points.length; i++) {
      const p1 = this.points[i - 1];
      const p2 = this.points[i];
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }

    ctx.stroke();
    ctx.closePath();
  }

  // not implemented
  private project(node: GeoPoint): number {
    // moves node to closest point on polyline
    // return distance from start of polyline to moved point as percentage of length
    return;
  }

  // not implemented
  private interpolate(dist: number): GeoPoint {
    // returns points given distance from start of polyine as percentage of length
    return;
  }

  private reversed(): GeoPolyline {
    const points = this.points.reverse();
    return new GeoPolyline(points);
  }

  // not implemented
  private substring(proj1: number, proj2: number): GeoPolyline {
    // returns sub section of polyline from one projection to another
    // result may be reversed if first number is higher than second
    return;
  }

  moveNode(node: GeoPoint) {
    return this.interpolate(this.project(node));
  }

  splice(p1: GeoPoint, p2: GeoPoint): GeoPolyline {
    const p1_proj = this.project(p1);
    const p2_proj = this.project(p2);
    const proj1 = Math.min(p1_proj, p2_proj);
    const proj2 = Math.max(p1_proj, p2_proj);
    return this.substring(proj1, proj2);
  }
}
