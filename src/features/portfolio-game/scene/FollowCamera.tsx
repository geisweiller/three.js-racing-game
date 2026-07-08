"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useGameStore } from "../game/useGameStore";

const cameraTarget = new Vector3();
const lookAtTarget = new Vector3();

export function FollowCamera() {
  const { camera } = useThree();
  const playerHeading = useGameStore((state) => state.playerHeading);
  const playerPosition = useGameStore((state) => state.playerPosition);

  useFrame(() => {
    lookAtTarget.set(playerPosition[0], 0.2, playerPosition[2]);
    cameraTarget.set(
      playerPosition[0] - Math.sin(playerHeading) * 7,
      7.5,
      playerPosition[2] - Math.cos(playerHeading) * 7,
    );
    camera.position.lerp(cameraTarget, 0.08);
    camera.lookAt(lookAtTarget);
  });

  return null;
}
