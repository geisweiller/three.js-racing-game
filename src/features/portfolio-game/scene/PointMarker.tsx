import type { PointOfInterest } from "../data/pointsOfInterest";

type PointMarkerProps = {
  point: PointOfInterest;
  isActive: boolean;
};

export function PointMarker({ point, isActive }: PointMarkerProps) {
  return (
    <group position={[point.position[0], 0.12, point.position[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[point.radius * 0.85, point.radius, 48]} />
        <meshStandardMaterial
          color={isActive ? "#f6d365" : "#ffffff"}
          emissive={isActive ? "#7a4f00" : "#111111"}
          transparent
          opacity={isActive ? 0.85 : 0.35}
        />
      </mesh>
    </group>
  );
}
