"use client";

import { create } from "zustand";
import { START_HEADING, START_POSITION } from "../data/trackData";
import type { PortfolioSectionId } from "../data/portfolioData";
import { defaultVehicle, type VehicleId } from "../data/vehicleOptions";
import type { Vector3Tuple } from "./proximity";

type GamePhase = "intro" | "playing";

type GameState = {
  activePointId: PortfolioSectionId | null;
  gamePhase: GamePhase;
  openedSectionId: PortfolioSectionId | null;
  playerHeading: number;
  playerPosition: Vector3Tuple;
  respawnVersion: number;
  selectedVehicleId: VehicleId;
  requestRespawn: () => void;
  setActivePointId: (id: PortfolioSectionId | null) => void;
  setGamePhase: (phase: GamePhase) => void;
  setPlayerHeading: (heading: number) => void;
  setSelectedVehicleId: (id: VehicleId) => void;
  setOpenedSectionId: (id: PortfolioSectionId | null) => void;
  setPlayerPosition: (position: Vector3Tuple) => void;
};

export const useGameStore = create<GameState>((set) => ({
  activePointId: null,
  gamePhase: "intro",
  openedSectionId: null,
  playerHeading: START_HEADING,
  playerPosition: START_POSITION,
  respawnVersion: 0,
  selectedVehicleId: defaultVehicle.id,
  requestRespawn: () =>
    set((state) => ({
      activePointId: null,
      playerHeading: START_HEADING,
      playerPosition: START_POSITION,
      respawnVersion: state.respawnVersion + 1,
    })),
  setActivePointId: (id) => set({ activePointId: id }),
  setGamePhase: (phase) => set({ gamePhase: phase }),
  setPlayerHeading: (heading) => set({ playerHeading: heading }),
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
  setOpenedSectionId: (id) => set({ openedSectionId: id }),
  setPlayerPosition: (position) => set({ playerPosition: position }),
}));
