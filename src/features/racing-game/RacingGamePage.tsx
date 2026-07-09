"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { GameHud } from "@/components/game/GameHud";
import { IntroScreen } from "@/components/game/IntroScreen";
import { useGameStore } from "./game/useGameStore";

const GameCanvas = dynamic(
  () => import("@/components/game/GameCanvas").then((module) => module.GameCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center bg-[#111418] text-[#f8f3e8]">
        Carregando circuito 3D...
      </div>
    ),
  },
);

export function RacingGamePage() {
  const gamePhase = useGameStore((state) => state.gamePhase);
  const requestRespawn = useGameStore((state) => state.requestRespawn);
  const setGamePhase = useGameStore((state) => state.setGamePhase);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || gamePhase !== "playing") {
        return;
      }

      event.preventDefault();
      requestRespawn();
      setGamePhase("intro");
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [gamePhase, requestRespawn, setGamePhase]);

  if (gamePhase === "intro") {
    return <IntroScreen />;
  }

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#111418]">
      <GameCanvas />
      <GameHud />
    </main>
  );
}
