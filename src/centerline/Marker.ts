import GeoPoint from "../geometry/GeoPoint.js";

export default class Marker extends GeoPoint {
  value: number;

  constructor(x: number, y: number, value: number) {
    super(x, y);
    this.value = value;
  }
}
