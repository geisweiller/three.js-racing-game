import { ROAD_VISUAL_SIZE, roadTiles, trackDecorations } from "../data/trackData";
import { GlbModel } from "./GlbModel";

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
const decorationModelByKind = {
  buildingA: "/game-assets/commercial/building-a.glb",
  buildingD: "/game-assets/commercial/building-d.glb",
  empty: `${STARTER_TRACK_BASE_PATH}/decoration-empty.glb`,
  forest: `${STARTER_TRACK_BASE_PATH}/decoration-forest.glb`,
  skyscraperA: "/game-assets/commercial/building-skyscraper-a.glb",
  treeSmall: "/game-assets/suburban/tree-small.glb",
  workshop: `${STARTER_TRACK_BASE_PATH}/decoration-tents.glb`,
};
const decorationScaleByKind = {
  buildingA: 0.9,
  buildingD: 0.9,
  empty: STARTER_TRACK_MODEL_SCALE,
  forest: STARTER_TRACK_MODEL_SCALE,
  skyscraperA: 0.75,
  treeSmall: 1,
  workshop: STARTER_TRACK_MODEL_SCALE,
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

      {trackDecorations.map((decoration) => (
        <GlbModel
          key={decoration.id}
          path={decorationModelByKind[decoration.kind]}
          position={decoration.position}
          rotation={[0, decoration.rotationY ?? 0, 0]}
          modelScale={decoration.scale ?? decorationScaleByKind[decoration.kind]}
        />
      ))}
    </group>
  );
}
