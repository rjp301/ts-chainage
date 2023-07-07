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

  KP_min: number;
  KP_max: number;

  constructor(line: GeoPolyline, markers: Marker[], name = "Unnamed") {
    this.line = line;
    this.markers = markers
      .map((obj) => obj.calcProjection(line))
      .filter((obj) => obj.projection !== undefined)
      .sort((a, b) => a.value - b.value);
    this.name = name;

    this.qTree = createQuadTree(markers);
    this.qRadius = this.line.qRadius;

    this.KP_min = this.markers[0].value;
    this.KP_max = this.markers[this.markers.length - 1].value;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.line.draw(ctx);
    this.markers.forEach((i) => i.draw(ctx));
  }

  find_KP(node: GeoPoint): number | undefined {
    const projection = this.line.project(node);
    if (projection === undefined) return;

    if (projection === 0 && this.markers[0].projection === 0) {
      return this.markers[0].value;
    }

    if (
      projection >= 1 &&
      this.markers[this.markers.length - 1].projection === 1
    ) {
      return this.markers[this.markers.length - 1].value;
    }

    const lowerMarkers = this.markers.filter(
      (i) => i.projection !== undefined && i.projection < projection
    );
    const higherMarkers = this.markers.filter(
      (i) => i.projection !== undefined && i.projection > projection
    );

    let m1: Marker;
    let m2: Marker;

    if (lowerMarkers.length > 0 && higherMarkers.length > 0) {
      m1 = lowerMarkers[lowerMarkers.length - 1];
      m2 = higherMarkers[0];
    } else if (
      (lowerMarkers.length === 0 && higherMarkers.length >= 2) ||
      projection === 0
    ) {
      m1 = higherMarkers[0];
      m2 = higherMarkers[1];
    } else if (
      (lowerMarkers.length >= 2 && higherMarkers.length === 0) ||
      projection === 1
    ) {
      m1 = lowerMarkers[lowerMarkers.length - 2];
      m2 = lowerMarkers[lowerMarkers.length - 1];
    } else {
      return;
    }

    const valueDelta = m2.value - m1.value;
    const projectionDelta = m2.projection! - m1.projection!;
    return (
      m1.value + ((projection - m1.projection!) * valueDelta) / projectionDelta
    );

    // const getLower = (i: Marker) =>
    //   i.projection !== undefined && i.projection < projection;

    // const getHigher = (i: Marker) =>
    //   i.projection !== undefined && i.projection >= projection;

    // const lowerElements = this.markers.filter(getLower);
    // const higherElements = this.markers.filter(getHigher);

    // const compareProximity = (a: Marker, b: Marker) => {
    //   const distanceA = Math.abs(a.projection - projection);
    //   const distanceB = Math.abs(b.projection - projection);
    //   return distanceA - distanceB;
    // };

    // const compareProjection = (a: Marker, b: Marker) =>
    //   a.projection - b.projection;

    // const twoClosest = this.markers
    //   .slice()
    //   .sort(compareProximity)
    //   .slice(0, 2)
    //   .sort(compareProjection);

    // console.log(projection)
    // console.log(twoClosest.map(i => i.projection))

    // const m1 = twoClosest[0];
    // const m2 = twoClosest[1];

    // const valueDelta = m2.value - m1.value;
    // const projectionDelta = m2.projection - m1.projection;
    // return (
    //   m1.value + ((projection - m1.projection) * valueDelta) / projectionDelta
    // );

    // const nearbyMarkers = this.qTree.queryRadius(node, this.qRadius);
    // const nearest = node.nearest(nearbyMarkers) as Marker | undefined;

    // if (!nearest) return;

    // const k1 = nearest.value;
    // const p1 = this.line.project(nearest);
    // const p = this.line.project(node);

    // if (!p1 || !p) return;

    // const nearest_i = this.markers.map((i) => i.value).indexOf(nearest.value);
    // const next_marker_i = p > p1 ? nearest_i + 1 : nearest_i - 1;
    // const next_marker = this.markers[next_marker_i];

    // const k2 = next_marker.value;
    // const p2 = this.line.project(next_marker);

    // return k1 + ((p - p1) * (k2 - k1)) / (p2 - p1);
  }

  from_KP(KP: number): GeoPoint | undefined {
    if (KP > this.KP_max || KP < this.KP_min) {
      console.log(`from_KP: ${KP} is out of scope of ${this}`);
      return;
    }

    const sortedMarkers = this.markers
      .slice()
      .sort((a, b) => Math.abs(a.value - KP - (b.value - KP)));

    const m1 = sortedMarkers[0];
    const m2 = sortedMarkers[1];

    const k1 = m1.value;
    const k2 = m2.value;

    if (k1 === KP || k2 === KP) return new GeoPoint(m1.x, m1.y);

    const p1 = this.line.project(m1);
    const p2 = this.line.project(m2);

    const p = p1 + ((KP - k1) * (p2 - p1)) / (k2 - k1);
    return this.line.interpolate(p);
  }

  splice_KP(KP_beg: number, KP_end: number): GeoPolyline | undefined {
    const KP_beg_verified = Math.max(Math.min(KP_beg, KP_end), this.KP_min);
    const KP_end_verified = Math.min(Math.max(KP_beg, KP_end), this.KP_max);

    const pt_beg = this.from_KP(KP_beg_verified);
    const pt_end = this.from_KP(KP_end_verified);

    if (!pt_beg || !pt_end) return;
    return this.line.splice(pt_beg, pt_end);
  }

  reg_chainages(divisor: number): number[] {
    const chainages = [];

    const round_up = (num: number, divisor: number): number =>
      num + divisor - (num % divisor);
    const round_down = (num: number, divisor: number): number =>
      num - (num % divisor);

    const KP_beg = round_up(this.KP_min, divisor);
    const KP_end = round_down(this.KP_max, divisor);

    if (this.KP_min < KP_beg) chainages.push(this.KP_min);

    let i = KP_beg;
    while (i <= KP_end) {
      chainages.push(i);
      i += divisor;
    }
    if (this.KP_max > KP_end) chainages.push(this.KP_max);
    return chainages;
  }
}
