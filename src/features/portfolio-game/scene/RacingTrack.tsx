import { ROAD_VISUAL_SIZE, roadTiles, trackProps } from "../data/trackData";
import { GlbModel } from "./GlbModel";

const ROAD_BASE_PATH = "/game-assets/roads";
const STARTER_TRACK_BASE_PATH = "/starter-kit-racing/models";
const STARTER_CELL_RAW = 9.99;
// No Starter Kit Racing cada peca ocupa uma celula de 9.99 unidades.
// ROAD_VISUAL_SIZE deixa o asfalto mais largo sem mudar o espacamento dos
// tiles, aproximando a sensacao visual do Starter Kit Racing original.
const STARTER_TRACK_MODEL_SCALE = ROAD_VISUAL_SIZE / STARTER_CELL_RAW;
const roadModelByKind = {
  curve: "track-corner.glb",
  finish: "track-finish.glb",
  straight: "track-straight.glb",
};
const propModelByKind = {
  cone: "construction-cone.glb",
  light: "light-curved.glb",
};

export function RacingTrack() {
  return (
    <group>
      {roadTiles.map((tile) => (
        <GlbModel
          key={tile.id}
          path={`${STARTER_TRACK_BASE_PATH}/${roadModelByKind[tile.kind]}`}
          position={tile.position}
          rotation={[0, tile.rotationY ?? 0, 0]}
          modelScale={STARTER_TRACK_MODEL_SCALE}
        />
      ))}

      {trackProps.map((prop) => (
        <GlbModel
          key={prop.id}
          path={`${ROAD_BASE_PATH}/${propModelByKind[prop.kind]}`}
          position={prop.position}
          rotation={[0, prop.rotationY ?? 0, 0]}
          modelScale={prop.scale ?? 2.12}
        />
      ))}
    </group>
  );
}
