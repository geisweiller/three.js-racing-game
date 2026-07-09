"use client";

import { useFrame } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import { Html } from "@react-three/drei";
import type { Group } from "three";
import { roadTiles } from "../data/trackData";
import type { Vector3Tuple } from "../game/proximity";
import { useGameStore } from "../game/useGameStore";
import { GlbModel } from "./GlbModel";

const BOX_MODEL_PATH = "/game-assets/cars/box.glb";
const MAX_PICKUPS = 4;
const SPAWN_INTERVAL = 5;
const PICKUP_RADIUS = 0.85;
const MIN_SPAWN_DISTANCE_FROM_PLAYER = 5;
const NITRO_PER_PICKUP = 25;
const BOX_Y = 0.28;

type NitroPickup = {
  id: number;
  position: Vector3Tuple;
};

type CollectionEffect = {
  age: number;
  id: number;
  position: Vector3Tuple;
};

const spawnPoints = roadTiles.map((tile) => tile.position);

function pickSpawnPoint(activePickups: NitroPickup[], playerPosition: Vector3Tuple) {
  const used = new Set(activePickups.map((pickup) => `${pickup.position[0]},${pickup.position[2]}`));
  const candidates = spawnPoints.filter(
    (point) =>
      !used.has(`${point[0]},${point[2]}`) &&
      distance2D(playerPosition, point) >= MIN_SPAWN_DISTANCE_FROM_PLAYER,
  );
  const source = candidates.length > 0 ? candidates : spawnPoints;

  return source[Math.floor(Math.random() * source.length)];
}

function distance2D(a: Vector3Tuple, b: Vector3Tuple) {
  return Math.hypot(a[0] - b[0], a[2] - b[2]);
}

export function NitroPickups() {
  const nextId = useRef(1);
  const lastRespawnVersion = useRef(0);
  const spawnTimer = useRef(0);
  const nextEffectId = useRef(1);
  const [effects, setEffects] = useState<CollectionEffect[]>([]);
  const [pickups, setPickups] = useState<NitroPickup[]>([]);
  const addNitroCharge = useGameStore((state) => state.addNitroCharge);
  const respawnVersion = useGameStore((state) => state.respawnVersion);

  useFrame((_, delta) => {
    if (lastRespawnVersion.current !== respawnVersion) {
      lastRespawnVersion.current = respawnVersion;
      spawnTimer.current = 0;
      setEffects([]);
      setPickups([]);
      return;
    }

    setEffects((current) =>
      current
        .map((effect) => ({ ...effect, age: effect.age + delta }))
        .filter((effect) => effect.age < 0.8),
    );

    spawnTimer.current += delta;

    if (spawnTimer.current >= SPAWN_INTERVAL) {
      spawnTimer.current = 0;
      const playerPosition = useGameStore.getState().playerPosition;

      setPickups((current) => {
        if (current.length >= MAX_PICKUPS) {
          return current;
        }

        const spawnPoint = pickSpawnPoint(current, playerPosition);

        return [
          ...current,
          {
            id: nextId.current++,
            position: [spawnPoint[0], BOX_Y, spawnPoint[2]],
          },
        ];
      });
    }

    const playerPosition = useGameStore.getState().playerPosition;
    const collectedPickups = pickups.filter(
      (pickup) => distance2D(playerPosition, pickup.position) <= PICKUP_RADIUS,
    );

    if (collectedPickups.length > 0) {
      const collectedIds = new Set(collectedPickups.map((pickup) => pickup.id));
      setPickups((current) => current.filter((pickup) => !collectedIds.has(pickup.id)));
      setEffects((current) => [
        ...current,
        ...collectedPickups.map((pickup) => ({
          age: 0,
          id: nextEffectId.current++,
          position: pickup.position,
        })),
      ]);
      addNitroCharge(collectedPickups.length * NITRO_PER_PICKUP);
    }
  });

  return (
    <group>
      {pickups.map((pickup) => (
        <NitroPickupBox key={pickup.id} pickup={pickup} />
      ))}
      {effects.map((effect) => (
        <NitroCollectEffect key={effect.id} effect={effect} />
      ))}
    </group>
  );
}

function NitroPickupBox({ pickup }: { pickup: NitroPickup }) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 1.8;
      groupRef.current.position.y = pickup.position[1] + Math.sin(Date.now() * 0.004 + pickup.id) * 0.08;
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

function NitroCollectEffect({ effect }: { effect: CollectionEffect }) {
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
          +25%
        </div>
      </Html>
    </group>
  );
}
