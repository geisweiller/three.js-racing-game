"use client";

/* eslint-disable react-hooks/immutability -- Three.js cameras are animated imperatively in the frame loop. */

import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { useGameStore } from "../game/useGameStore";

const cameraTarget = new Vector3();
const lookAtTarget = new Vector3();
const forward = new Vector3();
const FIXED_CAMERA_OFFSET = new Vector3(7.5, 9, 10);
const TOP_FOV = 42;
const THIRD_PERSON_FOV = 58;
const THIRD_PERSON_DISTANCE = 6.2;
const THIRD_PERSON_HEIGHT = 2.3;
const THIRD_PERSON_LOOK_AHEAD = 3.2;

export function FollowCamera() {
  const { camera } = useThree();
  const cameraMode = useGameStore((state) => state.cameraMode);
  const playerHeading = useGameStore((state) => state.playerHeading);
  const playerPosition = useGameStore((state) => state.playerPosition);

  useFrame((_, delta) => {
    const smoothing = 1 - Math.exp(-delta * (cameraMode === "top" ? 5 : 7));

    if (cameraMode === "thirdPerson") {
      forward.set(Math.sin(playerHeading), 0, Math.cos(playerHeading));
      lookAtTarget.set(
        playerPosition[0] + forward.x * THIRD_PERSON_LOOK_AHEAD,
        playerPosition[1] + 0.7,
        playerPosition[2] + forward.z * THIRD_PERSON_LOOK_AHEAD,
      );
      cameraTarget.set(
        playerPosition[0] - forward.x * THIRD_PERSON_DISTANCE,
        playerPosition[1] + THIRD_PERSON_HEIGHT,
        playerPosition[2] - forward.z * THIRD_PERSON_DISTANCE,
      );
    } else {
      lookAtTarget.set(playerPosition[0], 0.2, playerPosition[2]);
      cameraTarget.set(
        playerPosition[0] + FIXED_CAMERA_OFFSET.x,
        playerPosition[1] + FIXED_CAMERA_OFFSET.y,
        playerPosition[2] + FIXED_CAMERA_OFFSET.z,
      );
    }

    camera.position.lerp(cameraTarget, smoothing);
    camera.lookAt(lookAtTarget);

    if (camera instanceof PerspectiveCamera) {
      const targetFov = cameraMode === "thirdPerson" ? THIRD_PERSON_FOV : TOP_FOV;
      camera.fov = MathUtils.lerp(camera.fov, targetFov, smoothing);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
