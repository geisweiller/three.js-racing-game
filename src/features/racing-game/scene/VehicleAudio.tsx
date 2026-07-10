"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { getVehicleOption } from "../data/vehicleOptions";
import { withAssetBase } from "../game/assetPath";
import { playerRuntime } from "../game/playerRuntime";
import { useGameStore } from "../game/useGameStore";

const SKID_AUDIO_PATH = "/starter-kit-racing/audio/skid.ogg";
const ENGINE_WORKLET_PATH = "/starter-kit-racing/js/EngineWorklet.js";
const RPM_IDLE = 1000;
const RPM_MAX = 6700;
const NUM_GEARS = 3;
const UPSHIFT_RPM = 0.92;
const DOWNSHIFT_RPM = 0.35;
const SHIFT_COOLDOWN = 0.35;
const SHIFT_CUT = 0.12;
const IMPACT_DURATION = 0.6;
const PICKUP_DURATION = 0.45;
const SKID_DRIFT_THRESHOLD = 0.55;
const SKID_MIN_SPEED = 2.6;
const SKID_MIN_TURN_RATE = 0.35;

function remap(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createImpactBuffer(context: AudioContext, seed: number, hardness: number) {
  const length = Math.floor(IMPACT_DURATION * context.sampleRate);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let noiseSeed = seed * 48271 + 11;
  const random = () => {
    noiseSeed = (noiseSeed * 1664525 + 1013904223) | 0;
    return (noiseSeed >>> 9) / 8388608;
  };

  for (let i = 0; i < data.length; i += 1) {
    const t = i / context.sampleRate;
    const crash = (random() * 2 - 1) * Math.exp(-t / (0.04 + hardness * 0.04));
    const crunchGate = Math.exp(-t / (0.1 + hardness * 0.05));
    const crunch = (random() * 2 - 1) * crunchGate * (0.25 + hardness * 0.35);
    const thud = Math.sin(Math.PI * 2 * (75 + hardness * 25) * t) * Math.exp(-t / 0.025);

    data[i] = (crash * (0.8 + hardness * 0.5) + crunch + thud * 0.38) * 0.42;
  }

  let peak = 0;
  for (const sample of data) {
    peak = Math.max(peak, Math.abs(sample));
  }

  if (peak > 0) {
    const normalize = 0.9 / peak;
    for (let i = 0; i < data.length; i += 1) {
      data[i] *= normalize;
    }
  }

  return buffer;
}

function createPickupBuffer(context: AudioContext) {
  const length = Math.floor(PICKUP_DURATION * context.sampleRate);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) {
    const t = i / context.sampleRate;
    const envelope = Math.sin(Math.PI * Math.min(1, t / PICKUP_DURATION));
    const sweep = 520 + 980 * (t / PICKUP_DURATION);
    const sparkle = Math.sin(Math.PI * 2 * sweep * t) * 0.55;
    const chime = Math.sin(Math.PI * 2 * 1560 * t) * Math.exp(-t / 0.18) * 0.35;

    data[i] = (sparkle + chime) * envelope * 0.5;
  }

  return buffer;
}

