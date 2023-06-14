import { Point } from "geojson";

type GeoPointDrawOptions = {
  color?: string;
  radius?: number;
};

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

  draw(ctx: CanvasRenderingContext2D, options: GeoPointDrawOptions = {}) {
    const radius = options.radius || 2.5;
    const color = options.color || "#d42c2c";
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  }

  toString() {
    return `POINT (${this.coordinates
      .map((coord) => Math.round(coord * 1000) / 1000)
      .join(" ")})`;
  }

  distOther(other: GeoPoint): number {
    const deltaX = this.coordinates[0] - other.coordinates[0];
    const deltaY = this.coordinates[1] - other.coordinates[1];
    return Math.hypot(deltaX, deltaY);
  }
}
