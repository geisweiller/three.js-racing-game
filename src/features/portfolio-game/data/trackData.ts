import type { Vector3Tuple } from "../game/proximity";

export type RoadSegment = {
  id: string;
  center: Vector3Tuple;
  size: [number, number];
};

export type RoadTileKind = "curve" | "roundabout" | "straight";

export type RoadTile = {
  id: string;
  kind: RoadTileKind;
  position: Vector3Tuple;
  rotationY?: number;
};

export const ROAD_TILE_SIZE = 1.85;
export const ROAD_WIDTH = 2.4;
export const START_POSITION: Vector3Tuple = [0, 0, -7.4];
export const START_HEADING = Math.PI / 2;
export const MAP_LIMIT = 16;

const left = -7.4;
const right = 7.4;
const top = 7.4;
const bottom = -7.4;
const straightIndexes = [-3, -2, -1, 0, 1, 2, 3];

const horizontalStraightTiles = [top, bottom].flatMap((z) =>
  straightIndexes.map((index) => ({
    id: `straight-x-${index}-${z}`,
    kind: "straight" as const,
    position: [index * ROAD_TILE_SIZE, 0, z] as Vector3Tuple,
  })),
);

const verticalStraightTiles = [left, right].flatMap((x) =>
  straightIndexes.map((index) => ({
    id: `straight-z-${x}-${index}`,
    kind: "straight" as const,
    position: [x, 0, index * ROAD_TILE_SIZE] as Vector3Tuple,
    rotationY: Math.PI / 2,
  })),
);

export const roadTiles: RoadTile[] = [
  ...horizontalStraightTiles,
  ...verticalStraightTiles,
  {
    id: "curve-bottom-left",
    kind: "curve",
    position: [left, 0, bottom],
    rotationY: Math.PI,
  },
  {
    id: "curve-bottom-right",
    kind: "curve",
    position: [right, 0, bottom],
    rotationY: -Math.PI / 2,
  },
  {
    id: "curve-top-right",
    kind: "curve",
    position: [right, 0, top],
    rotationY: 0,
  },
  {
    id: "curve-top-left",
    kind: "curve",
    position: [left, 0, top],
    rotationY: Math.PI / 2,
  },
];

export const roadSegments: RoadSegment[] = [
  {
    id: "bottom-straight",
    center: [0, 0, bottom],
    size: [right - left + ROAD_WIDTH, ROAD_WIDTH],
  },
  {
    id: "top-straight",
    center: [0, 0, top],
    size: [right - left + ROAD_WIDTH, ROAD_WIDTH],
  },
  {
    id: "left-straight",
    center: [left, 0, 0],
    size: [ROAD_WIDTH, top - bottom + ROAD_WIDTH],
  },
  {
    id: "right-straight",
    center: [right, 0, 0],
    size: [ROAD_WIDTH, top - bottom + ROAD_WIDTH],
  },
];

export function isPointOnTrack(position: Vector3Tuple, padding = 0) {
  return roadSegments.some((segment) => {
    const halfWidth = segment.size[0] / 2 + padding;
    const halfDepth = segment.size[1] / 2 + padding;

    return (
      Math.abs(position[0] - segment.center[0]) <= halfWidth &&
      Math.abs(position[2] - segment.center[2]) <= halfDepth
    );
  });
}
