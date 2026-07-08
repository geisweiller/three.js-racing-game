"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import { getVehicleOption } from "../data/vehicleOptions";
import { updateVehicle, type MovementInput, type VehicleState } from "../game/movement";
import { useGameStore } from "../game/useGameStore";
import { isPointOnTrack, START_HEADING, START_POSITION } from "../data/trackData";
import { GlbModel } from "./GlbModel";

type PlayerProps = {
  input: MovementInput;
};

export function Player({ input }: PlayerProps) {
  const playerRef = useRef<Group>(null);
  const vehicleState = useRef<VehicleState>({
    position: START_POSITION,
    heading: START_HEADING,
    speed: 0,
  });
  const openedSectionId = useGameStore((state) => state.openedSectionId);
  const respawnVersion = useGameStore((state) => state.respawnVersion);
  const selectedVehicleId = useGameStore((state) => state.selectedVehicleId);
  const setPlayerHeading = useGameStore((state) => state.setPlayerHeading);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const selectedVehicle = getVehicleOption(selectedVehicleId);

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
    const nextState = updateVehicle(
      vehicleState.current,
      input,
      delta,
      surface,
      selectedVehicle.handling,
    );
    vehicleState.current = nextState;

    player.position.set(...nextState.position);
    player.rotation.y = nextState.heading;

    setPlayerHeading(nextState.heading);
    setPlayerPosition(nextState.position);
  });

  return (
    <group ref={playerRef} position={START_POSITION} rotation={[0, START_HEADING, 0]}>
      <GlbModel path={selectedVehicle.modelPath} modelScale={selectedVehicle.scale} />
    </group>
  );
}
