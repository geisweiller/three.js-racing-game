import type { PointOfInterest } from "../data/pointsOfInterest";

export type Vector3Tuple = [number, number, number];

export function distance2D(a: Vector3Tuple, b: Vector3Tuple) {
  const dx = a[0] - b[0];
  const dz = a[2] - b[2];

  return Math.sqrt(dx * dx + dz * dz);
}

export function getNearbyPoint(
  playerPosition: Vector3Tuple,
  points: PointOfInterest[],
) {
  return (
    points.find((point) => distance2D(playerPosition, point.position) <= point.radius) ??
    null
  );
}
