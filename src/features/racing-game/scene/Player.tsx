"use client";

/* eslint-disable react-hooks/immutability -- Three.js Object3D transforms are animated imperatively in the frame loop. */

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { MathUtils, type Group, type Mesh, type Object3D } from "three";
import { getVehicleOption, getVehicleVariant } from "../data/vehicleOptions";
import { withAssetBase } from "../game/assetPath";
import { updateVehicle, type MovementInput, type VehicleState } from "../game/movement";
import { resetPlayerRuntime, updatePlayerRuntime } from "../game/playerRuntime";
import { useGameStore } from "../game/useGameStore";
import {
  constrainPointToTrack,
  isPointOnTrack,
  START_HEADING,
  START_POSITION,
} from "../data/trackData";

type PlayerProps = {
  input: MovementInput;
};

const VEHICLE_COLLIDER_RADIUS = 0.26;
const TRACK_COLLISION_OUTSET = VEHICLE_COLLIDER_RADIUS / 2;
const RESPAWN_BLINK_DURATION = 2.5;
const RESPAWN_BLINK_INTERVAL = 0.16;
const FINISH_TRIGGER_RADIUS = 1.3;
const LAP_ARM_DISTANCE = 7;
const ITEM_BOOST_MULTIPLIER = 1.65;
const SLIME_GRACE_DURATION = 0.55;
const SLIME_HIT_RADIUS = 0.82;
const SLIME_SPIN_DURATION = 0.7;

type VehicleVisual = {
  body: Object3D | null;
  frontWheels: Object3D[];
  model: Object3D;
  wheels: Object3D[];
};

function isMesh(object: Object3D): object is Mesh {
  return "isMesh" in object;
}

function lerpAngle(a: number, b: number, t: number) {
  let diff = b - a;

  while (diff > Math.PI) {
    diff -= Math.PI * 2;
  }

  while (diff < -Math.PI) {
    diff += Math.PI * 2;
  }

  return a + diff * t;
}

function cloneVehicle(source: Object3D, wheelOutset = 0): VehicleVisual {
  const model = source.clone(true);
  const wheels: Object3D[] = [];
  const frontWheels: Object3D[] = [];
  let body: Object3D | null = null;
  let firstBodyCandidate: Object3D | null = null;

  model.traverse((child) => {
    const name = child.name.toLowerCase();

    if (isMesh(child)) {
      child.castShadow = true;
      child.receiveShadow = true;
    }

    if (name.includes("wheel")) {
      child.rotation.order = "YXZ";
      child.position.x += Math.sign(child.position.x) * wheelOutset;
      wheels.push(child);

      if (name.includes("front")) {
        frontWheels.push(child);
      }

      return;
    }

    if (name === "body") {
      child.rotation.order = "YXZ";
      body = child;
      return;
    }

    if (!firstBodyCandidate && isMesh(child) && !name.includes("character")) {
      child.rotation.order = "YXZ";
      firstBodyCandidate = child;
    }
  });
  return {
    body: body ?? firstBodyCandidate,
    frontWheels,
    model,
    wheels,
  };
}

