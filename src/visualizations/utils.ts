import Marker from "../centerline/Marker.js";
import GeoPoint from "../geometry/GeoPoint.js";
import GeoPolyline from "../geometry/GeoPolyline.js";

export function calcBuffer(canvas: HTMLCanvasElement): number {
  return Math.hypot(canvas.width, canvas.height) * 0.05;
}

export function getRandomNumber(min: number, max: number): number {
  const randomDecimal = Math.random();
  const randomNumber = Math.floor(randomDecimal * (max - min + 1)) + min;
  return randomNumber;
}

export function randomPoint(canvas: HTMLCanvasElement): GeoPoint {
  const { height, width } = canvas;
  const buffer = calcBuffer(canvas);

  const x = getRandomNumber(buffer, width - buffer);
  const y = getRandomNumber(buffer, height - buffer);
  return new GeoPoint(x, y);
}

export function randomPointNearPolyline(
  pl: GeoPolyline,
  canvas: HTMLCanvasElement
): GeoPoint {
  let pt = randomPoint(canvas);
  let i = 0;
  while (!pl.distNode(pt) && i < 30) {
    pt = randomPoint(canvas);
    i += 1;
  }
  return pt;
}

export function createPolyline(
  canvas: HTMLCanvasElement,
  roughNumPoints = 10
): GeoPolyline {
  const { height, width } = canvas;
  const buffer = calcBuffer(canvas);

  let currentPoint = new GeoPoint(buffer, buffer);
  const points: GeoPoint[] = [currentPoint];

  let i = 0;
  while (i < 2 * roughNumPoints) {
    const newPoint = new GeoPoint(
      currentPoint.x + getRandomNumber(0, width / roughNumPoints),
      currentPoint.y + getRandomNumber(0, height / roughNumPoints)
    );

    if (newPoint.x > width - buffer) break;
    if (newPoint.y > height - buffer) break;
    currentPoint = newPoint;
    points.push(newPoint);
    i++;
  }

  return new GeoPolyline(points);
}

export function createMarkers(pl: GeoPolyline, numMarkers = 10): Marker[] {
  const spacing = (Math.trunc(pl.length / (numMarkers - 1)) / pl.length) * 1.05;
  const markers: Marker[] = [];
  for (let i = 0; i < numMarkers; i++) {
    const pt = pl.interpolate(i * spacing);
    const value = pl.length * i * spacing * getRandomNumber(0.99, 1.01);
    markers.push(new Marker(pt.x, pt.y, value));
  }
  return markers.sort(
    (a, b) => pl.project(a.toPoint())! - pl.project(b.toPoint())!
  );
}
