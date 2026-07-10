import { START_HEADING, START_POSITION } from "../data/trackData";
import type { Vector3Tuple } from "./vector";

export const playerRuntime = {
  angularSpeed: 0,
  driftIntensity: 0,
  heading: START_HEADING,
  impactIntensity: 0,
  impactVersion: 0,
  position: [...START_POSITION] as Vector3Tuple,
  speed: 0,
  throttle: 0,
};

export function resetPlayerRuntime() {
  playerRuntime.angularSpeed = 0;
  playerRuntime.driftIntensity = 0;
  playerRuntime.heading = START_HEADING;
  playerRuntime.impactIntensity = 0;
  playerRuntime.position[0] = START_POSITION[0];
  playerRuntime.position[1] = START_POSITION[1];
  playerRuntime.position[2] = START_POSITION[2];
  playerRuntime.speed = 0;
  playerRuntime.throttle = 0;
}

export function updatePlayerRuntime(frameState: {
  angularSpeed: number;
  driftIntensity: number;
  heading: number;
  impactIntensity: number;
  position: Vector3Tuple;
  speed: number;
  throttle: number;
}) {
  playerRuntime.angularSpeed = frameState.angularSpeed;
  playerRuntime.driftIntensity = frameState.driftIntensity;
  playerRuntime.heading = frameState.heading;
  playerRuntime.impactIntensity = frameState.impactIntensity;
  playerRuntime.position[0] = frameState.position[0];
  playerRuntime.position[1] = frameState.position[1];
  playerRuntime.position[2] = frameState.position[2];
  playerRuntime.speed = frameState.speed;
  playerRuntime.throttle = frameState.throttle;

  if (frameState.impactIntensity > 0.05) {
    playerRuntime.impactVersion += 1;
  }
}
