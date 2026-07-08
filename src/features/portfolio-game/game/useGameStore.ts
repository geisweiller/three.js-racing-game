"use client";

import { create } from "zustand";
import { START_HEADING, START_POSITION } from "../data/trackData";
import type { PortfolioSectionId } from "../data/portfolioData";
import type { Vector3Tuple } from "./proximity";

type GameState = {
  activePointId: PortfolioSectionId | null;
  openedSectionId: PortfolioSectionId | null;
  playerHeading: number;
  playerPosition: Vector3Tuple;
  respawnVersion: number;
  requestRespawn: () => void;
  setActivePointId: (id: PortfolioSectionId | null) => void;
  setPlayerHeading: (heading: number) => void;
  setOpenedSectionId: (id: PortfolioSectionId | null) => void;
  setPlayerPosition: (position: Vector3Tuple) => void;
};

export const useGameStore = create<GameState>((set) => ({
  activePointId: null,
  openedSectionId: null,
  playerHeading: START_HEADING,
  playerPosition: START_POSITION,
  respawnVersion: 0,
  requestRespawn: () =>
    set((state) => ({
      activePointId: null,
      playerHeading: START_HEADING,
      playerPosition: START_POSITION,
      respawnVersion: state.respawnVersion + 1,
    })),
  setActivePointId: (id) => set({ activePointId: id }),
  setPlayerHeading: (heading) => set({ playerHeading: heading }),
  setOpenedSectionId: (id) => set({ openedSectionId: id }),
  setPlayerPosition: (position) => set({ playerPosition: position }),
}));
