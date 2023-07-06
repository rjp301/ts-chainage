import GeoPoint from "../geometry/GeoPoint.js";
import GeoPolyline from "../geometry/GeoPolyline.js";
import { QuadTree, createQuadTree } from "../quadtree.js";
import Marker from "./Marker.js";

export default class Centerline {
  line: GeoPolyline;
  markers: Marker[];
  name: string;
  qTree: QuadTree;
  qRadius: number;

  constructor(line: GeoPolyline, markers: Marker[], name = "Unnamed") {
    this.line = line;
    this.markers = markers.sort((a, b) => a.value - b.value);
    this.name = name;

    this.qTree = createQuadTree(markers);
    this.qRadius = this.line.qRadius;
  }

  find_KP(node: GeoPoint): number | undefined {
    const nearbyMarkers = this.qTree.queryRadius(node, this.qRadius);
    const nearest = node.nearest(nearbyMarkers) as Marker | undefined;

    if (nearest == undefined) {
      console.log("find_KP: node is not in proximity to any markers");
      return undefined;
    }

    const k1 = nearest.value;
    const p1 = this.line.project(nearest);
    const p = this.line.project(node);

    const nearest_i = this.markers.map((i) => i.value).indexOf(nearest.value);
    const next_marker_i = p > p1 ? nearest_i + 1 : nearest_i - 1;
    const next_marker = this.markers[next_marker_i];

    const k2 = next_marker.value;
    const p2 = this.line.project(next_marker);

    return k1 + ((p - p1) * (k2 - k1)) / (p2 - p1);
  }

  from_KP(KP: number): GeoPoint | undefined {
    
  }
}
