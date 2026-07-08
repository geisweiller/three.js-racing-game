import { describe, expect, it } from "vitest";
import { getNearbyPoint } from "./proximity";
import type { PointOfInterest } from "../data/pointsOfInterest";

const points: PointOfInterest[] = [
  {
    id: "home",
    position: [0, 0, 0],
    radius: 2,
    title: "Casa",
    hint: "Interagir",
  },
];

describe("getNearbyPoint", () => {
  it("returns the point when the player is inside its interaction radius", () => {
    expect(getNearbyPoint([1, 0, 1], points)?.id).toBe("home");
  });

  it("returns null when the player is outside every interaction radius", () => {
    expect(getNearbyPoint([4, 0, 4], points)).toBeNull();
  });
});
