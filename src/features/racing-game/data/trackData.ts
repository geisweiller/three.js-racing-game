import type { Vector3Tuple } from "../game/vector";

export type RoadSegment = {
  id: string;
  center: Vector3Tuple;
  size: [number, number];
};

export type RoadTileKind = "curve" | "finish" | "straight";
export type TrackDecorationKind =
  | "buildingA"
  | "buildingD"
  | "empty"
  | "forest"
  | "skyscraperA"
  | "treeSmall"
  | "workshop";
export type TrackPropKind = never;

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

export type TrackDecoration = {
  id: string;
  kind: TrackDecorationKind;
  position: Vector3Tuple;
  rotationY?: number;
  scale?: number;
};

export const ROAD_TILE_SIZE = 4.45;
// Tamanho visual de cada tile do Starter dentro da nossa cena. Ele fica igual
// ao espacamento do grid para evitar sobreposicao entre retas e curvas.
export const ROAD_VISUAL_SIZE = ROAD_TILE_SIZE;
// Largura dirigivel da pista. E um pouco menor que ROAD_VISUAL_SIZE porque os
// modelos do Starter Kit incluem guard-rails e bordas alem do asfalto.
export const ROAD_WIDTH = 3.72;
const START_GRID_X = 0;
const START_GRID_Z = 4;
export const START_POSITION: Vector3Tuple = [
  (START_GRID_X + 1.5) * ROAD_TILE_SIZE,
  0,
  (START_GRID_Z + 0.5) * ROAD_TILE_SIZE,
];
export const START_HEADING = Math.PI / 2;
export const MAP_LIMIT = 40;
const TRACK_EDGE_EPSILON = 0.001;

const gridOffsetX = 1.5;
const gridOffsetZ = 0.5;
const orientationByStarterCode = {
  0: 0,
  10: Math.PI,
  16: Math.PI / 2,
  22: (Math.PI * 3) / 2,
} as const;

const trackCells = [
  [0, 4, "finish", 16],
  [1, 4, "straight", 16],
  [2, 4, "straight", 16],
  [3, 4, "straight", 16],
  [4, 4, "curve", 22],
  [4, 3, "straight", 0],
  [4, 2, "straight", 0],
  [4, 1, "curve", 0],
  [3, 1, "straight", 16],
  [2, 1, "straight", 16],
  [1, 1, "curve", 10],
  [1, 0, "straight", 0],
  [1, -1, "straight", 0],
  [1, -2, "curve", 16],
  [2, -2, "straight", 16],
  [3, -2, "straight", 16],
  [4, -2, "curve", 22],
  [4, -3, "straight", 0],
  [4, -4, "straight", 0],
  [4, -5, "curve", 0],
  [3, -5, "straight", 16],
  [2, -5, "straight", 16],
  [1, -5, "straight", 16],
  [0, -5, "straight", 16],
  [-1, -5, "straight", 16],
  [-2, -5, "straight", 16],
  [-3, -5, "curve", 16],
  [-3, -4, "straight", 0],
  [-3, -3, "straight", 0],
  [-3, -2, "curve", 22],
  [-4, -2, "straight", 16],
  [-5, -2, "straight", 16],
  [-6, -2, "curve", 16],
  [-6, -1, "straight", 0],
  [-6, 0, "straight", 0],
  [-6, 1, "straight", 0],
  [-6, 2, "curve", 10],
  [-5, 2, "straight", 16],
  [-4, 2, "straight", 16],
  [-3, 2, "curve", 0],
  [-3, 3, "straight", 0],
  [-3, 4, "curve", 10],
  [-2, 4, "straight", 16],
  [-1, 4, "straight", 16],
] as const satisfies readonly (readonly [number, number, RoadTileKind, keyof typeof orientationByStarterCode])[];

const trackCellSet = new Set(trackCells.map(([gx, gz]) => `${gx},${gz}`));

const trackCellBounds = trackCells.reduce(
  (bounds, [gx, gz]) => ({
    maxX: Math.max(bounds.maxX, gx),
    maxZ: Math.max(bounds.maxZ, gz),
    minX: Math.min(bounds.minX, gx),
    minZ: Math.min(bounds.minZ, gz),
  }),
  { maxX: -Infinity, maxZ: -Infinity, minX: Infinity, minZ: Infinity },
);

const centerlineCells = [
  [0, 4],
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 4],
  [4, 3],
  [4, 2],
  [4, 1],
  [3, 1],
  [2, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [1, -2],
  [2, -2],
  [3, -2],
  [4, -2],
  [4, -3],
  [4, -4],
  [4, -5],
  [3, -5],
  [2, -5],
  [1, -5],
  [0, -5],
  [-1, -5],
  [-2, -5],
  [-3, -5],
  [-3, -4],
  [-3, -3],
  [-3, -2],
  [-4, -2],
  [-5, -2],
  [-6, -2],
  [-6, -1],
  [-6, 0],
  [-6, 1],
  [-6, 2],
  [-5, 2],
  [-4, 2],
  [-3, 2],
  [-3, 3],
  [-3, 4],
  [-2, 4],
  [-1, 4],
] as const;

