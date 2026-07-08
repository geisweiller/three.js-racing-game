function Building({
  color,
  position,
  scale = [1.5, 1.5, 1.5],
}: {
  color: string;
  position: [number, number, number];
  scale?: [number, number, number];
}) {
  return (
    <mesh castShadow receiveShadow position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function WorldObjects() {
  return (
    <group>
      <Building color="#d65a45" position={[0, 0.75, 10.4]} scale={[2.2, 1.5, 1.8]} />
      <mesh castShadow position={[0, 1.75, 10.4]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.7, 1.1, 4]} />
        <meshStandardMaterial color="#80352c" />
      </mesh>

      <mesh receiveShadow position={[-10.8, 0.03, 4.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[4.4, 2.8, 0.08]} />
        <meshStandardMaterial color="#b8753f" />
      </mesh>
      <mesh position={[-10.8, 0.08, 4.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.5, 32]} />
        <meshStandardMaterial color="#f8f3e8" />
      </mesh>

      <Building color="#5f7adb" position={[10.7, 1, -2.8]} scale={[1.4, 2, 1.4]} />
      <Building color="#55a88a" position={[11.4, 0.8, -0.8]} scale={[1.2, 1.6, 1.2]} />
      <Building color="#f0b64d" position={[10.2, 1.2, -4.7]} scale={[1.3, 2.4, 1.3]} />

      <mesh castShadow receiveShadow position={[-10.3, 0.2, -3.5]}>
        <cylinderGeometry args={[1.4, 1.4, 0.4, 32]} />
        <meshStandardMaterial color="#f8f3e8" />
      </mesh>

      <Building color="#59616f" position={[0, 0.55, -10.5]} scale={[5, 1.1, 0.7]} />
      <Building color="#7d8da3" position={[10.5, 0.8, 5.5]} scale={[2.2, 1.6, 1.2]} />

      {[
        [-12, -9],
        [-12, 9],
        [12, -9],
        [12, 9],
        [-4, 11.5],
        [4, -11.5],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} castShadow position={[x, 0.7, z]}>
          <coneGeometry args={[0.7, 1.4, 8]} />
          <meshStandardMaterial color="#2f6f49" />
        </mesh>
      ))}
    </group>
  );
}
