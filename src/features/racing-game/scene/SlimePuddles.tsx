"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { MeshStandardMaterial, type Group, type Mesh, type Object3D } from "three";
import { withAssetBase } from "../game/assetPath";
import { useGameStore, type DroppedSlimePuddle } from "../game/useGameStore";

const GOO_MODEL_PATH = "/game-assets/effects/goo.glb";
const GOO_MODEL_SCALE = 0.36;

function isMesh(object: Object3D): object is Mesh {
  return "isMesh" in object;
}

function cloneGoo(source: Object3D) {
  const clone = source.clone(true);
  const slimeMaterial = new MeshStandardMaterial({
    color: "#5eea62",
    emissive: "#123f18",
    emissiveIntensity: 0.18,
    metalness: 0,
    roughness: 0.48,
  });

  clone.traverse((child) => {
    if (isMesh(child)) {
      child.castShadow = false;
      child.material = slimeMaterial;
      child.receiveShadow = true;
    }
  });

  return clone;
}

export function SlimePuddles() {
  const droppedSlimePuddles = useGameStore((state) => state.droppedSlimePuddles);
  const { scene } = useGLTF(withAssetBase(GOO_MODEL_PATH));
  const gooModel = useMemo(() => cloneGoo(scene), [scene]);

  return (
    <group>
      {droppedSlimePuddles.map((puddle) => (
        <SlimePuddle gooModel={gooModel} key={puddle.id} puddle={puddle} />
      ))}
    </group>
  );
}

function SlimePuddle({ gooModel, puddle }: { gooModel: Object3D; puddle: DroppedSlimePuddle }) {
  const groupRef = useRef<Group>(null);
  const model = useMemo(() => gooModel.clone(true), [gooModel]);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.4 + puddle.id) * 0.025;
    groupRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <group
      ref={groupRef}
      position={[puddle.position[0], 0.095, puddle.position[2]]}
      rotation={[0, puddle.id * 0.47, 0]}
    >
      <primitive object={model} scale={GOO_MODEL_SCALE} />
    </group>
  );
}
