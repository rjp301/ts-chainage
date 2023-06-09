import GeoPoint from "./geometry/GeoPoint";

export class Rect {
  cx: number;
  cy: number;
  w: number;
  h: number;

  west_edge: number;
  east_edge: number;
  north_edge: number;
  south_edge: number;

  constructor(cx: number, cy: number, w: number, h: number) {
    this.cx = cx;
    this.cy = cy;
    this.w = w;
    this.h = h;

    this.west_edge = cx - w / 2;
    this.east_edge = cx + w / 2;
    this.north_edge = cy + h / 2;
    this.south_edge = cy - h / 2;
  }

  toString() {
    return `${this.west_edge} ${this.north_edge} ${this.east_edge} ${this.south_edge}`;
  }

  contains(point: GeoPoint): boolean {
    return (
      point.x >= this.west_edge &&
      point.x < this.east_edge &&
      point.y >= this.south_edge &&
      point.y < this.north_edge
    );
  }

  intersects(other: Rect): boolean {
    return (
      other.west_edge > this.east_edge ||
      other.east_edge < this.west_edge ||
      other.north_edge < this.south_edge ||
      other.south_edge > this.north_edge
    );
  }
}

export class QuadTree {
  boundary: Rect;
  capacity: number;
  depth: number;
  points: GeoPoint[];
  divided: boolean;

  nw?: QuadTree;
  ne?: QuadTree;
  sw?: QuadTree;
  se?: QuadTree;

  constructor(boundary: Rect, capacity = 4, depth = 0) {
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

    const nw = new Rect(cx - w / 2, cy + h / 2, w, h);
    const ne = new Rect(cx + w / 2, cy + h / 2, w, h);
    const sw = new Rect(cx - w / 2, cy - h / 2, w, h);
    const se = new Rect(cx + w / 2, cy - h / 2, w, h);

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

  query(boundary: Rect, foundPoints: GeoPoint[]): GeoPoint[] {
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
    boundary: Rect,
    center: GeoPoint,
    radius: number,
    foundPoints: GeoPoint[]
  ): GeoPoint[] {
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

  queryRadius(
    center: GeoPoint,
    radius: number,
    foundPoints: GeoPoint[]
  ): GeoPoint[] {
    const boundary = new Rect(center.x, center.y, radius * 2, radius * 2);

    return this.queryCircle(boundary, center, radius, foundPoints);
  }
}
