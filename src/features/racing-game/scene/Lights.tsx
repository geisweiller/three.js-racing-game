export function Lights() {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight
        castShadow
        intensity={1.4}
        position={[6, 10, 8]}
        shadow-bias={-0.0001}
        shadow-camera-bottom={-40}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-mapSize={[1024, 1024]}
        shadow-normalBias={0.04}
      />
    </>
  );
}
