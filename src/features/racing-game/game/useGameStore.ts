"use client";

import { create } from "zustand";
import { START_HEADING, START_POSITION } from "../data/trackData";
import { defaultVehicle, type VehicleId, type VehicleVariantId } from "../data/vehicleOptions";
import type { Vector3Tuple } from "./vector";

type GamePhase = "intro" | "playing";
export type HeldItem = "boost" | "shield";

type GameState = {
  gamePhase: GamePhase;
  currentLapTime: number;
  bestLapTime: number | null;
  lapCount: number;
  lastLapTime: number | null;
  heldItem: HeldItem | null;
  itemBoostRemaining: number;
  itemPickupVersion: number;
  itemRouletteRemaining: number;
  itemShieldRemaining: number;
  itemUseVersion: number;
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
  collectItemBox: () => void;
  completeLap: (lapTime: number) => void;
  requestRespawn: () => void;
  resetLapTimer: () => void;
  setCurrentLapTime: (time: number) => void;
  setGamePhase: (phase: GamePhase) => void;
  setPlayerHeading: (heading: number) => void;
  setSelectedVehicleId: (id: VehicleId) => void;
  setSelectedVehicleVariantId: (id: VehicleVariantId) => void;
  setPlayerFrameState: (frameState: {
    angularSpeed: number;
    driftIntensity: number;
    heading: number;
    impactIntensity?: number;
    position: Vector3Tuple;
    speed: number;
    throttle: number;
  }) => void;
  setPlayerPosition: (position: Vector3Tuple) => void;
  setVehicleTelemetry: (telemetry: {
    angularSpeed: number;
    driftIntensity: number;
    impactIntensity?: number;
    speed: number;
    throttle: number;
  }) => void;
  tickItems: (delta: number) => void;
  activateHeldItem: () => void;
};

const ITEM_BOOST_DURATION = 1.8;
const ITEM_ROULETTE_DURATION = 0.9;
const ITEM_SHIELD_DURATION = 4;

function drawItem(): HeldItem {
  return Math.random() < 0.65 ? "boost" : "shield";
}

export const useGameStore = create<GameState>((set) => ({
  bestLapTime: null,
  currentLapTime: 0,
  gamePhase: "intro",
  heldItem: null,
  itemBoostRemaining: 0,
  itemPickupVersion: 0,
  itemRouletteRemaining: 0,
  itemShieldRemaining: 0,
  itemUseVersion: 0,
  lapCount: 0,
  lastLapTime: null,
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
  collectItemBox: () =>
    set((state) => {
      const slotBusy = state.heldItem !== null || state.itemRouletteRemaining > 0;

      return {
        itemPickupVersion: state.itemPickupVersion + 1,
        itemRouletteRemaining: slotBusy ? state.itemRouletteRemaining : ITEM_ROULETTE_DURATION,
      };
    }),
  completeLap: (lapTime) =>
    set((state) => ({
      bestLapTime: state.bestLapTime === null ? lapTime : Math.min(state.bestLapTime, lapTime),
      currentLapTime: 0,
      lapCount: state.lapCount + 1,
      lastLapTime: lapTime,
    })),
  requestRespawn: () =>
    set((state) => ({
      currentLapTime: 0,
      heldItem: null,
      itemBoostRemaining: 0,
      itemRouletteRemaining: 0,
      itemShieldRemaining: 0,
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
  setCurrentLapTime: (time) => set({ currentLapTime: time }),
  setGamePhase: (phase) => set({ gamePhase: phase }),
  setPlayerHeading: (heading) => set({ playerHeading: heading }),
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
  setSelectedVehicleVariantId: (id) => set({ selectedVehicleVariantId: id }),
  setPlayerFrameState: (frameState) =>
    set((state) => ({
      playerAngularSpeed: frameState.angularSpeed,
      playerDriftIntensity: frameState.driftIntensity,
      playerHeading: frameState.heading,
      playerImpactIntensity: frameState.impactIntensity ?? 0,
      playerImpactVersion:
        frameState.impactIntensity && frameState.impactIntensity > 0.05
          ? state.playerImpactVersion + 1
          : state.playerImpactVersion,
      playerPosition: frameState.position,
      playerSpeed: frameState.speed,
      playerThrottle: frameState.throttle,
    })),
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
  tickItems: (delta) =>
    set((state) => {
      const itemBoostRemaining = Math.max(0, state.itemBoostRemaining - delta);
      const itemShieldRemaining = Math.max(0, state.itemShieldRemaining - delta);
      const itemRouletteRemaining = Math.max(0, state.itemRouletteRemaining - delta);

      if (
        itemBoostRemaining === state.itemBoostRemaining &&
        itemShieldRemaining === state.itemShieldRemaining &&
        itemRouletteRemaining === state.itemRouletteRemaining
      ) {
        return state;
      }

      return {
        heldItem:
          state.itemRouletteRemaining > 0 && itemRouletteRemaining === 0
            ? drawItem()
            : state.heldItem,
        itemBoostRemaining,
        itemRouletteRemaining,
        itemShieldRemaining,
      };
    }),
  activateHeldItem: () =>
    set((state) => {
      if (state.heldItem === null || state.itemRouletteRemaining > 0) {
        return state;
      }

      if (state.heldItem === "boost") {
        return {
          heldItem: null,
          itemBoostRemaining: ITEM_BOOST_DURATION,
          itemUseVersion: state.itemUseVersion + 1,
        };
      }

      return {
        heldItem: null,
        itemShieldRemaining: ITEM_SHIELD_DURATION,
        itemUseVersion: state.itemUseVersion + 1,
      };
    }),
}));
