import { describe, expect, it } from "vitest";
import { isPointOnTrack, START_POSITION } from "./trackData";

describe("isPointOnTrack", () => {
  it("recognizes the start line as part of the track", () => {
    expect(isPointOnTrack(START_POSITION)).toBe(true);
  });

  it("recognizes points far outside the racing loop as off road", () => {
    expect(isPointOnTrack([13, 0, 13])).toBe(false);
  });
});
