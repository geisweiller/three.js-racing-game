"use client";

import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import type { Group } from "three";
import { ROAD_WIDTH, roadTiles } from "../data/trackData";
import { playerRuntime } from "../game/playerRuntime";
import type { Vector3Tuple } from "../game/vector";
import { useGameStore } from "../game/useGameStore";
import { GlbModel } from "./GlbModel";

const BOX_MODEL_PATH = "/game-assets/cars/box.glb";
const BOXES_PER_ROW = 4;
const BOX_SPACING = ROAD_WIDTH / 5;
const PICKUP_RADIUS = 0.42;
const PICKUP_COOLDOWN = 0.35;
const RESPAWN_DELAY = 15;
const BOX_Y = 0.28;

type ItemPickup = {
  availableAt: number;
  id: number;
  position: Vector3Tuple;
};

type CollectionEffect = {
  age: number;
  id: number;
  position: Vector3Tuple;
};

const itemRows = [
  { id: "north", lateral: [0, 0, 1] as Vector3Tuple, tileId: "straight-2-4" },
  { id: "east", lateral: [1, 0, 0] as Vector3Tuple, tileId: "straight-4--3" },
  { id: "south", lateral: [0, 0, 1] as Vector3Tuple, tileId: "straight-0--5" },
];

function distance2D(a: Vector3Tuple, b: Vector3Tuple) {
  return Math.hypot(a[0] - b[0], a[2] - b[2]);
}

function getRoadTilePosition(tileId: string) {
  const tile = roadTiles.find((roadTile) => roadTile.id === tileId);

  if (!tile) {
    throw new Error(`Missing item row tile: ${tileId}`);
  }

  return tile.position;
}

function createInitialPickups(): ItemPickup[] {
  return itemRows.flatMap((row, rowIndex) => {
    const center = getRoadTilePosition(row.tileId);

    return Array.from({ length: BOXES_PER_ROW }, (_, index) => {
      const offset = (index - (BOXES_PER_ROW - 1) / 2) * BOX_SPACING;

      return {
        availableAt: 0,
        id: index + rowIndex * BOXES_PER_ROW + 1,
        position: [
          center[0] + row.lateral[0] * offset,
          BOX_Y,
          center[2] + row.lateral[2] * offset,
        ] as Vector3Tuple,
      };
    });
  });
}

export function ItemPickups() {
  const lastRespawnVersion = useRef(0);
  const lastPickupAt = useRef(-Infinity);
  const nextEffectId = useRef(1);
  const initialPickups = useMemo(() => createInitialPickups(), []);
  const [effects, setEffects] = useState<CollectionEffect[]>([]);
  const [pickups, setPickups] = useState<ItemPickup[]>(initialPickups);
  const collectItemBox = useGameStore((state) => state.collectItemBox);
  const respawnVersion = useGameStore((state) => state.respawnVersion);

  useFrame((state, delta) => {
    if (lastRespawnVersion.current !== respawnVersion) {
      lastRespawnVersion.current = respawnVersion;
      lastPickupAt.current = -Infinity;
      setEffects([]);
      setPickups(initialPickups);
      return;
    }

    setEffects((current) => {
      if (current.length === 0) {
        return current;
      }

      return current
        .map((effect) => ({ ...effect, age: effect.age + delta }))
        .filter((effect) => effect.age < 0.8);
    });

    if (state.clock.elapsedTime - lastPickupAt.current < PICKUP_COOLDOWN) {
      return;
    }

    const playerPosition = playerRuntime.position;
    const collectedPickups = pickups.filter(
      (pickup) =>
        state.clock.elapsedTime >= pickup.availableAt &&
        distance2D(playerPosition, pickup.position) <= PICKUP_RADIUS,
    );

    if (collectedPickups.length > 0) {
      const nearestPickup = collectedPickups.reduce((nearest, pickup) =>
        distance2D(playerPosition, pickup.position) < distance2D(playerPosition, nearest.position) ? pickup : nearest,
      );
      const acceptedPickup = collectItemBox() ? nearestPickup : null;

      if (!acceptedPickup) {
        return;
      }

      lastPickupAt.current = state.clock.elapsedTime;

      setPickups((current) =>
        current.map((pickup) =>
          pickup.id === acceptedPickup.id
            ? { ...pickup, availableAt: state.clock.elapsedTime + RESPAWN_DELAY }
            : pickup,
        ),
      );
      setEffects((current) => [
        ...current,
        {
          age: 0,
          id: nextEffectId.current++,
          position: acceptedPickup.position,
        },
      ]);
    }
  });

  return (
    <group>
      {pickups.map((pickup) => (
        <ItemPickupBox key={pickup.id} pickup={pickup} />
      ))}
      {effects.map((effect) => (
        <ItemCollectEffect key={effect.id} effect={effect} />
      ))}
    </group>
  );
}

function ItemPickupBox({ pickup }: { pickup: ItemPickup }) {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const available = state.clock.elapsedTime >= pickup.availableAt;

      groupRef.current.visible = available;

      if (available) {
        groupRef.current.rotation.y += delta * 1.8;
        groupRef.current.position.y = pickup.position[1] + Math.sin(state.clock.elapsedTime * 4 + pickup.id) * 0.08;
      }
    }
  });

  return (
    <group ref={groupRef} position={pickup.position}>
      <Suspense fallback={null}>
        <GlbModel path={BOX_MODEL_PATH} modelScale={0.45} />
      </Suspense>
    </group>
  );
}

function ItemCollectEffect({ effect }: { effect: CollectionEffect }) {
  const progress = Math.min(1, effect.age / 0.8);
  const opacity = 1 - progress;
  const ringScale = 0.6 + progress * 1.8;
  const particlePositions = [
    [-0.42, 0.35 + progress * 0.7, -0.2],
    [0.32, 0.48 + progress * 0.8, -0.35],
    [-0.16, 0.62 + progress * 0.6, 0.38],
    [0.44, 0.38 + progress * 0.7, 0.26],
    [0, 0.72 + progress * 0.85, 0],
  ] as const;

  return (
    <group position={effect.position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[ringScale, ringScale, ringScale]}>
        <torusGeometry args={[0.42, 0.025, 8, 36]} />
        <meshBasicMaterial color="#66cfb2" opacity={opacity * 0.75} transparent />
      </mesh>
      {particlePositions.map((position, index) => (
        <mesh key={index} position={position} scale={0.08 + progress * 0.04}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={index % 2 === 0 ? "#66cfb2" : "#f6d365"} opacity={opacity} transparent />
        </mesh>
      ))}
      <Html center position={[0, 1.15 + progress * 0.6, 0]}>
        <div
          className="rounded-full bg-[#111418]/85 px-3 py-1 text-xs font-semibold text-[#66cfb2] shadow-lg backdrop-blur"
          style={{ opacity }}
        >
          Item
        </div>
      </Html>
    </group>
  );
}
