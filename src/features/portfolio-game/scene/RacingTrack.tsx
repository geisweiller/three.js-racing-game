import { roadTiles, trackProps } from "../data/trackData";
import { GlbModel } from "./GlbModel";

const ROAD_BASE_PATH = "/game-assets/roads";
const ROAD_MODEL_SCALE = 2.05;
const roadModelByKind = {
  curve: "road-bend.glb",
  roundabout: "road-roundabout.glb",
  straight: "road-straight.glb",
};
const propModelByKind = {
  cone: "construction-cone.glb",
  light: "light-curved.glb",
  straightBarrier: "road-straight-barrier.glb",
};

export function RacingTrack() {
  return (
    <group>
      {roadTiles.map((tile) => (
        <GlbModel
          key={tile.id}
          path={`${ROAD_BASE_PATH}/${roadModelByKind[tile.kind]}`}
          position={tile.position}
          rotation={[0, tile.rotationY ?? 0, 0]}
          modelScale={ROAD_MODEL_SCALE}
        />
      ))}

      {trackProps.map((prop) => (
        <GlbModel
          key={prop.id}
          path={`${ROAD_BASE_PATH}/${propModelByKind[prop.kind]}`}
          position={prop.position}
          rotation={[0, prop.rotationY ?? 0, 0]}
          modelScale={prop.scale ?? ROAD_MODEL_SCALE}
        />
      ))}
    </group>
  );
}
