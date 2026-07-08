import { GlbModel } from "./GlbModel";

const commercialPath = "/game-assets/commercial";
const suburbanPath = "/game-assets/suburban";

export function WorldObjects() {
  return (
    <group>
      <GlbModel path={`${commercialPath}/building-a.glb`} position={[-6, 0, -6]} />
      <GlbModel path={`${commercialPath}/building-d.glb`} position={[6, 0, -6]} />
      <GlbModel path={`${commercialPath}/building-skyscraper-a.glb`} position={[7.5, 0, 6]} />

      {[
        [-8, -8],
        [-8, 8],
        [8, -8],
        [8, 8],
        [-4, 7],
        [4, -7],
      ].map(([x, z]) => (
        <GlbModel key={`${x}-${z}`} path={`${suburbanPath}/tree-small.glb`} position={[x, 0, z]} />
      ))}
    </group>
  );
}
