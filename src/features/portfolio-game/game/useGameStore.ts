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
  playerAngularSpeed: number;
  playerSpeed: number;
  playerThrottle: number;
  playerDriftIntensity: number;
  playerImpactIntensity: number;
  playerImpactVersion: number;
  respawnVersion: number;
  selectedVehicleId: VehicleId;
  requestRespawn: () => void;
  setActivePointId: (id: PortfolioSectionId | null) => void;
  setGamePhase: (phase: GamePhase) => void;
  setPlayerHeading: (heading: number) => void;
  setSelectedVehicleId: (id: VehicleId) => void;
  setOpenedSectionId: (id: PortfolioSectionId | null) => void;
  setPlayerPosition: (position: Vector3Tuple) => void;
  setVehicleTelemetry: (telemetry: {
    angularSpeed: number;
    driftIntensity: number;
    impactIntensity?: number;
    speed: number;
    throttle: number;
  }) => void;
};

export const useGameStore = create<GameState>((set) => ({
  activePointId: null,
  gamePhase: "intro",
  openedSectionId: null,
  playerHeading: START_HEADING,
  playerPosition: START_POSITION,
  playerAngularSpeed: 0,
  playerSpeed: 0,
  playerThrottle: 0,
  playerDriftIntensity: 0,
  playerImpactIntensity: 0,
  playerImpactVersion: 0,
  respawnVersion: 0,
  selectedVehicleId: defaultVehicle.id,
  requestRespawn: () =>
    set((state) => ({
      activePointId: null,
      playerAngularSpeed: 0,
      playerDriftIntensity: 0,
      playerImpactIntensity: 0,
      playerHeading: START_HEADING,
      playerPosition: START_POSITION,
      playerSpeed: 0,
      playerThrottle: 0,
      respawnVersion: state.respawnVersion + 1,
    })),
  setActivePointId: (id) => set({ activePointId: id }),
  setGamePhase: (phase) => set({ gamePhase: phase }),
  setPlayerHeading: (heading) => set({ playerHeading: heading }),
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
  setOpenedSectionId: (id) => set({ openedSectionId: id }),
  setPlayerPosition: (position) => set({ playerPosition: position }),
  setVehicleTelemetry: (telemetry) =>
    set((state) => ({
      playerAngularSpeed: telemetry.angularSpeed,
      playerDriftIntensity: telemetry.driftIntensity,
      playerImpactIntensity: telemetry.impactIntensity ?? 0,
      playerImpactVersion:
        telemetry.impactIntensity && telemetry.impactIntensity > 0.05
          ? state.playerImpactVersion + 1
          : state.playerImpactVersion,
      playerSpeed: telemetry.speed,
      playerThrottle: telemetry.throttle,
    })),
}));
