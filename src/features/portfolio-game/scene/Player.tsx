"use client";

import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import type { Group, Mesh, Object3D } from "three";
import { updateVehicle, type MovementInput, type VehicleState } from "../game/movement";
import { useGameStore } from "../game/useGameStore";
import { isPointOnTrack, START_HEADING, START_POSITION } from "../data/trackData";

const VEHICLE_MODEL_PATH = "/starter-kit-racing/models/vehicle-truck-purple.glb";

type PlayerProps = {
  input: MovementInput;
};

function isMesh(object: Object3D): object is Mesh {
  return "isMesh" in object;
}

function cloneWithShadows(source: Object3D) {
  const clone = source.clone(true);

  clone.traverse((child) => {
    if (isMesh(child)) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return clone;
}

function VehicleModel() {
  const { scene } = useGLTF(VEHICLE_MODEL_PATH);
  const model = useMemo(() => cloneWithShadows(scene), [scene]);

  return <primitive object={model} scale={0.56} />;
}

export function Player({ input }: PlayerProps) {
  const playerRef = useRef<Group>(null);
  const vehicleState = useRef<VehicleState>({
    position: START_POSITION,
    heading: START_HEADING,
    speed: 0,
  });
  const openedSectionId = useGameStore((state) => state.openedSectionId);
  const respawnVersion = useGameStore((state) => state.respawnVersion);
  const setPlayerHeading = useGameStore((state) => state.setPlayerHeading);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);

  useEffect(() => {
    vehicleState.current = {
      position: START_POSITION,
      heading: START_HEADING,
      speed: 0,
    };

    if (playerRef.current) {
      playerRef.current.position.set(...START_POSITION);
      playerRef.current.rotation.y = START_HEADING;
    }
  }, [respawnVersion]);

  useFrame((_, delta) => {
    const player = playerRef.current;

    if (!player || openedSectionId) {
      return;
    }

    const surface = isPointOnTrack(vehicleState.current.position, 0.35) ? "track" : "offroad";
    const nextState = updateVehicle(vehicleState.current, input, delta, surface);
    vehicleState.current = nextState;

    player.position.set(...nextState.position);
    player.rotation.y = nextState.heading;

    setPlayerHeading(nextState.heading);
    setPlayerPosition(nextState.position);
  });

  return (
    <group ref={playerRef} position={START_POSITION} rotation={[0, START_HEADING, 0]}>
      <VehicleModel />
    </group>
  );
}

useGLTF.preload(VEHICLE_MODEL_PATH);
