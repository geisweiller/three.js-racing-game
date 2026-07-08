export function Lights() {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight
        castShadow
        intensity={1.4}
        position={[6, 10, 8]}
        shadow-mapSize={[1024, 1024]}
      />
    </>
  );
}
