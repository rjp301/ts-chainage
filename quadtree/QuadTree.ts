import QuadRect from "./QuadRect";
import GeoPoint from "../geometry/GeoPoint";

export default class QuadTree {
  boundary: QuadRect;
  capacity: number;
  depth: number;
  points: GeoPoint[];
  divided: boolean;

  nw?: QuadTree;
  ne?: QuadTree;
  sw?: QuadTree;
  se?: QuadTree;

  constructor(boundary: QuadRect, capacity = 4, depth = 0) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.depth = depth;

    this.points = [];
    this.divided = false;
  }

  private subdivide(): void {
    const cy = this.boundary.cx;
    const cx = this.boundary.cy;
    const w = this.boundary.w / 2;
    const h = this.boundary.h / 2;

    const nw = new QuadRect(cx - w / 2, cy + h / 2, w, h);
    const ne = new QuadRect(cx + w / 2, cy + h / 2, w, h);
    const sw = new QuadRect(cx - w / 2, cy - h / 2, w, h);
    const se = new QuadRect(cx + w / 2, cy - h / 2, w, h);

    this.nw = new QuadTree(nw, this.capacity, this.depth + 1);
    this.ne = new QuadTree(ne, this.capacity, this.depth + 1);
    this.sw = new QuadTree(sw, this.capacity, this.depth + 1);
    this.se = new QuadTree(se, this.capacity, this.depth + 1);
    this.divided = true;
  }

  public insert(point: GeoPoint): void {
    if (!this.boundary.contains(point)) return;

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return;
    }

    if (!this.divided) this.subdivide();

    this.nw?.insert(point);
    this.ne?.insert(point);
    this.sw?.insert(point);
    this.se?.insert(point);
  }

  query(boundary: QuadRect, foundPoints: GeoPoint[]): GeoPoint[] {
    if (!this.boundary.intersects(boundary)) return [];

    foundPoints.push(...foundPoints.filter((pt) => boundary.contains(pt)));

    if (this.divided) {
      this.nw?.query(boundary, foundPoints);
      this.ne?.query(boundary, foundPoints);
      this.se?.query(boundary, foundPoints);
      this.sw?.query(boundary, foundPoints);
    }
    return foundPoints;
  }

  private queryCircle(
    boundary: QuadRect,
    center: GeoPoint,
    radius: number,
    foundPoints: GeoPoint[]
  ) {
    if (!this.boundary.intersects(boundary)) return [];

    foundPoints.push(
      ...foundPoints.filter(
        (pt) => boundary.contains(pt) && pt.distOther(center) <= radius
      )
    );

    if (this.divided) {
      this.nw?.queryCircle(boundary, center, radius, foundPoints);
      this.ne?.queryCircle(boundary, center, radius, foundPoints);
      this.se?.queryCircle(boundary, center, radius, foundPoints);
      this.sw?.queryCircle(boundary, center, radius, foundPoints);
    }
    return foundPoints;
  }

  queryRadius(center: GeoPoint, radius: number, foundPoints: GeoPoint[]) {
    const boundary = new QuadRect(
      center.coordinates[0],
      center.coordinates[1],
      radius * 2,
      radius * 2
    );

    return this.queryCircle(boundary, center, radius, foundPoints);
  }
}
