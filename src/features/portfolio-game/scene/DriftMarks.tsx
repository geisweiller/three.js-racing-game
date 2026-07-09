"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  DynamicDrawUsage,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from "three";
import { getVehicleOption } from "../data/vehicleOptions";
import { useGameStore } from "../game/useGameStore";

const MAX_SEGMENTS = 4096;
const VERTS_PER_SEGMENT = 6;
const FLOATS_PER_SEGMENT = VERTS_PER_SEGMENT * 3;
const COLOR_FLOATS_PER_SEGMENT = VERTS_PER_SEGMENT * 4;
const GROUND_Y = 0.055;
const MIN_SEGMENT_LENGTH = 0.02;
const DRIFT_THRESHOLD = 0.55;
const MIN_DRIFT_SPEED = 2.6;
const MIN_DRIFT_TURN_RATE = 0.35;

type Trail = {
  active: boolean;
  colors: Float32Array;
  drawCount: number;
  geometry: BufferGeometry;
  mesh: Mesh;
  positions: Float32Array;
  prev: Vector3;
  segmentIndex: number;
};

const previous = new Vector3();
const current = new Vector3();
const direction = new Vector3();
const side = new Vector3();
const pLeft = new Vector3();
const pRight = new Vector3();
const cLeft = new Vector3();
const cRight = new Vector3();

function createTrail(material: MeshBasicMaterial): Trail {
  const positions = new Float32Array(MAX_SEGMENTS * FLOATS_PER_SEGMENT);
  const colors = new Float32Array(MAX_SEGMENTS * COLOR_FLOATS_PER_SEGMENT);

  for (let i = 0; i < MAX_SEGMENTS * VERTS_PER_SEGMENT; i += 1) {
    const offset = i * 4;
    colors[offset] = 1;
    colors[offset + 1] = 1;
    colors[offset + 2] = 1;
  }

  const geometry = new BufferGeometry();
  const positionAttribute = new BufferAttribute(positions, 3);
  const colorAttribute = new BufferAttribute(colors, 4);
  positionAttribute.setUsage(DynamicDrawUsage);
  colorAttribute.setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("color", colorAttribute);
  geometry.setDrawRange(0, 0);

  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;

  return {
    active: false,
    colors,
    drawCount: 0,
    geometry,
    mesh,
    positions,
    prev: new Vector3(),
    segmentIndex: 0,
  };
}

function writeSegment(trail: Trail, from: Vector3, to: Vector3, alpha: number, markWidth: number) {
  direction.subVectors(to, from);
  direction.y = 0;
  const length = direction.length();

  if (length < MIN_SEGMENT_LENGTH) {
    return;
  }

  direction.divideScalar(length);
  side.set(direction.z, 0, -direction.x).multiplyScalar(markWidth);
  pLeft.copy(from).add(side);
  pRight.copy(from).sub(side);
  cLeft.copy(to).add(side);
  cRight.copy(to).sub(side);

  const offset = trail.segmentIndex * FLOATS_PER_SEGMENT;
  const positions = trail.positions;
  positions[offset] = pLeft.x;
  positions[offset + 1] = pLeft.y;
  positions[offset + 2] = pLeft.z;
  positions[offset + 3] = pRight.x;
  positions[offset + 4] = pRight.y;
  positions[offset + 5] = pRight.z;
  positions[offset + 6] = cLeft.x;
  positions[offset + 7] = cLeft.y;
  positions[offset + 8] = cLeft.z;
  positions[offset + 9] = pRight.x;
  positions[offset + 10] = pRight.y;
  positions[offset + 11] = pRight.z;
  positions[offset + 12] = cRight.x;
  positions[offset + 13] = cRight.y;
  positions[offset + 14] = cRight.z;
  positions[offset + 15] = cLeft.x;
  positions[offset + 16] = cLeft.y;
  positions[offset + 17] = cLeft.z;

  const colorOffset = trail.segmentIndex * COLOR_FLOATS_PER_SEGMENT;
  for (let i = 0; i < VERTS_PER_SEGMENT; i += 1) {
    trail.colors[colorOffset + i * 4 + 3] = alpha;
  }

  trail.geometry.attributes.position.needsUpdate = true;
  trail.geometry.attributes.color.needsUpdate = true;
  trail.segmentIndex = (trail.segmentIndex + 1) % MAX_SEGMENTS;

  if (trail.drawCount < MAX_SEGMENTS * VERTS_PER_SEGMENT) {
    trail.drawCount += VERTS_PER_SEGMENT;
    trail.geometry.setDrawRange(0, trail.drawCount);
  }
}

function trackTrail(
  trail: Trail,
  wheelPosition: Vector3,
  intensity: number,
  emit: boolean,
  markWidth: number,
) {
  current.copy(wheelPosition);
  current.y = GROUND_Y;

  if (emit && trail.active) {
    const alpha = Math.min(1, Math.max(0, (intensity - DRIFT_THRESHOLD) / 1.4));
    previous.copy(trail.prev);
    writeSegment(trail, previous, current, alpha, markWidth);
  }

  trail.prev.copy(current);
  trail.active = emit;
}

export function DriftMarks() {
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 0x111111,
        depthWrite: false,
        opacity: 0.55,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
        side: DoubleSide,
        transparent: true,
        vertexColors: true,
      }),
    [],
  );
  const trails = useMemo(() => [createTrail(material), createTrail(material)], [material]);

  useFrame(() => {
    const state = useGameStore.getState();
    const vehicle = getVehicleOption(state.selectedVehicleId);
    const { markWidth, rearAxleOffset, wheelHalfWidth } = vehicle.trail;
    const intensity = state.playerDriftIntensity;
    const emit =
      intensity > DRIFT_THRESHOLD &&
      Math.abs(state.playerSpeed) > MIN_DRIFT_SPEED &&
      Math.abs(state.playerAngularSpeed) > MIN_DRIFT_TURN_RATE;
    const forwardX = Math.sin(state.playerHeading);
    const forwardZ = Math.cos(state.playerHeading);
    const rightX = Math.cos(state.playerHeading);
    const rightZ = -Math.sin(state.playerHeading);

    const rearCenterX = state.playerPosition[0] + forwardX * rearAxleOffset;
    const rearCenterZ = state.playerPosition[2] + forwardZ * rearAxleOffset;

    trackTrail(
      trails[0],
      new Vector3(
        rearCenterX - rightX * wheelHalfWidth,
        GROUND_Y,
        rearCenterZ - rightZ * wheelHalfWidth,
      ),
      intensity,
      emit,
      markWidth,
    );
    trackTrail(
      trails[1],
      new Vector3(
        rearCenterX + rightX * wheelHalfWidth,
        GROUND_Y,
        rearCenterZ + rightZ * wheelHalfWidth,
      ),
      intensity,
      emit,
      markWidth,
    );
  });

  return (
    <group>
      {trails.map((trail, index) => (
        <primitive key={index} object={trail.mesh} />
      ))}
    </group>
  );
}
