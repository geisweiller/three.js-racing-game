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

export function updateVehicle(
  state: VehicleState,
  input: MovementInput,
  delta: number,
  surface: VehicleSurface = "track",
  handling: VehicleHandling = defaultHandling,
): VehicleState {
  const throttle = Number(input.forward) - Number(input.backward);
  const steering = Number(input.left) - Number(input.right);
  const surfaceGrip = surface === "track" ? 1 : handling.offroadGripMultiplier;
  const surfaceSpeed = surface === "track" ? 1 : handling.offroadSpeedMultiplier;
  let speed = state.speed;

  if (throttle > 0) {
    speed += handling.acceleration * delta;
  } else if (throttle < 0) {
    speed -= handling.reverseAcceleration * delta;
  } else {
    speed = moveTowardZero(speed, handling.friction * delta);
  }

  speed = clamp(speed, handling.maxReverseSpeed, handling.maxForwardSpeed * surfaceSpeed);

  const speedRatio = Math.min(1, Math.abs(speed) / handling.maxForwardSpeed);
  const reverseSteeringMultiplier = speed < 0 ? -1 : 1;
  const heading =
    state.heading +
    steering * handling.steerRate * surfaceGrip * speedRatio * reverseSteeringMultiplier * delta;

  const nextPosition = clampToMap([
    state.position[0] + Math.sin(heading) * speed * delta,
    0,
    state.position[2] + Math.cos(heading) * speed * delta,
  ]);

  return {
    position: nextPosition,
    heading,
    speed,
  };
}
