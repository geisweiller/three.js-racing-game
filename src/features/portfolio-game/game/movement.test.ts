import { describe, expect, it } from "vitest";
import { clampToMap, getMovementVector, updateVehicle } from "./movement";
import { MAP_LIMIT } from "../data/trackData";
import { getVehicleOption } from "../data/vehicleOptions";

const baseState = {
  acceleration: 0,
  angularSpeed: 0,
  driftIntensity: 0,
};

describe("getMovementVector", () => {
  it("normalizes diagonal movement", () => {
    const vector = getMovementVector({
      forward: true,
      backward: false,
      left: false,
      right: true,
    });

    expect(vector[0]).toBeCloseTo(0.707);
    expect(vector[2]).toBeCloseTo(0.707);
  });

  it("returns a zero vector when there is no input", () => {
    expect(
      getMovementVector({ forward: false, backward: false, left: false, right: false }),
    ).toEqual([0, 0, 0]);
  });
});

describe("clampToMap", () => {
  it("keeps the player inside the initial map bounds", () => {
    expect(clampToMap([MAP_LIMIT + 2, 0, -MAP_LIMIT - 4])).toEqual([
      MAP_LIMIT,
      0,
      -MAP_LIMIT,
    ]);
  });
});

describe("updateVehicle", () => {
  it("accelerates the vehicle forward", () => {
    const nextState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 0 },
      { forward: true, backward: false, left: false, right: false },
      0.5,
    );

    expect(nextState.speed).toBeGreaterThan(0);
    expect(nextState.position[2]).toBeGreaterThan(2);
  });

  it("allows low-speed steering like the Starter Kit vehicle model", () => {
    const idleState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 0 },
      { forward: false, backward: false, left: false, right: true },
      0.5,
    );

    const movingState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 4 },
      { forward: false, backward: false, left: true, right: false },
      0.5,
    );

    expect(idleState.heading).toBeLessThan(0);
    expect(movingState.heading).toBeGreaterThan(0);
  });

  it("limits top speed while driving off road", () => {
    const nextState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 6 },
      { forward: true, backward: false, left: false, right: false },
      1,
      "offroad",
    );

    expect(nextState.speed).toBeLessThan(3.2);
  });

  it("uses vehicle handling to make the formula 1 faster than the race car", () => {
    const formula = getVehicleOption("formula-1");
    const raceCar = getVehicleOption("race-car");
    const input = { forward: true, backward: false, left: false, right: false };

    const formulaState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 0 },
      input,
      1,
      "track",
      formula.handling,
    );
    const raceCarState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 0 },
      input,
      1,
      "track",
      raceCar.handling,
    );

    expect(formulaState.speed).toBeGreaterThan(raceCarState.speed);
  });

  it("uses vehicle handling to make the kart turn easier than the race car", () => {
    const kart = getVehicleOption("kart");
    const raceCar = getVehicleOption("race-car");
    const input = { forward: true, backward: false, left: true, right: false };

    const kartState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 3 },
      input,
      0.25,
      "track",
      kart.handling,
    );
    const raceCarState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 3 },
      input,
      0.25,
      "track",
      raceCar.handling,
    );

    expect(kartState.heading).toBeGreaterThan(raceCarState.heading);
  });

  it("reports drift intensity while steering at speed", () => {
    const nextState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 5 },
      { forward: true, backward: false, left: true, right: false },
      0.5,
    );

    expect(nextState.driftIntensity).toBeGreaterThan(0.5);
  });

  it("reports less slip while driving straight than while steering", () => {
    const straightState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 5 },
      { forward: true, backward: false, left: false, right: false },
      0.5,
    );
    const turningState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 5 },
      { forward: true, backward: false, left: true, right: false },
      0.5,
    );

    expect(straightState.driftIntensity).toBeGreaterThan(0);
    expect(turningState.driftIntensity).toBeGreaterThan(straightState.driftIntensity);
  });
});
