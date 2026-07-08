import type { Vector3Tuple } from "../game/proximity";

export type TrackCell = [number, number, TrackModelKey, keyof typeof ORIENT_DEG];
export type TrackModelKey = "track-straight" | "track-corner" | "track-bump" | "track-finish";

export const ORIENT_DEG = { 0: 0, 10: 180, 16: 90, 22: 270 } as const;
export const CELL_RAW = 9.99;
export const MODEL_SCALE = 0.42;
export const CELL_SIZE = CELL_RAW * MODEL_SCALE;
export const TRACK_OFFSET_X = CELL_SIZE;
export const TRACK_OFFSET_Z = 0;

export const trackCells: TrackCell[] = [
  [-3, -3, "track-corner", 16],
  [-2, -3, "track-straight", 22],
  [-1, -3, "track-straight", 22],
  [0, -3, "track-corner", 0],
  [-3, -2, "track-straight", 0],
  [0, -2, "track-straight", 0],
  [-3, -1, "track-corner", 10],
  [-2, -1, "track-corner", 0],
  [0, -1, "track-straight", 0],
  [-2, 0, "track-straight", 10],
  [0, 0, "track-finish", 0],
  [-2, 1, "track-straight", 10],
  [0, 1, "track-straight", 0],
  [-2, 2, "track-corner", 10],
  [-1, 2, "track-straight", 16],
  [0, 2, "track-corner", 22],
];

export const START_POSITION = gridToWorld(0, 0);
export const START_HEADING = ORIENT_DEG[0] * (Math.PI / 180);
export const MAP_LIMIT = 16;

export function gridToWorld(gx: number, gz: number): Vector3Tuple {
  return [
    (gx + 0.5) * CELL_SIZE + TRACK_OFFSET_X,
    0,
    (gz + 0.5) * CELL_SIZE + TRACK_OFFSET_Z,
  ];
}

export function isPointOnTrack(position: Vector3Tuple, padding = 0) {
  return trackCells.some(([gx, gz]) => {
    const center = gridToWorld(gx, gz);
    const halfCell = CELL_SIZE / 2 + padding;

    return (
      Math.abs(position[0] - center[0]) <= halfCell &&
      Math.abs(position[2] - center[2]) <= halfCell
    );
  });
}