const structureCells = [
  [-7, -4, "buildingA", 0, 1.35],
  [-1, -6, "skyscraperA", 2, 1.2],
  [2, -6, "buildingD", 1, 1.2],
  [5, 1, "workshop", 3, 0.45],
  [5, -1, "buildingA", 3, 1.25],
  [5, 3, "buildingD", 0, 1.2],
  [3, 5, "skyscraperA", 2, 1.15],
  [1, 5, "buildingA", 1, 1.25],
  [-1, 5, "buildingD", 2, 1.2],
  [-4, 4, "treeSmall", 2, 2],
  [-6, 4, "buildingA", 0, 1.25],
  [-7, 1, "buildingD", 3, 1.2],
  [-7, -1, "treeSmall", 1, 2],
] as const satisfies readonly (readonly [
  number,
  number,
  TrackDecorationKind,
  number,
  number,
])[];

const structureCellSet = new Set(structureCells.map(([gx, gz]) => `${gx},${gz}`));

function gridToWorld(gx: number, gz: number): Vector3Tuple {
  return [
    (gx + gridOffsetX) * ROAD_TILE_SIZE,
    0,
    (gz + gridOffsetZ) * ROAD_TILE_SIZE,
  ];
}

type TrackCenterlinePart = {
  end: Vector3Tuple;
  start: Vector3Tuple;
};

const centerlinePoints = centerlineCells.map(([gx, gz]) => gridToWorld(gx, gz));

const trackCenterline: TrackCenterlinePart[] = centerlinePoints.map((point, index) => ({
  start: point,
  end: centerlinePoints[(index + 1) % centerlinePoints.length],
}));

export const roadTiles: RoadTile[] = trackCells.map(([gx, gz, kind, orientation]) => ({
  id: `${kind}-${gx}-${gz}`,
  kind,
  position: gridToWorld(gx, gz),
  rotationY: orientationByStarterCode[orientation],
}));

export const trackProps: TrackProp[] = [];

function hashGridCell(gx: number, gz: number) {
  let hash = gx * 374761393 + gz * 668265263;
  hash = (hash ^ (hash >> 13)) * 1274126177;

  return (hash ^ (hash >> 16)) >>> 0;
}

function createTrackDecorations() {
  const decorations: TrackDecoration[] = [];
  const padding = 3;

  for (let gz = trackCellBounds.minZ - padding; gz <= trackCellBounds.maxZ + padding; gz += 1) {
    for (let gx = trackCellBounds.minX - padding; gx <= trackCellBounds.maxX + padding; gx += 1) {
      if (trackCellSet.has(`${gx},${gz}`)) {
        continue;
      }
      if (structureCellSet.has(`${gx},${gz}`)) {
        continue;
      }

      const distanceX =
        gx < trackCellBounds.minX
          ? trackCellBounds.minX - gx
          : gx > trackCellBounds.maxX
            ? gx - trackCellBounds.maxX
            : 0;
      const distanceZ =
        gz < trackCellBounds.minZ
          ? trackCellBounds.minZ - gz
          : gz > trackCellBounds.maxZ
            ? gz - trackCellBounds.maxZ
            : 0;
      const distanceFromTrackBox = Math.max(distanceX, distanceZ);
      const hash = hashGridCell(gx, gz);
      const kind: TrackDecorationKind = distanceFromTrackBox <= 1 ? "empty" : "forest";

      decorations.push({
        id: `decoration-${kind}-${gx}-${gz}`,
        kind,
        position: gridToWorld(gx, gz),
        rotationY: (hash % 4) * (Math.PI / 2),
      });
    }
  }

  const structureBases = structureCells.filter(([, , kind]) => kind !== "workshop").map(([gx, gz]) => ({
    id: `structure-base-empty-${gx}-${gz}`,
    kind: "empty" as const,
    position: gridToWorld(gx, gz),
    rotationY: 0,
  }));
  const structures = structureCells.map(([gx, gz, kind, quarterTurns, scale]) => ({
    id: `structure-${kind}-${gx}-${gz}`,
    kind,
    position: gridToWorld(gx, gz),
    rotationY: quarterTurns * (Math.PI / 2),
    scale,
  }));

  return [...decorations, ...structureBases, ...structures];
}

export const trackDecorations: TrackDecoration[] = createTrackDecorations();

export const roadSegments: RoadSegment[] = roadTiles.map((tile) => ({
  id: tile.id,
  center: tile.position,
  size: [ROAD_WIDTH, ROAD_WIDTH],
}));

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
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

function getClosestTrackPoint(position: Vector3Tuple) {
  let closestPosition: Vector3Tuple = position;
  let closestDistanceSq = Number.POSITIVE_INFINITY;

  for (const part of trackCenterline) {
    const candidate = getClosestLinePoint(position, part.start, part.end);
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
  collisionOutset = 0,
): { collided: boolean; position: Vector3Tuple } {
  // Mesma ideia do Starter Kit Racing: a pista tem paredes nas bordas e o
  // carro colide como um corpo simples com raio. O centro do carro fica dentro
  // da pista por esse raio, em vez de a propria origem atravessar a parede.
  // collisionOutset empurra essa parede para fora do asfalto visual. Usamos
  // isso para dar uma tolerancia de meia largura de carro antes da batida.
  const trackLimit = Math.max(0, ROAD_WIDTH / 2 - vehicleRadius + collisionOutset);
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
