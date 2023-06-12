import { Point } from "geojson";

export default class GeoPoint implements Point {
  type: "Point";

  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z = 0) {
    this.type = "Point";

    this.x = x;
    this.y = y;
    this.z = z;
  }

  get coordinates(): number[] {
    return [this.x, this.y, this.z];
  }

  distOther(other: GeoPoint): number {
    const deltaX = this.coordinates[0] - other.coordinates[0];
    const deltaY = this.coordinates[1] - other.coordinates[1];
    return Math.hypot(deltaX, deltaY);
  }
}
