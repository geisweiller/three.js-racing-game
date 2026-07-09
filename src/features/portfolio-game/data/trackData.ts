import type { Vector3Tuple } from "../game/proximity";

export type RoadSegment = {
  id: string;
  center: Vector3Tuple;
  size: [number, number];
};

export type RoadTileKind = "curve" | "roundabout" | "straight";
export type TrackPropKind = "cone" | "light" | "straightBarrier";

export type RoadTile = {
  id: string;
  kind: RoadTileKind;
  position: Vector3Tuple;
  rotationY?: number;
};

export type TrackProp = {
  id: string;
  kind: TrackPropKind;
  position: Vector3Tuple;
  rotationY?: number;
  scale?: number;
};

export const ROAD_TILE_SIZE = 1.85;
export const ROAD_WIDTH = 3.22;
export const START_POSITION: Vector3Tuple = [0, 0, -7.4];
export const START_HEADING = Math.PI / 2;
export const MAP_LIMIT = 16;
const TRACK_EDGE_EPSILON = 0.001;

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
    rotationY: Math.PI / 2,
  },
  {
    id: "curve-bottom-right",
    kind: "curve",
    position: [right, 0, bottom],
    rotationY: 0,
  },
  {
    id: "curve-top-right",
    kind: "curve",
    position: [right, 0, top],
    rotationY: (Math.PI * 3) / 2,
  },
  {
    id: "curve-top-left",
    kind: "curve",
    position: [left, 0, top],
    rotationY: Math.PI,
  },
];

export const trackProps: TrackProp[] = [
  {
    id: "barrier-bottom-left",
    kind: "straightBarrier",
    position: [-3.7, 0.02, bottom + 0.03],
  },
  {
    id: "barrier-bottom-right",
    kind: "straightBarrier",
    position: [3.7, 0.02, bottom + 0.03],
  },
  {
    id: "barrier-top-left",
    kind: "straightBarrier",
    position: [-3.7, 0.02, top - 0.03],
  },
  {
    id: "barrier-top-right",
    kind: "straightBarrier",
    position: [3.7, 0.02, top - 0.03],
  },
  {
    id: "barrier-left-mid",
    kind: "straightBarrier",
    position: [left + 0.03, 0.02, 0],
    rotationY: Math.PI / 2,
  },
  {
    id: "barrier-right-mid",
    kind: "straightBarrier",
    position: [right - 0.03, 0.02, 0],
    rotationY: Math.PI / 2,
  },
  ...[
    [left + 1.25, bottom + 1.25],
    [right - 1.25, bottom + 1.25],
    [right - 1.25, top - 1.25],
    [left + 1.25, top - 1.25],
  ].map(([x, z], index) => ({
    id: `corner-cone-${index}`,
    kind: "cone" as const,
    position: [x, 0.02, z] as Vector3Tuple,
    scale: 0.8,
  })),
  {
    id: "light-bottom-left",
    kind: "light",
    position: [left + 1.4, 0.02, bottom - 1.1],
    rotationY: Math.PI,
  },
  {
    id: "light-bottom-right",
    kind: "light",
    position: [right - 1.4, 0.02, bottom - 1.1],
    rotationY: Math.PI,
  },
  {
    id: "light-bottom-mid",
    kind: "light",
    position: [0, 0.02, bottom - 1.1],
    rotationY: Math.PI,
  },
  {
    id: "light-top-left",
    kind: "light",
    position: [left + 1.4, 0.02, top + 1.1],
  },
  {
    id: "light-top-right",
    kind: "light",
    position: [right - 1.4, 0.02, top + 1.1],
  },
  {
    id: "light-top-mid",
    kind: "light",
    position: [0, 0.02, top + 1.1],
  },
  {
    id: "light-left-mid",
    kind: "light",
    position: [left - 1.1, 0.02, 0],
    rotationY: -Math.PI / 2,
  },
  {
    id: "light-left-upper",
    kind: "light",
    position: [left - 1.1, 0.02, top - 2.8],
    rotationY: -Math.PI / 2,
  },
  {
    id: "light-left-lower",
    kind: "light",
    position: [left - 1.1, 0.02, bottom + 2.8],
    rotationY: -Math.PI / 2,
  },
  {
    id: "light-right-mid",
    kind: "light",
    position: [right + 1.1, 0.02, 0],
    rotationY: Math.PI / 2,
  },
  {
    id: "light-right-upper",
    kind: "light",
    position: [right + 1.1, 0.02, top - 2.8],
    rotationY: Math.PI / 2,
  },
  {
    id: "light-right-lower",
    kind: "light",
    position: [right + 1.1, 0.02, bottom + 2.8],
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function constrainPointToTrack(position: Vector3Tuple, padding = 0) {
  if (isPointOnTrack(position, padding)) {
    return {
      collided: false,
      position,
    };
  }

  let closestPosition = position;
  let closestDistanceSq = Number.POSITIVE_INFINITY;

  for (const segment of roadSegments) {
    const halfWidth = segment.size[0] / 2 + padding;
    const halfDepth = segment.size[1] / 2 + padding;
    const x = clamp(
      position[0],
      segment.center[0] - halfWidth + TRACK_EDGE_EPSILON,
      segment.center[0] + halfWidth - TRACK_EDGE_EPSILON,
    );
    const z = clamp(
      position[2],
      segment.center[2] - halfDepth + TRACK_EDGE_EPSILON,
      segment.center[2] + halfDepth - TRACK_EDGE_EPSILON,
    );
    const distanceSq = (position[0] - x) ** 2 + (position[2] - z) ** 2;

    if (distanceSq < closestDistanceSq) {
      closestDistanceSq = distanceSq;
      closestPosition = [x, position[1], z];
    }
  }

  return {
    collided: true,
    position: closestPosition,
  };
}
