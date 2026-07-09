import type { Vector3Tuple } from "../game/proximity";

export type RoadSegment = {
  id: string;
  center: Vector3Tuple;
  size: [number, number];
};

export type RoadTileKind = "curve" | "finish" | "straight";
export type TrackPropKind = "cone" | "light";

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

export const ROAD_TILE_SIZE = 2.85;
// Tamanho visual de cada tile do Starter dentro da nossa cena. Ele fica igual
// ao espacamento do grid para evitar sobreposicao entre retas e curvas.
export const ROAD_VISUAL_SIZE = ROAD_TILE_SIZE;
// Largura dirigivel da pista. E um pouco menor que ROAD_VISUAL_SIZE porque os
// modelos do Starter Kit incluem guard-rails e bordas alem do asfalto.
export const ROAD_WIDTH = 2.35;
export const START_POSITION: Vector3Tuple = [0, 0, -ROAD_TILE_SIZE * 4];
export const START_HEADING = Math.PI / 2;
export const MAP_LIMIT = 24;
const TRACK_EDGE_EPSILON = 0.001;

const left = -ROAD_TILE_SIZE * 4;
const right = ROAD_TILE_SIZE * 4;
const top = ROAD_TILE_SIZE * 4;
const bottom = -ROAD_TILE_SIZE * 4;
const straightIndexes = [-3, -2, -1, 0, 1, 2, 3];
const cornerRadius = ROAD_TILE_SIZE;

type TrackCenterlinePart =
  | {
      kind: "arc";
      center: Vector3Tuple;
      endAngle: number;
      radius: number;
      startAngle: number;
    }
  | {
      kind: "line";
      end: Vector3Tuple;
      start: Vector3Tuple;
    };

const trackCenterline: TrackCenterlinePart[] = [
  {
    kind: "line",
    start: [left + cornerRadius, 0, bottom],
    end: [right - cornerRadius, 0, bottom],
  },
  {
    kind: "arc",
    center: [right - cornerRadius, 0, bottom + cornerRadius],
    radius: cornerRadius,
    startAngle: (Math.PI * 3) / 2,
    endAngle: Math.PI * 2,
  },
  {
    kind: "line",
    start: [right, 0, bottom + cornerRadius],
    end: [right, 0, top - cornerRadius],
  },
  {
    kind: "arc",
    center: [right - cornerRadius, 0, top - cornerRadius],
    radius: cornerRadius,
    startAngle: 0,
    endAngle: Math.PI / 2,
  },
  {
    kind: "line",
    start: [right - cornerRadius, 0, top],
    end: [left + cornerRadius, 0, top],
  },
  {
    kind: "arc",
    center: [left + cornerRadius, 0, top - cornerRadius],
    radius: cornerRadius,
    startAngle: Math.PI / 2,
    endAngle: Math.PI,
  },
  {
    kind: "line",
    start: [left, 0, top - cornerRadius],
    end: [left, 0, bottom + cornerRadius],
  },
  {
    kind: "arc",
    center: [left + cornerRadius, 0, bottom + cornerRadius],
    radius: cornerRadius,
    startAngle: Math.PI,
    endAngle: (Math.PI * 3) / 2,
  },
];

const horizontalStraightTiles = [top, bottom].flatMap((z) =>
  straightIndexes.map((index) => ({
    id: `straight-x-${index}-${z}`,
    kind: z === bottom && index === 0 ? ("finish" as const) : ("straight" as const),
    position: [index * ROAD_TILE_SIZE, 0, z] as Vector3Tuple,
    rotationY: -Math.PI / 2,
  })),
);

const verticalStraightTiles = [left, right].flatMap((x) =>
  straightIndexes.map((index) => ({
    id: `straight-z-${x}-${index}`,
    kind: "straight" as const,
    position: [x, 0, index * ROAD_TILE_SIZE] as Vector3Tuple,
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(angle: number) {
  const fullTurn = Math.PI * 2;
  return ((angle % fullTurn) + fullTurn) % fullTurn;
}

function getClosestLinePoint(position: Vector3Tuple, start: Vector3Tuple, end: Vector3Tuple) {
  const segmentX = end[0] - start[0];
  const segmentZ = end[2] - start[2];
  const segmentLengthSq = segmentX * segmentX + segmentZ * segmentZ;
  const progress =
    segmentLengthSq === 0
      ? 0
      : clamp(
          ((position[0] - start[0]) * segmentX + (position[2] - start[2]) * segmentZ) /
            segmentLengthSq,
          0,
          1,
        );

  return [start[0] + segmentX * progress, position[1], start[2] + segmentZ * progress] as Vector3Tuple;
}

function getClosestArcPoint(
  position: Vector3Tuple,
  center: Vector3Tuple,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const rawAngle = normalizeAngle(Math.atan2(position[2] - center[2], position[0] - center[0]));
  const angle =
    startAngle <= endAngle
      ? clamp(rawAngle, startAngle, endAngle)
      : normalizeAngle(clamp(rawAngle < startAngle ? rawAngle + Math.PI * 2 : rawAngle, startAngle, endAngle));

  return [
    center[0] + Math.cos(angle) * radius,
    position[1],
    center[2] + Math.sin(angle) * radius,
  ] as Vector3Tuple;
}

function getClosestTrackPoint(position: Vector3Tuple) {
  let closestPosition: Vector3Tuple = position;
  let closestDistanceSq = Number.POSITIVE_INFINITY;

  for (const part of trackCenterline) {
    const candidate =
      part.kind === "line"
        ? getClosestLinePoint(position, part.start, part.end)
        : getClosestArcPoint(position, part.center, part.radius, part.startAngle, part.endAngle);
    const distanceSq = (position[0] - candidate[0]) ** 2 + (position[2] - candidate[2]) ** 2;

    if (distanceSq < closestDistanceSq) {
      closestDistanceSq = distanceSq;
      closestPosition = candidate;
    }
  }

  return {
    distance: Math.sqrt(closestDistanceSq),
    position: closestPosition,
  };
}

export function isPointOnTrack(position: Vector3Tuple, padding = 0) {
  return getClosestTrackPoint(position).distance <= ROAD_WIDTH / 2 + padding;
}

export function constrainPointToTrack(
  position: Vector3Tuple,
  vehicleRadius = 0,
): { collided: boolean; position: Vector3Tuple } {
  // Mesma ideia do Starter Kit Racing: a pista tem paredes nas bordas e o
  // carro colide como um corpo simples com raio. O centro do carro fica dentro
  // da pista por esse raio, em vez de a propria origem atravessar a parede.
  const trackLimit = Math.max(0, ROAD_WIDTH / 2 - vehicleRadius);
  const closest = getClosestTrackPoint(position);

  if (closest.distance <= trackLimit) {
    return {
      collided: false,
      position,
    };
  }

  const safeLimit = Math.max(0, trackLimit - TRACK_EDGE_EPSILON);
  const normalX = closest.distance === 0 ? 0 : (position[0] - closest.position[0]) / closest.distance;
  const normalZ = closest.distance === 0 ? 1 : (position[2] - closest.position[2]) / closest.distance;

  return {
    collided: true,
    position: [
      closest.position[0] + normalX * safeLimit,
      position[1],
      closest.position[2] + normalZ * safeLimit,
    ] as Vector3Tuple,
  };
}
