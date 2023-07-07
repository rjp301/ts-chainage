import GeoPoint from "../geometry/GeoPoint.js";
import GeoPolyline from "../geometry/GeoPolyline.js";
import formatKP from "../utils/formatKP.js";

export default class Marker extends GeoPoint {
  value: number;
  projection: number | undefined;

  constructor(x: number, y: number, value: number) {
    super(x, y);
    this.value = value;
  }

  calcProjection(pl: GeoPolyline): Marker {
    this.projection = pl.project(this);
    return this;
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx, { color: "purple", radius: 4 });
    const projection: string =
      this.projection !== undefined
        ? String(Math.round(this.projection * 1000) / 1000)
        : "";

    ctx.font = "12px Courier";
    ctx.fillStyle = "darkgray";
    ctx.fillText(formatKP(this.value), this.x + 5, this.y);
    ctx.fillText(projection, this.x + 5, this.y + 16);
  }
}
