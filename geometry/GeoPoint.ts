import { Point } from "geojson";

export default class GeoPoint implements Point {
  type: "Point";
  coordinates: number[];

  constructor(coordinates: number[]) {
    this.type = "Point";
    this.coordinates = coordinates;
  }

  distOther(other: GeoPoint): number {
    const deltaX = this.coordinates[0] - other.coordinates[0];
    const deltaY = this.coordinates[1] - other.coordinates[1];
    return Math.hypot(deltaX, deltaY);
  }
}
