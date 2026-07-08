import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import type { Mesh, Object3D } from "three";
import {
  gridToWorld,
  MODEL_SCALE,
  ORIENT_DEG,
  trackCells,
  type TrackModelKey,
} from "../data/trackData";

const MODEL_BASE_PATH = "/starter-kit-racing/models";

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

function TrackPiece({
  modelKey,
  gx,
  gz,
  orient,
}: {
  modelKey: TrackModelKey;
  gx: number;
  gz: number;
  orient: keyof typeof ORIENT_DEG;
}) {
  const { scene } = useGLTF(`${MODEL_BASE_PATH}/${modelKey}.glb`);
  const model = useMemo(() => cloneWithShadows(scene), [scene]);
  const position = gridToWorld(gx, gz);

  return (
    <primitive
      object={model}
      position={[position[0], 0, position[2]]}
      rotation={[0, ORIENT_DEG[orient] * (Math.PI / 180), 0]}
      scale={MODEL_SCALE}
    />
  );
}

export function RacingTrack() {
  return (
    <group>
      {trackCells.map(([gx, gz, modelKey, orient]) => (
        <TrackPiece
          key={`${gx}-${gz}-${modelKey}`}
          gx={gx}
          gz={gz}
          modelKey={modelKey}
          orient={orient}
        />
      ))}
    </group>
  );
}

useGLTF.preload(`${MODEL_BASE_PATH}/track-straight.glb`);
useGLTF.preload(`${MODEL_BASE_PATH}/track-corner.glb`);
useGLTF.preload(`${MODEL_BASE_PATH}/track-finish.glb`);
useGLTF.preload(`${MODEL_BASE_PATH}/track-bump.glb`);
