"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { getVehicleOption } from "../data/vehicleOptions";
import { useGameStore } from "../game/useGameStore";

const SKID_AUDIO_PATH = "/starter-kit-racing/audio/skid.ogg";

function remap(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function VehicleAudio() {
  const audioState = useRef<{
    skid: HTMLAudioElement;
    unlocked: boolean;
  } | null>(null);

  useEffect(() => {
    const skid = new Audio(SKID_AUDIO_PATH);

    skid.loop = true;
    skid.volume = 0;

    audioState.current = {
      skid,
      unlocked: false,
    };

    function unlock() {
      const audio = audioState.current;
      if (!audio || audio.unlocked) {
        return;
      }

      audio.unlocked = true;
      audio.skid.play().catch(() => {
        audio.unlocked = false;
      });
    }

    window.addEventListener("click", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock);

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      skid.pause();
    };
  }, []);

  useFrame(() => {
    const audio = audioState.current;
    if (!audio) {
      return;
    }

    const state = useGameStore.getState();
    const vehicle = getVehicleOption(state.selectedVehicleId);
    const speed01 = clamp(Math.abs(state.playerSpeed) / vehicle.handling.maxForwardSpeed, 0, 1);
    const drift = state.playerDriftIntensity;

    if (audio.unlocked) {
      const skidVolume =
        drift > 0.55 ? remap(clamp(drift, 0.55, 1.7), 0.55, 1.7, 0.03, 0.28) : 0;
      audio.skid.volume = clamp(skidVolume, 0, 0.28);
      audio.skid.playbackRate = remap(speed01, 0, 1, 0.85, 1.45);
    }
  });

  return null;
}
