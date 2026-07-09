import { describe, expect, it } from "vitest";
import {
  constrainPointToTrack,
  isPointOnTrack,
  roadTiles,
  START_POSITION,
  trackProps,
} from "./trackData";

describe("isPointOnTrack", () => {
  it("recognizes the start line as part of the track", () => {
    expect(isPointOnTrack(START_POSITION)).toBe(true);
  });

  it("recognizes points far outside the racing loop as off road", () => {
    expect(isPointOnTrack([13, 0, 13])).toBe(false);
  });

  it("projects off-road points back to the nearest road segment", () => {
    const constrained = constrainPointToTrack([13, 0, 13]);

    expect(constrained.collided).toBe(true);
    expect(isPointOnTrack(constrained.position)).toBe(true);
  });

  it("creates a closed circuit with straights and corners", () => {
    expect(roadTiles.some((tile) => tile.kind === "curve")).toBe(true);
    expect(roadTiles.filter((tile) => tile.kind === "straight").length).toBeGreaterThan(20);
  });

  it("adds visual props around the circuit", () => {
    expect(trackProps.some((prop) => prop.kind === "cone")).toBe(true);
    expect(trackProps.filter((prop) => prop.kind === "light").length).toBeGreaterThan(8);
  });
});
