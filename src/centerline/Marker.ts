import Point from "../geometry/Point.js";
import Polyline from "../geometry/Polyline.js";
import formatKP from "../utils/formatKP.js";

export default class Marker extends Point {
  value: number;
  projection: number | undefined;

  constructor(x: number, y: number, value: number) {
    super(x, y);
    this.value = value;
  }

  calcProjection(pl: Polyline): Marker {
    this.projection = pl.project(this);
    return this;
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx, { radius: 4 });
    const projection: string =
      this.projection !== undefined
        ? String(Math.round(this.projection * 1000) / 1000)
        : "";

    ctx.font = "12px Courier";
    ctx.fillStyle = "darkgray";
    ctx.fillText(formatKP(this.value), this.x + 8, this.y + 3);
  }

  toPoint(): Point {
    return new Point(this.x, this.y);
  }
}
