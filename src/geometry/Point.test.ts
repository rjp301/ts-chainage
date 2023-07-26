import Point from "./Point.js";

describe("GeoPoint", () => {
  let pt: Point;

  beforeEach(() => {
    pt = new Point(1, 2);
  });

  test("should have correct coordinates", () => {
    expect(pt.coordinates).toEqual([1, 2, 0]);
  });

  test("should convert to string", () => {
    expect(pt.toString()).toBe("POINT (1 2 0)");
  });

  test("should calculate distance to another GeoPoint", () => {
    const otherGeoPoint = new Point(4, 6);
    const distance = pt.distOther(otherGeoPoint);
    expect(distance).toBeCloseTo(5, 2);
  });
});
