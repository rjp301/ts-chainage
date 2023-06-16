import { LineString } from "geojson";
import GeoPoint from "./GeoPoint.js";
import { QuadTree, createQuadTree } from "../quadtree.js";
import GeoLine from "./GeoLine.js";

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
}
