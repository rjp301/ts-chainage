import GeoPoint from "../geometry/GeoPoint";

export default class QuadRect {
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

  contains(point: GeoPoint): Boolean {
    return (
      point.coordinates[0] >= this.west_edge &&
      point.coordinates[0] < this.east_edge &&
      point.coordinates[1] >= this.south_edge &&
      point.coordinates[1] < this.north_edge
    );
  }

  intersects(other: QuadRect) {
    return (
      other.west_edge > this.east_edge ||
      other.east_edge < this.west_edge ||
      other.north_edge < this.south_edge ||
      other.south_edge > this.north_edge
    );
  }
}
