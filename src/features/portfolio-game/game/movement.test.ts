import { describe, expect, it } from "vitest";
import { clampToMap, getMovementVector, updateVehicle } from "./movement";

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
    expect(clampToMap([18, 0, -20])).toEqual([16, 0, -16]);
  });
});

describe("updateVehicle", () => {
  it("accelerates the vehicle forward", () => {
    const nextState = updateVehicle(
      { position: [0, 0, 2], heading: 0, speed: 0 },
      { forward: true, backward: false, left: false, right: false },
      0.5,
    );

    expect(nextState.speed).toBeGreaterThan(0);
    expect(nextState.position[2]).toBeGreaterThan(2);
  });

  it("turns only while the vehicle has movement speed", () => {
    const idleState = updateVehicle(
      { position: [0, 0, 2], heading: 0, speed: 0 },
      { forward: false, backward: false, left: false, right: true },
      0.5,
    );

    const movingState = updateVehicle(
      { position: [0, 0, 2], heading: 0, speed: 4 },
      { forward: false, backward: false, left: true, right: false },
      0.5,
    );

    expect(idleState.heading).toBe(0);
    expect(movingState.heading).toBeGreaterThan(0);
  });

  it("limits top speed while driving off road", () => {
    const nextState = updateVehicle(
      { position: [0, 0, 2], heading: 0, speed: 6 },
      { forward: true, backward: false, left: false, right: false },
      0.5,
      "offroad",
    );

    expect(nextState.speed).toBeLessThan(3);
  });
});
