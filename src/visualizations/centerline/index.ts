import Centerline from "../../centerline/Centerline.js";
import Marker from "../../centerline/Marker.js";
import GeoLine from "../../geometry/GeoLine.js";
import GeoPoint from "../../geometry/GeoPoint.js";
import GeoPolyline from "../../geometry/GeoPolyline.js";
import formatKP from "../../utils/formatKP.js";
import {
  calcBuffer,
  createMarkers,
  createPolyline,
  getRandomNumber,
  randomPointNearPolyline,
} from "../utils.js";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

let mousePosition = { x: 0, y: 0 };

const round3 = (num: number): number => Math.round(num * 1000) / 1000;

function handleMouseMove(event: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  mousePosition = { x: mouseX, y: mouseY };
}

canvas.addEventListener("mousemove", handleMouseMove);

const pl = createPolyline(canvas, 10);
const markers = createMarkers(pl);
const CL = new Centerline(pl, markers);

function drawLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  CL.draw(ctx);

  const mousePoint = new GeoPoint(mousePosition.x, mousePosition.y);
  const movedPoint = pl.moveNode(mousePoint);

  if (movedPoint !== undefined) {
    new GeoLine(mousePoint, movedPoint).draw(ctx, { color: "blue" });
    movedPoint.draw(ctx, { color: "blue" });
  }

  const projection = CL.line.project(mousePoint);
  let chainage;

  if (projection !== undefined) {


    const lowerMarkers = CL.markers.filter(
      (i) => i.projection !== undefined && i.projection < projection
    );
    const higherMarkers = CL.markers.filter(
      (i) => i.projection !== undefined && i.projection > projection
    );
    lowerMarkers.forEach((i) =>
      i.toPoint().draw(ctx, { color: "green", radius: 5 })
    );
    higherMarkers.forEach((i) =>
      i.toPoint().draw(ctx, { color: "darkcyan", radius: 5 })
    );

    let m1: Marker;
    let m2: Marker;

    if (lowerMarkers.length > 0 && higherMarkers.length > 0) {
      m1 = lowerMarkers[lowerMarkers.length - 1];
      m2 = higherMarkers[0];
    } else if (
      (lowerMarkers.length === 0 && higherMarkers.length >= 2) ||
      projection === 0
    ) {
      m1 = higherMarkers[0];
      m2 = higherMarkers[1];
    } else if (
      (lowerMarkers.length >= 2 && higherMarkers.length === 0) ||
      projection === 1
    ) {
      m1 = lowerMarkers[lowerMarkers.length - 2];
      m2 = lowerMarkers[lowerMarkers.length - 1];
    } else {
      return;
    }

    console.log(
      round3(projection),
      round3(m1.projection),
      round3(m2.projection),
      lowerMarkers.length,
      higherMarkers.length
    );

    m1.toPoint().draw(ctx, { color: "lightgreen", radius: 2 });
    m2.toPoint().draw(ctx, { color: "cyan", radius: 2 });

    const chainage = CL.find_KP(mousePoint);

    if (chainage !== undefined) {
      ctx.font = "12px Courier";
      ctx.fillStyle = "red";
      ctx.fillText(formatKP(chainage), mousePoint.x + 7, mousePoint.y);
    }
  }

  requestAnimationFrame(drawLoop);
}

drawLoop();
