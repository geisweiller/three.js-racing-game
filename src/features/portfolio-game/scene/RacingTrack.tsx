import { roadTiles } from "../data/trackData";
import { GlbModel } from "./GlbModel";

const ROAD_BASE_PATH = "/game-assets/roads";
const ROAD_MODEL_SCALE = 1.85;
const roadModelByKind = {
  curve: "road-bend.glb",
  roundabout: "road-roundabout.glb",
  straight: "road-straight.glb",
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
    </group>
  );
}
