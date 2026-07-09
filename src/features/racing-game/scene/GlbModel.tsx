"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import type { Mesh, Object3D } from "three";
import { withAssetBase } from "../game/assetPath";

type GlbModelProps = {
  path: string;
  modelScale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
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

export function GlbModel({ path, modelScale = 1, position, rotation }: GlbModelProps) {
  const assetPath = withAssetBase(path);
  const { scene } = useGLTF(assetPath);
  const model = useMemo(() => cloneWithShadows(scene), [scene]);

  return (
    <group position={position} rotation={rotation}>
      <primitive object={model} scale={modelScale} />
    </group>
  );
}
