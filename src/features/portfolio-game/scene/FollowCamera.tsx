"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useGameStore } from "../game/useGameStore";

const cameraTarget = new Vector3();
const lookAtTarget = new Vector3();
const FIXED_CAMERA_OFFSET = new Vector3(7.5, 9, 10);

export function FollowCamera() {
  const { camera } = useThree();
  const playerPosition = useGameStore((state) => state.playerPosition);

  useFrame((_, delta) => {
    lookAtTarget.set(playerPosition[0], 0.2, playerPosition[2]);
    cameraTarget.set(
      playerPosition[0] + FIXED_CAMERA_OFFSET.x,
      playerPosition[1] + FIXED_CAMERA_OFFSET.y,
      playerPosition[2] + FIXED_CAMERA_OFFSET.z,
    );
    camera.position.lerp(cameraTarget, 1 - Math.exp(-delta * 5));
    camera.lookAt(lookAtTarget);
  });

  return null;
}
