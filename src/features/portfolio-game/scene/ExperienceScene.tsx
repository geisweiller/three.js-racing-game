"use client";

import { useEffect } from "react";
import { pointsOfInterest } from "../data/pointsOfInterest";
import { getNearbyPoint } from "../game/proximity";
import { useGameStore } from "../game/useGameStore";
import { useKeyboardControls } from "../game/useKeyboardControls";
import { FollowCamera } from "./FollowCamera";
import { Ground } from "./Ground";
import { Lights } from "./Lights";
import { Player } from "./Player";
import { PointMarker } from "./PointMarker";
import { RacingTrack } from "./RacingTrack";
import { WorldObjects } from "./WorldObjects";

export function ExperienceScene() {
  const input = useKeyboardControls();
  const playerPosition = useGameStore((state) => state.playerPosition);
  const activePointId = useGameStore((state) => state.activePointId);
  const requestRespawn = useGameStore((state) => state.requestRespawn);
  const setActivePointId = useGameStore((state) => state.setActivePointId);
  const setOpenedSectionId = useGameStore((state) => state.setOpenedSectionId);

  useEffect(() => {
    const nearbyPoint = getNearbyPoint(playerPosition, pointsOfInterest);
    setActivePointId(nearbyPoint?.id ?? null);
  }, [playerPosition, setActivePointId]);

  useEffect(() => {
    function handleInteraction(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "e" && event.key !== "Enter") {
        return;
      }

      if (activePointId) {
        setOpenedSectionId(activePointId);
      }
    }

    window.addEventListener("keydown", handleInteraction);

    return () => {
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [activePointId, setOpenedSectionId]);

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
      <WorldObjects />
      <Player input={input} />
      <FollowCamera />
      {pointsOfInterest.map((point) => (
        <PointMarker key={point.id} point={point} isActive={point.id === activePointId} />
      ))}
    </>
  );
}
