import GeoPoint from "../geometry/GeoPoint.js";
import formatKP from "../utils/formatKP.js";

export default class Marker extends GeoPoint {
  value: number;

  constructor(x: number, y: number, value: number) {
    super(x, y);
    this.value = value;
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx, { color: "purple", radius: 4 });
    ctx.font = "12px Courier";
    ctx.fillStyle = "darkgray";
    ctx.fillText(formatKP(this.value), this.x + 5, this.y);
  }
}
