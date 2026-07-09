import { describe, expect, it } from "vitest";
import {
  constrainPointToTrack,
  isPointOnTrack,
  trackDecorations,
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
    expect(roadTiles.some((tile) => tile.kind === "finish")).toBe(true);
    expect(roadTiles.filter((tile) => tile.kind === "straight").length).toBeGreaterThan(8);
  });

  it("keeps the racing circuit clear of visual props", () => {
    expect(trackProps).toHaveLength(0);
  });

  it("fills the outside of the track with starter kit decorations", () => {
    expect(trackDecorations.length).toBeGreaterThan(20);
    expect(trackDecorations.some((decoration) => decoration.kind === "forest")).toBe(true);
    expect(trackDecorations.some((decoration) => decoration.kind === "empty")).toBe(true);
  });

  it("places a single workshop structure close to the racing circuit", () => {
    expect(
      trackDecorations.filter((decoration) => decoration.id.startsWith("structure-building")),
    ).toHaveLength(1);
    expect(trackDecorations.some((decoration) => decoration.kind === "buildingD")).toBe(true);
  });
});
