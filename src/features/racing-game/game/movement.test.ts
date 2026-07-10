import { describe, expect, it } from "vitest";
import { clampToMap, getMovementVector, updateVehicle, type MovementInput } from "./movement";
import { MAP_LIMIT } from "../data/trackData";
import { getVehicleOption } from "../data/vehicleOptions";

const baseState = {
  acceleration: 0,
  angularSpeed: 0,
  driftIntensity: 0,
};
const idleInput: MovementInput = {
  backward: false,
  forward: false,
  item: false,
  left: false,
  right: false,
};

function input(overrides: Partial<MovementInput>): MovementInput {
  return { ...idleInput, ...overrides };
}

describe("getMovementVector", () => {
  it("normalizes diagonal movement", () => {
    const vector = getMovementVector(input({ forward: true, right: true }));

    expect(vector[0]).toBeCloseTo(0.707);
    expect(vector[2]).toBeCloseTo(0.707);
  });

  it("returns a zero vector when there is no input", () => {
    expect(
      getMovementVector(idleInput),
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
      input({ forward: true }),
      0.5,
    );

    expect(nextState.speed).toBeGreaterThan(0);
    expect(nextState.position[2]).toBeGreaterThan(2);
  });

  it("allows low-speed steering like the Starter Kit vehicle model", () => {
    const idleState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 0 },
      input({ right: true }),
      0.5,
    );

    const movingState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 4 },
      input({ left: true }),
      0.5,
    );

    expect(idleState.heading).toBeLessThan(0);
    expect(movingState.heading).toBeGreaterThan(0);
  });

  it("limits top speed while driving off road", () => {
    const nextState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 6 },
      input({ forward: true }),
      1,
      "offroad",
    );

    expect(nextState.speed).toBeLessThan(3.2);
  });

  it("uses kart handling to make the speed-focused kart faster", () => {
    const speedKart = getVehicleOption("kart-ooli");
    const agileKart = getVehicleOption("kart-oodi");
    const forwardInput = input({ forward: true });

    const speedKartState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 0 },
      forwardInput,
      1,
      "track",
      speedKart.handling,
    );
    const agileKartState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 0 },
      forwardInput,
      1,
      "track",
      agileKart.handling,
    );

    expect(speedKartState.speed).toBeGreaterThan(agileKartState.speed);
  });

  it("uses kart handling to make the agile kart turn easier", () => {
    const agileKart = getVehicleOption("kart-oodi");
    const stableKart = getVehicleOption("kart-oozi");
    const turningInput = input({ forward: true, left: true });

    const agileKartState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 3 },
      turningInput,
      0.25,
      "track",
      agileKart.handling,
    );
    const stableKartState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 3 },
      turningInput,
      0.25,
      "track",
      stableKart.handling,
    );

    expect(agileKartState.heading).toBeGreaterThan(stableKartState.heading);
  });

  it("reports tire effect intensity while steering at speed", () => {
    const nextState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 5 },
      input({ forward: true, left: true }),
      0.5,
    );

    expect(nextState.driftIntensity).toBeGreaterThan(0.5);
  });

  it("reports less tire effect while driving straight than while steering", () => {
    const straightState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 5 },
      input({ forward: true }),
      0.5,
    );
    const turningState = updateVehicle(
      { ...baseState, position: [0, 0, 2], heading: 0, speed: 5 },
      input({ forward: true, left: true }),
      0.5,
    );

    expect(straightState.driftIntensity).toBeGreaterThan(0);
    expect(turningState.driftIntensity).toBeGreaterThan(straightState.driftIntensity);
  });

  it("uses item boost to raise acceleration and top speed while active", () => {
    const vehicle = getVehicleOption("kart-oobi");
    const base = { ...baseState, position: [0, 0, 2] as const, heading: 0, speed: 5 };
    const normalState = updateVehicle(base, input({ forward: true }), 0.5, "track", vehicle.handling);
    const boostedState = updateVehicle(
      base,
      input({ forward: true, item: true }),
      0.5,
      "track",
      vehicle.handling,
      1.42,
    );

    expect(boostedState.speed).toBeGreaterThan(normalState.speed);
  });
});