export function VehicleAudio() {
  const audioState = useRef<{
    context: AudioContext;
    engineGain: GainNode | null;
    engineLoadParam: AudioParam | null;
    engineRpmParam: AudioParam | null;
    gear: number;
    initializingEngine: boolean;
    impactBuffers: AudioBuffer[];
    lastItemPickupVersion: number;
    lastImpactVersion: number;
    pickupBuffer: AudioBuffer;
    rpm: number;
    shiftCooldown: number;
    skid: HTMLAudioElement;
    unlocked: boolean;
  } | null>(null);

  useEffect(() => {
    const audioWindow = window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextClass = audioWindow.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const skid = new Audio(withAssetBase(SKID_AUDIO_PATH));

    skid.loop = true;
    skid.volume = 0;

    audioState.current = {
      context,
      engineGain: null,
      engineLoadParam: null,
      engineRpmParam: null,
      gear: 0,
      initializingEngine: false,
      impactBuffers: [createImpactBuffer(context, 1, 0.45), createImpactBuffer(context, 2, 0.85)],
      lastItemPickupVersion: 0,
      lastImpactVersion: 0,
      pickupBuffer: createPickupBuffer(context),
      rpm: 0,
      shiftCooldown: 0,
      skid,
      unlocked: false,
    };

    async function initEngine() {
      if (!context.audioWorklet) {
        return;
      }

      await context.audioWorklet.addModule(withAssetBase(ENGINE_WORKLET_PATH));
      const node = new AudioWorkletNode(context, "engine-sound", {
        numberOfInputs: 0,
        outputChannelCount: [1],
      });
      const tone = context.createBiquadFilter();
      const gain = context.createGain();

      tone.type = "lowpass";
      tone.frequency.value = 5500;
      tone.Q.value = 0.0001;
      gain.gain.value = 0;
      node.connect(tone);
      tone.connect(gain);
      gain.connect(context.destination);

      const audio = audioState.current;
      if (!audio) {
        node.disconnect();
        gain.disconnect();
        return;
      }

      audio.engineGain = gain;
      audio.engineRpmParam = node.parameters.get("rpm") ?? null;
      audio.engineLoadParam = node.parameters.get("load") ?? null;
    }

    async function unlock() {
      const audio = audioState.current;
      if (!audio || audio.unlocked) {
        return;
      }

      audio.unlocked = true;
      if (audio.context.state === "suspended") {
        await audio.context.resume();
      }
      if (!audio.engineGain && !audio.initializingEngine) {
        audio.initializingEngine = true;
        initEngine()
          .catch((error) => {
            console.warn("Engine synth unavailable:", error);
          })
          .finally(() => {
            if (audioState.current) {
              audioState.current.initializingEngine = false;
            }
          });
      }
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
      context.close();
    };
  }, []);

  useFrame((_, delta) => {
    const audio = audioState.current;
    if (!audio) {
      return;
    }

    const state = useGameStore.getState();
    const vehicle = getVehicleOption(state.selectedVehicleId);
    const speed01 = clamp(Math.abs(playerRuntime.speed) / vehicle.handling.maxForwardSpeed, 0, 1);
    const load = clamp(Math.max(0, playerRuntime.throttle), 0, 1);
    const drift = playerRuntime.driftIntensity;
    const gearWindow = 1 / NUM_GEARS;
    const gearStart = audio.gear * gearWindow;
    const inGear = clamp((speed01 - gearStart) / gearWindow, 0, 1);
    const targetRpm = clamp(inGear * 0.85 + load * 0.2, 0, 1.05);
    const rate = targetRpm > audio.rpm ? 4 * (0.3 + load) : 4;

    audio.rpm = remap(Math.min(1, delta * rate), 0, 1, audio.rpm, targetRpm);
    audio.shiftCooldown = Math.max(0, audio.shiftCooldown - delta);

    if (audio.shiftCooldown === 0) {
      if (audio.rpm > UPSHIFT_RPM && audio.gear < NUM_GEARS - 1 && load > 0.1) {
        audio.gear += 1;
        audio.rpm = 0.45;
        audio.shiftCooldown = SHIFT_COOLDOWN;
      } else if (audio.rpm < DOWNSHIFT_RPM && audio.gear > 0) {
        audio.gear -= 1;
        audio.rpm = 0.78;
        audio.shiftCooldown = SHIFT_COOLDOWN;
      }
    }

    if (audio.unlocked) {
      const now = audio.context.currentTime;
      const shifting = audio.shiftCooldown > SHIFT_COOLDOWN - SHIFT_CUT;
      const targetVolume = remap(speed01 + load * 0.5, 0, 1.5, 0.035, 0.18);

      audio.engineRpmParam?.setValueAtTime(RPM_IDLE + (RPM_MAX - RPM_IDLE) * audio.rpm, now);
      audio.engineLoadParam?.setValueAtTime(shifting ? 0 : load, now);
      audio.engineGain?.gain.setTargetAtTime(targetVolume, now, 0.08);

      const skidActive =
        drift > SKID_DRIFT_THRESHOLD &&
        Math.abs(playerRuntime.speed) > SKID_MIN_SPEED &&
        Math.abs(playerRuntime.angularSpeed) > SKID_MIN_TURN_RATE;
      const skidVolume = skidActive
        ? remap(clamp(drift, SKID_DRIFT_THRESHOLD, 1.7), SKID_DRIFT_THRESHOLD, 1.7, 0.025, 0.2)
        : 0;

      audio.skid.volume = clamp(skidVolume, 0, 0.2);
      audio.skid.playbackRate = remap(speed01, 0, 1, 0.85, 1.45);

      if (skidActive && audio.skid.paused) {
        audio.skid.play().catch(() => {
          audio.unlocked = false;
        });
      } else if (!skidActive && !audio.skid.paused) {
        audio.skid.pause();
        audio.skid.currentTime = 0;
      }

      if (playerRuntime.impactVersion !== audio.lastImpactVersion) {
        audio.lastImpactVersion = playerRuntime.impactVersion;

        if (playerRuntime.impactIntensity > 0.05) {
          const source = audio.context.createBufferSource();
          const gain = audio.context.createGain();
          const hardImpact = playerRuntime.impactIntensity > 0.55;

          source.buffer = audio.impactBuffers[hardImpact ? 1 : 0];
          source.playbackRate.value = 0.9 + playerRuntime.impactIntensity * 0.22;
          gain.gain.value = remap(
            clamp(playerRuntime.impactIntensity, 0.05, 1),
            0.05,
            1,
            0.05,
            0.75,
          );
          source.connect(gain);
          gain.connect(audio.context.destination);
          source.start();
        }
      }

      if (state.itemPickupVersion !== audio.lastItemPickupVersion) {
        audio.lastItemPickupVersion = state.itemPickupVersion;

        const source = audio.context.createBufferSource();
        const gain = audio.context.createGain();

        source.buffer = audio.pickupBuffer;
        gain.gain.value = 0.18;
        source.connect(gain);
        gain.connect(audio.context.destination);
        source.start();
      }
    }
  });

  return null;
}
