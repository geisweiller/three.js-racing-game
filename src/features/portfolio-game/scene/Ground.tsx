export function Ground() {
  return (
    <group>
      <mesh receiveShadow position={[0, -0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 36]} />
        <meshStandardMaterial color="#6fb66f" />
      </mesh>
    </group>
  );
}
