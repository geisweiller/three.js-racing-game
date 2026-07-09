"use client";

import { Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { ExperienceScene } from "@/features/portfolio-game/scene/ExperienceScene";

function SceneLoading() {
  return (
    <Html center>
      <div className="rounded-full bg-[#111418]/85 px-4 py-2 text-sm text-[#f8f3e8]/75 shadow-lg backdrop-blur">
        Carregando modelo
      </div>
    </Html>
  );
}

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
      <Suspense fallback={<SceneLoading />}>
        <ExperienceScene />
      </Suspense>
    </Canvas>
  );
}
