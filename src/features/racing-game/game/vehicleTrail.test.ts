import { describe, expect, it } from "vitest";
import { getRearAxlePoints } from "./vehicleTrail";

describe("getRearAxlePoints", () => {
  it("places tire effects behind the vehicle when heading forward on Z", () => {
    const points = getRearAxlePoints(
      [0, 0.2, 10],
      0,
      { rearAxleOffset: 1, wheelHalfWidth: 0.5 },
      0.1,
    );

    expect(points.left).toEqual([-0.5, 0.1, 9]);
    expect(points.right).toEqual([0.5, 0.1, 9]);
  });

  it("places tire effects behind the vehicle when heading forward on X", () => {
    const points = getRearAxlePoints(
      [10, 0.2, 0],
      Math.PI / 2,
      { rearAxleOffset: 1, wheelHalfWidth: 0.5 },
      0.1,
    );

    expect(points.left[0]).toBeCloseTo(9);
    expect(points.right[0]).toBeCloseTo(9);
    expect(points.left[2]).toBeCloseTo(0.5);
    expect(points.right[2]).toBeCloseTo(-0.5);
  });
});
