"use client";

import { create } from "zustand";
import { START_HEADING, START_POSITION } from "../data/trackData";
import type { PortfolioSectionId } from "../data/portfolioData";
import { defaultVehicle, type VehicleId, type VehicleVariantId } from "../data/vehicleOptions";
import type { Vector3Tuple } from "./proximity";

type GamePhase = "intro" | "playing";

type GameState = {
  activePointId: PortfolioSectionId | null;
  gamePhase: GamePhase;
  currentLapTime: number;
  bestLapTime: number | null;
  lapCount: number;
  lastLapTime: number | null;
  nitroCharge: number;
  nitroPickupVersion: number;
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
  selectedVehicleVariantId: VehicleVariantId;
  addNitroCharge: (amount: number) => void;
  completeLap: (lapTime: number) => void;
  requestRespawn: () => void;
  resetLapTimer: () => void;
  setActivePointId: (id: PortfolioSectionId | null) => void;
  setCurrentLapTime: (time: number) => void;
  setGamePhase: (phase: GamePhase) => void;
  setPlayerHeading: (heading: number) => void;
  setSelectedVehicleId: (id: VehicleId) => void;
  setSelectedVehicleVariantId: (id: VehicleVariantId) => void;
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
  bestLapTime: null,
  currentLapTime: 0,
  gamePhase: "intro",
  lapCount: 0,
  lastLapTime: null,
  nitroCharge: 0,
  nitroPickupVersion: 0,
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
  selectedVehicleVariantId: defaultVehicle.variants[0].id,
  addNitroCharge: (amount) =>
    set((state) => ({
      nitroCharge: Math.min(100, state.nitroCharge + amount),
      nitroPickupVersion: state.nitroPickupVersion + 1,
    })),
  completeLap: (lapTime) =>
    set((state) => ({
      bestLapTime: state.bestLapTime === null ? lapTime : Math.min(state.bestLapTime, lapTime),
      currentLapTime: 0,
      lapCount: state.lapCount + 1,
      lastLapTime: lapTime,
    })),
  requestRespawn: () =>
    set((state) => ({
      activePointId: null,
      currentLapTime: 0,
      nitroCharge: 0,
      playerAngularSpeed: 0,
      playerDriftIntensity: 0,
      playerImpactIntensity: 0,
      playerHeading: START_HEADING,
      playerPosition: START_POSITION,
      playerSpeed: 0,
      playerThrottle: 0,
      respawnVersion: state.respawnVersion + 1,
    })),
  resetLapTimer: () =>
    set({
      bestLapTime: null,
      currentLapTime: 0,
      lapCount: 0,
      lastLapTime: null,
    }),
  setActivePointId: (id) => set({ activePointId: id }),
  setCurrentLapTime: (time) => set({ currentLapTime: time }),
  setGamePhase: (phase) => set({ gamePhase: phase }),
  setPlayerHeading: (heading) => set({ playerHeading: heading }),
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
  setSelectedVehicleVariantId: (id) => set({ selectedVehicleVariantId: id }),
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
