"use client";

/* eslint-disable react-hooks/immutability -- Three.js particle pools are mutated in the frame loop for performance. */

import { useFrame, useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  Points,
  PointsMaterial,
  Texture,
  TextureLoader,
  Vector3,
} from "three";
import { getVehicleOption } from "../data/vehicleOptions";
import { useGameStore } from "../game/useGameStore";

const POOL_SIZE = 1280;
const PARTICLES_PER_EMIT = 1;
const EMIT_JITTER = 0.15;
const BASE_SIZE = 0.65;
const MAX_LIFE = 1.4;
const INV_MAX_LIFE = 1 / MAX_LIFE;
const DRIFT_THRESHOLD = 0.55;
const MIN_DRIFT_SPEED = 2.6;
const MIN_DRIFT_TURN_RATE = 0.35;
const ROAD_SMOKE_Y = 0.24;

type SmokeParticle = {
  initialSize: number;
  life: number;
  velocity: Vector3;
};

type SmokeSystem = {
  emitIndex: number;
  opacityAttribute: BufferAttribute;
  opacities: Float32Array;
  particles: SmokeParticle[];
  points: Points;
  positionAttribute: BufferAttribute;
  positions: Float32Array;
  sizeAttribute: BufferAttribute;
  sizes: Float32Array;
};

const wheelLeft = new Vector3();
const wheelRight = new Vector3();

function createSmokeSystem(map: Texture): SmokeSystem {
  const positions = new Float32Array(POOL_SIZE * 3);
  const opacities = new Float32Array(POOL_SIZE);
  const sizes = new Float32Array(POOL_SIZE);
  const geometry = new BufferGeometry();
  const positionAttribute = new BufferAttribute(positions, 3);
  const opacityAttribute = new BufferAttribute(opacities, 1);
  const sizeAttribute = new BufferAttribute(sizes, 1);

  positionAttribute.setUsage(DynamicDrawUsage);
  opacityAttribute.setUsage(DynamicDrawUsage);
  sizeAttribute.setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", positionAttribute);
  geometry.setAttribute("aOpacity", opacityAttribute);
  geometry.setAttribute("aSize", sizeAttribute);

  const material = new PointsMaterial({
    color: 0xb8bac0,
    depthTest: false,
    depthWrite: false,
    map,
    size: 1,
    sizeAttenuation: true,
    transparent: true,
  });

  // Igual ao Starter Kit Racing: PointsMaterial nao tem tamanho/opacidade por
  // particula, entao injetamos atributos no shader gerado pelo Three.
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = `attribute float aSize;
attribute float aOpacity;
varying float vOpacity;
${shader.vertexShader}`;
    shader.vertexShader = shader.vertexShader.replace(
      "void main() {",
      `void main() {
  vOpacity = aOpacity;`,
    );
    shader.vertexShader = shader.vertexShader.replace(
      "gl_PointSize = size;",
      "gl_PointSize = size * aSize;",
    );

    shader.fragmentShader = `varying float vOpacity;
${shader.fragmentShader}`;
    shader.fragmentShader = shader.fragmentShader.replace(
      "vec4 diffuseColor = vec4( diffuse, opacity );",
      "vec4 diffuseColor = vec4( diffuse, opacity * vOpacity );",
    );
  };

  const points = new Points(geometry, material);
  points.frustumCulled = false;

  const particles = Array.from({ length: POOL_SIZE }, () => ({
    initialSize: 0,
    life: 0,
    velocity: new Vector3(),
  }));

  return {
    emitIndex: 0,
    opacityAttribute,
    opacities,
    particles,
    points,
    positionAttribute,
    positions,
    sizeAttribute,
    sizes,
  };
}

function emitAt(system: SmokeSystem, x: number, y: number, z: number) {
  const index = system.emitIndex;
  const particle = system.particles[index];
  const positionOffset = index * 3;
  system.emitIndex = (index + 1) % POOL_SIZE;

  system.positions[positionOffset] = x + (Math.random() - 0.5) * EMIT_JITTER;
  system.positions[positionOffset + 1] = y + Math.random() * EMIT_JITTER;
  system.positions[positionOffset + 2] = z + (Math.random() - 0.5) * EMIT_JITTER;

  particle.initialSize = BASE_SIZE * (0.5 + Math.random() * 0.5);
  particle.velocity.set(
    (Math.random() - 0.5) * 0.2,
    0.5 + Math.random() * 0.5,
    (Math.random() - 0.5) * 0.2,
  );
  particle.life = MAX_LIFE;
}

export function SmokeTrails() {
  const smokeTexture = useLoader(TextureLoader, "/starter-kit-racing/sprites/smoke.png");
  const system = useMemo(() => createSmokeSystem(smokeTexture), [smokeTexture]);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    const selectedVehicle = getVehicleOption(state.selectedVehicleId);
    const shouldEmit =
      state.playerDriftIntensity > DRIFT_THRESHOLD &&
      Math.abs(state.playerSpeed) > MIN_DRIFT_SPEED &&
      Math.abs(state.playerAngularSpeed) > MIN_DRIFT_TURN_RATE;
    let aliveCount = 0;

    if (shouldEmit) {
      const { rearAxleOffset, wheelHalfWidth } = selectedVehicle.trail;
      const forwardX = Math.sin(state.playerHeading);
      const forwardZ = Math.cos(state.playerHeading);
      const rightX = Math.cos(state.playerHeading);
      const rightZ = -Math.sin(state.playerHeading);
      const rearCenterX = state.playerPosition[0] + forwardX * rearAxleOffset;
      const rearCenterZ = state.playerPosition[2] + forwardZ * rearAxleOffset;
      // O Starter emite em container.y + 0.05. Aqui os GLBs da pista ficam
      // mais altos depois da escala, entao mantemos a mesma logica e elevamos
      // apenas o plano de emissao para a fumaça nao nascer dentro do asfalto.
      const roadY = state.playerPosition[1] + ROAD_SMOKE_Y;

      wheelLeft.set(rearCenterX - rightX * wheelHalfWidth, roadY, rearCenterZ - rightZ * wheelHalfWidth);
      wheelRight.set(rearCenterX + rightX * wheelHalfWidth, roadY, rearCenterZ + rightZ * wheelHalfWidth);

      for (let i = 0; i < PARTICLES_PER_EMIT; i += 1) {
        emitAt(system, wheelLeft.x, roadY, wheelLeft.z);
        emitAt(system, wheelRight.x, roadY, wheelRight.z);
      }
    }

    const damping = 1 - delta;

    for (let i = 0; i < POOL_SIZE; i += 1) {
      const particle = system.particles[i];

      if (particle.life <= 0) {
        continue;
      }

      particle.life -= delta;

      if (particle.life <= 0) {
        system.opacities[i] = 0;
        aliveCount += 1;
        continue;
      }

      const age = 1 - particle.life * INV_MAX_LIFE;
      const positionOffset = i * 3;
      particle.velocity.multiplyScalar(damping);
      system.positions[positionOffset] += particle.velocity.x * delta;
      system.positions[positionOffset + 1] += particle.velocity.y * delta;
      system.positions[positionOffset + 2] += particle.velocity.z * delta;
      system.opacities[i] = (1 - age) * 0.12;
      system.sizes[i] = particle.initialSize * (0.45 + age * 1.7);
      aliveCount += 1;
    }

    if (shouldEmit || aliveCount > 0) {
      system.positionAttribute.needsUpdate = true;
      system.opacityAttribute.needsUpdate = true;
      system.sizeAttribute.needsUpdate = true;
    }
  });

  return <primitive object={system.points} />;
}
