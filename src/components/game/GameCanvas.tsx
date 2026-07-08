"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { ExperienceScene } from "@/features/portfolio-game/scene/ExperienceScene";

export function GameCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 9, 11], fov: 42 }}
      dpr={[1, 2]}
      gl={{ alpha: false }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      shadows
      className="h-full w-full"
    >
      <color attach="background" args={["#9bc3d5"]} />
      <Suspense fallback={null}>
        <ExperienceScene />
      </Suspense>
    </Canvas>
  );
}
