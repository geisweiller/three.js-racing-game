"use client";

import { useEffect } from "react";
import { useGameStore } from "../game/useGameStore";
import { useKeyboardControls } from "../game/useKeyboardControls";
import { DriftMarks } from "./DriftMarks";
import { FollowCamera } from "./FollowCamera";
import { Ground } from "./Ground";
import { Lights } from "./Lights";
import { Player } from "./Player";
import { RacingTrack } from "./RacingTrack";
import { VehicleAudio } from "./VehicleAudio";

export function ExperienceScene() {
  const input = useKeyboardControls();
  const requestRespawn = useGameStore((state) => state.requestRespawn);

  useEffect(() => {
    function handleRespawn(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "r") {
        requestRespawn();
      }
    }

    window.addEventListener("keydown", handleRespawn);

    return () => {
      window.removeEventListener("keydown", handleRespawn);
    };
  }, [requestRespawn]);

  return (
    <>
      <Lights />
      <Ground />
      <RacingTrack />
      <DriftMarks />
      <Player input={input} />
      <FollowCamera />
      <VehicleAudio />
    </>
  );
}
