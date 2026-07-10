"use client";

import { create } from "zustand";
import { defaultVehicle, type VehicleId, type VehicleVariantId } from "../data/vehicleOptions";
import type { Vector3Tuple } from "./vector";

type GamePhase = "intro" | "playing";
export type CameraMode = "current" | "close";
export type HeldItem = "boost" | "shield" | "slime";

export type DroppedSlimePuddle = {
  createdAt: number;
  id: number;
  position: Vector3Tuple;
};

type ItemUseContext = {
  heading: number;
  position: Vector3Tuple;
  time: number;
};

type GameState = {
  cameraMode: CameraMode;
  gamePhase: GamePhase;
  currentLapTime: number;
  bestLapTime: number | null;
  lapCount: number;
  lastLapTime: number | null;
  droppedSlimePuddles: DroppedSlimePuddle[];
  heldItem: HeldItem | null;
  itemBoostRemaining: number;
  itemPickupVersion: number;
  itemRouletteRemaining: number;
  itemShieldRemaining: number;
  itemUseVersion: number;
  respawnVersion: number;
  selectedVehicleId: VehicleId;
  selectedVehicleVariantId: VehicleVariantId;
  collectItemBox: () => boolean;
  completeLap: (lapTime: number) => void;
  removeSlimePuddle: (id: number) => void;
  requestRespawn: () => void;
  resetLapTimer: () => void;
  setCurrentLapTime: (time: number) => void;
  setCameraMode: (mode: CameraMode) => void;
  setGamePhase: (phase: GamePhase) => void;
  setSelectedVehicleId: (id: VehicleId) => void;
  setSelectedVehicleVariantId: (id: VehicleVariantId) => void;
  tickItems: (delta: number) => void;
  toggleCameraMode: () => void;
  activateHeldItem: (context?: ItemUseContext) => void;
};

const MAX_DROPPED_SLIME_PUDDLES = 12;
const SLIME_DROP_BACK_OFFSET = 0.9;
const ITEM_BOOST_DURATION = 1.8;
const ITEM_ROULETTE_DURATION = 0.9;
const ITEM_SHIELD_DURATION = 4;

function drawItem(): HeldItem {
  const roll = Math.random();

  if (roll < 0.55) {
    return "boost";
  }

  if (roll < 0.8) {
    return "shield";
  }

  return "slime";
}

export const useGameStore = create<GameState>((set, get) => ({
  bestLapTime: null,
  cameraMode: "current",
  currentLapTime: 0,
  droppedSlimePuddles: [],
  gamePhase: "intro",
  heldItem: null,
  itemBoostRemaining: 0,
  itemPickupVersion: 0,
  itemRouletteRemaining: 0,
  itemShieldRemaining: 0,
  itemUseVersion: 0,
  lapCount: 0,
  lastLapTime: null,
  respawnVersion: 0,
  selectedVehicleId: defaultVehicle.id,
  selectedVehicleVariantId: defaultVehicle.variants[0].id,
  collectItemBox: () => {
    const state = get();

    if (state.itemBoostRemaining > 0 || state.itemShieldRemaining > 0) {
      return false;
    }

    set({
      heldItem: null,
      itemPickupVersion: state.itemPickupVersion + 1,
      itemRouletteRemaining: ITEM_ROULETTE_DURATION,
    });

    return true;
  },
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
      droppedSlimePuddles: [],
      heldItem: null,
      itemBoostRemaining: 0,
      itemRouletteRemaining: 0,
      itemShieldRemaining: 0,
      respawnVersion: state.respawnVersion + 1,
    })),
  resetLapTimer: () =>
    set({
      bestLapTime: null,
      currentLapTime: 0,
      droppedSlimePuddles: [],
      lapCount: 0,
      lastLapTime: null,
    }),
  removeSlimePuddle: (id) =>
    set((state) => ({
      droppedSlimePuddles: state.droppedSlimePuddles.filter((puddle) => puddle.id !== id),
    })),
  setCurrentLapTime: (time) => set({ currentLapTime: time }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setGamePhase: (phase) => set({ gamePhase: phase }),
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
  setSelectedVehicleVariantId: (id) => set({ selectedVehicleVariantId: id }),
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
  toggleCameraMode: () =>
    set((state) => ({
      cameraMode: state.cameraMode === "current" ? "close" : "current",
    })),
  activateHeldItem: (context) =>
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

      if (state.heldItem === "slime") {
        if (!context) {
          return state;
        }

        const slimePuddlePosition: Vector3Tuple = [
          context.position[0] - Math.sin(context.heading) * SLIME_DROP_BACK_OFFSET,
          0.15,
          context.position[2] - Math.cos(context.heading) * SLIME_DROP_BACK_OFFSET,
        ];

        return {
          droppedSlimePuddles: [
            ...state.droppedSlimePuddles.slice(-(MAX_DROPPED_SLIME_PUDDLES - 1)),
            {
              createdAt: context.time,
              id: state.itemUseVersion + 1,
              position: slimePuddlePosition,
            },
          ],
          heldItem: null,
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
