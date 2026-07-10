"use client";

import { useEffect } from "react";
import { useGameStore } from "../game/useGameStore";
import { useKeyboardControls } from "../game/useKeyboardControls";
import { DriftMarks } from "./DriftMarks";
import { FollowCamera } from "./FollowCamera";
import { Ground } from "./Ground";
import { Lights } from "./Lights";
import { ItemPickups } from "./ItemPickups";
import { Player } from "./Player";
import { RacingTrack } from "./RacingTrack";
import { SmokeTrails } from "./SmokeTrails";
import { VehicleAudio } from "./VehicleAudio";

export function ExperienceScene() {
  const input = useKeyboardControls();
  const requestRespawn = useGameStore((state) => state.requestRespawn);

  useEffect(() => {
    function handleHotkeys(event: KeyboardEvent) {
      if (event.repeat) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === "r") {
        requestRespawn();
      }

    }

    window.addEventListener("keydown", handleHotkeys);

    return () => {
      window.removeEventListener("keydown", handleHotkeys);
    };
  }, [requestRespawn]);

  return (
    <>
      <Lights />
      <Ground />
      <RacingTrack />
      <ItemPickups />
      <DriftMarks />
      <SmokeTrails />
      <Player input={input} />
      <FollowCamera />
      <VehicleAudio />
    </>
  );
}
