import { LineString } from "geojson";
import GeoPoint from "./GeoPoint";
import { QuadTree, createQuadTree } from "../quadtree";

export default class GeoPolyline implements LineString {
  type: "LineString";

  points: GeoPoint[];
  qtree: QuadTree;

  constructor(points: GeoPoint[]) {
    this.type = "LineString";
    this.points = points;
    this.qtree = createQuadTree(points);
  }

  get coordinates(): number[][] {
    return this.points.map((pt) => pt.coordinates);
  }

  

}