export function Player({ input }: PlayerProps) {
  const playerRef = useRef<Group>(null);
  const impactCooldown = useRef(0);
  const lapHudTimer = useRef(0);
  const lapStartTime = useRef(0);
  const lapArmed = useRef(false);
  const previousItemInput = useRef(false);
  const respawnBlinkRemaining = useRef(0);
  const shieldRef = useRef<Group>(null);
  const slimeSpinDirection = useRef(1);
  const slimeSpinRemaining = useRef(0);
  const vehicleState = useRef<VehicleState>({
    acceleration: 0,
    angularSpeed: 0,
    driftIntensity: 0,
    position: START_POSITION,
    heading: START_HEADING,
    speed: 0,
  });
  const respawnVersion = useGameStore((state) => state.respawnVersion);
  const selectedVehicleId = useGameStore((state) => state.selectedVehicleId);
  const selectedVehicleVariantId = useGameStore((state) => state.selectedVehicleVariantId);
  const completeLap = useGameStore((state) => state.completeLap);
  const tickItems = useGameStore((state) => state.tickItems);
  const activateHeldItem = useGameStore((state) => state.activateHeldItem);
  const setCurrentLapTime = useGameStore((state) => state.setCurrentLapTime);
  const selectedVehicle = getVehicleOption(selectedVehicleId);
  const selectedVehicleVariant = getVehicleVariant(selectedVehicle, selectedVehicleVariantId);
  const vehicleModelPath = selectedVehicleVariant.modelPath;
  const vehicleAssetPath = withAssetBase(vehicleModelPath);
  const vehicleScale = selectedVehicleVariant.scale ?? selectedVehicle.scale;
  const vehicleWheelOutset = selectedVehicleVariant.wheelOutset ?? selectedVehicle.wheelOutset;
  const { scene } = useGLTF(vehicleAssetPath);
  const vehicleVisual = useMemo(
    () => cloneVehicle(scene, vehicleWheelOutset),
    [scene, vehicleWheelOutset],
  );
  const bodyRef = useRef<Object3D | null>(null);
  const frontWheelsRef = useRef<Object3D[]>([]);
  const wheelsRef = useRef<Object3D[]>([]);

  useEffect(() => {
    bodyRef.current = vehicleVisual.body;
    frontWheelsRef.current = vehicleVisual.frontWheels;
    wheelsRef.current = vehicleVisual.wheels;
  }, [vehicleVisual]);

  useEffect(() => {
    lapArmed.current = false;
    lapHudTimer.current = 0;
    lapStartTime.current = 0;
    respawnBlinkRemaining.current = RESPAWN_BLINK_DURATION;
    slimeSpinRemaining.current = 0;
    resetPlayerRuntime();

    vehicleState.current = {
      acceleration: 0,
      angularSpeed: 0,
      driftIntensity: 0,
      position: START_POSITION,
      heading: START_HEADING,
      speed: 0,
    };

    if (playerRef.current) {
      playerRef.current.position.set(...START_POSITION);
      playerRef.current.rotation.y = START_HEADING;
    }
  }, [respawnVersion]);

  useFrame((state, delta) => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    respawnBlinkRemaining.current = Math.max(0, respawnBlinkRemaining.current - delta);
    player.visible =
      respawnBlinkRemaining.current === 0 ||
      Math.floor(respawnBlinkRemaining.current / RESPAWN_BLINK_INTERVAL) % 2 === 0;

    if (lapStartTime.current === 0) {
      lapStartTime.current = state.clock.elapsedTime;
    }

    const itemBoostActive = useGameStore.getState().itemBoostRemaining > 0;
    const boostMultiplier = itemBoostActive ? ITEM_BOOST_MULTIPLIER : 1;

    if (input.item && !previousItemInput.current) {
      activateHeldItem({
        heading: vehicleState.current.heading,
        position: vehicleState.current.position,
        time: state.clock.elapsedTime,
      });
    }

    previousItemInput.current = input.item;
    tickItems(delta);

    const surface = isPointOnTrack(vehicleState.current.position, 0.35) ? "track" : "offroad";
    let nextState = updateVehicle(
      vehicleState.current,
      input,
      delta,
      surface,
      selectedVehicle.handling,
      boostMultiplier,
    );
    const trackConstraint = constrainPointToTrack(
      nextState.position,
      VEHICLE_COLLIDER_RADIUS,
      TRACK_COLLISION_OUTSET,
    );
    let impactIntensity = 0;

    impactCooldown.current = Math.max(0, impactCooldown.current - delta);

    if (trackConstraint.collided) {
      const incomingSpeed = Math.abs(nextState.speed);
      const shieldActive = useGameStore.getState().itemShieldRemaining > 0;

      nextState = {
        ...nextState,
        angularSpeed: nextState.angularSpeed * (shieldActive ? 0.8 : 0.25),
        driftIntensity: 0,
        position: trackConstraint.position,
        speed: shieldActive ? nextState.speed * 0.62 : -nextState.speed * 0.18,
      };

      if (!shieldActive && incomingSpeed > 1.1 && impactCooldown.current === 0) {
        impactIntensity = MathUtils.clamp(incomingSpeed / selectedVehicle.handling.maxForwardSpeed, 0, 1);
        impactCooldown.current = 0.28;
      }
    }

    const droppedSlimePuddles = useGameStore.getState().droppedSlimePuddles;
    const hitSlimePuddle = droppedSlimePuddles.find(
      (puddle) =>
        state.clock.elapsedTime - puddle.createdAt > SLIME_GRACE_DURATION &&
        Math.hypot(
          nextState.position[0] - puddle.position[0],
          nextState.position[2] - puddle.position[2],
        ) <= SLIME_HIT_RADIUS,
    );

    if (hitSlimePuddle) {
      const shieldActive = useGameStore.getState().itemShieldRemaining > 0;

      useGameStore.getState().removeSlimePuddle(hitSlimePuddle.id);

      if (!shieldActive) {
        slimeSpinDirection.current = Math.sign(nextState.angularSpeed || nextState.speed || 1);
        slimeSpinRemaining.current = SLIME_SPIN_DURATION;

        nextState = {
          ...nextState,
          angularSpeed: nextState.angularSpeed + Math.sign(nextState.angularSpeed || 1) * 5.1,
          driftIntensity: Math.max(nextState.driftIntensity, 1.45),
          speed: nextState.speed * 0.36,
        };

        if (impactCooldown.current === 0) {
          impactIntensity = 0.42;
          impactCooldown.current = 0.32;
        }
      }
    }

    vehicleState.current = nextState;

    const distanceFromFinish = Math.hypot(
      nextState.position[0] - START_POSITION[0],
      nextState.position[2] - START_POSITION[2],
    );

    if (distanceFromFinish > LAP_ARM_DISTANCE) {
      lapArmed.current = true;
    }

    if (lapArmed.current && distanceFromFinish <= FINISH_TRIGGER_RADIUS && nextState.speed > 0.5) {
      const lapTime = state.clock.elapsedTime - lapStartTime.current;

      completeLap(lapTime);
      lapStartTime.current = state.clock.elapsedTime;
      lapHudTimer.current = 0;
      lapArmed.current = false;
    } else {
      lapHudTimer.current += delta;

      if (lapHudTimer.current >= 0.1) {
        lapHudTimer.current = 0;
        setCurrentLapTime(state.clock.elapsedTime - lapStartTime.current);
      }
    }

    player.position.set(...nextState.position);
    slimeSpinRemaining.current = Math.max(0, slimeSpinRemaining.current - delta);
    const slimeSpinProgress = 1 - slimeSpinRemaining.current / SLIME_SPIN_DURATION;
    const slimeSpinAngle =
      slimeSpinRemaining.current > 0
        ? MathUtils.smoothstep(slimeSpinProgress, 0, 1) * Math.PI * 2 * slimeSpinDirection.current
        : 0;

    player.rotation.y = nextState.heading + slimeSpinAngle;
    const inputX = Number(input.left) - Number(input.right);
    const speed01 = MathUtils.clamp(
      Math.abs(nextState.speed) / selectedVehicle.handling.maxForwardSpeed,
      0,
      1,
    );
    const acceleration01 =
      nextState.acceleration /
      (selectedVehicle.handling.maxForwardSpeed +
        0.25 *
          selectedVehicle.handling.maxForwardSpeed *
          selectedVehicle.handling.maxForwardSpeed);
    const bodyPitch =
      -MathUtils.clamp(
        nextState.speed / selectedVehicle.handling.maxForwardSpeed - acceleration01,
        -0.8,
        0.8,
      ) * 0.34;
    const bodyRoll = -inputX * speed01 * 0.24;
    const steerAngle = inputX / 1.5;
    const body = bodyRef.current;
    const shield = shieldRef.current;

    if (body) {
      body.rotation.x = lerpAngle(
        body.rotation.x,
        bodyPitch,
        delta * 10,
      );
      body.rotation.z = lerpAngle(
        body.rotation.z,
        bodyRoll,
        delta * 5,
      );
    }

    for (const wheel of wheelsRef.current) {
      wheel.rotation.x += nextState.speed * delta * 7.2;
    }

    for (const wheel of frontWheelsRef.current) {
      wheel.rotation.y = lerpAngle(wheel.rotation.y, steerAngle, delta * 10);
    }

    if (shield) {
      const shieldActive = useGameStore.getState().itemShieldRemaining > 0;
      shield.visible = shieldActive;
      shield.rotation.y += delta * 2.4;
      shield.scale.setScalar(shieldActive ? 1 + Math.sin(state.clock.elapsedTime * 8) * 0.035 : 1);
    }

    updatePlayerRuntime({
      angularSpeed: nextState.angularSpeed,
      driftIntensity: nextState.driftIntensity,
      heading: nextState.heading,
      impactIntensity,
      position: nextState.position,
      speed: nextState.speed,
      throttle: Number(input.forward) - Number(input.backward),
    });
  });

  return (
    <group ref={playerRef} position={START_POSITION} rotation={[0, START_HEADING, 0]}>
      <group ref={shieldRef} visible={false}>
        <mesh>
          <sphereGeometry args={[0.82, 24, 12]} />
          <meshBasicMaterial color="#7dd3fc" opacity={0.22} transparent wireframe />
        </mesh>
      </group>
      <primitive key={vehicleAssetPath} object={vehicleVisual.model} scale={vehicleScale} />
    </group>
  );
}
