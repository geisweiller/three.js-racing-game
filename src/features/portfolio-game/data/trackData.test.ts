import { describe, expect, it } from "vitest";
import {
  constrainPointToTrack,
  isPointOnTrack,
  ROAD_WIDTH,
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

  it("can move the collision wall outward with a tunable edge tolerance", () => {
    const vehicleHalfWidth = 0.26;
    const edgeTolerance = vehicleHalfWidth / 2;
    const pointNearVisualEdge = [
      START_POSITION[0] + ROAD_WIDTH / 2 - vehicleHalfWidth + edgeTolerance / 2,
      START_POSITION[1],
      START_POSITION[2],
    ] as const;

    expect(constrainPointToTrack(pointNearVisualEdge, vehicleHalfWidth).collided).toBe(true);
    expect(
      constrainPointToTrack(pointNearVisualEdge, vehicleHalfWidth, edgeTolerance).collided,
    ).toBe(false);
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

  it("keeps varied buildings around the racing circuit with one starter-kit workshop tent", () => {
    expect(trackDecorations.filter((decoration) => decoration.kind === "workshop")).toHaveLength(
      1,
    );
    expect(trackDecorations.filter((decoration) => decoration.id.includes("tents"))).toHaveLength(
      0,
    );
    expect(trackDecorations.some((decoration) => decoration.id === "structure-workshop-1--3")).toBe(
      true,
    );
    expect(
      trackDecorations.some((decoration) => decoration.id === "structure-base-empty-1--3"),
    ).toBe(false);
    expect(trackDecorations.some((decoration) => decoration.kind === "buildingA")).toBe(true);
    expect(trackDecorations.some((decoration) => decoration.kind === "buildingD")).toBe(true);
    expect(trackDecorations.some((decoration) => decoration.kind === "skyscraperA")).toBe(true);
  });
});
