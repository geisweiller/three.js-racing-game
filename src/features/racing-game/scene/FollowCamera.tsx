"use client";

/* eslint-disable react-hooks/immutability -- Three.js cameras are animated imperatively in the frame loop. */

import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { useGameStore } from "../game/useGameStore";

const cameraTarget = new Vector3();
const lookAtTarget = new Vector3();
const forward = new Vector3();
const CURRENT_FOV = 62;
const CURRENT_DISTANCE = 4.4;
const CURRENT_HEIGHT = 1.65;
const CURRENT_LOOK_AHEAD = 2.4;
const CLOSE_FOV = 68;
const CLOSE_DISTANCE = 2.65;
const CLOSE_HEIGHT = 1.15;
const CLOSE_LOOK_AHEAD = 1.75;

export function FollowCamera() {
  const { camera } = useThree();
  const cameraMode = useGameStore((state) => state.cameraMode);
  const playerHeading = useGameStore((state) => state.playerHeading);
  const playerPosition = useGameStore((state) => state.playerPosition);

  useFrame((_, delta) => {
    const smoothing = 1 - Math.exp(-delta * 7);
    const distance = cameraMode === "close" ? CLOSE_DISTANCE : CURRENT_DISTANCE;
    const height = cameraMode === "close" ? CLOSE_HEIGHT : CURRENT_HEIGHT;
    const lookAhead = cameraMode === "close" ? CLOSE_LOOK_AHEAD : CURRENT_LOOK_AHEAD;

    forward.set(Math.sin(playerHeading), 0, Math.cos(playerHeading));
    lookAtTarget.set(
      playerPosition[0] + forward.x * lookAhead,
      playerPosition[1] + 0.7,
      playerPosition[2] + forward.z * lookAhead,
    );
    cameraTarget.set(
      playerPosition[0] - forward.x * distance,
      playerPosition[1] + height,
      playerPosition[2] - forward.z * distance,
    );

    camera.position.lerp(cameraTarget, smoothing);
    camera.lookAt(lookAtTarget);

    if (camera instanceof PerspectiveCamera) {
      const targetFov = cameraMode === "close" ? CLOSE_FOV : CURRENT_FOV;
      camera.fov = MathUtils.lerp(camera.fov, targetFov, smoothing);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
