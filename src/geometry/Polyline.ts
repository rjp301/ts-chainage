import { LineString as geoLineString } from "geojson";
import Point from "./Point.js";
import { QuadTree, createQuadTree } from "./QuadTree.js";
import Line from "./Line.js";

type DrawOptions = {
  color?: string;
  width?: number;
};

export default class Polyline implements geoLineString {
  type: "LineString";

  points: Point[];
  segments: Line[];
  qTree: QuadTree;
  qRadius: number;
  length: number;

  constructor(points: Point[]) {
    this.type = "LineString";
    this.points = points;
    this.qTree = createQuadTree(points);

    let length = 0;
    let maxSegmentLength = 0;
    const segments: Line[] = [];

    for (let i = 1; i < points.length; i++) {
      const segment = new Line(points[i - 1], points[i]);
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

  draw(ctx: CanvasRenderingContext2D, options: DrawOptions = {}) {
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

  nearestVertex(node: Point): Point | undefined {
    const points = this.qTree.queryRadius(node, this.qRadius);
    return node.nearest(points);
  }

  moveNode(node: Point): Point | undefined {
    const nearestVertex = this.nearestVertex(node);
    if (!nearestVertex) return;

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

  nearestSegment(node: Point): Line | undefined {
    const movedNode = this.moveNode(node);
    if (!movedNode) return;
    return this.segments.find((seg) => seg.touchingNode(movedNode));
  }

  touchingNode(node: Point): boolean {
    const segment = this.nearestSegment(node);
    return segment ? segment.touchingNode(node) : false;
  }

  distNode(node: Point, signed = false): number | undefined {
    const segment = this.nearestSegment(node);
    return segment?.distNode(node, signed);
  }

  interpolate(dist: number): Point {
    if (dist > 1) return this.points[this.points.length - 1];
    if (dist < 0) return this.points[0];

    let cumulative = 0;
    for (let segment of this.segments) {
      let segmentStep = segment.length / this.length;
      if (cumulative + segmentStep >= dist) {
        const finalInterpolation = (dist - cumulative) / segmentStep;
        // console.log("finalInterpolation", finalInterpolation);
        return segment.interpolate(finalInterpolation);
      }
      cumulative += segmentStep;
      // console.log("segment step", segmentStep, "cumulative", cumulative);
    }
    console.error("Could not interpolate along the polyline");
    return this.points[0];
  }

  project(node: Point): number | undefined {
    const movedNode = this.moveNode(node);
    if (!movedNode) return;

    let cumulative = 0;
    for (let segment of this.segments) {
      const segmentStep = segment.length / this.length;
      if (segment.touchingNode(movedNode)) {
        const projected = segment.project(node);
        return cumulative + projected * segmentStep;
      }
      cumulative += segmentStep;
    }
    return cumulative;
  }

  private reversed(): Polyline {
    const points = this.points.reverse();
    return new Polyline(points);
  }

  splice(p1: Point, p2: Point): Polyline | undefined {
    type info = {
      pt: Point;
      segment: Line;
      index: number;
      moved: Point;
    };

    const p1_segment = this.nearestSegment(p1);
    const p2_segment = this.nearestSegment(p2);
    if (!p1_segment || !p2_segment) return;

    const p1_moved = this.moveNode(p1);
    const p2_moved = this.moveNode(p2);
    if (!p1_moved || !p2_moved) return;

    const p1_index = this.segments.indexOf(p1_segment);
    const p2_index = this.segments.indexOf(p2_segment);
    if (!p1_index || !p2_index) return;

    let p1_info: info = {
      pt: p1,
      segment: p1_segment,
      moved: p1_moved,
      index: p1_index,
    };
    let p2_info: info = {
      pt: p2,
      segment: p2_segment,
      moved: p2_moved,
      index: p2_index,
    };

    if (p1_info.index > p2_info.index) [p1_info, p2_info] = [p2_info, p1_info];

    const vertices: Point[] = [];
    let index = p1_info.index;
    vertices.push(p1_info.moved!);

    while (index < p2_info.index) {
      vertices.push(this.segments[index].p2);
      index += 1;
    }

    vertices.push(p2_info.moved);
    return new Polyline(vertices);
  }
}
