import Point from "../geometry/Point.js"
import Polyline from "../geometry/Polyline.js";
import Centerline from "./Centerline.js";
import Marker from "./Marker.js";

describe("Centerline", () => {
  let CL: Centerline;

  beforeEach(() => {
    const markers = [
      new Marker(1, 1, 10),
      new Marker(2, 2, 20),
      new Marker(3, 3, 30),
      new Marker(4, 4, 40),
      new Marker(5, 5, 50),
      new Marker(6, 6, 60),
      new Marker(7, 7, 70),
      new Marker(8, 8, 80),
      new Marker(9, 9, 90),
      new Marker(10, 10, 100),
    ];
    const line = new Polyline([new Point(1, 1), new Point(10, 10)]);
    CL = new Centerline(line, markers, "test centerline");
  });

  test("reg_chainage @ 20", () => {
    expect(CL.reg_chainages(20)).toStrictEqual([10, 20, 40, 60, 80, 100]);
  });
  test("reg_chainage @ 30", () => {
    expect(CL.reg_chainages(30)).toStrictEqual([10, 30, 60, 90, 100]);
  });
});
