import type { Vector3Tuple } from "./proximity";
import { MAP_LIMIT } from "../data/trackData";
import { defaultVehicle, type VehicleHandling } from "../data/vehicleOptions";

export type MovementInput = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

export type VehicleState = {
  acceleration: number;
  angularSpeed: number;
  driftIntensity: number;
  position: Vector3Tuple;
  heading: number;
  speed: number;
};

export type VehicleSurface = "track" | "offroad";

const defaultHandling = defaultVehicle.handling;

export function getMovementVector(input: MovementInput): Vector3Tuple {
  const x = Number(input.right) - Number(input.left);
  const z = Number(input.forward) - Number(input.backward);
  const length = Math.hypot(x, z);

  if (length === 0) {
    return [0, 0, 0];
  }

  return [x / length, 0, z / length];
}

export function clampToMap(position: Vector3Tuple): Vector3Tuple {
  return [
    Math.max(-MAP_LIMIT, Math.min(MAP_LIMIT, position[0])),
    position[1],
    Math.max(-MAP_LIMIT, Math.min(MAP_LIMIT, position[2])),
  ];
}

function moveTowardZero(value: number, amount: number) {
  if (Math.abs(value) <= amount) {
    return 0;
  }

  return value - Math.sign(value) * amount;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp(t, 0, 1);
}

export function updateVehicle(
  state: VehicleState,
  input: MovementInput,
  delta: number,
  surface: VehicleSurface = "track",
  handling: VehicleHandling = defaultHandling,
): VehicleState {
  const throttle = Number(input.forward) - Number(input.backward);
  const inputX = Number(input.left) - Number(input.right);
  const surfaceGrip = surface === "track" ? 1 : handling.offroadGripMultiplier;
  const surfaceSpeed = surface === "track" ? 1 : handling.offroadSpeedMultiplier;
  let speed = clamp(state.speed, handling.maxReverseSpeed, handling.maxForwardSpeed * surfaceSpeed);
  let direction = Math.sign(speed);

  if (direction === 0) {
    direction = Math.abs(throttle) > 0.1 ? Math.sign(throttle) : 1;
  }

  const normalizedSpeed = clamp(Math.abs(speed) / handling.maxForwardSpeed, 0, 1);
  const steeringGrip = clamp(normalizedSpeed, 0.28, 1);
  const targetAngular = inputX * steeringGrip * handling.steerRate * surfaceGrip * direction;
  const angularSpeed = lerp(state.angularSpeed, targetAngular, delta * 6);
  const heading = state.heading + angularSpeed * delta;

  if (throttle < 0 && speed > 0.1) {
    speed = lerp(speed, 0, delta * 8);
  } else if (throttle > 0) {
    speed = lerp(speed, handling.maxForwardSpeed * surfaceSpeed, delta * 1.5);
  } else if (throttle < 0) {
    speed = lerp(speed, handling.maxReverseSpeed * surfaceSpeed, delta * 2);
  } else {
    speed = moveTowardZero(speed, handling.friction * delta);
  }

  speed *= Math.max(0, 1 - 0.1 * delta);
  speed = clamp(speed, handling.maxReverseSpeed, handling.maxForwardSpeed * surfaceSpeed);

  const acceleration = lerp(
    state.acceleration,
    speed + 0.25 * speed * Math.abs(speed),
    delta,
  );
  // Mesma formula do Starter Kit Racing: driftIntensity combina o slip entre
  // velocidade/aceleracao com a inclinacao lateral visual do carro.
  const starterBodyRoll = -(inputX / 5) * speed;
  const driftIntensity =
    Math.abs(speed - acceleration) + Math.abs(starterBodyRoll) * 2;

  const nextPosition = clampToMap([
    state.position[0] + Math.sin(heading) * speed * delta,
    0,
    state.position[2] + Math.cos(heading) * speed * delta,
  ]);

  return {
    acceleration,
    angularSpeed,
    driftIntensity,
    position: nextPosition,
    heading,
    speed,
  };
}
