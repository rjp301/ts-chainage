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
  length: number;

  constructor(points: GeoPoint[]) {
    this.type = "LineString";
    this.points = points;
    this.qTree = createQuadTree(points);

    let length = 0;
    let maxSegmentLength = 0;
    const segments: GeoLine[] = [];

    for (let i = 1; i < points.length; i++) {
      const segment = new GeoLine(points[i - 1], points[i]);
      length += segment.length;
      maxSegmentLength = Math.max(maxSegmentLength, segment.length);
      segments.push(segment);
    }

    this.length = length;
    this.segments = segments;
    this.qRadius = maxSegmentLength * 1.01;
  }

  get coordinates(): number[][] {
    return this.points.map((pt) => pt.coordinates);
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

  nearestVertex(node: GeoPoint): GeoPoint | undefined {
    const points = this.qTree.queryRadius(node, this.qRadius);
    return node.nearest(points);
  }

  moveNode(node: GeoPoint): GeoPoint {
    const nearestVertex = this.nearestVertex(node);
    if (!nearestVertex) return node;

    const nearestVertexDist = nearestVertex.distOther(node);

    const sortedSegments = this.segments
      .slice()
      .sort((a, b) => a.distNode(node) - b.distNode(node));

    for (let segment of sortedSegments) {
      const distance = segment.distNode(node);
      if (distance >= nearestVertexDist) return nearestVertex;

      const movedNode = segment.moveNode(node);
      if (segment.touchingNode(movedNode)) return movedNode;
    }

    return nearestVertex;
  }

  nearestSegment(node: GeoPoint): GeoLine | undefined {
    const movedNode = this.moveNode(node);
    return this.segments.find((seg) => seg.touchingNode(movedNode));
  }

  touchingNode(node: GeoPoint): boolean {
    const segment = this.nearestSegment(node);
    return segment ? segment.touchingNode(node) : false;
  }

  distNode(node: GeoPoint, signed = false): number | undefined {
    const segment = this.nearestSegment(node);
    return segment?.distNode(node, signed);
  }

  interpolate(dist: number): GeoPoint {
    if (dist > 1) return this.points[this.points.length - 1];
    if (dist < 0) return this.points[0];

    let cumulative = 0;
    for (let segment of this.segments) {
      let segmentStep = segment.length / this.length;
      if (cumulative + segmentStep >= dist) {
        const finalInterpolation = (dist - cumulative) / segmentStep;
        console.log("finalInterpolation", finalInterpolation);
        return segment.interpolate(finalInterpolation);
      }
      cumulative += segmentStep;
      console.log("segment step", segmentStep, "cumulative", cumulative);
    }
    console.error("Could not interpolate along the polyline");
    return this.points[0];
  }

  project(node: GeoPoint): number {
    let cumulative = 0;
    for (let segment of this.segments) {
      const segmentStep = segment.length / this.length;
      const projected = segment.project(node);
      if (projected >= 0 && projected <= 1) {
        return cumulative + projected * segmentStep;
      }
      cumulative += segmentStep;
    }
    return cumulative;
  }

  private reversed(): GeoPolyline {
    const points = this.points.reverse();
    return new GeoPolyline(points);
  }

  // // not implemented
  // private substring(proj1: number, proj2: number): GeoPolyline {
  //   // returns sub section of polyline from one projection to another
  //   // result may be reversed if first number is higher than second
  //   return;
  // }

  // splice(p1: GeoPoint, p2: GeoPoint): GeoPolyline {
  //   const p1_proj = this.project(p1);
  //   const p2_proj = this.project(p2);
  //   const proj1 = Math.min(p1_proj, p2_proj);
  //   const proj2 = Math.max(p1_proj, p2_proj);
  //   return this.substring(proj1, proj2);
  // }
}
