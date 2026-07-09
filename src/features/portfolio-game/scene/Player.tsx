"use client";

/* eslint-disable react-hooks/immutability -- Three.js Object3D transforms are animated imperatively in the frame loop. */

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { MathUtils, type Group, type Mesh, type Object3D } from "three";
import { getVehicleOption } from "../data/vehicleOptions";
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

function cloneVehicle(source: Object3D): VehicleVisual {
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
  const vehicleState = useRef<VehicleState>({
    acceleration: 0,
    angularSpeed: 0,
    driftIntensity: 0,
    position: START_POSITION,
    heading: START_HEADING,
    speed: 0,
  });
  const openedSectionId = useGameStore((state) => state.openedSectionId);
  const respawnVersion = useGameStore((state) => state.respawnVersion);
  const selectedVehicleId = useGameStore((state) => state.selectedVehicleId);
  const setPlayerHeading = useGameStore((state) => state.setPlayerHeading);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);
  const setVehicleTelemetry = useGameStore((state) => state.setVehicleTelemetry);
  const selectedVehicle = getVehicleOption(selectedVehicleId);
  const { scene } = useGLTF(selectedVehicle.modelPath);
  const vehicleVisual = useMemo(() => cloneVehicle(scene), [scene]);
  const bodyRef = useRef<Object3D | null>(null);
  const frontWheelsRef = useRef<Object3D[]>([]);
  const wheelsRef = useRef<Object3D[]>([]);

  useEffect(() => {
    bodyRef.current = vehicleVisual.body;
    frontWheelsRef.current = vehicleVisual.frontWheels;
    wheelsRef.current = vehicleVisual.wheels;
  }, [vehicleVisual]);

  useEffect(() => {
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

  useFrame((_, delta) => {
    const player = playerRef.current;

    if (!player || openedSectionId) {
      return;
    }

    const surface = isPointOnTrack(vehicleState.current.position, 0.35) ? "track" : "offroad";
    let nextState = updateVehicle(
      vehicleState.current,
      input,
      delta,
      surface,
      selectedVehicle.handling,
    );
    const trackConstraint = constrainPointToTrack(nextState.position, VEHICLE_COLLIDER_RADIUS);
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

    player.position.set(...nextState.position);
    player.rotation.y = nextState.heading;
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
      <primitive key={selectedVehicle.modelPath} object={vehicleVisual.model} scale={selectedVehicle.scale} />
    </group>
  );
}
