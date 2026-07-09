"use client";

/* eslint-disable react-hooks/immutability -- Three.js Object3D transforms are animated imperatively in the frame loop. */

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { MathUtils, type Group, type Mesh, type Object3D, type PointLight } from "three";
import { getVehicleOption, getVehicleVariant } from "../data/vehicleOptions";
import { withAssetBase } from "../game/assetPath";
import { updateVehicle, type MovementInput, type VehicleState } from "../game/movement";
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
const NITRO_FLASH_DURATION = 0.28;
const FINISH_TRIGGER_RADIUS = 1.3;
const LAP_ARM_DISTANCE = 7;
const NITRO_BOOST_MULTIPLIER = 1.42;
const NITRO_CONSUME_PER_SECOND = 25;
const STARTER_MAX_SPEED = 1.5;

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
  const lapStartTime = useRef(0);
  const lapArmed = useRef(false);
  const lastNitroPickupVersion = useRef(0);
  const nitroFlash = useRef(0);
  const nitroLightRef = useRef<PointLight>(null);
  const respawnBlinkRemaining = useRef(0);
  const vehicleState = useRef<VehicleState>({
    acceleration: 0,
    angularSpeed: 0,
    driftIntensity: 0,
    position: START_POSITION,
    heading: START_HEADING,
    speed: 0,
  });
  const nitroPickupVersion = useGameStore((state) => state.nitroPickupVersion);
  const respawnVersion = useGameStore((state) => state.respawnVersion);
  const selectedVehicleId = useGameStore((state) => state.selectedVehicleId);
  const selectedVehicleVariantId = useGameStore((state) => state.selectedVehicleVariantId);
  const completeLap = useGameStore((state) => state.completeLap);
  const consumeNitroCharge = useGameStore((state) => state.consumeNitroCharge);
  const setPlayerHeading = useGameStore((state) => state.setPlayerHeading);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setCurrentLapTime = useGameStore((state) => state.setCurrentLapTime);
  const setVehicleTelemetry = useGameStore((state) => state.setVehicleTelemetry);
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
    lapStartTime.current = 0;
    respawnBlinkRemaining.current = RESPAWN_BLINK_DURATION;

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

    if (lastNitroPickupVersion.current !== nitroPickupVersion) {
      lastNitroPickupVersion.current = nitroPickupVersion;
      nitroFlash.current = NITRO_FLASH_DURATION;
    }

    nitroFlash.current = Math.max(0, nitroFlash.current - delta);
    if (nitroLightRef.current) {
      nitroLightRef.current.intensity = MathUtils.clamp(
        nitroFlash.current / NITRO_FLASH_DURATION,
        0,
        1,
      ) * 3.5;
    }

    if (lapStartTime.current === 0) {
      lapStartTime.current = state.clock.elapsedTime;
    }

    const nitroCharge = useGameStore.getState().nitroCharge;
    const nitroActive = input.nitro && nitroCharge > 0;
    const nitroBoost = nitroActive ? NITRO_BOOST_MULTIPLIER : 1;

    if (input.nitro) {
      consumeNitroCharge(nitroActive ? NITRO_CONSUME_PER_SECOND * delta : 0);
    } else if (useGameStore.getState().nitroActive) {
      consumeNitroCharge(0);
    }

    const surface = isPointOnTrack(vehicleState.current.position, 0.35) ? "track" : "offroad";
    let nextState = updateVehicle(
      vehicleState.current,
      input,
      delta,
      surface,
      selectedVehicle.handling,
      nitroBoost,
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

      nextState = {
        ...nextState,
        angularSpeed: nextState.angularSpeed * 0.25,
        driftIntensity: 0,
        position: trackConstraint.position,
        speed: -nextState.speed * 0.18,
      };

      if (incomingSpeed > 1.1 && impactCooldown.current === 0) {
        impactIntensity = MathUtils.clamp(incomingSpeed / selectedVehicle.handling.maxForwardSpeed, 0, 1);
        impactCooldown.current = 0.28;
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
      lapArmed.current = false;
    } else {
      setCurrentLapTime(state.clock.elapsedTime - lapStartTime.current);
    }

    player.position.set(...nextState.position);
    player.rotation.y = nextState.heading;
    const inputX = Number(input.left) - Number(input.right);
    const starterSpeed =
      (nextState.speed / selectedVehicle.handling.maxForwardSpeed) * STARTER_MAX_SPEED;
    const starterAcceleration =
      (nextState.acceleration / selectedVehicle.handling.maxForwardSpeed) * STARTER_MAX_SPEED;
    const bodyPitch = -MathUtils.clamp((starterSpeed - starterAcceleration) / 6, -0.35, 0.35);
    const bodyRoll = -(inputX / 5) * starterSpeed;
    const steerAngle = inputX / 1.5;
    const body = bodyRef.current;

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

    setPlayerHeading(nextState.heading);
    setPlayerPosition(nextState.position);
    setVehicleTelemetry({
      angularSpeed: nextState.angularSpeed,
      driftIntensity: nextState.driftIntensity,
      impactIntensity,
      speed: nextState.speed,
      throttle: Number(input.forward) - Number(input.backward),
    });
  });

  return (
    <group ref={playerRef} position={START_POSITION} rotation={[0, START_HEADING, 0]}>
      <pointLight ref={nitroLightRef} color="#66cfb2" distance={3.4} intensity={0} position={[0, 0.75, 0]} />
      <primitive key={vehicleAssetPath} object={vehicleVisual.model} scale={vehicleScale} />
    </group>
  );
}
