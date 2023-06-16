import GeoPoint from "./geometry/GeoPoint.js";
import { describe, test, expect } from "@jest/globals";
import { Rect, QuadTree, findBoundary, createQuadTree } from "./quadtree.js";

describe("Rect", () => {
  test("contains() should return true for a point inside the rectangle", () => {
    const rect = new Rect(0, 0, 10, 10);
    const point = new GeoPoint(4, 4);
    expect(rect.contains(point)).toBe(true);
  });

  test("contains() should return false for a point outside the rectangle", () => {
    const rect = new Rect(0, 0, 10, 10);
    const point = new GeoPoint(15, 15);
    expect(rect.contains(point)).toBe(false);
  });

  test("intersects() should return true for intersecting rectangles", () => {
    const rect1 = new Rect(0, 0, 10, 10);
    const rect2 = new Rect(5, 5, 10, 10);
    expect(rect1.intersects(rect2)).toBe(true);
  });

  test("intersects() should return false for non-intersecting rectangles", () => {
    const rect1 = new Rect(0, 0, 10, 10);
    const rect2 = new Rect(15, 15, 10, 10);
    expect(rect1.intersects(rect2)).toBe(false);
  });
});

describe.skip("QuadTree", () => {
  let quadTree: QuadTree;

  let p1 = new GeoPoint(1, 1);
  let p2 = new GeoPoint(2, 2);
  let p3 = new GeoPoint(3, 3);
  let p4 = new GeoPoint(4, 4);
  let p5 = new GeoPoint(5, 5);

  beforeEach(() => {
    const points = [p1, p2, p3, p4, p5];
    quadTree = createQuadTree(points);
  });

  // test("insert() should add points to the quadtree", () => {
  //   const newPoint = new GeoPoint(6, 6);
  //   quadTree.insert(newPoint);
  //   expect(quadTree.points).toContain(newPoint);
  // });

  test("query() should return points within the boundary", () => {
    const boundary = new Rect(0, 0, 1.5, 1.5);
    const foundPoints = quadTree.query(boundary);
    expect(foundPoints.length).toBe(1);
    expect(foundPoints).toEqual([p2, p3, p4]);
  });

  // test("queryRadius() should return points within the given radius from the center", () => {
  //   const center = new GeoPoint(3, 3);
  //   const radius = 2;
  //   const foundPoints = quadTree.queryRadius(center, radius, []);
  //   expect(foundPoints.length).toBe(3);
  //   expect(foundPoints).toEqual([
  //     new GeoPoint(2, 2),
  //     new GeoPoint(3, 3),
  //     new GeoPoint(4, 4),
  //   ]);
  // });
});

// describe("findBoundary", () => {
//   test("findBoundary() should return the bounding rectangle for a set of points", () => {
//     const points = [
//       new GeoPoint(1, 1),
//       new GeoPoint(2, 2),
//       new GeoPoint(3, 3),
//       new GeoPoint(4, 4),
//       new GeoPoint(5, 5),
//     ];
//   });
// });
